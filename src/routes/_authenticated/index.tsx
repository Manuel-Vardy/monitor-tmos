import { createFileRoute } from "@tanstack/react-router";

import { DashboardRenderer } from "@/lib/dashboard-registry";
import { useInstitution } from "@/hooks/use-institution";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Trite Merchant OS — Dashboard" },
      {
        name: "description",
        content:
          "Organisation-wide revenue, branch comparison, payment mix and stock alerts for African merchants, settled by Trite.",
      },
      { property: "og:title", content: "Trite Merchant OS — Dashboard" },
      {
        property: "og:description",
        content: "Sell, stock, invoice, reconcile and get paid from one merchant dashboard.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { institutionType } = useInstitution();
  return <DashboardRenderer institutionType={institutionType} />;
}
