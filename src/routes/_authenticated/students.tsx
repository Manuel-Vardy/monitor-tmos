import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  GraduationCap,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  Users,
  ArrowUpDown,
  X,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { currency } from "@/lib/mos-data";
import {
  SCHOOL_STUDENTS,
  SCHOOL_SUMMARY,
  FEE_TRANSACTIONS,
  type Student,
  type FeeTransaction,
} from "@/lib/school-data";

export const Route = createFileRoute("/_authenticated/students")({
  head: () => ({
    meta: [
      { title: "Students — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Student fee accounts directory, guardian contacts, tuition balances, and payment standing for the Trite Merchant OS payment platform.",
      },
      { property: "og:title", content: "Students — Trite Merchant OS" },
    ],
  }),
  component: StudentsPage,
});

type Standing = Student["status"];
type SortKey = "name" | "balanceDue" | "paidAmount" | "tuitionFee";

const STATUS_CONFIG: Record<
  Standing,
  { label: string; icon: React.ElementType; color: string; bg: string; activePill: string }
> = {
  "Paid Full": {
    label: "Paid Full",
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400 font-semibold",
    bg: "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800",
    activePill: "bg-emerald-600 text-white",
  },
  "Partial Payment": {
    label: "Partial Payment",
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400 font-semibold",
    bg: "bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800",
    activePill: "bg-amber-600 text-white",
  },
  Overdue: {
    label: "Overdue",
    icon: AlertCircle,
    color: "text-rose-600 dark:text-rose-400 font-semibold",
    bg: "bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800",
    activePill: "bg-rose-600 text-white",
  },
};

