import type { QueryParams, UniResponse } from "@/api/axios";

import { KebabHorizontalIcon } from "@primer/octicons-react";
import {
  ActionList,
  ActionMenu,
  Button,
  FormControl,
  IconButton,
} from "@primer/react";
import { Banner, DataTable, Dialog, Table } from "@primer/react/experimental";
import {
  type UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useReactive } from "ahooks";
import type { AxiosError } from "axios";
import {
  type ReactElement,
  type ReactNode,
  cloneElement,
  useCallback,
  useState,
} from "react";
import { type BannerVariant, useMsgBanner } from "../MsgBanner";
export type PaginationResponse<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number };
};
export type Column<T> = {
  accessorKey: string; // 对应数据字段
  header: string | (() => ReactNode); // 表头，可自定义渲染
  id?: string; // 可选 id
  rowHeader?: boolean; // 用于标记行头
  renderCell?: (row: T) => ReactNode; // 自定义单元格渲染
};
export type MutationColumn = {
  header: string;
  field: string;
  render: ReactElement;
};
export type BannerState = {
  isShown: boolean;
  description: string;
  variant: BannerVariant;
};

type GenericTableProps<T> = {
  subject: string; // 用作 queryKey
  columns: Column<T>[];
  queryFn: (params?: QueryParams) => Promise<UniResponse<T[]>>;
  createFn?: (data: Partial<T>) => Promise<UniResponse<T>>;
  removeFn?: (id: string) => Promise<UniResponse<number>>;
  patchFn?: (data: Partial<T>) => Promise<UniResponse<T>>;
  mutationColumns?: MutationColumn[];
  mutationData?: Partial<T>;
  customActions?: ReactNode;
  columnActions?: (row: T) => ReactNode;
  externalBanner?: ReturnType<typeof useMsgBanner>;
  enableInternalActions?: boolean;
  disableAdd?: boolean;
  hideTitle?: boolean;
  disablePagination?: boolean;
  className?: string;
  subtitle?: string;
  getRowId?: (row: T) => string;
} & React.HTMLAttributes<HTMLDivElement>;

