import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

const SESSION_KEY = "tmos_session_v1";

function readSession(): {
  isAuthenticated?: boolean;
  onboardingComplete?: boolean;
  accountId?: string;
  institutionType?: string;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed?.['version'] !== 1) return null;
    return parsed as {
      isAuthenticated?: boolean;
      onboardingComplete?: boolean;
      accountId?: string;
      institutionType?: string;
    };
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location }) => {
    const session = readSession();

    // Not authenticated — redirect to /login preserving the requested path
    if (!session?.accountId) {
      throw redirect({
        to: "/login",
        search: { redirect: location.pathname },
      });
    }
  },
  component: () => <Outlet />,
});
