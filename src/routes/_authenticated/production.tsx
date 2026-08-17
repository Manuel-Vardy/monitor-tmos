import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Factory,
  Search,
  Plus,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  TrendingUp,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { cn } from "@/lib/utils";
import {
  PRODUCTION_BATCHES,
  MFG_SUMMARY,
  type ProductionBatch,
  type ProductionStatus,
} from "@/lib/manufacturer-data";

export const Route = createFileRoute("/_authenticated/production")({
  head: () => ({
    meta: [
      { title: "Production Batches — Trite Merchant OS" },
      {
        name: "description",
        content: "Track production batch progress, raw material inputs, assembly lines, and output yields.",
      },
    ],
  }),
  component: ProductionPage,
});

const STATUS_CONFIG: Record<ProductionStatus, { icon: React.ElementType; pill: string; color: string }> = {
  "In Progress":   { icon: PlayCircle,   pill: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400",       color: "bg-blue-500" },
  "Quality Check": { icon: Clock,        pill: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400", color: "bg-purple-500" },
  Completed:       { icon: CheckCircle2, pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400", color: "bg-emerald-500" },
  "On Hold":       { icon: AlertCircle,  pill: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400",       color: "bg-rose-500" },
  Scheduled:       { icon: Clock,        pill: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",       color: "bg-slate-500" },
};

const FILTER_TABS: { label: string; value: ProductionStatus | "all" }[] = [
  { label: "All Batches", value: "all" },
  { label: "In Progress", value: "In Progress" },
  { label: "Quality Check", value: "Quality Check" },
  { label: "On Hold", value: "On Hold" },
  { label: "Completed", value: "Completed" },
];

function ProductionPage() {
  const [statusFilter, setStatusFilter] = useState<ProductionStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filtered = PRODUCTION_BATCHES.filter((b) => {
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const matchSearch =
      search === "" ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.productName.toLowerCase().includes(search.toLowerCase()) ||
      b.assignedLine.toLowerCase().includes(search.toLowerCase()) ||
      b.supervisor.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <AppShell
      title="Production"
      subtitle="Batch execution, line assignments, and output tracking"
      actions={
        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" /> Start New Batch
          </Button>
        </div>
      }
    >
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        {[
          { label: "Open Batches", value: MFG_SUMMARY.openBatches, icon: Factory, color: "text-blue-600" },
          { label: "Quality Check", value: PRODUCTION_BATCHES.filter((b) => b.status === "Quality Check").length, icon: Clock, color: "text-purple-600" },
          { label: "On Hold", value: PRODUCTION_BATCHES.filter((b) => b.status === "On Hold").length, icon: AlertCircle, color: "text-rose-600" },
          { label: "Completed Recently", value: PRODUCTION_BATCHES.filter((b) => b.status === "Completed").length, icon: CheckCircle2, color: "text-emerald-600" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <k.icon className={cn("size-4", k.color)} />
              <span className="text-xs text-muted-foreground">{k.label}</span>
            </div>
            <p className="text-xl font-bold tracking-tight">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Search batch ID, product, line…"
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
                statusFilter === tab.value ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Batch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((batch) => {
          const cfg = STATUS_CONFIG[batch.status];
          return (
            <div key={batch.id} className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground">
                      {batch.id}
                    </span>
                    <span className="text-xs text-muted-foreground">{batch.assignedLine}</span>
                  </div>
                  <h3 className="font-semibold text-base mt-1">{batch.productName}</h3>
                </div>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium flex items-center gap-1", cfg.pill)}>
                  <cfg.icon className="size-3" />
                  {batch.status}
                </span>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Completion Progress</span>
                  <span className="font-semibold">{batch.progressPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", cfg.color)}
                    style={{ width: `${batch.progressPct}%` }}
                  />
                </div>
              </div>

              {/* Input materials */}
              <div className="rounded-lg bg-muted/40 p-3 space-y-1.5 text-xs">
                <p className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Raw Material Inputs</p>
                <div className="flex flex-wrap gap-2">
                  {batch.inputMaterials.map((mat) => (
                    <span key={mat.materialId} className="rounded border border-border bg-background px-2 py-1">
                      {mat.materialName}: <strong>{mat.quantity} {mat.unit}</strong>
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="size-3.5" />
                  <span>Sup: {batch.supervisor}</span>
                </div>
                <div>
                  <span>Target: <strong>{batch.targetQuantity} {batch.outputUnit}</strong></span>
                  {batch.outputQuantity > 0 && (
                    <span className="ml-2 text-emerald-600 dark:text-emerald-400">({batch.outputQuantity} {batch.outputUnit} ready)</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-border bg-card py-16 text-center text-muted-foreground text-sm">
            No production batches found
          </div>
        )}
      </div>
    </AppShell>
  );
}
