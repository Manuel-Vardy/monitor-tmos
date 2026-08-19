import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Banknote,
  Receipt,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Download,
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
import { format } from "date-fns";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { currency } from "@/lib/mos-data";
import { MENU_ITEMS } from "@/lib/restaurant-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/eatery-sales")({
  head: () => ({
    meta: [
      { title: "Sales — Trite Merchant OS" },
      { name: "description", content: "Monitor eatery sales, covers, average check and dish revenue." },
      { property: "og:title", content: "Sales — Trite Merchant OS" },
    ],
  }),
  component: EaterySales,
});

// ─── Static sales data ────────────────────────────────────────────────────────

const weeklySales = [
  { day: "Mon", revenue: 2100, covers: 42 },
  { day: "Tue", revenue: 2850, covers: 57 },
  { day: "Wed", revenue: 3200, covers: 64 },
  { day: "Thu", revenue: 2750, covers: 55 },
  { day: "Fri", revenue: 4100, covers: 82 },
  { day: "Sat", revenue: 5600, covers: 112 },
  { day: "Sun", revenue: 4850, covers: 97 },
];

// Simulated transaction log
const TRANSACTIONS = [
  { id: "TXN-8801", dish: "Jollof Rice with Grilled Tilapia", qty: 2,  price: 95,  total: 190,  time: "12:15 PM", method: "Mobile Money", server: "Ama K." },
  { id: "TXN-8802", dish: "Charcoal Grilled Goat Chops",      qty: 1,  price: 130, total: 130,  time: "12:22 PM", method: "Cash",         server: "Kofi B." },
  { id: "TXN-8803", dish: "Fresh Sobolo Drink",                qty: 3,  price: 25,  total: 75,   time: "12:35 PM", method: "Mobile Money", server: "Ama K." },
  { id: "TXN-8804", dish: "Seafood Platter Deluxe",            qty: 1,  price: 280, total: 280,  time: "12:40 PM", method: "Card",         server: "Abena S." },
  { id: "TXN-8805", dish: "Fried Plantain (Kelewele)",         qty: 4,  price: 35,  total: 140,  time: "12:50 PM", method: "Cash",         server: "Kwame M." },
  { id: "TXN-8806", dish: "Banku with Tilapia Soup",           qty: 2,  price: 90,  total: 180,  time: "1:05 PM",  method: "Mobile Money", server: "Ama K." },
  { id: "TXN-8807", dish: "Suya Beef Skewers",                 qty: 3,  price: 45,  total: 135,  time: "1:12 PM",  method: "Mobile Money", server: "Kofi B." },
  { id: "TXN-8808", dish: "Yam Chips with Shito",              qty: 2,  price: 40,  total: 80,   time: "1:20 PM",  method: "Cash",         server: "Abena S." },
  { id: "TXN-8809", dish: "Seafood Platter Deluxe",            qty: 2,  price: 280, total: 560,  time: "1:35 PM",  method: "Mobile Money", server: "Kwame M." },
  { id: "TXN-8810", dish: "Fresh Sobolo Drink",                qty: 5,  price: 25,  total: 125,  time: "1:48 PM",  method: "Cash",         server: "Ama K." },
  { id: "TXN-8811", dish: "Jollof Rice with Grilled Tilapia", qty: 3,  price: 95,  total: 285,  time: "2:00 PM",  method: "Card",         server: "Kofi B." },
  { id: "TXN-8812", dish: "Charcoal Grilled Goat Chops",      qty: 2,  price: 130, total: 260,  time: "2:15 PM",  method: "Mobile Money", server: "Abena S." },
];

