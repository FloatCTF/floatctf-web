import { instanceServiceApi } from "@/api/service";
import { useMsgBanner } from "@/components/MsgBanner";
import SiteTitle from "@/components/SiteTitle";
import { GenericTable } from "@/components/admin/Table";
import { Button } from "@primer/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useReactive } from "ahooks";
import type { AxiosError } from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useEffect } from "react";
import type { Instance } from "../admin/instances";
dayjs.extend(utc);
export const Route = createFileRoute("/service/instances")({
  component: RouteComponent,
});

function RouteComponent() {
  useEffect(() => {
    SiteTitle({ title: "Instances" });
  });
  const subject = "Instances";
  const banner = useMsgBanner();
  const queryClient = useQueryClient();

  const mutationInstance = useMutation({
    mutationFn: instanceServiceApi.destroy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [subject] });
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
      externalBanner={banner}
      disableAdd={true}
    />
  );
}
