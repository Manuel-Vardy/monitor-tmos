import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  FolderKanban,
  Plus,
  Search,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  Calendar,
  Compass,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { currency } from "@/lib/mos-data";
import { NGO_PROJECTS, NGO_SUMMARY, type NgoProject } from "@/lib/ngo-data";

export const Route = createFileRoute("/_authenticated/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Community development projects, field project lead coordinators, budget allocation vs spend, and beneficiary reach.",
      },
      { property: "og:title", content: "Projects — Trite Merchant OS" },
    ],
  }),
  component: ProjectsPage,
});

type ProjectStatus = NgoProject["status"];

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; icon: React.ElementType; color: string; bg: string; activePill: string }
> = {
  "Active Implementation": {
    label: "Active",
    icon: Clock,
    color: "text-emerald-600 dark:text-emerald-400 font-semibold",
    bg: "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800",
    activePill: "bg-emerald-600 text-white",
  },
  "Planning Phase": {
    label: "Planning",
    icon: Compass,
    color: "text-blue-600 dark:text-blue-400 font-semibold",
    bg: "bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800",
    activePill: "bg-blue-600 text-white",
  },
  Completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-slate-600 dark:text-slate-400 font-semibold",
    bg: "bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800",
    activePill: "bg-slate-700 text-white",
  },
};

function ProjectsPage() {
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filtered = NGO_PROJECTS.filter((p) => {
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchSearch =
      search === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase()) ||
      p.leadCoordinator.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <AppShell
      title="Community Development Projects"
      subtitle={`${NGO_SUMMARY.totalActiveProjects} active outreach projects · ${NGO_SUMMARY.totalBeneficiariesReached.toLocaleString()} souls reached`}
      actions={
        <Button size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a]">
          <Plus className="size-4" /> Create New Project
        </Button>
      }
    >
      {/* Stat Cards */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Projects</p>
            <span className="rounded-full bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <FolderKanban className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold">{NGO_PROJECTS.length}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Community initiatives</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Field Projects</p>
            <span className="rounded-full bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Clock className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {NGO_SUMMARY.totalActiveProjects} active
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Under execution</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Beneficiaries</p>
            <span className="rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Users className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {NGO_SUMMARY.totalBeneficiariesReached.toLocaleString()}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Impacted individuals</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Allocations</p>
            <span className="rounded-full bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <FolderKanban className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-purple-600 dark:text-purple-400">
            {currency(NGO_PROJECTS.reduce((a, p) => a + p.budgetAllocated, 0))}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Allocated budget pool</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search project title, code, location or lead coordinator…"
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
            All Projects
          </button>
          {(Object.keys(STATUS_CONFIG) as ProjectStatus[]).map((st) => {
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

      {/* Projects Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((prj) => {
          const cfg = STATUS_CONFIG[prj.status];
          const Icon = cfg.icon;
          const spendPct = Math.round((prj.fundsSpent / prj.budgetAllocated) * 100);

          return (
            <div
              key={prj.id}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-muted-foreground/30"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-muted-foreground">{prj.code}</span>
                    <h3 className="text-base font-bold text-foreground leading-snug">{prj.title}</h3>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ${cfg.bg} ${cfg.color}`}>
                    <Icon className="size-3.5" />
                    {cfg.label}
                  </span>
                </div>

                <div className="my-3 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-3.5 shrink-0 opacity-70" />
                    <span>{prj.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="size-3.5 shrink-0 opacity-70" />
                    <span>Lead: {prj.leadCoordinator}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-3.5 shrink-0 opacity-70" />
                    <span>Timeline: {prj.startDate} → {prj.targetEndDate}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 rounded-lg bg-secondary/40 p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between font-medium">
                    <span>Budget Spent: {spendPct}%</span>
                    <span>{currency(prj.fundsSpent)} / {currency(prj.budgetAllocated)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-[#22c55e] transition-all"
                      style={{ width: `${spendPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">Target Beneficiaries</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {prj.beneficiariesCount.toLocaleString()} people
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
