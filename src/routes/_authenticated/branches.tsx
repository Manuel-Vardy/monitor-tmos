import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Users, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { branches, currency } from "@/lib/mos-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/branches")({
  head: () => ({
    meta: [
      { title: "Branch management — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Create branches, assign staff, set per-branch settlement destinations and toggle roll-up versus per-branch reporting.",
      },
      { property: "og:title", content: "Branch management — Trite Merchant OS" },
      {
        property: "og:description",
        content: "Multi-branch is first class: per-branch stock, staff, sales and settlement.",
      },
    ],
  }),
  component: Branches,
});

function Branches() {
  const [view, setView] = useState<"rollup" | "per-branch">("rollup");
  const list = branches.slice(1);

  return (
    <AppShell
      title="Branch management"
      subtitle="4 branches · 34 staff · Sarpong Retail Ltd"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border border-border p-0.5">
            {(["rollup", "per-branch"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "rounded px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-colors",
                  view === v
                    ? v === "rollup"
                      ? "bg-emerald-600 text-white"
                      : "bg-indigo-600 text-white"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {v === "rollup" ? "Roll-up" : "Per branch"}
              </button>
            ))}
          </div>
          <Button size="sm" className="h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm bg-accent text-accent-foreground hover:bg-accent/85 shrink-0">
            <Plus className="size-3.5 sm:size-4" />
            <span className="hidden sm:inline">Add branch</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {view === "rollup" && (
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { l: "Consolidated revenue", v: currency(482_310) },
              { l: "Stock value held", v: currency(611_400) },
              { l: "Settlement accounts", v: "3 destinations" },
            ].map((s) => (
              <div key={s.l} className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs tracking-wide text-muted-foreground uppercase">{s.l}</p>
                <p className="num mt-2 text-xl font-bold">{s.v}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((b) => {
            const up = b.growth >= 0;
            return (
              <div key={b.id} className="rounded-lg border border-border bg-card p-4">
                {/* Header: name + status badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-display text-base font-semibold leading-tight truncate">{b.name}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{b.city}</p>
                  </div>
                  <StatusBadge tone={up ? "good" : "warn"} className="shrink-0">
                    {up ? "Growing" : "Declining"}
                  </StatusBadge>
                </div>

                {/* Stats — 2-col on mobile, 3-col on sm+ */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-3 text-sm">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="num font-semibold text-sm break-all">{currency(b.revenue)}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Stock value</p>
                    <p className="num font-semibold text-sm break-all">{currency(b.stockValue)}</p>
                  </div>
                  {/* Week-on-week: full-width on mobile (col-span-2), auto on sm+ */}
                  <div className="col-span-2 sm:col-span-1 flex sm:block items-center gap-3">
                    <p className="text-xs text-muted-foreground">Week on week</p>
                    <p
                      className={cn(
                        "num inline-flex items-center gap-0.5 font-semibold",
                        up ? "text-accent" : "text-destructive",
                      )}
                    >
                      {up ? (
                        <ArrowUpRight className="size-3.5" />
                      ) : (
                        <ArrowDownRight className="size-3.5" />
                      )}
                      {Math.abs(b.growth)}%
                    </p>
                  </div>
                </div>

                {/* Staff & settlement */}
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="size-3.5 shrink-0" /> {b.staff} staff assigned
                  </span>
                  <span className="inline-flex items-center gap-1.5 min-w-0">
                    <Wallet className="size-3.5 shrink-0" />
                    <span className="truncate">{b.settlement}</span>
                  </span>
                </div>

                {/* Action buttons */}
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm">
                    Manage staff
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm">
                    Branch dashboard
                  </Button>
                </div>
              </div>
            );
          })}

          <button className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/50 p-6 text-center transition-colors hover:border-accent">
            <Plus className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">Add another branch</p>
            <p className="max-w-56 text-xs text-muted-foreground">
              Unlimited branches under one organisation, each with its own stock and settlement
              destination.
            </p>
          </button>
        </div>
      </div>
    </AppShell>
  );
}
