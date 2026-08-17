import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Receipt,
  Plus,
  Search,
  Printer,
  Smartphone,
  Building2,
  Banknote,
  FileSpreadsheet,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { currency } from "@/lib/mos-data";
import { FEE_TRANSACTIONS, SCHOOL_SUMMARY } from "@/lib/school-data";

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

type PaymentMethod = (typeof FEE_TRANSACTIONS)[0]["paymentMethod"];

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

function ReceiptsPage() {
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "all">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filtered = FEE_TRANSACTIONS.filter((tx) => {
    const matchMethod = methodFilter === "all" || tx.paymentMethod === methodFilter;
    const matchSearch =
      search === "" ||
      tx.receiptNo.toLowerCase().includes(search.toLowerCase()) ||
      tx.studentName.toLowerCase().includes(search.toLowerCase()) ||
      tx.studentId.toLowerCase().includes(search.toLowerCase()) ||
      tx.gradeClass.toLowerCase().includes(search.toLowerCase());
    return matchMethod && matchSearch;
  });

  const totalShown = filtered.reduce((acc, tx) => acc + tx.amountPaid, 0);

  return (
    <AppShell
      title="Payment Receipts & Fee Records"
      subtitle={`${FEE_TRANSACTIONS.length} receipts issued this term · ${currency(SCHOOL_SUMMARY.totalFeesCollected)} total fees collected`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline">
            <FileSpreadsheet className="size-4" /> Export All
          </Button>
          <Button size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a]">
            <Plus className="size-4" /> Issue Receipt
          </Button>
        </div>
      }
    >
      {/* Stat Cards */}
      <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Receipts</p>
            <span className="rounded-full bg-slate-100 p-1.5 sm:p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Receipt className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold">{FEE_TRANSACTIONS.length}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Issued this term</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Mobile Money</p>
            <span className="rounded-full bg-amber-50 p-1.5 sm:p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Smartphone className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {FEE_TRANSACTIONS.filter((t) => t.paymentMethod === "Mobile Money (MTN)").length}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">MTN MoMo txns</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Bank Transfers</p>
            <span className="rounded-full bg-blue-50 p-1.5 sm:p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Building2 className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
            {FEE_TRANSACTIONS.filter((t) => t.paymentMethod === "Bank Transfer").length}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Direct deposits</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Shown Amount</p>
            <span className="rounded-full bg-emerald-50 p-1.5 sm:p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Banknote className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{currency(totalShown)}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{filtered.length} receipts filtered</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 space-y-2.5">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search receipt #, student name, ID or class…"
            className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
          />
        </div>

        {/* Filter pills — horizontally scrollable in one row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setMethodFilter("all")}
            className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
              methodFilter === "all"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-secondary text-muted-foreground hover:bg-border"
            }`}
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
                className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                  isSelected ? cfg.activePill : "bg-secondary text-muted-foreground hover:bg-border"
                }`}
              >
                {method}
              </button>
            );
          })}
          <div className="shrink-0">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>
      </div>

      {/* Receipts Grid — card-per-receipt for print-like feel */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tx) => {
          const cfg = METHOD_CONFIG[tx.paymentMethod];
          const MethodIcon = cfg.icon;
          return (
            <div
              key={tx.id}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-muted-foreground/30"
            >
              {/* Receipt Header */}
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-muted-foreground">{tx.receiptNo}</span>
                  <h3 className="mt-0.5 text-base font-bold text-foreground">{tx.studentName}</h3>
                  <p className="text-xs text-muted-foreground">{tx.studentId} · Class {tx.gradeClass}</p>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                  <MethodIcon className="size-3.5" />
                  {tx.paymentMethod === "Mobile Money (MTN)" ? "MoMo" : tx.paymentMethod}
                </span>
              </div>

              {/* Receipt Body */}
              <div className="my-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Term</span>
                  <span className="font-semibold text-foreground">{tx.term}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date Received</span>
                  <span className="font-semibold text-foreground">{tx.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Received By</span>
                  <span className="font-semibold text-foreground">{tx.receivedBy}</span>
                </div>
              </div>

              {/* Amount Row */}
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 p-3 flex justify-between items-center">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">Amount Paid</span>
                <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  {currency(tx.amountPaid)}
                </span>
              </div>

              <Button size="sm" variant="outline" className="mt-4 w-full text-xs">
                <Printer className="size-3.5" /> Print Receipt
              </Button>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
