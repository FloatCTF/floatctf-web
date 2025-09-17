import { eventServiceApi, instanceServiceApi } from "@/api/service";
import type { BannerVariant } from "@/components/admin/Table";
import { useTypedState } from "@/lib";
import type { Instance } from "@/routes/admin/instances";
import { Button } from "@primer/react";
import { DataTable, Table } from "@primer/react/experimental";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { AxiosError } from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export const Route = createFileRoute("/service/events/$id/instances")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const mutationBanner = useTypedState({
    isShown: false,
    description: "Something here",
    variant: "info" as BannerVariant,
  });
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["event_instances", id],
    queryFn: () => eventServiceApi.getInstances(id),
  });

  const mutationInstance = useMutation({
    mutationFn: instanceServiceApi.destroy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event_instances"] });
      mutationBanner.update("isShown", true);
      mutationBanner.update("description", "Destroyed successfully");
      mutationBanner.update("variant", "success");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      // 这里可以拿到后端返回的 message
      const msg =
        error.response?.data?.message || error.message || "Unknown error";

      mutationBanner.update("isShown", true);
      mutationBanner.update("description", msg);
      mutationBanner.update("variant", "critical");
    },
  });

  const columns = [
    {
      accessorKey: "challenge_id",
      header: "Challenge",
      field: "challenge_id",
      rowHeader: true,
    },
    {
      accessorKey: "status",
      header: "Status",
      field: "status",
    },
    {
      accessorKey: "ref",
      header: "Ref",
      field: "ref",
    },
    {
      accessorKey: "user_id",
      header: "User",
      field: "user_id",
    },
    {
      accessorKey: "destroy_at",
      header: "Destroy At",
      field: "destroy_at",
      renderCell: (row: Instance) => {
        return (
          <span>
            {dayjs.utc(row.destroy_at).local().format("YYYY-MM-DD HH:mm:ss")}
          </span>
        );
      },
    },
    {
      accessorKey: "action",
      header: "Action",
      field: "action",
      renderCell: (row: Instance) => {
        return (
          <Button
            variant="invisible"
            onClick={() => {
              mutationInstance.mutate(row.id);
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
