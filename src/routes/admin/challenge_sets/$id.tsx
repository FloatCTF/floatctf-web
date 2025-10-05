import { CheckIcon } from "@primer/octicons-react";
import { createFileRoute } from "@tanstack/react-router";

import { adminApi } from "@/api";
import { ActionSelect, GenericTable } from "@/components";
import type { Challenges } from "@/entity";
import { AdminRouteGuard } from "@/routes/admin/route";

export const Route = createFileRoute("/admin/challenge_sets/$id")({
  component: RouteComponent,
  loader: AdminRouteGuard,
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

      renderCell: (row: Challenges) => {
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
        queryFn={adminApi.challenges.getChallengeSet(id)}
        removeFn={adminApi.challenges.removeChallengeFromSet(id)}
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
            adminApi.challenges.addChallengeToSet({
              set_id: event_id,
              challenge_id_list: ids,
            })
          }
          fetchFn={() => adminApi.challenges.fetch()}
          itemText={(c: Challenges) => `${c.category} - ${c.name}`}
          getId={(c: Challenges) => c.id}
        />
      </div>
    </div>
  );
}
