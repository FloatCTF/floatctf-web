import { eventServiceApi } from "@/api/service";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/service/events/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => eventServiceApi.get(id),
  });
  const event = data?.data;
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{event?.event.title}</h2>
    </div>
  );
}
