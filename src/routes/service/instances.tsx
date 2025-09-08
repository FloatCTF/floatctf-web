import { instanceServiceApi } from "@/api/service";
import { type BannerVariant, GenericTable } from "@/components/admin/Table";
import { useTypedState } from "@/lib";
import { Button } from "@primer/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import type { Instance } from "../admin/instances";
dayjs.extend(utc);
export const Route = createFileRoute("/service/instances")({
  component: RouteComponent,
});

function RouteComponent() {
  const subject = "Instances";
  const mutationBanner = useTypedState({
    isShown: false,
    description: "Something here",
    variant: "info" as BannerVariant,
  });
  const queryClient = useQueryClient();

  const mutationInstance = useMutation({
    mutationFn: instanceServiceApi.destroy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [subject] });
      mutationBanner.update("isShown", true);
      mutationBanner.update("description", "Destroyed successfully");
      mutationBanner.update("variant", "success");
    },
    onError: (error) => {
      mutationBanner.update("isShown", true);
      mutationBanner.update("description", error.message);
      mutationBanner.update("variant", "critical");
    },
  });
  const columns = [
    {
      accessorKey: "challenge_id",
      header: "Challenge",
      field: "challenge_id",
      rowHeader: true,
      renderCell: (row: Instance) => {
        return (
          <Link
            to={"/service/challenges/$id"}
            params={{ id: row.challenge_id }}
          >
            {row.challenge_id}
          </Link>
        );
      },
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
  return (
    <GenericTable
      subject={subject}
      columns={columns}
      queryFn={instanceServiceApi.fetch}
      enableInternalActions={false}
      externalBanner={mutationBanner}
      disableAdd={true}
    />
  );
}
