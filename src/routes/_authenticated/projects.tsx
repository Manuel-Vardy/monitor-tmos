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
  X,
  Check,
  Pencil,
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

// ── Create New Project Modal ──

function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: NgoProject) => void;
}) {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState(`PRJ-${Math.floor(100 + Math.random() * 900)}`);
  const [location, setLocation] = useState("");
  const [leadCoordinator, setLeadCoordinator] = useState("");
  const [budgetAllocated, setBudgetAllocated] = useState("");
  const [fundsSpent, setFundsSpent] = useState("0");
  const [startDate, setStartDate] = useState("01 Sep 2026");
  const [targetEndDate, setTargetEndDate] = useState("31 Dec 2026");
  const [status, setStatus] = useState<ProjectStatus>("Planning Phase");
  const [beneficiariesCount, setBeneficiariesCount] = useState("1000");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newProject: NgoProject = {
      id: `PRJ-${Date.now()}`,
      code: code.trim() || `PRJ-${Math.floor(100 + Math.random() * 900)}`,
      title: title.trim(),
      location: location.trim() || "Headquarters / Community",
      budgetAllocated: Number(budgetAllocated) || 25000,
      fundsSpent: Number(fundsSpent) || 0,
      leadCoordinator: leadCoordinator.trim() || "Project Committee",
      startDate: startDate.trim() || "01 Sep 2026",
      targetEndDate: targetEndDate.trim() || "31 Dec 2026",
      status,
      beneficiariesCount: Number(beneficiariesCount) || 500,
    };

    onSubmit(newProject);
    onClose();
  };

  const inputClass =
    "w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Create New Project"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-foreground">Create New Project</h2>
            <p className="text-xs text-muted-foreground">Add a new church or community outreach initiative</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cathedral Building Project, Evangelism Outreach"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Project Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. PRJ-BLD-04"
                className={`${inputClass} font-mono`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Project Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className={inputClass}
              >
                <option value="Planning Phase">Planning Phase</option>
                <option value="Active Implementation">Active Implementation</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Location / Site
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Central Auditorium Grounds"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Lead Coordinator
              </label>
              <input
                type="text"
                value={leadCoordinator}
                onChange={(e) => setLeadCoordinator(e.target.value)}
                placeholder="e.g. Elder Clara Mensah"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Target Funding Budget (GH₵) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={budgetAllocated}
                onChange={(e) => setBudgetAllocated(e.target.value)}
                placeholder="e.g. 50000"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Initial Amount Received (GH₵)
              </label>
              <input
                type="number"
                min="0"
                value={fundsSpent}
                onChange={(e) => setFundsSpent(e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Start Date
              </label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="e.g. 01 Sep 2026"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Target End Date
              </label>
              <input
                type="text"
                value={targetEndDate}
                onChange={(e) => setTargetEndDate(e.target.value)}
                placeholder="e.g. 31 Dec 2026"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Estimated Beneficiaries / Reach Count
            </label>
            <input
              type="number"
              min="0"
              value={beneficiariesCount}
              onChange={(e) => setBeneficiariesCount(e.target.value)}
              placeholder="e.g. 2500"
              className={inputClass}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-[#22c55e] text-white hover:bg-[#16a34a] gap-1.5"
            >
              <Check className="size-4" />
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Project Modal ──

function EditProjectModal({
  project,
  isOpen,
  onClose,
  onSubmit,
}: {
  project: NgoProject | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: NgoProject) => void;
}) {
  const [title, setTitle] = useState(project?.title || "");
  const [code, setCode] = useState(project?.code || "");
  const [location, setLocation] = useState(project?.location || "");
  const [leadCoordinator, setLeadCoordinator] = useState(project?.leadCoordinator || "");
  const [budgetAllocated, setBudgetAllocated] = useState(String(project?.budgetAllocated || ""));
  const [fundsSpent, setFundsSpent] = useState(String(project?.fundsSpent || "0"));
  const [startDate, setStartDate] = useState(project?.startDate || "01 Sep 2026");
  const [targetEndDate, setTargetEndDate] = useState(project?.targetEndDate || "31 Dec 2026");
  const [status, setStatus] = useState<ProjectStatus>(project?.status || "Active Implementation");
  const [beneficiariesCount, setBeneficiariesCount] = useState(String(project?.beneficiariesCount || "1000"));

  // Sync state if project changes
  useState(() => {
    if (project) {
      setTitle(project.title);
      setCode(project.code);
      setLocation(project.location);
      setLeadCoordinator(project.leadCoordinator);
      setBudgetAllocated(String(project.budgetAllocated));
      setFundsSpent(String(project.fundsSpent));
      setStartDate(project.startDate);
      setTargetEndDate(project.targetEndDate);
      setStatus(project.status);
      setBeneficiariesCount(String(project.beneficiariesCount));
    }
  });

  if (!isOpen || !project) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const updated: NgoProject = {
      ...project,
      title: title.trim(),
      code: code.trim() || project.code,
      location: location.trim() || project.location,
      budgetAllocated: Number(budgetAllocated) || project.budgetAllocated,
      fundsSpent: Number(fundsSpent) || project.fundsSpent,
      leadCoordinator: leadCoordinator.trim() || project.leadCoordinator,
      startDate: startDate.trim() || project.startDate,
      targetEndDate: targetEndDate.trim() || project.targetEndDate,
      status,
      beneficiariesCount: Number(beneficiariesCount) || project.beneficiariesCount,
    };

    onSubmit(updated);
    onClose();
  };

  const inputClass =
    "w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Edit Project Details"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-foreground">Edit Project Details</h2>
            <p className="text-xs text-muted-foreground">Update project timeline, budget, coordinator & status</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Project Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Project Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className={inputClass}
              >
                <option value="Planning Phase">Planning Phase</option>
                <option value="Active Implementation">Active Implementation</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Location / Site
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Lead Coordinator
              </label>
              <input
                type="text"
                value={leadCoordinator}
                onChange={(e) => setLeadCoordinator(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Target Funding Budget (GH₵) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={budgetAllocated}
                onChange={(e) => setBudgetAllocated(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Amount Received (GH₵)
              </label>
              <input
                type="number"
                min="0"
                value={fundsSpent}
                onChange={(e) => setFundsSpent(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Start Date
              </label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Target End Date
              </label>
              <input
                type="text"
                value={targetEndDate}
                onChange={(e) => setTargetEndDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Estimated Beneficiaries / Reach Count
            </label>
            <input
              type="number"
              min="0"
              value={beneficiariesCount}
              onChange={(e) => setBeneficiariesCount(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-[#22c55e] text-white hover:bg-[#16a34a] gap-1.5"
            >
              <Check className="size-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProjectsPage() {
  const [projects, setProjects] = useState<NgoProject[]>(NGO_PROJECTS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<NgoProject | null>(null);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleCreateProject = (newProject: NgoProject) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  const handleEditProject = (updated: NgoProject) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const filtered = projects.filter((p) => {
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchSearch =
      search === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase()) ||
      p.leadCoordinator.toLowerCase().includes(search.toLowerCase());
    const matchSelected = selectedProjectId === null || p.id === selectedProjectId;
    return matchStatus && matchSearch && matchSelected;
  });

  const totalTargetFunding = projects.reduce((a, p) => a + p.budgetAllocated, 0);
  const totalActiveProjects = projects.filter((p) => p.status === "Active Implementation").length;

  return (
    <AppShell
      title="Community Development Projects"
      subtitle={`${totalActiveProjects} active outreach projects · ${currency(totalTargetFunding)} total target funding`}
      actions={
        <Button
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="bg-[#22c55e] text-white hover:bg-[#16a34a] gap-1.5"
        >
          <Plus className="size-4" /> Create New Project
        </Button>
      }
    >
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateProject}
      />
      <EditProjectModal
        key={editProject?.id || "edit-modal"}
        project={editProject}
        isOpen={Boolean(editProject)}
        onClose={() => setEditProject(null)}
        onSubmit={handleEditProject}
      />
      {/* Stat Cards */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Projects</p>
            <span className="rounded-full bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <FolderKanban className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold">{projects.length}</p>
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
            {totalActiveProjects} active
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Under execution</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Target</p>
            <span className="rounded-full bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <FolderKanban className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-purple-600 dark:text-purple-400">
            {currency(totalTargetFunding)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Target funding budget</p>
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
          <select
            value={selectedProjectId || ""}
            onChange={(e) => setSelectedProjectId(e.target.value || null)}
            className="h-8 rounded-md border border-border bg-card px-2.5 text-xs outline-none focus:border-ring"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} — {p.title}
              </option>
            ))}
          </select>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* Projects Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((prj) => {
          const cfg = STATUS_CONFIG[prj.status];
          const Icon = cfg.icon;
          const receivedPct = Math.round((prj.fundsSpent / prj.budgetAllocated) * 100);

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
                    <span>Amount Received: {receivedPct}%</span>
                    <span>{currency(prj.fundsSpent)} / {currency(prj.budgetAllocated)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-[#22c55e] transition-all"
                      style={{ width: `${receivedPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">Target Budget</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {currency(prj.budgetAllocated)}
                  </span>
                  <button
                    onClick={() => setEditProject(prj)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-accent hover:underline ml-1"
                  >
                    <Pencil className="size-3" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
