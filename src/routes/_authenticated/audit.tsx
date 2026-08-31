import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { Search, Download, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { auditLog, schoolAuditLog } from "@/lib/mos-data";
import { useInstitution } from "@/hooks/use-institution";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/audit")({
  head: () => ({
    meta: [
      { title: "Audit trail — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Immutable, timestamped log of every fee payment, enrolment, permission change and system event, filterable and exportable.",
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

const RETAIL_TYPES = ["all", "payment", "stock", "refund", "settlement", "permission"];
const SCHOOL_TYPES  = ["all", "payment", "registration", "fee-edit", "waiver", "refund", "settlement", "permission"];

/* Badge tone per event type */
function typeTone(type: string): "good" | "bad" | "warn" | "neutral" {
  if (type === "refund")     return "bad";
  if (type === "permission") return "warn";
  if (type === "waiver")     return "warn";
  if (type === "payment")    return "good";
  return "neutral";
}

/* Human-readable label for school event type pills */
const SCHOOL_TYPE_LABELS: Record<string, string> = {
  all:            "All",
  payment:        "Fee Payment",
  registration:   "Registration",
  "fee-edit":     "Fee Edit",
  waiver:         "Waiver",
  refund:         "Reversal",
  settlement:     "Settlement",
  permission:     "Permission",
};

function Audit() {
  const { institutionType } = useInstitution();
  const isSchool = institutionType === "school";

  const activeLog   = isSchool ? schoolAuditLog : auditLog;
  const activeTypes = isSchool ? SCHOOL_TYPES : RETAIL_TYPES;

  const [type, setType] = useState("all");
  const [q, setQ] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const rows = useMemo(
    () =>
      activeLog.filter(
        (r) =>
          (type === "all" || r.type === type) &&
          (r.who + r.action + r.target + r.branch)
            .toLowerCase()
            .includes(q.toLowerCase()),
      ),
    [activeLog, type, q],
  );

  const subtitle = isSchool
    ? "Tamper-evident log · Academic Year 2024/25, 1,204 events retained"
    : "Tamper-evident log · 24 Jul, 18,402 events retained";

  const pillColors = [
    "border-emerald-600 bg-emerald-600 text-white",
    "border-blue-600 bg-blue-600 text-white",
    "border-purple-600 bg-purple-600 text-white",
    "border-amber-600 bg-amber-600 text-white",
    "border-teal-600 bg-teal-600 text-white",
    "border-rose-600 bg-rose-600 text-white",
    "border-indigo-600 bg-indigo-600 text-white",
    "border-orange-600 bg-orange-600 text-white",
  ];

  return (
    <AppShell
      title="Audit trail"
      subtitle={subtitle}
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

        <section className="rounded-xl border border-border bg-card shadow-xs">
          <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
            <div className="relative min-w-48 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={
                  isSchool
                    ? "Search staff, student ID, receipt, action…"
                    : "Search staff, action, reference"
                }
                className="h-9 w-full rounded-md border border-border bg-background pr-3 pl-9 text-sm outline-none focus:border-ring"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeTypes.map((t, i) => {
                const activeColor = pillColors[i % pillColors.length]!;
                const label = isSchool ? (SCHOOL_TYPE_LABELS[t] ?? t) : t;
                return (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors shadow-xs",
                      type === t ? activeColor : "border-border hover:bg-secondary text-foreground",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
              <DateRangePicker value={dateRange} onChange={setDateRange} />
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-light pb-2">
            <table className="w-full text-sm text-left min-w-[900px]">
              <thead>
                <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase bg-secondary/30">
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">When</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Who</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Role</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">
                    {isSchool ? "Action / Event" : "What"}
                  </th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">
                    {isSchool ? "Receipt / Ref" : "Target"}
                  </th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">
                    {isSchool ? "Campus / Location" : "Where"}
                  </th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.time + r.target} className="transition-colors hover:bg-secondary/60">
                    <td className="num px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {isSchool ? "30 Aug" : "24 Jul"} {r.time}
                    </td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{r.who}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.role}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{r.action}</td>
                    <td className="num px-4 py-3 text-muted-foreground whitespace-nowrap font-mono text-xs">{r.target}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.branch}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge tone={typeTone(r.type)}>
                        {isSchool ? (SCHOOL_TYPE_LABELS[r.type] ?? r.type) : r.type}
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