function StudentStatementModal({
  student,
  transactions,
  onClose,
}: {
  student: Student;
  transactions: FeeTransaction[];
  onClose: () => void;
}) {
  const pctPaid =
    student.tuitionFee > 0 ? Math.round((student.paidAmount / student.tuitionFee) * 100) : 100;
  const history = transactions.filter((t) => t.studentId === student.studentId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Statement for ${student.name}`}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-card shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-bold">Fee Statement</h2>
            <p className="text-xs text-muted-foreground">{student.studentId}</p>
          </div>
          <button
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary hover:bg-border transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="rounded-lg bg-secondary/40 p-3 text-sm space-y-1">
            <p className="font-bold text-base">{student.name}</p>
            {student.schoolId && (
              <p className="text-xs text-muted-foreground">School ID: {student.schoolId}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {student.guardianName} · {student.guardianPhone}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border border-border p-2">
              <p className="text-[10px] uppercase text-muted-foreground">Fee</p>
              <p className="font-bold text-sm">{currency(student.tuitionFee)}</p>
            </div>
            <div className="rounded-lg border border-border p-2">
              <p className="text-[10px] uppercase text-muted-foreground">Paid</p>
              <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                {currency(student.paidAmount)}
              </p>
            </div>
            <div className="rounded-lg border border-border p-2">
              <p className="text-[10px] uppercase text-muted-foreground">Balance</p>
              <p
                className={`font-bold text-sm ${student.balanceDue > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}
              >
                {currency(student.balanceDue)}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-[10px] uppercase tracking-wide mb-1">
              <span className="text-muted-foreground">Payment Progress</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{pctPaid}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                style={{ width: `${Math.min(100, pctPaid)}%` }}
              />
            </div>
          </div>

          <h3 className="mt-4 mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Payment History ({history.length})
          </h3>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {history.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{currency(t.amountPaid)}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {t.date} · {t.paymentMethod}
                    </p>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground">{t.receiptNo}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StudentCollectModal({
  student,
  onClose,
  onSubmit,
}: {
  student: Student;
  onClose: () => void;
  onSubmit: (tx: FeeTransaction) => void;
}) {
  const PAYMENT_METHODS = ["Mobile Money (MTN)", "Bank Transfer", "Cash Deposit"] as const;
  const [amount, setAmount] = useState(String(student.balanceDue));
  const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number]>("Mobile Money (MTN)");
  const [receivedBy, setReceivedBy] = useState("Bursar Mr. Mensah");

  const inputClass =
    "h-9 w-full rounded-md border border-border bg-card px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring";

  const handleSubmit = () => {
    const paid = Number(amount) || 0;
    if (paid <= 0) return;
    const today = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    onSubmit({
      id: `REC-${Date.now()}`,
      receiptNo: `RCP-2026-0${Math.floor(Math.random() * 9000) + 1000}`,
      studentId: student.studentId,
      schoolId: student.schoolId,
      studentName: student.name,
      amountPaid: paid,
      paymentMethod: method,
      date: today,
      term: student.term,
      receivedBy,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Collect payment for ${student.name}`}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-bold">Collect Payment</h2>
            <p className="text-xs text-muted-foreground">
              {student.name} · Balance {currency(student.balanceDue)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary hover:bg-border transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3 px-6 py-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Amount Paid
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Payment Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as (typeof PAYMENT_METHODS)[number])}
              className={inputClass}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Received By
            </label>
            <input
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-[#22c55e] text-white hover:bg-[#16a34a]"
            onClick={handleSubmit}
            disabled={(Number(amount) || 0) <= 0}
          >
            <Plus className="size-3.5" /> Record Payment
          </Button>
        </div>
      </div>
    </div>
  );
}

function StudentCard({
  s,
  onStatement,
  onCollect,
}: {
  s: Student;
  onStatement: (s: Student) => void;
  onCollect: (s: Student) => void;
}) {
  const cfg = STATUS_CONFIG[s.status];
  const Icon = cfg.icon;
  const pctPaid = s.tuitionFee > 0 ? Math.round((s.paidAmount / s.tuitionFee) * 100) : 100;
  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-muted-foreground/30">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="font-mono text-[10px] text-muted-foreground font-semibold">
              {s.studentId}
            </span>
            <h3 className="truncate text-sm font-bold">{s.name}</h3>
            {s.schoolId && (
              <p className="font-mono text-[10px] text-muted-foreground">School ID: {s.schoolId}</p>
            )}
          </div>
          <span
            className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] leading-none ${cfg.bg} ${cfg.color}`}
          >
            <Icon className="size-3" />
            {cfg.label}
          </span>
        </div>

        <div className="mt-2.5 space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="size-3 shrink-0" />
            <span className="truncate">{s.guardianName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="size-3 shrink-0" />
            <span>{s.guardianPhone}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] uppercase tracking-wide mb-1">
            <span className="text-muted-foreground">Payment Progress</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{pctPaid}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
              style={{ width: `${Math.min(100, pctPaid)}%` }}
            />
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-secondary/40 p-2.5 space-y-0.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fee:</span>
            <span className="font-medium">{currency(s.tuitionFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paid:</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {currency(s.paidAmount)}
            </span>
          </div>
          <div className="flex justify-between pt-1 border-t border-border/50">
            <span className="font-semibold">Balance:</span>
            <span
              className={`font-bold ${s.balanceDue > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}
            >
              {currency(s.balanceDue)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-1.5">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onStatement(s)}
          className="w-full text-xs h-7"
        >
          Statement
        </Button>
        <Button
          size="sm"
          onClick={() => onCollect(s)}
          className="w-full bg-[#22c55e] text-white hover:bg-[#16a34a] text-xs h-7"
        >
          Collect
        </Button>
      </div>
    </div>
  );
}

function EnrollStudentModal({
  students,
  onClose,
  onSubmit,
}: {
  students: Student[];
  onClose: () => void;
  onSubmit: (student: Student) => void;
}) {
  const [name, setName] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [tuitionFee, setTuitionFee] = useState("");

  const inputClass =
    "h-9 w-full rounded-md border border-border bg-card px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring";

  const handleSubmit = () => {
    if (!name.trim() || !guardianName.trim()) return;
    const fee = Number(tuitionFee) || 0;
    const nextNum = students.length + 1;
    onSubmit({
      id: `STU-${Date.now()}`,
      studentId: `SCH-2026-E${String(nextNum).padStart(3, "0")}`,
      schoolId: schoolId.trim() || undefined,
      name: name.trim(),
      guardianName: guardianName.trim(),
      guardianPhone: guardianPhone.trim() || "—",
      tuitionFee: fee,
      paidAmount: 0,
      balanceDue: fee,
      status: fee === 0 ? "Paid Full" : "Overdue",
      term: "Term 3, 2026",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Enroll New Student"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-bold">Enroll New Student</h2>
            <p className="text-xs text-muted-foreground">Create a Term 3 fee account</p>
          </div>
          <button
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary hover:bg-border transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3 px-6 py-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Student Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kwesi Mensah"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Guardian Name
            </label>
            <input
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
              placeholder="e.g. Mrs. Ama Mensah"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Guardian Phone
            </label>
            <input
              value={guardianPhone}
              onChange={(e) => setGuardianPhone(e.target.value)}
              placeholder="e.g. +233 24 000 0000"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              School ID
            </label>
            <input
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              placeholder="e.g. ADM-2026-014"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Tuition Fee
            </label>
            <input
              type="number"
              value={tuitionFee}
              onChange={(e) => setTuitionFee(e.target.value)}
              placeholder="0"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-[#22c55e] text-white hover:bg-[#16a34a]"
            onClick={handleSubmit}
            disabled={!name.trim() || !guardianName.trim()}
          >
            <Plus className="size-3.5" /> Enroll Student
          </Button>
        </div>
      </div>
    </div>
  );
}

function StudentsPage() {
  const [statusFilter, setStatusFilter] = useState<Standing | "all">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortKey, setSortKey] = useState<SortKey>("balanceDue");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [students, setStudents] = useState<Student[]>(SCHOOL_STUDENTS);
  const [transactions, setTransactions] = useState<FeeTransaction[]>(FEE_TRANSACTIONS);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [statementStudent, setStatementStudent] = useState<Student | null>(null);
  const [collectStudent, setCollectStudent] = useState<Student | null>(null);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  const filtered = students
    .filter((s) => {
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      const matchSearch =
        search === "" ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.studentId.toLowerCase().includes(search.toLowerCase()) ||
        s.guardianName.toLowerCase().includes(search.toLowerCase()) ||
        s.guardianPhone.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    })
    .sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "balanceDue":
          cmp = a.balanceDue - b.balanceDue;
          break;
        case "paidAmount":
          cmp = a.paidAmount - b.paidAmount;
          break;
        case "tuitionFee":
          cmp = a.tuitionFee - b.tuitionFee;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

  const totalExpected = filtered.reduce((s, st) => s + st.tuitionFee, 0);
  const totalCollected = filtered.reduce((s, st) => s + st.paidAmount, 0);
  const totalArrears = filtered.reduce((s, st) => s + st.balanceDue, 0);
  const avgPct = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  return (
    <AppShell
      title="Student Fee Accounts"
      subtitle={`${SCHOOL_SUMMARY.totalStudentsCount} enrolled accounts · ${currency(
        SCHOOL_SUMMARY.totalOutstandingFees,
      )} pending · ${avgPct}% collected — powered by Trite`}
      actions={
        <Button
          size="sm"
          onClick={() => setIsEnrollOpen(true)}
          className="bg-[#22c55e] text-white hover:bg-[#16a34a]"
        >
          <Plus className="size-4" /> Enroll New Student
        </Button>
      }
    >
      {/* Stat Cards */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Accounts
            </p>
            <span className="rounded-full bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <GraduationCap className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold num">{students.length}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Term 3, 2026</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Fees Collected
            </p>
            <span className="rounded-full bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-600 dark:text-emerald-400 num">
            {currency(SCHOOL_SUMMARY.totalFeesCollected)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Settled via Trite PSP</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Receivables
            </p>
            <span className="rounded-full bg-rose-50 p-2 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <AlertCircle className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-rose-600 dark:text-rose-400 num">
            {currency(SCHOOL_SUMMARY.totalOutstandingFees)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Unpaid tuition balance</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Fully Cleared
            </p>
            <span className="rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Users className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-blue-600 dark:text-blue-400 num">
            {students.filter((s) => s.status === "Paid Full").length}
            <span className="text-sm font-normal text-muted-foreground num">
              {" "}
              / {students.length}
            </span>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">100% fees paid</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student name, ID, guardian or phone…"
            className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
              statusFilter === "all"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-secondary text-muted-foreground hover:bg-border"
            }`}
          >
            All Accounts
          </button>
          {(Object.keys(STATUS_CONFIG) as Standing[]).map((st) => {
            const cfg = STATUS_CONFIG[st];
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                  statusFilter === st
                    ? cfg.activePill
                    : "bg-secondary text-muted-foreground hover:bg-border"
                }`}
              >
                {cfg.label}
              </button>
            );
          })}
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* Sort + aggregate row */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground mr-1">Sort by:</span>
          {[
            { key: "balanceDue" as SortKey, label: "Balance" },
            { key: "name" as SortKey, label: "Name" },
            { key: "paidAmount" as SortKey, label: "Paid" },
            { key: "tuitionFee" as SortKey, label: "Fee" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => toggleSort(key)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                sortKey === key
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                  : "bg-secondary text-muted-foreground hover:bg-border"
              }`}
            >
              {label}
              <ArrowUpDown className="size-3" />
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="text-muted-foreground">
            Expected: <span className="font-bold num">{currency(totalExpected)}</span>
          </span>
          <span className="text-muted-foreground">
            Collected:{" "}
            <span className="font-bold text-emerald-600 dark:text-emerald-400 num">
              {currency(totalCollected)}
            </span>
          </span>
          <span className="text-muted-foreground">
            Arrears:{" "}
            <span className="font-bold text-rose-600 dark:text-rose-400 num">
              {currency(totalArrears)}
            </span>
          </span>
          <span className="font-semibold">
            {filtered.length} of {students.length} accounts
          </span>
        </div>
      </div>

      {/* Flat card grid of students (no class grouping) */}
      {filtered.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((s) => (
            <StudentCard
              key={s.id}
              s={s}
              onStatement={setStatementStudent}
              onCollect={setCollectStudent}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No student accounts match the current filters.
          </p>
        </div>
      )}
      {isEnrollOpen && (
        <EnrollStudentModal
          students={students}
          onClose={() => setIsEnrollOpen(false)}
          onSubmit={(student) => {
            setStudents((prev) => [student, ...prev]);
            setIsEnrollOpen(false);
          }}
        />
      )}
      {statementStudent && (
        <StudentStatementModal
          student={statementStudent}
          transactions={transactions}
          onClose={() => setStatementStudent(null)}
        />
      )}
      {collectStudent && (
        <StudentCollectModal
          student={collectStudent}
          onClose={() => setCollectStudent(null)}
          onSubmit={(tx) => {
            const newPaid = collectStudent.paidAmount + tx.amountPaid;
            const newBalance = Math.max(0, collectStudent.tuitionFee - newPaid);
            const newStatus: Student["status"] =
              newBalance === 0 ? "Paid Full" : newPaid > 0 ? "Partial Payment" : "Overdue";
            setStudents((prev) =>
              prev.map((s) =>
                s.studentId === collectStudent.studentId
                  ? { ...s, paidAmount: newPaid, balanceDue: newBalance, status: newStatus }
                  : s,
              ),
            );
            setTransactions((prev) => [tx, ...prev]);
            setCollectStudent(null);
          }}
        />
      )}
    </AppShell>
  );
}
