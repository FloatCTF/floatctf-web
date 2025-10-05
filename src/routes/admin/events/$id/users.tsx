import { CheckIcon } from "@primer/octicons-react";
import { ActionList } from "@primer/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { adminApi } from "@/api";
import { ActionSelect, GenericTable } from "@/components";
import type { EventUsers, Users } from "@/entity";
import { DatetimeToShow } from "@/util";

export const Route = createFileRoute("/admin/events/$id/users")({
  component: RouteComponent,
});

export type EventUserResult = {
  id: string;
  user: Users;
  event_user: EventUsers;
};

function RouteComponent() {
  const { id } = Route.useParams();
  const subject = `EventUsers-${id}`;

  const queryClient = useQueryClient();
  const bannedEventUser = useMutation({
    mutationFn: adminApi.event_users.banned,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [subject] });
    },
  });

  const unbannedEventUser = useMutation({
    mutationFn: adminApi.event_users.unbanned,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [subject] });
    },
  });

  const columns = [
    { accessorKey: "user.id", header: "ID", field: "user.id", rowHeader: true },
    {
      accessorKey: "user.username",
      header: "Username",
      field: "user.username",
    },
    {
      accessorKey: "user.nickname",
      header: "Nickname",
      field: "user.nickname",
    },
    {
      accessorKey: "event_user.points",
      header: "Points",
      field: "event_user.points",
      sortBy: true,
    },
    {
      accessorKey: "event_user.banned",
      header: "Banned",
      field: "event_user.banned",
      renderCell: (row: EventUserResult) => {
        return <span>{row.event_user.banned ? <CheckIcon /> : <></>}</span>;
      },
      sortBy: true,
    },
    {
      accessorKey: "event_user.joined_at",
      header: "Joined At",
      field: "event_user.joined_at",
      renderCell: (row: EventUserResult) => {
        return <span>{DatetimeToShow(row.event_user.joined_at)}</span>;
      },
      sortBy: true,
    },
  ];

  const columns_actions = (row: EventUserResult) => {
    return (
      <ActionList>
        {row.event_user.banned ? (
          <ActionList.Item
            variant="default"
            onSelect={() => {
              unbannedEventUser.mutate({
                event_id: id,
                user_id: row.user.id,
              });
            }}
          >
            Unbanned
          </ActionList.Item>
        ) : (
          <ActionList.Item
            variant="danger"
            onSelect={() => {
              bannedEventUser.mutate({
                event_id: id,
                user_id: row.user.id,
              });
            }}
          >
            Banned
          </ActionList.Item>
        )}
      </ActionList>
    );
  };

  return (
    <div className="flex gap-2 m-2 items-start">
      <GenericTable
        subject={subject}
        queryFn={adminApi.event_users.fetch(id)}
        removeFn={adminApi.event_users.delete(id)}
        columns={columns}
        disableAdd={true}
        disablePagination={true}
        hideTitle={true}
        columnActions={columns_actions}
        getRowId={(row: EventUserResult) => row.user.id}
      />

      <ActionSelect
        event_id={id}
        label="Add Event Users"
        buttonText="Add"
        queryKey={subject}
        mutationFn={({ event_id, ids }) =>
          adminApi.event_users.add({ event_id, user_id_list: ids })
        }
        // @ts-ignore
        fetchFn={userAdminApi.fetch}
        itemText={(u: Users) => `${u.username} - ${u.nickname}`}
        getId={(u: Users) => u.id}
      />
    </div>
  );
}
