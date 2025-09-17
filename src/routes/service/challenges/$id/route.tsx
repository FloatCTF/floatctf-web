import { UnderlineNav } from "@primer/react";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { ServiceRouteGuard } from "../../route";

export const Route = createFileRoute("/service/challenges/$id")({
  component: RouteComponent,
  loader: ServiceRouteGuard,
});

function RouteComponent() {
  // const { id } = Route.useParams();
  return (
    <div className="flex h-full w-full flex-col">
      <UnderlineNav aria-label="Repository">
        <UnderlineNav.Item href="" aria-current="page">
          Challenge
        </UnderlineNav.Item>
        <UnderlineNav.Item href="#">WP</UnderlineNav.Item>
      </UnderlineNav>

      <div className="flex h-full w-full">
        <div id="info" className="flex flex-col  p-2 my-2  flex-1">
          <Outlet />
        </div>
        <div id="challenge-wp" className="flex-1">
          WP
        </div>
      </div>
    </div>
  );
}
