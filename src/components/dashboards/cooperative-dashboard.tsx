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

import { KpiCard } from "@/components/kpi-card";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { currency } from "@/lib/mos-data";
import {
  COOP_MEMBERS,
  COOP_DISBURSEMENTS,
  COOP_SUMMARY,
} from "@/lib/cooperative-data";

// --- Chart Data ---------------------------------------------------------------

const contributionData = [
  { month: "Jan", contributions: 68000, disbursements: 42000 },
  { month: "Feb", contributions: 72000, disbursements: 38000 },
  { month: "Mar", contributions: 69000, disbursements: 51000 },
  { month: "Apr", contributions: 75000, disbursements: 44000 },
  { month: "May", contributions: 71000, disbursements: 47000 },
  { month: "Jun", contributions: 80000, disbursements: 55000 },
  { month: "Jul", contributions: 74000, disbursements: 40000 },
  { month: "Aug", contributions: 78000, disbursements: 48000 },
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
              <h2 className="text-sm font-semibold">Contributions vs Disbursements</h2>
              <p className="text-xs text-muted-foreground">
                Monthly summary for the current financial year
              </p>
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
    </AppShell>
  );
}
