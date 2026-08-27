import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/donations")({
  component: () => <Navigate to="/members" replace />,
});
