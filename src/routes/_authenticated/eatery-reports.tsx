import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Download,
  Banknote,
  UtensilsCrossed,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  TrendingUp,
  CalendarDays,
  ChefHat,
  BarChart2,
  Receipt,
  Flame,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  PieChart,
  Pie,
} from "recharts";import { format } from "date-fns";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { currency } from "@/lib/mos-data";
import { MENU_ITEMS, WASTAGE_LOGS } from "@/lib/restaurant-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/eatery-reports")({
  head: () => ({
    meta: [
      { title: "Eatery Reports — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Eatery performance reports: daily covers, food revenue, menu analysis, kitchen efficiency and wastage analytics.",
      },
      { property: "og:title", content: "Eatery Reports — Trite Merchant OS" },
    ],
  }),
  component: EateryReports,
});

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
} as const;

// ─── Static report data ───────────────────────────────────────────────────────

const dailySales = [
  { day: "Mon", revenue: 2100, covers: 42, avgCheck: 50 },
  { day: "Tue", revenue: 2850, covers: 57, avgCheck: 50 },
  { day: "Wed", revenue: 3200, covers: 64, avgCheck: 50 },
  { day: "Thu", revenue: 2750, covers: 55, avgCheck: 50 },
  { day: "Fri", revenue: 4100, covers: 82, avgCheck: 50 },
  { day: "Sat", revenue: 5600, covers: 112, avgCheck: 50 },
  { day: "Sun", revenue: 4850, covers: 97, avgCheck: 50 },
];

const monthlySales = [
  { month: "Feb", revenue: 48200, covers: 964 },
  { month: "Mar", revenue: 52100, covers: 1042 },
  { month: "Apr", revenue: 49800, covers: 996 },
  { month: "May", revenue: 55300, covers: 1106 },
  { month: "Jun", revenue: 61200, covers: 1224 },
  { month: "Jul", revenue: 67400, covers: 1348 },
  { month: "Aug", revenue: 25450, covers: 509 },
];

const paymentMix = [
  { method: "Mobile Money (MTN)", value: 52, amount: 13234 },
  { method: "Mobile Money (Telecel)", value: 18, amount: 4581 },
  { method: "Cash", value: 24, amount: 6108 },
  { method: "Card (Visa/MC)", value: 6, amount: 1527 },
];

const categoryRevenue = [
  { category: "Mains", revenue: 8360, color: "#22c55e" },
  { category: "Grill",  revenue: 5460, color: "#f59e0b" },
  { category: "Seafood", revenue: 3920, color: "#3b82f6" },
  { category: "Starters", revenue: 5075, color: "#8b5cf6" },
  { category: "Drinks", revenue: 2200, color: "#06b6d4" },
  { category: "Desserts", revenue: 840, color: "#ec4899" },
];

const menuReport = MENU_ITEMS.map((item) => ({
  ...item,
  totalRevenue: item.price * item.dailySalesCount,
  grossProfit: (item.price - item.cost) * item.dailySalesCount,
  margin: Math.round(((item.price - item.cost) / item.price) * 100),
})).sort((a, b) => b.totalRevenue - a.totalRevenue);

