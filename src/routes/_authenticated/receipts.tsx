import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import {
  Receipt,
  Search,
  Printer,
  Smartphone,
  Building2,
  Banknote,
  FileSpreadsheet,
  CheckCircle2,
  X,
  School,
  GraduationCap,
  Calendar,
  CreditCard,
  User,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { currency } from "@/lib/mos-data";
import {
  FEE_TRANSACTIONS,
  SCHOOL_STUDENTS,
  SCHOOL_SUMMARY,
  type FeeTransaction,
  type Student,
} from "@/lib/school-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/receipts")({
  head: () => ({
    meta: [
      { title: "Receipts — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Official school fee payment receipts, Mobile Money transaction confirmations, and term tuition receipt generation.",
      },
      { property: "og:title", content: "Receipts — Trite Merchant OS" },
    ],
  }),
  component: ReceiptsPage,
});

type PaymentMethod = "Mobile Money (MTN)" | "Bank Transfer" | "Cash Deposit";

const METHOD_CONFIG: Record<
  PaymentMethod,
  { icon: React.ElementType; color: string; bg: string; activePill: string }
> = {
  "Mobile Money (MTN)": {
    icon: Smartphone,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800",
    activePill: "bg-amber-500 text-white",
  },
  "Bank Transfer": {
    icon: Building2,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800",
    activePill: "bg-blue-600 text-white",
  },
  "Cash Deposit": {
    icon: Banknote,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800",
    activePill: "bg-emerald-600 text-white",
  },
};

const TERTIARY_DEPTS = [
  "IT Department",
  "HR Department",
  "Social Studies Department",
  "Art Department",
  "Business Administration",
  "Accounting & Finance",
] as const;

function getStudentDept(s: Student): string {
  if (s.department) return s.department;
  const id = s.studentId || "";
  if (id.includes("-IT") || id.includes("-C01") || id.includes("-P6") || id.includes("-J3"))
    return "IT Department";
  if (id.includes("-HR") || id.includes("-C02") || id.includes("-P5") || id.includes("-J2"))
    return "HR Department";
  if (id.includes("-SOC") || id.includes("-N101") || id.includes("-N102") || id.includes("-P4") || id.includes("-J1"))
    return "Social Studies Department";
  if (id.includes("-ART") || id.includes("-N201") || id.includes("-P3") || id.includes("-K101"))
    return "Art Department";
  if (id.includes("-BUS") || id.includes("-K102") || id.includes("-P2") || id.includes("-J202"))
    return "Business Administration";
  if (id.includes("-ACC") || id.includes("-K201") || id.includes("-P1"))
    return "Accounting & Finance";
  return "IT Department";
}

function getTxDept(tx: FeeTransaction, students: Student[]): string {
  const st = students.find((s) => s.studentId === tx.studentId || s.name === tx.studentName);
  if (st) return getStudentDept(st);
  const id = tx.studentId || "";
  if (id.includes("-IT") || id.includes("-C01") || id.includes("-P6") || id.includes("-J3"))
    return "IT Department";
  if (id.includes("-HR") || id.includes("-C02") || id.includes("-P5") || id.includes("-J2"))
    return "HR Department";
  if (id.includes("-SOC") || id.includes("-N101") || id.includes("-N102") || id.includes("-P4") || id.includes("-J1"))
    return "Social Studies Department";
  if (id.includes("-ART") || id.includes("-N201") || id.includes("-P3") || id.includes("-K101"))
    return "Art Department";
  if (id.includes("-BUS") || id.includes("-K102") || id.includes("-P2") || id.includes("-J202"))
    return "Business Administration";
  if (id.includes("-ACC") || id.includes("-K201") || id.includes("-P1"))
    return "Accounting & Finance";
  return "IT Department";
}

function getTxFeeType(tx: FeeTransaction): string {
  if (tx.feeType) return tx.feeType;
  if (tx.amountPaid >= 2000) return "Tuition Fee (Core Academic)";
  if (tx.amountPaid >= 1000) return "Tuition Installment Payment";
  if (tx.amountPaid === 350) return "Faculty & Practical Lab Fee";
  if (tx.amountPaid === 250) return "Examination & Assessment Levy";
  if (tx.amountPaid === 150) return "Library & ICT Infrastructure";
  return "Tuition & Academic Levies";
}

