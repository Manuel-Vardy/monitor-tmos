import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  PackageSearch,
  Plus,
  Search,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  FileText,
} from "lucide-react";

import type { DateRange } from "react-day-picker";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { currency } from "@/lib/mos-data";
import { WHOLESALE_PURCHASE_ORDERS, type WholesalePurchaseOrder } from "@/lib/wholesale-data";

export const Route = createFileRoute("/_authenticated/purchasing")({
  head: () => ({
    meta: [
      { title: "Purchasing — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Supplier purchase orders, restock requisitions, and vendor management.",
      },
      { property: "og:title", content: "Purchasing — Trite Merchant OS" },
    ],
  }),
  component: Purchasing,
});

type POStatus = WholesalePurchaseOrder["status"];

const STATUS_CONFIG: Record<
  POStatus,
  { label: string; icon: React.ElementType; color: string; bg: string; activePill: string }
> = {
  draft: {
    label: "Draft",
    icon: FileText,
    color: "text-slate-600 dark:text-slate-300 font-semibold",
    bg: "bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700",
    activePill: "bg-slate-700 text-white",
  },
  submitted: {
    label: "Submitted",
    icon: Truck,
    color: "text-indigo-600 dark:text-indigo-400 font-semibold",
    bg: "bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/60",
    activePill: "bg-indigo-600 text-white",
  },
  partially_received: {
    label: "Partially Received",
    icon: AlertCircle,
    color: "text-amber-600 dark:text-amber-400 font-semibold",
    bg: "bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/60",
    activePill: "bg-amber-600 text-white",
  },
  received: {
    label: "Fully Received",
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400 font-semibold",
    bg: "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60",
    activePill: "bg-emerald-600 text-white",
  },
  cancelled: {
    label: "Cancelled",
    icon: AlertCircle,
    color: "text-rose-600 dark:text-rose-400 font-semibold",
    bg: "bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-800/60",
    activePill: "bg-rose-600 text-white",
  },
};

function Purchasing() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<POStatus | "all">("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filtered = WHOLESALE_PURCHASE_ORDERS.filter((po) => {
    const matchSearch =
      po.id.toLowerCase().includes(search.toLowerCase()) ||
      po.supplier.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || po.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalSpent = WHOLESALE_PURCHASE_ORDERS.reduce((acc, curr) => acc + curr.totalCost, 0);

  return (
    <AppShell
      title="Purchasing & Supplier POs"
      subtitle={`Manage stock replenishment and vendor orders · Total PO Value: ${currency(totalSpent)}`}
      actions={
        <Button size="sm" className="h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm bg-[#22c55e] text-white hover:bg-[#16a34a] shrink-0">
          <Plus className="size-3.5 sm:size-4" />
          <span className="hidden sm:inline">Create Purchase Order</span>
          <span className="sm:hidden">New PO</span>
        </Button>
      }
    >
      {/* Stat Summaries */}
      <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total POs</p>
            <span className="rounded-full bg-slate-100 p-1.5 sm:p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <PackageSearch className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold">{WHOLESALE_PURCHASE_ORDERS.length}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Across all branches</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pending</p>
            <span className="rounded-full bg-indigo-50 p-1.5 sm:p-2 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Truck className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold">
            {WHOLESALE_PURCHASE_ORDERS.filter((p) => p.status === "submitted" || p.status === "partially_received").length}
          </p>
          <p className="mt-0.5 text-xs text-indigo-600 dark:text-indigo-400">En route</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Received</p>
            <span className="rounded-full bg-emerald-50 p-1.5 sm:p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold">
            {WHOLESALE_PURCHASE_ORDERS.filter((p) => p.status === "received").length}
          </p>
          <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">Stock updated</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Value</p>
            <span className="rounded-full bg-amber-50 p-1.5 sm:p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <FileText className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold">{currency(totalSpent)}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">GHS commitments</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 space-y-2.5">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by PO number or supplier name…"
            className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
          />
        </div>

        {/* Filter pills — horizontally scrollable on mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setStatusFilter("all")}
            className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
              statusFilter === "all"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-secondary text-muted-foreground hover:bg-border"
            }`}
          >
            All
          </button>
          {(["draft", "submitted", "partially_received", "received"] as POStatus[]).map((s) => {
            const cfg = STATUS_CONFIG[s];
            const isSelected = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                  isSelected
                    ? cfg.activePill
                    : "bg-secondary text-muted-foreground hover:bg-border"
                }`}
              >
                {cfg.label}
              </button>
            );
          })}
          <div className="shrink-0">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>
      </div>

      {/* Mobile Card List View */}
      <div className="divide-y divide-border rounded-xl border border-border bg-card sm:hidden">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No purchase orders found matching your search.
          </div>
        ) : (
          filtered.map((po) => {
            const cfg = STATUS_CONFIG[po.status];
            const Icon = cfg.icon;
            return (
              <div key={po.id} className="p-3.5 space-y-2.5 transition-colors hover:bg-secondary/40">
                {/* Row 1: PO Number & Status Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold bg-muted px-2 py-0.5 rounded border border-border/70 text-foreground">
                    {po.id}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cfg.bg} ${cfg.color}`}>
                    <Icon className="size-3" />
                    {cfg.label}
                  </span>
                </div>

                {/* Row 2: Supplier Name & Total Cost */}
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm leading-tight text-foreground">{po.supplier}</p>
                  <p className="num text-sm font-bold text-foreground shrink-0">{currency(po.totalCost)}</p>
                </div>

                {/* Row 3: Meta (Branch, units, expected date) & Action */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50 text-xs text-muted-foreground">
                  <div className="truncate">
                    <span>{po.branch}</span>
                    <span className="mx-1.5 opacity-40">·</span>
                    <span>{po.itemsCount} units</span>
                    <span className="mx-1.5 opacity-40">·</span>
                    <span>Exp. {po.expectedDelivery}</span>
                  </div>
                  <button className="grid size-7 place-items-center rounded-md border border-border bg-background transition-colors hover:bg-secondary shrink-0">
                    <ArrowUpRight className="size-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">PO Number</th>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3">Receiving Branch</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total Cost</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Expected</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  No purchase orders found matching your search.
                </td>
              </tr>
            )}
            {filtered.map((po) => {
              const cfg = STATUS_CONFIG[po.status];
              const Icon = cfg.icon;
              return (
                <tr key={po.id} className="transition-colors hover:bg-secondary/30">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{po.id}</td>
                  <td className="px-4 py-3 font-medium">{po.supplier}</td>
                  <td className="px-4 py-3 text-muted-foreground">{po.branch}</td>
                  <td className="px-4 py-3 text-muted-foreground">{po.itemsCount} units</td>
                  <td className="px-4 py-3 font-semibold">{currency(po.totalCost)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs ${cfg.bg} ${cfg.color}`}>
                      <Icon className="size-3" />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{po.expectedDelivery}</td>
                  <td className="px-4 py-3">
                    <button className="grid size-7 place-items-center rounded-md border border-border bg-background transition-colors hover:bg-secondary">
                      <ArrowUpRight className="size-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
