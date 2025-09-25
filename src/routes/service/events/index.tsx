import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/service/events/")({
  component: RouteComponent,
});

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { eventServiceApi } from "@/api/service";
import { type BannerVariant, GenericTable } from "@/components/admin/Table";
import { useTypedState } from "@/lib";
import { CheckIcon } from "@primer/octicons-react";

import type { Event } from "../../admin/events";
import type { EventTeam } from "./$id";

export type EventUser = {
  event_id: string;
  user_id: string;
  joined_at: string;
  banned: boolean;
  points: number;
};
export type EventInfo = {
  id: string;
  event: Event;
  team?: EventTeam;
  joined: boolean;
};

function RouteComponent() {
  const mutationBanner = useTypedState({
    isShown: false,
    description: "Something here",
    variant: "info" as BannerVariant,
  });

  const columns = [
    {
      accessorKey: "event.id",
      header: "ID",
      field: "event.id",
      rowHeader: true,
      renderCell: (row: EventInfo) => {
        return (
          <Link
            to={"/service/events/$id"}
            params={{ id: row.event.id }}
            target="_blank"
          >
            {row.event.id}
          </Link>
        );
      },
    },
    {
      accessorKey: "event.title",
      header: "Title",
      field: "event.title",
      rowHeader: true,
      renderCell: (row: EventInfo) => {
        return (
          <Link
            to={"/service/events/$id"}
            params={{ id: row.event.id }}
            target="_blank"
          >
            {row.event.title}
          </Link>
        );
      },
    },
    { accessorKey: "event.type", header: "Type", field: "event.type" },
    {
      accessorKey: "event.allow_join",
      header: "Joinable",
      field: "event.allow_join",
      renderCell: (row: EventInfo) => (
        <span>{row.event.allow_join ? <CheckIcon /> : <></>}</span>
      ),
    },
    {
      accessorKey: "joined",
      header: "Joined",
      field: "joined",
      renderCell: (row: EventInfo) => (
        <span>{row.joined ? <CheckIcon /> : <></>}</span>
      ),
    },

    {
      accessorKey: "event.start_time",
      header: "Start Time",
      field: "start_time",
      renderCell: (row: EventInfo) => (
        <span>
          {dayjs
            .utc(row.event.start_time)
            .local()
            .format("YYYY-MM-DD HH:mm:ss")}
        </span>
      ),
    },
    {
      accessorKey: "event.end_time",
      header: "End Time",
      field: "end_time",
      renderCell: (row: EventInfo) => (
        <span>
          {dayjs.utc(row.event.end_time).local().format("YYYY-MM-DD HH:mm:ss")}
        </span>
      ),
    },
  ];

  return (
    <GenericTable
      subject="Events"
      columns={columns}
      queryFn={eventServiceApi.fetch}
      externalBanner={mutationBanner}
      enableInternalActions={false}
      disableAdd={true}
    />
  );
}
