import { CalendarClock, Scissors, Star, ShoppingBag } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { KpiCard } from "@/components/kpi-card";
import { cn } from "@/lib/utils";

const appointments = [
  { id: 1, time: "08:00", client: "Ama Owusu", service: "Braiding", staff: "Abena K" },
  { id: 2, time: "09:00", client: "Kofi Mensah", service: "Haircut", staff: "Kwame A" },
  { id: 3, time: "09:30", client: "Efua Sarpong", service: "Manicure", staff: "Akua B" },
  { id: 4, time: "10:00", client: "Adjoa Asante", service: "Relaxer", staff: "Abena K" },
  { id: 5, time: "10:30", client: "Yaw Darko", service: "Beard Trim", staff: "Kwame A" },
  { id: 6, time: "11:00", client: "Akosua Boateng", service: "Pedicure", staff: "Akua B" },
  { id: 7, time: "12:00", client: "Nana Ama", service: "Weaving", staff: "Abena K" },
  { id: 8, time: "13:00", client: "Kwesi Amponsah", service: "Dreadlock Maintenance", staff: "Kwame A" },
  { id: 9, time: "14:00", client: "Maame Esi", service: "Facial", staff: "Akua B" },
  { id: 10, time: "15:00", client: "Aba Koomson", service: "Full Set Nails", staff: "Abena K" },
];

/** Returns true if the appointment time is the current or next upcoming slot. */
function getSlotStatus(time: string): "past" | "current" | "upcoming" | "future" {
  const now = new Date();
  const [h, m] = time.split(":").map(Number);
  const slotMinutes = (h ?? 0) * 60 + (m ?? 0);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (slotMinutes < nowMinutes - 45) return "past";
  if (slotMinutes <= nowMinutes + 15) return "current";
  if (slotMinutes <= nowMinutes + 60) return "upcoming";
  return "future";
}

const staffColors: Record<string, string> = {
  "Abena K": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "Kwame A": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "Akua B": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

export function SalonDashboard() {
  return (
    <AppShell title="Salon Dashboard" subtitle="Today's schedule">
      <div className="space-y-6">
        {/* KPI Cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Appointments Today"
            value={24}
            delta={4}
            sub="vs yesterday"
            icon={CalendarClock}
            data-testid="kpi-appointments-today"
          />
          <KpiCard
            label="Commission Payable"
            value="GHS 3,840"
            sub="to 6 staff"
            icon={Scissors}
            data-testid="kpi-commission-payable"
          />
          <KpiCard
            label="Active Memberships"
            value={87}
            sub="12 expiring soon"
            icon={Star}
            data-testid="kpi-active-memberships"
          />
          <KpiCard
            label="Retail Product Revenue"
            value="GHS 1,250"
            delta={8.5}
            sub="today"
            icon={ShoppingBag}
            data-testid="kpi-retail-revenue"
          />
        </section>

        {/* Today's Appointments */}
        <section className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-4">
            <h2 className="text-sm font-semibold">Today's Appointments</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {appointments.length} appointments scheduled · current and upcoming highlighted
            </p>
          </div>

          <ul className="divide-y divide-border">
            {appointments.map((appt) => {
              const status = getSlotStatus(appt.time);
              const isCurrent = status === "current";
              const isUpcoming = status === "upcoming";

              return (
                <li
                  key={appt.id}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 transition-colors",
                    isCurrent && "bg-accent/10",
                    isUpcoming && "bg-secondary/50",
                    !isCurrent && !isUpcoming && "hover:bg-secondary/30",
                  )}
                >
                  {/* Time badge */}
                  <div
                    className={cn(
                      "flex w-14 shrink-0 items-center justify-center rounded-md px-2 py-1 text-xs font-semibold tabular-nums",
                      isCurrent
                        ? "bg-accent text-accent-foreground"
                        : isUpcoming
                          ? "bg-secondary text-foreground"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {appt.time}
                  </div>

                  {/* Current indicator dot */}
                  {isCurrent && (
                    <span className="size-2 shrink-0 animate-pulse rounded-full bg-accent" />
                  )}

                  {/* Client & service */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-sm font-medium",
                        status === "past" && "text-muted-foreground",
                      )}
                    >
                      {appt.client}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{appt.service}</p>
                  </div>

                  {/* Staff badge */}
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                      staffColors[appt.staff] ??
                        "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {appt.staff}
                  </span>

                  {/* Status label for current */}
                  {isCurrent && (
                    <span className="hidden shrink-0 rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-medium text-accent sm:inline-block">
                      Now
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
