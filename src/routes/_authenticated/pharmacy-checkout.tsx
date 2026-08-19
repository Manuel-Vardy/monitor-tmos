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
  Stethoscope,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/mos-data";
import { PHARMACY_MEDICATIONS } from "@/lib/pharmacy-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/pharmacy-checkout")({
  head: () => ({
    meta: [
      { title: "Pharmacy Checkout / POS — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Pharmacy point-of-sale for over-the-counter and prescription medicines with VAT, NHIL & GETFund levies.",
      },
      { property: "og:title", content: "Pharmacy Checkout / POS — Trite Merchant OS" },
      {
        property: "og:description",
        content: "Dispense and collect payment for medications in under 15 seconds.",
      },
    ],
  }),
  component: PharmacyCheckout,
});

const methods = [
  { id: "momo",   label: "Mobile money", hint: "MTN · Telecel",    icon: Smartphone, disabled: false },
  { id: "card",   label: "Card",         hint: "Visa · Mastercard", icon: CreditCard, disabled: true  },
  { id: "bank",   label: "Bank transfer",hint: "GhIPSS instant",   icon: Landmark,   disabled: true  },
  { id: "stable", label: "Stablecoin",   hint: "USDC · USDT",      icon: Coins,      disabled: true  },
  { id: "cash",   label: "Cash",         hint: "Till drawer",       icon: Banknote,   disabled: false },
];

const categories = [
  "All",
  "Antibiotics",
  "Analgesics",
  "Antihypertensives",
  "Antidiabetics",
  "Vitamins & Supplements",
];

function PharmacyCheckout() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cat, setCat] = useState("All");
  const [method, setMethod] = useState("momo");
  const [phase, setPhase] = useState<"idle" | "pending" | "done">("idle");

  const list = PHARMACY_MEDICATIONS.filter(
    (m) => cat === "All" || m.category === cat,
  );
  const lines = useMemo(
    () =>
      Object.entries(cart).map(([medId, qty]) => {
        const m = PHARMACY_MEDICATIONS.find((x) => x.id === medId)!;
        return { ...m, qty };
      }),
    [cart],
  );
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  const vat = subtotal * 0.15;
  const levies = subtotal * 0.06;
  const total = subtotal + vat + levies;

  const add = (medId: string) =>
    setCart((c) => ({ ...c, [medId]: (c[medId] ?? 0) + 1 }));
  const dec = (medId: string) =>
    setCart((c) => {
      const next = { ...c };
      const q = (next[medId] ?? 0) - 1;
      if (q <= 0) delete next[medId];
      else next[medId] = q;
      return next;
    });

  const charge = () => {
    setPhase("pending");
    setTimeout(() => setPhase("done"), 1800);
  };

  return (
    <AppShell
      title="Pharmacy Checkout / POS"
      subtitle="Osu Flagship · Till 2 · Pharm. Janet Boateng"
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
                "border-[#22c55e] bg-[#22c55e] text-white",
                "border-sky-600 bg-sky-600 text-white",
                "border-purple-600 bg-purple-600 text-white",
                "border-amber-600 bg-amber-600 text-white",
                "border-rose-600 bg-rose-600 text-white",
                "border-teal-600 bg-teal-600 text-white",
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
            {list.map((m) => (
              <button
                key={m.id}
                onClick={() => add(m.id)}
                className="group flex min-h-28 flex-col justify-between rounded-lg border border-border bg-background p-3 text-left transition-all hover:border-[#22c55e] hover:shadow-sm active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm leading-tight font-medium">{m.brandName}</p>
                    {m.prescriptionRequired && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                        <Stethoscope className="size-2.5" /> Rx
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                    {m.drugName}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {m.strength} · {m.dosageForm}
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="num text-base font-bold">{currency(m.unitPrice)}</p>
                  <span
                    className={cn(
                      "text-[10px] font-semibold rounded-full px-1.5 py-0.5",
                      m.stockLevel <= m.reorderLevel
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
                    )}
                  >
                    {m.stockLevel} in stock
                  </span>
                </div>
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
                Tap a medication to start the sale.
              </p>
            )}
            {lines.map((l) => (
              <div key={l.id} className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{l.brandName}</p>
                  <p className="num text-xs text-muted-foreground">{currency(l.unitPrice)} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => dec(l.id)}
                    className="size-8 rounded-md border border-border text-sm hover:bg-secondary"
                  >
                    −
                  </button>
                  <span className="num w-7 text-center text-sm font-medium">{l.qty}</span>
                  <button
                    onClick={() => add(l.id)}
                    className="size-8 rounded-md border border-border text-sm hover:bg-secondary"
                  >
                    +
                  </button>
                </div>
                <span className="num w-20 text-right text-sm font-semibold">
                  {currency(l.unitPrice * l.qty)}
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
                        ? "border-[#166534] bg-[#166534] text-white shadow-xs"
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
                className="h-14 w-full bg-[#22c55e] text-base font-semibold text-white hover:bg-[#16a34a]"
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
                    Prompt sent via Trite · reference PHARM-88215
                  </p>
                </div>
              </div>
            )}
            {phase === "done" && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-[#22c55e] bg-[#22c55e]/20 p-4">
                  <Check className="size-5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Dispense confirmed</p>
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
