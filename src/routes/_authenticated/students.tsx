import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  GraduationCap,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  ChevronDown,
  ChevronRight,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { currency } from "@/lib/mos-data";
import {
  SCHOOL_STUDENTS,
  SCHOOL_SUMMARY,
  GRADE_ORDER,
  GRADE_SECTIONS,
  type Student,
  type GradeClass,
} from "@/lib/school-data";

export const Route = createFileRoute("/_authenticated/students")({
  head: () => ({
    meta: [
      { title: "Students — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Student enrollment directory grouped by class from Creche to JHS 3, guardian contacts, tuition fee balances, and payment standing.",
      },
      { property: "og:title", content: "Students — Trite Merchant OS" },
    ],
  }),
  component: StudentsPage,
});

type Standing = Student["status"];

const STATUS_CONFIG: Record<
  Standing,
  { label: string; icon: React.ElementType; color: string; bg: string; activePill: string }
> = {
  "Paid Full": {
    label: "Paid Full",
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400 font-semibold",
    bg: "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800",
    activePill: "bg-emerald-600 text-white",
  },
  "Partial Payment": {
    label: "Partial Payment",
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400 font-semibold",
    bg: "bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800",
    activePill: "bg-amber-600 text-white",
  },
  Overdue: {
    label: "Overdue",
    icon: AlertCircle,
    color: "text-rose-600 dark:text-rose-400 font-semibold",
    bg: "bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800",
    activePill: "bg-rose-600 text-white",
  },
};

const SECTION_COLORS: Record<string, { border: string; badge: string; badgeText: string; sectionBg: string }> = {
  "Early Childhood": {
    border: "border-purple-400 dark:border-purple-600",
    badge: "bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300",
    badgeText: "text-purple-700 dark:text-purple-300",
    sectionBg: "bg-purple-50/50 dark:bg-purple-950/20",
  },
  "Kindergarten": {
    border: "border-blue-400 dark:border-blue-600",
    badge: "bg-blue-100 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300",
    badgeText: "text-blue-700 dark:text-blue-300",
    sectionBg: "bg-blue-50/50 dark:bg-blue-950/20",
  },
  "Primary School": {
    border: "border-amber-400 dark:border-amber-600",
    badge: "bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300",
    badgeText: "text-amber-700 dark:text-amber-300",
    sectionBg: "bg-amber-50/50 dark:bg-amber-950/20",
  },
  "Junior High School (JHS)": {
    border: "border-emerald-400 dark:border-emerald-600",
    badge: "bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    sectionBg: "bg-emerald-50/50 dark:bg-emerald-950/20",
  },
};

function StudentCard({ s }: { s: Student }) {
  const cfg = STATUS_CONFIG[s.status];
  const Icon = cfg.icon;
  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-muted-foreground/30">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="font-mono text-[10px] text-muted-foreground font-semibold">{s.studentId}</span>
            <h3 className="truncate text-sm font-bold">{s.name}</h3>
          </div>
          <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] leading-none ${cfg.bg} ${cfg.color}`}>
            <Icon className="size-3" />
            {cfg.label}
          </span>
        </div>

        <div className="mt-2.5 space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="size-3 shrink-0" />
            <span className="truncate">{s.guardianName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="size-3 shrink-0" />
            <span>{s.guardianPhone}</span>
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-secondary/40 p-2.5 space-y-0.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fee:</span>
            <span className="font-medium">{currency(s.tuitionFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paid:</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">{currency(s.paidAmount)}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-border/50">
            <span className="font-semibold">Balance:</span>
            <span className={`font-bold ${s.balanceDue > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {currency(s.balanceDue)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-1.5">
        <Button size="sm" variant="outline" className="w-full text-xs h-7">Statement</Button>
        <Button size="sm" className="w-full bg-[#22c55e] text-white hover:bg-[#16a34a] text-xs h-7">
          Fee
        </Button>
      </div>
    </div>
  );
}

