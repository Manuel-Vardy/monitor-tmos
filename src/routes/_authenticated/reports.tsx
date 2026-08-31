import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Download,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Boxes,
  Banknote,
  PackageCheck,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  BarChart2,
  GitCompare,
  GraduationCap,
  AlertCircle,
  Receipt,
  Users,
  Building2,
  Landmark,
  Smartphone,
  Phone,
  Coins,
  Search,
  Filter,
  SlidersHorizontal,
  X,
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  FileSpreadsheet,
  Check,
  Calendar,
  Layers,
  FileText,
  Printer,
  FolderKanban,
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
  Legend,
  Cell,
} from "recharts";
import { format } from "date-fns";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { StatusBadge } from "@/components/status-badge";
import {
  currency,
  branches as seedBranches,
  products,
  revenueSeries,
  paymentMix,
  seriesFor,
  paymentMixFor,
  branchName,
} from "@/lib/mos-data";
import { useBranches } from "@/lib/branches-context";
import { useInstitution } from "@/hooks/use-institution";
import { useAcademicYear } from "@/contexts/academic-year-context";
import { cn } from "@/lib/utils";
import {
  SCHOOL_STUDENTS,
  FEE_TRANSACTIONS,
  SCHOOL_SUMMARY,
  getStudentYearRange,
  DEFAULT_ACADEMIC_YEAR_RANGES,
  type Student,
  type FeeTransaction,
} from "@/lib/school-data";
import {
  NGO_MEMBERS,
  CHURCH_PAYMENT_RECORDS,
  DEFAULT_CHURCH_PAYMENT_TYPES,
  NGO_PROJECTS,
  type NgoMember,
  type ChurchPaymentRecord,
} from "@/lib/ngo-data";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Retail performance reports: today's summary, product sales breakdown, branch revenue, and date-range analytics.",
      },
      { property: "og:title", content: "Reports — Trite Merchant OS" },
    ],
  }),
  component: Reports,
});

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
} as const;

// ── Derived today's snapshot from the last day in revenueSeries (Sunday) ────
const todaySeries = revenueSeries[revenueSeries.length - 1]!;
const todayGross = todaySeries.sales;
const todaySettled = todaySeries.settled;
const todayTxns = Math.max(1, Math.round(todayGross / 151));
const todayAvg = Math.round(todayGross / todayTxns);
const settlementRate = Math.round((todaySettled / todayGross) * 100);

// ── Product report data ─────────────────────────────────────────────────────
const productReport = products
  .map((p) => ({
    ...p,
    revenue: p.price * p.stock, // proxy: price × current stock as sold value
    stockHealth:
      p.stock === 0
        ? ("out" as const)
        : p.stock <= p.threshold
          ? ("low" as const)
          : ("healthy" as const),
  }))
  .sort((a, b) => b.revenue - a.revenue);

const totalProductRevenue = productReport.reduce((s, p) => s + p.revenue, 0);

// ── Academic helpers & constants ──────────────────────────────────────────

const SCHOOL_METHOD_COLORS: Record<string, string> = {
  "Mobile Money": "#f59e0b",
  "Mobile Money (MTN)": "#f59e0b",
  "Bank Transfer": "#0ea5e9",
};

const SCHOOL_METHOD_ICONS: Record<string, React.ElementType> = {
  "Mobile Money": Smartphone,
  "Mobile Money (MTN)": Smartphone,
  "Bank Transfer": Landmark,
};

