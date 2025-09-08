import { createFileRoute } from "@tanstack/react-router";
import { ServiceRouteGuard } from "./route";

export const Route = createFileRoute("/service/")({
  component: RouteComponent,
  loader: ServiceRouteGuard,
});

function RouteComponent() {
  return <div>Hello "/service/"!</div>;
}
