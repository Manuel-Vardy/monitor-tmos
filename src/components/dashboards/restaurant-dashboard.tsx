import {
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  Receipt,
  TrendingUp,
  Users,
  Bell,
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
} from "recharts";

import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { currency } from "@/lib/mos-data";
import { MENU_ITEMS, RESTAURANT_SUMMARY } from "@/lib/restaurant-data";
import { cn } from "@/lib/utils";

// ─── Static data ──────────────────────────────────────────────────────────────

const salesTrend = [
  { day: "Mon", revenue: 2100, covers: 42 },
  { day: "Tue", revenue: 2850, covers: 57 },
  { day: "Wed", revenue: 3200, covers: 64 },
  { day: "Thu", revenue: 2750, covers: 55 },
  { day: "Fri", revenue: 4100, covers: 82 },
  { day: "Sat", revenue: 5600, covers: 112 },
  { day: "Sun", revenue: 4850, covers: 97 },
];

const topMenuItems = MENU_ITEMS.slice()
  .sort((a, b) => b.dailySalesCount - a.dailySalesCount)
  .slice(0, 6)
  .map((item) => ({
    name: item.name.length > 22 ? item.name.slice(0, 22) + "…" : item.name,
    revenue: item.price * item.dailySalesCount,
    category: item.category,
  }));

const weeklyCovers = salesTrend.reduce((s, d) => s + d.covers, 0);
const weeklyRevenue = salesTrend.reduce((s, d) => s + d.revenue, 0);
const avgOrderValue = Math.round(weeklyRevenue / weeklyCovers);

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
} as const;

// ─── KPI card ─────────────────────────────────────────────────────────────────

