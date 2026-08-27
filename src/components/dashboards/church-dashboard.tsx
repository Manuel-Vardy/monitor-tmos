import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Users,
  FolderKanban,
  Clock,
  Plus,
  CheckCircle2,
  Bell,
  TrendingUp,
  Wallet,
  Receipt,
  Coins,
  Award,
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
  NGO_MEMBERS,
  CHURCH_PAYMENT_RECORDS,
  NGO_PROJECTS,
} from "@/lib/ngo-data";

// ── Church-specific status pill ──
const CHURCH_DUES_STATUS: Record<string, { bg: string; text: string; dot: string }> = {
  Paid: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  Outstanding: {
    bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200",
    text: "text-rose-700 dark:text-rose-400",
    dot: "bg-rose-500",
  },
  Partial: {
    bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
  },
};

function ChurchStatusPill({
  status,
  styleMap,
}: {
  status: string;
  styleMap: Record<string, { bg: string; text: string; dot: string }>;
}) {
  const s = styleMap[status] ?? {
    bg: "bg-muted border-border",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold whitespace-nowrap",
        s.bg,
        s.text
      )}
    >
      <span className={cn("size-1.5 rounded-full shrink-0", s.dot)} />
      {status}
    </span>
  );
}

const CHURCH_COLLECTIONS_TREND = [
  { month: "Jan", collected: 8500 },
  { month: "Feb", collected: 11200 },
  { month: "Mar", collected: 10400 },
  { month: "Apr", collected: 14800 },
  { month: "May", collected: 13900 },
  { month: "Jun", collected: 17500 },
  { month: "Jul", collected: 16200 },
  { month: "Aug", collected: 19800 },
];

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
} as const;

