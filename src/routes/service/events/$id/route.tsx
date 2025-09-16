import { eventServiceApi } from "@/api/service";
import { ProgressBar, UnderlineNav } from "@primer/react";
import { useQuery } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  createFileRoute,
  useMatchRoute,
} from "@tanstack/react-router";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { useEffect, useState } from "react";
import { ServiceRouteGuard } from "../../route";

export const Route = createFileRoute("/service/events/$id")({
  component: RouteComponent,
  loader: ServiceRouteGuard,
});

function RouteComponent() {
  const { id } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["eventInfo", id],
    queryFn: () => eventServiceApi.get(id),
  });
  const eventInfo = data?.data;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <RemainingTimer
        start_at={dayjs
          .utc(eventInfo?.event.start_time)
          .local()
          .format("YYYY-MM-DDTHH:mm:ss")}
        end_at={dayjs
          .utc(eventInfo?.event.end_time)
          .local()
          .format("YYYY-MM-DDTHH:mm:ss")}
      />
      <UnderlineNav aria-label="Repository">
        <RouterNavItem to="/service/events/$id" params={{ id }}>
          Overview
        </RouterNavItem>
        <RouterNavItem to="/service/events/$id/challenges" params={{ id }}>
          Challenges
        </RouterNavItem>

        <RouterNavItem to="/service/events/$id/instances" params={{ id }}>
          Instances
        </RouterNavItem>
        <RouterNavItem to="/service/events/$id/scoreboard" params={{ id }}>
          Scoreboard
        </RouterNavItem>
        <RouterNavItem to="/service/events/$id/trend" params={{ id }}>
          Trend
        </RouterNavItem>
      </UnderlineNav>
      <Outlet />
    </div>
  );
}

export type RouterNavItemProps = {
  to: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  params?: Record<string, any>;
  children: React.ReactNode;
};

export function RouterNavItem({ to, params, children }: RouterNavItemProps) {
  const matchRoute = useMatchRoute();
  const isActive = matchRoute({ to, params, fuzzy: false });

  return (
    <Link style={{ textDecoration: "none" }} to={to} params={params}>
      <UnderlineNav.Item aria-current={isActive ? "page" : undefined}>
        {children}
      </UnderlineNav.Item>
    </Link>
  );
}
type RemainingTimerProps = {
  start_at: string;
  end_at: string;
};

const formatTime = (ms: number) => {
  let diffSeconds = Math.floor(ms / 1000);
  const days = Math.floor(diffSeconds / (24 * 3600));
  diffSeconds %= 24 * 3600;
  const hours = Math.floor(diffSeconds / 3600);
  diffSeconds %= 3600;
  const minutes = Math.floor(diffSeconds / 60);
  const seconds = diffSeconds % 60;

  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(" ");
};
export const RemainingTimer = ({ start_at, end_at }: RemainingTimerProps) => {
  const [display, setDisplay] = useState({
    text: "",
    percentage: 0,
  });

  // 时间格式化函数

  useEffect(() => {
    const update = () => {
      const startTime = dayjs(start_at).toDate().getTime();
      const endTime = dayjs(end_at).toDate().getTime();
      const now = new Date().getTime();

      let text = "";
      let percentage = 0;
      const total = endTime - startTime;

      if (now < startTime) {
        // 未开始 → 进度 100%
        text = `Starts in: ${formatTime(startTime - now)}`;
        percentage = 100;
      } else if (now >= startTime && now < endTime) {
        // 进行中 → 剩余时间占总时长百分比
        const remaining = endTime - now;
        text = `Ends in: ${formatTime(remaining)}`;
        percentage = (remaining / total) * 100;
      } else {
        // 已结束 → 进度 0%
        text = "Ended";
        percentage = 0;
      }

      setDisplay({ text, percentage });
    };

    update(); // 初始化
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [start_at, end_at]);

  return (
    <>
      <span
        style={{
          color: "var(--fgColor-muted)",
          font: "var(--text-body-shorthand-medium)",
        }}
        className="text-center"
      >
        {display.text}
      </span>
      <ProgressBar
        animated
        progress={display.percentage}
        aria-label="remaining"
      />
    </>
  );
};
