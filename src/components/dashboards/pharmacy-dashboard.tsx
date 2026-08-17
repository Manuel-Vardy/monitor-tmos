import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CreditCard,
  Pill,
  ShieldCheck,
  Plus,
  UserRound,
  PackageSearch,
  CheckCircle2,
  Clock,
  Bell,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { KpiCard } from "@/components/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/mos-data";
import {
  PRESCRIPTIONS,
  PATIENT_RECORDS,
  PHARMACY_MEDICATIONS,
  PHARMACY_SUMMARY,
} from "@/lib/pharmacy-data";

export function PharmacyDashboard() {
  return (
    <AppShell
      title="Pharmacy & Dispensary Operations"
      subtitle="Prescription queue, patient insurance claims, medication stock levels & expiry tracking"
      actions={
        <div className="hidden lg:flex flex-wrap items-center gap-2">
          <Link to="/dispensary">
            <Button size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a]">
              <Plus className="size-4" /> New Prescription
            </Button>
          </Link>
          <Link to="/patients">
            <Button size="sm" variant="outline">
              <UserRound className="size-4" /> Patient Records
            </Button>
          </Link>
          <Link to="/purchasing">
            <Button size="sm" variant="outline">
              <PackageSearch className="size-4" /> Stock Restock
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Mobile: green hero card + 4 stat cards underneath */}
        <div className="lg:hidden space-y-3">
          {/* Greeting row */}
          <div className="flex items-center justify-between px-0.5">
            <div>
              <p className="text-xs text-muted-foreground">Good morning 🌤</p>
              <h2 className="text-xl font-bold leading-tight">Pharmacy</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 shadow-xs">
                <span className="size-1.5 rounded-full bg-emerald-500" /> Live
              </span>
              <button className="relative grid size-9 place-items-center rounded-full bg-card shadow-xs border border-border">
                <Bell className="size-4" />
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500" />
              </button>
            </div>
          </div>

          {/* Green hero card — Pending Dispensary Scripts */}
          <div className="relative overflow-hidden rounded-2xl bg-[#22c55e] p-5 text-white shadow-lg">
            {/* decorative circle */}
            <div
              className="pointer-events-none absolute rounded-full bg-white/10"
              style={{ width: "260px", height: "260px", bottom: "-120px", right: "-60px" }}
            />

            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <p className="text-[11px] font-bold tracking-widest uppercase text-white/80">Pending Dispensary Scripts</p>
                <Pill className="size-6 opacity-70" />
              </div>
              <p className="num mt-2 text-3xl font-extrabold leading-none tracking-tight">
                {PHARMACY_SUMMARY.totalPendingDispensary}
              </p>
              <div className="mt-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/80">
                  Script Revenue · {currency(PHARMACY_SUMMARY.totalPrescriptionRevenue)}
                </p>
                <p className="mt-0.5 text-xs text-white/75">
                  +8.5% · {PHARMACY_SUMMARY.totalDispensedToday} dispensed today
                </p>
              </div>

              {/* Full-width action buttons matching style */}
              <div className="mt-4 flex gap-3">
                <Link to="/dispensary" className="flex-1">
                  <span className="block rounded-xl bg-[#166534] py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#14532d]">
                    New Prescription
                  </span>
                </Link>
                <Link to="/patients" className="flex-1">
                  <span className="block rounded-xl bg-white/20 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/30">
                    Patient Records
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* 4 stat cards below the hero */}
          <div className="grid grid-cols-2 gap-2.5">
            <KpiCard
              label="Pending Dispensary Scripts"
              value={PHARMACY_SUMMARY.totalPendingDispensary}
              delta={8.5}
              sub={`${PHARMACY_SUMMARY.totalDispensedToday} dispensed today`}
              icon={Pill}
            />
            <KpiCard
              label="Prescription Revenue"
              value={currency(PHARMACY_SUMMARY.totalPrescriptionRevenue)}
              sub="total script value"
              icon={ShieldCheck}
            />
            <KpiCard
              label="Patient Co-pay Receivables"
              value={currency(PHARMACY_SUMMARY.totalOutstandingReceivables)}
              sub={`${PATIENT_RECORDS.filter((p) => p.outstandingBalance > 0).length} accounts open`}
              icon={CreditCard}
            />
            <KpiCard
              label="Registered Patients"
              value={PHARMACY_SUMMARY.totalPatientsRegistered}
              sub="NHIS & Private Insured"
              icon={UserRound}
            />
          </div>
        </div>

        {/* Desktop: standard 4-column KPI grid */}
        <div className="hidden lg:grid grid-cols-4 gap-3">
          <KpiCard
            label="Pending Dispensary Scripts"
            value={PHARMACY_SUMMARY.totalPendingDispensary}
            delta={8.5}
            sub={`${PHARMACY_SUMMARY.totalDispensedToday} dispensed today`}
            icon={Pill}
          />
          <KpiCard
            label="Prescription Revenue"
            value={currency(PHARMACY_SUMMARY.totalPrescriptionRevenue)}
            sub="total script value"
            icon={ShieldCheck}
          />
          <KpiCard
            label="Patient Co-pay Receivables"
            value={currency(PHARMACY_SUMMARY.totalOutstandingReceivables)}
            sub={`${PATIENT_RECORDS.filter((p) => p.outstandingBalance > 0).length} accounts with open balance`}
            icon={CreditCard}
          />
          <KpiCard
            label="Registered Patients"
            value={PHARMACY_SUMMARY.totalPatientsRegistered}
            sub="NHIS & Private Insured"
            icon={UserRound}
          />
        </div>

        {/* Operations Overview Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Live Pending Prescriptions */}
          <Card className="p-0 overflow-hidden shadow-none">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <Pill className="size-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-semibold">Dispensary Script Queue</h2>
              </div>
              <Link to="/dispensary" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                View All Scripts →
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {PRESCRIPTIONS.map((rx) => (
                <li key={rx.id} className="flex items-start justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{rx.patientName}</span>
                      <span className="text-xs text-muted-foreground font-mono">{rx.rxNumber}</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {rx.items.map((i) => `${i.drugName} (${i.quantity} units)`).join(", ")}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      rx.status === "dispensed"
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200"
                        : "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200"
                    }`}
                  >
                    {rx.status === "dispensed" ? "Dispensed" : "Pending Fill"}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Patient Insurance & Co-pay Balances */}
          <Card className="p-0 overflow-hidden shadow-none">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-sm font-semibold">Patient Insurance & Balances</h2>
              </div>
              <Link to="/patients" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                Patient Directory →
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {PATIENT_RECORDS.map((pat) => (
                <li key={pat.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div>
                    <p className="font-semibold text-sm">{pat.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {pat.insuranceProvider} · {pat.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase text-[10px]">Co-pay Balance</p>
                    <p className={`font-bold text-sm ${pat.outstandingBalance > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {currency(pat.outstandingBalance)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Medication Inventory & Expiry Alerts */}
        <Card className="p-5 shadow-none">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-500" />
              <h2 className="text-sm font-semibold">Medication Expiry & Stock Levels</h2>
            </div>
            <Link to="/inventory">
              <Button size="sm" variant="outline" className="text-xs">
                View Full Drug Inventory
              </Button>
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5">Drug & Brand Name</th>
                  <th className="px-4 py-2.5">Category</th>
                  <th className="px-4 py-2.5">Batch #</th>
                  <th className="px-4 py-2.5">Expiry Date</th>
                  <th className="px-4 py-2.5">Unit Price</th>
                  <th className="px-4 py-2.5 text-right">Stock Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {PHARMACY_MEDICATIONS.map((med) => (
                  <tr key={med.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">{med.brandName}</p>
                      <p className="text-xs text-muted-foreground">{med.drugName} ({med.strength})</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{med.category}</td>
                    <td className="px-4 py-3 font-mono text-xs">{med.batchNumber}</td>
                    <td className="px-4 py-3 text-muted-foreground">{med.expiryDate}</td>
                    <td className="px-4 py-3 font-semibold">{currency(med.unitPrice)}</td>
                    <td className="px-4 py-3 text-right font-bold">{med.stockLevel} units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
