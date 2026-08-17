import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Sparkles,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  AlertTriangle,
  DoorOpen,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { HOUSEKEEPING_TASKS, HOTEL_SUMMARY, type HousekeepingTask } from "@/lib/hotel-data";

export const Route = createFileRoute("/_authenticated/housekeeping")({
  head: () => ({
    meta: [
      { title: "Housekeeping — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Hotel housekeeping turnover schedule, room cleaning logs, staff assignments, and inspection sign-offs.",
      },
      { property: "og:title", content: "Housekeeping — Trite Merchant OS" },
    ],
  }),
  component: HousekeepingPage,
});

type TaskStatus = HousekeepingTask["status"];

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; icon: React.ElementType; color: string; bg: string; activePill: string }
> = {
  "In Progress": {
    label: "In Progress",
    icon: Clock,
    color: "text-indigo-600 dark:text-indigo-400 font-semibold",
    bg: "bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800",
    activePill: "bg-indigo-600 text-white",
  },
  Pending: {
    label: "Pending",
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400 font-semibold",
    bg: "bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800",
    activePill: "bg-amber-500 text-white",
  },
  "Inspected & Passed": {
    label: "Inspected & Passed",
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400 font-semibold",
    bg: "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800",
    activePill: "bg-emerald-600 text-white",
  },
};

function HousekeepingPage() {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filtered = HOUSEKEEPING_TASKS.filter((task) => {
    const matchStatus = statusFilter === "all" || task.status === statusFilter;
    const matchSearch =
      search === "" ||
      task.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
      task.assignedStaff.toLowerCase().includes(search.toLowerCase()) ||
      task.cleaningType.toLowerCase().includes(search.toLowerCase()) ||
      task.roomType.toLowerCase().includes(search.toLowerCase()) ||
      (task.currentGuest && task.currentGuest.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  return (
    <AppShell
      title="Housekeeping & Turnover Queue"
      subtitle={`${HOTEL_SUMMARY.pendingHousekeeping} pending cleaning tasks · Daily turnover schedule & supervisor inspections`}
      actions={
        <div className="flex items-center gap-2">
          <Link to="/rooms">
            <Button size="sm" variant="outline" className="h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm">
              <DoorOpen className="size-3.5 sm:size-4" />
              <span className="hidden sm:inline">Room Inventory</span>
              <span className="sm:hidden">Rooms</span>
            </Button>
          </Link>
          <Button size="sm" className="h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm bg-[#22c55e] text-white hover:bg-[#16a34a] shrink-0">
            <Plus className="size-3.5 sm:size-4" />
            <span className="hidden sm:inline">Create Cleaning Task</span>
            <span className="sm:hidden">New Task</span>
          </Button>
        </div>
      }
    >
      {/* Stat Cards */}
      <div className="mb-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Turnover Tasks</p>
            <span className="rounded-full bg-slate-100 p-1.5 sm:p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Sparkles className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold">{HOUSEKEEPING_TASKS.length}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Logged today</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">In Progress</p>
            <span className="rounded-full bg-indigo-50 p-1.5 sm:p-2 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Clock className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {HOUSEKEEPING_TASKS.filter((h) => h.status === "In Progress").length}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Staff cleaning now</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pending Queue</p>
            <span className="rounded-full bg-amber-50 p-1.5 sm:p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <AlertTriangle className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {HOUSEKEEPING_TASKS.filter((h) => h.status === "Pending").length}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Awaiting cleaner</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Inspected & Passed</p>
            <span className="rounded-full bg-emerald-50 p-1.5 sm:p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <ShieldCheck className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {HOUSEKEEPING_TASKS.filter((h) => h.status === "Inspected & Passed").length}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Ready for check-in</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 space-y-2.5">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search room number, cleaner staff, cleaning type…"
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
            All Tasks
          </button>
          {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((st) => {
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

      {/* Housekeeping Sliding Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-2xs">
        <table className="w-full min-w-[780px] text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 whitespace-nowrap">Room Number</th>
              <th className="px-4 py-3 whitespace-nowrap">Room Category</th>
              <th className="px-4 py-3 whitespace-nowrap">Cleaning Type</th>
              <th className="px-4 py-3 whitespace-nowrap">Assigned Cleaner</th>
              <th className="px-4 py-3 whitespace-nowrap">Guest / Notes</th>
              <th className="px-4 py-3 whitespace-nowrap">Logged Time</th>
              <th className="px-4 py-3 whitespace-nowrap">Priority</th>
              <th className="px-4 py-3 whitespace-nowrap">Status</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                  No housekeeping tasks match your search.
                </td>
              </tr>
            ) : (
              filtered.map((task) => {
                const cfg = STATUS_CONFIG[task.status];
                const Icon = cfg.icon;
                return (
                  <tr key={task.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-4 py-3 font-bold text-foreground whitespace-nowrap">{task.roomNumber}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{task.roomType}</td>
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{task.cleaningType}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{task.assignedStaff}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{task.currentGuest || "—"}</td>
                    <td className="px-4 py-3 text-xs font-mono whitespace-nowrap">{task.timeLogged}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`rounded px-2 py-0.5 text-xs font-bold ${task.priority === "High" ? "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400" : "bg-secondary text-muted-foreground"}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ${cfg.bg} ${cfg.color}`}>
                        <Icon className="size-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {task.status !== "Inspected & Passed" ? (
                        <Button size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a] text-xs h-7">
                          Inspect & Pass
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="text-xs h-7">
                          Completed
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
