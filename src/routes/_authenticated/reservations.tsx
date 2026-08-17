import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  BedDouble,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  Phone,
  Building,
  Globe,
  UserCheck,
  List,
  LayoutGrid,
  Receipt,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { currency } from "@/lib/mos-data";
import { HOTEL_RESERVATIONS, HOTEL_SUMMARY, type Reservation } from "@/lib/hotel-data";

export const Route = createFileRoute("/_authenticated/reservations")({
  head: () => ({
    meta: [
      { title: "Reservations — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Hotel guest reservations, room bookings, check-in check-out status, deposit billing, and booking channels.",
      },
      { property: "og:title", content: "Reservations — Trite Merchant OS" },
    ],
  }),
  component: ReservationsPage,
});

type Status = Reservation["status"];

const STATUS_CONFIG: Record<
  Status,
  { label: string; icon: React.ElementType; color: string; bg: string; activePill: string }
> = {
  "Checked In": {
    label: "Checked In",
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400 font-semibold",
    bg: "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800",
    activePill: "bg-emerald-600 text-white",
  },
  Confirmed: {
    label: "Confirmed",
    icon: Clock,
    color: "text-blue-600 dark:text-blue-400 font-semibold",
    bg: "bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800",
    activePill: "bg-blue-600 text-white",
  },
  "Checked Out": {
    label: "Checked Out",
    icon: UserCheck,
    color: "text-slate-600 dark:text-slate-400 font-semibold",
    bg: "bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800",
    activePill: "bg-slate-700 text-white",
  },
  Cancelled: {
    label: "Cancelled",
    icon: Clock,
    color: "text-rose-600 dark:text-rose-400 font-semibold",
    bg: "bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800",
    activePill: "bg-rose-600 text-white",
  },
};

