import { eventAdminApi, eventChallengeAdminApi } from "@/api/admin";
import { GenericTable } from "@/components/admin/Table";
import { UnderlinePanels } from "@primer/react/experimental";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import type { Challenge } from "../challenges";
dayjs.extend(utc);

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

  const { data: event_data, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => eventAdminApi.get(id),
  });
  const event = event_data?.data;

  function ChallengeManager() {
    return <>TODO</>;
  }

  function EventUserManager() {
    return <div>EventUserManager</div>;
  }
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="w-full h-full flex flex-col">
      <h3>
        {event?.title} #{event?.id}
      </h3>

      <UnderlinePanels aria-label="Select a tab">
        <UnderlinePanels.Tab>Challenges</UnderlinePanels.Tab>
        <UnderlinePanels.Tab>Users</UnderlinePanels.Tab>
        <UnderlinePanels.Panel>
          <div className="p-2">
            <ChallengeManager />
          </div>
        </UnderlinePanels.Panel>
        <UnderlinePanels.Panel>
          <EventUserManager />
        </UnderlinePanels.Panel>
      </UnderlinePanels>
    </div>
  );
}
