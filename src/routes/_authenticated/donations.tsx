import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  HeartHandshake,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Building,
  User,
  Globe,
  Landmark,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { currency } from "@/lib/mos-data";
import { NGO_DONATIONS, NGO_SUMMARY, type Donation } from "@/lib/ngo-data";

export const Route = createFileRoute("/_authenticated/donations")({
  head: () => ({
    meta: [
      { title: "Donations — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Donor contribution ledger, corporate sponsorships, international grants, project funding allocations, and receipt receipts.",
      },
      { property: "og:title", content: "Donations — Trite Merchant OS" },
    ],
  }),
  component: DonationsPage,
});

type DonorType = Donation["donorType"];
type Status = Donation["status"];

const DONOR_TYPE_CONFIG: Record<
  DonorType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  "Corporate Sponsor": {
    icon: Building,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
  },
  "Individual Partner": {
    icon: User,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
  },
  "International Grant": {
    icon: Globe,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
  },
  "Community Foundation": {
    icon: Landmark,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
  },
};

const STATUS_CONFIG: Record<
  Status,
  { label: string; icon: React.ElementType; color: string; bg: string; activePill: string }
> = {
  Received: {
    label: "Received",
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400 font-semibold",
    bg: "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800",
    activePill: "bg-emerald-600 text-white",
  },
  Pledged: {
    label: "Pledged",
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400 font-semibold",
    bg: "bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800",
    activePill: "bg-amber-500 text-white",
  },
};

function DonationsPage() {
  const [donorTypeFilter, setDonorTypeFilter] = useState<DonorType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filtered = NGO_DONATIONS.filter((don) => {
    const matchType = donorTypeFilter === "all" || don.donorType === donorTypeFilter;
    const matchStatus = statusFilter === "all" || don.status === statusFilter;
    const matchSearch =
      search === "" ||
      don.donorName.toLowerCase().includes(search.toLowerCase()) ||
      don.receiptNo.toLowerCase().includes(search.toLowerCase()) ||
      don.allocatedProject.toLowerCase().includes(search.toLowerCase()) ||
      don.donorType.toLowerCase().includes(search.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  return (
    <AppShell
      title="Donations & Grant Ledger"
      subtitle={`${currency(NGO_SUMMARY.totalDonationsRaised)} total donations received · ${NGO_DONATIONS.length} contribution commitments`}
      actions={
        <Button size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a]">
          <Plus className="size-4" /> Record New Donation
        </Button>
      }
    >
      {/* Stat Cards */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Received Funds</p>
            <span className="rounded-full bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <HeartHandshake className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {currency(NGO_SUMMARY.totalDonationsRaised)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">GHS contributions in bank</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Corporate Sponsors</p>
            <span className="rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Building className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {NGO_DONATIONS.filter((d) => d.donorType === "Corporate Sponsor").length} partners
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">MTN & Stanbic Foundation</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">International Grants</p>
            <span className="rounded-full bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Globe className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-purple-600 dark:text-purple-400">
            $15,000 USD
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Global Literacy Alliance</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pledged Funds</p>
            <span className="rounded-full bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Clock className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {NGO_DONATIONS.filter((d) => d.status === "Pledged").length} pledges
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Pending disbursement</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search donor name, project, receipt # or donor type…"
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
            All Statuses
          </button>
          {(Object.keys(STATUS_CONFIG) as Status[]).map((st) => {
            const cfg = STATUS_CONFIG[st];
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                  statusFilter === st ? cfg.activePill : "bg-secondary text-muted-foreground hover:bg-border"
                }`}
              >
                {cfg.label}
              </button>
            );
          })}
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* Donor Type Filter Pills */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(["all", "Corporate Sponsor", "Individual Partner", "International Grant", "Community Foundation"] as const).map((type) => {
          const isSelected = donorTypeFilter === type;
          const cfg = type !== "all" ? DONOR_TYPE_CONFIG[type as DonorType] : null;
          return (
            <button
              key={type}
              onClick={() => setDonorTypeFilter(type as DonorType | "all")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                isSelected
                  ? cfg
                    ? `${cfg.bg} ${cfg.color}`
                    : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent"
                  : "bg-secondary text-muted-foreground border-transparent hover:bg-border"
              }`}
            >
              {cfg && <cfg.icon className="size-3.5" />}
              {type === "all" ? "All Donor Types" : type}
            </button>
          );
        })}
      </div>

      {/* Donations Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((don) => {
          const typeCfg = DONOR_TYPE_CONFIG[don.donorType];
          const TypeIcon = typeCfg.icon;
          const stCfg = STATUS_CONFIG[don.status];
          const StIcon = stCfg.icon;
          return (
            <div
              key={don.id}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-muted-foreground/30"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-muted-foreground">{don.receiptNo}</span>
                    <h3 className="text-lg font-bold">{don.donorName}</h3>
                    <p className="text-xs text-muted-foreground">{don.date} · {don.paymentMethod}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ${stCfg.bg} ${stCfg.color}`}>
                    <StIcon className="size-3.5" />
                    {stCfg.label}
                  </span>
                </div>

                <div className="my-3 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`rounded border p-1.5 ${typeCfg.bg} ${typeCfg.color}`}>
                      <TypeIcon className="size-3.5" />
                    </span>
                    <span className="font-semibold">{don.donorType}</span>
                  </div>

                  <div className="rounded-lg bg-secondary/40 p-2.5">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Allocated Project</p>
                    <p className="font-medium text-foreground">{don.allocatedProject}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">Donation Value</span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {don.currency === "USD" ? `$${don.amount.toLocaleString()} USD` : currency(don.amount)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