const totalMenuRevenue = menuReport.reduce((s, i) => s + i.totalRevenue, 0);
const totalWastageCost = WASTAGE_LOGS.reduce((s, l) => s + l.costValue, 0);
const weeklyRevenue = dailySales.reduce((s, d) => s + d.revenue, 0);
const weeklyCovers = dailySales.reduce((s, d) => s + d.covers, 0);
const avgCheck = Math.round(weeklyRevenue / weeklyCovers);

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, delta, icon: Icon, color, bg,
}: {
  label: string; value: string; sub: string; delta?: number;
  icon: React.ElementType; color: string; bg: string;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <span className={cn("rounded-full p-1.5 sm:p-2", bg, color)}>
          <Icon className="size-3.5 sm:size-4" />
        </span>
      </div>
      <p className={cn("mt-2 text-xl sm:text-2xl font-bold", color)}>{value}</p>
      <div className="mt-1 flex items-center gap-1.5">
        {delta !== undefined && (
          <span className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
            up ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
               : "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400",
          )}>
            {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {Math.abs(delta)}%
          </span>
        )}
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function EateryReports() {
  const [activeTab, setActiveTab] = useState<"today" | "menu" | "range">("today");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const rangeLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, "dd MMM")} – ${format(dateRange.to, "dd MMM yyyy")}`
      : format(dateRange.from, "dd MMM yyyy")
    : "Last 30 days";

  const tabs = [
    { key: "today"   as const, label: "Today's Report",   icon: CalendarDays },
    { key: "menu"    as const, label: "Menu Report",       icon: UtensilsCrossed },
    { key: "range"   as const, label: "Date Range Report", icon: BarChart2 },
  ];

  return (
    <AppShell
      title="Eatery Reports"
      subtitle="Food revenue · menu performance · kitchen efficiency · wastage"
      actions={
        <Button size="sm" className="h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm bg-[#22c55e] text-white hover:bg-[#16a34a]">
          <Download className="size-3.5 sm:size-4" />
          <span className="hidden sm:inline">Export CSV</span>
          <span className="sm:hidden">Export</span>
        </Button>
      }
    >
      <div className="space-y-6">

        {/* Tab bar */}
        <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                "flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === t.key
                  ? "border-[#22c55e] text-[#22c55e]"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <t.icon className="size-4 shrink-0" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ══ TAB 1 — TODAY'S REPORT ══ */}
        {activeTab === "today" && (
          <div className="space-y-6">
            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <KpiCard label="Today's Revenue"    value={currency(dailySales[5]!.revenue)} delta={14.2} sub="vs last Friday"        icon={Banknote}       color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-950/60" />
              <KpiCard label="Covers Served"      value={`${dailySales[5]!.covers}`}       delta={8.5}  sub="guests today"           icon={Users}          color="text-blue-600 dark:text-blue-400"    bg="bg-blue-50 dark:bg-blue-950/60" />
              <KpiCard label="Avg Check Value"    value={currency(avgCheck)}                delta={3.1}  sub="per guest"              icon={Receipt}        color="text-amber-600 dark:text-amber-400"  bg="bg-amber-50 dark:bg-amber-950/60" />
              <KpiCard label="Wastage Cost"       value={currency(totalWastageCost)}        sub="spoilage & prep loss"                icon={Trash2}         color="text-rose-600 dark:text-rose-400"    bg="bg-rose-50 dark:bg-rose-950/60" />
            </div>

            {/* Daily sales & covers area chart */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs">
              <div className="mb-4">
                <h2 className="text-sm font-semibold">Weekly Sales Trend</h2>
                <p className="text-xs text-muted-foreground">Revenue & covers — last 7 days</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailySales} margin={{ left: -16, right: 4, top: 4 }}>
                    <defs>
                      <linearGradient id="g-rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                    <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => name === "revenue" ? [currency(v), "Revenue"] : [v, "Covers"]} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area name="revenue" type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fill="url(#g-rev)" activeDot={{ r: 5 }} />
                    <Area name="covers"  type="monotone" dataKey="covers"  stroke="#3b82f6" strokeWidth={1.5} fill="none" strokeDasharray="4 3" activeDot={{ r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payment method breakdown */}
            <div className="rounded-xl border border-border bg-card shadow-xs">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold">Payment Method Breakdown</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Today's food revenue split by payment method</p>
              </div>
              <ul className="divide-y divide-border">
                {paymentMix.map((m) => (
                  <li key={m.method} className="flex items-center gap-4 px-5 py-3.5">
                    <span className="w-44 truncate text-sm font-medium">{m.method}</span>
                    <div className="flex-1">
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-[#22c55e]" style={{ width: `${m.value}%` }} />
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

        {/* ══ TAB 2 — MENU REPORT ══ */}
        {activeTab === "menu" && (
          <div className="space-y-6">
            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <KpiCard label="Total Menu Revenue"  value={currency(totalMenuRevenue)}        delta={11.3} sub="all dishes today"          icon={Banknote}       color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-950/60" />
              <KpiCard label="Total Dishes Sold"   value={`${menuReport.reduce((s, i) => s + i.dailySalesCount, 0)}`} delta={7.4} sub="across all items" icon={UtensilsCrossed} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-950/60" />
              <KpiCard label="Best Margin Item"    value={`${Math.max(...menuReport.map(i => i.margin))}%`} sub="gross profit margin" icon={TrendingUp} color="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-950/60" />
              <KpiCard label="Menu Items Active"   value={`${MENU_ITEMS.filter(i => i.available).length} / ${MENU_ITEMS.length}`} sub="available on menu" icon={ChefHat} color="text-purple-600 dark:text-purple-400" bg="bg-purple-50 dark:bg-purple-950/60" />
            </div>

            {/* Category revenue bar + pie */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold">Revenue by Category</h2>
                  <p className="text-xs text-muted-foreground">Today's food revenue split by menu category</p>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryRevenue} margin={{ left: -16, right: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="category" tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                      <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v)} />
                      <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                        {categoryRevenue.map((c) => (
                          <Cell key={c.category} fill={c.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold">Category Share</h2>
                  <p className="text-xs text-muted-foreground">Proportion of total revenue per category</p>
                </div>
                <div className="h-56 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryRevenue}
                        dataKey="revenue"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                      >
                        {categoryRevenue.map((c) => (
                          <Cell key={c.category} fill={c.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v)} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Detailed menu performance table */}
            <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
              <div className="border-b border-border px-5 py-4 sm:px-6 sm:py-5">
                <h2 className="text-base font-bold sm:text-lg">Menu Item Performance</h2>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  Ranked by revenue · margin per dish
                </p>
              </div>
              {/* Mobile cards */}
              <ul className="divide-y divide-border sm:hidden">
                {menuReport.map((item, i) => (
                  <li key={item.id} className="px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
                    </div>
                    <p className="text-sm font-semibold leading-tight">{item.name}</p>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <p className="text-muted-foreground">Sold</p>
                        <p className="num font-semibold">{item.dailySalesCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Price</p>
                        <p className="num font-medium">{currency(item.price)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Revenue</p>
                        <p className="num font-bold text-[#22c55e]">{currency(item.totalRevenue)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Margin</p>
                        <p className="num font-bold">{item.margin}%</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/40 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="w-12 px-5 py-3.5">#</th>
                      <th className="px-5 py-3.5">Dish Name</th>
                      <th className="px-5 py-3.5 text-right">Selling Price</th>
                      <th className="px-5 py-3.5 text-right">Sold Today</th>
                      <th className="px-5 py-3.5 text-right">Revenue</th>
                      <th className="px-5 py-3.5 text-right">Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {menuReport.map((item, i) => (
                      <tr key={item.id} className="transition-colors hover:bg-secondary/30">
                        <td className="px-5 py-3.5 text-xs font-bold text-muted-foreground w-12">{i + 1}</td>
                        <td className="px-5 py-3.5 font-semibold">{item.name}</td>
                        <td className="px-5 py-3.5 text-right num font-medium">{currency(item.price)}</td>
                        <td className="px-5 py-3.5 text-right num font-semibold">{item.dailySalesCount}</td>
                        <td className="px-5 py-3.5 text-right num font-bold text-[#22c55e]">{currency(item.totalRevenue)}</td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold", item.margin >= 60 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" : item.margin >= 40 ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" : "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400")}>
                            {item.margin}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB 3 — DATE RANGE REPORT ══ */}
        {activeTab === "range" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-medium">Reporting period:</p>
              <DateRangePicker value={dateRange} onChange={setDateRange} />
              <span className="text-sm text-muted-foreground">{rangeLabel}</span>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <KpiCard label="Total Revenue"    value={currency(monthlySales.reduce((s, d) => s + d.revenue, 0))} delta={18.4} sub="Aug YTD"      icon={Banknote}       color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-950/60" />
              <KpiCard label="Total Covers"     value={monthlySales.reduce((s, d) => s + d.covers, 0).toLocaleString()} delta={12.1} sub="guests served" icon={Users} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-950/60" />
              <KpiCard label="Peak Month"       value="July" sub={currency(67400) + " revenue"} icon={TrendingUp}  color="text-amber-600 dark:text-amber-400"  bg="bg-amber-50 dark:bg-amber-950/60" />
              <KpiCard label="Avg Monthly Rev"  value={currency(Math.round(monthlySales.slice(0, 6).reduce((s, d) => s + d.revenue, 0) / 6))} sub="6-month average" icon={Flame} color="text-purple-600 dark:text-purple-400" bg="bg-purple-50 dark:bg-purple-950/60" />
            </div>

            {/* Monthly trend */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs">
              <div className="mb-4">
                <h2 className="text-sm font-semibold">Monthly Revenue Trend</h2>
                <p className="text-xs text-muted-foreground">Food revenue & covers by month — Feb to Aug 2026</p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlySales} margin={{ left: -16, right: 4, top: 4 }}>
                    <defs>
                      <linearGradient id="g-monthly" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                    <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => name === "revenue" ? [currency(v), "Revenue"] : [v, "Covers"]} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area name="revenue" type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fill="url(#g-monthly)" activeDot={{ r: 5 }} />
                    <Area name="covers"  type="monotone" dataKey="covers"  stroke="#3b82f6" strokeWidth={1.5} fill="none" strokeDasharray="4 3" activeDot={{ r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly table */}
            <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold">Monthly Performance Summary</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Revenue, covers and average check value per month</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/40 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="px-5 py-3">Month</th>
                      <th className="px-5 py-3 text-right">Revenue</th>
                      <th className="px-5 py-3 text-right">Covers</th>
                      <th className="px-5 py-3 text-right">Avg Check</th>
                      <th className="px-5 py-3">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {monthlySales.map((m, i) => {
                      const prev = monthlySales[i - 1];
                      const delta = prev ? Math.round(((m.revenue - prev.revenue) / prev.revenue) * 100) : null;
                      return (
                        <tr key={m.month} className="transition-colors hover:bg-secondary/30">
                          <td className="px-5 py-3 font-semibold">{m.month} 2026</td>
                          <td className="px-5 py-3 text-right font-bold text-[#22c55e]">{currency(m.revenue)}</td>
                          <td className="px-5 py-3 text-right">{m.covers}</td>
                          <td className="px-5 py-3 text-right">{currency(Math.round(m.revenue / m.covers))}</td>
                          <td className="px-5 py-3">
                            {delta !== null && (
                              <span className={cn("inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold", delta >= 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400")}>
                                {delta >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                                {Math.abs(delta)}%
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
