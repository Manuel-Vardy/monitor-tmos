import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Clock,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  Timer,
  TrendingUp,
  User,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { cn } from "@/lib/utils";
import { currency } from "@/lib/mos-data";
import {
  PS_TIME_ENTRIES,
  PS_SUMMARY,
  type TimeEntry,
  type TimeEntryStatus,
} from "@/lib/ps-data";

export const Route = createFileRoute("/_authenticated/time-tracking")({
  head: () => ({
    meta: [
      { title: "Time Tracking — Trite Merchant OS" },
      {
        name: "description",
        content: "Log and review billable hours across client projects — approve timesheets and generate billing summaries.",
      },
    ],
  }),
  component: TimeTrackingPage,
});

const STATUS_CONFIG: Record<TimeEntryStatus, { icon: React.ElementType; pill: string }> = {
  Approved: {
    icon: CheckCircle2,
    pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
  },
  Pending: {
    icon: AlertCircle,
    pill: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
  },
  Invoiced: {
    icon: FileText,
    pill: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400",
  },
};

const FILTER_TABS: { label: string; value: TimeEntryStatus | "all" }[] = [
  { label: "All Entries", value: "all" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Invoiced", value: "Invoiced" },
];

function TimeTrackingPage() {
  const [statusFilter, setStatusFilter] = useState<TimeEntryStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filtered = PS_TIME_ENTRIES.filter((e) => {
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    const matchesSearch =
      search === "" ||
      e.staffName.toLowerCase().includes(search.toLowerCase()) ||
      e.projectName.toLowerCase().includes(search.toLowerCase()) ||
      e.clientName.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalHours = filtered.reduce((a, e) => a + e.hours, 0);
  const billableHours = filtered.filter((e) => e.billable).reduce((a, e) => a + e.hours, 0);
  const billableValue = filtered.filter((e) => e.billable).reduce((a, e) => a + e.hours * e.hourlyRate, 0);
  const pendingCount = filtered.filter((e) => e.status === "Pending").length;

  // Group by staff
  const staffSummary = filtered.reduce<Record<string, { hours: number; entries: number; value: number }>>((acc, e) => {
    const curr = acc[e.staffName] ?? { hours: 0, entries: 0, value: 0 };
    acc[e.staffName] = {
      hours: curr.hours + e.hours,
      entries: curr.entries + 1,
      value: curr.value + (e.billable ? e.hours * e.hourlyRate : 0),
    };
    return acc;
  }, {});

  return (
    <AppShell
      title="Time Tracking"
      subtitle="Billable hours log across all client projects"
      actions={
        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" /> Log Hours
          </Button>
        </div>
      }
    >
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        {[
          { label: "Total Hours", value: `${totalHours.toFixed(1)}h`, icon: Clock, color: "text-blue-600" },
          { label: "Billable Hours", value: `${billableHours.toFixed(1)}h`, icon: Timer, color: "text-emerald-600" },
          { label: "Billable Value", value: currency(billableValue), icon: TrendingUp, color: "text-purple-600" },
          { label: "Pending Approval", value: pendingCount, icon: AlertCircle, color: "text-amber-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <kpi.icon className={cn("size-4", kpi.color)} />
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
            </div>
            <p className="text-xl font-bold tracking-tight">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Time entries table */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Search entries…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    statusFilter === tab.value
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:bg-muted/80",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Staff / Project</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Hours</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Value</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((entry) => {
                    const cfg = STATUS_CONFIG[entry.status];
                    return (
                      <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium">{entry.staffName}</p>
                          <p className="text-xs text-muted-foreground">{entry.projectName}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{entry.clientName}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{entry.date}</td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {entry.hours}h
                          {!entry.billable && (
                            <span className="ml-1 text-[10px] text-muted-foreground font-normal">(non-bill)</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          {entry.billable ? (
                            <span className="font-medium">{currency(entry.hours * entry.hourlyRate)}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", cfg.pill)}>
                            {entry.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-sm">
                        No time entries found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Staff breakdown sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="size-4 text-muted-foreground" />
              <p className="text-sm font-semibold">Staff Breakdown</p>
            </div>
            <div className="space-y-3">
              {Object.entries(staffSummary)
                .sort((a, b) => b[1].hours - a[1].hours)
                .map(([name, data]) => (
                  <div key={name}>
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-medium">{name}</p>
                      <p className="text-xs text-muted-foreground">{data.hours}h</p>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-1">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${(data.hours / totalHours) * 100}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">{data.entries} entries · {currency(data.value)} billed</p>
                  </div>
                ))}
            </div>
          </div>

          {/* Description preview for pending entries */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pending Approval</p>
            <div className="space-y-3">
              {PS_TIME_ENTRIES.filter((e) => e.status === "Pending").map((entry) => (
                <div key={entry.id} className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-3">
                  <p className="text-sm font-medium">{entry.staffName}</p>
                  <p className="text-xs text-muted-foreground">{entry.projectName} · {entry.hours}h</p>
                  <p className="text-xs text-muted-foreground mt-1 italic">{entry.description}</p>
                  <div className="flex gap-2 mt-2">
                    <button className="flex-1 rounded-md bg-emerald-600 text-white text-xs py-1 font-medium hover:bg-emerald-700 transition-colors">
                      Approve
                    </button>
                    <button className="flex-1 rounded-md border border-border text-xs py-1 font-medium hover:bg-muted transition-colors">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              {PS_TIME_ENTRIES.filter((e) => e.status === "Pending").length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">All entries approved</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
