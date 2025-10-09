import { CheckIcon, KebabHorizontalIcon } from "@primer/octicons-react";
import { ActionList, ActionMenu, Button, IconButton } from "@primer/react";
import { DataTable, Table } from "@primer/react/experimental";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useContext } from "react";

import { adminApi } from "@/api";
import { ActionSelect } from "@/components";
import type { Challenges } from "@/entity";
import { CheckButton } from "@/routes/admin/challenges";
import { EventContext } from "./route";

export const Route = createFileRoute("/admin/events/$id/")({
  component: RouteComponent,
});

export type EventChallenge = {
  event_id: string;
  challenge_id: string;
  hidden: boolean;
  points: number;
};

export type EventChallengeResult = {
  id: string;
  event_challenge: EventChallenge;
  challenge: Challenges;
};

function RouteComponent() {
  const event = useContext(EventContext);
  const { id } = Route.useParams();
  // const subject = `event_challenges-${id}`;
  const queryClient = useQueryClient();
  const subject = `event_challenges-${id}`;
  const { data } = useQuery({
    queryKey: [subject],
    queryFn: () => adminApi.event_challenges.fetch(id),
  });

  const delete_event_challenge = useMutation({
    mutationFn: adminApi.event_challenges.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [subject],
      });
    },
  });
  const open_event_challenge = useMutation({
    mutationFn: adminApi.event_challenges.open,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [subject],
      });
    },
  });
  const hidden_event_challenge = useMutation({
    mutationFn: adminApi.event_challenges.hidden,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [subject],
      });
    },
  });
  const createChallengeSetMutation = useMutation({
    mutationFn: adminApi.events.createChallengeSet,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [subject],
      });
      alert("Create Challenge Set Success");
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
      accessorKey: "event_challenge.points",
      header: "Challenge Points",
      field: "event_challenge.points",
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

        <Button
          variant="primary"
          onClick={() => {
            createChallengeSetMutation.mutate({
              name: event?.title ?? "Challenge Set",
              description: event?.description ?? "Challenge Set",
              challenge_id_list: data?.data.map(
                (row: EventChallengeResult) => row.challenge.id
              ),
            });
          }}
        >
          As Challenge Set
        </Button>
        {/* Add Challenges */}
        <ActionSelect
          event_id={id}
          label="Add Challenges"
          buttonText="Add"
          queryKey={subject}
          mutationFn={({ event_id, ids }) =>
            adminApi.event_challenges.add({ event_id, challenge_id_list: ids })
          }
          fetchFn={() => adminApi.challenges.fetch()}
          itemText={(c: Challenges) => `${c.category} - ${c.name}`}
          getId={(c: Challenges) => c.id}
          enableImportJson={true}
        />
        {/* Open Challenges */}
        <ActionSelect
          event_id={id}
          label="Open Challenges"
          buttonText="Open"
          queryKey={subject}
          mutationFn={({ event_id, ids }) =>
            adminApi.event_challenges.open({ event_id, challenge_id_list: ids })
          }
          fetchFn={async () => {
            const res = await adminApi.event_challenges.fetch(id);
            // ✅ 这里过滤掉 hidden 的 challenge
            res.data = res.data.filter(
              (c: EventChallengeResult) => c.event_challenge.hidden
            );
            return res;
          }}
          itemText={(c: EventChallengeResult) =>
            `${c.challenge.category} - ${c.challenge.name}`
          }
          getId={(c: EventChallengeResult) => c.challenge.id}
        />
      </div>
    </div>
  );
}
