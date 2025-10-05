import { Link, createFileRoute } from "@tanstack/react-router";
import { useTitle } from "ahooks";

import { serviceApi } from "@/api";
import { GenericTable } from "@/components";
import type { ChallengeSolves } from "@/entity";
import { DatetimeToShow } from "@/util";

export const Route = createFileRoute("/service/solves")({
  component: RouteComponent,
});

function RouteComponent() {
  useTitle("Solves | FloatCTF");
  const columns = [
    { accessorKey: "id", header: "ID", field: "id", rowHeader: true },
    {
      accessorKey: "challenge_id",
      header: "Challenge ID",
      field: "challenge_id",
      renderCell: (row: ChallengeSolves) => (
        <Link to={"/service/challenges/$id"} params={{ id: row.challenge_id }}>
          {row.challenge_id}
        </Link>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      field: "created_at",
      renderCell: (row: ChallengeSolves) => (
        <span>{DatetimeToShow(row.created_at)}</span>
      ),
    },
  ];
  return (
    <GenericTable
      subject="Challenge Solves"
      columns={columns}
      queryFn={serviceApi.solves.fetch}
      enableInternalActions={false}
      disableAdd={true}
    />
  );
}
