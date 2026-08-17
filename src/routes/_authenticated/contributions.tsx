import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  PiggyBank,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Smartphone,
  Landmark,
  Banknote,
  TrendingUp,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { cn } from "@/lib/utils";
import { currency } from "@/lib/mos-data";
import {
  COOP_CONTRIBUTIONS,
  COOP_SUMMARY,
  type ContributionRecord,
  type ContributionStatus,
  type ContributionType,
} from "@/lib/cooperative-data";

export const Route = createFileRoute("/_authenticated/contributions")({
  head: () => ({
    meta: [
      { title: "Contributions — Trite Merchant OS" },
      {
        name: "description",
        content: "Track cooperative member monthly savings, share capital payments, and emergency levies.",
      },
    ],
  }),
  component: ContributionsPage,
});

const STATUS_CONFIG: Record<ContributionStatus, { icon: React.ElementType; pill: string }> = {
  Paid:    { icon: CheckCircle2, pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" },
  Pending: { icon: Clock,        pill: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400" },
  Overdue: { icon: AlertCircle,  pill: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400" },
};

const METHOD_ICONS: Record<string, React.ElementType> = {
  "Mobile Money (MTN)": Smartphone,
  "Bank Transfer": Landmark,
  "Cash Deposit": Banknote,
};

const FILTER_TABS: { label: string; value: ContributionType | "all" }[] = [
  { label: "All Types", value: "all" },
  { label: "Monthly Savings", value: "Monthly Savings" },
  { label: "Share Capital", value: "Share Capital" },
  { label: "Emergency Fund", value: "Emergency Fund" },
  { label: "Special Levy", value: "Special Levy" },
];

function ContributionsPage() {
  const [typeFilter, setTypeFilter] = useState<ContributionType | "all">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filtered = COOP_CONTRIBUTIONS.filter((c) => {
    const matchType = typeFilter === "all" || c.type === typeFilter;
    const matchSearch =
      search === "" ||
      c.memberName.toLowerCase().includes(search.toLowerCase()) ||
      c.memberNo.toLowerCase().includes(search.toLowerCase()) ||
      c.period.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const totalCollected = filtered.filter((c) => c.status === "Paid").reduce((a, c) => a + c.amount, 0);

  return (
    <AppShell
      title="Member Contributions"
      subtitle="Monthly savings deposits, share capital, and fund levies"
      actions={
        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" /> Record Contribution
          </Button>
        </div>
      }
    >
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        {[
          { label: "Total Savings Pool", value: currency(COOP_SUMMARY.totalSavingsPool), icon: PiggyBank, color: "text-emerald-600" },
          { label: "Share Capital Pool", value: currency(COOP_SUMMARY.totalShareCapital), icon: Landmark, color: "text-blue-600" },
          { label: "Filtered Collection", value: currency(totalCollected), icon: TrendingUp, color: "text-purple-600" },
          { label: "Pending Deposits", value: COOP_CONTRIBUTIONS.filter((c) => c.status === "Pending").length, icon: Clock, color: "text-amber-600" },
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
            placeholder="Search member, ID, period…"
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

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Receipt Ref</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Member</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Contribution Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Period</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => {
                const cfg = STATUS_CONFIG[item.status];
                const MethodIcon = METHOD_ICONS[item.paymentMethod] ?? Smartphone;
                return (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{item.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.memberName}</p>
                      <p className="text-xs text-muted-foreground">{item.memberNo}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-xs">{item.type}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{item.period}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{currency(item.amount)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <MethodIcon className="size-3.5" />
                        {item.paymentMethod}
                      </span>
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
                    No contribution records found
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
