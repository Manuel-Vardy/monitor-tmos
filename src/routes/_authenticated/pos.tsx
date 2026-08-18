import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Smartphone,
  CreditCard,
  Landmark,
  Coins,
  Banknote,
  Trash2,
  QrCode,
  Check,
  Loader2,
  Lock,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { currency, posCatalogue } from "@/lib/mos-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/pos")({
  head: () => ({
    meta: [
      { title: "Checkout & POS — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Tablet-ready point of sale accepting mobile money, card, bank transfer, stablecoin and split payments with live status.",
      },
      { property: "og:title", content: "Checkout & POS — Trite Merchant OS" },
      {
        property: "og:description",
        content: "Complete a counter sale in under 15 seconds, online or offline.",
      },
    ],
  }),
  component: Pos,
});

const methods = [
  { id: "momo",   label: "Mobile money", hint: "MTN · Telecel",    icon: Smartphone, disabled: false },
  { id: "card",   label: "Card",         hint: "Visa · Mastercard", icon: CreditCard, disabled: true  },
  { id: "bank",   label: "Bank transfer",hint: "GhIPSS instant",   icon: Landmark,   disabled: true  },
  { id: "stable", label: "Stablecoin",   hint: "USDC · USDT",      icon: Coins,      disabled: true  },
  { id: "cash",   label: "Cash",         hint: "Till drawer",       icon: Banknote,   disabled: false },
];

const categories = ["All", "Beverages", "Groceries", "Personal care", "Apparel", "Snacks"];

