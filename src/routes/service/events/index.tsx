import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/service/events/")({
  component: RouteComponent,
});

import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { eventServiceApi } from "@/api/service";
import { type BannerVariant, GenericTable } from "@/components/admin/Table";
import { useTypedState } from "@/lib";
import { CheckIcon } from "@primer/octicons-react";
import { Button } from "@primer/react";

import type { Event } from "../../admin/events";

export type EventUser = {
  event_id: string;
  user_id: string;
  joined_at: string;
};
export type EventInfo = {
  id: string;
  event: Event;
  joined: boolean;
};

function RouteComponent() {
  const mutationBanner = useTypedState({
    isShown: false,
    description: "Something here",
    variant: "info" as BannerVariant,
  });

  const mutationJoin = useMutation({
    mutationFn: eventServiceApi.join,
    onSuccess: () => {
      mutationBanner.update("isShown", true);
      mutationBanner.update("description", "Joined successfully");
      mutationBanner.update("variant", "success");
    },
    onError: (error) => {
      mutationBanner.update("isShown", true);
      mutationBanner.update("description", error.message);
      mutationBanner.update("variant", "critical");
    },
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
    />
  );
}
