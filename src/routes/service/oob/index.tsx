import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/service/oob/")({
  loader: () => redirect({ to: "/service/oob/tokens" }),
});
