import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Trash2,
  Plus,
  Search,
  AlertTriangle,
  Flame,
  DollarSign,
  FileSpreadsheet,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { currency } from "@/lib/mos-data";
import { WASTAGE_LOGS, RESTAURANT_SUMMARY, type WastageLog } from "@/lib/restaurant-data";

export const Route = createFileRoute("/_authenticated/wastage")({
  head: () => ({
    meta: [
      { title: "Wastage & Spoilage — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Track kitchen wastage, expired ingredients, overcooked prep loss, and food variance logs.",
      },
      { property: "og:title", content: "Wastage & Spoilage — Trite Merchant OS" },
    ],
  }),
  component: WastagePage,
});

type WastageReason = WastageLog["reason"];

const REASON_PILLS: { key: WastageReason | "all"; label: string; activeColor: string }[] = [
  { key: "all", label: "All Logs", activeColor: "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" },
  { key: "Expired Ingredient", label: "Expired", activeColor: "bg-rose-600 text-white" },
  { key: "Overcooked", label: "Overcooked", activeColor: "bg-amber-600 text-white" },
  { key: "Spill / Drop", label: "Spill / Drop", activeColor: "bg-blue-600 text-white" },
  { key: "Prep Trimmings", label: "Prep Loss", activeColor: "bg-slate-700 text-white" },
];

function WastagePage() {
  const [reasonFilter, setReasonFilter] = useState<WastageReason | "all">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filteredLogs = WASTAGE_LOGS.filter((log) => {
    const matchReason = reasonFilter === "all" || log.reason === reasonFilter;
    const matchSearch =
      search === "" ||
      log.item.toLowerCase().includes(search.toLowerCase()) ||
      log.reportedBy.toLowerCase().includes(search.toLowerCase()) ||
      log.branch.toLowerCase().includes(search.toLowerCase());
    return matchReason && matchSearch;
  });

  const totalWastageCost = WASTAGE_LOGS.reduce((acc, log) => acc + log.costValue, 0);

  return (
    <AppShell
      title="Wastage & Kitchen Variance"
      subtitle={`Track kitchen spoilage, prep loss & expired items · Total Wastage Cost: ${currency(totalWastageCost)}`}
      actions={
        <Button size="sm" className="h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm bg-[#22c55e] text-white hover:bg-[#16a34a] shrink-0">
          <Plus className="size-3.5 sm:size-4" />
          <span className="hidden sm:inline">Log Wastage Event</span>
          <span className="sm:hidden">Log Wastage</span>
        </Button>
      }
    >
      {/* Stat Summaries */}
      <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Wastage</p>
            <span className="rounded-full bg-rose-50 p-1.5 sm:p-2 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <DollarSign className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">{currency(totalWastageCost)}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Cumulative variance</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Expired</p>
            <span className="rounded-full bg-amber-50 p-1.5 sm:p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <AlertTriangle className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {WASTAGE_LOGS.filter((l) => l.reason === "Expired Ingredient").length}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Spoilage incidents</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Prep Loss</p>
            <span className="rounded-full bg-purple-50 p-1.5 sm:p-2 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Flame className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
            {WASTAGE_LOGS.filter((l) => l.reason === "Overcooked" || l.reason === "Prep Trimmings").length}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Cook mistakes</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Logged Events</p>
            <span className="rounded-full bg-slate-100 p-1.5 sm:p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Trash2 className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold">{WASTAGE_LOGS.length}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Reports filed</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 space-y-2.5">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ingredient, item, reporter or branch…"
            className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
          />
        </div>

        {/* Filter pills — horizontally scrollable on mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {REASON_PILLS.map((pill) => {
            const isSelected = reasonFilter === pill.key;
            return (
              <button
                key={pill.key}
                onClick={() => setReasonFilter(pill.key)}
                className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                  isSelected ? pill.activeColor : "bg-secondary text-muted-foreground hover:bg-border"
                }`}
              >
                {pill.label}
              </button>
            );
          })}
          <div className="shrink-0">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>
      </div>

      {/* Mobile Wastage Cards View */}
      <div className="divide-y divide-border rounded-xl border border-border bg-card sm:hidden">
        {filteredLogs.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No wastage logs found matching your search.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="p-3.5 space-y-2.5 transition-colors hover:bg-secondary/40">
              {/* Row 1: Log ID & Reason Pill */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="font-mono text-xs font-bold bg-muted px-2 py-0.5 rounded border border-border/70 text-foreground">
                    {log.id}
                  </span>
                  <span>·</span>
                  <span>{log.date}</span>
                </div>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-foreground border border-border/60">
                  {log.reason}
                </span>
              </div>

              {/* Row 2: Item Name & Loss Value */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm leading-tight text-foreground">{log.item}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {log.category} · <span className="font-medium text-foreground/80">{log.quantity}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="num text-sm font-bold text-rose-600 dark:text-rose-400">{currency(log.costValue)}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">loss value</p>
                </div>
              </div>

              {/* Row 3: Reporter & Branch */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50 text-xs text-muted-foreground">
                <div className="truncate">
                  <span>Reported by <strong className="text-foreground font-medium">{log.reportedBy}</strong></span>
                  <span className="mx-1.5 opacity-40">·</span>
                  <span>{log.branch}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Log ID</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Item / Ingredient</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Loss Value</th>
              <th className="px-4 py-3">Reason</th>
              <th className="hidden px-4 py-3 md:table-cell">Reported By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="transition-colors hover:bg-secondary/30">
                <td className="px-4 py-3 font-mono text-xs font-semibold">{log.id}</td>
                <td className="px-4 py-3 text-muted-foreground">{log.date}</td>
                <td className="px-4 py-3 font-semibold text-foreground">{log.item}</td>
                <td className="px-4 py-3 text-muted-foreground">{log.category}</td>
                <td className="px-4 py-3 font-medium">{log.quantity}</td>
                <td className="px-4 py-3 font-bold text-rose-600 dark:text-rose-400">{currency(log.costValue)}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-secondary px-2.5 py-0.5 text-xs font-medium text-foreground">
                    {log.reason}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{log.reportedBy} ({log.branch})</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
