import { eventAdminApi } from "@/api/admin";
import { RouterNavItem } from "@/routes/service/events/$id/route";
import { UnderlineNav } from "@primer/react";
import { useQuery } from "@tanstack/react-query";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import type { Challenge } from "../../challenges";

export const Route = createFileRoute("/admin/events/$id")({
  component: RouteComponent,
});
export type EventChallenge = {
  event_id: string;
  challenge_id: string;
  hidden: boolean;
};

export type EventChallengeResult = {
  id: string;
  event_challenge: EventChallenge;
  challenge: Challenge;
};
function RouteComponent() {
  const { id } = Route.useParams();

  const { data: event_data } = useQuery({
    queryKey: ["event", id],
    queryFn: () => eventAdminApi.get(id),
  });
  const event = event_data?.data;
  return (
    <div>
      <h3>
        {event?.title} #{event?.id}
      </h3>
      <UnderlineNav aria-label="Repository">
        <RouterNavItem to="/admin/events/$id" params={{ id }}>
          Challenges
        </RouterNavItem>
        <RouterNavItem to="/admin/events/$id/users" params={{ id }}>
          Users
        </RouterNavItem>
        {event?.type === "JeopardyTeam" && (
          // {/* banned the user or teams */}
          <RouterNavItem to="/service/events/$id/instances" params={{ id }}>
            Teams
          </RouterNavItem>
        )}
        <RouterNavItem to="/admin/events/$id/announcements" params={{ id }}>
          Announcements
        </RouterNavItem>
        <RouterNavItem to="/admin/events/$id/writeups" params={{ id }}>
          WriteUps
        </RouterNavItem>
        <RouterNavItem to="/service/events/$id/scoreboard" params={{ id }}>
          Logs
        </RouterNavItem>
      </UnderlineNav>
      <Outlet />
    </div>
  );
}
