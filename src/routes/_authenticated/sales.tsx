import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  ArrowUpRight,
  ArrowDownRight,
  Download,
  ShoppingCart,
  TrendingUp,
  Banknote,
  RotateCcw,
  Filter,
  X,
  Pill,
  Stethoscope,
  FileText,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";

import { AppShell } from "@/components/app-shell";
import { StatusBadge, payTone } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import {
  activityLineItems,
  activityRows,
  branchName,
  branches as seedBranches,
  currency,
  paymentMixFor,
  seriesFor,
} from "@/lib/mos-data";
import {
  PRESCRIPTIONS,
  PATIENT_RECORDS,
  PHARMACY_SUMMARY,
  type Prescription,
} from "@/lib/pharmacy-data";
import { useBranches } from "@/lib/branches-context";
import { useInstitution } from "@/hooks/use-institution";
import { cn } from "@/lib/utils";

type ActivityRow = (typeof activityRows)[number];

function TransactionModal({ row, onClose }: { row: ActivityRow; onClose: () => void }) {
  const items = activityLineItems[row.id] ?? [];
  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const isRefund = row.amount < 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Transaction ${row.id}`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-card shadow-2xl overflow-hidden">
        {/* Dark header */}
        <div className="px-6 pt-5 pb-4" style={{ background: "oklch(0.213 0.006 17)" }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-block rounded-full bg-white/10 px-2.5 py-0.5 num text-xs font-bold text-white/70">
                {row.id}
              </span>
              <h2 className="mt-1.5 text-xl font-bold leading-tight text-white">{row.what}</h2>
              <p className="mt-0.5 text-sm text-white/60">
                {row.who} · {row.where} · {row.when}
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <X className="size-4 text-white" />
            </button>
          </div>
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-3 gap-px bg-border">
          {[
            { label: "Method", value: row.method },
            { label: "Status", value: row.status },
            { label: "Amount", value: currency(Math.abs(row.amount)) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#22c55e]">{label}</p>
              <p className={cn("mt-0.5 text-sm font-semibold", label === "Amount" && isRefund && "text-red-500")}>
                {label === "Amount" && isRefund ? `−${currency(Math.abs(row.amount))}` : value}
              </p>
            </div>
          ))}
        </div>

        {/* Line items */}
        <div className="px-6 py-4">
          {items.length > 0 ? (
            <>
              <h3 className="mb-3 text-sm font-bold text-[#22c55e] uppercase tracking-wide">Items</h3>
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li key={item.sku} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="font-semibold leading-tight truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.sku} · {currency(item.unitPrice)} each</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="num font-bold text-[#22c55e]">{currency(item.qty * item.unitPrice)}</p>
                      <p className="text-xs text-muted-foreground">× {item.qty}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-sm font-bold">
                <span className="text-[#22c55e]">Total</span>
                <span className="num text-[#22c55e]">{currency(subtotal)}</span>
              </div>
            </>
          ) : (
            <p className="py-2 text-sm text-muted-foreground">
              No line-item breakdown available for this transaction type.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function PrescriptionModal({
  rx,
  onClose,
}: {
  rx: Prescription;
  onClose: () => void;
}) {
  const subtotal = rx.items.reduce((s, i) => s + i.totalPrice, 0);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Prescription ${rx.rxNumber}`}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-card shadow-2xl overflow-hidden">
        <div
          className="px-6 pt-5 pb-4"
          style={{ background: "oklch(0.213 0.006 17)" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-block rounded-full bg-white/10 px-2.5 py-0.5 num text-xs font-bold text-white/70">
                {rx.rxNumber}
              </span>
              <h2 className="mt-1.5 text-xl font-bold leading-tight text-white">
                {rx.patientName}
              </h2>
              <p className="mt-0.5 text-sm text-white/60">
                {rx.doctorName} · {rx.clinic}
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <X className="size-4 text-white" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-px bg-border">
          {[
            { label: "Status", value: rx.status.replace("_", " ") },
            { label: "Date", value: rx.date },
            { label: "Amount", value: currency(rx.totalAmount) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-card px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#22c55e]">
                {label}
              </p>
              <p className="mt-0.5 text-sm font-semibold capitalize">{value}</p>
            </div>
          ))}
        </div>
        <div className="px-6 py-4">
          <h3 className="mb-3 text-sm font-bold text-[#22c55e] uppercase tracking-wide">
            Prescription Items
          </h3>
          <ul className="divide-y divide-border">
            {rx.items.map((it) => (
              <li
                key={it.medicationId}
                className="flex items-center justify-between gap-3 py-2.5 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-semibold leading-tight truncate">
                    {it.drugName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {it.dosage} · {currency(it.unitPrice)} each
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="num font-bold text-[#22c55e]">
                    {currency(it.totalPrice)}
                  </p>
                  <p className="text-xs text-muted-foreground">× {it.quantity}</p>
                </div>
              </li>
            ))}
          </ul>
          {rx.insuranceProvider && (
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-sky-50 dark:bg-sky-950/40 px-3 py-2">
                <p className="font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider text-[10px]">
                  Insurance
                </p>
                <p className="mt-0.5 font-semibold text-sky-800 dark:text-sky-300">
                  {rx.insuranceProvider}
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 px-3 py-2">
                <p className="font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider text-[10px]">
                  Patient Copay
                </p>
                <p className="mt-0.5 num font-bold text-amber-800 dark:text-amber-300">
                  {currency(rx.copayAmount)}
                </p>
              </div>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-sm font-bold">
            <span className="text-[#22c55e]">Total</span>
            <span className="num text-[#22c55e]">{currency(rx.totalAmount)}</span>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground text-center">
            Filled by {rx.pharmacist}
          </p>
        </div>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  activeClass = "border-[#22c55e] bg-[#22c55e] text-white",
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  activeClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors shadow-xs",
        active ? activeClass : "border-border hover:bg-secondary text-foreground",
      )}
    >
      {children}
    </button>
  );
}

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
} as const;

