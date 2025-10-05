import { Link, createFileRoute } from "@tanstack/react-router";
import { useTitle } from "ahooks";

import { serviceApi } from "@/api";
import { GenericTable } from "@/components";
import type { ChallengeWriteupResult } from "@/routes/service/challenges/$id/writeup";
import { DatetimeToShow } from "@/util";

export const Route = createFileRoute("/service/writeups/")({
  component: RouteComponent,
});

function RouteComponent() {
  useTitle("Writeups | FloatCTF");
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
        <span>{DatetimeToShow(row.writeup.created_at)}</span>
      ),
    },
  ];
  return (
    <GenericTable
      subject={subject}
      columns={columns}
      queryFn={serviceApi.challenges.getAllWriteups}
      enableInternalActions={false}
      disableAdd={true}
      disablePagination={true}
      getRowId={(row: ChallengeWriteupResult) => row.writeup.id}
    />
  );
}
