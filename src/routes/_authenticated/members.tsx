import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Award,
  Crown,
  UserCheck,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { currency } from "@/lib/mos-data";
import { NGO_MEMBERS, NGO_SUMMARY, type NgoMember } from "@/lib/ngo-data";

export const Route = createFileRoute("/_authenticated/members")({
  head: () => ({
    meta: [
      { title: "Members & Dues — Trite Merchant OS" },
      {
        name: "description",
        content:
          "NGO executive membership directory, board members, patron dues tracking, volunteer leaders, and annual contribution ledger.",
      },
      { property: "og:title", content: "Members & Dues — Trite Merchant OS" },
    ],
  }),
  component: MembersPage,
});

type Role = NgoMember["role"];
type DuesStatus = NgoMember["duesStatus"];

const ROLE_CONFIG: Record<
  Role,
  { icon: React.ElementType; color: string; bg: string }
> = {
  "Board Member": {
    icon: Crown,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
  },
  "Patron Member": {
    icon: Award,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
  },
  "Executive Member": {
    icon: UserCheck,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
  },
  "Volunteer Leader": {
    icon: Users,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
  },
};

function MembersPage() {
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [duesStatusFilter, setDuesStatusFilter] = useState<DuesStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filtered = NGO_MEMBERS.filter((m) => {
    const matchRole = roleFilter === "all" || m.role === roleFilter;
    const matchStatus = duesStatusFilter === "all" || m.duesStatus === duesStatusFilter;
    const matchSearch =
      search === "" ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.memberId.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchStatus && matchSearch;
  });

  return (
    <AppShell
      title="Members Directory & Dues Ledger"
      subtitle={`${NGO_SUMMARY.totalMembersCount} registered board & executive members · ${currency(NGO_SUMMARY.totalDuesCollected)} in annual membership dues collected`}
      actions={
        <Button size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a]">
          <Plus className="size-4" /> Register New Member
        </Button>
      }
    >
      {/* Stat Cards */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Members</p>
            <span className="rounded-full bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Users className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold">{NGO_SUMMARY.totalMembersCount}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Board, Executive & Patrons</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Dues Collected</p>
            <span className="rounded-full bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {currency(NGO_SUMMARY.totalDuesCollected)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">2026 Annual dues</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Fully Paid</p>
            <span className="rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <UserCheck className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {NGO_MEMBERS.filter((m) => m.duesStatus === "Paid").length} members
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Active standing</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Outstanding Dues</p>
            <span className="rounded-full bg-rose-50 p-2 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <AlertCircle className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {NGO_MEMBERS.filter((m) => m.duesStatus === "Outstanding").length} members
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Pending payment</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member name, ID, role or email…"
            className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setDuesStatusFilter("all")}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
              duesStatusFilter === "all"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-secondary text-muted-foreground hover:bg-border"
            }`}
          >
            All Members
          </button>
          <button
            onClick={() => setDuesStatusFilter("Paid")}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
              duesStatusFilter === "Paid" ? "bg-emerald-600 text-white" : "bg-secondary text-muted-foreground hover:bg-border"
            }`}
          >
            Paid Dues
          </button>
          <button
            onClick={() => setDuesStatusFilter("Outstanding")}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
              duesStatusFilter === "Outstanding" ? "bg-rose-600 text-white" : "bg-secondary text-muted-foreground hover:bg-border"
            }`}
          >
            Outstanding Dues
          </button>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => {
          const roleCfg = ROLE_CONFIG[m.role];
          const RoleIcon = roleCfg.icon;
          return (
            <div
              key={m.id}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-muted-foreground/30"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-muted-foreground">{m.memberId}</span>
                    <h3 className="text-lg font-bold">{m.name}</h3>
                    <p className="text-xs text-muted-foreground">Joined: {m.joinedDate}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleCfg.bg} ${roleCfg.color}`}>
                    <RoleIcon className="size-3.5" />
                    {m.role}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="size-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{m.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="size-3.5 shrink-0 opacity-70" />
                    <span>{m.phone}</span>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-secondary/40 p-3 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annual Dues:</span>
                    <span className="font-semibold">{currency(m.annualDues)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dues Paid:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{currency(m.duesPaid)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs text-muted-foreground">Dues Standing</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${m.duesStatus === "Paid" ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400" : "bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-400"}`}>
                  {m.duesStatus === "Paid" ? "Cleared ✓" : "Outstanding"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
