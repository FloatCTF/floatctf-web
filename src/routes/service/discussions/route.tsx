import { UnderlineNav } from "@primer/react";
import { Outlet, createFileRoute } from "@tanstack/react-router";

import { RouterNavItem } from "@/routes/service/events/jeopardy.$id/route";

export const Route = createFileRoute("/service/discussions")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div>
            <UnderlineNav aria-label="Discussions">
                <RouterNavItem to="/service/discussions">All</RouterNavItem>
                <RouterNavItem to="/service/discussions/my">
                    My Discussions
                </RouterNavItem>
            </UnderlineNav>
            <Outlet />
        </div>
    );
}
