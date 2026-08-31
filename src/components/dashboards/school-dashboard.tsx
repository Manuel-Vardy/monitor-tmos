import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { DateRange } from "react-day-picker";
import { format, differenceInDays, addDays, subDays, startOfDay, endOfDay, parse } from "date-fns";
import {
  GraduationCap,
  AlertCircle,
  Banknote,
  Plus,
  Receipt,
  Bell,
  Smartphone,
  Landmark,
  CircleDollarSign,
  TrendingUp,
  Users,
  Coins,
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
import { DateRangePicker } from "@/components/date-range-picker";
import { currency } from "@/lib/mos-data";
import { SCHOOL_STUDENTS, FEE_TRANSACTIONS, SCHOOL_SUMMARY } from "@/lib/school-data";
import { useAcademicYear } from "@/contexts/academic-year-context";

type PaymentMethodKey = "Mobile Money (MTN)" | "Bank Transfer";
function generateCollectionTrendData(dateRange: DateRange | undefined): {
  day: string;
  label: string;
  collected: number;
  transactions: number;
}[] {
  const from = dateRange?.from ? startOfDay(dateRange.from) : subDays(new Date(), 6);
  const to = dateRange?.to ? startOfDay(dateRange.to) : new Date();
  const totalDays = Math.max(1, differenceInDays(to, from) + 1);
  const points = Math.min(totalDays, 30);
  const step = Math.max(1, Math.floor(totalDays / points));

  const basePattern = [0.55, 0.78, 0.68, 1.2, 1.45, 1.7, 0.9];

  return Array.from({ length: points }, (_, i) => {
    const date = addDays(from, i * step);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseIdx = date.getDay();
    const pattern = basePattern[baseIdx] ?? 1;
    const trend = 1 + (i / Math.max(1, points)) * 0.22;
    const wobble = 0.9 + ((Math.sin(i * 2.1) + 1) / 2) * 0.2;

    const avgDaily = totalDays <= 7 ? 3200 : totalDays <= 30 ? 3800 : 4200;
    const collected = Math.round(avgDaily * pattern * trend * wobble * (isWeekend ? 1.1 : 1));
    const transactions = Math.round(collected / (650 + (i % 5) * 50));

    const showFullLabel = points <= 7;
    return {
      day: showFullLabel ? format(date, "EEE") : format(date, "d"),
      label: format(date, "EEE dd MMM"),
      collected,
      transactions,
    };
  });
}

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
} as const;

const METHOD_COLORS: Record<PaymentMethodKey, string> = {
  "Mobile Money (MTN)": "#f59e0b",
  "Bank Transfer": "#0ea5e9",
};

const METHOD_ICONS: Record<PaymentMethodKey, React.ElementType> = {
  "Mobile Money (MTN)": Smartphone,
  "Bank Transfer": Landmark,
};

function getDepartmentForTx(tx: { studentId?: string; studentName?: string }): string {
  if (tx.studentId) {
    const s = SCHOOL_STUDENTS.find(
      (st) =>
        st.studentId === tx.studentId ||
        st.name.toLowerCase() === (tx.studentName ?? "").toLowerCase(),
    );
    if (s?.department) return s.department;
    const id = tx.studentId.toUpperCase();
    if (id.includes("-IT")) return "IT Department";
    if (id.includes("-HR")) return "HR Department";
    if (id.includes("-SOC")) return "Social Studies Department";
    if (id.includes("-ART")) return "Art Department";
    if (id.includes("-BUS")) return "Business Administration";
    if (id.includes("-ACC")) return "Accounting & Finance";
  }
  return "IT Department";
}

