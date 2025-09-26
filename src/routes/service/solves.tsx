import { solveServiceApi } from "@/api/service";
import SiteTitle from "@/components/SiteTitile";
import { GenericTable } from "@/components/admin/Table";
import { Link, createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useEffect } from "react";
dayjs.extend(utc);
export const Route = createFileRoute("/service/solves")({
  component: RouteComponent,
});
export type ChallengeSolve = {
  id: string;
  event_id: string | null;
  challenge_id: string;
  user_id: string;
  created_at: string;
};

function RouteComponent() {
  useEffect(() => {
    SiteTitle({ title: "Solves" });
  });
  const columns = [
    { accessorKey: "id", header: "ID", field: "id", rowHeader: true },
    { accessorKey: "event_id", header: "Event ID", field: "event_id" },
    {
      accessorKey: "challenge_id",
      header: "Challenge ID",
      field: "challenge_id",
      renderCell: (row: ChallengeSolve) => (
        <Link to={"/service/challenges/$id"} params={{ id: row.challenge_id }}>
          {row.challenge_id}
        </Link>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      field: "created_at",
      renderCell: (row: ChallengeSolve) => (
        <span>
          {dayjs.utc(row.created_at).local().format("YYYY-MM-DD HH:mm:ss")}
        </span>
      ),
    },
  ];
  return (
    <GenericTable
      subject="Challenge Solves"
      columns={columns}
      queryFn={solveServiceApi.fetch}
      enableInternalActions={false}
      disableAdd={true}
    />
  );
}
