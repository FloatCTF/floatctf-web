import { instanceAdminApi } from "@/api/admin";
import { GenericTable } from "@/components/admin/Table";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { AdminRouteGuard } from "./route";
dayjs.extend(utc);
export const Route = createFileRoute("/admin/instances")({
  component: RouteComponent,
  loader: AdminRouteGuard,
});

export type InstanceStatus = "pending" | "running" | "completed" | "failed";
export type Instance = {
  id: string;
  status: InstanceStatus;
  ref: string;
  flag?: string;
  content?: string;
  challenge_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  destroy_at: string;
};
function RouteComponent() {
  const columns = [
    { accessorKey: "id", header: "ID", field: "id", rowHeader: true },
    { accessorKey: "status", header: "Status", field: "status", sortBy: true },
    { accessorKey: "ref", header: "Ref", field: "ref", sortBy: true },
    { accessorKey: "flag", header: "Flag", field: "flag" },
    {
      accessorKey: "challenge_id",
      header: "Challenge ID",
      field: "challenge_id",
    },
    { accessorKey: "user_id", header: "User ID", field: "user_id" },
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
  ];
  return (
    <GenericTable
      subject="Instances"
      columns={columns}
      queryFn={instanceAdminApi.fetch}
      disableAdd={true}
      enableInternalActions={false}
    />
  );
}
