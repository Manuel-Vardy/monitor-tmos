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
  Pill,
  Factory,
  Building2,
  Plane,
  Wallet,
} from "lucide-react";

import type { DateRange } from "react-day-picker";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { currency } from "@/lib/mos-data";
import { WHOLESALE_PURCHASE_ORDERS, type WholesalePurchaseOrder } from "@/lib/wholesale-data";
import {
  PHARMACY_PURCHASE_ORDERS,
  type PharmacyPurchaseOrder,
} from "@/lib/pharmacy-data";
import { useInstitution } from "@/hooks/use-institution";

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

type WholesalePOStatus = WholesalePurchaseOrder["status"];
type PharmacyPOStatus = PharmacyPurchaseOrder["status"];

const WHOLESALE_STATUS_CONFIG: Record<
  WholesalePOStatus,
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

const PHARMACY_STATUS_CONFIG: Record<
  PharmacyPOStatus,
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
    color: "text-blue-600 dark:text-blue-400 font-semibold",
    bg: "bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60",
    activePill: "bg-blue-600 text-white",
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
    activePill: "bg-[#22c55e] text-white",
  },
  cancelled: {
    label: "Cancelled",
    icon: AlertCircle,
    color: "text-rose-600 dark:text-rose-400 font-semibold",
    bg: "bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-800/60",
    activePill: "bg-rose-600 text-white",
  },
};

const SUPPLIER_TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  Manufacturer: {
    icon: Factory,
    color: "text-violet-700 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900/60",
  },
  Wholesaler: {
    icon: Building2,
    color: "text-cyan-700 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-900/60",
  },
  Distributor: {
    icon: Truck,
    color: "text-indigo-700 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60",
  },
  Importer: {
    icon: Plane,
    color: "text-orange-700 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60",
  },
};

const PAYMENT_TERMS_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  "Net 30": { icon: Clock, color: "text-slate-600 dark:text-slate-400" },
  "Net 15": { icon: Clock, color: "text-blue-600 dark:text-blue-400" },
  "Cash on Delivery": { icon: Wallet, color: "text-emerald-600 dark:text-emerald-400" },
  Prepaid: { icon: Wallet, color: "text-violet-600 dark:text-violet-400" },
};

