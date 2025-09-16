import { challengeAdminApi, eventChallengeAdminApi } from "@/api/admin";
import { ActionSelect } from "@/components/admin/ActionSelect";

import { CheckIcon, KebabHorizontalIcon } from "@primer/octicons-react";
import { ActionList, ActionMenu, IconButton } from "@primer/react";
import { DataTable, Table } from "@primer/react/experimental";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { type Challenge, CheckButton } from "../../challenges";

dayjs.extend(utc);

export const Route = createFileRoute("/admin/events/$id/")({
  component: RouteComponent,
});

export type EventChallenge = {
  event_id: string;
  challenge_id: string;
  hidden: boolean;
};

export type EventChallengeResult = {
  id: string;
  event_challenge: EventChallenge;
  challenge: Challenge;
};

function RouteComponent() {
  const { id } = Route.useParams();
  // const subject = `event_challenges-${id}`;
  const queryClient = useQueryClient();
  const subject = `event_challenges-${id}`;
  const { data, isLoading, isError } = useQuery({
    queryKey: [subject],
    queryFn: () => eventChallengeAdminApi.fetch(id),
  });

  const delete_event_challenge = useMutation({
    mutationFn: eventChallengeAdminApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [subject],
      });
    },
  });
  const open_event_challenge = useMutation({
    mutationFn: eventChallengeAdminApi.open,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [subject],
      });
    },
  });
  const hidden_event_challenge = useMutation({
    mutationFn: eventChallengeAdminApi.hidden,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [subject],
      });
    },
  });
  const columns = [
    {
      accessorKey: "challenge.id",
      header: "Challenge ID",
      field: "challenge.id",
      rowHeader: true,
    },
    {
      accessorKey: "challenge.name",
      header: "Challenge Name",
      field: "challenge.name",
      sortBy: true,
    },
    {
      accessorKey: "challenge.category",
      header: "Challenge Category",
      field: "challenge.category",
      sortBy: true,
    },
    {
      accessorKey: "event_challenge.hidden",
      header: "Hidden",
      field: "event_challenge.hidden",

      renderCell: (row: EventChallengeResult) => {
        return (
          <span>{row.event_challenge.hidden ? <CheckIcon /> : <></>}</span>
        );
      },
      sortBy: true,
    },
    {
      accessorKey: "action",
      header: "Action",
      field: "action",
      renderCell: (row: EventChallengeResult) => {
        return (
          <ActionMenu>
            <ActionMenu.Anchor>
              <IconButton
                aria-label={row.id}
                title={row.id}
                icon={KebabHorizontalIcon}
                variant="invisible"
              />
            </ActionMenu.Anchor>
            <ActionMenu.Overlay>
              <ActionList>
                <ActionList.Item
                  key={`${row.id}-edit`}
                  onClick={() => {
                    if (row.event_challenge.hidden) {
                      open_event_challenge.mutate({
                        event_id: id,
                        challenge_id: row.challenge.id,
                      });
                    } else {
                      hidden_event_challenge.mutate({
                        event_id: id,
                        challenge_id: row.challenge.id,
                      });
                    }
                  }}
                >
                  {row.event_challenge.hidden ? "Open" : "Hide"}
                </ActionList.Item>
                <ActionList.Divider />
                <ActionList.Item
                  key={`${row.id}-delete`}
                  variant="danger"
                  onClick={() => {
                    delete_event_challenge.mutate({
                      event_id: id,
                      challenge_id: row.challenge.id,
                    });
                  }}
                >
                  Delete row
                </ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: data?.data ?? [],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex gap-2 m-2 items-start">
      <Table.Container className="flex-1">
        <DataTable
          aria-labelledby="repositories-default"
          // @ts-ignore
          columns={columns}
          // @ts-ignore
          data={table.getRowModel().rows.map((row) => row.original)}
        />
      </Table.Container>
      <div className="flex flex-col gap-2 m-2">
        <CheckButton
          challenge_id_list={
            data?.data.map((row: EventChallengeResult) => row.challenge.id) ??
            []
          }
        />
        {/* Add Challenges */}
        <ActionSelect
          event_id={id}
          label="Add Challenges"
          buttonText="Add"
          queryKey={subject}
          mutationFn={({ event_id, ids }) =>
            eventChallengeAdminApi.add({ event_id, challenge_id_list: ids })
          }
          // @ts-ignore
          fetchFn={() => challengeAdminApi.fetch()}
          itemText={(c: Challenge) => `${c.category} - ${c.name}`}
          getId={(c: Challenge) => c.id}
          enableImportJson={true}
        />

        {/* Open Challenges */}
        <ActionSelect
          event_id={id}
          label="Open Challenges"
          buttonText="Open"
          queryKey={subject}
          mutationFn={({ event_id, ids }) =>
            eventChallengeAdminApi.open({ event_id, challenge_id_list: ids })
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
