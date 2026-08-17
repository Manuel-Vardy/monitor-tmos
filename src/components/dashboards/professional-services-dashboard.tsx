import { Briefcase, Clock, FileText, Wallet, TrendingUp, AlertCircle, Star, Timer } from "lucide-react";

import { KpiCard } from "@/components/kpi-card";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { currency } from "@/lib/mos-data";
import { PS_PROJECTS, PS_RETAINERS, PS_SUMMARY, type BillingType, type RetainerStatus } from "@/lib/ps-data";

// --- Helpers ------------------------------------------------------------------

const BILLING_STATUS_STYLES: Record<BillingType, string> = {
  "Billable":  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
  "Retainer":  "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400",
  "Fixed Fee": "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400",
  "Pro Bono":  "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const RETAINER_STATUS_STYLES: Record<RetainerStatus, string> = {
  "Active":          "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
  "Pending Renewal": "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
  "Paused":          "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  "Expired":         "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400",
};

// --- Component ----------------------------------------------------------------

export function ProfessionalServicesDashboard() {
  const activeProjects = PS_PROJECTS.filter((p) => p.status === "In Progress");

  return (
    <AppShell title="Professional Services Dashboard" subtitle="Client & project overview">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard
          label="Active Clients"
          value={PS_SUMMARY.totalClients}
          sub="3 new this month"
          icon={Briefcase}
        />
        <KpiCard
          label="Billable Hours"
          value={`${PS_SUMMARY.totalBillableHours.toFixed(0)}h`}
          delta={12}
          sub="logged this period"
          icon={Clock}
        />
        <KpiCard
          label="Outstanding Invoices"
          value={currency(PS_SUMMARY.outstandingInvoices)}
          sub={`${PS_SUMMARY.totalClients} clients`}
          icon={FileText}
        />
        <KpiCard
          label="Retainer Revenue"
          value={currency(PS_SUMMARY.monthlyRetainerRevenue)}
          sub={`${PS_SUMMARY.activeRetainers} active retainers /mo`}
          icon={Wallet}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active Projects table */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <Briefcase className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Active Projects</h2>
              <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {activeProjects.length} projects
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Project</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Client</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Budget</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Hours</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Billing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activeProjects.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium">{row.name}</p>
                        <p className="text-xs text-muted-foreground">Due {row.deadline}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-sm">{row.clientName}</td>
                      <td className="px-4 py-3 text-right font-medium">{currency(row.budget)}</td>
                      <td className="px-4 py-3 text-right font-medium">{row.hoursLogged}h</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                          BILLING_STATUS_STYLES[row.billingType],
                        )}>
                          {row.billingType}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Retainer sidebar */}
        <div className="space-y-4">
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <Star className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Retainers</h2>
            </div>
            <div className="divide-y divide-border">
              {PS_RETAINERS.map((ret) => {
                const pct = Math.min(100, (ret.hoursUsed / ret.hoursIncluded) * 100);
                return (
                  <div key={ret.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{ret.clientName}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{ret.service}</p>
                      </div>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0", RETAINER_STATUS_STYLES[ret.status])}>
                        {ret.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{ret.hoursUsed}h / {ret.hoursIncluded}h used</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{currency(ret.monthlyFee)}/mo</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", pct >= 100 ? "bg-rose-500" : pct >= 80 ? "bg-amber-500" : "bg-blue-500")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">Renews {ret.renewalDate}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
