import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Pill,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  UserCheck,
  ShieldCheck,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { currency } from "@/lib/mos-data";
import {
  PRESCRIPTIONS,
  PHARMACY_SUMMARY,
  type Prescription,
} from "@/lib/pharmacy-data";

export const Route = createFileRoute("/_authenticated/dispensary")({
  head: () => ({
    meta: [
      { title: "Dispensary — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Prescription dispensary queue, doctor scripts, drug dosage verification, insurance co-pay, and patient fulfillment.",
      },
      { property: "og:title", content: "Dispensary — Trite Merchant OS" },
    ],
  }),
  component: DispensaryPage,
});

type RxStatus = Prescription["status"];

const STATUS_CONFIG: Record<
  RxStatus,
  { label: string; icon: React.ElementType; color: string; bg: string; activePill: string }
> = {
  pending: {
    label: "Pending Fill",
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400 font-semibold",
    bg: "bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800",
    activePill: "bg-amber-500 text-white",
  },
  dispensed: {
    label: "Dispensed",
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400 font-semibold",
    bg: "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800",
    activePill: "bg-emerald-600 text-white",
  },
  partially_filled: {
    label: "Partially Filled",
    icon: AlertCircle,
    color: "text-indigo-600 dark:text-indigo-400 font-semibold",
    bg: "bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800",
    activePill: "bg-indigo-600 text-white",
  },
  cancelled: {
    label: "Cancelled",
    icon: AlertCircle,
    color: "text-rose-600 dark:text-rose-400 font-semibold",
    bg: "bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800",
    activePill: "bg-rose-600 text-white",
  },
};

function DispensaryPage() {
  const [statusFilter, setStatusFilter] = useState<RxStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filtered = PRESCRIPTIONS.filter((rx) => {
    const matchStatus = statusFilter === "all" || rx.status === statusFilter;
    const matchSearch =
      search === "" ||
      rx.rxNumber.toLowerCase().includes(search.toLowerCase()) ||
      rx.patientName.toLowerCase().includes(search.toLowerCase()) ||
      rx.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      rx.clinic.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <AppShell
      title="Dispensary & Prescriptions"
      subtitle={`${PHARMACY_SUMMARY.totalPendingDispensary} scripts pending fill · ${currency(PHARMACY_SUMMARY.totalPrescriptionRevenue)} in prescription volume today`}
      actions={
        <Button size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a]">
          <Plus className="size-4" /> New Prescription Script
        </Button>
      }
    >
      {/* Stat Cards */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pending Scripts</p>
            <span className="rounded-full bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Clock className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {PHARMACY_SUMMARY.totalPendingDispensary}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Needs pharmacist verification</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Dispensed Today</p>
            <span className="rounded-full bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {PHARMACY_SUMMARY.totalDispensedToday}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Fulfilled to patients</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Prescription Volume</p>
            <span className="rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Pill className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {currency(PHARMACY_SUMMARY.totalPrescriptionRevenue)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Total medication value</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Insurance Claims</p>
            <span className="rounded-full bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <ShieldCheck className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-purple-600 dark:text-purple-400">
            {PRESCRIPTIONS.filter((r) => r.insuranceClaimNumber).length}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">NHIS & Private claims filed</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Rx #, patient name, doctor or clinic…"
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
            All Prescriptions
          </button>
          {(Object.keys(STATUS_CONFIG) as RxStatus[]).map((st) => {
            const cfg = STATUS_CONFIG[st];
            const isSelected = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                  isSelected ? cfg.activePill : "bg-secondary text-muted-foreground hover:bg-border"
                }`}
              >
                {cfg.label}
              </button>
            );
          })}
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* Prescriptions List / Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((rx) => {
          const cfg = STATUS_CONFIG[rx.status];
          const Icon = cfg.icon;
          return (
            <div
              key={rx.id}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-muted-foreground/30"
            >
              <div>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-muted-foreground">{rx.rxNumber}</span>
                    <h3 className="text-lg font-bold">{rx.patientName}</h3>
                    <p className="text-xs text-muted-foreground">{rx.doctorName} · {rx.clinic}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ${cfg.bg} ${cfg.color}`}>
                    <Icon className="size-3.5" />
                    {cfg.label}
                  </span>
                </div>

                <div className="my-3 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prescribed Drugs</p>
                  {rx.items.map((item, idx) => (
                    <div key={idx} className="rounded-lg bg-secondary/40 p-2.5 text-xs">
                      <div className="flex items-center justify-between font-semibold">
                        <span>{item.drugName}</span>
                        <span className="text-foreground">{currency(item.totalPrice)}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Dosage: {item.dosage} ({item.quantity} units)
                      </p>
                    </div>
                  ))}
                </div>

                {rx.insuranceProvider && (
                  <div className="mt-3 rounded-lg border border-border/80 p-2.5 text-xs flex justify-between items-center bg-secondary/20">
                    <div>
                      <p className="font-semibold text-foreground">{rx.insuranceProvider}</p>
                      <p className="text-[11px] text-muted-foreground">Claim: {rx.insuranceClaimNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground uppercase">Patient Co-pay</p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">{currency(rx.copayAmount)}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">Pharmacist: {rx.pharmacist}</span>
                {rx.status === "pending" ? (
                  <Button size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a] text-xs">
                    Dispense & Fill
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="text-xs">
                    Print Label
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
