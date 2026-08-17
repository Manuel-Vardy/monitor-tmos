import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  FileStack,
  Search,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  PauseCircle,
  Clock,
  Building2,
  CalendarDays,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { cn } from "@/lib/utils";
import { currency } from "@/lib/mos-data";
import {
  PS_RETAINERS,
  PS_SUMMARY,
  type PSRetainer,
  type RetainerStatus,
} from "@/lib/ps-data";

export const Route = createFileRoute("/_authenticated/retainers")({
  head: () => ({
    meta: [
      { title: "Retainers — Trite Merchant OS" },
      {
        name: "description",
        content: "Manage monthly retainer agreements — track hours used, renewal dates, and fees per client.",
      },
    ],
  }),
  component: RetainersPage,
});

const STATUS_CONFIG: Record<RetainerStatus, { icon: React.ElementType; pill: string; border: string }> = {
  Active: {
    icon: CheckCircle2,
    pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  "Pending Renewal": {
    icon: RefreshCw,
    pill: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
    border: "border-amber-300 dark:border-amber-700",
  },
  Paused: {
    icon: PauseCircle,
    pill: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    border: "border-border",
  },
  Expired: {
    icon: AlertCircle,
    pill: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800",
  },
};

const FILTER_TABS: { label: string; value: RetainerStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "Active" },
  { label: "Pending Renewal", value: "Pending Renewal" },
  { label: "Paused", value: "Paused" },
  { label: "Expired", value: "Expired" },
];

function RetainerCard({ retainer }: { retainer: PSRetainer }) {
  const cfg = STATUS_CONFIG[retainer.status];
  const pct = Math.min(100, (retainer.hoursUsed / retainer.hoursIncluded) * 100);
  const isOverused = retainer.hoursUsed >= retainer.hoursIncluded;
  const StatusIcon = cfg.icon;

  return (
    <div className={cn("rounded-xl border bg-card p-5 flex flex-col gap-4", cfg.border)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{retainer.clientName}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{retainer.service}</p>
        </div>
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium shrink-0", cfg.pill)}>
          <StatusIcon className="size-3" />
          {retainer.status}
        </span>
      </div>

      {/* Hours bar */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Hours used</span>
          <span className={cn("font-semibold", isOverused ? "text-rose-600 dark:text-rose-400" : "text-foreground")}>
            {retainer.hoursUsed}h / {retainer.hoursIncluded}h
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", isOverused ? "bg-rose-500" : pct >= 80 ? "bg-amber-500" : "bg-blue-500")}
            style={{ width: `${pct}%` }}
          />
        </div>
        {isOverused && (
          <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
            {retainer.hoursUsed - retainer.hoursIncluded}h over — overage billing applies
          </p>
        )}
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-[11px] text-muted-foreground mb-0.5">Monthly Fee</p>
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{currency(retainer.monthlyFee)}</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-[11px] text-muted-foreground mb-0.5">Annual Value</p>
          <p className="text-sm font-bold">{currency(retainer.monthlyFee * 12)}</p>
        </div>
      </div>

      {/* Dates */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <CalendarDays className="size-3.5" />
          <span>Started {retainer.startDate}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <RefreshCw className="size-3.5" />
          <span>Renews {retainer.renewalDate}</span>
        </div>
      </div>

      {/* Contact */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-t border-border pt-3">
        <Building2 className="size-3.5 shrink-0" />
        <span>{retainer.contactPerson}</span>
      </div>

      {/* Notes */}
      <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-border pt-3">
        {retainer.notes}
      </p>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {retainer.status === "Pending Renewal" ? (
          <>
            <button className="flex-1 rounded-lg bg-blue-600 text-white text-xs py-2 font-medium hover:bg-blue-700 transition-colors">
              Renew Retainer
            </button>
            <button className="rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted transition-colors">
              Negotiate
            </button>
          </>
        ) : retainer.status === "Paused" ? (
          <button className="flex-1 rounded-lg border border-border text-xs py-2 font-medium hover:bg-muted transition-colors">
            Resume Retainer
          </button>
        ) : (
          <button className="flex-1 rounded-lg border border-border text-xs py-2 font-medium hover:bg-muted transition-colors">
            View Details
          </button>
        )}
      </div>
    </div>
  );
}

function RetainersPage() {
  const [statusFilter, setStatusFilter] = useState<RetainerStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filtered = PS_RETAINERS.filter((r) => {
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesSearch =
      search === "" ||
      r.clientName.toLowerCase().includes(search.toLowerCase()) ||
      r.service.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalMonthlyValue = PS_RETAINERS.filter((r) => r.status === "Active").reduce((a, r) => a + r.monthlyFee, 0);
  const pendingRenewal = PS_RETAINERS.filter((r) => r.status === "Pending Renewal").length;
  const totalHoursCommitted = PS_RETAINERS.filter((r) => r.status === "Active").reduce((a, r) => a + r.hoursIncluded, 0);
  const totalHoursUsed = PS_RETAINERS.filter((r) => r.status === "Active").reduce((a, r) => a + r.hoursUsed, 0);

  return (
    <AppShell
      title="Retainers"
      subtitle="Monthly retainer agreements — hours, fees, and renewal tracking"
      actions={
        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" /> New Retainer
          </Button>
        </div>
      }
    >
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        {[
          { label: "Active Retainers", value: PS_SUMMARY.activeRetainers, icon: FileStack, color: "text-blue-600" },
          { label: "Monthly Revenue", value: currency(totalMonthlyValue), icon: CheckCircle2, color: "text-emerald-600" },
          { label: "Pending Renewal", value: pendingRenewal, icon: RefreshCw, color: "text-amber-600" },
          { label: "Hours Utilisation", value: `${totalHoursUsed}h / ${totalHoursCommitted}h`, icon: Clock, color: "text-purple-600" },
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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Search retainers…"
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

      {/* Cards grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((retainer) => (
            <RetainerCard key={retainer.id} retainer={retainer} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card py-16 text-center">
          <FileStack className="size-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No retainers found</p>
        </div>
      )}
    </AppShell>
  );
}
