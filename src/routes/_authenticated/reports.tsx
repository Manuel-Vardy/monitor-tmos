import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Download,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Boxes,
  Banknote,
  PackageCheck,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  BarChart2,
  GitCompare,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { format } from "date-fns";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { StatusBadge } from "@/components/status-badge";
import {
  currency,
  branches as seedBranches,
  products,
  revenueSeries,
  paymentMix,
  seriesFor,
  paymentMixFor,
  branchName,
} from "@/lib/mos-data";
import { useBranches } from "@/lib/branches-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Retail performance reports: today's summary, product sales breakdown, branch revenue, and date-range analytics.",
      },
      { property: "og:title", content: "Reports — Trite Merchant OS" },
    ],
  }),
  component: Reports,
});

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
} as const;

// ── Derived today's snapshot from the last day in revenueSeries (Sunday) ────
const todaySeries = revenueSeries[revenueSeries.length - 1]!;
const todayGross = todaySeries.sales;
const todaySettled = todaySeries.settled;
const todayTxns = Math.max(1, Math.round(todayGross / 151));
const todayAvg = Math.round(todayGross / todayTxns);
const settlementRate = Math.round((todaySettled / todayGross) * 100);

// ── Product report data ─────────────────────────────────────────────────────
const productReport = products
  .map((p) => ({
    ...p,
    revenue: p.price * p.stock, // proxy: price × current stock as sold value
    stockHealth:
      p.stock === 0 ? ("out" as const) : p.stock <= p.threshold ? ("low" as const) : ("healthy" as const),
  }))
  .sort((a, b) => b.revenue - a.revenue);

const totalProductRevenue = productReport.reduce((s, p) => s + p.revenue, 0);

// ── Branch bar chart data derived inside component ─────────────────────────

