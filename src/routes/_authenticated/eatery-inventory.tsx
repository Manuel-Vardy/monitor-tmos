import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Plus,
  Search,
  Boxes,
  AlertTriangle,
  X,
  Trash2,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/mos-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/eatery-inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — Trite Merchant OS" },
      {
        name: "description",
        content: "Track drinks, ingredients and raw materials for the eatery.",
      },
      { property: "og:title", content: "Inventory — Trite Merchant OS" },
    ],
  }),
  component: EateryInventory,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type DrinkCategory = "Soft Drinks" | "House-Made" | "Beer & Malt" | "Water" | "Juices" | "Spirits";

type InventoryItem = {
  id: string;
  name: string;
  category: DrinkCategory;
  unit: string;
  quantity: number;
  threshold: number;
  unitCost: number;
  supplier: string;
  lastRestocked: string;
};

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_INVENTORY: InventoryItem[] = [
  // Soft Drinks
  { id: "INV-001", name: "Coca-Cola Bottles (24-pack)", category: "Soft Drinks", unit: "packs", quantity: 9, threshold: 4, unitCost: 88, supplier: "Accra Distributors", lastRestocked: "14 Aug 2026" },
  { id: "INV-002", name: "Fanta Orange (24-pack)", category: "Soft Drinks", unit: "packs", quantity: 7, threshold: 3, unitCost: 85, supplier: "Accra Distributors", lastRestocked: "14 Aug 2026" },
  { id: "INV-003", name: "Sprite Bottles (24-pack)", category: "Soft Drinks", unit: "packs", quantity: 5, threshold: 3, unitCost: 85, supplier: "Accra Distributors", lastRestocked: "14 Aug 2026" },
  { id: "INV-004", name: "Lucozade Boost (250ml)", category: "Soft Drinks", unit: "crates of 24", quantity: 4, threshold: 2, unitCost: 95, supplier: "Fan Milk Ghana", lastRestocked: "13 Aug 2026" },
  // House-Made
  { id: "INV-005", name: "Hibiscus Leaves (Sobolo)", category: "House-Made", unit: "kg", quantity: 8.5, threshold: 3, unitCost: 18, supplier: "Kofi Farms", lastRestocked: "15 Aug 2026" },
  { id: "INV-006", name: "Ginger & Pineapple Syrup", category: "House-Made", unit: "litres", quantity: 12, threshold: 5, unitCost: 22, supplier: "Kofi Farms", lastRestocked: "15 Aug 2026" },
  { id: "INV-007", name: "Tamarind Concentrate (Tomi Tom)", category: "House-Made", unit: "litres", quantity: 6, threshold: 2, unitCost: 28, supplier: "Local Kitchen Prep", lastRestocked: "12 Aug 2026" },
  // Beer & Malt
  { id: "INV-008", name: "Club Beer Bottles (24-pack)", category: "Beer & Malt", unit: "packs", quantity: 2, threshold: 3, unitCost: 130, supplier: "Accra Distributors", lastRestocked: "10 Aug 2026" },
  { id: "INV-009", name: "Malta Cans (24-pack)", category: "Beer & Malt", unit: "packs", quantity: 14, threshold: 4, unitCost: 95, supplier: "Accra Distributors", lastRestocked: "14 Aug 2026" },
  { id: "INV-010", name: "Star Beer Bottles (24-pack)", category: "Beer & Malt", unit: "packs", quantity: 3, threshold: 3, unitCost: 128, supplier: "Accra Distributors", lastRestocked: "11 Aug 2026" },
  { id: "INV-011", name: "Guinness Foreign Extra (24-pack)", category: "Beer & Malt", unit: "packs", quantity: 1, threshold: 2, unitCost: 145, supplier: "Accra Distributors", lastRestocked: "09 Aug 2026" },
  // Water
  { id: "INV-012", name: "Still Water (1.5L)", category: "Water", unit: "crates of 12", quantity: 7, threshold: 3, unitCost: 45, supplier: "Pure Life Ghana", lastRestocked: "13 Aug 2026" },
  { id: "INV-013", name: "Sparkling Water (500ml)", category: "Water", unit: "crates of 24", quantity: 4, threshold: 2, unitCost: 55, supplier: "Pure Life Ghana", lastRestocked: "12 Aug 2026" },
  { id: "INV-014", name: "Sachet Water (500-pack)", category: "Water", unit: "bags", quantity: 18, threshold: 5, unitCost: 8, supplier: "Local Water Company", lastRestocked: "16 Aug 2026" },
  // Juices
  { id: "INV-015", name: "Kalyppo Juice (12-pack)", category: "Juices", unit: "packs", quantity: 10, threshold: 4, unitCost: 48, supplier: "Fan Milk Ghana", lastRestocked: "13 Aug 2026" },
  { id: "INV-016", name: "Tampico Fruit Punch (1L)", category: "Juices", unit: "crates of 12", quantity: 6, threshold: 3, unitCost: 72, supplier: "Accra Distributors", lastRestocked: "12 Aug 2026" },
  { id: "INV-017", name: "Alvaro Pear Drink (24-pack)", category: "Juices", unit: "packs", quantity: 5, threshold: 3, unitCost: 92, supplier: "Fan Milk Ghana", lastRestocked: "14 Aug 2026" },
  // Spirits
  { id: "INV-018", name: "Johnnie Walker Red (750ml)", category: "Spirits", unit: "bottles", quantity: 4, threshold: 2, unitCost: 180, supplier: "Premium Spirits GH", lastRestocked: "08 Aug 2026" },
  { id: "INV-019", name: "Orijin Bitters (330ml, 24-pack)", category: "Spirits", unit: "packs", quantity: 3, threshold: 2, unitCost: 115, supplier: "Accra Distributors", lastRestocked: "10 Aug 2026" },
];

