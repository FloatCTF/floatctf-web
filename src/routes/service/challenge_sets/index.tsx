import { challengeServiceApi } from "@/api/service";
import { GenericTable } from "@/components/admin/Table";
import { Link, createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
export const Route = createFileRoute("/service/challenge_sets/")({
  component: RouteComponent,
});
export type ChallengeSet = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
};
function RouteComponent() {
  const subject = "Challenge Sets";
  const columns = [
    {
      accessorKey: "id",
      header: "ID",
      field: "id",
      rowHeader: true,
      renderCell: (row: ChallengeSet) => {
        return (
          <Link to="/service/challenge_sets/$id" params={{ id: row.id }}>
            {row.id}
          </Link>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      field: "name",
      renderCell: (row: ChallengeSet) => {
        return (
          <Link to="/service/challenge_sets/$id" params={{ id: row.id }}>
            {row.name}
          </Link>
        );
      },
      sortBy: true,
    },
    {
      accessorKey: "description",
      header: "Description",
      field: "description",
      sortBy: true,
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      field: "created_at",
      sortBy: true,
      renderCell: (row: ChallengeSet) => {
        return (
          <span>
            {dayjs.utc(row.created_at).local().format("YYYY-MM-DD HH:mm:ss")}
          </span>
        );
      },
    },
  ];
  return (
    <GenericTable
      subject={subject}
      columns={columns}
      queryFn={challengeServiceApi.getChallengeSets}
      disableAdd={true}
      disablePagination={true}
      enableInternalActions={false}
    />
  );
}
