import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  UtensilsCrossed,
  Plus,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Search,
  DollarSign,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { currency } from "@/lib/mos-data";
import {
  RESTAURANT_TABLES,
  RESTAURANT_SUMMARY,
  type RestaurantTable,
} from "@/lib/restaurant-data";

export const Route = createFileRoute("/_authenticated/tables")({
  head: () => ({
    meta: [
      { title: "Table Orders — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Live restaurant floor plan, table status tracking, open guest bills, and server assignments.",
      },
      { property: "og:title", content: "Table Orders — Trite Merchant OS" },
    ],
  }),
  component: TableOrders,
});

type TableStatus = RestaurantTable["status"];

const STATUS_CONFIG: Record<
  TableStatus,
  { label: string; icon: React.ElementType; color: string; bg: string; activePill: string }
> = {
  available: {
    label: "Available",
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400 font-semibold",
    bg: "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800",
    activePill: "bg-emerald-600 text-white",
  },
  occupied: {
    label: "Occupied",
    icon: UtensilsCrossed,
    color: "text-blue-600 dark:text-blue-400 font-semibold",
    bg: "bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800",
    activePill: "bg-blue-600 text-white",
  },
  billing: {
    label: "Billing / Payment",
    icon: Receipt,
    color: "text-amber-600 dark:text-amber-400 font-semibold",
    bg: "bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800",
    activePill: "bg-amber-600 text-white",
  },
  reserved: {
    label: "Reserved",
    icon: Clock,
    color: "text-purple-600 dark:text-purple-400 font-semibold",
    bg: "bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800",
    activePill: "bg-purple-600 text-white",
  },
};

const SECTIONS = ["All Sections", "Main Dining", "Terrace", "VIP Lounge", "Bar Area"];

function TableOrders() {
  const [sectionFilter, setSectionFilter] = useState("All Sections");
  const [statusFilter, setStatusFilter] = useState<TableStatus | "all">("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [search, setSearch] = useState("");

  const filteredTables = RESTAURANT_TABLES.filter((t) => {
    const matchSection = sectionFilter === "All Sections" || t.section === sectionFilter;
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchSearch =
      search === "" ||
      `Table ${t.number}`.toLowerCase().includes(search.toLowerCase()) ||
      (t.currentOrder?.server || "").toLowerCase().includes(search.toLowerCase());
    return matchSection && matchStatus && matchSearch;
  });

  return (
    <AppShell
      title="Table Orders & Floor Plan"
      subtitle={`${RESTAURANT_SUMMARY.totalOccupiedTables} occupied tables · ${currency(RESTAURANT_SUMMARY.activeOrderRevenue)} in active guest bills`}
      actions={
        <Button size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a]">
          <Plus className="size-4" /> Open New Table
        </Button>
      }
    >
      {/* Stat Cards */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Occupied Tables</p>
            <span className="rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <UtensilsCrossed className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-blue-600 dark:text-blue-400">{RESTAURANT_SUMMARY.totalOccupiedTables}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Serving active guests</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Available Tables</p>
            <span className="rounded-full bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{RESTAURANT_SUMMARY.totalAvailableTables}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Ready for seating</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Order Revenue</p>
            <span className="rounded-full bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <DollarSign className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-amber-600 dark:text-amber-400">{currency(RESTAURANT_SUMMARY.activeOrderRevenue)}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Currently unbilled / tab</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Kitchen Tickets</p>
            <span className="rounded-full bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Receipt className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-purple-600 dark:text-purple-400">{RESTAURANT_SUMMARY.activeKitchenTickets}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Tickets in prep queue</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by table # or server…"
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
            All Tables
          </button>
          {(Object.keys(STATUS_CONFIG) as TableStatus[]).map((st) => {
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
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* Section Filter Tabs */}
      <div className="mb-4 flex border-b border-border gap-4 text-xs font-medium">
        {SECTIONS.map((sec) => (
          <button
            key={sec}
            onClick={() => setSectionFilter(sec)}
            className={`pb-2 border-b-2 transition-colors ${
              sectionFilter === sec
                ? "border-[#22c55e] text-[#22c55e] font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* Tables Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {filteredTables.map((t) => {
          const cfg = STATUS_CONFIG[t.status];
          const Icon = cfg.icon;
          return (
            <div
              key={t.id}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-muted-foreground/30"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">Table {t.number}</span>
                    <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium">
                      {t.seats} seats
                    </span>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${cfg.bg} ${cfg.color}`}>
                    <Icon className="size-3" />
                    {cfg.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t.section}</p>

                {t.currentOrder ? (
                  <div className="mt-4 rounded-lg bg-secondary/50 p-3 space-y-2 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span>{t.currentOrder.orderId}</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{currency(t.currentOrder.total)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground text-[11px]">
                      <span>Server: {t.currentOrder.server}</span>
                      <span>{t.currentOrder.guests} guests · {t.currentOrder.timeOpened}</span>
                    </div>
                    {t.currentOrder.orderedDishes && (
                      <div className="border-t border-border/60 pt-1.5 space-y-1 text-[11px]">
                        {t.currentOrder.orderedDishes.map((dish, idx) => (
                          <div key={idx} className="flex justify-between text-muted-foreground">
                            <span className="truncate max-w-[130px]">{dish.qty}x {dish.name}</span>
                            <span className="font-mono">{currency(dish.price * dish.qty)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 flex h-20 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                    Table Ready
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-2 pt-2 border-t border-border">
                {t.status === "available" ? (
                  <Button size="sm" variant="outline" className="w-full text-xs">
                    Seat Guests
                  </Button>
                ) : t.status === "occupied" ? (
                  <>
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      View Order
                    </Button>
                    <Button size="sm" className="w-full bg-[#22c55e] text-white text-xs hover:bg-[#16a34a]">
                      Bill Guest
                    </Button>
                  </>
                ) : (
                  <Button size="sm" className="w-full bg-amber-600 text-white text-xs hover:bg-amber-700">
                    Settle Payment
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
