import { settingAdminApi } from "@/api/admin";
import { GenericTable } from "@/components/admin/Table";
import { Select, Stack, TextInput, ToggleSwitch } from "@primer/react";
import { createFileRoute } from "@tanstack/react-router";
import { useReactive, useTitle } from "ahooks";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export const Route = createFileRoute("/admin/settings")({
  component: RouteComponent,
});
export enum SettingValueType {
  String = "String",
  Integer = "Integer",
  Boolean = "Boolean",
  Float = "Float",
}
export type Setting = {
  id: string;
  key: string;
  value: string;
  type: SettingValueType;
  description: string;
  protected: boolean;
  updated_at: string;
};

function RouteComponent() {
  useTitle("Settings | FloatCTF");
  const subject = "Settings";
  const columns = [
    { accessorKey: "id", header: "ID", field: "id", rowHeader: true },
    {
      accessorKey: "key",
      header: "Key",
      field: "key",
      sortBy: true,
    },
    {
      accessorKey: "value",
      header: "Value",
      field: "value",
      sortBy: true,
    },

    {
      accessorKey: "description",
      header: "Description",
      field: "description",
      sortBy: true,
    },
    {
      accessorKey: "type",
      header: "Type",
      field: "type",
      sortBy: true,
    },
    {
      accessorKey: "updated_at",
      header: "Updated At",
      field: "updated_at",
      sortBy: true,
      renderCell: (row: Setting) => {
        return (
          <span>
            {dayjs.utc(row.updated_at).local().format("YYYY-MM-DD HH:mm:ss")}
          </span>
        );
      },
    },
  ];
  const mutationSetting = useReactive<Partial<Setting>>({
    key: "",
    value: "",
    type: SettingValueType.String,
    description: "",
    protected: true,
  });
  const mutationColumns = [
    {
      header: "key",
      field: "key",
      render: (
        <TextInput
          value={mutationSetting.key}
          onChange={(e) => {
            mutationSetting.key = e.target.value;
          }}
        />
      ),
    },
    {
      header: "value",
      field: "value",
      render: (
        <TextInput
          value={mutationSetting.value}
          onChange={(e) => {
            mutationSetting.value = e.target.value;
          }}
        />
      ),
    },
    {
      header: "description",
      field: "description",
      render: (
        <TextInput
          value={mutationSetting.description}
          onChange={(e) => {
            mutationSetting.description = e.target.value;
          }}
        />
      ),
    },
    {
      header: "type",
      field: "type",
      render: (
        <Select
          value={mutationSetting.type}
          onChange={(e) => {
            mutationSetting.type = e.target.value as SettingValueType;
          }}
        >
          {Object.values(SettingValueType).map((type) => (
            <Select.Option key={type} value={type}>
              {type}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      header: "protected",
      field: "protected",
      render: (
        <Stack direction="horizontal" align="center">
          <ToggleSwitch
            aria-labelledby="default-toggle-label"
            checked={mutationSetting.protected}
            onClick={() => {
              mutationSetting.protected = !mutationSetting.protected;
            }}
          />
        </Stack>
      ),
    },
  ];
  return (
    <GenericTable
      subject={subject}
      columns={columns}
      mutationColumns={mutationColumns}
      mutationData={mutationSetting}
      queryFn={settingAdminApi.fetch}
      createFn={settingAdminApi.create}
      removeFn={settingAdminApi.remove}
      patchFn={settingAdminApi.patch}
      disablePagination={true}
    />
  );
}
