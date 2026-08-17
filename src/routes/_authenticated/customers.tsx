import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Building2,
  CreditCard,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

import type { DateRange } from "react-day-picker";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { currency } from "@/lib/mos-data";
import { WHOLESALE_CUSTOMERS, type WholesaleCustomer } from "@/lib/wholesale-data";

export const Route = createFileRoute("/_authenticated/customers")({
  head: () => ({
    meta: [
      { title: "Customers — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Wholesale customer directory, credit limits, outstanding balances, and order history.",
      },
      { property: "og:title", content: "Customers — Trite Merchant OS" },
    ],
  }),
  component: Customers,
});

const FILTER_PILLS: Array<{ key: WholesaleCustomer["status"] | "all"; label: string; activeColor: string }> = [
  { key: "all", label: "All Accounts", activeColor: "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" },
  { key: "active", label: "Active", activeColor: "bg-emerald-600 text-white" },
  { key: "credit_hold", label: "Credit Hold", activeColor: "bg-rose-600 text-white" },
  { key: "inactive", label: "Inactive", activeColor: "bg-slate-600 text-white" },
];

function Customers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<WholesaleCustomer["status"] | "all">("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filtered = WHOLESALE_CUSTOMERS.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalOutstanding = WHOLESALE_CUSTOMERS.reduce((acc, curr) => acc + curr.balanceUsed, 0);

  return (
    <AppShell
      title="Wholesale Customers"
      subtitle={`Directory & credit management · Total Receivables: ${currency(totalOutstanding)}`}
      actions={
        <Button size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a]">
          <Plus className="size-4" /> Add Customer
        </Button>
      }
    >
      {/* Stat Cards */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Accounts</p>
            <span className="rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Users className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold">{WHOLESALE_CUSTOMERS.length}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Registered wholesale buyers</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Outstanding</p>
            <span className="rounded-full bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <CreditCard className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-amber-600 dark:text-amber-400">{currency(totalOutstanding)}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Credit accounts balance</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Credit Hold</p>
            <span className="rounded-full bg-rose-50 p-2 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <AlertTriangle className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {WHOLESALE_CUSTOMERS.filter((c) => c.status === "credit_hold").length}
          </p>
          <p className="mt-0.5 text-xs text-rose-500">Over credit limit</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Accounts</p>
            <span className="rounded-full bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {WHOLESALE_CUSTOMERS.filter((c) => c.status === "active").length}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">In good standing</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, company, email or city…"
            className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTER_PILLS.map((pill) => {
            const isSelected = statusFilter === pill.key;
            return (
              <button
                key={pill.key}
                onClick={() => setStatusFilter(pill.key)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                  isSelected
                    ? pill.activeColor
                    : "bg-secondary text-muted-foreground hover:bg-border"
                }`}
              >
                {pill.label}
              </button>
            );
          })}
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No customers found matching your search criteria.
          </div>
        )}
        {filtered.map((customer) => (
          <div
            key={customer.id}
            className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-muted-foreground/30"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-foreground">{customer.company}</h3>
                  <p className="text-xs text-muted-foreground">{customer.name}</p>
                </div>
                {customer.status === "credit_hold" ? (
                  <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-600 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-400">
                    Credit Hold
                  </span>
                ) : (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-400">
                    Active
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="size-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-3.5 shrink-0 opacity-70" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-3.5 shrink-0 opacity-70" />
                  <span>{customer.city}, Ghana</span>
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Orders</p>
                  <p className="font-semibold">{customer.totalOrders} orders</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Spent</p>
                  <p className="font-semibold">{currency(customer.totalSpent)}</p>
                </div>
                <div className="mt-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Credit Limit</p>
                  <p className="font-medium text-muted-foreground">{currency(customer.creditLimit)}</p>
                </div>
                <div className="mt-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Balance Used</p>
                  <p className={`font-bold ${customer.overdue > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600"}`}>
                    {currency(customer.balanceUsed)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
