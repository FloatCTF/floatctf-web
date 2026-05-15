import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTitle } from "ahooks";
import { useMemo } from "react";

import { serviceApi } from "@/api";
import { Spinner } from "@primer/react";
import type { CalendarEvent } from "@/entity/event_calendar";
import { ServiceRouteGuard } from "@/routes/service/route";

export const Route = createFileRoute("/service/event_calendar")({
    component: RouteComponent,
    loader: ServiceRouteGuard,
});

// ── FullCalendar event input type ────────────────────────────────────────────
interface FullCalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    url?: string;
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    extendedProps: CalendarEvent;
}

const INTERNAL_COLOR = "#1a7f37";
const CTFTIME_COLOR = "#0969da";
const ENDED_COLOR = "#656d76";

function toFullCalendarEvents(items: CalendarEvent[]): FullCalendarEvent[] {
    return items.map((ev) => {
        const isEnded = ev.status === "ended";
        const baseColor =
            ev.source === "internal" ? INTERNAL_COLOR : CTFTIME_COLOR;
        const bg = isEnded ? ENDED_COLOR : baseColor;

        let url: string | undefined;
        if (ev.source === "internal") {
            url = `/service/events/jeopardy/${ev.id}`;
        } else if (ev.url) {
            url = ev.url;
        }

        return {
            id: ev.id,
            title: ev.title,
            start: ev.start_time,
            end: ev.end_time || ev.start_time,
            url,
            backgroundColor: bg,
            borderColor: bg,
            textColor: "#ffffff",
            extendedProps: ev,
        };
    });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(hours: number): string {
    if (hours <= 0) return "";
    const d = Math.floor(hours / 24);
    const h = hours % 24;
    if (d > 0 && h > 0) return `${d}d ${h}h`;
    if (d > 0) return `${d}d`;
    return `${h}h`;
}

// ── Component ────────────────────────────────────────────────────────────────

function RouteComponent() {
    useTitle("Event Calendar | FloatCTF");

    const { data, isLoading, isError } = useQuery({
        queryKey: ["event_calendar"],
        queryFn: () => serviceApi.eventCalendar.fetch(),
        refetchInterval: 5 * 60 * 1000,
    });

    const events = useMemo(() => {
        if (!data?.data) return [];
        return toFullCalendarEvents(data.data);
    }, [data]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="large" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center h-64 text-red-600">
                Failed to load event calendar.
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col gap-3">
            <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                    <span
                        className="inline-block w-3 h-3 rounded"
                        style={{ backgroundColor: INTERNAL_COLOR }}
                    />
                    Platform Events
                </span>
                <span className="flex items-center gap-1">
                    <span
                        className="inline-block w-3 h-3 rounded"
                        style={{ backgroundColor: CTFTIME_COLOR }}
                    />
                    CTFtime
                </span>
                <span className="flex items-center gap-1">
                    <span
                        className="inline-block w-3 h-3 rounded"
                        style={{ backgroundColor: ENDED_COLOR }}
                    />
                    Ended
                </span>
            </div>

            <div className="flex-1">
                <FullCalendar
                    plugins={[dayGridPlugin, listPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,dayGridWeek,dayGridDay,listMonth",
                    }}
                    buttonText={{
                        dayGridMonth: "Month",
                        dayGridWeek: "Week",
                        dayGridDay: "Day",
                        listMonth: "List",
                    }}
                    events={events}
                    eventTimeFormat={{
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                    }}
                    eventContent={renderEventContent}
                    height="100%"
                    stickyHeaderDates
                    nowIndicator
                    navLinks
                    dayMaxEvents={3}
                />
            </div>
        </div>
    );
}

// ── Custom event rendering ──────────────────────────────────────────────────

function renderEventContent(eventInfo: {
    event: {
        title: string;
        extendedProps: CalendarEvent;
    };
    timeText: string;
}) {
    const { extendedProps: ev, title } = eventInfo.event;
    const dur = formatDuration(ev.duration_hours);

    return (
        <div className="text-xs leading-tight overflow-hidden">
            <div className="font-semibold truncate" title={title}>
                {title}
            </div>
            <div className="flex gap-1 text-[0.7rem] opacity-80">
                {ev.format && <span>{ev.format}</span>}
                {dur && <span>({dur})</span>}
                {ev.location && <span>📍{ev.location}</span>}
                {ev.onsite && <span>🏢</span>}
            </div>
            {ev.organizer && (
                <div className="text-[0.65rem] opacity-60 truncate">
                    {ev.organizer}
                </div>
            )}
        </div>
    );
}
