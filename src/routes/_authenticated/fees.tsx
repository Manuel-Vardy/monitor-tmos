import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Banknote,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Receipt,
  FileSpreadsheet,
  X,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { currency } from "@/lib/mos-data";
import {
  SCHOOL_STUDENTS,
  FEE_TRANSACTIONS,
  SCHOOL_SUMMARY,
  type Student,
  type FeeTransaction,
} from "@/lib/school-data";

export const Route = createFileRoute("/_authenticated/fees")({
  head: () => ({
    meta: [
      { title: "Fee Management — Trite Merchant OS" },
      {
        name: "description",
        content:
          "School fee billing, tuition collection ledger, term payments, arrears tracking, and Mobile Money fee reconciliation.",
      },
      { property: "og:title", content: "Fee Management — Trite Merchant OS" },
    ],
  }),
  component: FeeManagementPage,
});

function CollectFeeModal({
  students,
  transactions,
  onClose,
  onSubmit,
}: {
  students: Student[];
  transactions: FeeTransaction[];
  onClose: () => void;
  onSubmit: (tx: FeeTransaction) => void;
}) {
  const PAYMENT_METHODS = ["Mobile Money (MTN)", "Bank Transfer", "Cash Deposit"] as const;

  const [studentId, setStudentId] = useState(students[0]?.studentId ?? "");
  const selected = students.find((s) => s.studentId === studentId);
  const [amount, setAmount] = useState(selected ? String(selected.balanceDue) : "");
  const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number]>("Mobile Money (MTN)");
  const [receivedBy, setReceivedBy] = useState("Bursar Mr. Mensah");

  const inputClass =
    "h-9 w-full rounded-md border border-border bg-card px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring";

  const handleStudentChange = (id: string) => {
    setStudentId(id);
    const stu = students.find((s) => s.studentId === id);
    if (stu) setAmount(String(stu.balanceDue));
  };

  const handleSubmit = () => {
    const paid = Number(amount) || 0;
    if (!selected || paid <= 0) return;
    const nextNum = transactions.length + 106;
    const receiptNo = `RCP-2026-0${nextNum}`;
    const today = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    onSubmit({
      id: `REC-${Date.now()}`,
      receiptNo,
      studentId: selected.studentId,
      schoolId: selected.schoolId,
      studentName: selected.name,
      amountPaid: paid,
      paymentMethod: method,
      date: today,
      term: selected.term,
      receivedBy,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Collect Fee Payment"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-bold">Collect Fee Payment</h2>
            <p className="text-xs text-muted-foreground">Record a tuition receipt</p>
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
              Student
            </label>
            <select
              value={studentId}
              onChange={(e) => handleStudentChange(e.target.value)}
              className={inputClass}
            >
              {students.map((s) => (
                <option key={s.studentId} value={s.studentId}>
                  {s.name} · {s.studentId}
                </option>
              ))}
            </select>
          </div>

          {selected && (
            <div className="rounded-lg bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
              Tuition: {currency(selected.tuitionFee)} · Paid: {currency(selected.paidAmount)} ·
              Balance Due:{" "}
              <span
                className={
                  selected.balanceDue > 0
                    ? "text-amber-600 dark:text-amber-400 font-semibold"
                    : "text-emerald-600 dark:text-emerald-400 font-semibold"
                }
              >
                {currency(selected.balanceDue)}
              </span>
            </div>
          )}

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
            disabled={!selected || (Number(amount) || 0) <= 0}
          >
            <Plus className="size-3.5" /> Record Payment
          </Button>
        </div>
      </div>
    </div>
  );
}

function FeeManagementPage() {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [students, setStudents] = useState<Student[]>(SCHOOL_STUDENTS);
  const [transactions, setTransactions] = useState<FeeTransaction[]>(FEE_TRANSACTIONS);
  const [isCollectOpen, setIsCollectOpen] = useState(false);

  const filteredTransactions = transactions.filter((tx) => {
    const matchSearch =
      search === "" ||
      tx.receiptNo.toLowerCase().includes(search.toLowerCase()) ||
      tx.studentName.toLowerCase().includes(search.toLowerCase()) ||
      tx.studentId.toLowerCase().includes(search.toLowerCase()) ||
      tx.paymentMethod.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <AppShell
      title="Fee Management & Collection Ledger"
      subtitle={`Term 3 Tuition: ${currency(SCHOOL_SUMMARY.totalFeesCollected)} collected · ${currency(SCHOOL_SUMMARY.totalOutstandingFees)} in outstanding fee arrears`}
      actions={
        <Button
          size="sm"
          onClick={() => setIsCollectOpen(true)}
          className="h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm bg-[#22c55e] text-white hover:bg-[#16a34a] shrink-0"
        >
          <Plus className="size-3.5 sm:size-4" />
          <span className="hidden sm:inline">Collect Fee Payment</span>
          <span className="sm:hidden">Collect Fee</span>
        </Button>
      }
    >
      {/* Stat Summaries */}
      <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Collected
            </p>
            <span className="rounded-full bg-emerald-50 p-1.5 sm:p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Banknote className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {currency(SCHOOL_SUMMARY.totalFeesCollected)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Term 3 fees received</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Fee Arrears
            </p>
            <span className="rounded-full bg-rose-50 p-1.5 sm:p-2 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <AlertCircle className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">
            {currency(SCHOOL_SUMMARY.totalOutstandingFees)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Unpaid balance</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Receipts
            </p>
            <span className="rounded-full bg-blue-50 p-1.5 sm:p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Receipt className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
            {FEE_TRANSACTIONS.length}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Issued this term</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Cleared Students
            </p>
            <span className="rounded-full bg-purple-50 p-1.5 sm:p-2 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <CheckCircle2 className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
            {SCHOOL_STUDENTS.filter((s) => s.status === "Paid Full").length}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">100% fees paid</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 space-y-2.5">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search receipt #, student name, ID or payment method…"
            className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
          />
        </div>

        {/* Action pills & date picker — horizontally scrollable in one row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <div className="shrink-0">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
          <Button variant="outline" size="sm" className="shrink-0 h-8 text-xs">
            <FileSpreadsheet className="size-3.5" /> Export Ledger
          </Button>
        </div>
      </div>

      {/* Fee Payments Sliding Table (Horizontally Scrollable without Card Grouping) */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-2xs">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 whitespace-nowrap">Receipt No</th>
              <th className="px-4 py-3 whitespace-nowrap">Date</th>
              <th className="px-4 py-3 whitespace-nowrap">Student Name</th>
              <th className="px-4 py-3 whitespace-nowrap">Payment Method</th>
              <th className="px-4 py-3 font-bold whitespace-nowrap">Amount Paid</th>
              <th className="px-4 py-3 whitespace-nowrap">Received By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No fee transactions found matching your search.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => (
                <tr key={tx.id} className="transition-colors hover:bg-secondary/30">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground whitespace-nowrap">
                    {tx.receiptNo}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{tx.date}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-semibold text-foreground">{tx.studentName}</p>
                    <p className="text-xs text-muted-foreground">{tx.studentId}</p>
                    {tx.schoolId && (
                      <p className="text-[10px] text-muted-foreground">School ID: {tx.schoolId}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="rounded bg-secondary px-2.5 py-0.5 text-xs font-medium text-foreground">
                      {tx.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {currency(tx.amountPaid)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {tx.receivedBy}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {isCollectOpen && (
        <CollectFeeModal
          students={students}
          transactions={transactions}
          onClose={() => setIsCollectOpen(false)}
          onSubmit={(tx) => {
            const student = students.find((s) => s.studentId === tx.studentId);
            if (student) {
              const newPaid = student.paidAmount + tx.amountPaid;
              const newBalance = Math.max(0, student.tuitionFee - newPaid);
              const newStatus: Student["status"] =
                newBalance === 0 ? "Paid Full" : newPaid > 0 ? "Partial Payment" : "Overdue";
              setStudents((prev) =>
                prev.map((s) =>
                  s.studentId === student.studentId
                    ? { ...s, paidAmount: newPaid, balanceDue: newBalance, status: newStatus }
                    : s,
                ),
              );
            }
            setTransactions((prev) => [tx, ...prev]);
            setIsCollectOpen(false);
          }}
        />
      )}
    </AppShell>
  );
}
