import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ShoppingCart,
  Truck,
  Users,
  CreditCard,
  Package,
  AlertCircle,
  Plus,
  ArrowUpRight,
  TrendingUp,
  FileText,
  PackageSearch,
  CheckCircle2,
  Clock,
  Bell,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { KpiCard } from "@/components/kpi-card";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  WHOLESALE_CUSTOMERS,
  WHOLESALE_DELIVERY_ROUTES,
  WHOLESALE_ORDERS,
  WHOLESALE_PURCHASE_ORDERS,
  WHOLESALE_SUMMARY,
} from "@/lib/wholesale-data";

function formatGhs(amount: number) {
  return `GHS ${amount.toLocaleString("en-GH")}`;
}

const chartData = [
  { day: "Mon", revenue: 42_000, orders: 12 },
  { day: "Tue", revenue: 58_400, orders: 18 },
  { day: "Wed", revenue: 49_100, orders: 14 },
  { day: "Thu", revenue: 73_500, orders: 22 },
  { day: "Fri", revenue: 91_200, orders: 28 },
  { day: "Sat", revenue: 104_800, orders: 35 },
  { day: "Sun", revenue: 63_300, orders: 19 },
];

const ROUTE_STATUS_STYLES: Record<string, string> = {
  "In transit": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "Loading":    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "Delayed":    "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  "Scheduled":  "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const ORDER_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending:    { bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200", text: "text-amber-600 dark:text-amber-400" },
  processing: { bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200", text: "text-blue-600 dark:text-blue-400" },
  dispatched: { bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200", text: "text-purple-600 dark:text-purple-400" },
  delivered:  { bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200", text: "text-emerald-600 dark:text-emerald-400" },
  cancelled:  { bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200", text: "text-rose-600 dark:text-rose-400" },
  default:    { bg: "bg-muted", text: "text-muted-foreground" },
};

export function WholesaleDashboard() {
  return (
    <AppShell
      title="Wholesale Dashboard"
      subtitle="Operations overview · Bulk orders, supplier payables, credit receivables & fleet routes"
      actions={
        <div className="hidden lg:flex flex-wrap items-center gap-2">
          <Link to="/orders">
            <Button size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a]">
              <Plus className="size-4" /> New Bulk Order
            </Button>
          </Link>
          <Link to="/purchasing">
            <Button size="sm" variant="outline">
              <PackageSearch className="size-4" /> Supplier PO
            </Button>
          </Link>
        </div>
      }
    >
      {/* Mobile: green hero card + 4 stat cards underneath */}
      <div className="lg:hidden space-y-3">

        {/* Greeting row — above the hero card */}
        <div className="flex items-center justify-between px-0.5">
          <div>
            <p className="text-xs text-muted-foreground">Good morning 🌤</p>
            <h2 className="text-xl font-bold leading-tight">Wholesale</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 shadow-xs">
              <span className="size-1.5 rounded-full bg-emerald-500" /> Live
            </span>
            <button className="relative grid size-9 place-items-center rounded-full bg-card shadow-xs border border-border">
              <Bell className="size-4" />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500" />
            </button>
          </div>
        </div>

        {/* Green hero card — Bulk Order Value */}
        <div className="relative overflow-hidden rounded-2xl bg-[#22c55e] p-5 text-white shadow-lg">
          {/* decorative circle */}
          <div
            className="pointer-events-none absolute rounded-full bg-white/10"
            style={{ width: "260px", height: "260px", bottom: "-120px", right: "-60px" }}
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-bold tracking-widest uppercase text-white/80">Bulk Order Value</p>
              <ShoppingCart className="size-6 opacity-70" />
            </div>
            <p className="num mt-2 text-3xl font-extrabold leading-none tracking-tight">
              {formatGhs(WHOLESALE_SUMMARY.bulkOrderValue)}
            </p>
            <p className="mt-2 text-xs text-white/75">
              +12.4% · this month
            </p>

            {/* Full-width action buttons matching retail dashboard style */}
            <div className="mt-4 flex gap-3">
              <Link to="/orders" className="flex-1">
                <span className="block rounded-xl bg-[#166534] py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#14532d]">
                  New Bulk Order
                </span>
              </Link>
              <Link to="/purchasing" className="flex-1">
                <span className="block rounded-xl bg-white/20 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/30">
                  Supplier PO
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 stat cards below the hero */}
        <div className="grid grid-cols-2 gap-2.5">
          <KpiCard
            label="Bulk Order Value"
            value={formatGhs(WHOLESALE_SUMMARY.bulkOrderValue)}
            delta={12.4}
            sub="this month"
            icon={ShoppingCart}
          />
          <KpiCard
            label="Supplier Payables"
            value={formatGhs(WHOLESALE_SUMMARY.supplierPayables)}
            sub="outstanding restock orders"
            icon={Package}
          />
          <KpiCard
            label="Credit Receivables"
            value={formatGhs(WHOLESALE_SUMMARY.creditReceivables)}
            sub={`${WHOLESALE_SUMMARY.overdueCount} accounts overdue`}
            icon={CreditCard}
          />
          <KpiCard
            label="Active Fleet Routes"
            value={WHOLESALE_SUMMARY.activeRoutesCount}
            sub={`${WHOLESALE_SUMMARY.delayedRoutesCount} route delayed`}
            icon={Truck}
          />
        </div>
      </div>

      {/* Desktop: standard 4-column KPI grid */}
      <div className="hidden lg:grid grid-cols-4 gap-3">
        <KpiCard
          label="Bulk Order Value"
          value={formatGhs(WHOLESALE_SUMMARY.bulkOrderValue)}
          delta={12.4}
          sub="this month"
          icon={ShoppingCart}
        />
        <KpiCard
          label="Supplier Payables"
          value={formatGhs(WHOLESALE_SUMMARY.supplierPayables)}
          sub="outstanding restock orders"
          icon={Package}
        />
        <KpiCard
          label="Credit Receivables"
          value={formatGhs(WHOLESALE_SUMMARY.creditReceivables)}
          sub={`${WHOLESALE_SUMMARY.overdueCount} accounts with overdue balance`}
          icon={CreditCard}
        />
        <KpiCard
          label="Active Fleet Routes"
          value={WHOLESALE_SUMMARY.activeRoutesCount}
          sub={`${WHOLESALE_SUMMARY.delayedRoutesCount} route delayed`}
          icon={Truck}
        />
      </div>

      {/* 2. Order Revenue & Volume Chart */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2 shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-semibold">Wholesale Revenue & Orders Trend</h2>
              <p className="text-xs text-muted-foreground">Weekly gross fulfilled order volume across branches</p>
            </div>
          </div>

          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="wholesaleRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => `GH₵${v / 1000}k`} />
                <Tooltip
                  formatter={(val) => [formatGhs(Number(val)), "Revenue"]}
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    borderColor: "var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#wholesaleRevenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Quick Operations Overview Card */}
        <Card className="p-5 flex flex-col justify-between shadow-none">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-base font-semibold">Quick Actions & Status</h2>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                System Healthy
              </span>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-8 place-items-center rounded-md bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                    <ShoppingCart className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium text-xs">Recent Orders</p>
                    <p className="text-[11px] text-muted-foreground">{WHOLESALE_ORDERS.length} total orders this week</p>
                  </div>
                </div>
                <Link to="/orders" className="text-xs font-semibold text-emerald-600 hover:underline">
                  View →
                </Link>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-8 place-items-center rounded-md bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    <PackageSearch className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium text-xs">Supplier Shipments</p>
                    <p className="text-[11px] text-muted-foreground">{WHOLESALE_PURCHASE_ORDERS.filter((p) => p.status === "submitted").length} POs en route</p>
                  </div>
                </div>
                <Link to="/purchasing" className="text-xs font-semibold text-emerald-600 hover:underline">
                  View →
                </Link>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-8 place-items-center rounded-md bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                    <Users className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium text-xs">Wholesale Buyers</p>
                    <p className="text-[11px] text-muted-foreground">{WHOLESALE_CUSTOMERS.length} registered accounts</p>
                  </div>
                </div>
                <Link to="/customers" className="text-xs font-semibold text-emerald-600 hover:underline">
                  View →
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Last synced: Just now</span>
            <span className="font-semibold text-foreground">Trite Engine v2.4</span>
          </div>
        </Card>
      </div>

      {/* 3. Lower Grid: Orders, Routes, Supplier POs & Customers */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Recent Bulk Orders */}
        <Card className="p-0 overflow-hidden shadow-none">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Recent Bulk Orders</h2>
            </div>
            <Link to="/orders" className="text-xs font-semibold text-emerald-600 hover:underline">
              View All Orders ({WHOLESALE_ORDERS.length})
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium text-muted-foreground">
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {WHOLESALE_ORDERS.slice(0, 5).map((order) => {
                  const style = ORDER_STATUS_STYLES[order.status] ?? ORDER_STATUS_STYLES["default"]!;
                  return (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs font-semibold">{order.id}</td>
                      <td className="px-4 py-3 font-medium">{order.customerName}</td>
                      <td className="px-4 py-3 font-semibold">{formatGhs(order.total)}</td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border", style.bg, style.text)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Supplier Restock POs */}
        <Card className="p-0 overflow-hidden shadow-none">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <PackageSearch className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Supplier Restock POs</h2>
            </div>
            <Link to="/purchasing" className="text-xs font-semibold text-emerald-600 hover:underline">
              View All POs ({WHOLESALE_PURCHASE_ORDERS.length})
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium text-muted-foreground">
                  <th className="px-5 py-3">PO Number</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Total Cost</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {WHOLESALE_PURCHASE_ORDERS.slice(0, 5).map((po) => (
                  <tr key={po.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs font-semibold">{po.id}</td>
                    <td className="px-4 py-3 font-medium">{po.supplier}</td>
                    <td className="px-4 py-3 font-semibold">{formatGhs(po.totalCost)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                        {po.status.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pending Delivery Routes */}
        <Card className="p-0 overflow-hidden shadow-none">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <Truck className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Pending Delivery Routes</h2>
            <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              Top {WHOLESALE_DELIVERY_ROUTES.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium text-muted-foreground">
                  <th className="px-5 py-3">Route</th>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">Destination</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {WHOLESALE_DELIVERY_ROUTES.map((route) => (
                  <tr key={route.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs font-semibold">{route.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">{route.driver}</td>
                    <td className="px-4 py-3 font-medium">
                      {route.customerName} <span className="text-xs text-muted-foreground font-normal">({route.destination})</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          ROUTE_STATUS_STYLES[route.status] ?? "bg-muted text-muted-foreground",
                        )}
                      >
                        {route.status === "Delayed" && (
                          <AlertCircle className="mr-1 size-3 shrink-0" />
                        )}
                        {route.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{route.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Credit Customer Receivables */}
        <Card className="p-0 overflow-hidden shadow-none">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Credit Customers & Overdue Accounts</h2>
            </div>
            <Link to="/customers" className="text-xs font-semibold text-emerald-600 hover:underline">
              View All ({WHOLESALE_CUSTOMERS.length})
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium text-muted-foreground">
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-4 py-3 text-right">Limit</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                  <th className="px-4 py-3 text-right">Overdue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {WHOLESALE_CUSTOMERS.slice(0, 5).map((customer) => (
                  <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-medium">{customer.company}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{formatGhs(customer.creditLimit)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatGhs(customer.balanceUsed)}</td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right font-bold",
                        customer.overdue > 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground",
                      )}
                    >
                      {formatGhs(customer.overdue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
