import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/service/events/$id/instances")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/service/events/$id/instances"!</div>;
}
