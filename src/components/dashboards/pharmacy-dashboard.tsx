import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { DateRange } from "react-day-picker";
import { format, differenceInDays, addDays, subDays, startOfDay } from "date-fns";
import {
  Bell,
  Plus,
  PackageSearch,
  Boxes,
  Pill,
  TrendingUp,
  CheckCircle2,
  Clock,
  Package,
  ShoppingCart,
  Receipt,
  Pill as PillIcon,
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

import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { currency } from "@/lib/mos-data";
import { PHARMACY_MEDICATIONS, PRESCRIPTIONS, type PharmacyMedication } from "@/lib/pharmacy-data";
import { cn } from "@/lib/utils";

function isExpiringWithin(days: number, expiryStr: string): boolean {
  const exp = new Date(expiryStr);
  const now = new Date();
  const threshold = new Date();
  threshold.setDate(now.getDate() + days);
  return exp <= threshold && exp >= now;
}

function isExpired(expiryStr: string): boolean {
  return new Date(expiryStr) < new Date();
}

function generateSalesTrendData(dateRange: DateRange | undefined): {
  day: string;
  label: string;
  revenue: number;
  sales: number;
}[] {
  const from = dateRange?.from ? startOfDay(dateRange.from) : subDays(new Date(), 6);
  const to = dateRange?.to ? startOfDay(dateRange.to) : new Date();
  const totalDays = Math.max(1, differenceInDays(to, from) + 1);
  const points = Math.min(totalDays, 30);
  const step = Math.max(1, Math.floor(totalDays / points));

  const basePattern = [0.65, 0.88, 0.72, 1.1, 1.35, 1.55, 0.92];

  return Array.from({ length: points }, (_, i) => {
    const date = addDays(from, i * step);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseIdx = date.getDay();
    const pattern = basePattern[baseIdx] ?? 1;
    const trend = 1 + (i / Math.max(1, points)) * 0.18;
    const wobble = 0.92 + ((Math.sin(i * 2.3) + 1) / 2) * 0.16;

    const avgDaily = totalDays <= 7 ? 6800 : totalDays <= 30 ? 7400 : 7900;
    const revenue = Math.round(avgDaily * pattern * trend * wobble * (isWeekend ? 1.15 : 1));
    const sales = Math.round(revenue / (280 + (i % 5) * 12));

    const showFullLabel = points <= 7;
    return {
      day: showFullLabel ? format(date, "EEE") : format(date, "d"),
      label: format(date, "EEE dd MMM"),
      revenue,
      sales,
    };
  });
}

type StyledKpiProps = {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  accent: "revenue" | "collected" | "outstanding" | "catalog";
};

const ACCENT_STYLES: Record<
  StyledKpiProps["accent"],
  {
    border: string;
    iconBg: string;
    iconColor: string;
    semicircle: string;
    labelColor: string;
  }
> = {
  revenue: {
    border: "border-l-[#22c55e]",
    iconBg: "bg-[#22c55e]/10",
    iconColor: "text-[#16a34a]",
    semicircle: "bg-[#22c55e]/15",
    labelColor: "text-emerald-700 dark:text-emerald-400",
  },
  collected: {
    border: "border-l-[#0ea5e9]",
    iconBg: "bg-[#0ea5e9]/10",
    iconColor: "text-[#0284c7]",
    semicircle: "bg-[#0ea5e9]/15",
    labelColor: "text-sky-700 dark:text-sky-400",
  },
  outstanding: {
    border: "border-l-[#f59e0b]",
    iconBg: "bg-[#f59e0b]/10",
    iconColor: "text-[#d97706]",
    semicircle: "bg-[#f59e0b]/15",
    labelColor: "text-amber-700 dark:text-amber-400",
  },
  catalog: {
    border: "border-l-[#0d9488]",
    iconBg: "bg-[#0d9488]/10",
    iconColor: "text-[#0f766e]",
    semicircle: "bg-[#0d9488]/15",
    labelColor: "text-teal-700 dark:text-teal-400",
  },
};

function StyledKpi({ label, value, sub, icon: Icon, accent }: StyledKpiProps) {
  const s = ACCENT_STYLES[accent];
  return (
    <div className="rounded-2xl bg-card border border-border p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("grid size-9 place-items-center rounded-xl", s.iconBg)}>
            <Icon className={cn("size-4.5", s.iconColor)} />
          </div>
          <p className={cn("text-[11px] font-semibold uppercase tracking-widest", s.labelColor)}>
            {label}
          </p>
        </div>
      </div>
      <p className="mt-3 text-2xl lg:text-3xl font-semibold leading-none tracking-tight num">
        {value}
      </p>
      <p className="mt-2.5 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

export function PharmacyDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [salesStatusFilter, setSalesStatusFilter] = useState<
    "all" | "pending" | "dispensed" | "partially_filled" | "cancelled"
  >("all");

  const salesTrendData = useMemo(() => generateSalesTrendData(dateRange), [dateRange]);

  const trendTotals = useMemo(() => {
    const totalRevenue = salesTrendData.reduce((s, r) => s + r.revenue, 0);
    const totalSales = salesTrendData.reduce((s, r) => s + r.sales, 0);
    const avgDaily = Math.round(totalRevenue / Math.max(1, salesTrendData.length));
    return { totalRevenue, totalSales, avgDaily };
  }, [salesTrendData]);

  const rangeLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, "dd MMM yyyy")} – ${format(dateRange.to, "dd MMM yyyy")}`
      : format(dateRange.from, "dd MMM yyyy")
    : "Last 7 days";

  const filteredSalesPrescriptions = useMemo(
    () =>
      salesStatusFilter === "all"
        ? PRESCRIPTIONS
        : PRESCRIPTIONS.filter((p) => p.status === salesStatusFilter),
    [salesStatusFilter],
  );
  const totalStockValue = PHARMACY_MEDICATIONS.reduce(
    (acc, m) => acc + m.unitPrice * m.stockLevel,
    0,
  );

  const belowReorder = PHARMACY_MEDICATIONS.filter((m) => m.stockLevel <= m.reorderLevel).length;

  const criticalStock = PHARMACY_MEDICATIONS.filter(
    (m) => m.stockLevel <= Math.max(10, Math.floor(m.reorderLevel / 2)),
  ).length;

  const prescriptionOnly = PHARMACY_MEDICATIONS.filter((m) => m.prescriptionRequired).length;

  const otcCount = PHARMACY_MEDICATIONS.filter((m) => !m.prescriptionRequired).length;

  const expiring30 = PHARMACY_MEDICATIONS.filter((m) => isExpiringWithin(30, m.expiryDate)).length;
  const expiring90 = PHARMACY_MEDICATIONS.filter((m) => isExpiringWithin(90, m.expiryDate)).length;
  const expiredCount = PHARMACY_MEDICATIONS.filter((m) => isExpired(m.expiryDate)).length;

  const dispensedRevenue = PRESCRIPTIONS.filter((p) => p.status === "dispensed").reduce(
    (acc, p) => acc + p.totalAmount,
    0,
  );

  const totalRevenue = PRESCRIPTIONS.filter((p) => p.status !== "cancelled").reduce(
    (acc, p) => acc + p.totalAmount,
    0,
  );

  const outstandingBalance = PRESCRIPTIONS.filter((p) => p.status === "pending").reduce(
    (acc, p) => acc + p.totalAmount,
    0,
  );

  const totalUnitsOnHand = PHARMACY_MEDICATIONS.reduce((acc, m) => acc + m.stockLevel, 0);

  const completedSales = PRESCRIPTIONS.filter((p) => p.status === "dispensed").length;

  return (
    <AppShell
      title="Pharmacy Operations"
      subtitle="Medication inventory management, dispensing controls, stock expiry tracking & pharmaceutical procurement"
      actions={
        <div className="hidden lg:flex flex-wrap items-center gap-2">
          <Link to="/inventory">
            <Button size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a]">
              <Boxes className="size-4" /> Drug Inventory
            </Button>
          </Link>
          <Link to="/purchasing">
            <Button size="sm" variant="outline">
              <PackageSearch className="size-4" /> Procurement
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Mobile: Pharmacy Hero Card + 4 stat cards */}
        <div className="lg:hidden space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <div>
              <p className="text-xs text-muted-foreground">Good morning 🌤</p>
              <h2 className="text-xl font-bold leading-tight">Pharmacy</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 shadow-xs">
                <span className="size-1.5 rounded-full bg-emerald-500" /> Licensed
              </span>
              <button className="relative grid size-9 place-items-center rounded-full bg-card shadow-xs border border-border">
                <Bell className="size-4" />
                {expiring30 + criticalStock > 0 && (
                  <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500" />
                )}
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#22c55e] to-[#16a34a] p-5 text-white shadow-lg">
            <div
              className="pointer-events-none absolute rounded-full bg-white/10"
              style={{ width: "260px", height: "260px", bottom: "-120px", right: "-60px" }}
            />
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold tracking-widest uppercase text-white/80">
                    Total Medication Value
                  </p>
                  <p className="num mt-2 text-3xl font-extrabold leading-none tracking-tight">
                    {currency(totalStockValue)}
                  </p>
                </div>
                <div className="grid size-11 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                  <Pill className="size-6 opacity-90" />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                    SKUs
                  </p>
                  <p className="text-lg font-bold leading-none mt-1">
                    {PHARMACY_MEDICATIONS.length}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                    Rx Only
                  </p>
                  <p className="text-lg font-bold leading-none mt-1">{prescriptionOnly}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                    Low Stock
                  </p>
                  <p className="text-lg font-bold leading-none mt-1">{belowReorder}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Link to="/inventory" className="flex-1">
                  <span className="block rounded-xl bg-white/15 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/25 backdrop-blur">
                    View Inventory
                  </span>
                </Link>
                <Link to="/purchasing" className="flex-1">
                  <span className="block rounded-xl bg-white text-[#166534] py-2.5 text-center text-sm font-semibold transition hover:bg-white/90">
                    Reorder Stock
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <StyledKpi
              label="Revenue"
              value={currency(dispensedRevenue)}
              sub={`${completedSales} completed sales`}
              icon={TrendingUp}
              accent="revenue"
            />
            <StyledKpi
              label="Collected"
              value={currency(dispensedRevenue)}
              sub="Payments received in range"
              icon={CheckCircle2}
              accent="collected"
            />
            <StyledKpi
              label="Outstanding"
              value={currency(outstandingBalance)}
              sub="Open balances"
              icon={Clock}
              accent="outstanding"
            />
            <StyledKpi
              label="Catalog"
              value={totalUnitsOnHand.toLocaleString("en-GH")}
              sub="0 units on hand"
              icon={Package}
              accent="catalog"
            />
          </div>
        </div>

        {/* Desktop: 4-column KPI Grid matching the screenshot */}
        <div className="hidden lg:grid grid-cols-4 gap-3">
          <StyledKpi
            label="Revenue"
            value={currency(dispensedRevenue)}
            sub={`${completedSales} completed sales`}
            icon={TrendingUp}
            accent="revenue"
          />
          <StyledKpi
            label="Collected"
            value={currency(dispensedRevenue)}
            sub="Payments received in range"
            icon={CheckCircle2}
            accent="collected"
          />
          <StyledKpi
            label="Outstanding"
            value={currency(outstandingBalance)}
            sub="Open balances"
            icon={Clock}
            accent="outstanding"
          />
          <StyledKpi
            label="Catalog"
            value={totalUnitsOnHand.toLocaleString("en-GH")}
            sub="0 units on hand"
            icon={Package}
            accent="catalog"
          />
        </div>

        {/* Sales Trend + Expiry Watchlist */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sales Trend Chart */}
          <Card className="p-5 lg:col-span-2 shadow-none overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-semibold">Sales Trend</h2>
                <p className="text-xs text-muted-foreground">
                  {rangeLabel} · {salesTrendData.length} data points · Avg daily{" "}
                  {currency(trendTotals.avgDaily)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-950/40">
                  <TrendingUp className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                    +18.2% WoW
                  </span>
                </div>
                <DateRangePicker value={dateRange} onChange={setDateRange} />
              </div>
            </div>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={salesTrendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="pharmacySalesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--color-border)"
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                    tickFormatter={(v) => `GH₵${v / 1000}k`}
                  />
                  <Tooltip
                    formatter={(val) => [currency(Number(val)), "Revenue"]}
                    labelFormatter={(label) => {
                      const item = salesTrendData.find((d) => d.day === label);
                      return item?.label ?? label;
                    }}
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
                    fill="url(#pharmacySalesGrad)"
                    activeDot={{ r: 5, fill: "#22c55e", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Expiry Watchlist */}
          <Card className="p-5 shadow-none overflow-hidden">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-amber-500" />
                <h2 className="text-sm font-semibold">Expiry Watchlist</h2>
              </div>
              <Link to="/inventory">
                <Button size="sm" variant="outline" className="text-xs h-7 px-2">
                  All dates →
                </Button>
              </Link>
            </div>
            <ul className="mt-3 divide-y divide-border">
              {PHARMACY_MEDICATIONS.filter(
                (m) => isExpiringWithin(90, m.expiryDate) || isExpired(m.expiryDate),
              )
                .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
                .slice(0, 6)
                .map((m) => {
                  const expSoon = isExpiringWithin(30, m.expiryDate);
                  const expired = isExpired(m.expiryDate);
                  return (
                    <li
                      key={m.id}
                      className="flex items-center justify-between gap-3 py-3 first:pt-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{m.brandName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {m.strength} · Batch {m.batchNumber}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          expired
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
                            : expSoon
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900"
                              : "bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 border border-orange-200 dark:border-orange-900"
                        }`}
                      >
                        {expired ? "Expired" : m.expiryDate}
                      </span>
                    </li>
                  );
                })}
              {expiring90 + expiredCount === 0 && (
                <li className="py-6 text-center text-sm text-muted-foreground">
                  No expiring medications in the next 90 days.
                </li>
              )}
            </ul>
          </Card>
        </div>

        {/* Bottom: Low Stock + Inventory Snapshot */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Low Stock Priority List */}
          <Card className="p-5 shadow-none overflow-hidden">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-rose-500" />
                <h2 className="text-sm font-semibold">Low Stock — Reorder Priority</h2>
              </div>
              <Link to="/purchasing">
                <Button
                  size="sm"
                  className="h-7 px-2.5 text-xs bg-[#22c55e] hover:bg-[#16a34a] text-white"
                >
                  <Plus className="size-3.5" /> Create PO
                </Button>
              </Link>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/40 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-2 py-2.5">Drug (Brand)</th>
                    <th className="px-2 py-2.5">Stock</th>
                    <th className="px-2 py-2.5">Reorder</th>
                    <th className="px-2 py-2.5 text-right">Urgency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {PHARMACY_MEDICATIONS.filter((m) => m.stockLevel <= m.reorderLevel)
                    .sort((a, b) => a.stockLevel / a.reorderLevel - b.stockLevel / b.reorderLevel)
                    .slice(0, 7)
                    .map((m) => {
                      const ratio = m.stockLevel / Math.max(1, m.reorderLevel);
                      const urgent = ratio < 0.5;
                      return (
                        <tr key={m.id} className="transition-colors hover:bg-secondary/40">
                          <td className="px-2 py-3">
                            <p className="font-medium text-foreground truncate max-w-[160px]">
                              {m.brandName}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                              {m.drugName} · {m.strength}
                            </p>
                          </td>
                          <td className="px-2 py-3 num">
                            <span
                              className={`font-bold ${urgent ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"}`}
                            >
                              {m.stockLevel}
                            </span>
                          </td>
                          <td className="px-2 py-3 num text-muted-foreground">
                            @ {m.reorderLevel}
                          </td>
                          <td className="px-2 py-3 text-right">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                urgent
                                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                              }`}
                            >
                              {urgent ? "URGENT" : "SOON"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  {belowReorder === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                        All stock levels above reorder thresholds.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Medication Inventory Snapshot Table */}
          <Card className="p-5 shadow-none overflow-hidden">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Boxes className="size-4 text-[#22c55e]" />
                <h2 className="text-sm font-semibold">Medication Inventory Snapshot</h2>
              </div>
              <Link to="/inventory">
                <Button size="sm" variant="outline" className="text-xs h-7 px-2">
                  Full Inventory →
                </Button>
              </Link>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/40 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-2 py-2.5">Brand / Generic</th>
                    <th className="px-2 py-2.5">Form</th>
                    <th className="px-2 py-2.5 text-right">Price</th>
                    <th className="px-2 py-2.5 text-right">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {PHARMACY_MEDICATIONS.slice(0, 7).map((m) => (
                    <tr key={m.id} className="transition-colors hover:bg-secondary/40">
                      <td className="px-2 py-2.5">
                        <p className="font-medium text-foreground truncate max-w-[160px]">
                          {m.brandName}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                          {m.category}
                        </p>
                      </td>
                      <td className="px-2 py-2.5 text-[11px] text-muted-foreground">
                        {m.dosageForm}
                      </td>
                      <td className="px-2 py-2.5 num text-right font-semibold">
                        {currency(m.unitPrice)}
                      </td>
                      <td className="px-2 py-2.5 num text-right">
                        <span
                          className={
                            m.stockLevel <= m.reorderLevel
                              ? "text-amber-600 dark:text-amber-400 font-semibold"
                              : "font-semibold text-foreground"
                          }
                        >
                          {m.stockLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Recent Sales — Full width bottom section (table layout) */}
        <Card className="p-0 shadow-none overflow-hidden">
          <div className="px-5 md:px-6 py-4 md:py-5 flex flex-wrap items-center justify-between gap-3 border-b border-border">
            <div>
              <h2 className="text-base md:text-lg font-bold leading-tight">Recent Sales</h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                {filteredSalesPrescriptions.length} records · click to view details
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link to="/sales">
                <Button size="sm" variant="outline" className="h-8 text-xs">
                  All sales →
                </Button>
              </Link>
            </div>
          </div>

          {/* Status filter chips (Dispensed / Cancelled) */}
          <div className="px-5 md:px-6 pt-3 flex items-center gap-1.5 flex-wrap justify-end">
            {(
              [
                { key: "dispensed", label: "Dispensed" },
                { key: "cancelled", label: "Cancelled" },
              ] as const
            ).map((chip) => {
              const active = salesStatusFilter === chip.key;
              const count = PRESCRIPTIONS.filter((p) => p.status === chip.key).length;
              return (
                <button
                  key={chip.key}
                  onClick={() => setSalesStatusFilter(chip.key)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition-all",
                    active
                      ? chip.key === "dispensed"
                        ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                        : "border-rose-300 dark:border-rose-800 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                      : "border-border bg-background text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  {chip.label}
                  <span className="ml-1.5 opacity-70">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-border bg-transparent text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <th className="px-5 md:px-6 py-3.5 font-extrabold">Rx #</th>
                  <th className="px-5 md:px-6 py-3.5 font-extrabold">Item Name</th>
                  <th className="px-5 md:px-6 py-3.5 text-right font-extrabold">Amount</th>
                  <th className="px-5 md:px-6 py-3.5 font-extrabold">Method</th>
                  <th className="px-5 md:px-6 py-3.5 font-extrabold">Branch</th>
                  <th className="px-5 md:px-6 py-3.5 font-extrabold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSalesPrescriptions.slice(0, 8).map((p) => {
                  const firstItem = p.items[0];

                  return (
                    <tr
                      key={p.id}
                      className="transition-colors hover:bg-secondary/40 cursor-pointer"
                    >
                      <td className="px-5 md:px-6 py-4 num font-bold text-foreground whitespace-nowrap">
                        {p.rxNumber}
                      </td>
                      <td className="px-5 md:px-6 py-4 font-semibold text-foreground whitespace-nowrap">
                        {firstItem?.drugName || "N/A"}
                      </td>
                      <td className="px-5 md:px-6 py-4 text-right num font-bold text-foreground whitespace-nowrap">
                        {currency(p.totalAmount)}
                      </td>
                      <td className="px-5 md:px-6 py-4 capitalize text-muted-foreground whitespace-nowrap">
                        {p.method || "N/A"}
                      </td>
                      <td className="px-5 md:px-6 py-4 text-muted-foreground whitespace-nowrap">
                        {p.branch || "N/A"}
                      </td>
                      <td className="px-5 md:px-6 py-4 text-muted-foreground whitespace-nowrap">
                        {p.timeAdded || "N/A"}
                      </td>
                    </tr>
                  );
                })}
                {filteredSalesPrescriptions.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-sm text-muted-foreground"
                    >
                      No {salesStatusFilter === "all" ? "sales" : salesStatusFilter} records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary footer */}
          <div className="mx-5 md:mx-6 my-4 grid grid-cols-1 md:grid-cols-3 gap-px rounded-xl border border-border overflow-hidden bg-border">
            <div className="bg-background p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Total Sales
              </p>
              <p className="num text-lg font-extrabold mt-0.5">
                {currency(
                  filteredSalesPrescriptions
                    .filter((p) => p.status !== "cancelled")
                    .reduce((s, p) => s + p.totalAmount, 0),
                )}
              </p>
            </div>
            <div className="bg-background p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Dispensed
              </p>
              <p className="num text-lg font-extrabold mt-0.5 text-emerald-600 dark:text-emerald-400">
                {filteredSalesPrescriptions.filter((p) => p.status === "dispensed").length}
              </p>
            </div>
            <div className="bg-background p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Cancelled
              </p>
              <p className="num text-lg font-extrabold mt-0.5 text-rose-600 dark:text-rose-400">
                {filteredSalesPrescriptions.filter((p) => p.status === "cancelled").length}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
