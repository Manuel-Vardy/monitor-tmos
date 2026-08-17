import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  ArrowUpRight,
  ArrowDownRight,
  TriangleAlert,
  Plus,
  Banknote,
  Receipt,
  Wallet,
  PackageSearch,
  X,
  Filter,
  Bell,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";

import { AppShell } from "@/components/app-shell";
import { StatusBadge, payTone } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import {
  activityRows,
  branchName,
  branches,
  currency,
  paymentMixFor,
  productRows,
  seriesFor,
} from "@/lib/mos-data";
import { cn } from "@/lib/utils";

const branchColors: Record<string, string> = {
  all: "bg-emerald-600 text-white",
  osu: "bg-blue-600 text-white",
  "east-legon": "bg-purple-600 text-white",
  kumasi: "bg-amber-600 text-white",
  takoradi: "bg-teal-600 text-white",
};


const statusColors: Record<string, string> = {
  settled: "bg-emerald-600 text-white",
  confirmed: "bg-emerald-600 text-white",
  pending: "bg-amber-500 text-white",
  failed: "bg-red-600 text-white",
};

function Chip({
  active,
  onClick,
  children,
  activeClass = "bg-[#22c55e] text-white",
}: {
  active?: boolean | undefined;
  onClick: () => void;
  children: React.ReactNode;
  activeClass?: string | undefined;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium transition-all shadow-xs cursor-pointer",
        active ? activeClass : "bg-card hover:bg-secondary text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Stat({
  label,
  value,
  delta,
  sub,
  icon: Icon,
  accentColor = "green",
}: {
  label: string;
  value: string;
  delta?: number;
  sub: string;
  icon: React.ElementType;
  accentColor?: "green" | "blue" | "orange" | "red";
}) {
  const up = (delta ?? 0) >= 0;

  const colorMap = {
    green:  { arrow: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40", num: "text-emerald-700 dark:text-emerald-400", icon: "text-emerald-500" },
    blue:   { arrow: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/40",       num: "text-blue-700 dark:text-blue-400",       icon: "text-blue-500" },
    orange: { arrow: "text-orange-500",  bg: "bg-orange-50 dark:bg-orange-950/40",   num: "text-orange-700 dark:text-orange-400",   icon: "text-orange-500" },
    red:    { arrow: "text-red-600",     bg: "bg-red-50 dark:bg-red-950/40",         num: "text-red-700 dark:text-red-400",         icon: "text-red-500" },
  };
  const colors = colorMap[up ? accentColor : "red"];

  return (
    <div data-testid="kpi-card" className="rounded-xl bg-card p-3 sm:p-4 shadow-xs">
      <div className="flex items-start justify-between">
        <p className="text-[10px] sm:text-xs font-semibold tracking-wide text-muted-foreground uppercase leading-tight">{label}</p>
        <div className={cn("grid size-6 sm:size-7 place-items-center rounded-lg", colors.bg)}>
          <Icon className={cn("size-3.5 sm:size-4 shrink-0", colors.icon)} />
        </div>
      </div>
      <p className="num mt-2 text-base sm:text-2xl font-bold leading-tight">{value}</p>
      <div className="mt-1.5 flex items-center gap-1 text-[10px] sm:text-xs">
        {delta !== undefined && (
          <span className={cn("num inline-flex items-center gap-0.5 font-semibold rounded-full px-1.5 py-0.5", colors.bg, colors.num)}>
            {up ? <ArrowUpRight className="size-3 sm:size-3.5" /> : <ArrowDownRight className="size-3 sm:size-3.5" />}
            {Math.abs(delta)}%
          </span>
        )}
        <span className="text-muted-foreground leading-tight">{sub}</span>
      </div>
    </div>
  );
}

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
} as const;

const branchMetrics = [
  { key: "revenue", label: "Revenue" },
  { key: "stockValue", label: "Stock value" },
  { key: "staff", label: "Staff" },
] as const;

export function RetailDashboard() {
  const [branchId, setBranchId] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [showSales, setShowSales] = useState(true);
  const [showSettled, setShowSettled] = useState(true);
  const [day, setDay] = useState<string | null>(null);
  const [method, setMethod] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [stockView, setStockView] = useState<"all" | "critical">("all");
  const [branchMetric, setBranchMetric] =
    useState<(typeof branchMetrics)[number]["key"]>("revenue");

  const series = useMemo(() => seriesFor(branchId, "30d"), [branchId]);
  const mix = useMemo(() => paymentMixFor(branchId), [branchId]);

  const totals = useMemo(() => {
    const rows = day ? series.filter((s) => s.day === day) : series;
    const sales = rows.reduce((s, r) => s + r.sales, 0);
    const settled = rows.reduce((s, r) => s + r.settled, 0);
    const txns = Math.max(1, Math.round(sales / 151));
    return { sales, settled, txns, unsettled: sales - settled };
  }, [series, day]);

  const lowStock = useMemo(
    () =>
      productRows
        .filter((p) => p.stock <= p.threshold)
        .filter((p) => branchId === "all" || p.branchId === branchId)
        .filter((p) =>
          stockView === "critical" ? p.stock === 0 || p.stock <= p.threshold / 2 : true,
        ),
    [branchId, stockView],
  );

  const rows = useMemo(
    () =>
      activityRows
        .filter((a) => branchId === "all" || a.branchId === branchId)
        .filter(
          (a) => !method || a.method.toLowerCase().includes(method.toLowerCase().split(" ")[0]!),
        )
        .filter((a) => !status || a.status === status),
    [branchId, method, status],
  );

  const filters = [
    branchId !== "all" && { label: branchName(branchId), clear: () => setBranchId("all") },
    day && { label: `Day · ${day}`, clear: () => setDay(null) },
    method && { label: `Method · ${method}`, clear: () => setMethod(null) },
    status && { label: `Status · ${status}`, clear: () => setStatus(null) },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const clearAll = () => {
    setBranchId("all");
    setDateRange(undefined);
    setDay(null);
    setMethod(null);
    setStatus(null);
  };

  const rangeLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, "dd MMM")} – ${format(dateRange.to, "dd MMM yyyy")}`
      : format(dateRange.from, "dd MMM yyyy")
    : "Last 30 days";

  const settledPct = Math.round((totals.settled / Math.max(1, totals.sales)) * 100);

  return (
    <AppShell
      title="Organisation dashboard"
      subtitle={`Sarpong Retail Ltd · ${branchName(branchId)} · ${rangeLabel}`}
      actions={
        <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/85">
          <Plus className="size-4" /> New sale
        </Button>
      }
    >
      <div className="space-y-6">
        {/* ── Mobile hero section ── */}
        <div className="sm:hidden space-y-4">
          {/* Greeting row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Good morning 🌤</p>
              <h2 className="text-xl font-bold leading-tight">Efua Sarpong</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 shadow-xs">
                <span className="size-1.5 rounded-full bg-emerald-500" /> Live
              </span>
              <button className="relative grid size-9 place-items-center rounded-full bg-card shadow-xs">
                <Bell className="size-4" />
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500" />
              </button>
            </div>
          </div>

          {/* Green hero card */}
          <div className="relative overflow-hidden rounded-2xl bg-[#22c55e] p-5 text-white">
            {/* Background decorative circle layer (z-0) */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
              {/* Bottom-right decorative circle */}
              <div
                className="absolute rounded-full bg-white/10"
                style={{ width: "260px", height: "260px", bottom: "-120px", right: "-60px" }}
              />
            </div>

            {/* Foreground content layer (z-10) */}
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">Gross Sales</p>
                <Banknote className="size-6 opacity-70" />
              </div>
              <p className="num mt-2 text-3xl font-extrabold tracking-tight">{currency(totals.sales)}</p>

              <div className="mt-3">
                <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">
                  Settled · {currency(totals.settled)}
                </p>
                <p className="mt-0.5 text-xs opacity-70">
                  {settledPct}% of gross · {totals.txns.toLocaleString()} transactions
                </p>
              </div>

              <div className="mt-4 flex gap-3">
                <a
                  href="/sales"
                  className="flex-1 rounded-xl bg-[#166534] py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#14532d]"
                >
                  Sales
                </a>
                <a
                  href="/inventory"
                  className="flex-1 rounded-xl bg-white/20 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/30"
                >
                  Inventory
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <section className="flex flex-wrap items-center gap-2 rounded-xl bg-card p-3 shadow-xs">
          <Filter className="size-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-1.5">
            {branches.map((b) => (
              <Chip
                key={b.id}
                active={branchId === b.id}
                onClick={() => setBranchId(b.id)}
                activeClass={branchColors[b.id]}
              >
                {b.id === "all" ? "All branches" : b.name}
              </Chip>
            ))}
          </div>
          <span className="mx-1 hidden h-5 w-px bg-muted sm:block" />
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          {filters.length > 0 && (
            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              {filters.map((f) => (
                <button
                  key={f.label}
                  onClick={f.clear}
                  className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-1 text-xs font-medium"
                >
                  {f.label}
                  <X className="size-3" />
                </button>
              ))}
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear all
              </Button>
            </div>
          )}
        </section>

        {/* KPI cards — 4 cards: Gross Sales, Settled by Trite, Transactions, Stock at Risk */}
        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Stat
            label="Gross sales"
            value={currency(totals.sales)}
            delta={12.4}
            sub={day ? `on ${day}` : "vs previous period"}
            icon={Banknote}
            accentColor="green"
          />
          <Stat
            label="Settled by Trite"
            value={currency(totals.settled)}
            delta={9.8}
            sub={`${settledPct}% of gross`}
            icon={Wallet}
            accentColor="blue"
          />
          <Stat
            label="Transactions"
            value={totals.txns.toLocaleString()}
            delta={5.2}
            sub="avg GHS 151"
            icon={Receipt}
            accentColor="orange"
          />
          <Stat
            label="Stock at risk"
            value={`${lowStock.length} SKUs`}
            sub="below threshold"
            icon={PackageSearch}
            accentColor="red"
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4 xl:col-span-2">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">Sales vs settlement</h2>
                <p className="text-xs text-muted-foreground">
                  Click a point to drill into a single day · {branchName(branchId)}
                </p>
              </div>
              <div className="flex gap-1.5">
                <Chip
                  active={showSales}
                  onClick={() => setShowSales((v) => !v)}
                  activeClass="bg-emerald-600 text-white border-emerald-600"
                >
                  Sold
                </Chip>
                <Chip
                  active={showSettled}
                  onClick={() => setShowSettled((v) => !v)}
                  activeClass="bg-blue-600 text-white border-blue-600"
                >
                  Settled
                </Chip>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={series}
                  margin={{ left: -18, right: 4, top: 4 }}
                  onClick={(e) => {
                    const d = (e?.activeLabel as string) ?? null;
                    setDay((prev) => (prev === d ? null : d));
                  }}
                >
                  <defs>
                    <linearGradient id="g-sales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.02} />
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
                    fontSize={12}
                    stroke="var(--color-muted-foreground)"
                  />
                  <YAxis
                    tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    stroke="var(--color-muted-foreground)"
                  />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {showSales && (
                    <Area
                      name="Sold"
                      type="monotone"
                      dataKey="sales"
                      stroke="var(--color-accent)"
                      strokeWidth={2}
                      fill="url(#g-sales)"
                      activeDot={{ r: 5 }}
                    />
                  )}
                  {showSettled && (
                    <Area
                      name="Settled"
                      type="monotone"
                      dataKey="settled"
                      stroke="var(--color-chart-2)"
                      strokeWidth={2}
                      fill="transparent"
                      strokeDasharray="4 3"
                      activeDot={{ r: 5 }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {day && (
              <p className="mt-3 rounded-md bg-secondary px-3 py-2 text-xs">
                <span className="font-medium">{day}</span> · sold {currency(totals.sales)} · settled{" "}
                {currency(totals.settled)} · outstanding {currency(totals.unsettled)}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Payment method mix</h2>
            <p className="text-xs text-muted-foreground">Click a method to filter activity</p>
            <ul className="mt-4 space-y-3">
              {mix.map((m) => {
                const active = method === m.method;
                return (
                  <li key={m.method}>
                    <button
                      onClick={() => setMethod(active ? null : m.method)}
                      aria-pressed={active}
                      className="w-full rounded-md p-1 text-left transition-colors hover:bg-secondary/70"
                    >
                      <div className="mb-1 flex items-baseline justify-between text-sm">
                        <span className={cn(active && "font-semibold")}>{m.method}</span>
                        <span className="num text-xs text-muted-foreground">
                          {currency(m.amount)} · {m.value}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            active ? "bg-foreground" : "bg-accent",
                          )}
                          style={{ width: `${m.value}%` }}
                        />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4 xl:col-span-2">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">Branch comparison</h2>
                <p className="text-xs text-muted-foreground">Click a bar to scope the dashboard</p>
              </div>
              <div className="flex gap-1.5">
                {branchMetrics.map((m) => (
                  <Chip
                    key={m.key}
                    active={branchMetric === m.key}
                    onClick={() => setBranchMetric(m.key)}
                  >
                    {m.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={branches.slice(1)}
                  margin={{ left: -18, right: 4 }}
                  onClick={(e) => {
                    const name = e?.activeLabel as string | undefined;
                    const b = branches.find((x) => x.name === name);
                    if (b) setBranchId((prev) => (prev === b.id ? "all" : b.id));
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                  />
                  <YAxis
                    tickFormatter={(v) =>
                      branchMetric === "staff" ? `${v}` : `${Math.round(v / 1000)}k`
                    }
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    stroke="var(--color-muted-foreground)"
                  />
                  <Tooltip
                    cursor={{ fill: "var(--color-secondary)" }}
                    contentStyle={tooltipStyle}
                    formatter={(v: number) =>
                      branchMetric === "staff" ? `${v} people` : currency(v)
                    }
                  />
                  <Bar dataKey={branchMetric} radius={[4, 4, 0, 0]} className="cursor-pointer">
                    {branches.slice(1).map((b) => (
                      <Cell
                        key={b.id}
                        fill={
                          branchId === "all" || branchId === b.id
                            ? "var(--color-accent)"
                            : "var(--color-border)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border p-4">
              <TriangleAlert className="size-4 text-warning" />
              <h2 className="text-sm font-semibold">Low stock alerts</h2>
              <span className="num ml-auto rounded-full bg-secondary px-2 py-0.5 text-xs">
                {lowStock.length}
              </span>
            </div>
            <div className="flex gap-1.5 border-b border-border p-3">
              <Chip
                active={stockView === "all"}
                onClick={() => setStockView("all")}
                activeClass="bg-amber-600 text-white border-amber-600"
              >
                Below threshold
              </Chip>
              <Chip
                active={stockView === "critical"}
                onClick={() => setStockView("critical")}
                activeClass="bg-red-600 text-white border-red-600"
              >
                Critical only
              </Chip>
            </div>
            <ul className="divide-y divide-border">
              {lowStock.map((p) => (
                <li key={p.sku} className="flex items-center gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <button
                      onClick={() => setBranchId(p.branchId)}
                      className="truncate text-xs text-muted-foreground underline-offset-2 hover:underline"
                    >
                      {p.sku} · {p.branch}
                    </button>
                  </div>
                  <StatusBadge tone={p.stock === 0 ? "bad" : "warn"}>
                    {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                  </StatusBadge>
                </li>
              ))}
              {lowStock.length === 0 && (
                <li className="p-4 text-sm text-muted-foreground">
                  Nothing below threshold for this filter.
                </li>
              )}
            </ul>
            <div className="p-3">
              <Button variant="outline" size="sm" className="w-full">
                Send restock links
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
            <div>
              <h2 className="text-lg font-semibold">Recent activity</h2>
              <p className="text-xs text-muted-foreground">
                {rows.length} of {activityRows.length} events · click a status to filter
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["settled", "confirmed", "pending", "failed"].map((s) => (
                <Chip
                  key={s}
                  active={status === s}
                  onClick={() => setStatus(status === s ? null : s)}
                  activeClass={statusColors[s]}
                >
                  {s}
                </Chip>
              ))}
              <Button variant="ghost" size="sm">
                View audit trail
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {/* ── Mobile: card list ── */}
            <ul className="divide-y divide-border sm:hidden">
              {rows.map((a) => (
                <li key={a.id} className="px-4 py-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="num text-xs font-semibold text-muted-foreground">{a.id}</span>
                    <button onClick={() => setStatus(status === a.status ? null : a.status)}>
                      <StatusBadge tone={payTone[a.status] ?? "neutral"}>{a.status}</StatusBadge>
                    </button>
                  </div>
                  <p className="text-sm font-medium leading-tight">{a.what}</p>
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{a.who}</span>
                    <span className="num font-semibold text-foreground">{currency(a.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                    <button
                      onClick={() => setBranchId(a.branchId)}
                      className="underline-offset-2 hover:underline"
                    >
                      {a.where}
                    </button>
                    <span>{a.method} · {a.when}</span>
                  </div>
                </li>
              ))}
              {rows.length === 0 && (
                <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No events match these filters.
                </li>
              )}
            </ul>

            {/* ── Desktop: full table ── */}
            <table className="hidden w-full text-base sm:table">
              <thead>
                <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="px-4 py-2.5 font-medium">Reference</th>
                  <th className="px-4 py-2.5 font-semibold">Event</th>
                  <th className="px-4 py-2.5 font-medium">Who</th>
                  <th className="px-4 py-2.5 font-medium">Branch</th>
                  <th className="px-4 py-2.5 font-medium">Method</th>
                  <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 text-right font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((a) => (
                  <tr key={a.id} className="transition-colors hover:bg-secondary/60">
                    <td className="num px-4 py-3 font-medium">{a.id}</td>
                    <td className="px-4 py-3 font-medium">{a.what}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.who}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setBranchId(a.branchId)}
                        className="text-muted-foreground underline-offset-2 hover:underline"
                      >
                        {a.where}
                      </button>
                    </td>
                    <td className="px-4 py-3">{a.method}</td>
                    <td className="num px-4 py-3 text-right font-medium">{currency(a.amount)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setStatus(status === a.status ? null : a.status)}>
                        <StatusBadge tone={payTone[a.status] ?? "neutral"}>{a.status}</StatusBadge>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{a.when}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No events match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
