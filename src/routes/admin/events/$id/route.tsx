import { eventAdminApi } from "@/api/admin";
import type { Event } from "@/routes/admin/events";
import { RouterNavItem } from "@/routes/service/events/jeopardy.$id/route";
import { Spinner, UnderlineNav } from "@primer/react";
import { useQuery } from "@tanstack/react-query";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { createContext } from "react";
import type { Challenge } from "../../challenges";
export const Route = createFileRoute("/admin/events/$id")({
  component: RouteComponent,
});
export const EventContext = createContext<Event | null>(null);
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

  const {
    data: event_data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["event", id],
    queryFn: () => eventAdminApi.get(id),
  });

  const event = event_data?.data;

  if (isLoading) {
    return <Spinner size="large" />;
  }

  if (isError || !event) {
    return <div>Error loading event</div>;
  }

  return (
    <div>
      <h3>
        {event.title} #{event.id}
      </h3>
      <UnderlineNav aria-label="Repository">
        <RouterNavItem to="/admin/events/$id" params={{ id }}>
          Challenges
        </RouterNavItem>
        {event?.type === "JeopardySingle" && (
          <RouterNavItem to="/admin/events/$id/users" params={{ id }}>
            Users
          </RouterNavItem>
        )}

        {event?.type === "JeopardyTeam" && (
          <RouterNavItem to="/admin/events/$id/teams" params={{ id }}>
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
        <RouterNavItem to="/admin/events/$id/data_present" params={{ id }}>
          Data Present
        </RouterNavItem>
      </UnderlineNav>
      <EventContext.Provider value={event}>
        <Outlet /> {/* 普通 TanStack Router 的 Outlet */}
      </EventContext.Provider>
    </div>
  );
}
