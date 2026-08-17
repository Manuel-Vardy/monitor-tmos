import { Link } from "@tanstack/react-router";
import {
  BedDouble,
  CheckCircle2,
  Clock,
  Banknote,
  Plus,
  Sparkles,
  CreditCard,
  UserCheck,
  Bell,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { KpiCard } from "@/components/kpi-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/mos-data";
import {
  HOTEL_ROOMS,
  HOTEL_RESERVATIONS,
  HOUSEKEEPING_TASKS,
  HOTEL_PAYMENTS,
  HOTEL_SUMMARY,
} from "@/lib/hotel-data";

export function HotelDashboard() {
  return (
    <AppShell
      title="Hotel & Hospitality Operations"
      subtitle="Front-desk room bookings, check-ins, guest folio billing, and housekeeping turnovers"
      actions={
        <div className="hidden lg:flex flex-wrap items-center gap-2">
          <Link to="/reservations">
            <Button size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a]">
              <Plus className="size-4" /> New Booking
            </Button>
          </Link>
          <Link to="/rooms">
            <Button size="sm" variant="outline">
              <BedDouble className="size-4" /> Room Inventory
            </Button>
          </Link>
          <Link to="/payments">
            <Button size="sm" variant="outline">
              <CreditCard className="size-4" /> Process Folio
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Mobile: green hero card + 4 stat cards underneath */}
        <div className="lg:hidden space-y-3">
          {/* Greeting row */}
          <div className="flex items-center justify-between px-0.5">
            <div>
              <p className="text-xs text-muted-foreground">Good morning 🌤</p>
              <h2 className="text-xl font-bold leading-tight">Hotel</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 shadow-xs">
                <span className="size-1.5 rounded-full bg-emerald-500" /> Live
              </span>
              <button className="relative grid size-9 place-items-center rounded-full bg-card shadow-xs border border-border">
                <Bell className="size-4" />
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500" />
              </button>
            </div>
          </div>

          {/* Green hero card — Occupancy Rate */}
          <div className="relative overflow-hidden rounded-2xl bg-[#22c55e] p-5 text-white shadow-lg">
            {/* decorative circle */}
            <div
              className="pointer-events-none absolute rounded-full bg-white/10"
              style={{ width: "260px", height: "260px", bottom: "-120px", right: "-60px" }}
            />

            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <p className="text-[11px] font-bold tracking-widest uppercase text-white/80">Occupancy Rate</p>
                <BedDouble className="size-6 opacity-70" />
              </div>
              <p className="num mt-2 text-3xl font-extrabold leading-none tracking-tight">
                {HOTEL_SUMMARY.occupancyRate}%
              </p>
              <div className="mt-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/80">
                  Today's Revenue · {currency(HOTEL_SUMMARY.totalRevenueToday)}
                </p>
                <p className="mt-0.5 text-xs text-white/75">
                  +6.5% · {HOTEL_SUMMARY.occupiedRooms} / {HOTEL_SUMMARY.totalRooms} rooms occupied
                </p>
              </div>

              {/* Full-width action buttons */}
              <div className="mt-4 flex gap-3">
                <Link to="/reservations" className="flex-1">
                  <span className="block rounded-xl bg-[#166534] py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#14532d]">
                    New Booking
                  </span>
                </Link>
                <Link to="/rooms" className="flex-1">
                  <span className="block rounded-xl bg-white/20 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/30">
                    Room Inventory
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* 4 stat cards below the hero */}
          <div className="grid grid-cols-2 gap-2.5">
            <KpiCard
              label="Occupancy Rate"
              value={`${HOTEL_SUMMARY.occupancyRate}%`}
              delta={6.5}
              sub={`${HOTEL_SUMMARY.occupiedRooms} / ${HOTEL_SUMMARY.totalRooms} rooms`}
              icon={BedDouble}
            />
            <KpiCard
              label="Today's Revenue"
              value={currency(HOTEL_SUMMARY.totalRevenueToday)}
              sub={`${HOTEL_PAYMENTS.length} folios settled`}
              icon={Banknote}
            />
            <KpiCard
              label="Active Bookings"
              value={HOTEL_SUMMARY.totalActiveReservations}
              sub="Checked in & confirmed"
              icon={UserCheck}
            />
            <KpiCard
              label="Pending Housekeeping"
              value={HOTEL_SUMMARY.pendingHousekeeping}
              sub="Turnover rooms in queue"
              icon={Sparkles}
            />
          </div>
        </div>

        {/* Desktop: standard 4-column KPI grid */}
        <section className="hidden lg:grid grid-cols-4 gap-3">
          <KpiCard
            label="Occupancy Rate"
            value={`${HOTEL_SUMMARY.occupancyRate}%`}
            delta={6.5}
            sub={`${HOTEL_SUMMARY.occupiedRooms} / ${HOTEL_SUMMARY.totalRooms} rooms occupied`}
            icon={BedDouble}
          />
          <KpiCard
            label="Today's Revenue"
            value={currency(HOTEL_SUMMARY.totalRevenueToday)}
            sub={`${HOTEL_PAYMENTS.length} settled guest folios`}
            icon={Banknote}
          />
          <KpiCard
            label="Active Bookings"
            value={HOTEL_SUMMARY.totalActiveReservations}
            sub="Checked in & confirmed"
            icon={UserCheck}
          />
          <KpiCard
            label="Pending Housekeeping"
            value={HOTEL_SUMMARY.pendingHousekeeping}
            sub="Turnover rooms in queue"
            icon={Sparkles}
          />
        </section>

        {/* Operations Overview Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Active Guest Reservations */}
          <Card className="p-0 overflow-hidden shadow-none">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <BedDouble className="size-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-semibold">Active Guest Bookings</h2>
              </div>
              <Link to="/reservations" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                View All Bookings →
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {HOTEL_RESERVATIONS.map((res) => (
                <li key={res.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div>
                    <p className="font-semibold text-sm">{res.guestName}</p>
                    <p className="text-xs text-muted-foreground">
                      {res.roomNumber} ({res.roomType}) · {res.nights} nights
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        res.status === "Checked In"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200"
                          : "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200"
                      }`}
                    >
                      {res.status}
                    </span>
                    <p className="font-bold text-sm text-foreground mt-0.5">
                      {currency(res.totalAmount)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {/* Housekeeping Turnover Queue */}
          <Card className="p-0 overflow-hidden shadow-none">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-sm font-semibold">Housekeeping Turnover Queue</h2>
              </div>
              <Link to="/housekeeping" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                Full Turnover Log →
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {HOUSEKEEPING_TASKS.map((task) => (
                <li key={task.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div>
                    <p className="font-semibold text-sm">{task.roomNumber} — {task.cleaningType}</p>
                    <p className="text-xs text-muted-foreground">Cleaner: {task.assignedStaff} · {task.timeLogged}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        task.status === "Inspected & Passed"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200"
                          : task.status === "In Progress"
                            ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200"
                            : "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Room Inventory Status Cards Grid */}
        <Card className="p-5 shadow-none">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <div className="flex items-center gap-2">
              <BedDouble className="size-4 text-foreground" />
              <h2 className="text-sm font-semibold">Live Room Status Grid</h2>
            </div>
            <Link to="/rooms">
              <Button size="sm" variant="outline" className="text-xs">
                Room Management
              </Button>
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {HOTEL_ROOMS.map((room) => (
              <div
                key={room.id}
                className={`rounded-xl border p-3.5 flex flex-col justify-between ${
                  room.status === "Occupied"
                    ? "bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900"
                    : room.status === "Vacant Clean"
                      ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900"
                      : "bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900"
                }`}
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">{room.floor}</span>
                  <h3 className="text-lg font-bold text-foreground">{room.roomNumber}</h3>
                  <p className="text-[11px] text-muted-foreground truncate">{room.roomType}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-border/50 flex justify-between items-center">
                  <span className="text-xs font-bold">{currency(room.ratePerNight)}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      room.status === "Occupied"
                        ? "text-amber-700 dark:text-amber-300"
                        : room.status === "Vacant Clean"
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-blue-700 dark:text-blue-300"
                    }`}
                  >
                    {room.status === "Vacant Clean" ? "Clean" : room.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