export function SchoolDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [departmentDateRange, setDepartmentDateRange] = useState<DateRange | undefined>(undefined);
  const [showRecentReceipts] = useState(false);

  const departmentTransactions = useMemo(() => {
    return FEE_TRANSACTIONS.map((tx) => ({
      ...tx,
      department: getDepartmentForTx(tx),
      transactionDate: parse(tx.date, "dd MMM yyyy", new Date()),
    }));
  }, []);

  const filteredDeptTransactions = useMemo(() => {
    const rangeStart = startOfDay(departmentDateRange?.from ?? subDays(new Date(), 29));
    const rangeEnd = endOfDay(departmentDateRange?.to ?? departmentDateRange?.from ?? new Date());

    return departmentTransactions.filter((tx) => {
      const matchesDepartment =
        selectedDepartment === "all" || tx.department === selectedDepartment;
      return (
        matchesDepartment && tx.transactionDate >= rangeStart && tx.transactionDate <= rangeEnd
      );
    });
  }, [departmentTransactions, selectedDepartment, departmentDateRange]);

  const filteredDeptTotalInflow = useMemo(() => {
    return filteredDeptTransactions.reduce((acc, tx) => acc + tx.amountPaid, 0);
  }, [filteredDeptTransactions]);

  const departmentDailyCollections = useMemo(() => {
    const dailyCollections = new Map<
      string,
      {
        department: string;
        date: string;
        transactionDate: Date;
        receiptCount: number;
        amount: number;
      }
    >();

    for (const tx of filteredDeptTransactions) {
      const key = `${tx.department}-${tx.date}`;
      const current = dailyCollections.get(key);
      if (current) {
        current.receiptCount += 1;
        current.amount += tx.amountPaid;
      } else {
        dailyCollections.set(key, {
          department: tx.department,
          date: tx.date,
          transactionDate: tx.transactionDate,
          receiptCount: 1,
          amount: tx.amountPaid,
        });
      }
    }

    return [...dailyCollections.values()].sort(
      (a, b) => b.transactionDate.getTime() - a.transactionDate.getTime(),
    );
  }, [filteredDeptTransactions]);

  const trendData = useMemo(() => generateCollectionTrendData(dateRange), [dateRange]);

  const trendTotals = useMemo(() => {
    const totalCollected = trendData.reduce((s, r) => s + r.collected, 0);
    const totalTx = trendData.reduce((s, r) => s + r.transactions, 0);
    const avgDaily = Math.round(totalCollected / Math.max(1, trendData.length));
    return { totalCollected, totalTx, avgDaily };
  }, [trendData]);

  const rangeLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, "dd MMM yyyy")} – ${format(dateRange.to, "dd MMM yyyy")}`
      : format(dateRange.from, "dd MMM yyyy")
    : "Last 7 days";

  const collectedByMethod = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of FEE_TRANSACTIONS) {
      map.set(tx.paymentMethod, (map.get(tx.paymentMethod) ?? 0) + tx.amountPaid);
    }
    return Array.from(map.entries())
      .map(([method, amount]) => ({
        method: method as PaymentMethodKey,
        amount,
        count: FEE_TRANSACTIONS.filter((t) => t.paymentMethod === method).length,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, []);

  const { filterStudentsByYear } = useAcademicYear();
  const yearFilteredStudents = useMemo(
    () => filterStudentsByYear(SCHOOL_STUDENTS),
    [filterStudentsByYear],
  );

  const totalExpected = useMemo(
    () => yearFilteredStudents.reduce((s, st) => s + st.tuitionFee, 0),
    [yearFilteredStudents],
  );
  const totalCollected = useMemo(
    () => yearFilteredStudents.reduce((s, st) => s + st.paidAmount, 0),
    [yearFilteredStudents],
  );
  const totalOutstanding = useMemo(
    () => yearFilteredStudents.reduce((s, st) => s + st.balanceDue, 0),
    [yearFilteredStudents],
  );
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  const overdueStudents = yearFilteredStudents.filter((s) => s.status === "Overdue").length;
  const partialStudents = yearFilteredStudents.filter((s) => s.status === "Partial Payment").length;
  const fullyPaidStudents = yearFilteredStudents.filter((s) => s.status === "Paid Full").length;

  return (
    <AppShell
      title="School & Academic Operations"
      subtitle="Fee collection, payment processing, reconciliation & financial operations — powered by Trite"
      actions={
        <div className="hidden lg:flex flex-wrap items-center gap-2">
          <Link to="/students">
            <Button size="sm" variant="outline">
              <Users className="size-4" /> Manage Students
            </Button>
          </Link>
          <Link to="/fees">
            <Button size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a]">
              <Plus className="size-4" /> Collect Payment
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Mobile: hero + 4 KPI cards */}
        <div className="lg:hidden space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <div>
              <p className="text-xs text-muted-foreground">Good morning 🌤</p>
              <h2 className="text-xl font-bold leading-tight">Fees & Payments</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 shadow-xs">
                <span className="size-1.5 rounded-full bg-emerald-500" /> Live · Trite Settling
              </span>
              <button className="relative grid size-9 place-items-center rounded-full bg-card shadow-xs border border-border">
                <Bell className="size-4" />
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500" />
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
                    Total Collected · {rangeLabel}
                  </p>
                  <p className="num mt-2 text-3xl font-extrabold leading-none tracking-tight">
                    {currency(trendTotals.totalCollected)}
                  </p>
                </div>
                <CircleDollarSign className="size-7 opacity-80" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                    Avg Daily
                  </p>
                  <p className="text-lg font-bold leading-none mt-1 num">
                    {currency(trendTotals.avgDaily)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                    Receipts
                  </p>
                  <p className="text-lg font-bold leading-none mt-1 num">{trendTotals.totalTx}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                    Collection
                  </p>
                  <p className="text-lg font-bold leading-none mt-1">{collectionRate}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-border bg-card p-3 shadow-2xs">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                Total Arrears
              </p>
              <p className="mt-1 font-extrabold text-lg text-rose-600 dark:text-rose-400 num">
                {currency(totalOutstanding)}
              </p>
              <p className="text-[11px] font-semibold text-foreground/90 mt-0.5">
                {overdueStudents} overdue
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 shadow-2xs">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                Cleared Students
              </p>
              <p className="mt-1 font-extrabold text-lg text-emerald-600 dark:text-emerald-400">
                {fullyPaidStudents}/{SCHOOL_STUDENTS.length}
              </p>
              <p className="text-[11px] font-semibold text-foreground/90 mt-0.5">Fully paid fees</p>
            </div>
          </div>
        </div>

        {/* Desktop: 3-col KPI grid */}
        <div className="hidden lg:grid grid-cols-3 gap-3">
          <KpiCard
            label="Fees Collected"
            value={currency(totalCollected)}
            delta={15}
            sub={`${fullyPaidStudents} students fully cleared`}
            icon={GraduationCap}
          />
          <KpiCard
            label="Fee Arrears"
            value={currency(totalOutstanding)}
            sub={`${overdueStudents + partialStudents} accounts with balance due`}
            icon={AlertCircle}
          />
          <KpiCard
            label="Collection Rate"
            value={`${collectionRate}%`}
            sub="Term 3 · billed vs received"
            icon={TrendingUp}
          />
        </div>

        {/* Payment Collection Trend + Method Split */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2 shadow-none overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-semibold">Fee Collection Trend</h2>
                <p className="text-xs text-muted-foreground">
                  {rangeLabel} · {trendData.length} data points · Avg daily{" "}
                  {currency(trendTotals.avgDaily)} · Settled via Trite
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-950/40">
                  <TrendingUp className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                    +22% WoW
                  </span>
                </div>
                <DateRangePicker value={dateRange} onChange={setDateRange} />
              </div>
            </div>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="schoolFeeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
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
                    formatter={(val) => [currency(Number(val)), "Collected"]}
                    labelFormatter={(label) => {
                      const item = trendData.find((d) => d.day === label);
                      return item?.label ?? label;
                    }}
                    contentStyle={tooltipStyle}
                  />
                  <Area
                    type="monotone"
                    dataKey="collected"
                    stroke="#22c55e"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#schoolFeeGrad)"
                    dot={{ r: 3, fill: "#22c55e" }}
                    activeDot={{ r: 6, fill: "#22c55e", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Payment Method Split */}
          <Card className="p-5 shadow-none overflow-hidden">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Banknote className="size-4 text-[#22c55e]" />
                <h2 className="text-sm font-semibold">Collected by Payment Method</h2>
              </div>
            </div>
            <ul className="mt-3 divide-y divide-border">
              {collectedByMethod.map((row) => {
                const Icon = METHOD_ICONS[row.method] ?? Banknote;
                const color = METHOD_COLORS[row.method];
                const pct = Math.round(
                  (row.amount / collectedByMethod.reduce((s, r) => s + r.amount, 0)) * 100,
                );
                return (
                  <li
                    key={row.method}
                    className="flex items-center justify-between gap-3 py-3 first:pt-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="grid size-9 shrink-0 place-items-center rounded-xl"
                        style={{ backgroundColor: `${color}1A`, color }}
                      >
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{row.method}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.count} receipt{row.count !== 1 ? "s" : ""} · {pct}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="num font-bold text-sm" style={{ color }}>
                        {currency(row.amount)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        {/* Department Recent Activities + Recent Payments (Full Width Stack) */}
        <div className="space-y-6">
          <Card className="p-0 overflow-hidden shadow-none flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 bg-muted/20">
              <div className="flex items-center">
                <div>
                  <h2 className="text-base font-bold">Department Recent Activities</h2>
                  <p className="text-xs text-muted-foreground">
                    Daily fee collections received by each department
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs cursor-pointer"
                >
                  <option value="all">All Departments ({departmentTransactions.length})</option>
                  <option value="IT Department">IT Department</option>
                  <option value="HR Department">HR Department</option>
                  <option value="Business Administration">Business Administration</option>
                  <option value="Accounting & Finance">Accounting & Finance</option>
                  <option value="Art Department">Art Department</option>
                  <option value="Social Studies Department">Social Studies Department</option>
                </select>
                <DateRangePicker value={departmentDateRange} onChange={setDepartmentDateRange} />
              </div>
            </div>

            {/* Department Summary Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/10 px-5 py-2.5 text-xs">
              <span className="text-muted-foreground flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                {selectedDepartment === "all" ? "All Faculty Departments" : selectedDepartment}:
                <strong className="text-foreground ml-1">
                  {departmentDailyCollections.length}{" "}
                  {departmentDailyCollections.length === 1
                    ? "daily collection"
                    : "daily collections"}
                </strong>
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 num text-sm">
                Total Inflow: {currency(filteredDeptTotalInflow)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <div className="grid min-w-[620px] grid-cols-[minmax(180px,1fr)_130px_120px_100px_140px] items-center gap-x-4 border-b border-border bg-muted/20 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Department</span>
                <span>Date</span>
                <span>Receipts</span>
                <span>Settlement</span>
                <span className="text-right">Received</span>
              </div>
              <ul className="min-w-[620px] divide-y divide-border">
                {departmentDailyCollections.length === 0 ? (
                  <li className="p-10 text-center text-sm text-muted-foreground">
                    <p className="font-semibold">No recent transactions recorded</p>
                    <p className="text-xs mt-1">
                      Select another department or view all departments.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 text-xs"
                      onClick={() => setSelectedDepartment("all")}
                    >
                      View All Departments
                    </Button>
                  </li>
                ) : (
                  departmentDailyCollections.map((collection) => {
                    const tx = {
                      id: `${collection.department}-${collection.date}`,
                      department: collection.department,
                      studentName: collection.department,
                      studentId: "",
                      receiptNo: "",
                      paymentMethod: "Bank Transfer" as PaymentMethodKey,
                      date: `${collection.receiptCount} ${collection.receiptCount === 1 ? "receipt" : "receipts"}`,
                      amountPaid: collection.amount,
                    };
                    return (
                      <li
                        key={tx.id}
                        className="grid grid-cols-[minmax(180px,1fr)_130px_120px_100px_140px] items-center gap-x-4 px-5 py-3 text-sm hover:bg-muted/30 transition-colors"
                      >
                        <div className="contents">
                          <div className="contents">
                            <div className="contents">
                              <p className="font-semibold text-sm whitespace-nowrap text-foreground">
                                {tx.studentName}
                              </p>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {collection.date}
                              </span>
                            </div>
                            <p className="hidden">
                              {tx.studentId} · <span className="font-mono">{tx.receiptNo}</span> ·{" "}
                              {tx.paymentMethod}
                            </p>
                          </div>
                        </div>

                        <div className="contents">
                          <div className="contents">
                            <p className="text-[11px] text-muted-foreground">{tx.date}</p>
                            <span className="inline-block text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 rounded px-1.5 py-0.2 mt-0.5">
                              Settled ✓
                            </span>
                          </div>
                          <div className="contents">
                            <p className="text-right font-bold text-base text-emerald-600 dark:text-emerald-400 num whitespace-nowrap">
                              +{currency(tx.amountPaid)}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>

            <div className="border-t border-border bg-muted/20 px-5 py-3 flex items-center justify-between text-xs">
              <Link
                to="/receipts"
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
              >
                All Receipts ({FEE_TRANSACTIONS.length}) →
              </Link>
            </div>
          </Card>

          {showRecentReceipts && (
            <Card className="p-0 overflow-hidden shadow-none flex flex-col">
              <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Receipt className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold">Recent Receipts (Settled)</h2>
                    <p className="text-xs text-muted-foreground">
                      Official ledger settlements & payment receipts
                    </p>
                  </div>
                </div>
                <Link
                  to="/receipts"
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  All Receipts ({FEE_TRANSACTIONS.length}) →
                </Link>
              </div>
              <ul className="divide-y divide-border flex-1 overflow-y-auto max-h-[420px]">
                {FEE_TRANSACTIONS.map((tx) => {
                  const color = METHOD_COLORS[tx.paymentMethod];
                  const Icon = METHOD_ICONS[tx.paymentMethod] ?? Banknote;
                  return (
                    <li
                      key={tx.id}
                      className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span
                          className="grid size-9 shrink-0 place-items-center rounded-xl"
                          style={{ backgroundColor: `${color}1A`, color }}
                        >
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{tx.studentName}</p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            <span className="font-mono">{tx.receiptNo}</span> · {tx.paymentMethod} ·{" "}
                            {tx.term}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 text-right">
                        <div>
                          <p className="text-[11px] text-muted-foreground">{tx.date}</p>
                          <span className="text-[10px] text-muted-foreground">
                            Received by {tx.receivedBy ?? "Bursar"}
                          </span>
                        </div>
                        <div className="min-w-[100px] text-right">
                          <p className="font-bold text-base text-emerald-600 dark:text-emerald-400 num">
                            +{currency(tx.amountPaid)}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
