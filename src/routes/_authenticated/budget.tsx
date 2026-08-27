import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/budget")({
  component: () => <Navigate to="/members" replace />,
});
