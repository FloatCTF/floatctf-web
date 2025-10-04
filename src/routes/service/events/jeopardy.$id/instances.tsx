import type { UniResponse } from "@/api/axios";
import { eventServiceApi, instanceServiceApi } from "@/api/service";
import { useMsgBanner } from "@/components/MsgBanner";
import type { Instance } from "@/routes/admin/instances";
import { Button, Spinner } from "@primer/react";
import { DataTable, Table } from "@primer/react/experimental";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { AxiosError } from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
export type EventInstance = {
  id: string;
  instance: Instance;
  challenge_name: string;
  user_nickname: string;
};
export const Route = createFileRoute("/service/events/jeopardy/$id/instances")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const banner = useMsgBanner();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery<
    UniResponse<EventInstance[]>,
    AxiosError<{ message: string }>
  >({
    queryKey: ["event_instances", id],
    queryFn: () => eventServiceApi.getInstances(id),
  });

  const mutationInstance = useMutation({
    mutationFn: instanceServiceApi.destroy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event_instances"] });
      banner.showBanner("success", "Instance destroyed successfully");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      // 这里可以拿到后端返回的 message
      const msg =
        error.response?.data?.message || error.message || "Unknown error";
      banner.showBanner("critical", msg);
    },
  });

  const columns = [
    {
      accessorKey: "challenge_name",
      header: "Challenge",
      field: "challenge_name",
      rowHeader: true,
    },
    {
      accessorKey: "instance.status",
      header: "Status",
      field: "instance.status",
    },
    {
      accessorKey: "instance.ref",
      header: "Ref",
      field: "instance.ref",
    },
    {
      accessorKey: "user_nickname",
      header: "User",
      field: "user_nickname",
    },
    {
      accessorKey: "instance.destroy_at",
      header: "Destroy At",
      field: "destroy_at",
      renderCell: (row: EventInstance) => {
        return (
          <span>
            {dayjs
              .utc(row.instance.destroy_at)
              .local()
              .format("YYYY-MM-DD HH:mm:ss")}
          </span>
        );
      },
    },
    {
      accessorKey: "action",
      header: "Action",
      field: "action",
      renderCell: (row: EventInstance) => {
        return (
          <Button
            variant="invisible"
            onClick={() => {
              mutationInstance.mutate(row.instance.id);
            }}
            style={{ color: "#DB0000" }}
          >
            Destroy
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data?.data ?? [],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });
  if (isLoading) {
    return <Spinner size="large" />;
  }
  if (isError) {
    return <div>{error.response?.data.message}</div>;
  }

  return (
    <Table.Container className="m-2">
      <DataTable
        aria-labelledby="repositories-default"
        // @ts-ignore
        columns={columns}
        data={table.getRowModel().rows.map((row) => row.original)}
      />
    </Table.Container>
  );
}