function Pos() {
  const [cart, setCart] = useState<Record<string, number>>({ "TRT-1002": 2, "TRT-1010": 3 });
  const [cat, setCat] = useState("All");
  const [method, setMethod] = useState("momo");
  const [phase, setPhase] = useState<"idle" | "pending" | "done">("idle");

  const list = posCatalogue.filter((p) => cat === "All" || p.category === cat);
  const lines = useMemo(
    () =>
      Object.entries(cart).map(([sku, qty]) => {
        const p = posCatalogue.find((x) => x.sku === sku)!;
        return { ...p, qty };
      }),
    [cart],
  );
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const vat = subtotal * 0.15;
  const levies = subtotal * 0.06;
  const total = subtotal + vat + levies;

  const add = (sku: string) => setCart((c) => ({ ...c, [sku]: (c[sku] ?? 0) + 1 }));
  const dec = (sku: string) =>
    setCart((c) => {
      const next = { ...c };
      const q = (next[sku] ?? 0) - 1;
      if (q <= 0) delete next[sku];
      else next[sku] = q;
      return next;
    });

  const charge = () => {
    setPhase("pending");
    setTimeout(() => setPhase("done"), 1800);
  };

  return (
    <AppShell
      title="Checkout / POS"
      subtitle="Osu Flagship · Till 2 · Ama Boateng"
      actions={
        <Button variant="outline" size="sm">
          <QrCode className="size-4" /> QR at till
        </Button>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-lg border border-border bg-card p-4">
          <div className="mb-4 flex flex-wrap gap-2">
            {categories.map((c, i) => {
              const colors = [
                "border-emerald-600 bg-emerald-600 text-white",
                "border-blue-600 bg-blue-600 text-white",
                "border-purple-600 bg-purple-600 text-white",
                "border-amber-600 bg-amber-600 text-white",
                "border-rose-600 bg-rose-600 text-white",
                "border-teal-600 bg-teal-600 text-white",
                "border-indigo-600 bg-indigo-600 text-white",
              ];
              const activeColor = colors[i % colors.length];
              return (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors shadow-xs",
                    cat === c ? activeColor : "border-border hover:bg-secondary text-foreground",
                  )}
                >
                  {c}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-4">
            {list.map((p) => (
              <button
                key={p.sku}
                onClick={() => add(p.sku)}
                className="group flex min-h-28 flex-col justify-between rounded-lg border border-border bg-background p-3 text-left transition-all hover:border-accent hover:shadow-sm active:scale-[0.98]"
              >
                <div>
                  <p className="text-sm leading-tight font-medium">{p.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{p.sku}</p>
                </div>
                <p className="num mt-3 text-base font-bold">{currency(p.price)}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-sm font-semibold">Current sale</h2>
            <button
              onClick={() => {
                setCart({});
                setPhase("idle");
              }}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3.5" /> Clear
            </button>
          </div>

          <div className="max-h-64 flex-1 divide-y divide-border overflow-y-auto">
            {lines.length === 0 && (
              <p className="p-8 text-center text-sm text-muted-foreground">
                Tap a product to start the sale.
              </p>
            )}
            {lines.map((l) => (
              <div key={l.sku} className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{l.name}</p>
                  <p className="num text-xs text-muted-foreground">{currency(l.price)} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => dec(l.sku)}
                    className="size-8 rounded-md border border-border text-sm hover:bg-secondary"
                  >
                    −
                  </button>
                  <span className="num w-7 text-center text-sm font-medium">{l.qty}</span>
                  <button
                    onClick={() => add(l.sku)}
                    className="size-8 rounded-md border border-border text-sm hover:bg-secondary"
                  >
                    +
                  </button>
                </div>
                <span className="num w-20 text-right text-sm font-semibold">
                  {currency(l.price * l.qty)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 border-t border-border p-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="num">{currency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>VAT 15%</span>
              <span className="num">{currency(vat)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>NHIL + GETFund 6%</span>
              <span className="num">{currency(levies)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-lg font-bold">
              <span>Total</span>
              <span className="num">{currency(total)}</span>
            </div>
          </div>

          <div className="border-t border-border p-4">
            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Payment method
            </p>
            <div className="grid grid-cols-3 gap-2">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => !m.disabled && setMethod(m.id)}
                  disabled={m.disabled}
                  className={cn(
                    "relative flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition-all shadow-2xs",
                    m.disabled
                      ? "cursor-not-allowed border-border/40 bg-muted/40 opacity-70"
                      : method === m.id
                        ? "border-emerald-700 bg-emerald-700 text-white shadow-xs"
                        : "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 hover:border-emerald-300 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-950/70",
                  )}
                >
                  {m.disabled && (
                    <span className="absolute top-1.5 right-1.5 flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                      <Lock className="size-2.5" /> Soon
                    </span>
                  )}
                  <m.icon
                    className={cn(
                      "size-4",
                      m.disabled
                        ? "text-muted-foreground"
                        : method === m.id
                          ? "text-white"
                          : "text-emerald-600 dark:text-emerald-400",
                    )}
                  />
                  <span className="text-xs leading-tight font-semibold">{m.label}</span>
                  <span
                    className={cn(
                      "text-[10px] leading-tight",
                      m.disabled
                        ? "text-muted-foreground"
                        : method === m.id
                          ? "text-emerald-100"
                          : "text-emerald-700 dark:text-emerald-400",
                    )}
                  >
                    {m.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border p-4">
            {phase === "idle" && (
              <Button
                onClick={charge}
                disabled={lines.length === 0}
                className="h-14 w-full bg-accent text-base font-semibold text-accent-foreground hover:bg-accent/85"
              >
                Charge {currency(total)}
              </Button>
            )}
            {phase === "pending" && (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary p-4">
                <Loader2 className="size-5 animate-spin" />
                <div>
                  <p className="text-sm font-medium">Awaiting customer confirmation…</p>
                  <p className="text-xs text-muted-foreground">
                    Prompt sent via Trite · reference TRX-88215
                  </p>
                </div>
              </div>
            )}
            {phase === "done" && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-accent bg-accent/20 p-4">
                  <Check className="size-5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Payment confirmed</p>
                    <p className="text-xs text-muted-foreground">
                      {currency(total)} · settling to GCB ****4410
                    </p>
                  </div>
                  <StatusBadge tone="good">confirmed</StatusBadge>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {["SMS", "Email", "WhatsApp", "Print"].map((r) => (
                    <Button key={r} variant="outline" size="sm">
                      {r}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setCart({});
                    setPhase("idle");
                  }}
                >
                  New sale
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
