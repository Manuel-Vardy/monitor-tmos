import { useState } from "react";
import { PiggyBank, Banknote, Users, CheckCircle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DateRange } from "react-day-picker";

import { KpiCard } from "@/components/kpi-card";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { currency } from "@/lib/mos-data";
import { cn } from "@/lib/utils";
import { DateRangePicker } from "@/components/date-range-picker";
import {
  COOP_MEMBERS,
  COOP_SUMMARY,
  COOP_DISBURSEMENTS,
  COOP_CONTRIBUTIONS,
} from "@/lib/cooperative-data";

// ── Cooperative-specific status pill (local, independent of other dashboards) ──
const COOP_DISBURSEMENT_STATUS: Record<string, { bg: string; text: string; dot: string }> = {
  "Active Repayment": { bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200",       text: "text-blue-700 dark:text-blue-400",       dot: "bg-blue-500" },
  "Fully Paid":       { bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  "Pending Approval": { bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200",     text: "text-amber-700 dark:text-amber-400",     dot: "bg-amber-500" },
  "Defaulted":        { bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200",        text: "text-rose-700 dark:text-rose-400",        dot: "bg-rose-500" },
};

const COOP_CONTRIBUTION_STATUS: Record<string, { bg: string; text: string; dot: string }> = {
  "Paid":    { bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  "Pending": { bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200",       text: "text-amber-700 dark:text-amber-400",     dot: "bg-amber-500" },
  "Overdue": { bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200",          text: "text-rose-700 dark:text-rose-400",        dot: "bg-rose-500" },
};

function CoopStatusPill({ status, styleMap }: {
  status: string;
  styleMap: Record<string, { bg: string; text: string; dot: string }>;
}) {
  const s = styleMap[status] ?? { bg: "bg-muted border-border", text: "text-muted-foreground", dot: "bg-muted-foreground" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap", s.bg, s.text)}>
      <span className={cn("size-1.5 rounded-full shrink-0", s.dot)} />
      {status}
    </span>
  );
}

// --- Chart Data ---------------------------------------------------------------

const contributionData = [
  { month: "Jan", contributions: 68000 },
  { month: "Feb", contributions: 72000 },
  { month: "Mar", contributions: 69000 },
  { month: "Apr", contributions: 75000 },
  { month: "May", contributions: 71000 },
  { month: "Jun", contributions: 80000 },
  { month: "Jul", contributions: 74000 },
  { month: "Aug", contributions: 78000 },
];

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
} as const;

function formatGhs(v: number) {
  return `GHS ${(v / 1000).toFixed(0)}k`;
}

export function CooperativeDashboard() {
  const activeDisbursementsCount = COOP_DISBURSEMENTS.filter((d) => d.status === "Active Repayment").length;
  const [trendDateRange, setTrendDateRange] = useState<DateRange | undefined>(undefined);

  return (
    <AppShell
      title="Cooperative Dashboard"
      subtitle="Financial health overview"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard
          label="Total Savings Pool"
          value={currency(COOP_SUMMARY.totalSavingsPool)}
          delta={8}
          sub={`Share Capital: ${currency(COOP_SUMMARY.totalShareCapital)}`}
          icon={PiggyBank}
        />
        <KpiCard
          label="Active Disbursements"
          value={activeDisbursementsCount}
          sub={`${currency(COOP_SUMMARY.activeLoanBalance)} balance`}
          icon={Banknote}
        />
        <KpiCard
          label="Coop Members"
          value={COOP_MEMBERS.length}
          sub="100% active standing"
          icon={Users}
        />
        <KpiCard
          label="Reconciliation Status"
          value="Up to date"
          sub={`${COOP_SUMMARY.discrepanciesCount} audit items logged`}
          icon={CheckCircle}
        />
      </div>

      {/* Contributions Summary chart & Recent Members */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="p-5">
            <div className="mb-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold">Contributions vs Disbursements</h2>
                  <p className="text-xs text-muted-foreground">
                    Monthly summary for the current financial year
                  </p>
                </div>
                <DateRangePicker value={trendDateRange} onChange={setTrendDateRange} />
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={contributionData}
                  margin={{ left: -8, right: 4, top: 4, bottom: 0 }}
                  barCategoryGap="20%"
                  barGap={2}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                  />
                  <YAxis
                    tickFormatter={formatGhs}
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    stroke="var(--color-muted-foreground)"
                  />
                  <Tooltip
                    cursor={{ fill: "var(--color-secondary)" }}
                    contentStyle={tooltipStyle}
                    formatter={(v: number, name: string) => [
                      `GHS ${v.toLocaleString("en-GH")}`,
                      name === "contributions" ? "Contributions" : "Disbursements",
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12 }}
                    formatter={(value) =>
                      value === "contributions" ? "Contributions" : "Disbursements"
                    }
                  />
                  <Bar
                    dataKey="contributions"
                    fill="var(--color-accent)"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="disbursements"
                    fill="var(--color-chart-2)"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Member Balances Widget */}
        <div className="space-y-4">
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <Users className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Top Member Balances</h2>
            </div>
            <ul className="divide-y divide-border text-xs">
              {COOP_MEMBERS.map((member) => (
                <li key={member.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-muted-foreground">{member.memberNo}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">{currency(member.totalSavings)}</p>
                    <p className="text-[11px] text-muted-foreground">Loan: {currency(member.activeLoanBalance)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Disbursements table with colored status pills */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-0 overflow-hidden shadow-none">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <Banknote className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Disbursements</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-[13px] font-bold text-foreground/70 uppercase tracking-wide">
                  <th className="px-5 py-3">ID</th>
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {COOP_DISBURSEMENTS.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs font-semibold">{d.id}</td>
                    <td className="px-4 py-3 font-medium">{d.memberName}</td>
                    <td className="px-4 py-3 font-semibold">{currency(d.amount)}</td>
                    <td className="px-4 py-3">
                      <CoopStatusPill status={d.status} styleMap={COOP_DISBURSEMENT_STATUS} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden shadow-none">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <PiggyBank className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Recent Contributions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-[13px] font-bold text-foreground/70 uppercase tracking-wide">
                  <th className="px-5 py-3">Member</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {COOP_CONTRIBUTIONS.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-medium">{c.memberName}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{c.type}</td>
                    <td className="px-4 py-3 font-semibold">{currency(c.amount)}</td>
                    <td className="px-4 py-3">
                      <CoopStatusPill status={c.status} styleMap={COOP_CONTRIBUTION_STATUS} />
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
