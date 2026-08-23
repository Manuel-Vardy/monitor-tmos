import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  HeartHandshake,
  Users,
  FolderKanban,
  Clock,
  Plus,
  PiggyBank,
  CheckCircle2,
  Globe,
  Bell,
  TrendingUp,
  Wallet,
  Receipt,
  CalendarDays,
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
import { KpiCard } from "@/components/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/mos-data";
import { cn } from "@/lib/utils";
import { DateRangePicker } from "@/components/date-range-picker";
import type { DateRange } from "react-day-picker";
import {
  NGO_DONATIONS,
  NGO_MEMBERS,
  BUDGET_APPROVALS,
  NGO_SUMMARY,
} from "@/lib/ngo-data";

// ── Church-specific status pill (local, independent of other dashboards) ──
const CHURCH_DUES_STATUS: Record<string, { bg: string; text: string; dot: string }> = {
  "Paid":        { bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  "Outstanding": { bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200",          text: "text-rose-700 dark:text-rose-400",        dot: "bg-rose-500" },
  "Partial":     { bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200",       text: "text-amber-700 dark:text-amber-400",      dot: "bg-amber-500" },
};

const CHURCH_BUDGET_STATUS: Record<string, { bg: string; text: string; dot: string }> = {
  "Approved":         { bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  "Pending Approval": { bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200",       text: "text-amber-700 dark:text-amber-400",     dot: "bg-amber-500" },
  "Rejected":         { bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200",          text: "text-rose-700 dark:text-rose-400",        dot: "bg-rose-500" },
  "In Review":        { bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200",          text: "text-blue-700 dark:text-blue-400",        dot: "bg-blue-500" },
};

function ChurchStatusPill({ status, styleMap }: {
  status: string;
  styleMap: Record<string, { bg: string; text: string; dot: string }>;
}) {
  const s = styleMap[status] ?? { bg: "bg-muted border-border", text: "text-muted-foreground", dot: "bg-muted-foreground" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold whitespace-nowrap", s.bg, s.text)}>
      <span className={cn("size-1.5 rounded-full shrink-0", s.dot)} />
      {status}
    </span>
  );
}

const DUES_TREND = [
  { month: "Jan", collected: 3800 },
  { month: "Feb", collected: 4200 },
  { month: "Mar", collected: 4100 },
  { month: "Apr", collected: 5200 },
  { month: "May", collected: 4900 },
  { month: "Jun", collected: 6100 },
  { month: "Jul", collected: 5800 },
  { month: "Aug", collected: 6500 },
];

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
} as const;

export function ChurchDashboard() {
  const paidDues = NGO_MEMBERS.filter((m) => m.duesStatus === "Paid");
  const outstandingDues = NGO_MEMBERS.reduce(
    (a, m) => a + (m.annualDues - m.duesPaid),
    0,
  );
  const collectionRate = Math.round(
    (paidDues.length / NGO_SUMMARY.totalMembersCount) * 100,
  );
  const [trendDateRange, setTrendDateRange] = useState<DateRange | undefined>(undefined);
  return (
    <AppShell
      title="Church Operations"
      subtitle="Tithes & offerings, outreach project budgets, member dues, and requisition approvals"
      actions={
        <div className="hidden lg:flex flex-wrap items-center gap-2">
          <Link to="/donations">
            <Button size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a]">
              <Plus className="size-4" /> Record Donation
            </Button>
          </Link>
          <Link to="/projects">
            <Button size="sm" variant="outline">
              <FolderKanban className="size-4" /> New Project
            </Button>
          </Link>
          <Link to="/budget">
            <Button size="sm" variant="outline">
              <PiggyBank className="size-4" /> Request Budget
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Mobile: green hero card + 4 stat cards underneath */}
        <div className="lg:hidden space-y-3">
          {/* Greeting row */}
          <div className="flex items-center justify-between px-0.5">
            <div>
              <p className="text-xs text-muted-foreground">Good morning 🌤</p>
              <h2 className="text-xl font-bold leading-tight">Church</h2>
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

          {/* Green hero card — Donations Raised */}
          <div className="relative overflow-hidden rounded-2xl bg-[#22c55e] p-5 text-white shadow-lg">
            {/* decorative circle */}
            <div
              className="pointer-events-none absolute rounded-full bg-white/10"
              style={{ width: "260px", height: "260px", bottom: "-120px", right: "-60px" }}
            />

            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <p className="text-[11px] font-bold tracking-widest uppercase text-white/80">Donations Raised</p>
                <HeartHandshake className="size-6 opacity-70" />
              </div>
              <p className="num mt-2 text-3xl font-extrabold leading-none tracking-tight">
                {currency(NGO_SUMMARY.totalDonationsRaised)}
              </p>
              <div className="mt-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/80">
                  Active Outreach · {NGO_SUMMARY.totalActiveProjects}
                </p>
                <p className="mt-0.5 text-xs text-white/75">
                  +18% · {NGO_DONATIONS.length} contribution commitments
                </p>
              </div>

              {/* Full-width action buttons */}
              <div className="mt-4 flex gap-3">
                <Link to="/donations" className="flex-1">
                  <span className="block rounded-xl bg-[#166534] py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#14532d]">
                    Record Donation
                  </span>
                </Link>
                <Link to="/projects" className="flex-1">
                  <span className="block rounded-xl bg-white/20 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/30">
                    New Project
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* 4 stat cards below the hero */}
          <div className="grid grid-cols-2 gap-2.5">
            <KpiCard
              label="Donations Raised"
              value={currency(NGO_SUMMARY.totalDonationsRaised)}
              delta={18}
              sub={`${NGO_DONATIONS.length} commitments`}
              icon={HeartHandshake}
            />
            <KpiCard
              label="Active Outreach Projects"
              value={NGO_SUMMARY.totalActiveProjects}
              sub={`${NGO_SUMMARY.totalBeneficiariesReached.toLocaleString()} souls reached`}
              icon={FolderKanban}
            />
            <KpiCard
              label="Member Dues Collected"
              value={currency(NGO_SUMMARY.totalDuesCollected)}
              sub={`${NGO_MEMBERS.filter((m) => m.duesStatus === "Paid").length} cleared`}
              icon={Users}
            />
            <KpiCard
              label="Pending Budget Requests"
              value={BUDGET_APPROVALS.filter((b) => b.status === "Pending Approval").length}
              sub="Awaiting board approval"
              icon={Clock}
            />
          </div>
        </div>

        {/* Desktop: standard 4-column KPI grid */}
        <section className="hidden lg:grid grid-cols-4 gap-3">
          <KpiCard
            label="Donations Raised"
            value={currency(NGO_SUMMARY.totalDonationsRaised)}
            delta={18}
            sub={`${NGO_DONATIONS.length} contribution commitments`}
            icon={HeartHandshake}
          />
          <KpiCard
            label="Active Outreach Projects"
            value={NGO_SUMMARY.totalActiveProjects}
            sub={`${NGO_SUMMARY.totalBeneficiariesReached.toLocaleString()} community souls reached`}
            icon={FolderKanban}
          />
          <KpiCard
            label="Member Dues Collected"
            value={currency(NGO_SUMMARY.totalDuesCollected)}
            sub={`${NGO_MEMBERS.filter((m) => m.duesStatus === "Paid").length} cleared members`}
            icon={Users}
          />
          <KpiCard
            label="Pending Budget Requests"
            value={BUDGET_APPROVALS.filter((b) => b.status === "Pending Approval").length}
            sub="Awaiting board approval"
            icon={Clock}
          />
        </section>

        {/* Dues Collection Trend + Recent Paid Dues */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Dues Collection Trend chart */}
          <Card className="p-0 overflow-hidden shadow-none lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-semibold">Member Dues Collection Trend</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Jan – Aug 2026</span>
                <DateRangePicker value={trendDateRange} onChange={setTrendDateRange} />
              </div>
            </div>
            <div className="px-3 py-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={DUES_TREND} margin={{ left: -18, right: 8, top: 8 }}>
                    <defs>
                      <linearGradient id="g-dues" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis
                      dataKey="month"
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
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(v: number) => currency(v)}
                      labelFormatter={(l) => `${l} 2026 dues`}
                    />
                    <Area
                      type="monotone"
                      dataKey="collected"
                      name="Dues Collected"
                      stroke="#22c55e"
                      strokeWidth={2}
                      fill="url(#g-dues)"
                      activeDot={{ r: 5, fill: "#22c55e" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-1 px-2 text-xs text-muted-foreground">
                Dues collected has risen to {currency(DUES_TREND[DUES_TREND.length - 1].collected)} in August, up from{" "}
                {currency(DUES_TREND[0].collected)} in January.
              </p>
            </div>
          </Card>

          {/* Recent Paid Dues */}
          <Card className="p-0 overflow-hidden shadow-none">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-semibold">Recent Paid Dues</h2>
              </div>
              <Link to="/members" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                All Members →
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {paidDues.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-sm">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.role} · {m.memberId}</p>
                  </div>
                  <div className="text-right">
                    <ChurchStatusPill status={m.duesStatus} styleMap={CHURCH_DUES_STATUS} />
                    <p className="mt-0.5 font-bold text-sm text-foreground">{currency(m.duesPaid)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Church Dues Snapshot */}
        <Card className="p-5 shadow-none">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Wallet className="size-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-semibold">Church Dues Snapshot</h2>
            </div>
            <Link to="/members">
              <Button size="sm" variant="outline" className="text-xs">
                Manage Members
              </Button>
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Receipt className="size-3.5" /> Total Collected
              </div>
              <p className="mt-1 num text-xl font-bold">{currency(NGO_SUMMARY.totalDuesCollected)}</p>
              <p className="text-[11px] text-muted-foreground">From {NGO_SUMMARY.totalMembersCount} registered members</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" /> Outstanding
              </div>
              <p className="mt-1 num text-xl font-bold text-amber-600 dark:text-amber-400">{currency(outstandingDues)}</p>
              <p className="text-[11px] text-muted-foreground">Awaiting settlement this term</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="size-3.5" /> Collection Rate
              </div>
              <p className="mt-1 num text-xl font-bold">{collectionRate}%</p>
              <p className="text-[11px] text-muted-foreground">{paidDues.length} of {NGO_SUMMARY.totalMembersCount} members fully paid</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <HeartHandshake className="size-3.5" /> Tithes & Offerings
              </div>
              <p className="mt-1 num text-xl font-bold">{currency(NGO_SUMMARY.totalDonationsRaised)}</p>
              <p className="text-[11px] text-muted-foreground">{NGO_DONATIONS.length} giving commitments</p>
            </div>
          </div>
          <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2.5 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            Stewardship is healthy this season — dues momentum is climbing month on month and most members are fully settled. Follow up on the {outstandingDues > 0 ? "outstanding balances" : "few remaining pledges"} to keep the congregation fully current.
          </p>
        </Card>

        {/* Budget Approvals with colored status pills */}
        <Card className="p-0 overflow-hidden shadow-none">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <PiggyBank className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Budget Approval Requests</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-[13px] font-bold text-foreground/70 uppercase tracking-wide">
                  <th className="px-5 py-3">Ref</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Requested By</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {BUDGET_APPROVALS.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs font-semibold">{b.requestNo}</td>
                    <td className="px-4 py-3 font-medium">{b.projectName}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{b.requestedBy}</td>
                    <td className="px-4 py-3 text-right font-semibold">{currency(b.amountRequested)}</td>
                    <td className="px-4 py-3">
                      <ChurchStatusPill status={b.status} styleMap={CHURCH_BUDGET_STATUS} />
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
