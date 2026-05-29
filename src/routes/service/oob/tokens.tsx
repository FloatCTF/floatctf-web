import { serviceApi } from "@/api";
import type { OobTokens } from "@/entity";
import { DatetimeToShow } from "@/util";
import {
    CheckIcon,
    CopyIcon,
    KeyIcon,
    PlusIcon,
    TrashIcon,
    XIcon,
} from "@primer/octicons-react";
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    Heading,
    IconButton,
    Label,
    Text,
    TextInput,
} from "@primer/react";
import { Dialog } from "@primer/react/experimental";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { GenericTable, useMsgBanner } from "@/components";
import { API_URL } from "@/config";

const tokenSubject = "OOB Tokens";

export { tokenSubject };

export function getOobUrl(token: string) {
    const origin = window.location.origin;
    return `${origin}${API_URL}/service/oob?token=${token}`;
}

export const Route = createFileRoute("/service/oob/tokens")({
    component: RouteComponent,
});

function RouteComponent() {
    const banner = useMsgBanner();
    const queryClient = useQueryClient();
    const [createOpen, setCreateOpen] = useState(false);

    const { data: tokensResp } = useQuery({
        queryKey: [tokenSubject, "selector"],
        queryFn: () => serviceApi.oob.fetchTokens({ limit: 100, page: 1 }),
    });
    const tokens = tokensResp?.data ?? [];

    const deleteTokenMutation = useMutation({
        mutationFn: serviceApi.oob.deleteToken,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [tokenSubject] });
            queryClient.invalidateQueries({ queryKey: ["OOB Records"] });
            queryClient.invalidateQueries({
                queryKey: [tokenSubject, "selector"],
            });
            banner.showBanner("success", "OOB token deleted");
        },
        onError: (error) => banner.showErrorBanner(error),
    });

    const patchTokenMutation = useMutation({
        mutationFn: serviceApi.oob.patchToken,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [tokenSubject] });
            queryClient.invalidateQueries({
                queryKey: [tokenSubject, "selector"],
            });
            banner.showBanner("success", "OOB token updated");
        },
        onError: (error) => banner.showErrorBanner(error),
    });

    const copyText = async (text: string, message = "Copied") => {
        await navigator.clipboard.writeText(text);
        banner.showBanner("success", message);
    };

    const tokenColumns = [
        {
            accessorKey: "name",
            field: "name",
            header: "Name",
            rowHeader: true,
            renderCell: (row: OobTokens) => row.name || "-",
        },
        {
            accessorKey: "token",
            field: "token",
            header: "Token",
            renderCell: (row: OobTokens) => (
                <code className="text-xs">{row.token}</code>
            ),
        },
        {
            accessorKey: "enabled",
            field: "enabled",
            header: "Enabled",
            renderCell: (row: OobTokens) =>
                row.enabled ? (
                    <Label variant="success">Enabled</Label>
                ) : (
                    <Label variant="danger">Disabled</Label>
                ),
        },
        {
            accessorKey: "last_used_at",
            field: "last_used_at",
            header: "Last Used",
            renderCell: (row: OobTokens) =>
                row.last_used_at ? DatetimeToShow(row.last_used_at) : "-",
        },
        {
            accessorKey: "expires_at",
            field: "expires_at",
            header: "Expires At",
            renderCell: (row: OobTokens) =>
                row.expires_at ? DatetimeToShow(row.expires_at) : "Never",
        },
        {
            accessorKey: "actions",
            field: "actions",
            header: "Actions",
            renderCell: (row: OobTokens) => (
                <div className="flex gap-1">
                    <IconButton
                        aria-label="copy oob url"
                        icon={CopyIcon}
                        size="small"
                        onClick={() =>
                            copyText(getOobUrl(row.token), "OOB URL copied")
                        }
                    />
                    <IconButton
                        aria-label={
                            row.enabled ? "disable token" : "enable token"
                        }
                        icon={row.enabled ? XIcon : CheckIcon}
                        size="small"
                        onClick={() =>
                            patchTokenMutation.mutate({
                                id: row.id,
                                enabled: !row.enabled,
                            })
                        }
                    />
                    <IconButton
                        aria-label="delete token"
                        icon={TrashIcon}
                        size="small"
                        variant="danger"
                        onClick={() => deleteTokenMutation.mutate(row.id)}
                    />
                </div>
            ),
        },
    ];

    const customActions = (
        <div className="flex gap-1">
            <Button
                leadingVisual={PlusIcon}
                onClick={() => setCreateOpen(true)}
            >
                New Token
            </Button>
        </div>
    );

    return (
        <>
            <GenericTable
                subject={tokenSubject}
                columns={tokenColumns}
                queryFn={serviceApi.oob.fetchTokens}
                externalBanner={banner}
                customActions={customActions}
                disableAdd={true}
                disableSelect={true}
                enableInternalActions={false}
                filterKeys={["id", "name", "token"]}
                subtitle="Create an OOB token, then use it in payloads such as pwd | curl --data-binary @- URL."
            />

            {createOpen ? (
                <CreateTokenDialog
                    onClose={() => setCreateOpen(false)}
                    onSuccess={() => {
                        setCreateOpen(false);
                        queryClient.invalidateQueries({
                            queryKey: [tokenSubject],
                        });
                        queryClient.invalidateQueries({
                            queryKey: [tokenSubject, "selector"],
                        });
                        banner.showBanner("success", "OOB token created");
                    }}
                    onError={(error) => banner.showErrorBanner(error)}
                />
            ) : null}
        </>
    );
}

function CreateTokenDialog({
    onClose,
    onSuccess,
    onError,
}: {
    onClose: () => void;
    onSuccess: () => void;
    onError: (error: Error) => void;
}) {
    const [name, setName] = useState("");
    const [useExpiresAt, setUseExpiresAt] = useState(false);
    const [expiresAt, setExpiresAt] = useState("");

    const createMutation = useMutation({
        mutationFn: serviceApi.oob.createToken,
        onSuccess,
        onError,
    });

    return (
        <Dialog title="New OOB Token" onClose={onClose}>
            <div className="flex flex-col gap-3">
                <FormControl>
                    <FormControl.Label>Name</FormControl.Label>
                    <TextInput
                        block
                        value={name}
                        placeholder="optional, e.g. SSTI test"
                        onChange={(e) => setName(e.target.value)}
                    />
                </FormControl>
                <FormControl>
                    <Checkbox
                        checked={useExpiresAt}
                        onChange={(e) => setUseExpiresAt(e.target.checked)}
                    />
                    <FormControl.Label>Set expiration time</FormControl.Label>
                </FormControl>
                {useExpiresAt ? (
                    <FormControl>
                        <FormControl.Label>Expires At</FormControl.Label>
                        <TextInput
                            block
                            type="datetime-local"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                        />
                    </FormControl>
                ) : null}
                <div className="flex justify-end gap-2">
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                        variant="primary"
                        disabled={createMutation.isPending}
                        onClick={() =>
                            createMutation.mutate({
                                name: name || undefined,
                                expires_at:
                                    useExpiresAt && expiresAt
                                        ? new Date(expiresAt).toISOString()
                                        : undefined,
                            })
                        }
                    >
                        Create
                    </Button>
                </div>
            </div>
        </Dialog>
    );
}