function Purchasing() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PharmacyPOStatus | WholesalePOStatus | "all">("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const { institutionType } = useInstitution();
  const isPharmacy = institutionType === "pharmacy";

  const orders = isPharmacy ? PHARMACY_PURCHASE_ORDERS : WHOLESALE_PURCHASE_ORDERS;
  const statusConfig = isPharmacy ? PHARMACY_STATUS_CONFIG : WHOLESALE_STATUS_CONFIG;

  const filtered = orders.filter((po) => {
    const matchSearch =
      po.id.toLowerCase().includes(search.toLowerCase()) ||
      po.supplier.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || po.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalSpent = orders.reduce((acc, curr) => acc + curr.totalCost, 0);
  const pendingCount = orders.filter((p) => p.status === "submitted" || p.status === "partially_received").length;
  const receivedCount = orders.filter((p) => p.status === "received").length;

  const pageTitle = isPharmacy ? "Procurement & Supplier POs" : "Purchasing & Supplier POs";
  const pageSubtitle = isPharmacy
    ? `Pharmaceutical procurement, batch-ordered stock replenishment · Total PO Value: ${currency(totalSpent)}`
    : `Manage stock replenishment and vendor orders · Total PO Value: ${currency(totalSpent)}`;
  const newPOButtonLabel = isPharmacy ? "New Medication PO" : "Create Purchase Order";
  const newPOMobileLabel = isPharmacy ? "New PO" : "New PO";

  return (
    <AppShell
      title={pageTitle}
      subtitle={pageSubtitle}
      actions={
        <Button size="sm" className="h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm bg-[#22c55e] text-white hover:bg-[#16a34a] shrink-0">
          <Plus className="size-3.5 sm:size-4" />
          <span className="hidden sm:inline">{newPOButtonLabel}</span>
          <span className="sm:hidden">{newPOMobileLabel}</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Stat Summaries */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {isPharmacy ? "Total Drug POs" : "Total POs"}
              </p>
              <span className="rounded-full bg-slate-100 p-1.5 sm:p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {isPharmacy ? <Pill className="size-3.5 sm:size-4" /> : <PackageSearch className="size-3.5 sm:size-4" />}
              </span>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-bold">{orders.length}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Across all branches</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {isPharmacy ? "In Transit" : "Pending"}
              </p>
              <span className={`rounded-full p-1.5 sm:p-2 ${
                isPharmacy
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                  : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
              }`}>
                <Truck className="size-3.5 sm:size-4" />
              </span>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-bold">{pendingCount}</p>
            <p className={`mt-0.5 text-xs ${
              isPharmacy ? "text-blue-600 dark:text-blue-400" : "text-indigo-600 dark:text-indigo-400"
            }`}>
              {isPharmacy ? "Awaiting delivery" : "En route"}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Received</p>
              <span className="rounded-full bg-emerald-50 p-1.5 sm:p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5 sm:size-4" />
              </span>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-bold">{receivedCount}</p>
            <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">Stock updated</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {isPharmacy ? "Procurement Value" : "Total Value"}
              </p>
              <span className="rounded-full bg-amber-50 p-1.5 sm:p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <FileText className="size-3.5 sm:size-4" />
              </span>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-bold">{currency(totalSpent)}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">GHS commitments</p>
          </div>
        </div>

        {/* Pharmacy: Supplier Types Summary Row */}
        {isPharmacy && (
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {(Object.keys(SUPPLIER_TYPE_CONFIG) as Array<keyof typeof SUPPLIER_TYPE_CONFIG>).map((type) => {
              const cfg = SUPPLIER_TYPE_CONFIG[type];
              if (!cfg) return null;
              const count = PHARMACY_PURCHASE_ORDERS.filter((p) => p.supplierType === type).length;
              const value = PHARMACY_PURCHASE_ORDERS
                .filter((p) => p.supplierType === type)
                .reduce((acc, p) => acc + p.totalCost, 0);
              const Icon = cfg.icon;
              return (
                <div key={type} className={`rounded-xl border border-border p-3 sm:p-4 ${cfg.bg}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`size-3.5 sm:size-4 ${cfg.color}`} />
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>{type}</p>
                    </div>
                  </div>
                  <p className={`mt-1.5 text-xl font-bold num ${cfg.color}`}>{count}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{currency(value)}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Toolbar */}
        <div className="space-y-2.5">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isPharmacy
                  ? "Search PO #, supplier, manufacturer or distributor…"
                  : "Search by PO number or supplier name…"
              }
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
            {(Object.keys(statusConfig) as Array<PharmacyPOStatus | WholesalePOStatus>).map((s) => {
              const cfg = statusConfig[s];
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
            (filtered as Array<WholesalePurchaseOrder | PharmacyPurchaseOrder>).map((po) => {
              const cfg = statusConfig[po.status];
              const StatusIcon = cfg.icon;
              const pharmacyPO = po as PharmacyPurchaseOrder;
              return (
                <div key={po.id} className="p-3.5 space-y-2.5 transition-colors hover:bg-secondary/40">
                  {/* Row 1: PO Number & Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold bg-muted px-2 py-0.5 rounded border border-border/70 text-foreground">
                      {po.id}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cfg.bg} ${cfg.color}`}>
                      <StatusIcon className="size-3" />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Row 2: Supplier Name & Total Cost */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm leading-tight text-foreground">{po.supplier}</p>
                      {isPharmacy && pharmacyPO.supplierType && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {(() => {
                            const st = SUPPLIER_TYPE_CONFIG[pharmacyPO.supplierType];
                            if (!st) return null;
                            const TypeIcon = st.icon;
                            return (
                              <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${st.bg} ${st.color}`}>
                                <TypeIcon className="size-2.5" />
                                {pharmacyPO.supplierType}
                              </span>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                    <p className="num text-sm font-bold text-foreground shrink-0">{currency(po.totalCost)}</p>
                  </div>

                  {/* Row 3: Pharmacy items preview */}
                  {isPharmacy && pharmacyPO.items && pharmacyPO.items.length > 0 && (
                    <div className="space-y-1 rounded-lg bg-secondary/40 p-2">
                      {pharmacyPO.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px]">
                          <span className="truncate font-medium text-foreground">{item.brandName}</span>
                          <span className="num text-muted-foreground">×{item.quantity}</span>
                        </div>
                      ))}
                      {pharmacyPO.items.length > 2 && (
                        <p className="text-[10px] text-muted-foreground">+{pharmacyPO.items.length - 2} more items</p>
                      )}
                    </div>
                  )}

                  {/* Row 4: Meta (Branch, units, expected date, payment terms) & Action */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50 text-xs text-muted-foreground">
                    <div className="truncate">
                      <span>{po.branch}</span>
                      <span className="mx-1.5 opacity-40">·</span>
                      <span>{po.itemsCount} units</span>
                      <span className="mx-1.5 opacity-40">·</span>
                      <span>Exp. {po.expectedDelivery}</span>
                      {isPharmacy && pharmacyPO.paymentTerms && (
                        <>
                          <span className="mx-1.5 opacity-40">·</span>
                          <span>{pharmacyPO.paymentTerms}</span>
                        </>
                      )}
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
                <th className="px-4 py-3">{isPharmacy ? "Supplier / Manufacturer" : "Supplier"}</th>
                {isPharmacy && <th className="px-4 py-3">Supplier Type</th>}
                <th className="px-4 py-3">Receiving Branch</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total Cost</th>
                <th className="px-4 py-3">Status</th>
                {isPharmacy && <th className="px-4 py-3">Payment Terms</th>}
                <th className="px-4 py-3">Expected</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={isPharmacy ? 10 : 8} className="py-10 text-center text-sm text-muted-foreground">
                    No purchase orders found matching your search.
                  </td>
                </tr>
              )}
              {(filtered as Array<WholesalePurchaseOrder | PharmacyPurchaseOrder>).map((po) => {
                const cfg = statusConfig[po.status];
                const StatusIcon = cfg.icon;
                const pharmacyPO = po as PharmacyPurchaseOrder;
                return (
                  <tr key={po.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{po.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{po.supplier}</p>
                      {isPharmacy && pharmacyPO.items && pharmacyPO.items.length > 0 && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {pharmacyPO.items.slice(0, 2).map((i) => i.brandName).join(", ")}
                          {pharmacyPO.items.length > 2 && ` +${pharmacyPO.items.length - 2}`}
                        </p>
                      )}
                    </td>
                    {isPharmacy && (
                      <td className="px-4 py-3">
                        {pharmacyPO.supplierType && (() => {
                          const st = SUPPLIER_TYPE_CONFIG[pharmacyPO.supplierType];
                          if (!st) return null;
                          const TypeIcon = st.icon;
                          return (
                            <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold ${st.bg} ${st.color}`}>
                              <TypeIcon className="size-3" />
                              {pharmacyPO.supplierType}
                            </span>
                          );
                        })()}
                      </td>
                    )}
                    <td className="px-4 py-3 text-muted-foreground">{po.branch}</td>
                    <td className="px-4 py-3 text-muted-foreground">{po.itemsCount} units</td>
                    <td className="px-4 py-3 font-semibold num">{currency(po.totalCost)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs ${cfg.bg} ${cfg.color}`}>
                        <StatusIcon className="size-3" />
                        {cfg.label}
                      </span>
                    </td>
                    {isPharmacy && (
                      <td className="px-4 py-3">
                        {pharmacyPO.paymentTerms && (() => {
                          const pt = PAYMENT_TERMS_CONFIG[pharmacyPO.paymentTerms];
                          if (!pt) return null;
                          const TermsIcon = pt.icon;
                          return (
                            <span className={`inline-flex items-center gap-1 text-xs ${pt.color}`}>
                              <TermsIcon className="size-3" />
                              {pharmacyPO.paymentTerms}
                            </span>
                          );
                        })()}
                      </td>
                    )}
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
      </div>
    </AppShell>
  );
}
