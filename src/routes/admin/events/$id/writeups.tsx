import { Button } from "@primer/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { adminApi } from "@/api";
import { GenericTable } from "@/components";
import type { EventWriteup } from "@/entity";
import { DatetimeToShow } from "@/util";
import { AdminRouteGuard } from "../../route";

export const Route = createFileRoute("/admin/events/$id/writeups")({
    component: RouteComponent,
    loader: AdminRouteGuard,
});

function RouteComponent() {
    const { id } = Route.useParams();
    const subject = `writeups-${id}`;
    const columns = [
        {
            accessorKey: "user_id",
            header: "User ID",
            field: "user_id",
            rowHeader: true,
        },
        {
            accessorKey: "team_id",
            header: "Team ID",
            field: "team_id",
        },
        {
            accessorKey: "file_url",
            header: "File URL",
            field: "file_url",
            renderCell: (row: EventWriteup) => {
                return (
                    <a
                        href={`/${row.file_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                    >
                        {row.file_url}
                    </a>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: "Created At",
            field: "created_at",
            renderCell: (row: EventWriteup) => {
                return <span>{DatetimeToShow(row.created_at)}</span>;
            },
        },
    ];

    const exportMutation = useMutation({
        mutationFn: async () => {
            const res = await adminApi.events.exportWriteUps(id);
            return res.data; // 这里是返回的 URL
        },
        onSuccess: (url) => {
            if (url) {
                const a = document.createElement("a");
                a.href = `/${url}`;
                a.download = `${id}.zip`; // 建议加这个，浏览器会强制下载
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        },
        onError: (error) => {
            console.error("Export failed:", error);
        },
    });
    const custom_actions = (
        <div className="flex gap-1 mt-1">
            <Button variant="primary" onClick={() => exportMutation.mutate()}>
                Export
            </Button>
        </div>
    );
    return (
        <GenericTable
            subject={subject}
            columns={columns}
            queryFn={adminApi.event_writeups.fetch(id)}
            hideTitle={true}
            disableAdd={true}
            disablePagination={true}
            enableInternalActions={false}
            customActions={custom_actions}
            getRowId={(row: EventWriteup) => `${row.event_id}-${row.user_id}`}
        />
    );
}
