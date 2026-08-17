import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Plus, ArrowLeftRight, Link2, Search, Download, Boxes } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { currency, products as seedProducts, branches, type Product } from "@/lib/mos-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Product catalogue, per-branch stock levels, low-stock thresholds, branch transfers and restock API links.",
      },
      { property: "og:title", content: "Inventory — Trite Merchant OS" },
      {
        property: "og:description",
        content: "Real-time stock per branch that decrements automatically on every sale.",
      },
    ],
  }),
  component: Inventory,
});

const branchOptions = branches.filter((b) => b.id !== "all");
const categories = ["Personal care", "Beverages", "Groceries", "Apparel", "Snacks", "Other"];

type FormState = {
  name: string;
  variant: string;
  category: string;
  price: string;
  stock: string;
  threshold: string;
  branch: string;
};

const emptyForm: FormState = {
  name: "",
  variant: "",
  category: "Groceries",
  price: "",
  stock: "",
  threshold: "",
  branch: branchOptions[0]!.name,
};

function AddProductDialog({ onAdd }: { onAdd: (p: Product) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Product name is required";
    if (form.price === "" || Number(form.price) < 0 || Number.isNaN(Number(form.price)))
      next.price = "Enter a valid price";
    if (form.stock === "" || Number(form.stock) < 0 || Number.isNaN(Number(form.stock)))
      next.stock = "Enter a valid quantity";
    if (form.threshold === "" || Number(form.threshold) < 0 || Number.isNaN(Number(form.threshold)))
      next.threshold = "Enter a valid threshold";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const product: Product = {
      sku: `TRT-${Math.floor(2000 + Math.random() * 7999)}`,
      name: form.name.trim(),
      variant: form.variant.trim() || "Standard",
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      threshold: Number(form.threshold),
      branch: form.branch,
    };
    onAdd(product);
    toast.success(`${product.name} added`, { description: `${product.sku} · ${product.branch}` });
    setForm(emptyForm);
    setErrors({});
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setErrors({});
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm bg-accent text-accent-foreground hover:bg-accent/85 shrink-0">
          <Plus className="size-3.5 sm:size-4" />
          <span className="hidden sm:inline">Add product</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add product</DialogTitle>
          <DialogDescription>
            New SKUs are stocked at the selected branch and sync to POS immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="p-name">Product name</Label>
            <Input
              id="p-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Shea Butter Tub"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-variant">Variant</Label>
            <Input
              id="p-variant"
              value={form.variant}
              onChange={(e) => set("variant", e.target.value)}
              placeholder="500g"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-price">Price (GHS)</Label>
            <Input
              id="p-price"
              inputMode="decimal"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder="65"
            />
            {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Branch</Label>
            <Select value={form.branch} onValueChange={(v) => set("branch", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {branchOptions.map((b) => (
                  <SelectItem key={b.id} value={b.name}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-stock">Opening stock</Label>
            <Input
              id="p-stock"
              inputMode="numeric"
              value={form.stock}
              onChange={(e) => set("stock", e.target.value)}
              placeholder="24"
            />
            {errors.stock && <p className="text-xs text-destructive">{errors.stock}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-threshold">Low-stock threshold</Label>
            <Input
              id="p-threshold"
              inputMode="numeric"
              value={form.threshold}
              onChange={(e) => set("threshold", e.target.value)}
              placeholder="10"
            />
            {errors.threshold && <p className="text-xs text-destructive">{errors.threshold}</p>}
          </div>

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/85">
              Add product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Inventory() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Product[]>(seedProducts);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const rows = items.filter((p) =>
    (p.name + p.sku + p.category).toLowerCase().includes(q.toLowerCase()),
  );

  const stockValue = useMemo(() => items.reduce((sum, p) => sum + p.price * p.stock, 0), [items]);

  return (
    <AppShell
      title="Inventory"
      subtitle={`${items.length} SKUs across 4 branches · stock value ${currency(stockValue)}`}
      actions={
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button variant="outline" size="sm" className="h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm shrink-0">
            <ArrowLeftRight className="size-3.5 sm:size-4" />
            <span className="hidden sm:inline">Transfer stock</span>
            <span className="sm:hidden">Transfer</span>
          </Button>
          <AddProductDialog onAdd={(p) => setItems((prev) => [p, ...prev])} />
        </div>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <section className="rounded-lg border border-border bg-card">
          <div className="flex flex-col gap-2.5 p-3 border-b border-border sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search SKU, product or category"
                className="h-9 w-full rounded-md border border-border bg-background pr-3 pl-9 text-sm outline-none focus:border-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 sm:flex-initial min-w-0">
                <DateRangePicker value={dateRange} onChange={setDateRange} />
              </div>
              <Button variant="outline" size="sm" className="shrink-0">
                <Download className="size-4" /> <span className="hidden sm:inline">CSV</span>
              </Button>
            </div>
          </div>

          {/* Mobile Card List View */}
          <div className="divide-y divide-border sm:hidden">
            {rows.map((p) => {
              const pct = Math.min(100, (p.stock / Math.max(1, p.threshold * 3)) * 100);
              const low = p.stock <= p.threshold;
              return (
                <div key={p.sku} className="p-3.5 space-y-2 transition-colors hover:bg-secondary/40">
                  {/* Top: Name & Price */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm leading-snug text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {p.variant} · {p.category}
                      </p>
                    </div>
                    <p className="num text-sm font-bold text-foreground shrink-0">{currency(p.price)}</p>
                  </div>

                  {/* Middle: SKU, Branch & Stock Status */}
                  <div className="flex items-center justify-between gap-2 pt-0.5 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                      <span className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded border border-border/70 shrink-0 font-medium">
                        {p.sku}
                      </span>
                      <span>·</span>
                      <span className="truncate">{p.branch}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="num font-semibold text-foreground">
                        {p.stock} <span className="text-[10px] font-normal text-muted-foreground">in stock</span>
                      </span>
                      <StatusBadge tone={p.stock === 0 ? "bad" : low ? "warn" : "good"}>
                        {p.stock === 0 ? "Out" : low ? "Low" : "Healthy"}
                      </StatusBadge>
                    </div>
                  </div>

                  {/* Stock Bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        p.stock === 0 ? "bg-destructive" : low ? "bg-warning" : "bg-accent",
                      )}
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="px-4 py-2.5 font-medium">Product</th>
                  <th className="px-4 py-2.5 font-medium">SKU</th>
                  <th className="px-4 py-2.5 font-medium">Branch</th>
                  <th className="px-4 py-2.5 text-right font-medium">Price</th>
                  <th className="px-4 py-2.5 text-right font-medium">On hand</th>
                  <th className="px-4 py-2.5 font-medium">Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((p) => {
                  const pct = Math.min(100, (p.stock / Math.max(1, p.threshold * 3)) * 100);
                  const low = p.stock <= p.threshold;
                  return (
                    <tr key={p.sku} className="transition-colors hover:bg-secondary/60">
                      <td className="px-4 py-3">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.variant} · {p.category}
                        </p>
                      </td>
                      <td className="num px-4 py-3 text-muted-foreground">{p.sku}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.branch}</td>
                      <td className="num px-4 py-3 text-right">{currency(p.price)}</td>
                      <td className="num px-4 py-3 text-right font-semibold">{p.stock}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                p.stock === 0 ? "bg-destructive" : low ? "bg-warning" : "bg-accent",
                              )}
                              style={{ width: `${Math.max(pct, 4)}%` }}
                            />
                          </div>
                          <StatusBadge tone={p.stock === 0 ? "bad" : low ? "warn" : "good"}>
                            {p.stock === 0 ? "Out" : low ? "Low" : "Healthy"}
                          </StatusBadge>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {rows.length === 0 && (
            <div className="flex flex-col items-center gap-3 p-12 text-center">
              <Boxes className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">No products match "{q}"</p>
              <Button variant="outline" size="sm" onClick={() => setQ("")}>
                Clear search
              </Button>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <Link2 className="size-4" />
              <h2 className="text-sm font-semibold">Auto stock API</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Let suppliers and external systems push stock in or pull levels out.
            </p>
            <div className="mt-3 space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Webhook endpoint</label>
              <div className="num truncate rounded-md border border-border bg-background px-3 py-2 text-xs">
                https://api.trite.tech/mos/v1/stock/hook
              </div>
              <label className="text-xs font-medium text-muted-foreground">Restock link</label>
              <div className="num truncate rounded-md border border-border bg-background px-3 py-2 text-xs">
                trite.tech/r/sarpong-osu-8821
              </div>
            </div>
            <Button
              className="mt-3 w-full bg-accent text-accent-foreground hover:bg-accent/85"
              size="sm"
            >
              Generate supplier link
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Batch & expiry</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {[
                {
                  name: "Sobolo Concentrate",
                  batch: "B-2291",
                  exp: "12 Aug",
                  tone: "warn" as const,
                },
                { name: "Cocoa Powder", batch: "B-2277", exp: "03 Sep", tone: "good" as const },
                { name: "Bottled Water", batch: "B-2310", exp: "14 Nov", tone: "good" as const },
              ].map((b) => (
                <li key={b.batch} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate">{b.name}</p>
                    <p className="num text-xs text-muted-foreground">{b.batch}</p>
                  </div>
                  <StatusBadge tone={b.tone}>{b.exp}</StatusBadge>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Suppliers</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {["Ashanti Foods Ltd", "Accra Packaging Co", "Kumasi Cocoa Union"].map((s) => (
                <li key={s} className="flex items-center justify-between">
                  <span>{s}</span>
                  <span className="text-xs text-muted-foreground">Active</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
