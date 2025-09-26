import { challengeServiceApi } from "@/api/service";
import SiteTitle from "@/components/SiteTitile";
import { GenericTable } from "@/components/admin/Table";
import { Link, createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useEffect } from "react";
import type { ChallengeWriteupResult } from "../challenges/$id/writeup";
dayjs.extend(utc);
export const Route = createFileRoute("/service/writeups/")({
  component: RouteComponent,
});

function RouteComponent() {
  useEffect(() => {
    SiteTitle({ title: "Writeups" });
  });
  const subject = "Writeups";
  const columns = [
    {
      accessorKey: "id",
      header: "ID",
      field: "writeup.id",
      rowHeader: true,
      renderCell: (row: ChallengeWriteupResult) => (
        <Link to="/service/writeups/$id" params={{ id: row.writeup.id }}>
          {row.writeup.id}
        </Link>
      ),
    },
    {
      accessorKey: "challenge",
      header: "Challenge",
      field: "challenge.name",
      rowHeader: true,
      renderCell: (row: ChallengeWriteupResult) => (
        <Link to="/service/challenges/$id" params={{ id: row.challenge.id }}>
          {row.challenge.name}
        </Link>
      ),
    },
    {
      accessorKey: "nickname",
      header: "Author",
      field: "nickname",
      rowHeader: true,
    },
    {
      accessorKey: "email",
      header: "Email",
      field: "email",
      rowHeader: true,
      renderCell: (row: ChallengeWriteupResult) => (
        <a href={`mailto:${row.email}`}>{row.email}</a>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      field: "writeup.created_at",
      rowHeader: true,
      renderCell: (row: ChallengeWriteupResult) => (
        <span>
          {dayjs.utc(row.writeup.created_at).format("YYYY-MM-DD HH:mm:ss")}
        </span>
      ),
    },
  ];
  return (
    <GenericTable
      subject={subject}
      columns={columns}
      queryFn={challengeServiceApi.getAllWriteups}
      enableInternalActions={false}
      disableAdd={true}
      disablePagination={true}
    />
  );
}