const branchColors: Record<string, string> = {
  all: "bg-emerald-600 text-white border-emerald-600",
  osu: "bg-blue-600 text-white border-blue-600",
  "east-legon": "bg-purple-600 text-white border-purple-600",
  kumasi: "bg-amber-600 text-white border-amber-600",
  takoradi: "bg-teal-600 text-white border-teal-600",
};


const statusColors: Record<string, string> = {
  settled: "bg-emerald-600 text-white border-emerald-600",
  confirmed: "bg-emerald-600 text-white border-emerald-600",
  pending: "bg-amber-500 text-white border-amber-500",
  failed: "bg-red-600 text-white border-red-600",
};

function StatCard({
  label,
  value,
  delta,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta?: number;
  sub: string;
  icon: React.ElementType;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
      <div className="flex items-start justify-between">
        <p className="text-[10px] sm:text-xs font-medium tracking-wide text-muted-foreground uppercase leading-tight pr-1">{label}</p>
        <Icon className="size-3.5 sm:size-4 shrink-0 text-muted-foreground" />
      </div>
      <p className="num mt-2 text-base sm:text-2xl font-bold leading-tight">{value}</p>
      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] sm:text-xs">
        {delta !== undefined && (
          <span
            className={`num inline-flex items-center gap-0.5 font-medium ${up ? "text-foreground" : "text-destructive"}`}
          >
            {up ? <ArrowUpRight className="size-3 sm:size-3.5" /> : <ArrowDownRight className="size-3 sm:size-3.5" />}
            {Math.abs(delta)}%
          </span>
        )}
        <span className="text-muted-foreground leading-tight">{sub}</span>
      </div>
    </div>
  );
}

