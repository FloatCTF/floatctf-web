import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/docker/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/docker/containers"!</div>;
}
