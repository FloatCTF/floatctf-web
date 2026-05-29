import { serviceApi } from "@/api";
import type { OobRecords } from "@/entity";
import { DatetimeToShow } from "@/util";
import { CopyIcon, EyeIcon, TrashIcon } from "@primer/octicons-react";
import { Button, IconButton } from "@primer/react";
import { Dialog } from "@primer/react/experimental";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { GenericTable, useMsgBanner } from "@/components";

const recordSubject = "OOB Records";

export const Route = createFileRoute("/service/oob/records")({
    component: RouteComponent,
});

function RouteComponent() {
    const banner = useMsgBanner();
    const queryClient = useQueryClient();
    const [detailRecord, setDetailRecord] = useState<OobRecords>();

    const deleteRecordMutation = useMutation({
        mutationFn: serviceApi.oob.deleteRecord,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [recordSubject] });
            banner.showBanner("success", "OOB record deleted");
        },
        onError: (error) => banner.showErrorBanner(error),
    });

    const copyText = async (text: string, message = "Copied") => {
        await navigator.clipboard.writeText(text);
        banner.showBanner("success", message);
    };

    const recordColumns = [
        {
            accessorKey: "created_at",
            field: "created_at",
            header: "Time",
            rowHeader: true,
            renderCell: (row: OobRecords) => DatetimeToShow(row.created_at),
        },
        { accessorKey: "method", field: "method", header: "Method" },
        { accessorKey: "path", field: "path", header: "Path" },
        {
            accessorKey: "ip_address",
            field: "ip_address",
            header: "IP",
            renderCell: (row: OobRecords) => row.ip_address || "-",
        },
        {
            accessorKey: "body",
            field: "body",
            header: "Body",
            renderCell: (row: OobRecords) => (
                <code className="text-xs whitespace-pre-wrap break-all">
                    {row.body.length > 120
                        ? `${row.body.slice(0, 120)}...`
                        : row.body || "-"}
                </code>
            ),
        },
        {
            accessorKey: "actions",
            field: "actions",
            header: "Actions",
            renderCell: (row: OobRecords) => (
                <div className="flex gap-1">
                    <IconButton
                        aria-label="view record"
                        icon={EyeIcon}
                        size="small"
                        onClick={() => setDetailRecord(row)}
                    />
                    <IconButton
                        aria-label="delete record"
                        icon={TrashIcon}
                        size="small"
                        variant="danger"
                        onClick={() => deleteRecordMutation.mutate(row.id)}
                    />
                </div>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            <GenericTable
                subject={recordSubject}
                columns={recordColumns}
                queryFn={serviceApi.oob.fetchRecords}
                externalBanner={banner}
                disableAdd={true}
                disableSelect={true}
                enableInternalActions={false}
                filterKeys={["id", "method", "ip", "body"]}
            />

            {detailRecord ? (
                <RecordDetailDialog
                    record={detailRecord}
                    onClose={() => setDetailRecord(undefined)}
                    onCopy={copyText}
                />
            ) : null}
        </div>
    );
}

function RecordDetailDialog({
    record,
    onClose,
    onCopy,
}: {
    record: OobRecords;
    onClose: () => void;
    onCopy: (text: string, message?: string) => void;
}) {
    const fullText = `Time: ${record.created_at}\nMethod: ${record.method}\nPath: ${record.path}\nQuery: ${record.query || ""}\nIP: ${record.ip_address || ""}\nUser-Agent: ${record.user_agent || ""}\n\nHeaders:\n${record.headers}\n\nBody:\n${record.body}`;

    return (
        <Dialog title="OOB Record Detail" onClose={onClose}>
            <div className="flex flex-col gap-3">
                <div className="flex justify-end">
                    <Button
                        leadingVisual={CopyIcon}
                        onClick={() => onCopy(fullText)}
                    >
                        Copy
                    </Button>
                </div>
                <pre className="text-xs overflow-auto whitespace-pre-wrap break-all border rounded-2 p-3 max-h-[60vh]">
                    {fullText}
                </pre>
            </div>
        </Dialog>
    );
}
