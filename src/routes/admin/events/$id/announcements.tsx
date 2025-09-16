import { eventAnnouncementAdminApi } from "@/api/admin";
import { GenericTable } from "@/components/admin/Table";
import { useTypedState } from "@/lib";
import { TextInput, Textarea } from "@primer/react";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export const Route = createFileRoute("/admin/events/$id/announcements")({
  component: RouteComponent,
});

export type EventAnnouncement = {
  id: string;
  event_id: string;
  title: string;
  content: string;
  created_at: string;
};

function RouteComponent() {
  const { id } = Route.useParams();
  const subject = `Announcement-${id}`;
  const columns = [
    { accessorKey: "id", header: "ID", field: "id", rowHeader: true },
    { accessorKey: "title", header: "Title", field: "title" },
    { accessorKey: "content", header: "Content", field: "content" },
    {
      accessorKey: "created_at",
      header: "Created At",
      field: "created_at",
      renderCell: (row: EventAnnouncement) => {
        return (
          <span>{dayjs(row.created_at).format("YYYY-MM-DD HH:mm:ss")}</span>
        );
      },
    },
  ];
  const mutationEventAnnouncement = useTypedState<Partial<EventAnnouncement>>({
    title: "",
    content: "",
  });
  const mutationColumns = [
    {
      header: "title",
      field: "title",
      render: (
        <TextInput
          value={mutationEventAnnouncement.state.title}
          onChange={(e) => {
            mutationEventAnnouncement.update("title", e.target.value);
          }}
        />
      ),
    },
    {
      header: "content",
      field: "content",
      render: (
        <Textarea
          value={mutationEventAnnouncement.state.content}
          onChange={(e) => {
            mutationEventAnnouncement.update("content", e.target.value);
          }}
        />
      ),
    },
  ];

  return (
    <GenericTable
      className="m-2"
      subject={subject}
      queryFn={eventAnnouncementAdminApi.fetch(id)}
      createFn={eventAnnouncementAdminApi.create(id)}
      patchFn={eventAnnouncementAdminApi.patch(id)}
      removeFn={eventAnnouncementAdminApi.remove(id)}
      mutationData={mutationEventAnnouncement}
      columns={columns}
      mutationColumns={mutationColumns}
      hideTitle={true}
      disablePagination={true}
    />
  );
}
