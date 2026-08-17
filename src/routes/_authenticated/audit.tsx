import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Search, Download, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { auditLog } from "@/lib/mos-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/audit")({
  head: () => ({
    meta: [
      { title: "Audit trail — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Immutable, timestamped log of every stock change, price edit, payment, refund and permission change, filterable and exportable.",
      },
      { property: "og:title", content: "Audit trail — Trite Merchant OS" },
      {
        property: "og:description",
        content: "Who did what, when and where — tamper-evident and regulator-ready.",
      },
    ],
  }),
  component: Audit,
});

const types = ["all", "payment", "stock", "refund", "settlement", "permission"];

function Audit() {
  const [type, setType] = useState("all");
  const [q, setQ] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const rows = auditLog.filter(
    (r) =>
      (type === "all" || r.type === type) &&
      (r.who + r.action + r.target + r.branch).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AppShell
      title="Audit trail"
      subtitle="Tamper-evident log · 24 Jul, 18,402 events retained"
      actions={
        <Button variant="outline" size="sm">
          <Download className="size-4" /> Export report
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border border-accent bg-accent/15 px-4 py-3 text-sm">
          <ShieldCheck className="size-4 shrink-0" />
          <p>
            <span className="font-medium">Read-only and append-only.</span> Entries cannot be edited
            or deleted by any role, including the owner.
          </p>
        </div>

        <section className="rounded-lg border border-border bg-card">
          <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
            <div className="relative min-w-48 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search staff, action, reference"
                className="h-9 w-full rounded-md border border-border bg-background pr-3 pl-9 text-sm outline-none focus:border-ring"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {types.map((t, i) => {
                const colors = [
                  "border-emerald-600 bg-emerald-600 text-white",
                  "border-blue-600 bg-blue-600 text-white",
                  "border-purple-600 bg-purple-600 text-white",
                  "border-amber-600 bg-amber-600 text-white",
                  "border-teal-600 bg-teal-600 text-white",
                ];
                const activeColor = colors[i % colors.length];
                return (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors shadow-xs",
                      type === t ? activeColor : "border-border hover:bg-secondary text-foreground",
                    )}
                  >
                    {t}
                  </button>
                );
              })}
              <DateRangePicker value={dateRange} onChange={setDateRange} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="px-4 py-2.5 font-medium">When</th>
                  <th className="px-4 py-2.5 font-medium">Who</th>
                  <th className="px-4 py-2.5 font-medium">Role</th>
                  <th className="px-4 py-2.5 font-medium">What</th>
                  <th className="px-4 py-2.5 font-medium">Target</th>
                  <th className="px-4 py-2.5 font-medium">Where</th>
                  <th className="px-4 py-2.5 font-medium">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.time + r.target} className="transition-colors hover:bg-secondary/60">
                    <td className="num px-4 py-3 text-muted-foreground">24 Jul {r.time}</td>
                    <td className="px-4 py-3 font-medium">{r.who}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.role}</td>
                    <td className="px-4 py-3">{r.action}</td>
                    <td className="num px-4 py-3 text-muted-foreground">{r.target}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.branch}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        tone={
                          r.type === "refund" ? "bad" : r.type === "permission" ? "warn" : "neutral"
                        }
                      >
                        {r.type}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length === 0 && (
            <p className="p-12 text-center text-sm text-muted-foreground">
              No events match these filters.
            </p>
          )}
        </section>
      </div>
    </AppShell>
  );
}
