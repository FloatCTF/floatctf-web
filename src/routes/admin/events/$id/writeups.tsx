import { eventWriteupAdminApi } from "@/api/admin";
import { GenericTable } from "@/components/admin/Table";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export const Route = createFileRoute("/admin/events/$id/writeups")({
  component: RouteComponent,
});

export type EventWriteup = {
  id: string;
  event_id: string;
  user_id: string;
  team_id?: string;
  file_url: string;
  created_at: string;
};

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
        return (
          <span>{dayjs(row.created_at).format("YYYY-MM-DD HH:mm:ss")}</span>
        );
      },
    },
  ];

  return (
    <GenericTable
      subject={subject}
      columns={columns}
      queryFn={eventWriteupAdminApi.fetch(id)}
      hideTitle={true}
      disableAdd={true}
      disablePagination={true}
      enableInternalActions={false}
    />
  );
}
