import { challengeAdminApi } from "@/api/admin";

import { GenericTable } from "@/components/admin/Table";
import {
  Button,
  Checkbox,
  Dialog,
  Stack,
  TextInput,
  Textarea,
  ToggleSwitch,
} from "@primer/react";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { CheckIcon } from "@primer/octicons-react";
import { DataTable, Table } from "@primer/react/experimental";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useReactive } from "ahooks";
import { useCallback, useMemo, useRef, useState } from "react";
import { AdminRouteGuard } from "./route";

dayjs.extend(utc);

export type Challenge = {
  id: string; // Uuid
  name: string;
  safe_name: string;
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
    { accessorKey: "name", header: "Name", field: "name", sortBy: true },
    {
      accessorKey: "category",
      header: "Category",
      field: "category",
      sortBy: true,
    },
    {
      accessorKey: "hidden",
      header: "Hidden",
      field: "hidden",

      renderCell: (row: Challenge) => {
        return <span>{row.hidden ? <CheckIcon /> : <></>}</span>;
      },
      sortBy: true,
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

  const mutationChallenge = useReactive<Partial<Challenge>>({
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
          value={mutationChallenge.name}
          onChange={(e) => {
            mutationChallenge.name = e.target.value;
          }}
        />
      ),
    },
    {
      header: "category",
      field: "category",
      render: (
        <TextInput
          value={mutationChallenge.category}
          onChange={(e) => {
            mutationChallenge.category = e.target.value;
          }}
        />
      ),
    },
    {
      header: "description",
      field: "description",
      render: (
        <TextInput
          value={mutationChallenge.description}
          onChange={(e) => {
            mutationChallenge.description = e.target.value;
          }}
        />
      ),
    },
    {
      header: "attachment",
      field: "attachment",
      render: (
        <TextInput
          value={mutationChallenge.attachment}
          onChange={(e) => {
            mutationChallenge.attachment = e.target.value;
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
            checked={mutationChallenge.hidden}
            onClick={() => {
              mutationChallenge.hidden = !mutationChallenge.hidden;
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
          value={mutationChallenge.toml_str}
          onChange={(e) => {
            mutationChallenge.toml_str = e.target.value;
          }}
        />
      ),
    },
  ];

  const custom_actions = (
    <div className="flex gap-1">
      <ImportButton />
      <CheckButton />
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
      disableAdd={true}
    />
  );
}

function ImportButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isBatch, setIsBatch] = useState(false);
  const [message, setMessage] = useState<null | {
    type: "success" | "error";
    text: string;
  }>(null);
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: (vars: { file: File; isBatch: boolean }) =>
      challengeAdminApi.importChallenge(vars.file, vars.isBatch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Challenges"] });
      setMessage({ type: "success", text: "上传成功 🎉" });
      setFile(null);
      setIsBatch(false);

      // 3 秒后清理提示
      setTimeout(() => setMessage(null), 3000);
    },
    onError: () => {
      setMessage({ type: "error", text: "上传失败，请重试" });
      setTimeout(() => setMessage(null), 3000);
    },
  });

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.name.toLowerCase().endsWith(".zip")) {
      setMessage({ type: "error", text: "只支持 ZIP 文件" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setFile(selected);
    e.target.value = "";
  };

  const handleUpload = () => {
    if (!file) return;
    importMutation.mutate({ file, isBatch });
  };

  return (
    <div className="flex items-center gap-3">
      {/* 左边：提示 / 文件名 / 复选框 / 上传按钮 */} {/* 全局提示 */}
      {message && (
        <span
          className={`ml-2 text-sm ${
            message.type === "success" ? "text-green-600" : "text-red-500"
          }`}
        >
          {message.text}
        </span>
      )}
      {file && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{file.name}</span>
          <div className="flex items-center gap-2">
            <Checkbox
              id="batch"
              checked={isBatch}
              onChange={(e) => setIsBatch(e.target.checked)}
            />
            <label htmlFor="batch" className="text-sm cursor-pointer">
              批量导入
            </label>
          </div>
          <Button
            onClick={handleUpload}
            disabled={importMutation.isPending}
            variant="primary"
          >
            {importMutation.isPending ? "Uploading..." : "Start Upload"}
          </Button>
        </div>
      )}
      {/* 右边：导入按钮 */}
      <Button onClick={handleClick}>Import</Button>
      <input
        type="file"
        accept=".zip"
        ref={inputRef}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}

export type ChallengeCheckResult = {
  id: string;
  challenge_name: string;
  is_ok: boolean;
  docker_image: boolean;
  attachment: boolean;
};
export type BuildChallengeResult = {
  challenge_name: string;
  is_ok: boolean;
  message: string;
};

export function CheckButton({
  challenge_id_list,
}: {
  challenge_id_list?: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const onDialogClose = useCallback(() => setIsOpen(false), []);

  // 数据获取
  const { data, isLoading } = useQuery({
    queryKey: ["ChallengeCheck"],
    queryFn: () => challengeAdminApi.checkChallenges(challenge_id_list),
    enabled: isOpen,
    refetchOnWindowFocus: false,
    staleTime: 60_000, // 1 分钟内重复打开不会再请求
  });
  const queryClient = useQueryClient();
  const [building, setBuilding] = useState(false);

  const buildChallengeMutation = useMutation({
    mutationFn: (challenge_id_list?: string[]) =>
      challengeAdminApi.buildChallenges(challenge_id_list),
    onSuccess: (data) => {
      setBuilding(false);
      alert(data.data?.map((r) => r.message).join("\n"));
      queryClient.invalidateQueries({ queryKey: ["ChallengeCheck"] });
    },
    onError: (e) => {
      setBuilding(false);
      alert(e.message);
    },
  });
  // 列定义只生成一次
  const columns = useMemo(
    () => [
      {
        accessorKey: "challenge_name",
        header: "Challenge Name",
        field: "challenge_name",
        rowHeader: true,
      },
      {
        accessorKey: "docker_image",
        header: "Docker Image",
        field: "docker_image",
        renderCell: (row: ChallengeCheckResult) => {
          return (
            <span>
              {row.docker_image ? (
                <CheckIcon />
              ) : (
                <Button
                  size="small"
                  variant="primary"
                  onClick={() => {
                    setBuilding(true);
                    buildChallengeMutation.mutate([row.id]);
                  }}
                  disabled={building}
                >
                  Build
                </Button>
              )}
            </span>
          );
        },
      },
      {
        accessorKey: "attachment",
        header: "Attachment",
        field: "attachment",
        renderCell: (row: ChallengeCheckResult) => {
          return <span>{row.attachment ? <CheckIcon /> : <></>}</span>;
        },
      },
    ],
    [buildChallengeMutation, building]
  );

  // 过滤出不可用的挑战
  const invalidData = useMemo(
    () => (data?.data ?? []).filter((r: ChallengeCheckResult) => !r.is_ok),
    [data]
  );

  // 表格实例
  const table = useReactTable({
    data: invalidData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.challenge_name, // 👈 用 challenge_name 保证唯一 key
  });

  if (isLoading) {
    return <div>Loading…</div>;
  }

  return (
    <>
      {isOpen && (
        <Dialog title="Unavailable Challenges" onClose={onDialogClose}>
          <Table.Container className="m-2">
            <DataTable
              aria-labelledby="repositories-default"
              // @ts-ignore
              columns={columns}
              getRowId={(row) => row.challenge_name}
              data={table.getRowModel().rows.map((row) => row.original)}
            />
          </Table.Container>
        </Dialog>
      )}
      <Button ref={buttonRef} onClick={() => setIsOpen(!isOpen)}>
        Check
      </Button>
    </>
  );
}
