import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Briefcase,
  Search,
  Plus,
  Mail,
  Phone,
  ChevronRight,
  Building2,
  TrendingUp,
  AlertCircle,
  Star,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { cn } from "@/lib/utils";
import { currency } from "@/lib/mos-data";
import {
  PS_CLIENTS,
  PS_PROJECTS,
  PS_RETAINERS,
  PS_SUMMARY,
  type PSClient,
  type ClientStatus,
} from "@/lib/ps-data";

export const Route = createFileRoute("/_authenticated/clients")({
  head: () => ({
    meta: [
      { title: "Clients — Trite Merchant OS" },
      {
        name: "description",
        content: "Professional services client CRM — track projects, billing, retainers, and outstanding balances.",
      },
    ],
  }),
  component: ClientsPage,
});

const STATUS_CONFIG: Record<ClientStatus, { label: string; pill: string }> = {
  Active: { label: "Active", pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" },
  "On Hold": { label: "On Hold", pill: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400" },
  Inactive: { label: "Inactive", pill: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
  Prospect: { label: "Prospect", pill: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400" },
};

const FILTER_TABS: { label: string; value: ClientStatus | "all" }[] = [
  { label: "All Clients", value: "all" },
  { label: "Active", value: "Active" },
  { label: "Prospect", value: "Prospect" },
  { label: "On Hold", value: "On Hold" },
  { label: "Inactive", value: "Inactive" },
];

function ClientsPage() {
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedClient, setSelectedClient] = useState<PSClient | null>(null);

  const filtered = PS_CLIENTS.filter((c) => {
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesSearch =
      search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const clientProjects = selectedClient
    ? PS_PROJECTS.filter((p) => p.clientId === selectedClient.id)
    : [];
  const clientRetainer = selectedClient?.retainerId
    ? PS_RETAINERS.find((r) => r.id === selectedClient.retainerId)
    : undefined;

  return (
    <AppShell
      title="Clients"
      subtitle="Client accounts, projects, and billing overview"
      actions={
        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" /> New Client
          </Button>
        </div>
      }
    >
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        {[
          { label: "Active Clients", value: PS_SUMMARY.totalClients, icon: Briefcase, color: "text-blue-600" },
          { label: "Active Projects", value: PS_SUMMARY.activeProjects, icon: TrendingUp, color: "text-emerald-600" },
          { label: "Outstanding", value: currency(PS_SUMMARY.outstandingInvoices), icon: AlertCircle, color: "text-rose-600" },
          { label: "Retainers", value: PS_SUMMARY.activeRetainers, icon: Star, color: "text-purple-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <kpi.icon className={cn("size-4", kpi.color)} />
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
            </div>
            <p className="text-xl font-bold tracking-tight">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left — client list */}
        <div className="flex-1 min-w-0">
          {/* filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Search clients…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    statusFilter === tab.value
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:bg-muted/80",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Industry</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Revenue</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Outstanding</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Projects</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((client) => (
                    <tr
                      key={client.id}
                      onClick={() => setSelectedClient(selectedClient?.id === client.id ? null : client)}
                      className={cn(
                        "cursor-pointer hover:bg-muted/30 transition-colors",
                        selectedClient?.id === client.id && "bg-muted/50",
                      )}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.contactPerson}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{client.industry}</td>
                      <td className="px-4 py-3 text-right font-medium">{currency(client.totalRevenue)}</td>
                      <td className="px-4 py-3 text-right">
                        {client.outstandingBalance > 0 ? (
                          <span className="font-semibold text-rose-600 dark:text-rose-400">
                            {currency(client.outstandingBalance)}
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Cleared</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{client.projectIds.length}</td>
                      <td className="px-4 py-3">
                        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", STATUS_CONFIG[client.status].pill)}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight className={cn("size-4 text-muted-foreground transition-transform", selectedClient?.id === client.id && "rotate-90")} />
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">
                        No clients found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right — client detail panel */}
        {selectedClient && (
          <div className="w-full lg:w-80 shrink-0 space-y-4">
            {/* Header */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-base">{selectedClient.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedClient.industry}</p>
                </div>
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", STATUS_CONFIG[selectedClient.status].pill)}>
                  {selectedClient.status}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="size-3.5 shrink-0" />
                  <span>{selectedClient.contactPerson}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-3.5 shrink-0" />
                  <span className="truncate">{selectedClient.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-3.5 shrink-0" />
                  <span>{selectedClient.phone}</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Total Revenue</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">{currency(selectedClient.totalRevenue)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Outstanding</p>
                  <p className={cn("font-bold", selectedClient.outstandingBalance > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400")}>
                    {selectedClient.outstandingBalance > 0 ? currency(selectedClient.outstandingBalance) : "Cleared"}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">Client since {selectedClient.joinedDate}</p>
            </div>

            {/* Projects */}
            {clientProjects.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Projects</p>
                <div className="space-y-2">
                  {clientProjects.map((proj) => (
                    <div key={proj.id} className="rounded-lg bg-muted/40 p-3">
                      <p className="text-sm font-medium">{proj.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">{proj.hoursLogged}h logged</span>
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium",
                          proj.status === "In Progress" ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400" :
                          proj.status === "Completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" :
                          "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
                        )}>
                          {proj.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Retainer */}
            {clientRetainer && (
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Retainer</p>
                <p className="text-sm font-medium">{clientRetainer.service}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Renews {clientRetainer.renewalDate}</p>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Hours used</span>
                    <span className="font-medium">{clientRetainer.hoursUsed}h / {clientRetainer.hoursIncluded}h</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${Math.min(100, (clientRetainer.hoursUsed / clientRetainer.hoursIncluded) * 100)}%` }}
                    />
                  </div>
                </div>
                <p className="mt-3 text-sm font-bold text-blue-600 dark:text-blue-400">{currency(clientRetainer.monthlyFee)}<span className="text-xs font-normal text-muted-foreground"> /mo</span></p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
