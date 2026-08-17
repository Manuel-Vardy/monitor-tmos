import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  UserRound,
  Plus,
  Search,
  Phone,
  Mail,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { currency } from "@/lib/mos-data";
import { PATIENT_RECORDS, PHARMACY_SUMMARY, type PatientRecord } from "@/lib/pharmacy-data";

export const Route = createFileRoute("/_authenticated/patients")({
  head: () => ({
    meta: [
      { title: "Patient Billing — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Pharmacy patient directory, insurance policy numbers, co-pay balances, and medical allergy records.",
      },
      { property: "og:title", content: "Patient Billing — Trite Merchant OS" },
    ],
  }),
  component: PatientsPage,
});

const INSURANCE_PILLS = [
  { key: "all", label: "All Patients", activeColor: "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" },
  { key: "NHIS (National Health)", label: "NHIS", activeColor: "bg-emerald-600 text-white" },
  { key: "Glico Health", label: "Glico Health", activeColor: "bg-blue-600 text-white" },
  { key: "Enterprise Life", label: "Enterprise Life", activeColor: "bg-purple-600 text-white" },
  { key: "Private Cash", label: "Private Cash", activeColor: "bg-slate-700 text-white" },
];

function PatientsPage() {
  const [insuranceFilter, setInsuranceFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filtered = PATIENT_RECORDS.filter((patient) => {
    const matchIns = insuranceFilter === "all" || patient.insuranceProvider === insuranceFilter;
    const matchSearch =
      search === "" ||
      patient.name.toLowerCase().includes(search.toLowerCase()) ||
      patient.phone.toLowerCase().includes(search.toLowerCase()) ||
      patient.insuranceNumber.toLowerCase().includes(search.toLowerCase());
    return matchIns && matchSearch;
  });

  return (
    <AppShell
      title="Patient Records & Insurance Billing"
      subtitle={`${PHARMACY_SUMMARY.totalPatientsRegistered} registered patients · ${currency(PHARMACY_SUMMARY.totalOutstandingReceivables)} in outstanding patient balances`}
      actions={
        <Button size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a]">
          <Plus className="size-4" /> Register New Patient
        </Button>
      }
    >
      {/* Stat Summaries */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Patients</p>
            <span className="rounded-full bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <UserRound className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold">{PHARMACY_SUMMARY.totalPatientsRegistered}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Registered profile records</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Insured Patients</p>
            <span className="rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <ShieldCheck className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {PATIENT_RECORDS.filter((p) => p.insuranceProvider !== "Private Cash").length}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">NHIS, Glico & Enterprise</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Outstanding Co-pay</p>
            <span className="rounded-full bg-rose-50 p-2 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <CreditCard className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {currency(PHARMACY_SUMMARY.totalOutstandingReceivables)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Pending patient billing</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Standing</p>
            <span className="rounded-full bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {PATIENT_RECORDS.filter((p) => p.outstandingBalance === 0).length}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Zero balance</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient name, phone or insurance number…"
            className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {INSURANCE_PILLS.map((pill) => {
            const isSelected = insuranceFilter === pill.key;
            return (
              <button
                key={pill.key}
                onClick={() => setInsuranceFilter(pill.key)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                  isSelected ? pill.activeColor : "bg-secondary text-muted-foreground hover:bg-border"
                }`}
              >
                {pill.label}
              </button>
            );
          })}
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((patient) => (
          <div
            key={patient.id}
            className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-muted-foreground/30"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs text-muted-foreground font-semibold">{patient.id}</span>
                  <h3 className="text-lg font-bold">{patient.name}</h3>
                  <p className="text-xs text-muted-foreground">{patient.age} yrs · {patient.gender}</p>
                </div>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-foreground">
                  {patient.insuranceProvider}
                </span>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="size-3.5 shrink-0 opacity-70" />
                  <span>{patient.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="size-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{patient.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-3.5 shrink-0 opacity-70" />
                  <span>Policy #: {patient.insuranceNumber}</span>
                </div>
              </div>

              {/* Allergies & Alerts */}
              <div className="mt-3 rounded-lg bg-rose-50/60 dark:bg-rose-950/40 p-2.5 border border-rose-200/60 dark:border-rose-900/60 text-xs">
                <p className="font-semibold text-rose-700 dark:text-rose-300">Allergies / Alerts:</p>
                <p className="text-rose-600 dark:text-rose-400 font-medium">
                  {patient.allergies.join(", ")}
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Prescriptions</p>
                  <p className="font-semibold">{patient.totalPrescriptions} scripts</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Co-Pay Balance</p>
                  <p className={`font-bold ${patient.outstandingBalance > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {currency(patient.outstandingBalance)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="w-full text-xs">
                  View Medical History
                </Button>
                <Button size="sm" className="w-full bg-[#22c55e] text-white hover:bg-[#16a34a] text-xs">
                  Fill Script
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
