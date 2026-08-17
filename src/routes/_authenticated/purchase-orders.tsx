import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  PackageSearch,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  XCircle,
  Building2,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { cn } from "@/lib/utils";
import { currency } from "@/lib/mos-data";
import {
  PURCHASE_ORDERS,
  MFG_SUMMARY,
  type PurchaseOrder,
  type POStatus,
} from "@/lib/manufacturer-data";

export const Route = createFileRoute("/_authenticated/purchase-orders")({
  head: () => ({
    meta: [
      { title: "Purchase Orders — Trite Merchant OS" },
      {
        name: "description",
        content: "Manage supplier procurement orders, delivery schedules, and raw material receipts.",
      },
    ],
  }),
  component: PurchaseOrdersPage,
});

const STATUS_CONFIG: Record<POStatus, { icon: React.ElementType; pill: string }> = {
  Pending:   { icon: Clock,        pill: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400" },
  Approved:  { icon: CheckCircle2, pill: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400" },
  Received:  { icon: Truck,        pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" },
  Partial:   { icon: AlertCircle,  pill: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400" },
  Cancelled: { icon: XCircle,      pill: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
};

const FILTER_TABS: { label: string; value: POStatus | "all" }[] = [
  { label: "All Orders", value: "all" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Partial", value: "Partial" },
  { label: "Received", value: "Received" },
];

function PurchaseOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<POStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filtered = PURCHASE_ORDERS.filter((po) => {
    const matchStatus = statusFilter === "all" || po.status === statusFilter;
    const matchSearch =
      search === "" ||
      po.id.toLowerCase().includes(search.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      po.materialName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <AppShell
      title="Purchase Orders"
      subtitle="Supplier procurement, material requisitions, and delivery tracking"
      actions={
        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" /> Create Purchase Order
          </Button>
        </div>
      }
    >
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        {[
          { label: "Pending Orders", value: MFG_SUMMARY.pendingPOs, icon: Clock, color: "text-amber-600" },
          { label: "Pending PO Value", value: currency(MFG_SUMMARY.pendingPOValue), icon: PackageSearch, color: "text-blue-600" },
          { label: "Received Recently", value: PURCHASE_ORDERS.filter((p) => p.status === "Received").length, icon: Truck, color: "text-emerald-600" },
          { label: "Total POs Logged", value: PURCHASE_ORDERS.length, icon: Building2, color: "text-purple-600" },
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
            placeholder="Search PO#, supplier, material…"
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

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">PO Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Material</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Quantity</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Total Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Expected Delivery</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((po) => {
                const cfg = STATUS_CONFIG[po.status];
                return (
                  <tr key={po.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{po.id}</td>
                    <td className="px-4 py-3 font-medium">{po.supplierName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{po.materialName}</td>
                    <td className="px-4 py-3 text-right font-semibold">{po.quantity.toLocaleString()} {po.unit}</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-600 dark:text-blue-400">{currency(po.totalValue)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{po.expectedDelivery}</td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium inline-flex items-center gap-1", cfg.pill)}>
                        <cfg.icon className="size-3" />
                        {po.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No purchase orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
