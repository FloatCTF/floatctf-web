import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/docker/networks")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/docker/networks"!</div>;
}
