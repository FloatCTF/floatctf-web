import { challengeAdminApi } from "@/api/admin";
import { ActionSelect } from "@/components/admin/ActionSelect";
import { GenericTable } from "@/components/admin/Table";
import { CheckIcon } from "@primer/octicons-react";
import { createFileRoute } from "@tanstack/react-router";
import type { Challenge } from "../challenges";

export const Route = createFileRoute("/admin/challenge_sets/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const subject = `Challenge Set #${id}`;
  const columns = [
    { accessorKey: "id", header: "ID", field: "id", rowHeader: true },
    { accessorKey: "name", header: "Name", field: "name", sortBy: true },
    {
      accessorKey: "category",
      header: "Category",
      field: "category",
      sortBy: true,
    },
    {
      accessorKey: "hidden",
      header: "Hidden",
      field: "hidden",

      renderCell: (row: Challenge) => {
        return <span>{row.hidden ? <CheckIcon /> : <></>}</span>;
      },
      sortBy: true,
    },
  ];
  return (
    <div className="flex gap-2 m-2 items-start">
      <GenericTable
        subject={subject}
        columns={columns}
        queryFn={challengeAdminApi.getChallengeSet(id)}
        removeFn={challengeAdminApi.removeChallengeFromSet(id)}
        disableAdd={true}
        disablePagination={true}
        getRowId={(row) => row.id}
      />
      <div className="flex flex-col gap-2 m-2">
        <ActionSelect
          event_id={id}
          label="Add Challenges"
          buttonText="Add"
          queryKey={subject}
          mutationFn={({ event_id, ids }) =>
            challengeAdminApi.addChallengeToSet({
              set_id: event_id,
              challenge_id_list: ids,
            })
          }
          // @ts-ignore
          fetchFn={() => challengeAdminApi.fetch()}
          itemText={(c: Challenge) => `${c.category} - ${c.name}`}
          getId={(c: Challenge) => c.id}
        />
      </div>
    </div>
  );
}
