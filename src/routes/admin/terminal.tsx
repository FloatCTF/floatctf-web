import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { XIcon, PlusIcon } from "@primer/octicons-react";
import { useAuthStore } from "@/stores/AuthStore";
import { ADMIN_API_URL } from "@/config";

export const Route = createFileRoute("/admin/terminal")({
    component: RouteComponent,
});

let tabCounter = 0;

type Tab = {
    id: string;
    name: string;
};

type TerminalState = {
    terminal: Terminal;
    fitAddon: FitAddon;
    ws: WebSocket;
};

function buildWsUrl(): string {
    const token = useAuthStore.getState().adminToken;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}${ADMIN_API_URL}/terminal/ws?token=${token}`;
}

function createTerminal(): { terminal: Terminal; fitAddon: FitAddon } {
    const terminal = new Terminal({
        cursorBlink: true,
        cursorStyle: "bar",
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        theme: {
            background: "#1e1e1e",
            foreground: "#d4d4d4",
            cursor: "#d4d4d4",
            selectionBackground: "#264f78",
        },
        allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    return { terminal, fitAddon };
}

function RouteComponent() {
    const [tabs, setTabs] = useState<Tab[]>(() => {
        tabCounter = 1;
        return [{ id: "1", name: "Terminal 1" }];
    });
    const [activeTabId, setActiveTabId] = useState("1");
    const containerRef = useRef<HTMLDivElement>(null);
    const statesRef = useRef<Map<string, TerminalState>>(new Map());
    const activeIdRef = useRef(activeTabId);
    activeIdRef.current = activeTabId;

    // Attach a terminal state to the container
    const attach = useCallback((state: TerminalState) => {
        if (!containerRef.current) return;
        state.terminal.open(containerRef.current);
        state.fitAddon.fit();
    }, []);

    // Initialize terminal + WebSocket for a tab
    const initTab = useCallback(
        (tabId: string) => {
            if (statesRef.current.has(tabId)) return;

            const { terminal, fitAddon } = createTerminal();
            const ws = new WebSocket(buildWsUrl());

            ws.onopen = () => {
                terminal.writeln("\x1b[32m● Connected\x1b[0m\r\n");
            };

            ws.onmessage = (event) => {
                if (event.data instanceof Blob) {
                    event.data.arrayBuffer().then((buf) => {
                        terminal.write(new Uint8Array(buf));
                    });
                } else {
                    terminal.write(event.data);
                }
            };

            ws.onerror = () => {
                terminal.writeln("\r\n\x1b[31m● WebSocket error\x1b[0m");
            };

            ws.onclose = () => {
                terminal.writeln("\r\n\x1b[31m● Connection closed\x1b[0m");
            };

            terminal.onData((data) => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(data);
                }
            });

            terminal.onResize(({ cols, rows }) => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: "resize", cols, rows }));
                }
            });

            const state: TerminalState = { terminal, fitAddon, ws };
            statesRef.current.set(tabId, state);

            // Attach if this tab is currently active
            if (activeIdRef.current === tabId) {
                attach(state);
            }
        },
        [attach],
    );

    // Destroy a tab's terminal + WebSocket
    const destroyTab = useCallback((tabId: string) => {
        const state = statesRef.current.get(tabId);
        if (!state) return;
        state.ws.close();
        state.terminal.dispose();
        statesRef.current.delete(tabId);
    }, []);

    // Initialize first tab on mount, cleanup all on unmount
    useEffect(() => {
        initTab("1");
        return () => {
            for (const [id] of statesRef.current) {
                destroyTab(id);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ResizeObserver to keep the active terminal fitted
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(() => {
            const activeId = activeIdRef.current;
            const state = activeId
                ? statesRef.current.get(activeId)
                : undefined;
            if (state) {
                try {
                    state.fitAddon.fit();
                } catch {
                    // ignore
                }
            }
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const switchTab = useCallback(
        (tabId: string) => {
            setActiveTabId(tabId);
            // Ensure the tab is initialized
            if (!statesRef.current.has(tabId)) {
                initTab(tabId);
            }
            const state = statesRef.current.get(tabId);
            if (state) {
                attach(state);
            }
        },
        [initTab, attach],
    );

    const addTab = useCallback(() => {
        tabCounter += 1;
        const newTab: Tab = {
            id: String(tabCounter),
            name: `Terminal ${tabCounter}`,
        };
        setTabs((prev) => [...prev, newTab]);
        setActiveTabId(newTab.id);
        // init will happen in the next effect/render
        setTimeout(() => {
            initTab(newTab.id);
        }, 0);
    }, [initTab]);

    const closeTab = useCallback(
        (tabId: string) => {
            setTabs((prev) => {
                if (prev.length <= 1) return prev;
                const idx = prev.findIndex((t) => t.id === tabId);
                const next = prev.filter((t) => t.id !== tabId);

                if (tabId === activeIdRef.current) {
                    const newIdx = Math.min(idx, next.length - 1);
                    const newActiveId = next[newIdx].id;
                    setActiveTabId(newActiveId);
                    setTimeout(() => {
                        if (!statesRef.current.has(newActiveId)) {
                            initTab(newActiveId);
                        }
                        const state = statesRef.current.get(newActiveId);
                        if (state) attach(state);
                    }, 0);
                }

                return next;
            });
            setTimeout(() => destroyTab(tabId), 0);
        },
        [destroyTab, initTab, attach],
    );

    return (
        <div className="h-full flex flex-col">
            {/* Tab bar */}
            <div className="flex items-center border-b border-gray-300 bg-gray-50 px-1 shrink-0">
                <div className="flex flex-1 overflow-x-auto">
                    {tabs.map((tab) => (
                        <div
                            key={tab.id}
                            onClick={() => switchTab(tab.id)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") switchTab(tab.id);
                            }}
                            className={`group flex items-center gap-1 px-3 py-1.5 text-sm cursor-pointer border-r border-gray-200 select-none
                ${
                    tab.id === activeTabId
                        ? "bg-white border-t-2 border-t-blue-500 -mt-[1px]"
                        : "text-gray-500 hover:bg-gray-100 border-t-2 border-t-transparent"
                }`}
                        >
                            <span className="truncate max-w-[160px]">
                                {tab.name}
                            </span>
                            {tabs.length > 1 && (
                                <button
                                    type="button"
                                    className="ml-1 p-0.5 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        closeTab(tab.id);
                                    }}
                                >
                                    <XIcon size={12} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    className="p-1.5 mx-1 rounded hover:bg-gray-200 text-gray-500"
                    onClick={addTab}
                    title="New terminal"
                >
                    <PlusIcon size={14} />
                </button>
            </div>

            {/* Terminal container */}
            <div
                ref={containerRef}
                className="flex-1 bg-[#1e1e1e] overflow-hidden"
            />
        </div>
    );
}