const CATEGORIES: DrinkCategory[] = ["Soft Drinks", "House-Made", "Beer & Malt", "Water", "Juices", "Spirits"];

const CATEGORY_COLORS: Record<DrinkCategory, string> = {
  "Soft Drinks":  "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
  "House-Made":   "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  "Beer & Malt":  "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  "Water":        "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400",
  "Juices":       "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
  "Spirits":      "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400",
};

const CATEGORY_CHIP_COLORS: Record<string, string> = {
  "All":         "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900",
  "Soft Drinks": "bg-blue-600 text-white",
  "House-Made":  "bg-emerald-600 text-white",
  "Beer & Malt": "bg-amber-500 text-white",
  "Water":       "bg-cyan-500 text-white",
  "Juices":      "bg-orange-500 text-white",
  "Spirits":     "bg-purple-600 text-white",
};

// ─── Add Item Modal ───────────────────────────────────────────────────────────

function AddItemModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (item: InventoryItem) => void;
}) {
  const [name, setName]         = useState("");
  const [category, setCategory] = useState<DrinkCategory>("Soft Drinks");
  const [unit, setUnit]         = useState("");
  const [quantity, setQuantity] = useState("");
  const [threshold, setThreshold] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [supplier, setSupplier] = useState("");
  const [error, setError]       = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Item name is required."); return; }
    if (!unit.trim()) { setError("Unit is required (e.g. kg, litres, packs)."); return; }
    const qty = parseFloat(quantity);
    const thr = parseFloat(threshold);
    const cost = parseFloat(unitCost);
    if (isNaN(qty) || qty < 0) { setError("Enter a valid quantity."); return; }
    if (isNaN(thr) || thr < 0) { setError("Enter a valid low-stock threshold."); return; }
    if (isNaN(cost) || cost < 0) { setError("Enter a valid unit cost."); return; }

    onAdd({
      id: `INV-${String(Date.now()).slice(-4)}`,
      name: name.trim(),
      category,
      unit: unit.trim(),
      quantity: qty,
      threshold: thr,
      unitCost: cost,
      supplier: supplier.trim() || "—",
      lastRestocked: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-card shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-bold">Add Inventory Item</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Add a drink to inventory</p>
          </div>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-full hover:bg-secondary transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {error && (
            <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3 py-2 text-xs font-medium text-rose-700 dark:text-rose-400">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Item Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fresh Tilapia" className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-[#22c55e]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as DrinkCategory)} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-[#22c55e]">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Unit *</label>
              <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. kg, litres, packs" className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-[#22c55e]" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Qty *</label>
              <input type="number" min="0" step="0.1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-[#22c55e]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Low Stock At *</label>
              <input type="number" min="0" step="0.1" value={threshold} onChange={(e) => setThreshold(e.target.value)} placeholder="0" className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-[#22c55e]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Unit Cost (GHS) *</label>
              <input type="number" min="0" step="0.01" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} placeholder="0" className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-[#22c55e]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Supplier</label>
            <input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="e.g. Tema Fish Market" className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-[#22c55e]" />
          </div>
        </form>

        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a]" onClick={handleSubmit as unknown as React.MouseEventHandler}>
            <Plus className="size-4" /> Add Item
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function EateryInventory() {
  const [items, setItems]             = useState<InventoryItem[]>(SEED_INVENTORY);
  const [search, setSearch]           = useState("");
  const [catFilter, setCatFilter]     = useState<DrinkCategory | "All">("All");
  const [stockFilter, setStockFilter] = useState<"all" | "healthy" | "low" | "out">("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const stockStatus = (item: InventoryItem): "out" | "low" | "ok" => {
    if (item.quantity === 0) return "out";
    if (item.quantity <= item.threshold) return "low";
    return "ok";
  };

  const filtered = items.filter((item) => {
    const matchCat = catFilter === "All" || item.category === catFilter;
    const matchSearch =
      search === "" ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.supplier.toLowerCase().includes(search.toLowerCase());
    const status = stockStatus(item);
    const matchStock =
      stockFilter === "all" ||
      (stockFilter === "healthy" && status === "ok") ||
      (stockFilter === "low"     && status === "low") ||
      (stockFilter === "out"     && status === "out");
    return matchCat && matchSearch && matchStock;
  });

  const totalValue = items.reduce((s, i) => s + i.unitCost * i.quantity, 0);
  const lowStockItems = items.filter((i) => i.quantity <= i.threshold);
  const outOfStock = items.filter((i) => i.quantity === 0);

  const handleAdd = (item: InventoryItem) => setItems((prev) => [item, ...prev]);
  const handleDelete = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <AppShell
      title="Drinks Inventory"
      subtitle={`${items.length} drink items · ${currency(totalValue)} total stock value`}
      actions={
        <Button
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm bg-[#22c55e] text-white hover:bg-[#16a34a] shrink-0"
        >
          <Plus className="size-3.5 sm:size-4" />
          <span className="hidden sm:inline">Add Item</span>
          <span className="sm:hidden">Add</span>
        </Button>
      }
    >
      {showAddModal && (
        <AddItemModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} />
      )}

      {/* KPI cards */}
      <div className="mb-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Items</p>
            <span className="rounded-full bg-slate-100 p-1.5 sm:p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Boxes className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold">{items.length}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">in catalog</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Stock Value</p>
            <span className="rounded-full bg-emerald-50 p-1.5 sm:p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Boxes className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{currency(totalValue)}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">total on hand</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Low Stock</p>
            <span className="rounded-full bg-amber-50 p-1.5 sm:p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <AlertTriangle className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">{lowStockItems.length}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">need restocking</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Out of Stock</p>
            <span className="rounded-full bg-rose-50 p-1.5 sm:p-2 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <AlertTriangle className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">{outOfStock.length}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">zero units</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 space-y-2.5">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search item name or supplier…"
            className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {(["All", ...CATEGORIES] as (DrinkCategory | "All")[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                catFilter === cat
                  ? CATEGORY_CHIP_COLORS[cat] ?? "bg-zinc-900 text-white"
                  : "bg-secondary text-muted-foreground hover:bg-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        {/* Stock level filter chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {([
            { key: "all",     label: "All stock",  activeClass: "bg-foreground text-background border-transparent" },
            { key: "healthy", label: "Healthy",    activeClass: "bg-emerald-600 text-white border-transparent" },
            { key: "low",     label: "Low",        activeClass: "bg-amber-500 text-white border-transparent" },
            { key: "out",     label: "Out",        activeClass: "bg-red-600 text-white border-transparent" },
          ] as const).map(({ key, label, activeClass }) => (
            <button
              key={key}
              onClick={() => setStockFilter(key)}
              aria-pressed={stockFilter === key}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-all shadow-xs border",
                stockFilter === key ? activeClass : "bg-card text-foreground border-border hover:bg-secondary",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-border rounded-xl border border-border bg-card sm:hidden">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No items found.{" "}
            <button
              className="underline"
              onClick={() => { setSearch(""); setCatFilter("All"); setStockFilter("all"); }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          filtered.map((item) => {
            const status = stockStatus(item);
            return (
              <div key={item.id} className="p-3.5 space-y-2 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm leading-tight">{item.name}</p>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", CATEGORY_COLORS[item.category])}>
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item.quantity} {item.unit} on hand</span>
                  <span className={cn(
                    "font-semibold",
                    status === "out" ? "text-rose-600 dark:text-rose-400"
                    : status === "low" ? "text-amber-600 dark:text-amber-400"
                    : "text-emerald-600 dark:text-emerald-400",
                  )}>
                    {status === "out" ? "Out of stock" : status === "low" ? "Low stock" : "In stock"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item.supplier}</span>
                  <span className="font-medium text-foreground">{currency(item.unitCost)} / {item.unit}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3">Item</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Quantity</th>
              <th className="px-5 py-3">Unit Cost</th>
              <th className="px-5 py-3">Stock Value</th>
              <th className="px-5 py-3">Supplier</th>
              <th className="px-5 py-3">Last Restocked</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No items found.{" "}
                  <button
                    className="underline"
                    onClick={() => { setSearch(""); setCatFilter("All"); setStockFilter("all"); }}
                  >
                    Clear filters
                  </button>
                </td>
              </tr>
            )}
            {filtered.map((item) => {
              const status = stockStatus(item);
              return (
                <tr key={item.id} className="transition-colors hover:bg-secondary/30">
                  <td className="px-5 py-3 font-medium">{item.name}</td>
                  <td className="px-5 py-3">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", CATEGORY_COLORS[item.category])}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-semibold">
                    {item.quantity} {item.unit}
                    <span className="ml-1.5 text-xs text-muted-foreground font-normal">(min {item.threshold})</span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{currency(item.unitCost)} / {item.unit}</td>
                  <td className="px-5 py-3 font-bold text-[#22c55e]">{currency(item.unitCost * item.quantity)}</td>
                  <td className="px-5 py-3 text-muted-foreground">{item.supplier}</td>
                  <td className="px-5 py-3 text-muted-foreground">{item.lastRestocked}</td>
                  <td className="px-5 py-3">
                    <span className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                      status === "out"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                        : status === "low"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
                    )}>
                      {status === "out" ? "Out of stock" : status === "low" ? "Low stock" : "In stock"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="grid size-7 place-items-center rounded-md hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