const methodColors: Record<string, string> = {
  "Mobile Money": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  "Cash":         "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  "Card":         "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
};

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
} as const;

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function Stat({ label, value, delta, sub, icon: Icon, accent = "green" }: {
  label: string; value: string; delta?: number; sub: string;
  icon: React.ElementType; accent?: "green" | "blue" | "amber" | "purple";
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
        <p className="text-[10px] sm:text-xs font-semibold tracking-wide text-muted-foreground uppercase leading-tight">{label}</p>
        <div className={cn("grid size-7 place-items-center rounded-lg", c.bg)}>
          <Icon className={cn("size-4 shrink-0", c.icon)} />
        </div>
      </div>
      <p className="num mt-2 text-xl sm:text-2xl font-bold leading-tight">{value}</p>
      <div className="mt-1.5 flex items-center gap-1 text-[10px] sm:text-xs">
        {delta !== undefined && (
          <span className={cn("num inline-flex items-center gap-0.5 font-semibold rounded-full px-1.5 py-0.5", c.bg, c.num)}>
            {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {Math.abs(delta)}%
          </span>
        )}
        <span className="text-muted-foreground leading-tight">{sub}</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function EaterySales() {
  const [search, setSearch]         = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("All");
  const [dateRange, setDateRange]   = useState<DateRange | undefined>(undefined);

  const weeklyRevenue = weeklySales.reduce((s, d) => s + d.revenue, 0);
  const weeklyCovers  = weeklySales.reduce((s, d) => s + d.covers, 0);
  const avgCheck      = Math.round(weeklyRevenue / weeklyCovers);
  const todayRevenue  = weeklySales[weeklySales.length - 1]!.revenue;

  const rangeLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, "dd MMM")} – ${format(dateRange.to, "dd MMM yyyy")}`
      : format(dateRange.from, "dd MMM yyyy")
    : "Last 7 days";

  const filtered = TRANSACTIONS.filter((t) => {
    const matchSearch = search === "" || t.dish.toLowerCase().includes(search.toLowerCase()) || t.server.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    const matchMethod = methodFilter === "All" || t.method === methodFilter;
    return matchSearch && matchMethod;
  });

  const filteredTotal = filtered.reduce((s, t) => s + t.total, 0);

  // Top dishes from menu items
  const topDishes = useMemo(() =>
    MENU_ITEMS.slice().sort((a, b) => b.dailySalesCount - a.dailySalesCount).slice(0, 5),
  []);

  return (
    <AppShell
      title="Sales"
      subtitle={`Osu Flagship · ${rangeLabel}`}
      actions={
        <Button size="sm" variant="outline" className="h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm">
          <Download className="size-3.5 sm:size-4" />
          <span className="hidden sm:inline">Export CSV</span>
        </Button>
      }
    >
      <div className="space-y-6">

        {/* KPI cards */}
        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Stat label="Today's Revenue"   value={currency(todayRevenue)}    delta={14.2} sub="vs yesterday"          icon={Banknote}   accent="green" />
          <Stat label="Weekly Revenue"    value={currency(weeklyRevenue)}   delta={8.5}  sub="last 7 days"           icon={TrendingUp} accent="blue" />
          <Stat label="Weekly Covers"     value={weeklyCovers.toLocaleString()} delta={6.1} sub="guests served"      icon={Users}      accent="amber" />
          <Stat label="Avg Check Value"   value={currency(avgCheck)}        delta={3.1}  sub="per guest"             icon={Receipt}    accent="purple" />
        </section>

        {/* Weekly sales trend */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Weekly Sales Trend</h2>
            <p className="text-xs text-muted-foreground">Revenue & covers over the last 7 days</p>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklySales} margin={{ left: -16, right: 4, top: 4 }}>
                <defs>
                  <linearGradient id="g-sales-rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => name === "revenue" ? [currency(v), "Revenue"] : [v, "Covers"]} />
                <Area name="revenue" type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fill="url(#g-sales-rev)" activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Top dishes + Transaction log */}
        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">

          {/* Top selling dishes */}
          <section className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">Top Selling Dishes</h2>
              <p className="text-xs text-muted-foreground mt-0.5">By orders today</p>
            </div>
            <ul className="divide-y divide-border">
              {topDishes.map((dish, i) => (
                <li key={dish.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{dish.name}</p>
                    <p className="text-xs text-muted-foreground">{dish.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="num text-sm font-bold text-[#22c55e]">{currency(dish.price * dish.dailySalesCount)}</p>
                    <p className="text-[10px] text-muted-foreground">{dish.dailySalesCount} sold</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Transaction log */}
          <section className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">Today's Transactions</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} sales · {currency(filteredTotal)} total</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="h-8 w-40 rounded-md border border-border bg-background pl-8 pr-3 text-xs outline-none placeholder:text-muted-foreground focus:border-[#22c55e]" />
                </div>
                <DateRangePicker value={dateRange} onChange={setDateRange} />
              </div>
            </div>

            {/* Method filter pills */}
            <div className="flex items-center gap-1.5 px-5 py-2.5 border-b border-border overflow-x-auto no-scrollbar">
              {["All", "Mobile Money", "Cash", "Card"].map((m) => (
                <button key={m} onClick={() => setMethodFilter(m)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all ${methodFilter === m ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-secondary text-muted-foreground hover:bg-border"}`}>
                  {m}
                </button>
              ))}
            </div>

            {/* Mobile cards */}
            <ul className="divide-y divide-border sm:hidden max-h-80 overflow-y-auto">
              {filtered.map((t) => (
                <li key={t.id} className="px-4 py-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{t.id}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", methodColors[t.method] ?? "bg-secondary text-muted-foreground")}>{t.method}</span>
                  </div>
                  <p className="text-sm font-medium leading-tight">{t.dish}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t.qty}× · {t.time}</span>
                    <span className="num font-bold text-[#22c55e]">{currency(t.total)}</span>
                  </div>
                </li>
              ))}
              {filtered.length === 0 && <li className="py-8 text-center text-sm text-muted-foreground">No transactions found.</li>}
            </ul>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-border bg-secondary/40 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3">Ref</th>
                    <th className="px-5 py-3">Dish</th>
                    <th className="px-5 py-3 text-right">Qty</th>
                    <th className="px-5 py-3 text-right">Total</th>
                    <th className="px-5 py-3">Method</th>
                    <th className="px-5 py-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((t) => (
                    <tr key={t.id} className="transition-colors hover:bg-secondary/30">
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{t.id}</td>
                      <td className="px-5 py-3 font-medium">{t.dish}</td>
                      <td className="px-5 py-3 text-right">{t.qty}</td>
                      <td className="px-5 py-3 text-right font-bold text-[#22c55e]">{currency(t.total)}</td>
                      <td className="px-5 py-3">
                        <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", methodColors[t.method] ?? "bg-secondary text-muted-foreground")}>{t.method}</span>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{t.time}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">No transactions found.</td></tr>
                  )}
                </tbody>
                {filtered.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-border bg-secondary/30 font-bold text-sm">
                      <td className="px-5 py-3" colSpan={3}>Total ({filtered.length} sales)</td>
                      <td className="px-5 py-3 text-right text-[#22c55e]">{currency(filteredTotal)}</td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </section>
        </div>

      </div>
    </AppShell>
  );
}