function ClassGroup({
  gradeClass,
  students,
  sectionColor,
}: {
  gradeClass: GradeClass;
  students: Student[];
  sectionColor: typeof SECTION_COLORS[string];
}) {
  const [open, setOpen] = useState(true);
  if (students.length === 0) return null;

  const totalFee = students.reduce((a, s) => a + s.tuitionFee, 0);
  const totalPaid = students.reduce((a, s) => a + s.paidAmount, 0);
  const totalBalance = students.reduce((a, s) => a + s.balanceDue, 0);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Class Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-secondary/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          {open ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
          <h3 className="text-sm font-bold">{gradeClass}</h3>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${sectionColor.badge}`}>
            <Users className="inline size-3 mr-1" />
            {students.length} {students.length === 1 ? "student" : "students"}
          </span>
        </div>
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <div className="hidden sm:block">
            <span className="text-[10px] uppercase tracking-wide block">Collected</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{currency(totalPaid)}</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-[10px] uppercase tracking-wide block">Outstanding</span>
            <span className={`font-bold ${totalBalance > 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"}`}>
              {currency(totalBalance)}
            </span>
          </div>
          <div className="hidden md:block">
            <span className="text-[10px] uppercase tracking-wide block">Total Fees</span>
            <span className="font-semibold">{currency(totalFee)}</span>
          </div>
        </div>
      </button>

      {/* Students Grid */}
      {open && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {students.map((s) => (
              <StudentCard key={s.id} s={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StudentsPage() {
  const [statusFilter, setStatusFilter] = useState<Standing | "all">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Filter students
  const filtered = SCHOOL_STUDENTS.filter((s) => {
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    const matchSearch =
      search === "" ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase()) ||
      s.guardianName.toLowerCase().includes(search.toLowerCase()) ||
      s.gradeClass.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <AppShell
      title="Student Enrollment Directory"
      subtitle={`${SCHOOL_SUMMARY.totalStudentsCount} enrolled students · Creche to JHS 3 · ${currency(SCHOOL_SUMMARY.totalOutstandingFees)} in pending tuition balance`}
      actions={
        <Button size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a]">
          <Plus className="size-4" /> Enroll New Student
        </Button>
      }
    >
      {/* Stat Cards */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Students</p>
            <span className="rounded-full bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <GraduationCap className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold">{SCHOOL_SUMMARY.totalStudentsCount}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Creche → JHS 3 · Term 3</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tuition Collected</p>
            <span className="rounded-full bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {currency(SCHOOL_SUMMARY.totalFeesCollected)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Fees received this term</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Fee Arrears</p>
            <span className="rounded-full bg-rose-50 p-2 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <AlertCircle className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {currency(SCHOOL_SUMMARY.totalOutstandingFees)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Unpaid tuition balance</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Cleared Students</p>
            <span className="rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Users className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {SCHOOL_STUDENTS.filter((s) => s.status === "Paid Full").length}
            <span className="text-sm font-normal text-muted-foreground"> / {SCHOOL_STUDENTS.length}</span>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">100% fees paid</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student name, class, ID or guardian…"
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
            All Students
          </button>
          {(Object.keys(STATUS_CONFIG) as Standing[]).map((st) => {
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

      {/* Students grouped by section → class */}
      <div className="space-y-8">
        {GRADE_SECTIONS.map((section) => {
          const sectionColor = SECTION_COLORS[section.label] ?? {
            border: "border-slate-200 dark:border-slate-800",
            badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
            badgeText: "text-slate-700 dark:text-slate-300",
            sectionBg: "bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800",
          };
          // Only show classes that have matching students
          const classesWithStudents = section.classes.filter((cls) =>
            filtered.some((s) => s.gradeClass === cls)
          );
          if (classesWithStudents.length === 0) return null;

          const sectionStudents = filtered.filter((s) => section.classes.includes(s.gradeClass));

          return (
            <div key={section.label}>
              {/* Section Banner */}
              <div className={`mb-4 flex items-center gap-3 rounded-lg px-4 py-2.5 ${sectionColor.sectionBg}`}>
                <h2 className={`text-sm font-bold uppercase tracking-wider ${sectionColor.badgeText}`}>
                  {section.label}
                </h2>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${sectionColor.badge}`}>
                  {sectionStudents.length} students
                </span>
                <div className="ml-auto flex items-center gap-4 text-xs">
                  <span className="text-muted-foreground">
                    Collected: <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {currency(sectionStudents.reduce((a, s) => a + s.paidAmount, 0))}
                    </span>
                  </span>
                  <span className="text-muted-foreground hidden sm:block">
                    Arrears: <span className={`font-bold ${sectionStudents.some(s => s.balanceDue > 0) ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"}`}>
                      {currency(sectionStudents.reduce((a, s) => a + s.balanceDue, 0))}
                    </span>
                  </span>
                </div>
              </div>

              {/* Class groups within section */}
              <div className="space-y-3">
                {classesWithStudents.map((cls) => (
                  <ClassGroup
                    key={cls}
                    gradeClass={cls}
                    students={filtered.filter((s) => s.gradeClass === cls)}
                    sectionColor={sectionColor}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
