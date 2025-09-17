import { solveServiceApi } from "@/api/service";
import { DataTable, Table } from "@primer/react/experimental";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
export const Route = createFileRoute("/service/top")({
  component: RouteComponent,
});
export type TopUser = {
  id: string;
  no: number;
  nickname: string;
  solved_count: number;
  solved_last_at: string;
};

function RouteComponent() {
  const columns = [
    {
      accessorKey: "no",
      header: "No",
      field: "no",
      rowHeader: true,
    },
    {
      accessorKey: "nickname",
      header: "Nickname",
      field: "nickname",
      rowHeader: true,
    },
    {
      accessorKey: "solved_count",
      header: "Solved Count",
      field: "solved_count",
    },
    {
      accessorKey: "solved_last_at",
      header: "Solved LastAt",
      field: "solved_last_at",
      renderCell: (row: TopUser) => {
        return (
          <span>
            {dayjs
              .utc(row.solved_last_at)
              .local()
              .format("YYYY-MM-DD HH:mm:ss")}
          </span>
        );
      },
    },
  ];
  const { data, isLoading } = useQuery({
    queryKey: ["top15users"],
    queryFn: () => solveServiceApi.getTop15Users(),
  });
  const table = useReactTable({
    data: data?.data ?? [],
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Table.Container className="m-2">
      <DataTable
        aria-labelledby="repositories-default"
        // @ts-ignore
        columns={columns}
        data={table.getRowModel().rows.map((row) => row.original)}
      />
    </Table.Container>
  );
}
