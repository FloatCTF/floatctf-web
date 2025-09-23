import { eventAdminApi } from "@/api/admin";
import { GenericTable } from "@/components/admin/Table";
import { useTypedState } from "@/lib";
import { CheckIcon } from "@primer/octicons-react";
import {
  Select,
  Stack,
  TextInput,
  Textarea,
  ToggleSwitch,
} from "@primer/react";
import { Link, createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { AdminRouteGuard } from "../route";
dayjs.extend(utc);

export const Route = createFileRoute("/admin/events/")({
  component: RouteComponent,
  loader: AdminRouteGuard,
});
export type Event = {
  id: string;
  type: string;
  title: string;
  description?: string;
  hidden: boolean;
  rules: string;
  allow_join: boolean;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
};

function RouteComponent() {
  const columns = [
    {
      accessorKey: "id",
      header: "ID",
      field: "id",
      rowHeader: true,
      renderCell: (row: Event) => {
        return (
          <Link to={"/admin/events/$id"} params={{ id: row.id }}>
            {row.id}
          </Link>
        );
      },
    },
    { accessorKey: "type", header: "Type", field: "type", sortBy: true },
    { accessorKey: "title", header: "Title", field: "title" },
    { accessorKey: "description", header: "Description", field: "description" },
    {
      accessorKey: "hidden",
      header: "Hidden",
      field: "hidden",
      renderCell: (row: Event) => {
        return <span>{row.hidden ? <CheckIcon /> : <></>}</span>;
      },
      sortBy: true,
    },
    {
      accessorKey: "allow_join",
      header: "Joinable",
      field: "allow_join",
      renderCell: (row: Event) => {
        return <span>{row.allow_join ? <CheckIcon /> : <></>}</span>;
      },
      sortBy: true,
    },
    {
      accessorKey: "start_time",
      header: "Start Time",
      field: "start_time",
      sortBy: true,
      renderCell: (row: Event) => {
        return (
          <span>
            {dayjs.utc(row.start_time).local().format("YYYY-MM-DD HH:mm:ss")}
          </span>
        );
      },
    },
    {
      accessorKey: "end_time",
      header: "End Time",
      field: "end_time",
      sortBy: true,
      renderCell: (row: Event) => {
        return (
          <span>
            {dayjs.utc(row.end_time).local().format("YYYY-MM-DD HH:mm:ss")}
          </span>
        );
      },
    },
  ];
  const mutationEvent = useTypedState<Partial<Event>>({
    type: "JeopardySingle",
    title: "",
    description: "",
    hidden: false,
    start_time: "",
    end_time: "",
    allow_join: false,
  });
  const eventType = ["JeopardySingle", "JeopardyTeam", "AwdTeam"];
  const mutationColumns = [
    {
      header: "Title",
      field: "title",
      render: (
        <TextInput
          value={mutationEvent.state.title}
          onChange={(e) => mutationEvent.update("title", e.target.value)}
        />
      ),
    },
    {
      header: "Description",
      field: "description",
      render: (
        <Textarea
          value={mutationEvent.state.description}
          onChange={(e) => mutationEvent.update("description", e.target.value)}
        />
      ),
    },
    {
      header: "Type",
      field: "type",
      render: (
        <Select
          value={mutationEvent.state.type}
          onChange={(e) => mutationEvent.update("type", e.target.value)}
        >
          {eventType.map((type) => (
            <Select.Option key={type} value={type}>
              {type}
            </Select.Option>
          ))}
        </Select>
      ),
    },

    {
      header: "Hidden",
      field: "hidden",
      render: (
        <Stack direction="horizontal" align="center">
          <ToggleSwitch
            aria-labelledby="default-toggle-label"
            checked={mutationEvent.state.hidden}
            onClick={() => {
              mutationEvent.update("hidden", !mutationEvent.state.hidden);
            }}
          />
        </Stack>
      ),
    },
    {
      header: "Joinable",
      field: "allow_join",
      render: (
        <Stack direction="horizontal" align="center">
          <ToggleSwitch
            aria-labelledby="default-toggle-label"
            checked={mutationEvent.state.allow_join}
            onClick={() => {
              mutationEvent.update(
                "allow_join",
                !mutationEvent.state.allow_join
              );
            }}
          />
        </Stack>
      ),
    },
    {
      header: "Rules",
      field: "rules",
      render: (
        <Textarea
          value={mutationEvent.state.rules}
          onChange={(e) => mutationEvent.update("rules", e.target.value)}
        />
      ),
    },
    {
      header: "Start Time",
      field: "start_time",

      render: (
        <input
          type="datetime-local"
          step="1"
          // 显示本地时间
          value={dayjs
            .utc(mutationEvent.state.start_time)
            .local()
            .format("YYYY-MM-DDTHH:mm:ss")}
          onChange={(e) => {
            const localTime = dayjs(e.target.value);
            const utcTime = localTime.utc().format("YYYY-MM-DDTHH:mm:ss"); // UTC 不带 Z
            mutationEvent.update("start_time", utcTime);
          }}
        />
      ),
    },
    {
      header: "End Time",
      field: "end_time",
      render: (
        <input
          type="datetime-local"
          step="1"
          // 显示本地时间
          value={dayjs
            .utc(mutationEvent.state.end_time)
            .local()
            .format("YYYY-MM-DDTHH:mm:ss")}
          onChange={(e) => {
            // 用户选择的本地时间 -> 转成 UTC 保存
            const localTime = dayjs(e.target.value);
            const utcTime = localTime.utc().format("YYYY-MM-DDTHH:mm:ss"); // UTC 不带 Z
            mutationEvent.update("end_time", utcTime);
          }}
        />
      ),
    },
  ];

  return (
    <GenericTable
      subject="Events"
      columns={columns}
      queryFn={eventAdminApi.fetch}
      createFn={eventAdminApi.create}
      removeFn={eventAdminApi.remove}
      patchFn={eventAdminApi.patch}
      mutationColumns={mutationColumns}
      mutationData={mutationEvent}
    />
  );
}
