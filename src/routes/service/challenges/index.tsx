import { challengeServiceApi } from "@/api/service";

import { GenericTable } from "@/components/admin/Table";
import type { Challenge } from "@/routes/admin/challenges";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useTitle } from "ahooks";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useEffect } from "react";
import { ServiceRouteGuard } from "../route";
dayjs.extend(utc);
export const Route = createFileRoute("/service/challenges/")({
  component: RouteComponent,
  loader: ServiceRouteGuard,
});

function RouteComponent() {
  useTitle("Challenges | FloatCTF");
  const columns = [
    {
      accessorKey: "id",
      header: "ID",
      field: "id",
      rowHeader: true,
      renderCell: (row: Challenge) => {
        return (
          <Link to={"/service/challenges/$id"} params={{ id: row.id }}>
            {row.id}
          </Link>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      field: "name",
      rowHeader: true,
      renderCell: (row: Challenge) => {
        return (
          <Link to={"/service/challenges/$id"} params={{ id: row.id }}>
            {row.name}
          </Link>
        );
      },
    },

    {
      accessorKey: "category",
      header: "Category",
      field: "category",
    },
    {
      accessorKey: "updated_at",
      header: "Updated At",
      field: "updated_at",
      renderCell: (row: Challenge) => {
        return (
          <span>
            {dayjs.utc(row.updated_at).local().format("YYYY-MM-DD HH:mm:ss")}
          </span>
        );
      },
    },
  ];
  return (
    <GenericTable
      subject="Challenges"
      subtitle="If you want submit yours, pls visit https://github.com/FloatCTF/challenge-template"
      columns={columns}
      queryFn={challengeServiceApi.fetch}
      enableInternalActions={false}
      disableAdd={true}
    />
  );
}