function ReservationsPage() {
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const filtered = HOTEL_RESERVATIONS.filter((res) => {
    const matchStatus = statusFilter === "all" || res.status === statusFilter;
    const matchSearch =
      search === "" ||
      res.guestName.toLowerCase().includes(search.toLowerCase()) ||
      res.bookingRef.toLowerCase().includes(search.toLowerCase()) ||
      res.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
      res.channel.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <AppShell
      title="Guest Reservations & Room Bookings"
      subtitle={`${HOTEL_SUMMARY.totalActiveReservations} active bookings · ${HOTEL_SUMMARY.occupancyRate}% current hotel occupancy`}
      actions={
        <div className="flex items-center gap-2">
          <Link to="/rooms">
            <Button size="sm" variant="outline" className="h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm">
              <BedDouble className="size-3.5 sm:size-4" />
              <span className="hidden sm:inline">Room Inventory</span>
              <span className="sm:hidden">Rooms</span>
            </Button>
          </Link>
          <Button size="sm" className="h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm bg-[#22c55e] text-white hover:bg-[#16a34a] shrink-0">
            <Plus className="size-3.5 sm:size-4" />
            <span className="hidden sm:inline">New Reservation</span>
            <span className="sm:hidden">New Booking</span>
          </Button>
        </div>
      }
    >
      {/* Stat Cards */}
      <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Bookings</p>
            <span className="rounded-full bg-slate-100 p-1.5 sm:p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <BedDouble className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold">{HOTEL_SUMMARY.totalActiveReservations}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Checked in & confirmed</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Checked In</p>
            <span className="rounded-full bg-emerald-50 p-1.5 sm:p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {HOTEL_RESERVATIONS.filter((r) => r.status === "Checked In").length} rooms
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">In-house guests</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Confirmed</p>
            <span className="rounded-full bg-blue-50 p-1.5 sm:p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Clock className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
            {HOTEL_RESERVATIONS.filter((r) => r.status === "Confirmed").length} upcoming
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Arriving soon</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Revenue</p>
            <span className="rounded-full bg-purple-50 p-1.5 sm:p-2 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Receipt className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
            {currency(HOTEL_RESERVATIONS.reduce((a, r) => a + r.totalAmount, 0))}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Booking volume</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 space-y-2.5">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guest name, booking ref, room or channel…"
            className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
          />
        </div>

        {/* Filter pills & controls — horizontally scrollable */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setStatusFilter("all")}
            className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
              statusFilter === "all"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-secondary text-muted-foreground hover:bg-border"
            }`}
          >
            All Bookings
          </button>
          {(Object.keys(STATUS_CONFIG) as Status[]).map((st) => {
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

          {/* View Toggle */}
          <div className="shrink-0 flex items-center rounded-lg border border-border bg-card p-0.5">
            <button
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === "cards" ? "bg-secondary text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid className="size-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === "table" ? "bg-secondary text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table View"
            >
              <List className="size-3.5" />
            </button>
          </div>

          <div className="shrink-0">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "table" ? (
        /* Sliding Table View */
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-2xs">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 whitespace-nowrap">Booking Ref</th>
                <th className="px-4 py-3 whitespace-nowrap">Guest</th>
                <th className="px-4 py-3 whitespace-nowrap">Room</th>
                <th className="px-4 py-3 whitespace-nowrap">Dates</th>
                <th className="px-4 py-3 whitespace-nowrap">Channel</th>
                <th className="px-4 py-3 font-bold whitespace-nowrap">Total</th>
                <th className="px-4 py-3 whitespace-nowrap">Deposit / Balance</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((res) => {
                const cfg = STATUS_CONFIG[res.status];
                const Icon = cfg.icon;
                return (
                  <tr key={res.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground whitespace-nowrap">{res.bookingRef}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-semibold text-foreground">{res.guestName}</p>
                      <p className="text-xs text-muted-foreground">{res.guestPhone}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-medium text-foreground">{res.roomNumber}</p>
                      <p className="text-xs text-muted-foreground">{res.roomType}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {res.checkInDate} → {res.checkOutDate} ({res.nights}n)
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{res.channel}</td>
                    <td className="px-4 py-3 font-bold text-foreground whitespace-nowrap">{currency(res.totalAmount)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{currency(res.depositPaid)}</span>
                        {res.balanceDue > 0 ? (
                          <span className="text-rose-600 dark:text-rose-400 font-bold ml-1.5">(Due: {currency(res.balanceDue)})</span>
                        ) : (
                          <span className="text-muted-foreground ml-1.5">(Cleared)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ${cfg.bg} ${cfg.color}`}>
                        <Icon className="size-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link to="/payments">
                        <Button size="sm" variant="outline" className="text-xs h-7">
                          Folio Bill
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Reservations Cards Grid */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((res) => {
            const cfg = STATUS_CONFIG[res.status];
            const Icon = cfg.icon;
            return (
              <div
                key={res.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-muted-foreground/30 shadow-2xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-muted-foreground">{res.bookingRef}</span>
                      <h3 className="text-lg font-bold text-foreground">{res.guestName}</h3>
                      <p className="text-xs text-muted-foreground">{res.roomNumber} · {res.roomType}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ${cfg.bg} ${cfg.color}`}>
                      <Icon className="size-3.5" />
                      {cfg.label}
                    </span>
                  </div>

                  <div className="my-3 space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Phone className="size-3.5 shrink-0 opacity-70" />
                      <span>{res.guestPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-3.5 shrink-0 opacity-70" />
                      <span>{res.checkInDate} → {res.checkOutDate} ({res.nights} nights)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="size-3.5 shrink-0 opacity-70" />
                      <span>Channel: {res.channel}</span>
                    </div>
                  </div>

                  <div className="mt-3 rounded-lg bg-secondary/40 p-2.5 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Booking:</span>
                      <span className="font-semibold">{currency(res.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deposit Paid:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{currency(res.depositPaid)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-border/50">
                      <span className="font-semibold">Balance Due:</span>
                      <span className={`font-bold ${res.balanceDue > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                        {currency(res.balanceDue)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 pt-3 border-t border-border">
                  <Link to="/payments" className="flex-1">
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      Folio Bill
                    </Button>
                  </Link>
                  <Link to="/rooms" className="flex-1">
                    <Button size="sm" className="w-full bg-[#22c55e] text-white hover:bg-[#16a34a] text-xs">
                      View Room
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
