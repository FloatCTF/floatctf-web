import {
    Link,
    Outlet,
    createFileRoute,
    useMatchRoute,
} from "@tanstack/react-router";
import { UnderlineNav } from "@primer/react";
import { useTitle } from "ahooks";

export const Route = createFileRoute("/service/oob")({
    component: RouteComponent,
});

function RouteComponent() {
    useTitle("OOB | FloatCTF");

    const matchRoute = useMatchRoute();

    return (
        <div className="flex flex-col gap-2">
            <UnderlineNav aria-label="OOB">
                <Link
                    style={{ textDecoration: "none" }}
                    to="/service/oob/tokens"
                    search={{}}
                    params={{}}
                >
                    <UnderlineNav.Item
                        aria-current={
                            matchRoute({
                                to: "/service/oob/tokens",
                                fuzzy: false,
                            })
                                ? "page"
                                : undefined
                        }
                    >
                        Tokens
                    </UnderlineNav.Item>
                </Link>
                <Link
                    style={{ textDecoration: "none" }}
                    to="/service/oob/records"
                    search={{}}
                    params={{}}
                >
                    <UnderlineNav.Item
                        aria-current={
                            matchRoute({
                                to: "/service/oob/records",
                                fuzzy: false,
                            })
                                ? "page"
                                : undefined
                        }
                    >
                        Records
                    </UnderlineNav.Item>
                </Link>
            </UnderlineNav>

            <Outlet />
        </div>
    );
}

export { getOobUrl, tokenSubject } from "./tokens";
