import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Layers,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  RefreshCw,
  Landmark,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { cn } from "@/lib/utils";
import { currency } from "@/lib/mos-data";
import {
  COOP_RECONCILIATIONS,
  COOP_SUMMARY,
  type ReconciliationRecord,
  type ReconciliationStatus,
} from "@/lib/cooperative-data";

export const Route = createFileRoute("/_authenticated/reconciliation")({
  head: () => ({
    meta: [
      { title: "Bank Reconciliation — Trite Merchant OS" },
      {
        name: "description",
        content: "Bank statement vs cooperative ledger reconciliation, transaction matching, and variance audit.",
      },
    ],
  }),
  component: ReconciliationPage,
});

const STATUS_CONFIG: Record<ReconciliationStatus, { icon: React.ElementType; pill: string }> = {
  Matched:             { icon: CheckCircle2,  pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" },
  Unmatched:           { icon: XCircle,       pill: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400" },
  "Discrepancy Logged": { icon: AlertTriangle, pill: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400" },
};

const FILTER_TABS: { label: string; value: ReconciliationStatus | "all" }[] = [
  { label: "All Statements", value: "all" },
  { label: "Matched", value: "Matched" },
  { label: "Discrepancy Logged", value: "Discrepancy Logged" },
  { label: "Unmatched", value: "Unmatched" },
];

function ReconciliationPage() {
  const [statusFilter, setStatusFilter] = useState<ReconciliationStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filtered = COOP_RECONCILIATIONS.filter((r) => {
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchSearch =
      search === "" ||
      r.transactionRef.toLowerCase().includes(search.toLowerCase()) ||
      r.bankDescription.toLowerCase().includes(search.toLowerCase()) ||
      r.ledgerDescription.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <AppShell
      title="Bank & Ledger Reconciliation"
      subtitle="Matching bank feeds with cooperative ledger records and resolving discrepancies"
      actions={
        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button size="sm" className="gap-1.5">
            <RefreshCw className="size-4" /> Run Auto Match
          </Button>
        </div>
      }
    >
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        {[
          { label: "Reconciled Status", value: "94.2% Matched", icon: FileCheck, color: "text-emerald-600" },
          { label: "Discrepancies Count", value: COOP_SUMMARY.discrepanciesCount, icon: AlertTriangle, color: "text-amber-600" },
          { label: "Unmatched Feeds", value: COOP_RECONCILIATIONS.filter((r) => r.status === "Unmatched").length, icon: XCircle, color: "text-rose-600" },
          { label: "Bank Account Feeds", value: "2 Accounts Connected", icon: Landmark, color: "text-blue-600" },
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
            placeholder="Search ref#, description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                statusFilter === tab.value ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Txn Ref</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Bank Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Ledger Record</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Bank Amt</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Ledger Amt</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Variance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => {
                const cfg = STATUS_CONFIG[item.status];
                return (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{item.transactionRef}</td>
                    <td className="px-4 py-3 font-medium">{item.bankDescription}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.ledgerDescription}</td>
                    <td className="px-4 py-3 text-right font-semibold">{currency(item.bankAmount)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{currency(item.ledgerAmount)}</td>
                    <td className="px-4 py-3 text-right font-bold">
                      {item.discrepancy > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400">+{currency(item.discrepancy)}</span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">GH₵ 0.00</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium inline-flex items-center gap-1", cfg.pill)}>
                        <cfg.icon className="size-3" />
                        {item.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No reconciliation records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
