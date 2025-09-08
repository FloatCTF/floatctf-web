import { challengeAdminApi } from "@/api/admin";
import { useTypedState } from "@/lib";

import { GenericTable } from "@/components/admin/Table";
import {
  Button,
  Stack,
  TextInput,
  Textarea,
  ToggleSwitch,
} from "@primer/react";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { useState } from "react";
import { AdminRouteGuard } from "./route";

dayjs.extend(utc);

export type Challenge = {
  id: string; // Uuid
  name: string;
  category: string;
  description: string;
  attachment?: string; // Option<String>
  hidden: boolean;
  toml_str: string;
  created_at: Date; // DateTime
  updated_at: Date; // DateTime
};

export const Route = createFileRoute("/admin/challenges")({
  component: RouteComponent,
  loader: AdminRouteGuard,
});

function RouteComponent() {
  const columns = [
    { accessorKey: "id", header: "ID", field: "id", rowHeader: true },
    { accessorKey: "name", header: "Name", field: "name" },
    { accessorKey: "category", header: "Category", field: "category" },
    {
      accessorKey: "hidden",
      header: "Hidden",
      field: "hidden",
      renderCell: (row: Challenge) => {
        return <span>{row.hidden ? "Yes" : "No"}</span>;
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      field: "created_at",
      renderCell: (row: Challenge) => {
        return (
          <span>
            {dayjs.utc(row.created_at).local().format("YYYY-MM-DD HH:mm:ss")}
          </span>
        );
      },
    },
    {
      accessorKey: "updated_at",
      header: "Updated At",
      field: "updated_at",
      renderCell: (row: Challenge) => {
        return (
          <span>
            {dayjs.utc(row.updated_at).local().format("YYYY-MM-DD HH:mm:ss")}
          </span>
        );
      },
    },
  ];

  const mutationChallenge = useTypedState<Partial<Challenge>>({
    name: "",
    category: "",
    description: "",
    attachment: "",
    hidden: true,
    toml_str: "",
  });

  const mutationColumns = [
    {
      header: "name",
      field: "name",
      render: (
        <TextInput
          value={mutationChallenge.state.name}
          onChange={(e) => {
            mutationChallenge.update("name", e.target.value);
          }}
        />
      ),
    },
    {
      header: "category",
      field: "category",
      render: (
        <TextInput
          value={mutationChallenge.state.category}
          onChange={(e) => {
            mutationChallenge.update("category", e.target.value);
          }}
        />
      ),
    },
    {
      header: "description",
      field: "description",
      render: (
        <TextInput
          value={mutationChallenge.state.description}
          onChange={(e) => {
            mutationChallenge.update("description", e.target.value);
          }}
        />
      ),
    },
    {
      header: "attachment",
      field: "attachment",
      render: (
        <TextInput
          value={mutationChallenge.state.attachment}
          onChange={(e) => {
            mutationChallenge.update("attachment", e.target.value);
          }}
        />
      ),
    },
    {
      header: "hidden",
      field: "hidden",
      render: (
        <Stack direction="horizontal" align="center">
          <ToggleSwitch
            aria-labelledby="default-toggle-label"
            checked={mutationChallenge.state.hidden}
            onClick={() => {
              mutationChallenge.update(
                "hidden",
                !mutationChallenge.state.hidden
              );
            }}
          />
        </Stack>
      ),
    },
    {
      header: "toml_str",
      field: "toml_str",
      render: (
        <Textarea
          value={mutationChallenge.state.toml_str}
          onChange={(e) => {
            mutationChallenge.update("toml_str", e.target.value);
          }}
        />
      ),
    },
  ];

  const custom_actions = (
    <div className="flex gap-1">
      <Button>Import</Button>
      <Button>Check</Button>
    </div>
  );

  return (
    <GenericTable
      subject="Challenges"
      columns={columns}
      queryFn={challengeAdminApi.fetch}
      createFn={challengeAdminApi.create}
      removeFn={challengeAdminApi.remove}
      patchFn={challengeAdminApi.patch}
      mutationColumns={mutationColumns}
      mutationData={mutationChallenge}
      customActions={custom_actions}
    />
  );
}
