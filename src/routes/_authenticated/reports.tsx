import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Download,
  FileSpreadsheet,
  FileText,
  BedDouble,
  TrendingUp,
  Wallet,
  Percent,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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
import { currency } from "@/lib/mos-data";
import {
  HOTEL_SUMMARY,
  HOTEL_REVENUE_TREND,
  HOTEL_PAYMENT_MIX,
  HOTEL_EXPENSES,
  HOTEL_EXPENSE_SUMMARY,
  HOTEL_PAYMENTS,
} from "@/lib/hotel-data";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Trite Merchant Hotel & Resort — occupancy analytics, revenue vs expenses trend, payment method breakdown, and folio settlement reporting.",
      },
      { property: "og:title", content: "Reports — Trite Merchant OS" },
      {
        property: "og:description",
        content: "Live hotel revenue reporting: room revenue, guest folios, OTA commissions, and operational costs.",
      },
    ],
  }),
  component: Reports,
});

function Reports() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const rangeLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, "dd MMM")} – ${format(dateRange.to, "dd MMM yyyy")}`
      : format(dateRange.from, "dd MMM yyyy")
    : "10–15 Aug 2026";

  const totalRevenue = HOTEL_PAYMENTS.reduce((a, p) => a + p.amountPaid, 0);
  const totalExpenses = HOTEL_EXPENSE_SUMMARY.totalExpenses;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = Math.round((netProfit / totalRevenue) * 100);

  return (
    <AppShell
      title="Hotel Revenue & Analytics"
      subtitle={`Trite Merchant Hotel & Resort · Occupancy, guest folios, revenue vs expenses — ${rangeLabel}`}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/payments">
            <Button variant="outline" size="sm" className="h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm">
              <FileSpreadsheet className="size-3.5 sm:size-4" />
              <span className="hidden sm:inline">Guest Folios</span>
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm">
            <FileText className="size-3.5 sm:size-4" />
            <span className="hidden sm:inline">Export PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
          <Button size="sm" className="h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm bg-[#22c55e] text-white hover:bg-[#16a34a]">
            <Download className="size-3.5 sm:size-4" />
            <span className="hidden sm:inline">Accounting Handoff</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Date range filter */}
        <div className="flex flex-wrap gap-1.5">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Revenue</p>
              <span className="rounded-full bg-emerald-50 p-1.5 sm:p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <TrendingUp className="size-3.5 sm:size-4" />
              </span>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{currency(totalRevenue)}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{HOTEL_PAYMENTS.length} settled folios</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Expenses</p>
              <span className="rounded-full bg-rose-50 p-1.5 sm:p-2 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                <Wallet className="size-3.5 sm:size-4" />
              </span>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">{currency(totalExpenses)}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{HOTEL_EXPENSES.length} vouchers</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Net Profit</p>
              <span className="rounded-full bg-blue-50 p-1.5 sm:p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <BedDouble className="size-3.5 sm:size-4" />
              </span>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{currency(netProfit)}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">After all operational costs</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Occupancy Rate</p>
              <span className="rounded-full bg-amber-50 p-1.5 sm:p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <Percent className="size-3.5 sm:size-4" />
              </span>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">{HOTEL_SUMMARY.occupancyRate}%</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{HOTEL_SUMMARY.occupiedRooms} / {HOTEL_SUMMARY.totalRooms} rooms occupied</p>
          </div>
        </div>

        {/* Revenue vs Expenses Trend + Occupancy Chart */}
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs">
            <h2 className="text-sm font-semibold">Revenue vs Expenses Trend</h2>
            <p className="mb-4 text-xs text-muted-foreground">Daily room revenue against operational costs, {rangeLabel}</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={HOTEL_REVENUE_TREND} margin={{ left: -18, right: 4, top: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                  <YAxis
                    tickFormatter={(v) => `${v / 1000}k`}
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                  />
                  <Tooltip
                    contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => currency(v)}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#22c55e" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 3" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs">
            <h2 className="text-sm font-semibold">Daily Occupancy Rate (%)</h2>
            <p className="mb-4 text-xs text-muted-foreground">Room occupancy percentage by day, {rangeLabel}</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={HOTEL_REVENUE_TREND} margin={{ left: -18, right: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                  <YAxis
                    tickFormatter={(v) => `${v}%`}
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                  />
                  <Tooltip
                    cursor={{ fill: "var(--color-secondary)" }}
                    contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => `${v}%`}
                  />
                  <Bar dataKey="occupancy" name="Occupancy %" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="rounded-xl border border-border bg-card shadow-2xs">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Guest Folio Revenue by Payment Method</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Settlement breakdown across all {HOTEL_PAYMENTS.length} folios · {rangeLabel}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40 text-left text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="px-5 py-3 font-medium whitespace-nowrap">Payment Method</th>
                  <th className="px-5 py-3 text-right font-medium whitespace-nowrap">Amount</th>
                  <th className="px-5 py-3 text-right font-medium whitespace-nowrap">Share</th>
                  <th className="px-5 py-3 font-medium whitespace-nowrap">Settlement Window</th>
                  <th className="px-5 py-3 font-medium whitespace-nowrap">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {HOTEL_PAYMENT_MIX.map((m) => (
                  <tr key={m.method} className="transition-colors hover:bg-secondary/60">
                    <td className="px-5 py-3 font-medium whitespace-nowrap">{m.method}</td>
                    <td className="px-5 py-3 text-right font-bold text-foreground whitespace-nowrap">{currency(m.amount)}</td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <div
                          className="h-1.5 rounded-full bg-[#22c55e]"
                          style={{ width: `${m.share * 0.8}px`, minWidth: 4, maxWidth: 60 }}
                        />
                        <span className="text-xs font-semibold">{m.share}%</span>
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">{m.settlement}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {m.method === "Corporate Bill" ? "Invoice to Chevron Corp" : m.method === "Wire Transfer" ? "Ambassador Mensah Penthouse" : "Standard folio settlement"}
                    </td>
                  </tr>
                ))}
                <tr className="bg-secondary/30 font-bold">
                  <td className="px-5 py-3">Total</td>
                  <td className="px-5 py-3 text-right text-emerald-600 dark:text-emerald-400">
                    {currency(HOTEL_PAYMENT_MIX.reduce((a, m) => a + m.amount, 0))}
                  </td>
                  <td className="px-5 py-3 text-right">100%</td>
                  <td className="px-5 py-3" colSpan={2} />
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Profit & Loss Summary */}
        <div className="rounded-xl border border-border bg-card shadow-2xs">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">P&L Summary — Trite Merchant Hotel & Resort</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Consolidated revenue and cost breakdown for {rangeLabel}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40 text-left text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="px-5 py-3 font-medium">Line Item</th>
                  <th className="px-5 py-3 text-right font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover:bg-secondary/30">
                  <td className="px-5 py-3 font-semibold text-emerald-600 dark:text-emerald-400">Total Folio Revenue</td>
                  <td className="px-5 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{currency(totalRevenue)}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                      Settled
                    </span>
                  </td>
                </tr>
                {HOTEL_EXPENSES.filter((e) => e.status === "Approved").map((e) => (
                  <tr key={e.id} className="hover:bg-secondary/30">
                    <td className="px-5 py-3 text-muted-foreground">
                      <span className="text-xs">{e.voucherNo}</span>
                      <span className="ml-2">{e.category}</span>
                    </td>
                    <td className="px-5 py-3 text-right text-rose-600 dark:text-rose-400 font-semibold">({currency(e.amount)})</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                        Approved
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-secondary/30 border-t-2 border-border">
                  <td className="px-5 py-3 font-bold text-lg">Net Profit ({rangeLabel})</td>
                  <td className={`px-5 py-3 text-right font-bold text-xl ${netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {currency(netProfit)}
                  </td>
                  <td className="px-5 py-3 font-semibold text-muted-foreground">{profitMargin}% margin</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
