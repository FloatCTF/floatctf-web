import { eventServiceApi } from "@/api/service";
import {
  CheckIcon,
  SparkleFillIcon,
  SparkleIcon,
  SparklesFillIcon,
} from "@primer/octicons-react";
import { DataTable, Table } from "@primer/react/experimental";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

export const Route = createFileRoute("/service/events/$id/scoreboard")({
  component: RouteComponent,
});
export type ChallengeScoreboard = {
  name: string;
  solved: boolean;
  solved_no: number;
};

export type ScoreboardItem = {
  id: string;
  no: number;
  name: string;
  score: number;
  solved_count: number;
  challenges: ChallengeScoreboard[];
};

function RouteComponent() {
  const { id } = Route.useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["event_scoreboard", id],
    queryFn: () => eventServiceApi.getScoreboard(id),
    refetchInterval: 30000, // 30秒自动刷新
  });

  const baseColumns = [
    {
      accessorKey: "no",
      header: "Rank",
      field: "no",
    },
    {
      accessorKey: "name",
      header: "Name",
      field: "name",
      rowHeader: true,
    },
    {
      accessorKey: "score",
      header: "Score",
      field: "score",
    },
    {
      accessorKey: "solved_count",
      header: "Solved",
      field: "solved_count",
    },
  ];

  // 根据 challenges 动态生成列
  const challengeColumns =
    data?.data && data.data.length > 0
      ? data.data[0].challenges.map((ch) => ({
          accessorKey: `challenge_${ch.name}`,
          header: ch.name,
          field: `challenge_${ch.name}`,
          renderCell: (row: ScoreboardItem) => {
            const challenge = row.challenges.find((c) => c.name === ch.name);
            if (!challenge) return null;
            if (challenge.solved) {
              if (challenge.solved_no === 1)
                return <SparklesFillIcon size={16} />;
              if (challenge.solved_no === 2)
                return <SparkleFillIcon size={16} />;
              if (challenge.solved_no === 3) return <SparkleIcon size={16} />;
            }
            return challenge.solved ? <CheckIcon size={16} /> : <></>;
          },
        }))
      : [];

  const columns = [...baseColumns, ...challengeColumns];

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Something went wrong</div>;
  }

  return (
    <Table.Container className="m-2">
      <Table.Subtitle id="repositories-subtitle-titleSubtitle">
        <div className="flex gap-2">
          <span>
            First Blood: <SparklesFillIcon size={16} />
          </span>
          <span>
            2nd solve: <SparkleFillIcon size={16} />
          </span>
          <span>
            3rd solve: <SparkleIcon size={16} />
          </span>
          <span>
            Solved: <CheckIcon size={16} />
          </span>
        </div>
      </Table.Subtitle>
      <DataTable
        aria-labelledby="scoreboard"
        // @ts-ignore
        columns={columns}
        data={table.getRowModel().rows.map((row) => row.original)}
      />
    </Table.Container>
  );
}
