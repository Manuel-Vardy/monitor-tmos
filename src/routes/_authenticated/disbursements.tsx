import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Banknote,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingDown,
  UserCheck,
  ShieldCheck,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { cn } from "@/lib/utils";
import { currency } from "@/lib/mos-data";
import {
  COOP_DISBURSEMENTS,
  COOP_SUMMARY,
  type DisbursementRecord,
  type DisbursementStatus,
  type DisbursementType,
} from "@/lib/cooperative-data";

export const Route = createFileRoute("/_authenticated/disbursements")({
  head: () => ({
    meta: [
      { title: "Disbursements — Trite Merchant OS" },
      {
        name: "description",
        content: "Track member loan disbursements, repayment schedules, guarantors, and dividend payouts.",
      },
    ],
  }),
  component: DisbursementsPage,
});

const STATUS_CONFIG: Record<DisbursementStatus, { icon: React.ElementType; pill: string }> = {
  "Active Repayment": { icon: TrendingDown,  pill: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400" },
  "Fully Paid":       { icon: CheckCircle2, pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" },
  "Pending Approval": { icon: Clock,        pill: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400" },
  Defaulted:          { icon: AlertCircle,  pill: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400" },
};

const FILTER_TABS: { label: string; value: DisbursementType | "all" }[] = [
  { label: "All Disbursements", value: "all" },
  { label: "Personal Loan", value: "Personal Loan" },
  { label: "Business Support Loan", value: "Business Support Loan" },
  { label: "Dividend Payout", value: "Dividend Payout" },
  { label: "Emergency Grant", value: "Emergency Grant" },
];

function DisbursementsPage() {
  const [typeFilter, setTypeFilter] = useState<DisbursementType | "all">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filtered = COOP_DISBURSEMENTS.filter((d) => {
    const matchType = typeFilter === "all" || d.type === typeFilter;
    const matchSearch =
      search === "" ||
      d.memberName.toLowerCase().includes(search.toLowerCase()) ||
      d.memberNo.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <AppShell
      title="Loan & Dividend Disbursements"
      subtitle="Member credit facilities, repayment tracking, and guarantors"
      actions={
        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" /> Issue Disbursement
          </Button>
        </div>
      }
    >
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        {[
          { label: "Active Loan Balance", value: currency(COOP_SUMMARY.activeLoanBalance), icon: Banknote, color: "text-blue-600" },
          { label: "Active Facilities", value: COOP_DISBURSEMENTS.filter((d) => d.status === "Active Repayment").length, icon: TrendingDown, color: "text-emerald-600" },
          { label: "Pending Approvals", value: COOP_DISBURSEMENTS.filter((d) => d.status === "Pending Approval").length, icon: Clock, color: "text-amber-600" },
          { label: "Fully Repaid Loans", value: COOP_DISBURSEMENTS.filter((d) => d.status === "Fully Paid").length, icon: CheckCircle2, color: "text-purple-600" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <k.icon className={cn("size-4", k.color)} />
              <span className="text-xs text-muted-foreground">{k.label}</span>
            </div>
            <p className="text-xl font-bold tracking-tight">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Search member, ID, type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setTypeFilter(tab.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                typeFilter === tab.value ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const cfg = STATUS_CONFIG[item.status];
          const pctRepaid = item.totalRepayable > 0 ? Math.min(100, (item.amountRepaid / item.totalRepayable) * 100) : 0;

          return (
            <div key={item.id} className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-muted-foreground">{item.id} · {item.memberNo}</span>
                  <h3 className="font-semibold text-base mt-0.5">{item.memberName}</h3>
                  <p className="text-xs text-muted-foreground">{item.type} {item.interestRatePct > 0 ? `(${item.interestRatePct}% p.a.)` : ""}</p>
                </div>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium flex items-center gap-1", cfg.pill)}>
                  <cfg.icon className="size-3" />
                  {item.status}
                </span>
              </div>

              {/* Amount & Repayment Progress */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Principal Amount</p>
                  <p className="text-lg font-bold">{currency(item.principalAmount)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Repaid / Total</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{currency(item.amountRepaid)}</p>
                  <p className="text-[11px] text-muted-foreground">of {currency(item.totalRepayable)}</p>
                </div>
              </div>

              {/* Progress bar */}
              {item.interestRatePct > 0 && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Repayment Progress</span>
                    <span className="font-semibold">{pctRepaid.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", pctRepaid >= 100 ? "bg-emerald-500" : "bg-blue-500")}
                      style={{ width: `${pctRepaid}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Guarantors */}
              {item.guarantors.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                  <ShieldCheck className="size-3.5 text-blue-500 shrink-0" />
                  <span>Guarantors: <strong>{item.guarantors.join(", ")}</strong></span>
                </div>
              )}

              {/* Dates */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>Disbursed: {item.disbursementDate}</span>
                <span>Due Date: {item.dueDate}</span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-border bg-card py-16 text-center text-muted-foreground text-sm">
            No disbursement records found
          </div>
        )}
      </div>
    </AppShell>
  );
}
