import { createFileRoute } from "@tanstack/react-router";
import { AdminRouteGuard } from "./route";

export const Route = createFileRoute("/admin/dashboard")({
  component: RouteComponent,
  loader: AdminRouteGuard,
});

function RouteComponent() {
  return <div>Hello "/service/admin/dashboard"!</div>;
}