function SalesPage() {
  const [branchId, setBranchId] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [method, setMethod] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [selectedTxn, setSelectedTxn] = useState<ActivityRow | null>(null);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const { branches } = useBranches();
  const { institutionType } = useInstitution();
  const isPharmacy = institutionType === "pharmacy";

  // ── Pharmacy data ───────────────────────────────────────────────
  const pharmacyTotals = useMemo(() => {
    const rows = PRESCRIPTIONS.filter(
      (p) => !status || p.status === status
    );
    const gross = rows
      .filter((p) => p.status !== "cancelled")
      .reduce((s, p) => s + p.totalAmount, 0);
    const dispensed = rows
      .filter((p) => p.status === "dispensed")
      .reduce((s, p) => s + p.totalAmount, 0);
    const count = rows.length;
    const copays = rows.reduce((s, p) => s + p.copayAmount, 0);
    return { gross, dispensed, count, copays };
  }, [status]);

  const pharmacyRows = useMemo(
    () =>
      PRESCRIPTIONS.filter((p) => !status || p.status === status),
    [status]
  );

  const pharmacySeries = useMemo(() => {
    const basePattern = [0.65, 0.88, 0.72, 1.1, 1.35, 1.55, 0.92];
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return labels.map((day, i) => ({
      day,
      sales: Math.round(7400 * basePattern[i]! * (0.9 + (i % 3) * 0.08)),
      settled: Math.round(7400 * basePattern[i]! * 0.9 * (0.9 + (i % 3) * 0.08)),
    }));
  }, []);

  const pharmacyStatusOptions = ["dispensed", "pending", "partially_filled", "cancelled"];

  // ── Retail / general data ───────────────────────────────────────
  const series = useMemo(() => seriesFor(branchId, "30d"), [branchId]);
  const mix = useMemo(() => paymentMixFor(branchId), [branchId]);

  const saleRows = useMemo(
    () =>
      activityRows
        .filter((a) => branchId === "all" || a.branchId === branchId)
        .filter(
          (a) =>
            !method || a.method.toLowerCase().includes(method.toLowerCase().split(" ")[0]!),
        )
        .filter((a) => !status || a.status === status),
    [branchId, method, status],
  );

  const totals = useMemo(() => {
    const sales = series.reduce((s, r) => s + r.sales, 0);
    const settled = series.reduce((s, r) => s + r.settled, 0);
    const txns = Math.max(1, Math.round(sales / 151));
    const refunds = saleRows
      .filter((r) => r.amount < 0)
      .reduce((s, r) => s + Math.abs(r.amount), 0);
    return { sales, settled, txns, refunds };
  }, [series, saleRows]);

  const activeFilters = [
    branchId !== "all" && { label: branchName(branchId), clear: () => setBranchId("all") },
    method && { label: `Method · ${method}`, clear: () => setMethod(null) },
    status && { label: `Status · ${status}`, clear: () => setStatus(null) },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const clearAll = () => {
    setBranchId("all");
    setDateRange(undefined);
    setMethod(null);
    setStatus(null);
  };

  const rangeLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, "dd MMM")} – ${format(dateRange.to, "dd MMM yyyy")}`
      : format(dateRange.from, "dd MMM yyyy")
    : "Last 30 days";

  if (isPharmacy) {
    return (
      <AppShell
        title="Pharmacy Sales"
        subtitle={`Prescription dispensing & copay revenue · ${rangeLabel}`}
        actions={
          <Button variant="outline" size="sm">
            <Download className="size-4" /> Export
          </Button>
        }
      >
        {selectedRx && (
          <PrescriptionModal rx={selectedRx} onClose={() => setSelectedRx(null)} />
        )}
        <div className="space-y-6">
          {/* ── Pharmacy Mobile KPI Section ── */}
          <section className="space-y-3 lg:hidden">
            <div className="relative overflow-hidden rounded-2xl bg-[#22c55e] p-5 text-white shadow-xs">
              <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <div
                  className="absolute rounded-full bg-white/10"
                  style={{ width: "260px", height: "260px", bottom: "-120px", right: "-60px" }}
                />
              </div>
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">Total Prescription Revenue</p>
                  <div className="rounded-lg border border-white/40 bg-white/10 p-1.5 backdrop-blur-xs">
                    <Pill className="size-5 text-white" />
                  </div>
                </div>
                <p className="num mt-2 text-3xl font-extrabold tracking-tight">
                  {currency(pharmacyTotals.gross)}
                </p>
                <div className="mt-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">
                    Dispensed · {currency(pharmacyTotals.dispensed)}
                  </p>
                  <p className="mt-0.5 text-xs opacity-70">
                    {pharmacyTotals.count} prescriptions · {PATIENT_RECORDS.length} registered patients
                  </p>
                </div>
                <div className="mt-4 flex gap-3">
                  <a
                    href="/dispensary"
                    className="flex-1 rounded-xl bg-[#166534] py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#14532d]"
                  >
                    Dispensary
                  </a>
                  <a
                    href="/inventory"
                    className="flex-1 rounded-xl bg-white/20 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/30"
                  >
                    Inventory
                  </a>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatCard
                label="Prescriptions"
                value={pharmacyTotals.count.toString()}
                delta={12.4}
                sub={`${PRESCRIPTIONS.filter((p) => p.status === "dispensed").length} dispensed`}
                icon={FileText}
              />
              <StatCard
                label="Dispensed"
                value={currency(pharmacyTotals.dispensed)}
                delta={9.8}
                sub="Paid & collected"
                icon={Stethoscope}
              />
              <StatCard
                label="Patient Copays"
                value={currency(pharmacyTotals.copays)}
                sub="this period"
                icon={Banknote}
              />
            </div>
          </section>

          {/* ── Pharmacy Desktop KPI Section ── */}
          <section className="hidden grid-cols-4 gap-4 lg:grid">
            <StatCard
              label="Gross Rx Revenue"
              value={currency(pharmacyTotals.gross)}
              delta={12.4}
              sub="vs previous period"
              icon={Banknote}
            />
            <StatCard
              label="Prescriptions"
              value={pharmacyTotals.count.toString()}
              delta={7.2}
              sub={`${PRESCRIPTIONS.filter((p) => p.status === "pending").length} pending`}
              icon={FileText}
            />
            <StatCard
              label="Dispensed Amount"
              value={currency(pharmacyTotals.dispensed)}
              delta={9.8}
              sub={`${Math.round((pharmacyTotals.dispensed / Math.max(1, pharmacyTotals.gross)) * 100)}% of gross`}
              icon={Stethoscope}
            />
            <StatCard
              label="Patient Copays"
              value={currency(pharmacyTotals.copays)}
              sub="out-of-pocket"
              icon={ShoppingCart}
            />
          </section>

          {/* Filter bar (pharmacy) */}
          <section className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
            <Filter className="size-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-1.5">
              <Chip
                active={status === null}
                onClick={() => setStatus(null)}
              >
                All Status
              </Chip>
              {pharmacyStatusOptions.map((s) => (
                <Chip
                  key={s}
                  active={status === s}
                  onClick={() => setStatus(status === s ? null : s)}
                >
                  {s.replace("_", " ")}
                </Chip>
              ))}
            </div>
            <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            {activeFilters.length > 0 && (
              <div className="ml-auto flex flex-wrap items-center gap-1.5">
                {activeFilters.map((f) => (
                  <button
                    key={f.label}
                    onClick={f.clear}
                    className="inline-flex items-center gap-1 rounded-full border border-accent bg-accent/20 px-2.5 py-1 text-xs font-medium"
                  >
                    {f.label}
                    <X className="size-3" />
                  </button>
                ))}
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  Clear all
                </Button>
              </div>
            )}
          </section>

          {/* Sales Trend + Patient Mix (pharmacy) */}
          <section className="grid gap-4 xl:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4 xl:col-span-3">
              <div className="mb-4">
                <h2 className="text-lg font-bold">Dispensing Trend</h2>
                <p className="text-xs text-muted-foreground">
                  Weekly prescription dispensing revenue across all branches
                </p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pharmacySeries} margin={{ left: -18, right: 4, top: 4 }}>
                    <defs>
                      <linearGradient id="p-sales-trend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.55} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                    <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v)} />
                    <Area name="Revenue" type="monotone" dataKey="sales" stroke="#22c55e" strokeWidth={2} fill="url(#p-sales-trend)" activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="text-lg font-bold">Insurance Mix</h2>
              <p className="text-xs text-muted-foreground mb-4">Payor distribution</p>
              <ul className="space-y-3">
                {[
                  { method: "NHIS (National Health)", value: 45 },
                  { method: "Private Cash", value: 28 },
                  { method: "Glico Health", value: 15 },
                  { method: "Enterprise Life", value: 12 },
                ].map((m) => {
                  const active = method === m.method;
                  return (
                    <li key={m.method}>
                      <button
                        onClick={() => setMethod(active ? null : m.method)}
                        aria-pressed={active}
                        className="w-full rounded-md p-1 text-left transition-colors hover:bg-secondary/70"
                      >
                        <div className="mb-1 flex items-baseline justify-between text-sm">
                          <span className={cn(active && "font-semibold")}>{m.method}</span>
                          <span className="num text-xs text-muted-foreground">{m.value}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                          <div
                            className={cn("h-full rounded-full transition-all", active ? "bg-foreground" : "bg-[#22c55e]")}
                            style={{ width: `${m.value}%` }}
                          />
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          {/* Transactions (pharmacy prescriptions) */}
          <section className="rounded-lg border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
              <div>
                <h2 className="text-lg font-bold">Prescriptions</h2>
                <p className="text-xs text-muted-foreground">
                  {pharmacyRows.length} records · click to view details
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {pharmacyStatusOptions.map((s) => (
                  <Chip
                    key={s}
                    active={status === s}
                    onClick={() => setStatus(status === s ? null : s)}
                  >
                    {s.replace("_", " ")}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <ul className="divide-y divide-border sm:hidden">
                {pharmacyRows.map((p) => (
                  <li
                    key={p.id}
                    className="px-4 py-3 space-y-1 cursor-pointer transition-colors hover:bg-secondary/50"
                    onClick={() => setSelectedRx(p)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="num text-xs font-semibold text-muted-foreground">{p.rxNumber}</span>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                          p.status === "dispensed"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                            : p.status === "pending"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                            : p.status === "partially_filled"
                            ? "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                        )}
                      >
                        {p.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-tight">{p.patientName}</p>
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>{p.items.length} item{p.items.length > 1 ? "s" : ""} · {p.doctorName}</span>
                      <span className="num font-semibold text-foreground">{currency(p.totalAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                      <span className="underline-offset-2 hover:underline">{p.clinic}</span>
                      <span>{p.pharmacist} · {p.date}</span>
                    </div>
                  </li>
                ))}
                {pharmacyRows.length === 0 && (
                  <li className="px-4 py-8 text-center text-sm text-muted-foreground">No prescriptions match these filters.</li>
                )}
              </ul>

              <table className="hidden w-full text-base sm:table">
                <thead>
                  <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
                    <th className="px-4 py-2.5 font-bold">Rx #</th>
                    <th className="px-4 py-2.5 font-bold">Patient</th>
                    <th className="px-4 py-2.5 font-bold">Prescriber</th>
                    <th className="px-4 py-2.5 font-bold">Items</th>
                    <th className="px-4 py-2.5 font-bold">Insurance</th>
                    <th className="px-4 py-2.5 text-right font-bold">Amount</th>
                    <th className="px-4 py-2.5 font-bold">Status</th>
                    <th className="px-4 py-2.5 text-right font-bold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pharmacyRows.map((p) => (
                    <tr
                      key={p.id}
                      className="transition-colors hover:bg-secondary/60 cursor-pointer"
                      onClick={() => setSelectedRx(p)}
                    >
                      <td className="num px-4 py-3 font-medium">{p.rxNumber}</td>
                      <td className="px-4 py-3 font-medium">{p.patientName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.doctorName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.items.length} item{p.items.length > 1 ? "s" : ""}</td>
                      <td className="px-4 py-3 text-xs">{p.insuranceProvider ?? "Cash"}</td>
                      <td className="num px-4 py-3 text-right font-medium">{currency(p.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                            p.status === "dispensed"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                              : p.status === "pending"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                              : p.status === "partially_filled"
                              ? "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                          )}
                        >
                          {p.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{p.date}</td>
                    </tr>
                  ))}
                  {pharmacyRows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">
                        No prescriptions match these filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Sales"
      subtitle={`${branchName(branchId)} · ${rangeLabel}`}
      actions={
        <Button variant="outline" size="sm">
          <Download className="size-4" /> Export
        </Button>
      }
    >
      {selectedTxn && (
        <TransactionModal row={selectedTxn} onClose={() => setSelectedTxn(null)} />
      )}
      <div className="space-y-6">
        {/* ── Mobile KPI Section (Green hero card + 3 stat cards underneath) ── */}
        <section className="space-y-3 lg:hidden">
          {/* Green hero card */}
          <div className="relative overflow-hidden rounded-2xl bg-[#22c55e] p-5 text-white shadow-xs">
            {/* Background decorative circle layer (z-0) */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
              {/* Bottom-right decorative circle */}
              <div
                className="absolute rounded-full bg-white/10"
                style={{ width: "260px", height: "260px", bottom: "-120px", right: "-60px" }}
              />
            </div>

            {/* Foreground content layer (z-10) */}
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">Gross Sales</p>
                <div className="rounded-lg border border-white/40 bg-white/10 p-1.5 backdrop-blur-xs">
                  <Banknote className="size-5 text-white" />
                </div>
              </div>
              <p className="num mt-2 text-3xl font-extrabold tracking-tight">{currency(totals.sales)}</p>

              <div className="mt-3">
                <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">
                  Settled · {currency(totals.settled)}
                </p>
                <p className="mt-0.5 text-xs opacity-70">
                  {Math.round((totals.settled / Math.max(1, totals.sales)) * 100)}% of gross · {totals.txns.toLocaleString()} transactions
                </p>
              </div>

              <div className="mt-4 flex gap-3">
                <a
                  href="/sales"
                  className="flex-1 rounded-xl bg-[#166534] py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#14532d]"
                >
                  Sales
                </a>
                <a
                  href="/inventory"
                  className="flex-1 rounded-xl bg-white/20 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/30"
                >
                  Inventory
                </a>
              </div>
            </div>
          </div>

          {/* 3 stat cards under Gross Sales on mobile */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              label="Transactions"
              value={totals.txns.toLocaleString()}
              delta={5.2}
              sub="avg GHS 151"
              icon={ShoppingCart}
            />
            <StatCard
              label="Settled"
              value={currency(totals.settled)}
              delta={9.8}
              sub={`${Math.round((totals.settled / Math.max(1, totals.sales)) * 100)}% of gross`}
              icon={TrendingUp}
            />
            <StatCard
              label="Refunds issued"
              value={currency(totals.refunds)}
              sub="this period"
              icon={RotateCcw}
            />
          </div>
        </section>

        {/* ── Desktop KPI Section (4 cards in a single row) ── */}
        <section className="hidden grid-cols-4 gap-4 lg:grid">
          <StatCard
            label="Gross sales"
            value={currency(totals.sales)}
            delta={12.4}
            sub="vs previous period"
            icon={Banknote}
          />
          <StatCard
            label="Transactions"
            value={totals.txns.toLocaleString()}
            delta={5.2}
            sub="avg GHS 151"
            icon={ShoppingCart}
          />
          <StatCard
            label="Settled"
            value={currency(totals.settled)}
            delta={9.8}
            sub={`${Math.round((totals.settled / Math.max(1, totals.sales)) * 100)}% of gross`}
            icon={TrendingUp}
          />
          <StatCard
            label="Refunds issued"
            value={currency(totals.refunds)}
            sub="this period"
            icon={RotateCcw}
          />
        </section>

        {/* Filter bar */}
        <section className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
          <Filter className="size-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-1.5">
            {branches.map((b) => (
              <Chip
                key={b.id}
                active={branchId === b.id}
                onClick={() => setBranchId(b.id)}
                {...(branchColors[b.id] ? { activeClass: branchColors[b.id] } : {})}
              >
                {b.id === "all" ? "All branches" : b.name}
              </Chip>
            ))}
          </div>
          <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          {activeFilters.length > 0 && (
            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              {activeFilters.map((f) => (
                <button
                  key={f.label}
                  onClick={f.clear}
                  className="inline-flex items-center gap-1 rounded-full border border-accent bg-accent/20 px-2.5 py-1 text-xs font-medium"
                >
                  {f.label}
                  <X className="size-3" />
                </button>
              ))}
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear all
              </Button>
            </div>
          )}
        </section>

        <section className="grid gap-4 xl:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4 xl:col-span-3">
            <div className="mb-4">
              <h2 className="text-lg font-bold">Sales trend</h2>
              <p className="text-xs text-muted-foreground">
                Daily gross sales for {branchName(branchId)} over the selected period
              </p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ left: -18, right: 4, top: 4 }}>
                  <defs>
                    <linearGradient id="g-sales-trend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                  <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v)} />
                  <Area name="Sales" type="monotone" dataKey="sales" stroke="var(--color-accent)" strokeWidth={2} fill="url(#g-sales-trend)" activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-lg font-bold">Payment methods</h2>
            <p className="text-xs text-muted-foreground mb-4">Click to filter transactions</p>
            <ul className="space-y-3">
              {mix.map((m) => {
                const active = method === m.method;
                return (
                  <li key={m.method}>
                    <button
                      onClick={() => setMethod(active ? null : m.method)}
                      aria-pressed={active}
                      className="w-full rounded-md p-1 text-left transition-colors hover:bg-secondary/70"
                    >
                      <div className="mb-1 flex items-baseline justify-between text-sm">
                        <span className={cn(active && "font-semibold")}>{m.method}</span>
                        <span className="num text-xs text-muted-foreground">{m.value}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={cn("h-full rounded-full transition-all", active ? "bg-foreground" : "bg-accent")}
                          style={{ width: `${m.value}%` }}
                        />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
            <div>
              <h2 className="text-lg font-bold">Transactions</h2>
              <p className="text-xs text-muted-foreground">
                {saleRows.length} records · click a status to filter
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["settled", "confirmed", "pending", "failed"].map((s) => (
                <Chip
                  key={s}
                  active={status === s}
                  onClick={() => setStatus(status === s ? null : s)}
                  {...(statusColors[s] ? { activeClass: statusColors[s] } : {})}
                >
                  {s}
                </Chip>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            {/* ── Mobile: card list ── */}
            <ul className="divide-y divide-border sm:hidden">
              {saleRows.map((a) => (
                <li
                  key={a.id}
                  className="px-4 py-3 space-y-1 cursor-pointer transition-colors hover:bg-secondary/50"
                  onClick={() => setSelectedTxn(a)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="num text-xs font-semibold text-muted-foreground">{a.id}</span>
                    <button onClick={(e) => { e.stopPropagation(); setStatus(status === a.status ? null : a.status); }}>
                      <StatusBadge tone={payTone[a.status] ?? "neutral"}>{a.status}</StatusBadge>
                    </button>
                  </div>
                  <p className="text-sm font-medium leading-tight">{a.what}</p>
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{a.who}</span>
                    <span className={cn("num font-semibold", a.amount < 0 ? "text-destructive" : "text-foreground")}>{currency(a.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                    <button onClick={(e) => { e.stopPropagation(); setBranchId(a.branchId); }} className="underline-offset-2 hover:underline">{a.where}</button>
                    <span>{a.method} · {a.when}</span>
                  </div>
                </li>
              ))}
              {saleRows.length === 0 && (
                <li className="px-4 py-8 text-center text-sm text-muted-foreground">No transactions match these filters.</li>
              )}
            </ul>

            {/* ── Desktop: full table ── */}
            <table className="hidden w-full text-base sm:table">
              <thead>
                <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="px-4 py-2.5 font-bold">Reference</th>
                  <th className="px-4 py-2.5 font-bold">Event</th>
                  <th className="px-4 py-2.5 font-bold">Cashier</th>
                  <th className="px-4 py-2.5 font-bold">Branch</th>
                  <th className="px-4 py-2.5 font-bold">Method</th>
                  <th className="px-4 py-2.5 text-right font-bold">Amount</th>
                  <th className="px-4 py-2.5 font-bold">Status</th>
                  <th className="px-4 py-2.5 text-right font-bold">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {saleRows.map((a) => (
                  <tr
                    key={a.id}
                    className="transition-colors hover:bg-secondary/60 cursor-pointer"
                    onClick={() => setSelectedTxn(a)}
                  >
                    <td className="num px-4 py-3 font-medium">{a.id}</td>
                    <td className="px-4 py-3 font-medium">{a.what}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.who}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setBranchId(a.branchId); }}
                        className="text-muted-foreground underline-offset-2 hover:underline"
                      >
                        {a.where}
                      </button>
                    </td>
                    <td className="px-4 py-3">{a.method}</td>
                    <td className={cn("num px-4 py-3 text-right font-medium", a.amount < 0 && "text-destructive")}>
                      {currency(a.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setStatus(status === a.status ? null : a.status); }}
                      >
                        <StatusBadge tone={payTone[a.status] ?? "neutral"}>{a.status}</StatusBadge>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{a.when}</td>
                  </tr>
                ))}
                {saleRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      No transactions match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

// Route exported after SalesPage so TypeScript can resolve the component reference.
export const Route = createFileRoute("/_authenticated/sales")({
  head: () => ({
    meta: [
      { title: "Trite Merchant OS — Sales" },
      {
        name: "description",
        content: "View all sales transactions across branches, filtered by date range, payment method, and status.",
      },
      { property: "og:title", content: "Trite Merchant OS — Sales" },
    ],
  }),
  component: SalesPage,
});
