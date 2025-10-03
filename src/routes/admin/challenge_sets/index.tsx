import { challengeAdminApi } from "@/api/admin";
import { GenericTable } from "@/components/admin/Table";
import type { ChallengeSet } from "@/routes/service/challenge_sets";
import { TextInput } from "@primer/react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useReactive } from "ahooks";
import dayjs from "dayjs";

export const Route = createFileRoute("/admin/challenge_sets/")({
  component: RouteComponent,
});

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
          <Link to="/admin/challenge_sets/$id" params={{ id: row.id }}>
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
          <Link to="/admin/challenge_sets/$id" params={{ id: row.id }}>
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
  const mutationChallengeSet = useReactive<Partial<ChallengeSet>>({
    name: "",
    description: "",
  });
  const mutationColumns = [
    {
      header: "name",
      field: "name",
      render: (
        <TextInput
          value={mutationChallengeSet.name}
          onChange={(e) => {
            mutationChallengeSet.name = e.target.value;
          }}
        />
      ),
    },
    {
      header: "description",
      field: "description",
      render: (
        <TextInput
          value={mutationChallengeSet.description}
          onChange={(e) => {
            mutationChallengeSet.description = e.target.value;
          }}
        />
      ),
    },
  ];
  return (
    <GenericTable
      subject={subject}
      columns={columns}
      queryFn={challengeAdminApi.getChallengeSets}
      createFn={challengeAdminApi.createChallengeSet}
      removeFn={challengeAdminApi.deleteChallengeSet}
      patchFn={challengeAdminApi.patchChallengeSet}
      mutationColumns={mutationColumns}
      mutationData={mutationChallengeSet}
      disablePagination={true}
    />
  );
}
