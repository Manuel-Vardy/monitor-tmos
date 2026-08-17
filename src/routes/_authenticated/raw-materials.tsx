import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Wrench,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShoppingCart,
  TrendingDown,
  Package,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { cn } from "@/lib/utils";
import { currency } from "@/lib/mos-data";
import {
  RAW_MATERIALS,
  PURCHASE_ORDERS,
  MFG_SUMMARY,
  type RawMaterial,
  type RawMaterialStatus,
} from "@/lib/manufacturer-data";

export const Route = createFileRoute("/_authenticated/raw-materials")({
  head: () => ({
    meta: [
      { title: "Raw Materials — Trite Merchant OS" },
      {
        name: "description",
        content: "Track raw material inventory, reorder levels, supplier links, and stock status.",
      },
    ],
  }),
  component: RawMaterialsPage,
});

const STATUS_CONFIG: Record<RawMaterialStatus, { icon: React.ElementType; pill: string }> = {
  "In Stock":     { icon: CheckCircle2,  pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" },
  "Low Stock":    { icon: AlertTriangle, pill: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400" },
  "Out of Stock": { icon: XCircle,       pill: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400" },
  "On Order":     { icon: ShoppingCart,  pill: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400" },
};

const FILTER_TABS: { label: string; value: RawMaterialStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "In Stock", value: "In Stock" },
  { label: "Low Stock", value: "Low Stock" },
  { label: "Out of Stock", value: "Out of Stock" },
  { label: "On Order", value: "On Order" },
];

function RawMaterialsPage() {
  const [statusFilter, setStatusFilter] = useState<RawMaterialStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filtered = RAW_MATERIALS.filter((m) => {
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    const matchSearch = search === "" ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase()) ||
      m.supplierName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // pending POs for materials low / out
  const criticalMaterialIds = RAW_MATERIALS
    .filter((m) => m.status === "Low Stock" || m.status === "Out of Stock")
    .map((m) => m.id);
  const relatedPOs = PURCHASE_ORDERS.filter(
    (po) => criticalMaterialIds.includes(po.materialId) && po.status !== "Received" && po.status !== "Cancelled"
  );

  return (
    <AppShell
      title="Raw Materials"
      subtitle="Stock levels, reorder alerts, and supplier links"
      actions={
        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" /> Add Material
          </Button>
        </div>
      }
    >
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        {[
          { label: "Total Stock Value", value: currency(MFG_SUMMARY.rawMaterialValue), icon: Package, color: "text-blue-600" },
          { label: "Materials In Stock", value: RAW_MATERIALS.filter((m) => m.status === "In Stock").length, icon: CheckCircle2, color: "text-emerald-600" },
          { label: "Low / Out of Stock", value: MFG_SUMMARY.lowStockMaterials, icon: TrendingDown, color: "text-rose-600" },
          { label: "Pending Orders", value: relatedPOs.length, icon: ShoppingCart, color: "text-amber-600" },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Search materials…"
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
                    statusFilter === tab.value ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Material</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Category</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">In Stock</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Reorder At</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Unit Cost</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Supplier</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((mat) => {
                    const cfg = STATUS_CONFIG[mat.status];
                    const stockPct = mat.reorderLevel > 0 ? Math.min(100, (mat.quantityInStock / (mat.reorderLevel * 4)) * 100) : 0;
                    return (
                      <tr key={mat.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium">{mat.name}</p>
                          <div className="mt-1 h-1 w-24 rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn("h-full rounded-full", stockPct > 50 ? "bg-emerald-500" : stockPct > 20 ? "bg-amber-500" : "bg-rose-500")}
                              style={{ width: `${stockPct}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{mat.category}</td>
                        <td className="px-4 py-3 text-right font-semibold">{mat.quantityInStock.toLocaleString()} {mat.unit}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground text-xs">{mat.reorderLevel} {mat.unit}</td>
                        <td className="px-4 py-3 text-right">{currency(mat.unitCost)}<span className="text-xs text-muted-foreground">/{mat.unit}</span></td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{mat.supplierName}</td>
                        <td className="px-4 py-3">
                          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", cfg.pill)}>
                            {mat.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">No materials found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Critical reorder sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="size-4 text-amber-500" />
              <p className="text-sm font-semibold">Reorder Alerts</p>
            </div>
            <div className="space-y-3">
              {RAW_MATERIALS.filter((m) => m.status === "Low Stock" || m.status === "Out of Stock").map((mat) => {
                const linkedPO = PURCHASE_ORDERS.find((po) => po.materialId === mat.id && po.status !== "Received" && po.status !== "Cancelled");
                return (
                  <div key={mat.id} className={cn("rounded-lg p-3 border", mat.status === "Out of Stock" ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900" : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900")}>
                    <p className="text-sm font-medium">{mat.name}</p>
                    <p className="text-xs text-muted-foreground">{mat.quantityInStock} {mat.unit} remaining · reorder at {mat.reorderLevel}</p>
                    {linkedPO ? (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">PO {linkedPO.id} — {linkedPO.status} · ETA {linkedPO.expectedDelivery}</p>
                    ) : (
                      <button className="mt-1.5 text-xs bg-foreground text-background rounded-md px-2 py-1 hover:opacity-90 transition-opacity">
                        Create Purchase Order
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