function Reports() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"today" | "products" | "range" | "interbranch">("today");
  const { branches } = useBranches();
  const branchOptions = branches.filter((b) => b.id !== "all");
  const branchChartData = branchOptions.map((b) => ({
    name: b.name.split(" ")[0],
    revenue: b.revenue,
    stockValue: b.stockValue,
  }));

  const rangeLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, "dd MMM")} – ${format(dateRange.to, "dd MMM yyyy")}`
      : format(dateRange.from, "dd MMM yyyy")
    : "Last 30 days";

  // 30-day trend for the trend chart
  const trendSeries = useMemo(() => seriesFor("all", "30d"), []);
  const totalGross = useMemo(() => trendSeries.reduce((s, r) => s + r.sales, 0), [trendSeries]);
  const totalSettled = useMemo(() => trendSeries.reduce((s, r) => s + r.settled, 0), [trendSeries]);

  const tabs = [
    { key: "today" as const, label: "Today's Report", icon: CalendarDays },
    { key: "products" as const, label: "Product Report", icon: Boxes },
    { key: "range" as const, label: "Date Range Report", icon: BarChart2 },
    { key: "interbranch" as const, label: "Inter-Branch Report", icon: GitCompare },
  ];

  return (
    <AppShell
      title="Reports"
      subtitle="Retail analytics · sales, products, branch performance"
      actions={
        <Button size="sm" className="h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm bg-accent text-accent-foreground hover:bg-accent/85">
          <Download className="size-3.5 sm:size-4" />
          <span className="hidden sm:inline">Export CSV</span>
          <span className="sm:hidden">Export</span>
        </Button>
      }
    >
      <div className="space-y-6">

        {/* ── Tab bar ── */}
        <div className="flex items-center gap-1.5 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === t.key
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <t.icon className="size-4 shrink-0" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════
            TAB 1 — TODAY'S REPORT
        ══════════════════════════════════════════════ */}
        {activeTab === "today" && (
          <div className="space-y-6">
            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                {
                  label: "Gross Sales Today",
                  value: currency(todayGross),
                  sub: `${todayTxns} transactions`,
                  icon: Banknote,
                  color: "text-emerald-600 dark:text-emerald-400",
                  bg: "bg-emerald-50 dark:bg-emerald-950/60",
                },
                {
                  label: "Settled Today",
                  value: currency(todaySettled),
                  sub: `${settlementRate}% of gross`,
                  icon: PackageCheck,
                  color: "text-blue-600 dark:text-blue-400",
                  bg: "bg-blue-50 dark:bg-blue-950/60",
                },
                {
                  label: "Avg Transaction",
                  value: currency(todayAvg),
                  sub: "per sale",
                  icon: ShoppingCart,
                  color: "text-violet-600 dark:text-violet-400",
                  bg: "bg-violet-50 dark:bg-violet-950/60",
                },
                {
                  label: "Unsettled Float",
                  value: currency(todayGross - todaySettled),
                  sub: `${100 - settlementRate}% pending`,
                  icon: TrendingUp,
                  color: "text-amber-600 dark:text-amber-400",
                  bg: "bg-amber-50 dark:bg-amber-950/60",
                },
              ].map((c) => (
                <div key={c.label} className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{c.label}</p>
                    <span className={cn("rounded-full p-1.5 sm:p-2", c.bg, c.color)}>
                      <c.icon className="size-3.5 sm:size-4" />
                    </span>
                  </div>
                  <p className={cn("mt-2 text-xl sm:text-2xl font-bold", c.color)}>{c.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{c.sub}</p>
                </div>
              ))}
            </div>

            {/* Daily sales trend (7-day) */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs">
              <div className="mb-4">
                <h2 className="text-lg font-bold">Daily Sales Trend</h2>
                <p className="text-xs text-muted-foreground">Gross sales vs settled amount — last 7 days</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueSeries} margin={{ left: -18, right: 4, top: 4 }}>
                    <defs>
                      <linearGradient id="g-gross" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="g-settled" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                    <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v)} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area name="Gross Sales" type="monotone" dataKey="sales" stroke="#22c55e" strokeWidth={2} fill="url(#g-gross)" activeDot={{ r: 5 }} />
                    <Area name="Settled" type="monotone" dataKey="settled" stroke="#3b82f6" strokeWidth={2} fill="url(#g-settled)" activeDot={{ r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payment method breakdown */}
            <div className="rounded-xl border border-border bg-card shadow-2xs">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-lg font-bold">Payment Method Breakdown</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Today's revenue split by payment method</p>
              </div>
              <ul className="divide-y divide-border">
                {paymentMix.map((m) => (
                  <li key={m.method} className="flex items-center gap-4 px-5 py-3.5">
                    <span className="w-32 truncate text-sm font-medium">{m.method}</span>
                    <div className="flex-1">
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${m.value}%` }} />
                      </div>
                    </div>
                    <span className="w-10 text-right text-xs font-semibold text-muted-foreground">{m.value}%</span>
                    <span className="w-28 text-right text-sm font-bold">{currency(m.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB 2 — PRODUCT REPORT
        ══════════════════════════════════════════════ */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: "Total SKUs", value: products.length.toString(), sub: "across all branches", icon: Boxes, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/60" },
                { label: "Stock Value", value: currency(products.reduce((s, p) => s + p.price * p.stock, 0)), sub: "on hand", icon: Banknote, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/60" },
                { label: "Low Stock SKUs", value: products.filter((p) => p.stock > 0 && p.stock <= p.threshold).length.toString(), sub: "need restocking", icon: TrendingDown, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/60" },
                { label: "Out of Stock", value: products.filter((p) => p.stock === 0).length.toString(), sub: "zero units", icon: PackageCheck, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/60" },
              ].map((c) => (
                <div key={c.label} className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{c.label}</p>
                    <span className={cn("rounded-full p-1.5 sm:p-2", c.bg, c.color)}>
                      <c.icon className="size-3.5 sm:size-4" />
                    </span>
                  </div>
                  <p className={cn("mt-2 text-xl sm:text-2xl font-bold", c.color)}>{c.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{c.sub}</p>
                </div>
              ))}
            </div>

            {/* Product table */}
            <div className="rounded-xl border border-border bg-card shadow-2xs">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-lg font-bold">Product Performance</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Ranked by stock value · {productReport.length} SKUs
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/40 text-left text-xs tracking-wide text-muted-foreground uppercase">
                      <th className="px-5 py-3 font-bold">#</th>
                      <th className="px-5 py-3 font-bold">Product</th>
                      <th className="px-5 py-3 font-bold">Branch</th>
                      <th className="px-5 py-3 text-right font-bold">Unit Price</th>
                      <th className="px-5 py-3 text-right font-bold">On Hand</th>
                      <th className="px-5 py-3 text-right font-bold">Stock Value</th>
                      <th className="px-5 py-3 font-bold">Share</th>
                      <th className="px-5 py-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {productReport.map((p, i) => (
                      <tr key={p.sku} className="transition-colors hover:bg-secondary/60">
                        <td className="px-5 py-3 text-xs font-bold text-muted-foreground">{i + 1}</td>
                        <td className="px-5 py-3">
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.sku} · {p.variant}</p>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">{p.branch}</td>
                        <td className="px-5 py-3 text-right font-medium">{currency(p.price)}</td>
                        <td className="px-5 py-3 text-right font-bold">{p.stock}</td>
                        <td className="px-5 py-3 text-right font-bold text-accent">{currency(p.revenue)}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                              <div
                                className="h-full rounded-full bg-accent"
                                style={{ width: `${Math.round((p.revenue / totalProductRevenue) * 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {Math.round((p.revenue / totalProductRevenue) * 100)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge tone={p.stockHealth === "out" ? "bad" : p.stockHealth === "low" ? "warn" : "good"}>
                            {p.stockHealth === "out" ? "Out" : p.stockHealth === "low" ? "Low" : "Healthy"}
                          </StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="rounded-xl border border-border bg-card shadow-2xs">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-lg font-bold">Stock Value by Category</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Distribution of inventory value across product categories</p>
              </div>
              <ul className="divide-y divide-border">
                {(() => {
                  const byCategory = Object.entries(
                    productReport.reduce<Record<string, number>>((acc, p) => {
                      acc[p.category] = (acc[p.category] ?? 0) + p.revenue;
                      return acc;
                    }, {}),
                  ).sort((a, b) => b[1] - a[1]);

                  return byCategory.map(([cat, val]) => (
                    <li key={cat} className="flex items-center gap-4 px-5 py-3.5">
                      <span className="w-32 truncate text-sm font-medium">{cat}</span>
                      <div className="flex-1">
                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${Math.round((val / totalProductRevenue) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-10 text-right text-xs font-semibold text-muted-foreground">
                        {Math.round((val / totalProductRevenue) * 100)}%
                      </span>
                      <span className="w-28 text-right text-sm font-bold">{currency(val)}</span>
                    </li>
                  ));
                })()}
              </ul>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB 3 — DATE RANGE REPORT
        ══════════════════════════════════════════════ */}
        {activeTab === "range" && (
          <div className="space-y-6">
            {/* Date picker */}
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-medium">Reporting period:</p>
              <DateRangePicker value={dateRange} onChange={setDateRange} />
              <span className="text-sm text-muted-foreground">{rangeLabel}</span>
            </div>

            {/* Period KPIs */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: "Total Gross Sales", value: currency(totalGross), sub: "30-day period", icon: Banknote, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/60" },
                { label: "Total Settled", value: currency(totalSettled), sub: `${Math.round((totalSettled / totalGross) * 100)}% of gross`, icon: PackageCheck, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/60" },
                { label: "Unsettled Gap", value: currency(totalGross - totalSettled), sub: "in transit / pending", icon: TrendingUp, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/60" },
                { label: "Active Branches", value: branchOptions.length.toString(), sub: `${branches[0]!.staff} total staff`, icon: ShoppingCart, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/60" },
              ].map((c) => (
                <div key={c.label} className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{c.label}</p>
                    <span className={cn("rounded-full p-1.5 sm:p-2", c.bg, c.color)}>
                      <c.icon className="size-3.5 sm:size-4" />
                    </span>
                  </div>
                  <p className={cn("mt-2 text-xl sm:text-2xl font-bold", c.color)}>{c.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{c.sub}</p>
                </div>
              ))}
            </div>

            {/* 30-day trend */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs">
              <div className="mb-4">
                <h2 className="text-lg font-bold">30-Day Sales Trend</h2>
                <p className="text-xs text-muted-foreground">Daily gross sales vs settled — all branches</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendSeries} margin={{ left: -18, right: 4, top: 4 }}>
                    <defs>
                      <linearGradient id="g-trend-gross" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                    <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v)} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area name="Gross Sales" type="monotone" dataKey="sales" stroke="#22c55e" strokeWidth={2} fill="url(#g-trend-gross)" activeDot={{ r: 5 }} />
                    <Area name="Settled" type="monotone" dataKey="settled" stroke="#3b82f6" strokeWidth={1.5} fill="none" strokeDasharray="4 3" activeDot={{ r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Branch revenue bar chart */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs">
              <div className="mb-4">
                <h2 className="text-lg font-bold">Revenue by Branch</h2>
                <p className="text-xs text-muted-foreground">Period revenue vs stock value per branch</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={branchChartData} margin={{ left: -18, right: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                    <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v)} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar name="Revenue" dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar name="Stock Value" dataKey="stockValue" fill="#3b82f6" radius={[4, 4, 0, 0]} opacity={0.7} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Branch performance table */}
            <div className="rounded-xl border border-border bg-card shadow-2xs">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-lg font-bold">Branch Performance Summary</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Revenue, growth, stock value and settlement method per branch
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/40 text-left text-xs tracking-wide text-muted-foreground uppercase">
                      <th className="px-5 py-3 font-bold">Branch</th>
                      <th className="px-5 py-3 font-bold">City</th>
                      <th className="px-5 py-3 text-right font-bold">Revenue</th>
                      <th className="px-5 py-3 text-right font-bold">Growth</th>
                      <th className="px-5 py-3 text-right font-bold">Stock Value</th>
                      <th className="px-5 py-3 font-bold">Staff</th>
                      <th className="px-5 py-3 font-bold">Settlement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {branchOptions.map((b) => (
                      <tr key={b.id} className="transition-colors hover:bg-secondary/60">
                        <td className="px-5 py-3 font-semibold">{b.name}</td>
                        <td className="px-5 py-3 text-muted-foreground">{b.city}</td>
                        <td className="px-5 py-3 text-right font-bold text-accent">{currency(b.revenue)}</td>
                        <td className="px-5 py-3 text-right">
                          <span className={cn("inline-flex items-center gap-0.5 font-semibold text-xs", b.growth >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                            {b.growth >= 0
                              ? <ArrowUpRight className="size-3.5" />
                              : <ArrowDownRight className="size-3.5" />}
                            {Math.abs(b.growth)}%
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-medium">{currency(b.stockValue)}</td>
                        <td className="px-5 py-3 text-muted-foreground">{b.staff}</td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">{b.settlement}</td>
                      </tr>
                    ))}
                    <tr className="bg-secondary/30 font-bold border-t-2 border-border">
                      <td className="px-5 py-3 font-bold" colSpan={2}>Total</td>
                      <td className="px-5 py-3 text-right text-emerald-600 dark:text-emerald-400">
                        {currency(branchOptions.reduce((s, b) => s + b.revenue, 0))}
                      </td>
                      <td className="px-5 py-3" />
                      <td className="px-5 py-3 text-right">
                        {currency(branchOptions.reduce((s, b) => s + b.stockValue, 0))}
                      </td>
                      <td className="px-5 py-3">{branchOptions.reduce((s, b) => s + b.staff, 0)}</td>
                      <td className="px-5 py-3" />
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB 5 — INTER-BRANCH REPORT
        ══════════════════════════════════════════════ */}
        {activeTab === "interbranch" && (
          <div className="space-y-6">
            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: "Total Branches", value: branchOptions.length.toString(), sub: "active locations", icon: GitCompare, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/60" },
                { label: "Combined Revenue", value: currency(branchOptions.reduce((s, b) => s + b.revenue, 0)), sub: "all branches", icon: Banknote, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/60" },
                { label: "Combined Stock", value: currency(branchOptions.reduce((s, b) => s + b.stockValue, 0)), sub: "total inventory value", icon: Boxes, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/60" },
                { label: "Total Staff", value: branchOptions.reduce((s, b) => s + b.staff, 0).toString(), sub: "across all locations", icon: ShoppingCart, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/60" },
              ].map((c) => (
                <div key={c.label} className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{c.label}</p>
                    <span className={cn("rounded-full p-1.5 sm:p-2", c.bg, c.color)}>
                      <c.icon className="size-3.5 sm:size-4" />
                    </span>
                  </div>
                  <p className={cn("mt-2 text-xl sm:text-2xl font-bold", c.color)}>{c.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{c.sub}</p>
                </div>
              ))}
            </div>

            {/* Side-by-side branch comparison chart */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs">
              <div className="mb-4">
                <h2 className="text-lg font-bold">Branch Comparison</h2>
                <p className="text-xs text-muted-foreground">Revenue vs stock value across all branches</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={branchChartData} margin={{ left: -18, right: 4 }} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                    <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v)} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar name="Revenue" dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar name="Stock Value" dataKey="stockValue" fill="#8b5cf6" radius={[4, 4, 0, 0]} opacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed inter-branch comparison table */}
            <div className="rounded-xl border border-border bg-card shadow-2xs">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-lg font-bold">Branch-by-Branch Breakdown</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Full comparative view — revenue share, stock efficiency, and growth per branch
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/40 text-left text-xs tracking-wide text-muted-foreground uppercase">
                      <th className="px-5 py-3 font-bold">Branch</th>
                      <th className="px-5 py-3 text-right font-bold">Revenue</th>
                      <th className="px-5 py-3 font-bold">Rev. Share</th>
                      <th className="px-5 py-3 text-right font-bold">Growth</th>
                      <th className="px-5 py-3 text-right font-bold">Stock Value</th>
                      <th className="px-5 py-3 font-bold">Stock Share</th>
                      <th className="px-5 py-3 text-right font-bold">Staff</th>
                      <th className="px-5 py-3 text-right font-bold">Rev/Staff</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(() => {
                      const totalRev = branchOptions.reduce((s, b) => s + b.revenue, 0);
                      const totalStock = branchOptions.reduce((s, b) => s + b.stockValue, 0);
                      return [...branchOptions]
                        .sort((a, b) => b.revenue - a.revenue)
                        .map((b) => {
                          const revShare = Math.round((b.revenue / totalRev) * 100);
                          const stockShare = Math.round((b.stockValue / totalStock) * 100);
                          const revPerStaff = Math.round(b.revenue / b.staff);
                          return (
                            <tr key={b.id} className="transition-colors hover:bg-secondary/60">
                              <td className="px-5 py-3">
                                <p className="font-semibold">{b.name}</p>
                                <p className="text-xs text-muted-foreground">{b.city} · {b.settlement}</p>
                              </td>
                              <td className="px-5 py-3 text-right font-bold text-accent">{currency(b.revenue)}</td>
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                                    <div className="h-full rounded-full bg-accent" style={{ width: `${revShare}%` }} />
                                  </div>
                                  <span className="text-xs text-muted-foreground">{revShare}%</span>
                                </div>
                              </td>
                              <td className="px-5 py-3 text-right">
                                <span className={cn("inline-flex items-center gap-0.5 font-semibold text-xs", b.growth >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                                  {b.growth >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                                  {Math.abs(b.growth)}%
                                </span>
                              </td>
                              <td className="px-5 py-3 text-right font-medium">{currency(b.stockValue)}</td>
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${stockShare}%` }} />
                                  </div>
                                  <span className="text-xs text-muted-foreground">{stockShare}%</span>
                                </div>
                              </td>
                              <td className="px-5 py-3 text-right text-muted-foreground">{b.staff}</td>
                              <td className="px-5 py-3 text-right font-semibold">{currency(revPerStaff)}</td>
                            </tr>
                          );
                        });
                    })()}
                    <tr className="bg-secondary/30 border-t-2 border-border font-bold">
                      <td className="px-5 py-3">All Branches</td>
                      <td className="px-5 py-3 text-right text-emerald-600 dark:text-emerald-400">
                        {currency(branchOptions.reduce((s, b) => s + b.revenue, 0))}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">100%</td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-xs text-emerald-600 dark:text-emerald-400">
                          +{(branchOptions.reduce((s, b) => s + b.growth, 0) / branchOptions.length).toFixed(1)}% avg
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">{currency(branchOptions.reduce((s, b) => s + b.stockValue, 0))}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">100%</td>
                      <td className="px-5 py-3 text-right">{branchOptions.reduce((s, b) => s + b.staff, 0)}</td>
                      <td className="px-5 py-3 text-right">
                        {currency(Math.round(branchOptions.reduce((s, b) => s + b.revenue, 0) / branchOptions.reduce((s, b) => s + b.staff, 0)))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stock distribution per branch */}
            <div className="rounded-xl border border-border bg-card shadow-2xs">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-lg font-bold">Inventory Distribution per Branch</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">SKU count and stock levels held at each location</p>
              </div>
              <ul className="divide-y divide-border">
                {branchOptions.map((b) => {
                  const branchProducts = products.filter((p) => p.branch === b.name);
                  const lowCount = branchProducts.filter((p) => p.stock > 0 && p.stock <= p.threshold).length;
                  const outCount = branchProducts.filter((p) => p.stock === 0).length;
                  return (
                    <li key={b.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{b.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{b.city} · {branchProducts.length} SKUs</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                          <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {branchProducts.length - lowCount - outCount} healthy
                          </span>
                          {lowCount > 0 && (
                            <span className="rounded-full bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                              {lowCount} low
                            </span>
                          )}
                          {outCount > 0 && (
                            <span className="rounded-full bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                              {outCount} out
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${Math.round((b.stockValue / branchOptions.reduce((s, x) => s + x.stockValue, 0)) * 100)}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Stock value: {currency(b.stockValue)} · {Math.round((b.stockValue / branchOptions.reduce((s, x) => s + x.stockValue, 0)) * 100)}% of total
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