export function ChurchDashboard() {
  const members = NGO_MEMBERS;
  const transactions = CHURCH_PAYMENT_RECORDS;

  const totalCollected = useMemo(() => members.reduce((a, m) => a + m.totalPaid, 0), [members]);
  const outstandingDues = useMemo(() => members.reduce((a, m) => a + m.balanceDue, 0), [members]);
  const paidDues = useMemo(() => members.filter((m) => m.duesStatus === "Paid"), [members]);
  const collectionRate =
    members.length > 0 ? Math.round((paidDues.length / members.length) * 100) : 0;

  const tithesAndOfferings = useMemo(
    () => members.reduce((a, m) => a + ((m.monthlyTithe || 0) * 12), 0),
    [members]
  );
  const projectFunds = useMemo(
    () => members.reduce((a, m) => a + (m.projectContributions || 0), 0),
    [members]
  );
  const welfareFunds = useMemo(
    () => members.reduce((a, m) => a + (m.welfarePaid || 0), 0),
    [members]
  );

  const [trendDateRange, setTrendDateRange] = useState<DateRange | undefined>(undefined);

  return (
    <AppShell
      title="Church Operations & Finance"
      subtitle="Tithes, Sunday offerings, welfare dues, project funding levies, and budget approvals"
      actions={
        <div className="hidden lg:flex flex-wrap items-center gap-2">
          <Link to="/members">
            <Button size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a] gap-1.5">
              <Plus className="size-4" /> Dues & Payments
            </Button>
          </Link>
          <Link to="/projects">
            <Button size="sm" variant="outline" className="gap-1.5">
              <FolderKanban className="size-4" /> Church Projects
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Mobile: green hero card + 4 stat cards underneath */}
        <div className="lg:hidden space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <div>
              <p className="text-xs text-muted-foreground">Good morning 🌤</p>
              <h2 className="text-xl font-bold leading-tight">Church Collections</h2>
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

          {/* Green hero card — Total Collections */}
          <div className="relative overflow-hidden rounded-2xl bg-[#22c55e] p-5 text-white shadow-lg">
            <div
              className="pointer-events-none absolute rounded-full bg-white/10"
              style={{ width: "260px", height: "260px", bottom: "-120px", right: "-60px" }}
            />

            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <p className="text-[11px] font-bold tracking-widest uppercase text-white/80">
                  Total Collections
                </p>
                <Coins className="size-6 opacity-70" />
              </div>
              <p className="num mt-2 text-3xl font-extrabold leading-none tracking-tight">
                {currency(totalCollected)}
              </p>
              <div className="mt-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/80">
                  Active Projects · {NGO_PROJECTS.length}
                </p>
                <p className="mt-0.5 text-xs text-white/75">
                  Tithes, Welfare, Offerings & Cathedral building funds
                </p>
              </div>

              <div className="mt-4 flex gap-3">
                <Link to="/members" className="flex-1">
                  <span className="block rounded-xl bg-[#166534] py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#14532d]">
                    Dues & Payments
                  </span>
                </Link>
                <Link to="/projects" className="flex-1">
                  <span className="block rounded-xl bg-white/20 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/30">
                    Projects
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <KpiCard
              label="Church Collections"
              value={currency(totalCollected)}
              delta={18}
              sub={`${members.length} registered members`}
              icon={Coins}
            />
            <KpiCard
              label="Project Funds Raised"
              value={currency(projectFunds)}
              sub="Building & Bus projects"
              icon={FolderKanban}
            />
            <KpiCard
              label="Welfare Collections"
              value={currency(welfareFunds)}
              sub="Member support fund"
              icon={Wallet}
            />
            <KpiCard
              label="Outstanding Arrears"
              value={currency(outstandingDues)}
              sub={`${members.filter((m) => m.balanceDue > 0).length} pending payments`}
              icon={Clock}
            />
          </div>
        </div>

        {/* Desktop: standard 4-column KPI grid */}
        <section className="hidden lg:grid grid-cols-4 gap-3">
          <KpiCard
            label="Total Church Collections"
            value={currency(totalCollected)}
            delta={18}
            sub={`${members.length} active registered members`}
            icon={Coins}
          />
          <KpiCard
            label="Project Funds Raised"
            value={currency(projectFunds)}
            sub={`${NGO_PROJECTS.length} church infrastructure initiatives`}
            icon={FolderKanban}
          />
          <KpiCard
            label="Welfare & Dues Collected"
            value={currency(welfareFunds)}
            sub={`${paidDues.length} cleared members`}
            icon={Wallet}
          />
          <KpiCard
            label="Collection Rate"
            value={`${collectionRate}%`}
            sub={`${paidDues.length} of ${members.length} fully settled`}
            icon={Award}
          />
        </section>

        {/* Collections Trend + Recent Church Collections */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Collection Trend Line Chart */}
          <Card className="p-0 overflow-hidden shadow-none lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h2 className="text-sm font-semibold">Church Collections & Revenue Trend</h2>
                  <p className="text-xs text-muted-foreground">
                    Tithes, Sunday offerings, welfare dues, and project levies
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Jan – Aug 2026</span>
                <DateRangePicker value={trendDateRange} onChange={setTrendDateRange} />
              </div>
            </div>
            <div className="px-3 py-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={CHURCH_COLLECTIONS_TREND} margin={{ left: -18, right: 8, top: 8 }}>
                    <defs>
                      <linearGradient id="g-church" x1="0" y1="0" x2="0" y2="1">
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
                      labelFormatter={(l) => `${l} 2026 collections`}
                    />
                    <Area
                      type="monotone"
                      dataKey="collected"
                      name="Church Revenue"
                      stroke="#22c55e"
                      strokeWidth={2.5}
                      fill="url(#g-church)"
                      dot={{ r: 3, fill: "#22c55e" }}
                      activeDot={{ r: 6, fill: "#22c55e", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-1 px-2 text-xs text-muted-foreground">
                Total monthly collections climbed to{" "}
                {currency(CHURCH_COLLECTIONS_TREND[CHURCH_COLLECTIONS_TREND.length - 1]!.collected)} in
                August, driven by building fund pledges and steady tithing.
              </p>
            </div>
          </Card>

          {/* Recent Church Receipts & Payments */}
          <Card className="p-0 overflow-hidden shadow-none">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-semibold">Recent Payment</h2>
              </div>
              <Link
                to="/members"
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                All Members ({members.length}) →
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {transactions.slice(0, 5).map((tx) => (
                <li key={tx.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-sm">{tx.memberName}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.paymentType} {tx.isProject ? "· 🏗️ Project" : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                      +{currency(tx.amount)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{tx.date}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Church Financial Breakdown Snapshot */}
        <Card className="p-5 shadow-none">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Wallet className="size-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-semibold">Church Collections Breakdown Snapshot</h2>
            </div>
            <Link to="/members">
              <Button size="sm" variant="outline" className="text-xs">
                Dues & Payment Management
              </Button>
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Receipt className="size-3.5" /> Total Church Revenue
              </div>
              <p className="mt-1 num text-xl font-bold">{currency(totalCollected)}</p>
              <p className="text-[11px] text-muted-foreground">
                From {members.length} registered members
              </p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FolderKanban className="size-3.5" /> Project Funds
              </div>
              <p className="mt-1 num text-xl font-bold text-amber-600 dark:text-amber-400">
                {currency(projectFunds)}
              </p>
              <p className="text-[11px] text-muted-foreground">Cathedral & Evangelism Bus</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="size-3.5" /> Standing Fulfillment
              </div>
              <p className="mt-1 num text-xl font-bold">{collectionRate}%</p>
              <p className="text-[11px] text-muted-foreground">
                {paidDues.length} of {members.length} fully settled
              </p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Coins className="size-3.5" /> Tithes & Offerings
              </div>
              <p className="mt-1 num text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {currency(tithesAndOfferings)}
              </p>
              <p className="text-[11px] text-muted-foreground">General ministry commitments</p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
