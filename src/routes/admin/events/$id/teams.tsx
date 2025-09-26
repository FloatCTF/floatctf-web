import { eventAdminApi, eventTeamAdminApi } from "@/api/admin";
import { GenericTable } from "@/components/admin/Table";
import type { EventTeam } from "@/routes/service/events/$id";
import { CheckIcon } from "@primer/octicons-react";
import { ActionList, TreeView } from "@primer/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { Fragment, useState } from "react";
export const Route = createFileRoute("/admin/events/$id/teams")({
  component: RouteComponent,
});
export enum EventTeamMemberRole {
  Captain = "Captain",
  Member = "Member",
}

export type TeamMemberResult = {
  username: string;
  nickname: string;
  role: EventTeamMemberRole;
  points: number;
};

export type TeamResult = {
  id: string;
  team: EventTeam;
  captain: string;
  members: TeamMemberResult[];
};

function RouteComponent() {
  const { id } = Route.useParams();
  const subject = `EventTeams-${id}`;
  const queryClient = useQueryClient();
  const bannedEventTeam = useMutation({
    mutationFn: eventTeamAdminApi.banned,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [subject] });
    },
  });

  const unbannedEventTeam = useMutation({
    mutationFn: eventTeamAdminApi.unbanned,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [subject] });
    },
  });

  const columns = [
    {
      accessorKey: "team.id",
      header: "Team ID",
      field: "team.id",
      rowHeader: true,
    },
    {
      accessorKey: "team.name",
      header: "Team Name",
      field: "team.name",
      sortBy: true,
    },
    {
      accessorKey: "team.points",
      header: "Points",
      field: "team.points",
      sortBy: true,
    },
    {
      accessorKey: "team.banned",
      header: "Banned",
      field: "team.banned",
      renderCell: (row: TeamResult) => {
        return <span>{row.team.banned ? <CheckIcon /> : <></>}</span>;
      },
      sortBy: true,
    },
    {
      accessorKey: "team.members",
      header: "Members",
      field: "team.members",
      renderCell: (row: TeamResult) => {
        return (
          <table className="table-auto w-full border rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 text-left">Username</th>
                <th className="px-2 py-1 text-left">Nickname</th>
                <th className="px-2 py-1 text-left">Role</th>
                <th className="px-2 py-1 text-left">Points</th>
              </tr>
            </thead>
            <tbody>
              {row.members.map((row) => (
                <Fragment key={row.username}>
                  <tr className="cursor-pointer hover:bg-gray-50">
                    <td className="px-2 py-1">{row.username}</td>
                    <td className="px-2 py-1">{row.nickname}</td>
                    <td className="px-2 py-1">{row.role}</td>
                    <td className="px-2 py-1">{row.points}</td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        );
      },
    },
    {
      accessorKey: "team.created_at",
      header: "Created At",
      field: "team.created_at",
      renderCell: (row: TeamResult) => {
        return (
          <span>
            {dayjs(row.team.created_at).utc().format("YYYY-MM-DD HH:mm:ss")}
          </span>
        );
      },
    },
  ];

  const columns_actions = (row: TeamResult) => {
    return (
      <ActionList>
        {row.team.banned ? (
          <ActionList.Item
            variant="default"
            onSelect={() => {
              unbannedEventTeam.mutate({
                event_id: id,
                team_id: row.team.id,
              });
            }}
          >
            Unbanned
          </ActionList.Item>
        ) : (
          <ActionList.Item
            variant="danger"
            onSelect={() => {
              bannedEventTeam.mutate({
                event_id: id,
                team_id: row.team.id,
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
    <GenericTable
      subject={subject}
      columns={columns}
      queryFn={eventTeamAdminApi.getTeams(id)}
      removeFn={eventTeamAdminApi.remove(id)}
      disableAdd={true}
      hideTitle={true}
      disablePagination={true}
      columnActions={columns_actions}
      getRowId={(row) => row.team.id}
    />
  );
}
