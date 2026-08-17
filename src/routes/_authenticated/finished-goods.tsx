import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Package,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Warehouse,
  Tag,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { cn } from "@/lib/utils";
import { currency } from "@/lib/mos-data";
import {
  FINISHED_GOODS,
  MFG_SUMMARY,
  type FinishedGood,
  type FinishedGoodStatus,
} from "@/lib/manufacturer-data";

export const Route = createFileRoute("/_authenticated/finished-goods")({
  component: FinishedGoodsPage,
});

const STATUS_CONFIG: Record<FinishedGoodStatus, { icon: React.ElementType; pill: string }> = {
  Available: { icon: CheckCircle2,  pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" },
  Reserved:  { icon: Tag,           pill: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400" },
  "Low Stock": { icon: AlertTriangle, pill: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400" },
  Shipped:   { icon: Warehouse,     pill: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
};

const FILTER_TABS: { label: string; value: FinishedGoodStatus | "all" }[] = [
  { label: "All Goods", value: "all" },
  { label: "Available", value: "Available" },
  { label: "Reserved", value: "Reserved" },
  { label: "Low Stock", value: "Low Stock" },
];

function FinishedGoodsPage() {
  const [statusFilter, setStatusFilter] = useState<FinishedGoodStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filtered = FINISHED_GOODS.filter((g) => {
    const matchStatus = statusFilter === "all" || g.status === statusFilter;
    const matchSearch =
      search === "" ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.category.toLowerCase().includes(search.toLowerCase()) ||
      g.batchId.toLowerCase().includes(search.toLowerCase()) ||
      g.warehouseLocation.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <AppShell
      title="Finished Goods"
      subtitle="Manufactured inventory stock, warehouse bays, and margin tracking"
      actions={
        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" /> Add Finished Product
          </Button>
        </div>
      }
    >
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        {[
          { label: "Inventory Value", value: currency(MFG_SUMMARY.finishedGoodsValue), icon: Package, color: "text-blue-600" },
          { label: "Available SKUs", value: FINISHED_GOODS.filter((g) => g.status === "Available").length, icon: CheckCircle2, color: "text-emerald-600" },
          { label: "Reserved Units", value: FINISHED_GOODS.reduce((a, g) => a + g.quantityReserved, 0), icon: Tag, color: "text-purple-600" },
          { label: "Low Stock Alerts", value: FINISHED_GOODS.filter((g) => g.status === "Low Stock").length, icon: AlertTriangle, color: "text-rose-600" },
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
            placeholder="Search product, category, bay…"
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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((good) => {
          const cfg = STATUS_CONFIG[good.status];
          const margin = good.sellingPrice > 0 && good.unitCost > 0
            ? Math.round(((good.sellingPrice - good.unitCost) / good.sellingPrice) * 100)
            : 0;

          return (
            <div key={good.id} className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-medium text-muted-foreground">{good.id} · Batch {good.batchId}</span>
                  <h3 className="font-semibold text-base mt-0.5">{good.name}</h3>
                  <p className="text-xs text-muted-foreground">{good.category}</p>
                </div>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium flex items-center gap-1", cfg.pill)}>
                  <cfg.icon className="size-3" />
                  {good.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Available Stock</p>
                  <p className="text-lg font-bold">{good.quantityAvailable.toLocaleString()} {good.unit}</p>
                  {good.quantityReserved > 0 && (
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">{good.quantityReserved} {good.unit} reserved</p>
                  )}
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Unit Price & Margin</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{currency(good.sellingPrice)}</p>
                  {margin > 0 && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">Cost: {currency(good.unitCost)} ({margin}% margin)</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                <span className="flex items-center gap-1">
                  <Warehouse className="size-3.5" /> Location: <strong>{good.warehouseLocation}</strong>
                </span>
                <span>Mfg: {good.manufacturedDate}</span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-border bg-card py-16 text-center text-muted-foreground text-sm">
            No finished goods found
          </div>
        )}
      </div>
    </AppShell>
  );
}
