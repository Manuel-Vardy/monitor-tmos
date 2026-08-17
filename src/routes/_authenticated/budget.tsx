import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  PiggyBank,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { currency } from "@/lib/mos-data";
import { BUDGET_APPROVALS, NGO_SUMMARY, type BudgetApproval } from "@/lib/ngo-data";

export const Route = createFileRoute("/_authenticated/budget")({
  head: () => ({
    meta: [
      { title: "Budget & Approvals — Trite Merchant OS" },
      {
        name: "description",
        content:
          "NGO field project budget approval workflow, requisition requests, category allocations, and board sign-offs.",
      },
      { property: "og:title", content: "Budget & Approvals — Trite Merchant OS" },
    ],
  }),
  component: BudgetPage,
});

type Status = BudgetApproval["status"];

const STATUS_CONFIG: Record<
  Status,
  { label: string; icon: React.ElementType; color: string; bg: string; activePill: string }
> = {
  Approved: {
    label: "Approved",
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400 font-semibold",
    bg: "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800",
    activePill: "bg-emerald-600 text-white",
  },
  "Pending Approval": {
    label: "Pending Approval",
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400 font-semibold",
    bg: "bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800",
    activePill: "bg-amber-600 text-white",
  },
};

function BudgetPage() {
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filtered = BUDGET_APPROVALS.filter((req) => {
    const matchStatus = statusFilter === "all" || req.status === statusFilter;
    const matchSearch =
      search === "" ||
      req.requestNo.toLowerCase().includes(search.toLowerCase()) ||
      req.projectName.toLowerCase().includes(search.toLowerCase()) ||
      req.projectCode.toLowerCase().includes(search.toLowerCase()) ||
      req.category.toLowerCase().includes(search.toLowerCase()) ||
      req.requestedBy.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <AppShell
      title="Budget & Field Requisition Approvals"
      subtitle={`${BUDGET_APPROVALS.length} project funding requisitions · ${currency(NGO_SUMMARY.totalBudgetRequested)} total requested across field projects`}
      actions={
        <Button size="sm" className="h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm bg-[#22c55e] text-white hover:bg-[#16a34a] shrink-0">
          <Plus className="size-3.5 sm:size-4" />
          <span className="hidden sm:inline">New Budget Request</span>
          <span className="sm:hidden">New Request</span>
        </Button>
      }
    >
      {/* Stat Cards */}
      <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Requested</p>
            <span className="rounded-full bg-slate-100 p-1.5 sm:p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <PiggyBank className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold">{currency(NGO_SUMMARY.totalBudgetRequested)}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Field project requests</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Approved</p>
            <span className="rounded-full bg-emerald-50 p-1.5 sm:p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {currency(BUDGET_APPROVALS.filter((b) => b.status === "Approved").reduce((a, b) => a + b.amountRequested, 0))}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Disbursed to teams</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pending Amount</p>
            <span className="rounded-full bg-amber-50 p-1.5 sm:p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Clock className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {currency(BUDGET_APPROVALS.filter((b) => b.status === "Pending Approval").reduce((a, b) => a + b.amountRequested, 0))}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Awaiting sign-off</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pending Count</p>
            <span className="rounded-full bg-blue-50 p-1.5 sm:p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <AlertCircle className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
            {BUDGET_APPROVALS.filter((b) => b.status === "Pending Approval").length}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Needs review</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 space-y-2.5">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search request #, project code/name, category or requester…"
            className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
          />
        </div>

        {/* Filter pills — horizontally scrollable */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setStatusFilter("all")}
            className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
              statusFilter === "all"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-secondary text-muted-foreground hover:bg-border"
            }`}
          >
            All Requisitions
          </button>
          {(Object.keys(STATUS_CONFIG) as Status[]).map((st) => {
            const cfg = STATUS_CONFIG[st];
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                  statusFilter === st ? cfg.activePill : "bg-secondary text-muted-foreground hover:bg-border"
                }`}
              >
                {cfg.label}
              </button>
            );
          })}
          <div className="shrink-0">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>
      </div>

      {/* Budget Requests Sliding Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-2xs">
        <table className="w-full min-w-[780px] text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 whitespace-nowrap">Request No</th>
              <th className="px-4 py-3 whitespace-nowrap">Project Title</th>
              <th className="px-4 py-3 whitespace-nowrap">Category</th>
              <th className="px-4 py-3 whitespace-nowrap">Requested By</th>
              <th className="px-4 py-3 font-bold whitespace-nowrap">Amount</th>
              <th className="px-4 py-3 whitespace-nowrap">Approver</th>
              <th className="px-4 py-3 whitespace-nowrap">Status</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  No budget requests match your search.
                </td>
              </tr>
            ) : (
              filtered.map((req) => {
                const cfg = STATUS_CONFIG[req.status];
                const Icon = cfg.icon;
                return (
                  <tr key={req.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground whitespace-nowrap">{req.requestNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-semibold text-foreground">{req.projectName}</p>
                      <p className="text-xs text-muted-foreground">{req.projectCode}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{req.category}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{req.requestedBy}</td>
                    <td className="px-4 py-3 font-bold text-foreground whitespace-nowrap">{currency(req.amountRequested)}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{req.approvedBy}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ${cfg.bg} ${cfg.color}`}>
                        <Icon className="size-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {req.status === "Pending Approval" ? (
                        <Button size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a] text-xs h-7">
                          Approve
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="text-xs h-7">
                          View
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