export const GenericTable = <T extends { id: string }>({
  subject,
  columns,
  queryFn,
  createFn,
  removeFn,
  patchFn,
  mutationColumns,
  mutationData,
  customActions,
  columnActions,
  externalBanner,
  enableInternalActions = true,
  disableAdd = false,
  hideTitle = false,
  disablePagination = false,
  subtitle,
  getRowId = (row) => row.id,
  ...rest
}: GenericTableProps<T>) => {
  // add actions to columns

  const tableColumns: Column<T>[] = (() => {
    if (!enableInternalActions) {
      return columns;
    }
    // 没有 actions，添加默认 actions 列
    const actionsColumn: Column<T> = {
      accessorKey: "actions",
      id: "actions",
      header: () => (
        <span
          style={{
            clipPath: "inset(50%)",
            height: "1px",
            overflow: "hidden",
            position: "absolute",
            whiteSpace: "nowrap",
            width: "1px",
          }}
        >
          Actions
        </span>
      ),
      renderCell: (row: T) => (
        <ActionMenu>
          <ActionMenu.Anchor>
            <IconButton
              aria-label={getRowId(row)}
              title={getRowId(row)}
              icon={KebabHorizontalIcon}
              variant="invisible"
            />
          </ActionMenu.Anchor>
          <ActionMenu.Overlay>
            {columnActions?.(row)}
            <ActionList>
              {columns.find((column) => column.accessorKey === "actions") ? (
                <></>
              ) : (
                <></>
              )}
              {patchFn && (
                <ActionList.Item
                  key={`${getRowId(row)}-edit`}
                  onClick={() => {
                    setDialogMode("modify");
                    setIsOpen(true);
                    if (mutationData) {
                      Object.assign(mutationData, row);
                    }
                  }}
                >
                  Edit row
                </ActionList.Item>
              )}

              {removeFn && (
                <>
                  <ActionList.Divider />
                  <ActionList.Item
                    key={`${getRowId(row)}-delete`}
                    variant="danger"
                    onClick={() => {
                      deleteMutation?.mutate(getRowId(row));
                      onDialogClose?.();
                    }}
                  >
                    Delete row
                  </ActionList.Item>
                </>
              )}
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      ),
    };

    return [...columns, actionsColumn];
  })();

  // query
  const [page, setPage] = useState(1);
  let limit = 10;
  if (disablePagination) {
    limit = 100;
  }
  const queryClient = useQueryClient();

  const { data, isLoading }: UseQueryResult<UniResponse<T[]>> = useQuery({
    queryKey: [subject, page],
    queryFn: () => queryFn({ page, limit }),
  });
  const total = data?.meta?.total ?? 1;
  const table = useReactTable({
    data: data?.data ?? [],
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const banner = externalBanner ?? useMsgBanner();

  // add or modify
  const [isOpen, setIsOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "modify">("add");
  const onDialogClose = useCallback(() => setIsOpen(false), []);

  // mutation
  const deleteMutation = useMutation({
    mutationFn: removeFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [subject] });
      banner.showBanner("success", `Delete ${subject} successfully`);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      // 这里可以拿到后端返回的 message
      const msg =
        error.response?.data?.message || error.message || "Unknown error";

      banner.showBanner("critical", msg);
    },
  });

  const createMutation = useMutation({
    mutationFn: createFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [subject] });
      banner.showBanner("success", `Create ${subject} successfully`);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      // 这里可以拿到后端返回的 message
      const msg =
        error.response?.data?.message || error.message || "Unknown error";
      banner.showBanner("critical", msg);
    },
  });

  const patchMutation = useMutation({
    mutationFn: patchFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [subject] });
      banner.showBanner("success", `Update ${subject} successfully`);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      // 这里可以拿到后端返回的 message
      const msg =
        error.response?.data?.message || error.message || "Unknown error";

      banner.showBanner("critical", msg);
    },
  });

  if (isLoading) {
    return (
      <Table.Skeleton
        aria-labelledby="repositories-loading"
        rows={limit}
        columns={tableColumns}
      />
    );
  }

  return (
    <div className="w-full" {...rest}>
      {isOpen && (
        <Dialog
          title={dialogMode === "add" ? `Add ${subject}` : `Modify ${subject}`}
          onClose={onDialogClose}
          position="right"
        >
          <div className="w-full gap-1 flex-col flex">
            {mutationColumns?.map((column) => (
              <FormControl key={column.field} className="w-full">
                <FormControl.Label>{column.field}</FormControl.Label>
                {cloneElement(
                  column.render as ReactElement<{ className?: string }>,
                  { className: "w-full" }
                )}
              </FormControl>
            ))}
            {(dialogMode === "add" && (
              <Button
                className="w-full"
                variant="primary"
                onClick={() => {
                  if (mutationData) createMutation.mutate(mutationData);
                }}
              >
                Create
              </Button>
            )) ||
              (dialogMode === "modify" && (
                <div className="flex gap-1">
                  <Button
                    className="w-full"
                    variant="primary"
                    onClick={() => {
                      if (mutationData) patchMutation.mutate(mutationData);
                      setIsOpen(false);
                    }}
                  >
                    Update
                  </Button>
                  <Button
                    className="w-full"
                    variant="danger"
                    onClick={() => {
                      if (mutationData)
                        deleteMutation.mutate(mutationData.id as string);
                      setIsOpen(false);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              ))}
          </div>
        </Dialog>
      )}

      {/* table */}
      <Table.Container>
        {!hideTitle && (
          <Table.Title id="repositories-headerAction">{subject}</Table.Title>
        )}
        {subtitle && (
          <Table.Subtitle id="repositories-subtitle-headerAction">
            {subtitle}
          </Table.Subtitle>
        )}
        <Table.Actions>
          {customActions}
          {!disableAdd && (
            <Button
              onClick={() => {
                if (mutationData) {
                  Object.assign(mutationData, {});
                }
                setDialogMode("add");
                setIsOpen(true);
              }}
            >
              Add
            </Button>
          )}
        </Table.Actions>

        {!customActions && !disableAdd && <Table.Divider />}

        <Table.Subtitle id="repositories-subtitle-headerAction">
          <banner.BannerComponent />
        </Table.Subtitle>
        <DataTable
          aria-labelledby="repositories-default-headerAction"
          aria-describedby="repositories-subtitle-headerAction"
          data={table.getRowModel().rows.map((row) => row.original)}
          columns={tableColumns}
        />
        {!disablePagination && (
          <Table.Pagination
            aria-label="Pagination"
            pageSize={limit}
            totalCount={total}
            defaultPageIndex={page - 1}
            onChange={({ pageIndex }) => {
              setPage(pageIndex + 1);
            }}
          />
        )}
      </Table.Container>
    </div>
  );
};