function Stat({
  label,
  value,
  delta,
  sub,
  icon: Icon,
  accent = "green",
}: {
  label: string;
  value: string;
  delta?: number;
  sub: string;
  icon: React.ElementType;
  accent?: "green" | "blue" | "amber" | "purple";
}) {
  const up = (delta ?? 0) >= 0;

  const palette = {
    green:  { bg: "bg-emerald-50 dark:bg-emerald-950/40", icon: "text-emerald-500", num: "text-emerald-700 dark:text-emerald-400" },
    blue:   { bg: "bg-blue-50 dark:bg-blue-950/40",       icon: "text-blue-500",    num: "text-blue-700 dark:text-blue-400" },
    amber:  { bg: "bg-amber-50 dark:bg-amber-950/40",     icon: "text-amber-500",   num: "text-amber-700 dark:text-amber-400" },
    purple: { bg: "bg-purple-50 dark:bg-purple-950/40",   icon: "text-purple-500",  num: "text-purple-700 dark:text-purple-400" },
  };
  const c = palette[accent];

  return (
    <div className="rounded-xl bg-card p-4 shadow-xs border border-border">
      <div className="flex items-start justify-between">
        <p className="text-[10px] sm:text-xs font-semibold tracking-wide text-muted-foreground uppercase leading-tight">
          {label}
        </p>
        <div className={cn("grid size-7 place-items-center rounded-lg", c.bg)}>
          <Icon className={cn("size-4 shrink-0", c.icon)} />
        </div>
      </div>
      <p className="num mt-2 text-xl sm:text-2xl font-bold leading-tight">{value}</p>
      <div className="mt-1.5 flex items-center gap-1 text-[10px] sm:text-xs">
        {delta !== undefined && (
          <span className={cn("num inline-flex items-center gap-0.5 font-semibold rounded-full px-1.5 py-0.5", c.bg, c.num)}>
            {up
              ? <ArrowUpRight className="size-3.5" />
              : <ArrowDownRight className="size-3.5" />}
            {Math.abs(delta)}%
          </span>
        )}
        <span className="text-muted-foreground leading-tight">{sub}</span>
      </div>
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export function RestaurantDashboard() {
  return (
    <AppShell
      title="Eatery Operations"
      subtitle="Osu Flagship · Live overview"
    >
      <div className="space-y-6">

        {/* ── Mobile hero ── */}
        <div className="lg:hidden space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <div>
              <p className="text-xs text-muted-foreground">Good morning 🌤</p>
              <h2 className="text-xl font-bold leading-tight">Eatery</h2>
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

          {/* Mobile hero card */}
          <div className="relative overflow-hidden rounded-2xl bg-[#22c55e] p-5 text-white shadow-lg">
            <div
              className="pointer-events-none absolute rounded-full bg-white/10"
              style={{ width: "260px", height: "260px", bottom: "-120px", right: "-60px" }}
            />
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <p className="text-[11px] font-bold tracking-widest uppercase text-white/80">
                  Weekly Revenue
                </p>
                <TrendingUp className="size-6 opacity-70" />
              </div>
              <p className="num mt-2 text-3xl font-extrabold leading-none tracking-tight">
                {currency(weeklyRevenue)}
              </p>
              <div className="mt-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/80">
                  Covers · {weeklyCovers} guests
                </p>
                <p className="mt-0.5 text-xs text-white/75">
                  Avg order value {currency(avgOrderValue)} · this week
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── KPI grid (4 cards) ── */}
        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Stat
            label="Weekly Revenue"
            value={currency(weeklyRevenue)}
            delta={14.2}
            sub="vs last week"
            icon={Banknote}
            accent="green"
          />
          <Stat
            label="Covers This Week"
            value={weeklyCovers.toLocaleString()}
            delta={8.5}
            sub="total guests served"
            icon={Users}
            accent="blue"
          />
          <Stat
            label="Avg Order Value"
            value={currency(avgOrderValue)}
            delta={3.1}
            sub="per guest this week"
            icon={Receipt}
            accent="amber"
          />
          <Stat
            label="Unbilled Tabs"
            value={currency(RESTAURANT_SUMMARY.activeOrderRevenue)}
            sub="open guest checks"
            icon={TrendingUp}
            accent="purple"
          />
        </section>

        {/* ── Sales trend + Top menu items ── */}
        <section className="grid gap-6 lg:grid-cols-2">

          {/* Sales trend area chart */}
          <Card className="p-5 shadow-none">
            <div className="mb-4">
              <h2 className="text-sm font-semibold">Weekly Sales Trend</h2>
              <p className="text-xs text-muted-foreground">Revenue & covers over the last 7 days</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={salesTrend}
                  margin={{ left: -16, right: 4, top: 4, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="g-eatery-rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                  />
                  <YAxis
                    tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v: number, name: string) =>
                      name === "revenue" ? [currency(v), "Revenue"] : [v, "Covers"]
                    }
                  />
                  <Area
                    name="revenue"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="url(#g-eatery-rev)"
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Day-by-day mini summary */}
            <div className="mt-4 grid grid-cols-7 gap-1">
              {salesTrend.map((d) => (
                <div key={d.day} className="text-center">
                  <div
                    className="mx-auto mb-1 rounded-sm bg-[#22c55e]/20"
                    style={{ height: `${Math.round((d.revenue / 5600) * 40) + 4}px` }}
                  />
                  <p className="text-[9px] font-medium text-muted-foreground">{d.day}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Top selling menu items horizontal bar chart */}
          <Card className="p-5 shadow-none">
            <div className="mb-4">
              <h2 className="text-sm font-semibold">Top Selling Menu Items</h2>
              <p className="text-xs text-muted-foreground">Revenue by dish · today's sales</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topMenuItems}
                  layout="vertical"
                  margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    fontSize={10}
                    stroke="var(--color-muted-foreground)"
                    tickFormatter={(v: number) => `GHS ${(v / 1000).toFixed(1)}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tickLine={false}
                    axisLine={false}
                    fontSize={10}
                    stroke="var(--color-muted-foreground)"
                  />
                  <Tooltip
                    cursor={{ fill: "var(--color-secondary)" }}
                    contentStyle={tooltipStyle}
                    formatter={(v: number) => [currency(v), "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        {/* ── Menu items table ── */}
        <section className="rounded-lg border border-border bg-card shadow-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">Menu Performance</h2>
              <p className="text-xs text-muted-foreground">Today's sales count and revenue per dish</p>
            </div>
          </div>

          {/* Mobile: card list */}
          <ul className="divide-y divide-border sm:hidden">
            {MENU_ITEMS.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.dailySalesCount} sold today</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="num text-sm font-bold text-[#22c55e]">
                    {currency(item.price * item.dailySalesCount)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{currency(item.price)} each</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3">Item</th>
                  <th className="px-5 py-3">Unit Price</th>
                  <th className="px-5 py-3">Sold Today</th>
                  <th className="px-5 py-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {MENU_ITEMS.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-5 py-3 font-medium">{item.name}</td>
                    <td className="px-5 py-3 num">{currency(item.price)}</td>
                    <td className="px-5 py-3 num font-semibold">{item.dailySalesCount}</td>
                    <td className="px-5 py-3 num font-bold text-[#22c55e] text-right">
                      {currency(item.price * item.dailySalesCount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </AppShell>
  );
}