// ── Official Print Receipt Modal ──
function PrintReceiptModal({
  tx,
  student,
  dept,
  onClose,
}: {
  tx: FeeTransaction;
  student: Student | undefined;
  dept: string;
  onClose: () => void;
}) {
  const feeType = getTxFeeType(tx);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-card shadow-2xl border border-border p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Print and Close */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="size-5 text-accent" />
            <h2 className="text-base font-bold text-foreground">Official Payment Receipt</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-[#22c55e] text-white hover:bg-[#16a34a] gap-1.5 h-8 text-xs"
            >
              <Printer className="size-3.5" />
              <span>Print</span>
            </Button>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="rounded-xl border border-border/80 bg-background p-5 space-y-4 font-sans text-xs">
          {/* Institutional Header */}
          <div className="text-center border-b border-border/60 pb-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <School className="size-5 text-accent" />
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                TERTIARY INSTITUTE OF TECHNOLOGY & MANAGEMENT
              </h3>
            </div>
            <p className="text-[11px] text-muted-foreground">Office of the Bursar & Academic Accounts</p>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="size-3" /> OFFICIAL FEE PAYMENT RECEIPT
            </div>
          </div>

          {/* Receipt Info Grid */}
          <div className="grid grid-cols-2 gap-3 bg-secondary/30 p-3 rounded-lg border border-border/50 text-[11px]">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">Receipt Number</span>
              <span className="font-mono font-bold text-foreground">{tx.receiptNo}</span>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">Date Issued</span>
              <span className="font-semibold text-foreground">{tx.date}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">Student Name</span>
              <span className="font-bold text-foreground">{tx.studentName}</span>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">Index Number</span>
              <span className="font-mono font-bold text-foreground">{tx.studentId}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">Department</span>
              <span className="font-medium text-foreground">{dept}</span>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">Academic Term</span>
              <span className="font-medium text-foreground">{tx.term}</span>
            </div>
          </div>

          {/* Fee Itemization Table */}
          <div className="border border-border/70 rounded-lg overflow-hidden">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-secondary/60 text-[10px] font-bold text-muted-foreground uppercase border-b border-border">
                <tr>
                  <th className="px-3 py-2">Item Description</th>
                  <th className="px-3 py-2">Payment Method</th>
                  <th className="px-3 py-2 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <tr>
                  <td className="px-3 py-2 font-medium text-foreground">{feeType}</td>
                  <td className="px-3 py-2 text-muted-foreground">{tx.paymentMethod}</td>
                  <td className="px-3 py-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {currency(tx.amountPaid)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Box */}
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 p-3 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                Total Fees Collected
              </span>
              <span className="text-[10px] text-muted-foreground">Status: Transaction Confirmed</span>
            </div>
            <span className="text-lg font-black text-emerald-700 dark:text-emerald-300 font-mono">
              {currency(tx.amountPaid)}
            </span>
          </div>

          {/* Student Balance Summary */}
          {student && (
            <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1 border-t border-border/50">
              <span>Total Department Tuition: <strong>{currency(student.tuitionFee)}</strong></span>
              <span>
                Remaining Balance Due:{" "}
                <strong className={student.balanceDue > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}>
                  {currency(student.balanceDue)}
                </strong>
              </span>
            </div>
          )}

          {/* Signature & Verification */}
          <div className="pt-3 border-t border-dashed border-border flex items-center justify-between text-[10px] text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">Accounts Department Verification</p>
              <p>Generated electronically via TMOS Fee System</p>
            </div>
            <div className="text-right">
              <div className="h-6 border-b border-muted-foreground/40 w-28 mb-1"></div>
              <p>Authorized Signature</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
            Close
          </Button>
          <Button
            size="sm"
            onClick={handlePrint}
            className="bg-[#22c55e] text-white hover:bg-[#16a34a] gap-1.5 h-8 text-xs"
          >
            <Printer className="size-3.5" /> Print Official Receipt
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Receipts Page ──
function ReceiptsPage() {
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "all">("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [printTx, setPrintTx] = useState<FeeTransaction | null>(null);

  const students = SCHOOL_STUDENTS;
  const transactions = FEE_TRANSACTIONS;

  // Filtered receipts reflecting students and fee management info
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const txDept = getTxDept(tx, students);
      const matchDept = deptFilter === "all" || txDept === deptFilter;
      const matchMethod = methodFilter === "all" || tx.paymentMethod === methodFilter;
      const feeType = getTxFeeType(tx);

      const q = search.toLowerCase().trim();
      const matchSearch =
        q === "" ||
        tx.receiptNo.toLowerCase().includes(q) ||
        tx.studentName.toLowerCase().includes(q) ||
        tx.studentId.toLowerCase().includes(q) ||
        txDept.toLowerCase().includes(q) ||
        feeType.toLowerCase().includes(q) ||
        tx.paymentMethod.toLowerCase().includes(q) ||
        (tx.receivedBy ?? "").toLowerCase().includes(q);

      return matchDept && matchMethod && matchSearch;
    });
  }, [transactions, students, deptFilter, methodFilter, search]);

  const totalShown = filtered.reduce((acc, tx) => acc + tx.amountPaid, 0);

  // Department collection breakdown
  const deptStats = useMemo(() => {
    const map: Record<string, number> = {};
    TERTIARY_DEPTS.forEach((d) => {
      map[d] = 0;
    });
    transactions.forEach((tx) => {
      const d = getTxDept(tx, students);
      if (!map[d]) map[d] = 0;
      map[d] += tx.amountPaid;
    });
    return map;
  }, [transactions, students]);

  return (
    <AppShell
      title="Payment Receipts & Fee Records"
      subtitle={`${transactions.length} receipts issued this term · ${currency(SCHOOL_SUMMARY.totalFeesCollected)} total fees collected across ${TERTIARY_DEPTS.length} departments`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs gap-1.5">
            <FileSpreadsheet className="size-3.5 text-accent" /> Export Receipts
          </Button>
        </div>
      }
    >
      {/* ══════════════════════════════════════════════
          1. STAT SUMMARY CARDS
      ══════════════════════════════════════════════ */}
      <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Receipts */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Receipts
            </p>
            <span className="rounded-full bg-slate-100 p-1.5 sm:p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Receipt className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold">{transactions.length}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Issued in Term 3, 2026</p>
        </div>

        {/* Card 2: Mobile Money */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Mobile Money
            </p>
            <span className="rounded-full bg-amber-50 p-1.5 sm:p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Smartphone className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {transactions.filter((t) => t.paymentMethod.includes("Mobile Money")).length} Receipts
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">MoMo mobile settlements</p>
        </div>

        {/* Card 3: Bank Transfers */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Bank Transfers
            </p>
            <span className="rounded-full bg-blue-50 p-1.5 sm:p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Building2 className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
            {transactions.filter((t) => t.paymentMethod === "Bank Transfer").length} Receipts
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Direct deposits & wires</p>
        </div>

        {/* Card 4: Filtered Shown Amount */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Fees Collected (Shown)
            </p>
            <span className="rounded-full bg-emerald-50 p-1.5 sm:p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Banknote className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {currency(totalShown)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{filtered.length} receipts displayed</p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          2. FILTERS & SEARCH TOOLBAR
      ══════════════════════════════════════════════ */}
      <div className="mb-4 space-y-3">
        {/* Search row */}
        <div className="relative w-full">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search receipt #, student name, index number, department, or fee type…"
            className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-xs outline-none placeholder:text-muted-foreground focus:border-ring"
          />
        </div>

        {/* Department filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setDeptFilter("all")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition-all border shrink-0",
              deptFilter === "all"
                ? "bg-foreground text-background border-transparent"
                : "bg-card text-muted-foreground border-border hover:bg-secondary"
            )}
          >
            All Departments ({transactions.length})
          </button>

          {(
            [
              { dept: "IT Department", activeBg: "bg-violet-600", activeBorder: "border-violet-600", activeText: "text-violet-100", idleText: "text-violet-600 dark:text-violet-400" },
              { dept: "HR Department", activeBg: "bg-sky-600", activeBorder: "border-sky-600", activeText: "text-sky-100", idleText: "text-sky-600 dark:text-sky-400" },
              { dept: "Social Studies Department", activeBg: "bg-amber-600", activeBorder: "border-amber-600", activeText: "text-amber-100", idleText: "text-amber-600 dark:text-amber-400" },
              { dept: "Art Department", activeBg: "bg-pink-600", activeBorder: "border-pink-600", activeText: "text-pink-100", idleText: "text-pink-600 dark:text-pink-400" },
              { dept: "Business Administration", activeBg: "bg-orange-600", activeBorder: "border-orange-600", activeText: "text-orange-100", idleText: "text-orange-600 dark:text-orange-400" },
              { dept: "Accounting & Finance", activeBg: "bg-teal-600", activeBorder: "border-teal-600", activeText: "text-teal-100", idleText: "text-teal-600 dark:text-teal-400" },
            ] as const
          ).map(({ dept, activeBg, activeBorder, activeText, idleText }) => {
            const isSelected = deptFilter === dept;
            const collected = deptStats[dept] || 0;
            return (
              <button
                key={dept}
                onClick={() => setDeptFilter(dept)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-all border shrink-0 flex items-center gap-1.5",
                  isSelected
                    ? `${activeBg} text-white ${activeBorder}`
                    : "bg-card text-muted-foreground border-border hover:bg-secondary"
                )}
              >
                <span>{dept.split(" ")[0]}</span>
                <span className={cn("text-[11px] font-bold", isSelected ? activeText : idleText)}>
                  {currency(collected)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Method filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setMethodFilter("all")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition-all border shrink-0",
              methodFilter === "all"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent"
                : "bg-secondary text-muted-foreground hover:bg-border border-border"
            )}
          >
            All Methods
          </button>
          {(Object.keys(METHOD_CONFIG) as PaymentMethod[]).map((method) => {
            const cfg = METHOD_CONFIG[method];
            const isSelected = methodFilter === method;
            return (
              <button
                key={method}
                onClick={() => setMethodFilter(method)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-all border shrink-0",
                  isSelected
                    ? `${cfg.activePill} border-transparent`
                    : "bg-secondary text-muted-foreground hover:bg-border border-border"
                )}
              >
                {method.replace(" (MTN)", "")}
              </button>
            );
          })}
          <div className="shrink-0 ml-auto">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          3. COMPREHENSIVE RECEIPTS HORIZONTAL TABLE
      ══════════════════════════════════════════════ */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/40 text-xs font-bold text-muted-foreground uppercase border-b border-border">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-5 py-3">Receipt No</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Index Number</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Fee Type Paid</th>
                <th className="px-5 py-3">Payment Method</th>
                <th className="px-5 py-3 text-right font-bold">Fees Collected</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-xs text-muted-foreground">
                    No payment receipts found matching your search or filters.
                  </td>
                </tr>
              ) : (
                filtered.map((tx, idx) => {
                  const dept = getTxDept(tx, students);
                  const feeType = getTxFeeType(tx);
                  const cfg = METHOD_CONFIG[tx.paymentMethod];
                  const MethodIcon = cfg.icon;

                  return (
                    <tr key={tx.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 text-xs font-bold text-muted-foreground">{idx + 1}</td>
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs font-bold text-foreground bg-secondary/80 px-2 py-0.5 rounded border border-border/60">
                          {tx.receiptNo}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">{tx.date}</td>
                      <td className="px-5 py-3 font-semibold text-foreground">{tx.studentName}</td>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{tx.studentId}</td>
                      <td className="px-5 py-3 text-xs font-medium text-foreground">{dept}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                        {feeType}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
                            cfg.bg,
                            cfg.color
                          )}
                        >
                          <MethodIcon className="size-3" />
                          {tx.paymentMethod.replace(" (MTN)", "")}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {currency(tx.amountPaid)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPrintTx(tx)}
                          className="h-7 text-xs px-2.5 gap-1.5 hover:bg-[#22c55e] hover:text-white hover:border-[#22c55e] transition-colors"
                        >
                          <Printer className="size-3" />
                          <span>Print Receipt</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Print Receipt Modal ── */}
      {printTx && (
        <PrintReceiptModal
          tx={printTx}
          student={students.find((s) => s.studentId === printTx.studentId || s.name === printTx.studentName)}
          dept={getTxDept(printTx, students)}
          onClose={() => setPrintTx(null)}
        />
      )}
    </AppShell>
  );
}
