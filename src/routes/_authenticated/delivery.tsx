import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Truck, Plug, Plus } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { StatusBadge, payTone } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { currency, deliveries, partners } from "@/lib/mos-data";

export const Route = createFileRoute("/_authenticated/delivery")({
  head: () => ({
    meta: [
      { title: "Delivery — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Order-to-dispatch queue, courier assignment, delivery status tracking and partner performance for merchant fulfilment.",
      },
      { property: "og:title", content: "Delivery — Trite Merchant OS" },
      {
        property: "og:description",
        content: "Delivery fees ride on the same payment object as the sale that generated them.",
      },
    ],
  }),
  component: Delivery,
});

const lanes = [
  { key: "ready", label: "Ready for pickup" },
  { key: "in-transit", label: "In transit" },
  { key: "delivered", label: "Delivered" },
  { key: "delayed", label: "Delayed" },
] as const;

function Delivery() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  return (
    <AppShell
      title="Delivery & fulfilment"
      subtitle="4 active orders · 3 connected partners"
      actions={
        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/85">
            <Plus className="size-4" /> Assign courier
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <section className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
          {lanes.map((lane) => {
            const items = deliveries.filter((d) => d.status === lane.key);
            return (
              <div key={lane.key} className="rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
                  <h2 className="text-xs font-semibold tracking-wide uppercase">{lane.label}</h2>
                  <span className="num rounded-full bg-secondary px-2 text-xs">{items.length}</span>
                </div>
                <div className="space-y-2 p-3">
                  {items.length === 0 && (
                    <p className="py-6 text-center text-xs text-muted-foreground">Nothing here</p>
                  )}
                  {items.map((d) => (
                    <article
                      key={d.id}
                      className="rounded-md border border-border bg-background p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="num text-xs font-semibold">{d.id}</span>
                        <StatusBadge tone={payTone[d.status] ?? "neutral"}>{d.status}</StatusBadge>
                      </div>
                      <p className="mt-2 text-sm font-medium">{d.customer}</p>
                      <p className="text-xs text-muted-foreground">{d.branch}</p>
                      <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-xs">
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Truck className="size-3.5" /> {d.partner}
                        </span>
                        <span className="num font-medium">{currency(d.fee)}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">{d.eta}</p>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border p-4">
              <Plug className="size-4" />
              <h2 className="text-sm font-semibold">Courier partners</h2>
            </div>
            <ul className="divide-y divide-border">
              {partners.map((p) => (
                <li key={p.name} className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{p.name}</span>
                    <StatusBadge tone={p.connected ? "good" : "neutral"}>
                      {p.connected ? "Connected" : "Not connected"}
                    </StatusBadge>
                  </div>
                  {p.connected ? (
                    <p className="num mt-1 text-xs text-muted-foreground">
                      {p.onTime}% on time · {currency(p.costPerDelivery)} avg per delivery
                    </p>
                  ) : (
                    <Button variant="outline" size="sm" className="mt-2 w-full">
                      Connect partner
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Fulfilment performance</h2>
            <dl className="mt-3 space-y-2 text-sm">
              {[
                ["On-time rate", "91%"],
                ["Avg dispatch time", "22 min"],
                ["Delivery revenue", currency(4_820)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="num font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
