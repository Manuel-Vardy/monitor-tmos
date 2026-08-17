import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  Utensils,
  Flame,
  Search,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import {
  KITCHEN_ORDERS,
  type KitchenOrder,
} from "@/lib/restaurant-data";

export const Route = createFileRoute("/_authenticated/kitchen")({
  head: () => ({
    meta: [
      { title: "Kitchen Display — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Live Kitchen Display System (KDS) for chef ticket management, station routing, prep timers, and order dispatching.",
      },
      { property: "og:title", content: "Kitchen Display — Trite Merchant OS" },
    ],
  }),
  component: KitchenDisplay,
});

type Station = "All Stations" | "Grill" | "Fryer" | "Cold Station" | "Drinks" | "Pastry";
type KStatus = KitchenOrder["status"];

const STATUS_CONFIG: Record<
  KStatus,
  { label: string; icon: React.ElementType; color: string; bg: string; activePill: string }
> = {
  pending: {
    label: "New Ticket",
    icon: AlertCircle,
    color: "text-rose-600 dark:text-rose-400 font-semibold",
    bg: "bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800",
    activePill: "bg-rose-600 text-white",
  },
  preparing: {
    label: "In Prep",
    icon: Flame,
    color: "text-amber-600 dark:text-amber-400 font-semibold",
    bg: "bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800",
    activePill: "bg-amber-600 text-white",
  },
  ready: {
    label: "Ready to Serve",
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400 font-semibold",
    bg: "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800",
    activePill: "bg-emerald-600 text-white",
  },
  served: {
    label: "Served",
    icon: Utensils,
    color: "text-slate-600 dark:text-slate-400 font-semibold",
    bg: "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800",
    activePill: "bg-slate-700 text-white",
  },
};

function KitchenDisplay() {
  const [station, setStation] = useState<Station>("All Stations");
  const [statusFilter, setStatusFilter] = useState<KStatus | "all">("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [search, setSearch] = useState("");

  const filteredOrders = KITCHEN_ORDERS.filter((order) => {
    const matchStatus = statusFilter === "all" || order.status === statusFilter;
    const matchSearch =
      search === "" ||
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      `Table ${order.tableNumber}`.toLowerCase().includes(search.toLowerCase()) ||
      order.server.toLowerCase().includes(search.toLowerCase());
    const matchStation =
      station === "All Stations" ||
      order.items.some((i) => i.station === station);
    return matchStatus && matchSearch && matchStation;
  });

  return (
    <AppShell
      title="Kitchen Display System (KDS)"
      subtitle={`${KITCHEN_ORDERS.filter((o) => o.status === "preparing").length} active tickets in preparation · ${KITCHEN_ORDERS.filter((o) => o.status === "pending").length} new tickets pending`}
      actions={
        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a]">
            <ChefHat className="size-4" /> Bump Completed
          </Button>
        </div>
      }
    >
      {/* Stat Cards */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">New Tickets</p>
            <span className="rounded-full bg-rose-50 p-2 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <AlertCircle className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {KITCHEN_ORDERS.filter((o) => o.status === "pending").length}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Needs chef pickup</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Currently Cooking</p>
            <span className="rounded-full bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Flame className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {KITCHEN_ORDERS.filter((o) => o.status === "preparing").length}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">On stations</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Ready to Serve</p>
            <span className="rounded-full bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {KITCHEN_ORDERS.filter((o) => o.status === "ready").length}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Pass / Expediters</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Avg Prep Time</p>
            <span className="rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Clock className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-blue-600 dark:text-blue-400">14 min</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Target &lt; 20 min</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ticket #, table or server…"
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
            All Tickets
          </button>
          {(Object.keys(STATUS_CONFIG) as KStatus[]).map((st) => {
            const cfg = STATUS_CONFIG[st];
            const isSelected = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                  isSelected ? cfg.activePill : "bg-secondary text-muted-foreground hover:bg-border"
                }`}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Station Tabs */}
      <div className="mb-4 flex border-b border-border gap-4 text-xs font-medium">
        {(["All Stations", "Grill", "Fryer", "Cold Station", "Drinks", "Pastry"] as Station[]).map((s) => (
          <button
            key={s}
            onClick={() => setStation(s)}
            className={`pb-2 border-b-2 transition-colors ${
              station === s
                ? "border-[#22c55e] text-[#22c55e] font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Kitchen Ticket Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredOrders.map((ticket) => {
          const cfg = STATUS_CONFIG[ticket.status];
          const Icon = cfg.icon;
          return (
            <div
              key={ticket.id}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all"
            >
              <div>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-muted-foreground">{ticket.id}</span>
                    <h3 className="text-lg font-bold">Table {ticket.tableNumber}</h3>
                    <p className="text-xs text-muted-foreground">{ticket.section} · {ticket.server}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${cfg.bg} ${cfg.color}`}>
                    <Icon className="size-3.5" />
                    {cfg.label}
                  </span>
                </div>

                <div className="my-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" /> Placed {ticket.timePlaced}
                  </span>
                  <span className="font-semibold text-foreground">{ticket.prepTimeMinutes}m elapsed</span>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  {ticket.items
                    .filter((item) => station === "All Stations" || item.station === station)
                    .map((item, idx) => (
                      <div key={idx} className="rounded-lg bg-secondary/40 p-2 text-xs">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-sm">{item.quantity}× {item.name}</span>
                          <span className="rounded bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {item.station}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="mt-1 font-medium text-amber-600 dark:text-amber-400">
                            Note: {item.notes}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-border">
                {ticket.status === "pending" ? (
                  <Button size="sm" className="w-full bg-amber-600 text-white hover:bg-amber-700 text-xs">
                    Start Cooking
                  </Button>
                ) : ticket.status === "preparing" ? (
                  <Button size="sm" className="w-full bg-[#22c55e] text-white hover:bg-[#16a34a] text-xs">
                    Mark Ready to Serve
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="w-full text-xs">
                    Dispatch to Table
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
