import { eventUserAdminApi, userAdminApi } from "@/api/admin";

import { ActionSelect } from "@/components/admin/ActionSelect";
import { GenericTable } from "@/components/admin/Table";
import type { EventUser } from "@/routes/service/events";
import { CheckIcon } from "@primer/octicons-react";
import { ActionList } from "@primer/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import type { User } from "../../users";
dayjs.extend(utc);

export const Route = createFileRoute("/admin/events/$id/users")({
  component: RouteComponent,
});

export type EventUserResult = {
  id: string;
  user: User;
  event_user: EventUser;
};

function RouteComponent() {
  const { id } = Route.useParams();
  const subject = `users-${id}`;

  const queryClient = useQueryClient();
  const bannedEventUser = useMutation({
    mutationFn: eventUserAdminApi.banned,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [subject] });
    },
  });

  const unbannedEventUser = useMutation({
    mutationFn: eventUserAdminApi.unbanned,
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
        return (
          <span>
            {dayjs
              .utc(row.event_user.joined_at)
              .local()
              .format("YYYY-MM-DD HH:mm:ss")}
          </span>
        );
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
        queryFn={eventUserAdminApi.fetch(id)}
        removeFn={eventUserAdminApi.delete(id)}
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
          eventUserAdminApi.add({ event_id, user_id_list: ids })
        }
        // @ts-ignore
        fetchFn={userAdminApi.fetch}
        itemText={(u: User) => `${u.username} - ${u.nickname}`}
        getId={(u: User) => u.id}
      />
    </div>
  );
}
