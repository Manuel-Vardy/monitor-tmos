import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Wallet,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Zap,
  Sparkles,
  Utensils,
  Wrench,
  Users,
  Megaphone,
  FileSpreadsheet,
  BookOpen,
  FlaskConical,
  Building2,
  Globe,
  Truck,
  HeartPulse,
  GraduationCap,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { currency } from "@/lib/mos-data";
import { useInstitution } from "@/hooks/use-institution";
import {
  HOTEL_EXPENSES,
  HOTEL_EXPENSE_SUMMARY,
  type HotelExpense,
} from "@/lib/hotel-data";
import { SCHOOL_EXPENSES, type SchoolExpense } from "@/lib/school-data";
import { BUDGET_APPROVALS, type BudgetApproval } from "@/lib/ngo-data";

export const Route = createFileRoute("/_authenticated/expenses")({
  head: () => ({
    meta: [
      { title: "Expenses — Trite Merchant OS" },
      {
        name: "description",
        content: "Operational expense management and voucher approvals.",
      },
    ],
  }),
  component: ExpensesPage,
});

// ─── Hotel config ─────────────────────────────────────────────────────────────
type HotelCategory = HotelExpense["category"];
const HOTEL_CATEGORY_CONFIG: Record<HotelCategory, { icon: React.ElementType; color: string; bg: string }> = {
  "Utilities & Fuel":        { icon: Zap,       color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200" },
  "Housekeeping Supplies":   { icon: Sparkles,  color: "text-blue-600 dark:text-blue-400",     bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200" },
  "F&B Procurement":         { icon: Utensils,  color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/40 border-orange-200" },
  "Maintenance & Repairs":   { icon: Wrench,    color: "text-slate-600 dark:text-slate-400",   bg: "bg-slate-50 dark:bg-slate-950/40 border-slate-200" },
  "Staff & Wages":           { icon: Users,     color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200" },
  "Marketing & Commissions": { icon: Megaphone, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200" },
};

// ─── School config ────────────────────────────────────────────────────────────
type SchoolCategory = SchoolExpense["category"];
const SCHOOL_CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  "Utilities & Fuel":        { icon: Zap,          color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200" },
  "Lab Supplies":            { icon: FlaskConical, color: "text-blue-600 dark:text-blue-400",     bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200" },
  "Textbooks & Exam Papers": { icon: BookOpen,     color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200" },
  "Facility Maintenance":    { icon: Wrench,       color: "text-slate-600 dark:text-slate-400",   bg: "bg-slate-50 dark:bg-slate-950/40 border-slate-200" },
  "Staff & Payroll":         { icon: Users,        color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200" },
  "Transport":               { icon: Truck,        color: "text-teal-600 dark:text-teal-400",     bg: "bg-teal-50 dark:bg-teal-950/40 border-teal-200" },
};

// ─── NGO config ───────────────────────────────────────────────────────────────
type NgoCategory = BudgetApproval["category"];
const NGO_CATEGORY_CONFIG: Record<NgoCategory, { icon: React.ElementType; color: string; bg: string }> = {
  "Field Operations":       { icon: Globe,        color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200" },
  "Medical Supplies":       { icon: HeartPulse,   color: "text-red-600 dark:text-red-400",         bg: "bg-red-50 dark:bg-red-950/40 border-red-200" },
  "Educational Materials":  { icon: GraduationCap,color: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200" },
  "Community Training":     { icon: Users,        color: "text-purple-600 dark:text-purple-400",   bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200" },
  "Logistics":              { icon: Truck,        color: "text-orange-600 dark:text-orange-400",   bg: "bg-orange-50 dark:bg-orange-950/40 border-orange-200" },
};

const STATUS_COLORS = {
  Approved:          { label: "Approved",         color: "text-emerald-600 font-semibold", bg: "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200", pill: "bg-emerald-600 text-white", icon: CheckCircle2 },
  "Pending Approval":{ label: "Pending Approval", color: "text-amber-600 font-semibold",  bg: "bg-amber-50 dark:bg-amber-950/50 border border-amber-200",   pill: "bg-amber-600 text-white",   icon: Clock },
};

// ─── Unified expense shape ────────────────────────────────────────────────────
interface GenericExpense {
  id: string;
  voucherNo: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  approvedBy: string;
  status: "Approved" | "Pending Approval";
  extra?: string; // e.g. related room, project code
}

function normaliseSchool(e: SchoolExpense): GenericExpense {
  return {
    id: e.id,
    voucherNo: e.voucherNo,
    category: e.category,
    description: e.description,
    amount: e.amount,
    date: e.date,
    approvedBy: e.approvedBy,
    status: e.status as "Approved" | "Pending Approval",
  };
}

function normaliseNgo(b: BudgetApproval): GenericExpense {
  return {
    id: b.id,
    voucherNo: b.requestNo,
    category: b.category,
    description: `${b.projectName} — ${b.category} requisition`,
    amount: b.amountRequested,
    date: b.date,
    approvedBy: b.approvedBy || b.requestedBy,
    status: b.status as "Approved" | "Pending Approval",
    extra: b.projectCode,
  };
}

function normaliseHotel(e: HotelExpense): GenericExpense {
  return {
    id: e.id,
    voucherNo: e.voucherNo,
    category: e.category,
    description: e.description,
    amount: e.amount,
    date: e.date,
    approvedBy: e.approvedBy,
    status: e.status as "Approved" | "Pending Approval",
    extra: e.relatedRoom,
  };
}

function ExpensesPage() {
  const { institutionType } = useInstitution();
  const [statusFilter, setStatusFilter] = useState<"all" | "Approved" | "Pending Approval">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Pick data & config based on institution
  const isSchool = institutionType === "school";
  const isNgo   = institutionType === "ngo";
  const isHotel = institutionType === "hotel";

  const rawExpenses: GenericExpense[] = isSchool
    ? SCHOOL_EXPENSES.map(normaliseSchool)
    : isNgo
    ? BUDGET_APPROVALS.map(normaliseNgo)
    : HOTEL_EXPENSES.map(normaliseHotel);

  const categoryConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> =
    isSchool ? SCHOOL_CATEGORY_CONFIG
    : isNgo   ? NGO_CATEGORY_CONFIG
    : HOTEL_CATEGORY_CONFIG;

  const pageTitle = isSchool
    ? "School Expense Vouchers"
    : isNgo
    ? "Field Budget Requisitions"
    : "Hotel Operational Expenses";

  const pageSubtitle = isSchool
    ? `${SCHOOL_EXPENSES.length} vouchers this term · ${currency(SCHOOL_EXPENSES.reduce((a, e) => a + e.amount, 0))} total spend`
    : isNgo
    ? `${BUDGET_APPROVALS.length} budget requests · ${currency(BUDGET_APPROVALS.reduce((a, b) => a + b.amountRequested, 0))} total requested`
    : `${HOTEL_EXPENSES.length} vouchers · ${currency(HOTEL_EXPENSE_SUMMARY.totalExpenses)} total operational spend`;

  const primaryActionLabel = isSchool ? "Raise Expense Voucher" : isNgo ? "New Budget Request" : "Raise Expense Voucher";
  const extraLabel         = isSchool ? "Staff Payroll" : isNgo ? "Project Directory" : "Guest Folios";
  const extraLink          = isSchool ? "/payroll" : isNgo ? "/projects" : "/payments";

  const filtered = rawExpenses.filter((exp) => {
    const matchStatus = statusFilter === "all" || exp.status === statusFilter;
    const matchSearch =
      search === "" ||
      exp.voucherNo.toLowerCase().includes(search.toLowerCase()) ||
      exp.description.toLowerCase().includes(search.toLowerCase()) ||
      exp.category.toLowerCase().includes(search.toLowerCase()) ||
      exp.approvedBy.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalShown   = filtered.reduce((a, e) => a + e.amount, 0);
  const approvedList = rawExpenses.filter((e) => e.status === "Approved");
  const pendingList  = rawExpenses.filter((e) => e.status === "Pending Approval");

  return (
    <AppShell
      title={pageTitle}
      subtitle={pageSubtitle}
      actions={
        <div className="flex items-center gap-2">
          <Link to={extraLink}>
            <Button size="sm" variant="outline" className="h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm">
              <FileSpreadsheet className="size-3.5 sm:size-4" />
              <span className="hidden sm:inline">{extraLabel}</span>
            </Button>
          </Link>
          <Button size="sm" className="h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm bg-[#22c55e] text-white hover:bg-[#16a34a] shrink-0">
            <Plus className="size-3.5 sm:size-4" />
            <span className="hidden sm:inline">{primaryActionLabel}</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      }
    >
      {/* Stat Cards */}
      <div className="mb-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Spend</p>
            <span className="rounded-full bg-slate-100 p-1.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Wallet className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold">{currency(rawExpenses.reduce((a, e) => a + e.amount, 0))}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{isNgo ? "Budget requested" : "This period"}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Approved</p>
            <span className="rounded-full bg-emerald-50 p-1.5 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {approvedList.length} {isNgo ? "requests" : "vouchers"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{currency(approvedList.reduce((a, e) => a + e.amount, 0))}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pending</p>
            <span className="rounded-full bg-amber-50 p-1.5 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Clock className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {pendingList.length} {isNgo ? "requests" : "vouchers"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Awaiting approval</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Showing</p>
            <span className="rounded-full bg-blue-50 p-1.5 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <FileSpreadsheet className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{currency(totalShown)}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{filtered.length} in view</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 space-y-2.5">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isNgo ? "Search request #, project, category…" : "Search voucher #, description, category…"}
            className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(["all", "Approved", "Pending Approval"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                statusFilter === s
                  ? s === "Approved"
                    ? "bg-emerald-600 text-white"
                    : s === "Pending Approval"
                    ? "bg-amber-600 text-white"
                    : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-secondary text-muted-foreground hover:bg-border"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
          <div className="shrink-0">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>
      </div>

      {/* Expense Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((exp) => {
          const catCfg = categoryConfig[exp.category] ?? {
            icon: Building2,
            color: "text-muted-foreground",
            bg: "bg-secondary border-border",
          };
          const CatIcon = catCfg.icon;
          const stCfg = STATUS_COLORS[exp.status];
          const StIcon = stCfg.icon;

          return (
            <div
              key={exp.id}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-muted-foreground/30 shadow-2xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`rounded-lg border p-2 ${catCfg.bg} ${catCfg.color}`}>
                      <CatIcon className="size-4" />
                    </span>
                    <div>
                      <span className="font-mono text-xs text-muted-foreground font-semibold">{exp.voucherNo}</span>
                      <p className="text-xs font-semibold text-muted-foreground mt-0.5">{exp.category}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ${stCfg.bg} ${stCfg.color}`}>
                    <StIcon className="size-3" />
                    {stCfg.label}
                  </span>
                </div>

                <p className="mt-4 text-sm font-medium text-foreground leading-snug">{exp.description}</p>

                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Date</span>
                    <span className="font-medium text-foreground">{exp.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isNgo ? "Requested By" : "Approved By"}</span>
                    <span className="font-medium text-foreground">{exp.approvedBy}</span>
                  </div>
                  {exp.extra && (
                    <div className="flex justify-between">
                      <span>{isNgo ? "Project Code" : "Related Room"}</span>
                      <span className="font-medium text-foreground">{exp.extra}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <span className="text-xs text-muted-foreground">{isNgo ? "Amount Requested" : "Total Amount"}</span>
                <span className="text-xl font-bold text-foreground">{currency(exp.amount)}</span>
              </div>

              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="w-full text-xs">
                  {isNgo ? "View Request" : "View Voucher"}
                </Button>
                {exp.status === "Pending Approval" && (
                  <Button size="sm" className="w-full bg-[#22c55e] text-white hover:bg-[#16a34a] text-xs">
                    Approve
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-sm text-muted-foreground">
            No expense records match your filters.
          </div>
        )}
      </div>
    </AppShell>
  );
}
