import { Wrench, Factory, PackageSearch, Package } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { KpiCard } from "@/components/kpi-card";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { DateRangePicker } from "@/components/date-range-picker";
import { cn } from "@/lib/utils";
import { currency } from "@/lib/mos-data";
import {
  PRODUCTION_BATCHES,
  MFG_SUMMARY,
  RAW_MATERIALS,
  FINISHED_GOODS,
} from "@/lib/manufacturer-data";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function barColor(pct: number): string {
  if (pct >= 75) return "bg-emerald-500";
  if (pct >= 40) return "bg-amber-500";
  return "bg-rose-500";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ManufacturerDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const openBatches = PRODUCTION_BATCHES.filter((b) => b.status !== "Completed");

  return (
    <AppShell
      title="Manufacturer Dashboard"
      subtitle="Production & procurement overview"
      actions={<DateRangePicker value={dateRange} onChange={setDateRange} />}
    >
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Raw Material Value"
          value={currency(MFG_SUMMARY.rawMaterialValue)}
          sub={`${MFG_SUMMARY.lowStockMaterials} low stock alerts`}
          icon={Wrench}
        />
        <KpiCard
          label="Open Production Batches"
          value={MFG_SUMMARY.openBatches}
          sub="active on lines"
          icon={Factory}
        />
        <KpiCard
          label="Purchase Orders Pending"
          value={MFG_SUMMARY.pendingPOs}
          sub={`${currency(MFG_SUMMARY.pendingPOValue)} total value`}
          icon={PackageSearch}
        />
        <KpiCard
          label="Finished Goods Value"
          value={currency(MFG_SUMMARY.finishedGoodsValue)}
          delta={6.4}
          sub="ready in warehouse"
          icon={Package}
        />
      </div>

      {/* Grid of Widgets */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Production Batches widget */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <Factory className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Active Production Batches</h2>
              <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {openBatches.length} active
              </span>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 border-b border-border px-5 py-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block size-2.5 rounded-sm bg-emerald-500" /> ≥ 75% — On track
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block size-2.5 rounded-sm bg-amber-500" /> 40–74% — In progress
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block size-2.5 rounded-sm bg-rose-500" /> &lt; 40% — Early stage / Hold
              </span>
            </div>

            <ul className="divide-y divide-border">
              {openBatches.map((batch) => (
                <li key={batch.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 mb-2">
                    <div>
                      <span className="font-mono text-xs font-semibold text-foreground mr-2">
                        {batch.id}
                      </span>
                      <span className="text-sm font-medium">{batch.productName}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>Line: <strong className="text-foreground">{batch.assignedLine}</strong></span>
                      <span
                        className={cn(
                          "font-semibold",
                          batch.progressPct >= 75
                            ? "text-emerald-600 dark:text-emerald-400"
                            : batch.progressPct >= 40
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-rose-600 dark:text-rose-400"
                        )}
                      >
                        {batch.progressPct}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full transition-all", barColor(batch.progressPct))}
                      style={{ width: `${batch.progressPct}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Sidebar Low Stock & Warehouse summary */}
        <div className="space-y-4">
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <Wrench className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Raw Material Reorders</h2>
            </div>
            <ul className="divide-y divide-border text-xs">
              {RAW_MATERIALS.filter((m) => m.status === "Low Stock" || m.status === "Out of Stock").map((mat) => (
                <li key={mat.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{mat.name}</p>
                    <p className="text-muted-foreground">{mat.quantityInStock} {mat.unit} remaining</p>
                  </div>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 font-medium",
                    mat.status === "Out of Stock" ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400" : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                  )}>
                    {mat.status}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <Package className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Top Finished SKUs</h2>
            </div>
            <ul className="divide-y divide-border text-xs">
              {FINISHED_GOODS.slice(0, 4).map((good) => (
                <li key={good.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{good.name}</p>
                    <p className="text-muted-foreground">{good.warehouseLocation} · {good.quantityAvailable} {good.unit}</p>
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{currency(good.sellingPrice)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
