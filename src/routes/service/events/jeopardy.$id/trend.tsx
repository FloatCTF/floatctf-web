import type { UniResponse } from "@/api/axios";
import { Spinner } from "@primer/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { AxiosError } from "axios";

import { serviceApi } from "@/api";
import { DatetimeToShow } from "@/util";

export const Route = createFileRoute("/service/events/jeopardy/$id/trend")({
  component: RouteComponent,
});
export type TrendPoint = {
  name: string;
  score: number; // total score
  time: string; // NaiveDateTime 可以用 ISO 字符串
};

export type TrendItem = {
  name: string;
  points: TrendPoint[];
};
function RouteComponent() {
  const { id } = Route.useParams();
  const { data, isLoading, isError, error } = useQuery<
    UniResponse<TrendItem[]>,
    AxiosError<{ message: string }>
  >({
    queryKey: ["event_trend", id],
    queryFn: () => serviceApi.events.getTrend(id),
    refetchInterval: 30000, // 30秒自动刷新
  });
  if (isLoading) {
    return <Spinner size="large" />;
  }
  if (isError) {
    return <div>{error.response?.data.message}</div>;
  }
  return (
    <div className="w-full h-full flex">
      {data?.data && (
        <TrendChart
          className="flex justify-center items-center"
          data={data.data}
        />
      )}
    </div>
  );
}

import {
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TrendChartProps = {
  data: TrendItem[];
  className?: string;
};

// 动态 chart 数据类型
type ChartPoint = {
  time: string;
  [key: string]: string | number | undefined;
};

export const TrendChart: React.FC<TrendChartProps> = ({ data, className }) => {
  // 构造 Recharts 可识别的数据格式
  const chartData: ChartPoint[] = [];

  // 收集所有时间点
  const allTimesSet = new Set<string>();
  for (const user of data) {
    for (const p of user.points) {
      allTimesSet.add(p.time);
    }
  }
  const allTimes = Array.from(allTimesSet).sort();

  // 构造 chartData
  for (const time of allTimes) {
    const point: ChartPoint = { time };
    for (const user of data) {
      const userPoint = user.points.find((p) => p.time === time);
      point[user.name] = userPoint?.score ?? 0;
      point[`${user.name}_label`] = userPoint?.name ?? "";
    }
    chartData.push(point);
  }

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"];

  return (
    <div className={`${className} w-full h-full`}>
      <ResponsiveContainer width="95%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tickFormatter={(time) => DatetimeToShow(time)}
          />
          <YAxis />
          <Tooltip
            isAnimationActive={false}
            labelFormatter={(time) => DatetimeToShow(time)}
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            formatter={(value: number, name: string, props: any) => {
              const label = props.payload[`${name}_label`];
              return [`${value}`, `${label}`];
            }}
          />
          <Legend />
          {data.map((user, idx) => (
            <Line
              key={user.name}
              type="monotone"
              dataKey={user.name}
              stroke={colors[idx % colors.length]}
              dot={{ r: 5, strokeWidth: 2, fill: colors[idx % colors.length] }}
              connectNulls
            />
          ))}
          <Brush
            dataKey="time"
            height={30}
            stroke="#8884d8"
            tickFormatter={(time) => DatetimeToShow(time)}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