const TERTIARY_ACADEMIC_DEPTS = [
  {
    name: "IT Department",
    key: "it",
    color: "#8b5cf6",
    badgeColor: "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  },
  {
    name: "HR Department",
    key: "hr",
    color: "#0ea5e9",
    badgeColor: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  },
  {
    name: "Social Studies Department",
    key: "social",
    color: "#f59e0b",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  },
  {
    name: "Art Department",
    key: "art",
    color: "#ec4899",
    badgeColor: "bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300",
  },
  {
    name: "Business Administration",
    key: "business",
    color: "#f97316",
    badgeColor: "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300",
  },
  {
    name: "Accounting & Finance",
    key: "accounting",
    color: "#14b8a6",
    badgeColor: "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300",
  },
] as const;

function getStudentDeptInfo(s: Student) {
  const deptName =
    s.department ??
    (s.studentId.includes("-IT") ||
    s.studentId.includes("-C01") ||
    s.studentId.includes("-P6") ||
    s.studentId.includes("-J3")
      ? "IT Department"
      : s.studentId.includes("-HR") ||
          s.studentId.includes("-C02") ||
          s.studentId.includes("-P5") ||
          s.studentId.includes("-J2")
        ? "HR Department"
        : s.studentId.includes("-SOC") ||
            s.studentId.includes("-N101") ||
            s.studentId.includes("-N102") ||
            s.studentId.includes("-P4") ||
            s.studentId.includes("-J1")
          ? "Social Studies Department"
          : s.studentId.includes("-ART") ||
              s.studentId.includes("-N201") ||
              s.studentId.includes("-P3") ||
              s.studentId.includes("-K101")
            ? "Art Department"
            : s.studentId.includes("-BUS") ||
                s.studentId.includes("-K102") ||
                s.studentId.includes("-P2") ||
                s.studentId.includes("-J202")
              ? "Business Administration"
              : s.studentId.includes("-ACC") ||
                  s.studentId.includes("-K201") ||
                  s.studentId.includes("-P1")
                ? "Accounting & Finance"
                : "IT Department");
  const found =
    TERTIARY_ACADEMIC_DEPTS.find((d) => d.name === deptName) ?? TERTIARY_ACADEMIC_DEPTS[0];
  return { label: found.name, key: found.key, badgeColor: found.badgeColor, color: found.color };
}

function getTxDeptName(tx: FeeTransaction, students: Student[]): string {
  const st = students.find((s) => s.studentId === tx.studentId || s.name === tx.studentName);
  if (st) return getStudentDeptInfo(st).label;
  const id = tx.studentId || "";
  if (id.includes("-IT") || id.includes("-C01") || id.includes("-P6") || id.includes("-J3"))
    return "IT Department";
  if (id.includes("-HR") || id.includes("-C02") || id.includes("-P5") || id.includes("-J2"))
    return "HR Department";
  if (
    id.includes("-SOC") ||
    id.includes("-N101") ||
    id.includes("-N102") ||
    id.includes("-P4") ||
    id.includes("-J1")
  )
    return "Social Studies Department";
  if (id.includes("-ART") || id.includes("-N201") || id.includes("-P3") || id.includes("-K101"))
    return "Art Department";
  if (id.includes("-BUS") || id.includes("-K102") || id.includes("-P2") || id.includes("-J202"))
    return "Business Administration";
  if (id.includes("-ACC") || id.includes("-K201") || id.includes("-P1"))
    return "Accounting & Finance";
  return "IT Department";
}

function getTxFeeTypeDesc(tx: FeeTransaction): string {
  if (tx.feeType) return tx.feeType;
  if (tx.amountPaid >= 2000) return "Tuition Fee (Core Academic)";
  if (tx.amountPaid >= 1000) return "Tuition Installment Payment";
  if (tx.amountPaid === 350) return "Faculty & Practical Lab Fee";
  if (tx.amountPaid === 250) return "Examination & Assessment Levy";
  if (tx.amountPaid === 150) return "Library & ICT Infrastructure";
  return "Tuition & Academic Levies";
}

function getStudentFeeTypesList(s: Student): string[] {
  if (s.assignedFeeTypes && s.assignedFeeTypes.length > 0) return s.assignedFeeTypes;
  return ["Tuition Fee", "Faculty Lab", "Exam Levy", "ICT Levy", "SRC Dues"];
}

function exportAcademicCsv(students: Student[], _transactions: FeeTransaction[]) {
  const headers = [
    "#",
    "Student Name",
    "Phone",
    "Department",
    "Academic Year Range",
    "Tuition Fee (GHS)",
    "Amount Paid (GHS)",
    "Balance Due (GHS)",
    "Payment Standing",
    "Academic Term",
  ];
  const rows = students.map((s, idx) => {
    const deptInfo = getStudentDeptInfo(s);
    return [
      idx + 1,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.guardianPhone}"`,
      `"${deptInfo.label}"`,
      `"${getStudentYearRange(s)}"`,
      s.tuitionFee,
      s.paidAmount,
      s.balanceDue,
      `"${s.status}"`,
      `"${s.term}"`,
    ].join(",");
  });
  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `tertiary_academic_report_${new Date().toISOString().slice(0, 10)}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function StudentQuickModal({
  student,
  transactions,
  onClose,
}: {
  student: Student;
  transactions: FeeTransaction[];
  onClose: () => void;
}) {
  const deptInfo = getStudentDeptInfo(student);
  const studentTxns = transactions.filter(
    (t) => t.studentId === student.studentId || t.studentName === student.name,
  );
  const pctPaid =
    student.tuitionFee > 0 ? Math.round((student.paidAmount / student.tuitionFee) * 100) : 100;
  const assignedFees = getStudentFeeTypesList(student);
  const yearRange = getStudentYearRange(student);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold">{student.name}</h3>
              <span
                className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded-full",
                  deptInfo.badgeColor,
                )}
              >
                {deptInfo.label}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40 font-mono">
                {yearRange}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Index No: {student.studentId} · Cohort: {yearRange} · {student.term}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Breakdown cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-secondary/30 p-3">
            <p className="text-[11px] font-medium text-muted-foreground uppercase">Tuition Fee</p>
            <p className="text-lg font-bold mt-1">{currency(student.tuitionFee)}</p>
          </div>
          <div className="rounded-xl border border-border bg-emerald-500/10 p-3">
            <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 uppercase">
              Paid Amount
            </p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {currency(student.paidAmount)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-rose-500/10 p-3">
            <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 uppercase">
              Balance Due
            </p>
            <p className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-1">
              {currency(student.balanceDue)}
            </p>
          </div>
        </div>

        {/* Assigned Fee Types */}
        <div className="rounded-xl border border-border bg-secondary/20 p-3 space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Assigned Fee Types
          </p>
          <div className="flex flex-wrap gap-1.5">
            {assignedFees.map((ft, i) => (
              <span
                key={i}
                className="text-xs bg-card px-2 py-0.5 rounded-md border border-border font-medium"
              >
                {ft}
              </span>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span>Payment Fulfillment</span>
            <span>{pctPaid}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                pctPaid >= 100 ? "bg-emerald-500" : pctPaid > 0 ? "bg-amber-500" : "bg-rose-500",
              )}
              style={{ width: `${Math.min(100, pctPaid)}%` }}
            />
          </div>
        </div>

        {/* Contact details */}
        <div className="rounded-xl border border-border bg-secondary/20 p-3.5 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Phone Contact
          </p>
          <p className="text-sm font-medium flex items-center gap-1.5">
            <Smartphone className="size-3.5 text-muted-foreground" />
            <span>{student.guardianPhone}</span>
          </p>
        </div>

        {/* Transactions list */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Payment Receipts History ({studentTxns.length})
          </h4>
          {studentTxns.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-2">
              No recorded receipts yet for this student.
            </p>
          ) : (
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {studentTxns.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card text-xs"
                >
                  <div>
                    <span className="font-semibold text-foreground">{tx.receiptNo}</span>
                    <span className="text-muted-foreground ml-2">· {tx.date}</span>
                    <p className="text-[11px] text-muted-foreground">
                      {tx.paymentMethod.replace(" (MTN)", "")}
                    </p>
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    +{currency(tx.amountPaid)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function SchoolReports() {
  const [activeTab, setActiveTab] = useState<
    "collection" | "methods" | "students" | "transactions"
  >("collection");

  // ── Filters State ──
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const {
    academicYear: cohortYearFilter,
    setAcademicYear: setCohortYearFilter,
    customStartYear,
    setCustomStartYear,
    customEndYear,
    setCustomEndYear,
    availableYearRanges,
  } = useAcademicYear();
  const [balanceFilter, setBalanceFilter] = useState("all");
  const [termFilter, setTermFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [showBalanceAndSortControls] = useState(false);
  const [customRangeDraftStart, setCustomRangeDraftStart] = useState(customStartYear);
  const [customRangeDraftEnd, setCustomRangeDraftEnd] = useState(customEndYear);
  const [isCustomYearRangeEditing, setIsCustomYearRangeEditing] = useState(false);
  const [sortBy, setSortBy] = useState<
    | "balance-desc"
    | "balance-asc"
    | "name-asc"
    | "tuition-desc"
    | "tuition-asc"
    | "cohort-asc"
    | "cohort-desc"
  >("balance-desc");
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);

  // ── Count active filters ──
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count++;
    if (deptFilter !== "all") count++;
    if (statusFilter !== "all") count++;
    if (cohortYearFilter !== "all") count++;
    if (balanceFilter !== "all") count++;
    if (termFilter !== "all") count++;
    if (paymentMethodFilter !== "all") count++;
    return count;
  }, [
    search,
    deptFilter,
    statusFilter,
    cohortYearFilter,
    balanceFilter,
    termFilter,
    paymentMethodFilter,
  ]);

  const handleResetFilters = () => {
    setSearch("");
    setDeptFilter("all");
    setStatusFilter("all");
    setCohortYearFilter("all");
    setCustomStartYear("");
    setCustomEndYear("");
    setBalanceFilter("all");
    setTermFilter("all");
    setPaymentMethodFilter("all");
    setSortBy("balance-desc");
  };

  // ── Filtered Students Computation ──
  const filteredStudents = useMemo(() => {
    return SCHOOL_STUDENTS.filter((st) => {
      const dept = getStudentDeptInfo(st);
      const studentYear = getStudentYearRange(st);

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = st.name.toLowerCase().includes(q);
        const matchId = st.studentId.toLowerCase().includes(q);
        const matchPhone = st.guardianPhone.toLowerCase().includes(q);
        const matchDept = dept.label.toLowerCase().includes(q);
        const matchYear = studentYear.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchPhone && !matchDept && !matchYear) return false;
      }

      // Department level
      if (deptFilter !== "all" && dept.label !== deptFilter && dept.key !== deptFilter) {
        return false;
      }

      // Academic Year / Cohort Range
      if (cohortYearFilter !== "all") {
        if (cohortYearFilter === "custom" && customStartYear && customEndYear) {
          const targetRange = `${customStartYear.trim()} - ${customEndYear.trim()}`;
          if (studentYear !== targetRange) return false;
        } else if (cohortYearFilter !== "custom") {
          if (studentYear !== cohortYearFilter) return false;
        }
      }

      // Status
      if (statusFilter !== "all" && st.status !== statusFilter) return false;

      // Balance
      if (balanceFilter === "has-balance" && st.balanceDue <= 0) return false;
      if (balanceFilter === "cleared" && st.balanceDue > 0) return false;
      if (balanceFilter === "high-arrears" && st.balanceDue < 1000) return false;

      // Term
      if (termFilter !== "all" && st.term !== termFilter) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "balance-desc") return b.balanceDue - a.balanceDue;
      if (sortBy === "balance-asc") return a.balanceDue - b.balanceDue;
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "tuition-desc") return b.tuitionFee - a.tuitionFee;
      if (sortBy === "tuition-asc") return a.tuitionFee - b.tuitionFee;
      if (sortBy === "cohort-desc")
        return getStudentYearRange(b).localeCompare(getStudentYearRange(a));
      if (sortBy === "cohort-asc")
        return getStudentYearRange(a).localeCompare(getStudentYearRange(b));
      return 0;
    });
  }, [
    search,
    deptFilter,
    statusFilter,
    cohortYearFilter,
    customStartYear,
    customEndYear,
    balanceFilter,
    termFilter,
    sortBy,
  ]);

  // ── Filtered Transactions Computation ──
  const filteredTransactions = useMemo(() => {
    const studentIds = new Set(filteredStudents.map((s) => s.studentId));
    return FEE_TRANSACTIONS.filter((tx) => {
      const q = search.trim().toLowerCase();
      const txDept = getTxDeptName(tx, SCHOOL_STUDENTS);
      const matchSearch =
        !q ||
        tx.receiptNo.toLowerCase().includes(q) ||
        tx.studentName.toLowerCase().includes(q) ||
        tx.studentId.toLowerCase().includes(q) ||
        txDept.toLowerCase().includes(q) ||
        (tx.receivedBy ?? "").toLowerCase().includes(q);

      const matchStudentInFilter = studentIds.has(tx.studentId);

      // Department filter
      const matchDept = deptFilter === "all" || txDept === deptFilter;

      // Method filter
      const matchMethod =
        paymentMethodFilter === "all" ||
        tx.paymentMethod === paymentMethodFilter ||
        tx.paymentMethod.replace(" (MTN)", "") === paymentMethodFilter;

      // Term filter
      const matchTerm = termFilter === "all" || tx.term === termFilter;

      return (matchStudentInFilter || matchSearch) && matchDept && matchMethod && matchTerm;
    });
  }, [filteredStudents, search, deptFilter, paymentMethodFilter, termFilter]);

  // ── Dynamic KPIs (Live Tallying with Students & Fees) ──
  const totalExpected = useMemo(
    () => filteredStudents.reduce((s, st) => s + st.tuitionFee, 0),
    [filteredStudents],
  );
  const totalCollected = useMemo(
    () => filteredStudents.reduce((s, st) => s + st.paidAmount, 0),
    [filteredStudents],
  );
  const totalOutstanding = useMemo(
    () => filteredStudents.reduce((s, st) => s + st.balanceDue, 0),
    [filteredStudents],
  );
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  const fullyPaidCount = filteredStudents.filter((s) => s.status === "Paid Full").length;
  const partialCount = filteredStudents.filter((s) => s.status === "Partial Payment").length;
  const overdueCount = filteredStudents.filter((s) => s.status === "Overdue").length;

  // ── Department Grouping for Charts ──
  const deptBreakdownChartData = useMemo(() => {
    return TERTIARY_ACADEMIC_DEPTS.map((g) => {
      const studentsInGroup = filteredStudents.filter(
        (s) => getStudentDeptInfo(s).label === g.name,
      );
      const billed = studentsInGroup.reduce((s, st) => s + st.tuitionFee, 0);
      const collected = studentsInGroup.reduce((s, st) => s + st.paidAmount, 0);
      const arrears = studentsInGroup.reduce((s, st) => s + st.balanceDue, 0);
      return {
        name: g.name.split(" ")[0],
        fullName: g.name,
        count: studentsInGroup.length,
        billed,
        collected,
        arrears,
      };
    }).filter((g) =>
      deptFilter === "all" ? true : filteredStudents.length > 0 ? g.count > 0 : true,
    );
  }, [filteredStudents, deptFilter]);

  // ── Payment method distribution ──
  const collectedByMethod = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of filteredTransactions) {
      const cleanMethod = tx.paymentMethod.replace(" (MTN)", "");
      map.set(cleanMethod, (map.get(cleanMethod) ?? 0) + tx.amountPaid);
    }
    // If no filtered transactions but students have payments, show proportionate estimates
    if (map.size === 0 && totalCollected > 0) {
      map.set("Mobile Money", Math.round(totalCollected * 0.65));
      map.set("Bank Transfer", Math.round(totalCollected * 0.35));
    }
    return Array.from(map.entries())
      .filter(
        ([method]) =>
          paymentMethodFilter === "all" ||
          method === paymentMethodFilter ||
          `${method} (MTN)` === paymentMethodFilter,
      )
      .map(([method, amount]) => ({
        method,
        amount,
        count: filteredTransactions.filter((t) => t.paymentMethod.includes(method)).length || 1,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, paymentMethodFilter, totalCollected]);

  const totalMethodAmount = collectedByMethod.reduce((s, m) => s + m.amount, 0);

  const methodChartData = collectedByMethod.map((m) => ({
    name: m.method,
    amount: m.amount,
  }));

  const tabs = [
    { key: "collection" as const, label: "Fee Collection", icon: GraduationCap },
    { key: "methods" as const, label: "Payment Channels", icon: Banknote },
    {
      key: "students" as const,
      label: `Student Balances (${filteredStudents.length})`,
      icon: Users,
    },
    {
      key: "transactions" as const,
      label: `Receipts Ledger (${filteredTransactions.length})`,
      icon: Receipt,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ══════════════════════════════════════════════
          FILTER CONTROLS TOOLBAR
      ══════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/10 text-accent">
              <Filter className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                Filter Academic Reports
                {activeFiltersCount > 0 && (
                  <span className="inline-flex items-center justify-center rounded-full bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5">
                    {activeFiltersCount} active
                  </span>
                )}
              </h2>
              <p className="text-xs text-muted-foreground">
                Filter fees, arrears, and student records across departments, standing, and payment
                channels
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 gap-1 px-2"
              >
                <RotateCcw className="size-3.5" />
                Reset Filters
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportAcademicCsv(filteredStudents, filteredTransactions)}
              className="h-8 text-xs gap-1.5"
            >
              <Download className="size-3.5 text-accent" />
              Export Filtered CSV
            </Button>
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Search Query */}
          <div className="relative">
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Search Student / Index No / Phone
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, index no, phone..."
                className="w-full h-9 pl-9 pr-8 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 2. Department */}
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Academic Department
            </label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Tertiary Departments</option>
              {TERTIARY_ACADEMIC_DEPTS.map((d) => (
                <option key={d.key} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Academic Year Range / Cohort */}
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Academic Year Range
            </label>
            <select
              value={cohortYearFilter}
              onChange={(e) => {
                const nextValue = e.target.value;
                setCohortYearFilter(nextValue);
                if (nextValue === "custom") {
                  setCustomRangeDraftStart(customStartYear);
                  setCustomRangeDraftEnd(customEndYear);
                  setIsCustomYearRangeEditing(true);
                }
              }}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Academic Years</option>
              {availableYearRanges.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
              <option value="custom">Type Custom Year Range...</option>
            </select>
            {cohortYearFilter === "custom" &&
              (isCustomYearRangeEditing || !customStartYear || !customEndYear ? (
                <div className="mt-2.5 rounded-xl border border-accent/20 bg-accent/5 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-accent">
                      Custom cohort range
                    </span>
                    <span className="text-[10px] text-muted-foreground">e.g. 2026 – 2030</span>
                  </div>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <input
                      type="number"
                      min="2000"
                      max="2100"
                      placeholder="Start year"
                      value={customRangeDraftStart}
                      onChange={(e) => setCustomRangeDraftStart(e.target.value)}
                      className="h-9 min-w-0 rounded-lg border border-border bg-background px-3 text-sm text-foreground font-mono outline-none focus:ring-1 focus:ring-accent"
                    />
                    <span className="text-sm font-semibold text-muted-foreground">–</span>
                    <input
                      type="number"
                      min="2000"
                      max="2100"
                      placeholder="End year"
                      value={customRangeDraftEnd}
                      onChange={(e) => setCustomRangeDraftEnd(e.target.value)}
                      className="h-9 min-w-0 rounded-lg border border-border bg-background px-3 text-sm text-foreground font-mono outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => {
                        setCustomRangeDraftStart(customStartYear);
                        setCustomRangeDraftEnd(customEndYear);
                        setIsCustomYearRangeEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 text-xs"
                      disabled={
                        !customRangeDraftStart ||
                        !customRangeDraftEnd ||
                        Number(customRangeDraftStart) > Number(customRangeDraftEnd)
                      }
                      onClick={() => {
                        setCustomStartYear(customRangeDraftStart);
                        setCustomEndYear(customRangeDraftEnd);
                        setIsCustomYearRangeEditing(false);
                      }}
                    >
                      Apply range
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl border border-border bg-secondary/30 px-3 py-2">
                  <span className="text-xs font-semibold text-foreground">
                    {customStartYear} – {customEndYear}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 text-xs"
                    onClick={() => setIsCustomYearRangeEditing(true)}
                  >
                    Edit range
                  </Button>
                </div>
              ))}
          </div>

          {/* 4. Payment Standing */}
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Payment Standing
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Payment Statuses</option>
              <option value="Paid Full">Paid Full (Cleared)</option>
              <option value="Partial Payment">Partial Payment</option>
              <option value="Overdue">Overdue (Unpaid)</option>
            </select>
          </div>

          {/* Balance / arrears filter removed from this report view */}
          {showBalanceAndSortControls && (
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Balance / Arrears
              </label>
              <select
                value={balanceFilter}
                onChange={(e) => setBalanceFilter(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="all">All Balances</option>
                <option value="has-balance">Has Balance Due (&gt; GH₵0)</option>
                <option value="cleared">Fully Cleared (= GH₵0)</option>
                <option value="high-arrears">High Arrears (≥ GH₵1,000)</option>
              </select>
            </div>
          )}

          {/* 6. Payment Channel */}
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Payment Channel
            </label>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Payment Channels</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          {/* 7. Academic Term */}
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Academic Term
            </label>
            <select
              value={termFilter}
              onChange={(e) => setTermFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Terms</option>
              <option value="Term 3, 2026">Term 3, 2026 (Current)</option>
              <option value="Term 2, 2026">Term 2, 2026</option>
              <option value="Term 1, 2026">Term 1, 2026</option>
            </select>
          </div>

          {showBalanceAndSortControls /* Sort order control removed from this report view */ && (
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Sort Order
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="balance-desc">Highest Balance Due</option>
                <option value="balance-asc">Lowest Balance Due</option>
                <option value="name-asc">Student Name (A - Z)</option>
                <option value="tuition-desc">Tuition Fee (High - Low)</option>
                <option value="tuition-asc">Tuition Fee (Low - High)</option>
                <option value="cohort-desc">Cohort Years (Newest First)</option>
                <option value="cohort-asc">Cohort Years (Oldest First)</option>
              </select>
            </div>
          )}

          {/* 9. Quick Status Quick Filters */}
          <div className="flex flex-col justify-end">
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Quick Filter Presets
            </label>
            <div className="flex flex-wrap gap-1.5 h-9 items-center">
              <button
                onClick={() => setStatusFilter(statusFilter === "Overdue" ? "all" : "Overdue")}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors",
                  statusFilter === "Overdue"
                    ? "bg-rose-600 text-white border-rose-600"
                    : "bg-background text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40",
                )}
              >
                Overdue ({SCHOOL_STUDENTS.filter((s) => s.status === "Overdue").length})
              </button>
              <button
                onClick={() =>
                  setBalanceFilter(balanceFilter === "has-balance" ? "all" : "has-balance")
                }
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors",
                  balanceFilter === "has-balance"
                    ? "bg-amber-600 text-white border-amber-600"
                    : "bg-background text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/60 hover:bg-amber-50 dark:hover:bg-amber-950/40",
                )}
              >
                With Arrears ({SCHOOL_STUDENTS.filter((s) => s.balanceDue > 0).length})
              </button>
              <button
                onClick={() => setStatusFilter(statusFilter === "Paid Full" ? "all" : "Paid Full")}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors",
                  statusFilter === "Paid Full"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-background text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40",
                )}
              >
                Cleared ({SCHOOL_STUDENTS.filter((s) => s.status === "Paid Full").length})
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Tags Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-muted-foreground">
            Showing <strong className="text-foreground">{filteredStudents.length}</strong> of{" "}
            {SCHOOL_STUDENTS.length} students
            {filteredStudents.length !== SCHOOL_STUDENTS.length && (
              <span>
                {" "}
                ({Math.round((filteredStudents.length / SCHOOL_STUDENTS.length) * 100)}% of cohort)
              </span>
            )}
          </span>

          {search && (
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-foreground font-medium">
              Search: "{search}"
              <button onClick={() => setSearch("")} className="hover:text-rose-500">
                <X className="size-3" />
              </button>
            </span>
          )}

          {deptFilter !== "all" && (
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-foreground font-medium">
              Dept: {deptFilter}
              <button onClick={() => setDeptFilter("all")} className="hover:text-rose-500">
                <X className="size-3" />
              </button>
            </span>
          )}

          {statusFilter !== "all" && (
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-foreground font-medium">
              {statusFilter === "Paid Full" ? "Cleared" : "Overdue"}
              <button onClick={() => setStatusFilter("all")} className="hover:text-rose-500">
                <X className="size-3" />
              </button>
            </span>
          )}

          {balanceFilter !== "all" && (
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-foreground font-medium">
              Arrears
              <button onClick={() => setBalanceFilter("all")} className="hover:text-rose-500">
                <X className="size-3" />
              </button>
            </span>
          )}

          {paymentMethodFilter !== "all" && (
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-foreground font-medium">
              Channel: {paymentMethodFilter}
              <button onClick={() => setPaymentMethodFilter("all")} className="hover:text-rose-500">
                <X className="size-3" />
              </button>
            </span>
          )}
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              "flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === t.key
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="size-4 shrink-0" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          TAB 1 — FEE COLLECTION ANALYTICS
      ══════════════════════════════════════════════ */}
      {activeTab === "collection" && (
        <div className="space-y-6">
          {/* Dynamic KPI Cards */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Fees Collected
                </p>
                <span className="rounded-full p-1.5 sm:p-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <GraduationCap className="size-3.5 sm:size-4" />
                </span>
              </div>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {currency(totalCollected)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {fullyPaidCount} students fully cleared
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Fee Arrears
                </p>
                <span className="rounded-full p-1.5 sm:p-2 bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                  <AlertCircle className="size-3.5 sm:size-4" />
                </span>
              </div>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">
                {currency(totalOutstanding)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {overdueCount + partialCount} with balance due
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Expected Billing
                </p>
                <span className="rounded-full p-1.5 sm:p-2 bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                  <Receipt className="size-3.5 sm:size-4" />
                </span>
              </div>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                {currency(totalExpected)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {filteredStudents.length} student accounts
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Collection Rate
                </p>
                <span className="rounded-full p-1.5 sm:p-2 bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                  <TrendingUp className="size-3.5 sm:size-4" />
                </span>
              </div>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {collectionRate}%
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">Billed vs received in filter</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Department Collection vs Arrears */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs">
              <div className="mb-4">
                <h2 className="text-lg font-bold">Department Performance</h2>
                <p className="text-xs text-muted-foreground">
                  Collected vs Outstanding Arrears by tertiary department
                </p>
              </div>
              <div className="h-64">
                {deptBreakdownChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                    No departments match the filter.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={deptBreakdownChartData}
                      margin={{ left: -18, right: 4, top: 4 }}
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
                        tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                        tickLine={false}
                        axisLine={false}
                        fontSize={11}
                        stroke="var(--color-muted-foreground)"
                      />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v)} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar
                        name="Collected"
                        dataKey="collected"
                        fill="#22c55e"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        name="Arrears Due"
                        dataKey="arrears"
                        fill="#f43f5e"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 2: Collected by Payment Channel */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs">
              <div className="mb-4">
                <h2 className="text-lg font-bold">Collection by Channel</h2>
                <p className="text-xs text-muted-foreground">
                  Fee settlement split across payment methods
                </p>
              </div>
              <div className="h-64">
                {methodChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                    No channel data for active filter.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={methodChartData} margin={{ left: -18, right: 4, top: 4 }}>
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
                        tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                        tickLine={false}
                        axisLine={false}
                        fontSize={11}
                        stroke="var(--color-muted-foreground)"
                      />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v)} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar
                        name="Amount Received"
                        dataKey="amount"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 2 — PAYMENT METHODS BREAKDOWN
      ══════════════════════════════════════════════ */}
      {activeTab === "methods" && (
        <div className="rounded-xl border border-border bg-card shadow-2xs">
          <div className="border-b border-border px-5 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Payment Method Breakdown</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Filtered share of fees collected by channel ({collectedByMethod.length} channels
                active)
              </p>
            </div>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              Total: {currency(totalMethodAmount)}
            </span>
          </div>
          {collectedByMethod.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No payment transactions match your current filters.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {collectedByMethod.map((m) => {
                const Icon = SCHOOL_METHOD_ICONS[m.method] ?? Banknote;
                const color = SCHOOL_METHOD_COLORS[m.method] ?? "#22c55e";
                const pct =
                  totalMethodAmount > 0 ? Math.round((m.amount / totalMethodAmount) * 100) : 0;
                return (
                  <li
                    key={m.method}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/40 transition-colors"
                  >
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-xl"
                      style={{ backgroundColor: `${color}1A`, color }}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="w-44 shrink-0">
                      <p className="text-sm font-medium">{m.method}</p>
                      <p className="text-xs text-muted-foreground">{m.count} receipt(s)</p>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-accent transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-12 text-right text-xs font-semibold text-muted-foreground">
                      {pct}%
                    </span>
                    <span className="w-28 text-right text-sm font-bold">{currency(m.amount)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 3 — STUDENT BALANCES LEDGER
      ══════════════════════════════════════════════ */}
      {activeTab === "students" && (
        <div className="rounded-xl border border-border bg-card shadow-2xs">
          <div className="border-b border-border px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Student Account Balances Ledger</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Showing {filteredStudents.length} of {SCHOOL_STUDENTS.length} students ·{" "}
                {fullyPaidCount} paid in full · {partialCount} partial · {overdueCount} overdue
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportAcademicCsv(filteredStudents, filteredTransactions)}
                className="h-8 text-xs gap-1.5"
              >
                <Download className="size-3.5" />
                Export Ledger
              </Button>
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <AlertCircle className="size-8 text-muted-foreground mx-auto" />
              <p className="text-base font-semibold">No students match your filter criteria</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Try adjusting your search query, department, payment standing, or balance filters.
              </p>
              <Button size="sm" variant="outline" onClick={handleResetFilters} className="mt-2">
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/40 text-left text-xs tracking-wide text-muted-foreground uppercase">
                    <th className="px-4 py-3 font-bold">#</th>
                    <th className="px-5 py-3 font-bold">Student</th>
                    <th className="px-5 py-3 font-bold">Department</th>
                    <th className="px-4 py-3 font-bold">Cohort / Years</th>
                    <th className="px-5 py-3 font-bold">Fee Types Taking</th>
                    <th className="px-5 py-3 font-bold">Phone Number</th>
                    <th className="px-5 py-3 text-right font-bold">Tuition</th>
                    <th className="px-5 py-3 text-right font-bold">Paid</th>
                    <th className="px-5 py-3 text-right font-bold">Balance Due</th>
                    <th className="px-5 py-3 font-bold">Status</th>
                    <th className="px-4 py-3 text-right font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStudents.map((s, i) => {
                    const deptInfo = getStudentDeptInfo(s);
                    const feeTypes = getStudentFeeTypesList(s);
                    const yearRange = getStudentYearRange(s);
                    return (
                      <tr key={s.id} className="transition-colors hover:bg-secondary/60">
                        <td className="px-4 py-3 text-xs font-bold text-muted-foreground">
                          {i + 1}
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-semibold text-foreground">{s.name}</p>
                          <p className="text-xs font-mono text-muted-foreground">{s.studentId}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={cn(
                              "text-xs font-semibold px-2 py-0.5 rounded-md",
                              deptInfo.badgeColor,
                            )}
                          >
                            {deptInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40 whitespace-nowrap">
                            {yearRange}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {feeTypes.slice(0, 2).map((ft, fi) => (
                              <span
                                key={fi}
                                className="text-[10px] bg-secondary px-1.5 py-0.5 rounded border border-border/60"
                              >
                                {ft.split(" ")[0]}
                              </span>
                            ))}
                            {feeTypes.length > 2 && (
                              <span className="text-[10px] bg-accent/10 text-accent font-bold px-1 py-0.5 rounded">
                                +{feeTypes.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                            <Phone className="size-3 text-muted-foreground" />
                            <span>{s.guardianPhone}</span>
                          </p>
                        </td>
                        <td className="px-5 py-3 text-right font-medium">
                          {currency(s.tuitionFee)}
                        </td>
                        <td className="px-5 py-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                          {currency(s.paidAmount)}
                        </td>
                        <td className="px-5 py-3 text-right font-bold">
                          {s.balanceDue > 0 ? (
                            <span className="text-rose-600 dark:text-rose-400">
                              {currency(s.balanceDue)}
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400">Cleared</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge
                            tone={
                              s.status === "Overdue"
                                ? "bad"
                                : s.status === "Partial Payment"
                                  ? "warn"
                                  : "good"
                            }
                          >
                            {s.status}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedStudentForModal(s)}
                            className="h-7 text-xs px-2 text-accent hover:bg-accent/10"
                          >
                            Statement
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 4 — RECEIPTS & TRANSACTIONS LEDGER
      ══════════════════════════════════════════════ */}
      {activeTab === "transactions" && (
        <div className="rounded-xl border border-border bg-card shadow-2xs">
          <div className="border-b border-border px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Fee Receipts & Transaction Log</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Showing {filteredTransactions.length} receipts issued · Total:{" "}
                {currency(filteredTransactions.reduce((s, t) => s + t.amountPaid, 0))}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportAcademicCsv(filteredStudents, filteredTransactions)}
              className="h-8 text-xs gap-1.5"
            >
              <Download className="size-3.5" />
              Export Receipts CSV
            </Button>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Receipt className="size-8 text-muted-foreground mx-auto" />
              <p className="text-base font-semibold">No receipts match your search & filter</p>
              <p className="text-xs text-muted-foreground">
                Try adjusting search term, department, or payment channel filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/40 text-left text-xs tracking-wide text-muted-foreground uppercase">
                    <th className="px-5 py-3 font-bold">Receipt #</th>
                    <th className="px-5 py-3 font-bold">Student</th>
                    <th className="px-5 py-3 font-bold">Department</th>
                    <th className="px-5 py-3 font-bold">Fee Type Paid</th>
                    <th className="px-5 py-3 font-bold">Payment Method</th>
                    <th className="px-5 py-3 text-right font-bold">Amount Paid</th>
                    <th className="px-5 py-3 font-bold">Date & Term</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTransactions.map((tx) => {
                    const MethodIcon = SCHOOL_METHOD_ICONS[tx.paymentMethod] ?? Banknote;
                    const color = SCHOOL_METHOD_COLORS[tx.paymentMethod] ?? "#22c55e";
                    const dept = getTxDeptName(tx, SCHOOL_STUDENTS);
                    const feeType = getTxFeeTypeDesc(tx);
                    return (
                      <tr key={tx.id} className="transition-colors hover:bg-secondary/60">
                        <td className="px-5 py-3 font-mono font-bold text-foreground">
                          <span className="bg-secondary px-2 py-0.5 rounded border border-border/50">
                            {tx.receiptNo}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-semibold text-foreground">{tx.studentName}</p>
                          <p className="text-xs font-mono text-muted-foreground">{tx.studentId}</p>
                        </td>
                        <td className="px-5 py-3 text-xs font-medium text-foreground">{dept}</td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">{feeType}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="p-1 rounded-md"
                              style={{ backgroundColor: `${color}20`, color }}
                            >
                              <MethodIcon className="size-3" />
                            </span>
                            <span className="text-xs font-medium">
                              {tx.paymentMethod.replace(" (MTN)", "")}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {currency(tx.amountPaid)}
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-xs">{tx.date}</p>
                          <p className="text-[11px] text-muted-foreground">{tx.term}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Student Statement Quick Modal */}
      {selectedStudentForModal && (
        <StudentQuickModal
          student={selectedStudentForModal}
          transactions={FEE_TRANSACTIONS}
          onClose={() => setSelectedStudentForModal(null)}
        />
      )}
    </div>
  );
}

// ── Church Reports Helpers & Component ────────────────────────────────────────

function exportChurchCsv(transactions: ChurchPaymentRecord[], members: NgoMember[]) {
  const headers = [
    "#",
    "Member Name",
    "Phone",
    "Payment Types",
    "Amount Paid (GHS)",
    "Date",
    "Payment Method",
  ];
  const rows = transactions.map((t, idx) => {
    const member = members.find((m) => m.memberId === t.memberId || m.name === t.memberName);
    return [
      idx + 1,
      `"${t.memberName.replace(/"/g, '""')}"`,
      `"${member?.phone || ""}"`,
      `"${t.paymentType}"`,
      t.amount,
      `"${t.date}"`,
      `"${t.paymentMethod}"`,
    ].join(",");
  });
  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `church_financial_report_${new Date().toISOString().slice(0, 10)}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function ChurchMemberStatementModal({
  member,
  transactions,
  onClose,
}: {
  member: NgoMember;
  transactions: ChurchPaymentRecord[];
  onClose: () => void;
}) {
  const memberTxns = transactions.filter(
    (t) =>
      t.memberId === member.memberId ||
      t.memberName.toLowerCase().trim() === member.name.toLowerCase().trim(),
  );

  const totalPaid = memberTxns.reduce((a, t) => a + t.amount, 0) || member.totalPaid;
  const tithesPaid =
    memberTxns.filter((t) => t.category === "Tithe").reduce((a, t) => a + t.amount, 0) ||
    member.monthlyTithe ||
    0;
  const projectPaid =
    memberTxns.filter((t) => t.isProject).reduce((a, t) => a + t.amount, 0) ||
    member.projectContributions ||
    0;
  const welfarePaid =
    memberTxns.filter((t) => t.category === "Welfare").reduce((a, t) => a + t.amount, 0) ||
    member.welfarePaid ||
    0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-card shadow-2xl border border-border p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{member.name}</h2>
              <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                {member.memberId}
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 font-mono">
              <Phone className="size-3" /> {member.phone} · {member.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Giving Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
          <div className="rounded-xl border border-border bg-emerald-50/50 dark:bg-emerald-950/20 p-3">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Given</p>
            <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {currency(totalPaid)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-violet-50/50 dark:bg-violet-950/20 p-3">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Tithes</p>
            <p className="text-base font-extrabold text-violet-600 dark:text-violet-400 mt-0.5">
              {currency(tithesPaid)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-amber-50/50 dark:bg-amber-950/20 p-3">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Projects</p>
            <p className="text-base font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
              {currency(projectPaid)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-teal-50/50 dark:bg-teal-950/20 p-3">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Welfare</p>
            <p className="text-base font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">
              {currency(welfarePaid)}
            </p>
          </div>
        </div>

        {/* Transactions list */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Payment History ({memberTxns.length} records)</span>
            <span className="text-[11px] font-normal text-muted-foreground">All time payments</span>
          </h3>

          {memberTxns.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-4 text-center border rounded-xl">
              No individual receipts logged yet for this member.
            </p>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-secondary/40 font-bold text-muted-foreground uppercase border-b border-border text-[10px]">
                  <tr>
                    <th className="px-3 py-2">Receipt #</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Purpose / Category</th>
                    <th className="px-3 py-2">Channel</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {memberTxns.map((tx) => (
                    <tr key={tx.id} className="hover:bg-secondary/20">
                      <td className="px-3 py-2 font-mono font-semibold">{tx.receiptNo}</td>
                      <td className="px-3 py-2 text-muted-foreground">{tx.date}</td>
                      <td className="px-3 py-2">
                        <span className="font-medium text-foreground">{tx.paymentType}</span>
                        {tx.isProject && (
                          <span className="ml-1 text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1 py-0.2 rounded">
                            Project
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{tx.paymentMethod}</td>
                      <td className="px-3 py-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {currency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs gap-1.5"
          >
            <Printer className="size-3.5" />
            <span>Print Member Statement</span>
          </Button>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper: parse "DD MMM YYYY" date strings from records
function parseRecordDate(dateStr: string): Date | null {
  const months: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };
  const parts = dateStr.trim().split(" ");
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0] ?? "", 10);
  const month = months[parts[1] ?? ""];
  const year = parseInt(parts[2] ?? "", 10);
  if (isNaN(day) || month === undefined || isNaN(year)) return null;
  return new Date(year, month, day);
}

function ChurchReports() {
  const [activeTab, setActiveTab] = useState<"transactions" | "projects">(
    "transactions",
  );
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [datePeriod, setDatePeriod] = useState<
    "all" | "today" | "week" | "month" | "year" | "custom"
  >("all");
  const [projectFilter, setProjectFilter] = useState("all");

  const members = NGO_MEMBERS;
  const transactions = CHURCH_PAYMENT_RECORDS;
  const projects = NGO_PROJECTS;

  const totalChurchRevenue = useMemo(() => members.reduce((a, m) => a + m.totalPaid, 0), [members]);
  const totalTithes = useMemo(
    () => members.reduce((a, m) => a + (m.monthlyTithe || 0) * 12, 0),
    [members],
  );
  const totalOfferings = useMemo(
    () => transactions.filter((tx) => tx.category === "Offering").reduce((a, tx) => a + tx.amount, 0),
    [transactions],
  );
  const totalProjects = useMemo(
    () => members.reduce((a, m) => a + (m.projectContributions || 0), 0),
    [members],
  );
  const totalWelfare = useMemo(
    () => members.reduce((a, m) => a + (m.welfarePaid || 0), 0),
    [members],
  );
  const totalArrears = useMemo(() => members.reduce((a, m) => a + m.balanceDue, 0), [members]);

  // ── DATE PERIOD BOUNDS ──
  const { periodStart, periodEnd } = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    if (datePeriod === "today") return { periodStart: todayStart, periodEnd: todayEnd };
    if (datePeriod === "week") {
      const dayOfWeek = now.getDay();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - dayOfWeek);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      return { periodStart: weekStart, periodEnd: weekEnd };
    }
    if (datePeriod === "month") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      return { periodStart: monthStart, periodEnd: monthEnd };
    }
    if (datePeriod === "year") {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      return { periodStart: yearStart, periodEnd: yearEnd };
    }
    if (datePeriod === "custom" && dateRange?.from) {
      const from = new Date(dateRange.from);
      from.setHours(0, 0, 0, 0);
      const to = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
      to.setHours(23, 59, 59, 999);
      return { periodStart: from, periodEnd: to };
    }
    return { periodStart: null, periodEnd: null };
  }, [datePeriod, dateRange]);

  // ── FILTERED TRANSACTIONS (Search + Category + Method + Date Period) ──
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const member = members.find((m) => m.memberId === tx.memberId || m.name === tx.memberName);
      const memberPhone = member ? member.phone.replace(/\s+/g, "").toLowerCase() : "";

      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const cleanQ = q.replace(/\s+/g, "");

        const matchName = tx.memberName.toLowerCase().includes(q);
        const matchReceipt = tx.receiptNo.toLowerCase().includes(q);
        const matchType = tx.paymentType.toLowerCase().includes(q);
        const matchProject = tx.projectName?.toLowerCase().includes(q) || false;
        const matchPhone =
          memberPhone.includes(cleanQ) || (member && member.phone.toLowerCase().includes(q));

        if (!matchName && !matchReceipt && !matchType && !matchProject && !matchPhone) {
          return false;
        }
      }

      if (categoryFilter !== "all") {
        if (categoryFilter === "Project" && !tx.isProject) return false;
        if (categoryFilter !== "Project" && tx.category !== categoryFilter) return false;
      }

      if (methodFilter !== "all" && tx.paymentMethod !== methodFilter) {
        return false;
      }

      // Date period filter
      if (periodStart && periodEnd) {
        const txDate = parseRecordDate(tx.date);
        if (!txDate || txDate < periodStart || txDate > periodEnd) return false;
      }

      return true;
    });
  }, [transactions, members, search, categoryFilter, methodFilter, periodStart, periodEnd]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (projectFilter !== "all" && p.status !== projectFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchCode = p.code.toLowerCase().includes(q);
        const matchCoordinator = p.leadCoordinator.toLowerCase().includes(q);
        const matchLocation = p.location.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchCoordinator && !matchLocation) return false;
      }
      return true;
    });
  }, [projects, projectFilter, search]);

  return (
    <div className="space-y-6">
      {/* ── Top Summary KPIs ── */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Church Revenue
            </p>
            <span className="rounded-full bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Coins className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {currency(totalChurchRevenue)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            From {members.length} registered members
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Tithe
            </p>
            <span className="rounded-full bg-violet-50 p-2 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
              <Banknote className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-violet-600 dark:text-violet-400">
            {currency(totalTithes)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Ministry operations fund</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Offering
            </p>
            <span className="rounded-full bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Receipt className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {currency(totalOfferings)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Sunday & special offerings</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Welfare
            </p>
            <span className="rounded-full bg-teal-50 p-2 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
              <Users className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-teal-600 dark:text-teal-400">
            {currency(totalWelfare)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Member benevolence support</p>
        </div>
      </div>

      {/* ── Tabs Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("transactions")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
              activeTab === "transactions"
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
             Receipts & Payment Ledger ({filteredTransactions.length})
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
              activeTab === "projects"
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            Projects Directory ({filteredProjects.length})
          </button>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => exportChurchCsv(transactions, members)}
          className="h-8 text-xs gap-1.5"
        >
          <Download className="size-3.5" />
          <span>Export Church Audit CSV</span>
        </Button>
      </div>

      {/* ── Search Bar & Filter Options ── */}
      <div className="space-y-3">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by member name, telephone number (+233...), receipt number, or payment purpose..."
            className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-xs sm:text-sm outline-none placeholder:text-muted-foreground focus:border-ring shadow-2xs font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Row 1: Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Category:</span>
          {[
            {
              val: "all",
              label: "All",
              activeClass: "bg-foreground text-background border-transparent",
            },
            {
              val: "Tithe",
              label: "Tithes",
              activeClass: "bg-violet-600 text-white border-violet-600",
            },
            {
              val: "Offering",
              label: "Offerings",
              activeClass: "bg-emerald-600 text-white border-emerald-600",
            },
            {
              val: "Welfare",
              label: "Welfare",
              activeClass: "bg-teal-600 text-white border-teal-600",
            },
            {
              val: "Project",
              label: "🏗️ Projects",
              activeClass: "bg-amber-600 text-white border-amber-600",
            },
          ].map(({ val, label, activeClass }) => (
            <button
              key={val}
              onClick={() => setCategoryFilter(val)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-all border",
                categoryFilter === val
                  ? activeClass
                  : "bg-card text-muted-foreground border-border hover:bg-secondary",
              )}
            >
              {label}
            </button>
          ))}

          <div className="ml-auto">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none"
            >
              <option value="all">All Payment Channels</option>
              <option value="Mobile Money">Mobile Money (MoMo)</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash Deposit">Cash Deposit</option>
            </select>
          </div>
        </div>

        {/* Row 2: Date Period & Date Preset Picker */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Period:</span>
          {[
            { val: "all", label: "All Time" },
            { val: "today", label: "Today" },
            { val: "week", label: "This Week" },
            { val: "month", label: "This Month" },
            { val: "year", label: "This Year" },
          ].map(({ val, label }) => (
            <button
              key={val}
              onClick={() => {
                setDatePeriod(val as typeof datePeriod);
                if (val !== "custom") setDateRange(undefined);
              }}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-all border",
                datePeriod === val && !dateRange?.from
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-card text-muted-foreground border-border hover:bg-secondary",
              )}
            >
              {label}
            </button>
          ))}

          {/* Preset & Custom Range Dropdown (Same as all other pages) */}
          <DateRangePicker
            value={dateRange}
            onChange={(range) => {
              setDateRange(range);
              if (range?.from) {
                setDatePeriod("custom");
              } else {
                setDatePeriod("all");
              }
            }}
          />

          {/* Active record count indicator */}
          {(datePeriod !== "all" || dateRange?.from) && (
            <span className="ml-1 text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
              · {filteredTransactions.length} record{filteredTransactions.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TAB 1: RECEIPTS & PAYMENT LEDGER
      ══════════════════════════════════════════════ */}
      {activeTab === "transactions" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="border-b border-border px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Church Receipts & Payment Ledger</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Showing {filteredTransactions.length} receipts · Total:{" "}
                {currency(filteredTransactions.reduce((s, t) => s + t.amount, 0))}
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {filteredTransactions.length} received
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/40 text-xs font-bold text-muted-foreground uppercase border-b border-border">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-5 py-3">Receipt No</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Member Name</th>
                  <th className="px-5 py-3">Telephone</th>
                  <th className="px-5 py-3">Payment Purpose</th>
                  <th className="px-5 py-3">Channel</th>
                  <th className="px-5 py-3 text-right font-bold">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-xs text-muted-foreground">
                      No payment records found matching "{search}".
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx, idx) => {
                    const member = members.find(
                      (m) => m.memberId === tx.memberId || m.name === tx.memberName,
                    );

                    return (
                      <tr key={tx.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-xs font-bold text-muted-foreground">
                          {idx + 1}
                        </td>
                        <td className="px-5 py-3 font-mono text-xs font-bold text-foreground">
                          {tx.receiptNo}
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {tx.date}
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-semibold text-foreground text-sm">{tx.memberName}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {tx.memberId}
                          </p>
                        </td>
                        <td className="px-5 py-3 text-xs font-mono text-foreground">
                          {member?.phone || "+233 20 000 0000"}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-medium text-foreground text-xs">
                              {tx.paymentType}
                            </span>
                            {tx.isProject && (
                              <span className="text-[9px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300">
                                🏗️ Project
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">
                          {tx.paymentMethod}
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {currency(tx.amount)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 2: PROJECTS DIRECTORY
      ══════════════════════════════════════════════ */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-foreground">Projects Directory</h2>
                <p className="text-xs text-muted-foreground">
                  Showing {filteredProjects.length} of {projects.length} church projects
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Filter:</span>
                {[
                  { val: "all", label: "All" },
                  { val: "Active Implementation", label: "Active" },
                  { val: "Planning Phase", label: "Planning" },
                  { val: "Completed", label: "Completed" },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    onClick={() => setProjectFilter(val)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold transition-all border",
                      projectFilter === val
                        ? "bg-amber-600 text-white border-amber-600"
                        : "bg-card text-muted-foreground border-border hover:bg-secondary",
                    )}
                  >
                    {label}
                  </button>
                ))}
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none"
                >
                  <option value="all">All Projects</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.status}>
                      {p.code} — {p.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/40 text-xs font-bold text-muted-foreground uppercase border-b border-border">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-5 py-3">Project</th>
                    <th className="px-5 py-3">Code</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Budget</th>
                    <th className="px-5 py-3 text-right">Spent</th>
                    <th className="px-5 py-3 text-right">Balance</th>
                    <th className="px-5 py-3">Coordinator</th>
                    <th className="px-5 py-3">Beneficiaries</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-xs text-muted-foreground">
                        No projects match your current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((p, idx) => {
                      const budgetBalance = p.budgetAllocated - p.fundsSpent;
                      const statusColor =
                        p.status === "Active Implementation"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : p.status === "Planning Phase"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                            : "bg-slate-50 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300";
                      return (
                        <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                          <td className="px-4 py-3 text-xs font-bold text-muted-foreground">
                            {idx + 1}
                          </td>
                          <td className="px-5 py-3">
                            <p className="font-semibold text-foreground text-sm">{p.title}</p>
                            <p className="text-[11px] text-muted-foreground">{p.location}</p>
                          </td>
                          <td className="px-5 py-3 text-xs font-mono text-muted-foreground">
                            {p.code}
                          </td>
                          <td className="px-5 py-3">
                            <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border", statusColor)}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right font-medium">
                            {currency(p.budgetAllocated)}
                          </td>
                          <td className="px-5 py-3 text-right font-medium text-rose-600 dark:text-rose-400">
                            {currency(p.fundsSpent)}
                          </td>
                          <td className="px-5 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                            {currency(budgetBalance)}
                          </td>
                          <td className="px-5 py-3 text-xs text-foreground">
                            {p.leadCoordinator}
                          </td>
                          <td className="px-5 py-3 text-xs text-muted-foreground">
                            {p.beneficiariesCount.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function Reports() {
  const { institutionType } = useInstitution();
  const isSchool = institutionType === "school";
  const isChurch = institutionType === "ngo";
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"today" | "products" | "range" | "interbranch">(
    "today",
  );
  const [productStockFilter, setProductStockFilter] = useState<"all" | "healthy" | "low" | "out">(
    "all",
  );
  const { branches } = useBranches();
  const branchOptions = branches.filter((b) => b.id !== "all");
  const branchChartData = branchOptions.map((b) => ({
    name: b.name.split(" ")[0],
    revenue: b.revenue,
    stockValue: b.stockValue,
  }));

  const rangeLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, "dd MMM")} – ${format(dateRange.to, "dd MMM yyyy")}`
      : format(dateRange.from, "dd MMM yyyy")
    : "Last 30 days";

  // 30-day trend for the trend chart
  const trendSeries = useMemo(() => seriesFor("all", "30d"), []);
  const totalGross = useMemo(() => trendSeries.reduce((s, r) => s + r.sales, 0), [trendSeries]);
  const totalSettled = useMemo(() => trendSeries.reduce((s, r) => s + r.settled, 0), [trendSeries]);

  const tabs = [
    { key: "today" as const, label: "Today's Report", icon: CalendarDays },
    { key: "products" as const, label: "Product Report", icon: Boxes },
    { key: "range" as const, label: "Date Range Report", icon: BarChart2 },
    { key: "interbranch" as const, label: "Inter-Branch Report", icon: GitCompare },
  ];

  return (
    <AppShell
      title={isSchool ? "Academic Reports" : isChurch ? "Church Financial Reports" : "Reports"}
      subtitle={
        isSchool
          ? "School analytics · fee collection & balances"
          : isChurch
            ? "Church giving analytics · tithes, offerings, welfare & project statements"
            : "Retail analytics · sales, products, branch performance"
      }
      actions={
        <Button
          size="sm"
          className="h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm bg-accent text-accent-foreground hover:bg-accent/85"
        >
          <Download className="size-3.5 sm:size-4" />
          <span className="hidden sm:inline">Export CSV</span>
          <span className="sm:hidden">Export</span>
        </Button>
      }
    >
      {isSchool ? (
        <SchoolReports />
      ) : isChurch ? (
        <ChurchReports />
      ) : (
        <div className="space-y-6">
          {/* ── Tab bar ── */}
          <div className="flex items-center gap-1.5 border-b border-border">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                  activeTab === t.key
                    ? "border-accent text-accent"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <t.icon className="size-4 shrink-0" />
                {t.label}
              </button>
            ))}
          </div>

          {/* ══════════════════════════════════════════════
            TAB 1 — TODAY'S REPORT
        ══════════════════════════════════════════════ */}
          {activeTab === "today" && (
            <div className="space-y-6">
              {/* KPI cards */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  {
                    label: "Gross Sales Today",
                    value: currency(todayGross),
                    sub: `${todayTxns} transactions`,
                    icon: Banknote,
                    color: "text-emerald-600 dark:text-emerald-400",
                    bg: "bg-emerald-50 dark:bg-emerald-950/60",
                  },
                  {
                    label: "Settled Today",
                    value: currency(todaySettled),
                    sub: `${settlementRate}% of gross`,
                    icon: PackageCheck,
                    color: "text-blue-600 dark:text-blue-400",
                    bg: "bg-blue-50 dark:bg-blue-950/60",
                  },
                  {
                    label: "Avg Transaction",
                    value: currency(todayAvg),
                    sub: "per sale",
                    icon: ShoppingCart,
                    color: "text-violet-600 dark:text-violet-400",
                    bg: "bg-violet-50 dark:bg-violet-950/60",
                  },
                  {
                    label: "Unsettled Float",
                    value: currency(todayGross - todaySettled),
                    sub: `${100 - settlementRate}% pending`,
                    icon: TrendingUp,
                    color: "text-amber-600 dark:text-amber-400",
                    bg: "bg-amber-50 dark:bg-amber-950/60",
                  },
                ].map((c) => (
                  <div
                    key={c.label}
                    className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {c.label}
                      </p>
                      <span className={cn("rounded-full p-1.5 sm:p-2", c.bg, c.color)}>
                        <c.icon className="size-3.5 sm:size-4" />
                      </span>
                    </div>
                    <p className={cn("mt-2 text-xl sm:text-2xl font-bold", c.color)}>{c.value}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{c.sub}</p>
                  </div>
                ))}
              </div>

              {/* Daily sales trend (7-day) */}
              <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs">
                <div className="mb-4">
                  <h2 className="text-lg font-bold">Daily Sales Trend</h2>
                  <p className="text-xs text-muted-foreground">
                    Gross sales vs settled amount — last 7 days
                  </p>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueSeries} margin={{ left: -18, right: 4, top: 4 }}>
                      <defs>
                        <linearGradient id="g-gross" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.45} />
                          <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="g-settled" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
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
                      <Area
                        name="Gross Sales"
                        type="monotone"
                        dataKey="sales"
                        stroke="#22c55e"
                        strokeWidth={2}
                        fill="url(#g-gross)"
                        activeDot={{ r: 5 }}
                      />
                      <Area
                        name="Settled"
                        type="monotone"
                        dataKey="settled"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#g-settled)"
                        activeDot={{ r: 4 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Payment method breakdown */}
              <div className="rounded-xl border border-border bg-card shadow-2xs">
                <div className="border-b border-border px-5 py-4">
                  <h2 className="text-lg font-bold">Payment Method Breakdown</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Today's revenue split by payment method
                  </p>
                </div>
                <ul className="divide-y divide-border">
                  {paymentMix.map((m) => (
                    <li key={m.method} className="flex items-center gap-4 px-5 py-3.5">
                      <span className="w-32 truncate text-sm font-medium">{m.method}</span>
                      <div className="flex-1">
                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${m.value}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-10 text-right text-xs font-semibold text-muted-foreground">
                        {m.value}%
                      </span>
                      <span className="w-28 text-right text-sm font-bold">
                        {currency(m.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
            TAB 2 — PRODUCT REPORT
        ══════════════════════════════════════════════ */}
          {activeTab === "products" && (
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  {
                    label: "Total SKUs",
                    value: products.length.toString(),
                    sub: "across all branches",
                    icon: Boxes,
                    color: "text-emerald-600 dark:text-emerald-400",
                    bg: "bg-emerald-50 dark:bg-emerald-950/60",
                  },
                  {
                    label: "Stock Value",
                    value: currency(products.reduce((s, p) => s + p.price * p.stock, 0)),
                    sub: "on hand",
                    icon: Banknote,
                    color: "text-blue-600 dark:text-blue-400",
                    bg: "bg-blue-50 dark:bg-blue-950/60",
                  },
                  {
                    label: "Low Stock SKUs",
                    value: products
                      .filter((p) => p.stock > 0 && p.stock <= p.threshold)
                      .length.toString(),
                    sub: "need restocking",
                    icon: TrendingDown,
                    color: "text-amber-600 dark:text-amber-400",
                    bg: "bg-amber-50 dark:bg-amber-950/60",
                  },
                  {
                    label: "Out of Stock",
                    value: products.filter((p) => p.stock === 0).length.toString(),
                    sub: "zero units",
                    icon: PackageCheck,
                    color: "text-rose-600 dark:text-rose-400",
                    bg: "bg-rose-50 dark:bg-rose-950/60",
                  },
                ].map((c) => (
                  <div
                    key={c.label}
                    className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {c.label}
                      </p>
                      <span className={cn("rounded-full p-1.5 sm:p-2", c.bg, c.color)}>
                        <c.icon className="size-3.5 sm:size-4" />
                      </span>
                    </div>
                    <p className={cn("mt-2 text-xl sm:text-2xl font-bold", c.color)}>{c.value}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{c.sub}</p>
                  </div>
                ))}
              </div>

              {/* Product table */}
              <div className="rounded-xl border border-border bg-card shadow-2xs">
                <div className="border-b border-border px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold">Product Performance</h2>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Ranked by stock value ·{" "}
                        {
                          productReport.filter(
                            (p) =>
                              productStockFilter === "all" || p.stockHealth === productStockFilter,
                          ).length
                        }{" "}
                        SKUs
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(
                        [
                          {
                            key: "all",
                            label: "All",
                            activeClass: "bg-foreground text-background border-transparent",
                          },
                          {
                            key: "healthy",
                            label: "Healthy",
                            activeClass: "bg-emerald-600 text-white border-transparent",
                          },
                          {
                            key: "low",
                            label: "Low",
                            activeClass: "bg-amber-500 text-white border-transparent",
                          },
                          {
                            key: "out",
                            label: "Out",
                            activeClass: "bg-red-600 text-white border-transparent",
                          },
                        ] as const
                      ).map(({ key, label, activeClass }) => (
                        <button
                          key={key}
                          onClick={() => setProductStockFilter(key)}
                          aria-pressed={productStockFilter === key}
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold transition-all shadow-xs border",
                            productStockFilter === key
                              ? activeClass
                              : "bg-card text-foreground border-border hover:bg-secondary",
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/40 text-left text-xs tracking-wide text-muted-foreground uppercase">
                        <th className="px-5 py-3 font-bold">#</th>
                        <th className="px-5 py-3 font-bold">Product</th>
                        <th className="px-5 py-3 font-bold">Branch</th>
                        <th className="px-5 py-3 text-right font-bold">Unit Price</th>
                        <th className="px-5 py-3 text-right font-bold">On Hand</th>
                        <th className="px-5 py-3 text-right font-bold">Stock Value</th>
                        <th className="px-5 py-3 font-bold">Share</th>
                        <th className="px-5 py-3 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {productReport
                        .filter(
                          (p) =>
                            productStockFilter === "all" || p.stockHealth === productStockFilter,
                        )
                        .map((p, i) => (
                          <tr key={p.sku} className="transition-colors hover:bg-secondary/60">
                            <td className="px-5 py-3 text-xs font-bold text-muted-foreground">
                              {i + 1}
                            </td>
                            <td className="px-5 py-3">
                              <p className="font-semibold">{p.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {p.sku} · {p.variant}
                              </p>
                            </td>
                            <td className="px-5 py-3 text-muted-foreground">{p.branch}</td>
                            <td className="px-5 py-3 text-right font-medium">
                              {currency(p.price)}
                            </td>
                            <td className="px-5 py-3 text-right font-bold">{p.stock}</td>
                            <td className="px-5 py-3 text-right font-bold text-accent">
                              {currency(p.revenue)}
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                                  <div
                                    className="h-full rounded-full bg-accent"
                                    style={{
                                      width: `${Math.round((p.revenue / totalProductRevenue) * 100)}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {Math.round((p.revenue / totalProductRevenue) * 100)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <StatusBadge
                                tone={
                                  p.stockHealth === "out"
                                    ? "bad"
                                    : p.stockHealth === "low"
                                      ? "warn"
                                      : "good"
                                }
                              >
                                {p.stockHealth === "out"
                                  ? "Out"
                                  : p.stockHealth === "low"
                                    ? "Low"
                                    : "Healthy"}
                              </StatusBadge>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Category breakdown */}
              <div className="rounded-xl border border-border bg-card shadow-2xs">
                <div className="border-b border-border px-5 py-4">
                  <h2 className="text-lg font-bold">Stock Value by Category</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Distribution of inventory value across product categories
                  </p>
                </div>
                <ul className="divide-y divide-border">
                  {(() => {
                    const byCategory = Object.entries(
                      productReport.reduce<Record<string, number>>((acc, p) => {
                        acc[p.category] = (acc[p.category] ?? 0) + p.revenue;
                        return acc;
                      }, {}),
                    ).sort((a, b) => b[1] - a[1]);

                    return byCategory.map(([cat, val]) => (
                      <li key={cat} className="flex items-center gap-4 px-5 py-3.5">
                        <span className="w-32 truncate text-sm font-medium">{cat}</span>
                        <div className="flex-1">
                          <div className="h-2 overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full bg-accent"
                              style={{ width: `${Math.round((val / totalProductRevenue) * 100)}%` }}
                            />
                          </div>
                        </div>
                        <span className="w-10 text-right text-xs font-semibold text-muted-foreground">
                          {Math.round((val / totalProductRevenue) * 100)}%
                        </span>
                        <span className="w-28 text-right text-sm font-bold">{currency(val)}</span>
                      </li>
                    ));
                  })()}
                </ul>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
            TAB 3 — DATE RANGE REPORT
        ══════════════════════════════════════════════ */}
          {activeTab === "range" && (
            <div className="space-y-6">
              {/* Date picker */}
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-medium">Reporting period:</p>
                <DateRangePicker value={dateRange} onChange={setDateRange} />
                <span className="text-sm text-muted-foreground">{rangeLabel}</span>
              </div>

              {/* Period KPIs */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  {
                    label: "Total Gross Sales",
                    value: currency(totalGross),
                    sub: "30-day period",
                    icon: Banknote,
                    color: "text-emerald-600 dark:text-emerald-400",
                    bg: "bg-emerald-50 dark:bg-emerald-950/60",
                  },
                  {
                    label: "Total Settled",
                    value: currency(totalSettled),
                    sub: `${Math.round((totalSettled / totalGross) * 100)}% of gross`,
                    icon: PackageCheck,
                    color: "text-blue-600 dark:text-blue-400",
                    bg: "bg-blue-50 dark:bg-blue-950/60",
                  },
                  {
                    label: "Unsettled Gap",
                    value: currency(totalGross - totalSettled),
                    sub: "in transit / pending",
                    icon: TrendingUp,
                    color: "text-amber-600 dark:text-amber-400",
                    bg: "bg-amber-50 dark:bg-amber-950/60",
                  },
                  {
                    label: "Active Branches",
                    value: branchOptions.length.toString(),
                    sub: `${branches[0]!.staff} total staff`,
                    icon: ShoppingCart,
                    color: "text-violet-600 dark:text-violet-400",
                    bg: "bg-violet-50 dark:bg-violet-950/60",
                  },
                ].map((c) => (
                  <div
                    key={c.label}
                    className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {c.label}
                      </p>
                      <span className={cn("rounded-full p-1.5 sm:p-2", c.bg, c.color)}>
                        <c.icon className="size-3.5 sm:size-4" />
                      </span>
                    </div>
                    <p className={cn("mt-2 text-xl sm:text-2xl font-bold", c.color)}>{c.value}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{c.sub}</p>
                  </div>
                ))}
              </div>

              {/* 30-day trend */}
              <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs">
                <div className="mb-4">
                  <h2 className="text-lg font-bold">30-Day Sales Trend</h2>
                  <p className="text-xs text-muted-foreground">
                    Daily gross sales vs settled — all branches
                  </p>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendSeries} margin={{ left: -18, right: 4, top: 4 }}>
                      <defs>
                        <linearGradient id="g-trend-gross" x1="0" y1="0" x2="0" y2="1">
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
                        tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                        tickLine={false}
                        axisLine={false}
                        fontSize={11}
                        stroke="var(--color-muted-foreground)"
                      />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v)} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Area
                        name="Gross Sales"
                        type="monotone"
                        dataKey="sales"
                        stroke="#22c55e"
                        strokeWidth={2}
                        fill="url(#g-trend-gross)"
                        activeDot={{ r: 5 }}
                      />
                      <Area
                        name="Settled"
                        type="monotone"
                        dataKey="settled"
                        stroke="#3b82f6"
                        strokeWidth={1.5}
                        fill="none"
                        strokeDasharray="4 3"
                        activeDot={{ r: 4 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Branch revenue bar chart */}
              <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs">
                <div className="mb-4">
                  <h2 className="text-lg font-bold">Revenue by Branch</h2>
                  <p className="text-xs text-muted-foreground">
                    Period revenue vs stock value per branch
                  </p>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={branchChartData} margin={{ left: -18, right: 4 }}>
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
                        tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                        tickLine={false}
                        axisLine={false}
                        fontSize={11}
                        stroke="var(--color-muted-foreground)"
                      />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v)} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar name="Revenue" dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar
                        name="Stock Value"
                        dataKey="stockValue"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                        opacity={0.7}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Branch performance table */}
              <div className="rounded-xl border border-border bg-card shadow-2xs">
                <div className="border-b border-border px-5 py-4">
                  <h2 className="text-lg font-bold">Branch Performance Summary</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Revenue, growth, stock value and settlement method per branch
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/40 text-left text-xs tracking-wide text-muted-foreground uppercase">
                        <th className="px-5 py-3 font-bold">Branch</th>
                        <th className="px-5 py-3 font-bold">City</th>
                        <th className="px-5 py-3 text-right font-bold">Revenue</th>
                        <th className="px-5 py-3 text-right font-bold">Growth</th>
                        <th className="px-5 py-3 text-right font-bold">Stock Value</th>
                        <th className="px-5 py-3 font-bold">Staff</th>
                        <th className="px-5 py-3 font-bold">Settlement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {branchOptions.map((b) => (
                        <tr key={b.id} className="transition-colors hover:bg-secondary/60">
                          <td className="px-5 py-3 font-semibold">{b.name}</td>
                          <td className="px-5 py-3 text-muted-foreground">{b.city}</td>
                          <td className="px-5 py-3 text-right font-bold text-accent">
                            {currency(b.revenue)}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span
                              className={cn(
                                "inline-flex items-center gap-0.5 font-semibold text-xs",
                                b.growth >= 0
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-rose-600 dark:text-rose-400",
                              )}
                            >
                              {b.growth >= 0 ? (
                                <ArrowUpRight className="size-3.5" />
                              ) : (
                                <ArrowDownRight className="size-3.5" />
                              )}
                              {Math.abs(b.growth)}%
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right font-medium">
                            {currency(b.stockValue)}
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">{b.staff}</td>
                          <td className="px-5 py-3 text-xs text-muted-foreground">
                            {b.settlement}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-secondary/30 font-bold border-t-2 border-border">
                        <td className="px-5 py-3 font-bold" colSpan={2}>
                          Total
                        </td>
                        <td className="px-5 py-3 text-right text-emerald-600 dark:text-emerald-400">
                          {currency(branchOptions.reduce((s, b) => s + b.revenue, 0))}
                        </td>
                        <td className="px-5 py-3" />
                        <td className="px-5 py-3 text-right">
                          {currency(branchOptions.reduce((s, b) => s + b.stockValue, 0))}
                        </td>
                        <td className="px-5 py-3">
                          {branchOptions.reduce((s, b) => s + b.staff, 0)}
                        </td>
                        <td className="px-5 py-3" />
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
            TAB 5 — INTER-BRANCH REPORT
        ══════════════════════════════════════════════ */}
          {activeTab === "interbranch" && (
            <div className="space-y-6">
              {/* KPI cards */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  {
                    label: "Total Branches",
                    value: branchOptions.length.toString(),
                    sub: "active locations",
                    icon: GitCompare,
                    color: "text-emerald-600 dark:text-emerald-400",
                    bg: "bg-emerald-50 dark:bg-emerald-950/60",
                  },
                  {
                    label: "Combined Revenue",
                    value: currency(branchOptions.reduce((s, b) => s + b.revenue, 0)),
                    sub: "all branches",
                    icon: Banknote,
                    color: "text-blue-600 dark:text-blue-400",
                    bg: "bg-blue-50 dark:bg-blue-950/60",
                  },
                  {
                    label: "Combined Stock",
                    value: currency(branchOptions.reduce((s, b) => s + b.stockValue, 0)),
                    sub: "total inventory value",
                    icon: Boxes,
                    color: "text-violet-600 dark:text-violet-400",
                    bg: "bg-violet-50 dark:bg-violet-950/60",
                  },
                  {
                    label: "Total Staff",
                    value: branchOptions.reduce((s, b) => s + b.staff, 0).toString(),
                    sub: "across all locations",
                    icon: ShoppingCart,
                    color: "text-amber-600 dark:text-amber-400",
                    bg: "bg-amber-50 dark:bg-amber-950/60",
                  },
                ].map((c) => (
                  <div
                    key={c.label}
                    className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {c.label}
                      </p>
                      <span className={cn("rounded-full p-1.5 sm:p-2", c.bg, c.color)}>
                        <c.icon className="size-3.5 sm:size-4" />
                      </span>
                    </div>
                    <p className={cn("mt-2 text-xl sm:text-2xl font-bold", c.color)}>{c.value}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{c.sub}</p>
                  </div>
                ))}
              </div>

              {/* Side-by-side branch comparison chart */}
              <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-2xs">
                <div className="mb-4">
                  <h2 className="text-lg font-bold">Branch Comparison</h2>
                  <p className="text-xs text-muted-foreground">
                    Revenue vs stock value across all branches
                  </p>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={branchChartData}
                      margin={{ left: -18, right: 4 }}
                      barCategoryGap="30%"
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
                        tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                        tickLine={false}
                        axisLine={false}
                        fontSize={11}
                        stroke="var(--color-muted-foreground)"
                      />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v)} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar name="Revenue" dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar
                        name="Stock Value"
                        dataKey="stockValue"
                        fill="#8b5cf6"
                        radius={[4, 4, 0, 0]}
                        opacity={0.8}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Detailed inter-branch comparison table */}
              <div className="rounded-xl border border-border bg-card shadow-2xs">
                <div className="border-b border-border px-5 py-4">
                  <h2 className="text-lg font-bold">Branch-by-Branch Breakdown</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Full comparative view — revenue share, stock efficiency, and growth per branch
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/40 text-left text-xs tracking-wide text-muted-foreground uppercase">
                        <th className="px-5 py-3 font-bold">Branch</th>
                        <th className="px-5 py-3 text-right font-bold">Revenue</th>
                        <th className="px-5 py-3 font-bold">Rev. Share</th>
                        <th className="px-5 py-3 text-right font-bold">Growth</th>
                        <th className="px-5 py-3 text-right font-bold">Stock Value</th>
                        <th className="px-5 py-3 font-bold">Stock Share</th>
                        <th className="px-5 py-3 text-right font-bold">Staff</th>
                        <th className="px-5 py-3 text-right font-bold">Rev/Staff</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {(() => {
                        const totalRev = branchOptions.reduce((s, b) => s + b.revenue, 0);
                        const totalStock = branchOptions.reduce((s, b) => s + b.stockValue, 0);
                        return [...branchOptions]
                          .sort((a, b) => b.revenue - a.revenue)
                          .map((b) => {
                            const revShare = Math.round((b.revenue / totalRev) * 100);
                            const stockShare = Math.round((b.stockValue / totalStock) * 100);
                            const revPerStaff = Math.round(b.revenue / b.staff);
                            return (
                              <tr key={b.id} className="transition-colors hover:bg-secondary/60">
                                <td className="px-5 py-3">
                                  <p className="font-semibold">{b.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {b.city} · {b.settlement}
                                  </p>
                                </td>
                                <td className="px-5 py-3 text-right font-bold text-accent">
                                  {currency(b.revenue)}
                                </td>
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                                      <div
                                        className="h-full rounded-full bg-accent"
                                        style={{ width: `${revShare}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {revShare}%
                                    </span>
                                  </div>
                                </td>
                                <td className="px-5 py-3 text-right">
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-0.5 font-semibold text-xs",
                                      b.growth >= 0
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : "text-rose-600 dark:text-rose-400",
                                    )}
                                  >
                                    {b.growth >= 0 ? (
                                      <ArrowUpRight className="size-3.5" />
                                    ) : (
                                      <ArrowDownRight className="size-3.5" />
                                    )}
                                    {Math.abs(b.growth)}%
                                  </span>
                                </td>
                                <td className="px-5 py-3 text-right font-medium">
                                  {currency(b.stockValue)}
                                </td>
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                                      <div
                                        className="h-full rounded-full bg-violet-500"
                                        style={{ width: `${stockShare}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {stockShare}%
                                    </span>
                                  </div>
                                </td>
                                <td className="px-5 py-3 text-right text-muted-foreground">
                                  {b.staff}
                                </td>
                                <td className="px-5 py-3 text-right font-semibold">
                                  {currency(revPerStaff)}
                                </td>
                              </tr>
                            );
                          });
                      })()}
                      <tr className="bg-secondary/30 border-t-2 border-border font-bold">
                        <td className="px-5 py-3">All Branches</td>
                        <td className="px-5 py-3 text-right text-emerald-600 dark:text-emerald-400">
                          {currency(branchOptions.reduce((s, b) => s + b.revenue, 0))}
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">100%</td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-xs text-emerald-600 dark:text-emerald-400">
                            +
                            {(
                              branchOptions.reduce((s, b) => s + b.growth, 0) / branchOptions.length
                            ).toFixed(1)}
                            % avg
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {currency(branchOptions.reduce((s, b) => s + b.stockValue, 0))}
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">100%</td>
                        <td className="px-5 py-3 text-right">
                          {branchOptions.reduce((s, b) => s + b.staff, 0)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {currency(
                            Math.round(
                              branchOptions.reduce((s, b) => s + b.revenue, 0) /
                                branchOptions.reduce((s, b) => s + b.staff, 0),
                            ),
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Stock distribution per branch */}
              <div className="rounded-xl border border-border bg-card shadow-2xs">
                <div className="border-b border-border px-5 py-4">
                  <h2 className="text-lg font-bold">Inventory Distribution per Branch</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    SKU count and stock levels held at each location
                  </p>
                </div>
                <ul className="divide-y divide-border">
                  {branchOptions.map((b) => {
                    const branchProducts = products.filter((p) => p.branch === b.name);
                    const lowCount = branchProducts.filter(
                      (p) => p.stock > 0 && p.stock <= p.threshold,
                    ).length;
                    const outCount = branchProducts.filter((p) => p.stock === 0).length;
                    return (
                      <li key={b.id} className="px-5 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold">{b.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {b.city} · {branchProducts.length} SKUs
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              {branchProducts.length - lowCount - outCount} healthy
                            </span>
                            {lowCount > 0 && (
                              <span className="rounded-full bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                {lowCount} low
                              </span>
                            )}
                            {outCount > 0 && (
                              <span className="rounded-full bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                                {outCount} out
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{
                              width: `${Math.round((b.stockValue / branchOptions.reduce((s, x) => s + x.stockValue, 0)) * 100)}%`,
                            }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Stock value: {currency(b.stockValue)} ·{" "}
                          {Math.round(
                            (b.stockValue / branchOptions.reduce((s, x) => s + x.stockValue, 0)) *
                              100,
                          )}
                          % of total
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
