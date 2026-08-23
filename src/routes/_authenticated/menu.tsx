import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  FileText,
  Plus,
  Search,
  UtensilsCrossed,
  TrendingUp,
  X,
  Pencil,
  Trash2,
  Smartphone,
  CreditCard,
  Landmark,
  Coins,
  Banknote,
  Check,
  Loader2,
  Lock,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { currency } from "@/lib/mos-data";
import { MENU_ITEMS, type MenuItem } from "@/lib/restaurant-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/menu")({
  head: () => ({
    meta: [
      { title: "Menu & Recipes — Trite Merchant OS" },
      {
        name: "description",
        content: "Manage restaurant dish catalog, prices, recipe ingredient costs, preparation stations, and availability status.",
      },
      { property: "og:title", content: "Menu & Recipes — Trite Merchant OS" },
    ],
  }),
  component: MenuAndRecipes,
});

type Category = "All Categories" | MenuItem["category"];

// ── Per-category active color for filter chips ────────────────────────────────
const CATEGORY_CHIP_COLORS: Record<string, string> = {
  "All Categories": "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900",
  "Mains":          "bg-orange-500 text-white",
  "Starters":       "bg-emerald-600 text-white",
  "Grill":          "bg-red-600 text-white",
  "Seafood":        "bg-blue-600 text-white",
  "Drinks":         "bg-cyan-500 text-white",
  "Desserts":       "bg-pink-500 text-white",
};
type IngredientRow = { name: string; qty: string };

// ─── Payment methods ──────────────────────────────────────────────────────────
const methods = [
  { id: "momo",   label: "Mobile money", hint: "MTN · Telecel",    icon: Smartphone, disabled: false },
  { id: "card",   label: "Card",         hint: "Visa · Mastercard", icon: CreditCard, disabled: true  },
  { id: "bank",   label: "Bank transfer",hint: "GhIPSS instant",   icon: Landmark,   disabled: true  },
  { id: "stable", label: "Stablecoin",   hint: "USDC · USDT",      icon: Coins,      disabled: true  },
  { id: "cash",   label: "Cash",         hint: "Till drawer",      icon: Banknote,   disabled: false },
];

// ─── Add Menu Item Modal ──────────────────────────────────────────────────────
function AddMenuModal({ onClose, onAdd }: { onClose: () => void; onAdd: (item: MenuItem) => void }) {
  const [name, setName]           = useState("");
  const [category, setCategory]   = useState<MenuItem["category"]>("Mains");
  const [price, setPrice]         = useState("");
  const [available, setAvailable] = useState(true);
  const [error, setError]         = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Dish name is required."); return; }
    const p = parseFloat(price);
    if (isNaN(p) || p <= 0) { setError("Enter a valid selling price."); return; }
    onAdd({ id: `MNU-${String(Date.now()).slice(-4)}`, name: name.trim(), category, price: p, cost: 0, available, preparationStation: "Grill", ingredients: [], dailySalesCount: 0 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-card shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div><h2 className="text-base font-bold">Add Menu Item</h2><p className="text-xs text-muted-foreground mt-0.5">Fill in dish details</p></div>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-full hover:bg-secondary transition-colors"><X className="size-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3 py-2 text-xs font-medium text-rose-700 dark:text-rose-400">{error}</div>}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dish Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Grilled Tilapia with Jollof" className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-[#22c55e]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as MenuItem["category"])} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-[#22c55e]">
                {["Starters","Mains","Grill","Seafood","Drinks","Desserts"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Selling Price (GHS) *</label>
              <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 95" className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-[#22c55e]" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setAvailable((v) => !v)} className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors", available ? "bg-[#22c55e]" : "bg-border")}>
              <span className={cn("inline-block size-3.5 rounded-full bg-white shadow transition-transform", available ? "translate-x-4" : "translate-x-0.5")} />
            </button>
            <label className="text-sm font-medium">{available ? "Available on menu" : "Not available (86'd)"}</label>
          </div>
        </form>
        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a]" onClick={handleSubmit as unknown as React.MouseEventHandler}><Plus className="size-4" /> Add to Menu</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Recipe Modal ────────────────────────────────────────────────────────
function EditRecipeModal({ dish, onClose, onSave }: { dish: MenuItem; onClose: () => void; onSave: (updated: MenuItem) => void }) {
  const [name, setName]           = useState(dish.name);
  const [category, setCategory]   = useState(dish.category);
  const [price, setPrice]         = useState(String(dish.price));
  const [available, setAvailable] = useState(dish.available);
  const [ingredients, setIngredients] = useState<IngredientRow[]>(dish.ingredients.map((i) => ({ name: i.name, qty: i.qty })));
  const [error, setError] = useState("");

  const addIngredient = () => setIngredients((prev) => [...prev, { name: "", qty: "" }]);
  const removeIngredient = (i: number) => setIngredients((prev) => prev.filter((_, idx) => idx !== i));
  const updateIngredient = (i: number, field: "name" | "qty", val: string) =>
    setIngredients((prev) => prev.map((row, idx) => idx === i ? { ...row, [field]: val } : row));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Dish name is required."); return; }
    const p = parseFloat(price);
    if (isNaN(p) || p <= 0) { setError("Enter a valid selling price."); return; }
    onSave({ ...dish, name: name.trim(), category, price: p, available, ingredients: ingredients.filter((i) => i.name.trim() && i.qty.trim()) });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-card shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div><h2 className="text-base font-bold">Edit Recipe</h2><p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[300px]">{dish.name}</p></div>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-full hover:bg-secondary transition-colors"><X className="size-4" /></button>
        </div>
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {error && <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3 py-2 text-xs font-medium text-rose-700 dark:text-rose-400">{error}</div>}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dish Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-[#22c55e]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as MenuItem["category"])} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-[#22c55e]">
                {["Starters","Mains","Grill","Seafood","Drinks","Desserts"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Selling Price (GHS) *</label>
              <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-[#22c55e]" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setAvailable((v) => !v)} className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors", available ? "bg-[#22c55e]" : "bg-border")}>
              <span className={cn("inline-block size-3.5 rounded-full bg-white shadow transition-transform", available ? "translate-x-4" : "translate-x-0.5")} />
            </button>
            <label className="text-sm font-medium">{available ? "Available on menu" : "Not available (86'd)"}</label>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recipe Ingredients</label>
              <button type="button" onClick={addIngredient} className="text-xs font-semibold text-[#22c55e] hover:underline flex items-center gap-1"><Plus className="size-3" /> Add row</button>
            </div>
            {ingredients.length === 0 && <p className="text-xs text-muted-foreground">No ingredients added.</p>}
            <div className="space-y-2">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={ing.qty} onChange={(e) => updateIngredient(i, "qty", e.target.value)} placeholder="Qty" className="h-8 w-24 shrink-0 rounded-md border border-border bg-background px-2.5 text-xs outline-none focus:border-[#22c55e]" />
                  <input value={ing.name} onChange={(e) => updateIngredient(i, "name", e.target.value)} placeholder="Ingredient name" className="h-8 flex-1 rounded-md border border-border bg-background px-2.5 text-xs outline-none focus:border-[#22c55e]" />
                  <button type="button" onClick={() => removeIngredient(i)} className="grid size-7 place-items-center rounded-md hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="size-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        </form>
        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a]" onClick={handleSave as unknown as React.MouseEventHandler}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
function MenuAndRecipes() {
  const [menuItems, setMenuItems]   = useState<MenuItem[]>(MENU_ITEMS);
  const [categoryFilter, setCategoryFilter] = useState<Category>("All Categories");
  const [search, setSearch]         = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDish, setEditingDish]   = useState<MenuItem | null>(null);

  // Order panel state
  const [cart, setCart]   = useState<Record<string, number>>({});
  const [method, setMethod] = useState("momo");
  const [phase, setPhase]   = useState<"idle" | "pending" | "done">("idle");

  const filteredItems = menuItems.filter((item) => {
    const matchCat = categoryFilter === "All Categories" || item.category === categoryFilter;
    const matchSearch = search === "" || item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalMenuItems = menuItems.length;

  const lines = useMemo(
    () => Object.entries(cart).map(([id, qty]) => {
      const item = menuItems.find((x) => x.id === id)!;
      return { ...item, qty };
    }),
    [cart, menuItems],
  );

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const vat      = subtotal * 0.15;
  const levies   = subtotal * 0.06;
  const total    = subtotal + vat + levies;

  const addToCart = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const decCart   = (id: string) => setCart((c) => {
    const next = { ...c };
    const q = (next[id] ?? 0) - 1;
    if (q <= 0) delete next[id]; else next[id] = q;
    return next;
  });
  const clearCart = () => { setCart({}); setPhase("idle"); };

  const charge = () => {
    setPhase("pending");
    setTimeout(() => setPhase("done"), 1800);
  };

  const handleAdd  = (item: MenuItem) => setMenuItems((prev) => [...prev, item]);
  const handleSave = (updated: MenuItem) => setMenuItems((prev) => prev.map((m) => m.id === updated.id ? updated : m));

  return (
    <AppShell
      title="Menu & Recipes"
      subtitle={`${totalMenuItems} dishes & drinks`}
      actions={
        <Button size="sm" onClick={() => setShowAddModal(true)} className="h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm bg-[#22c55e] text-white hover:bg-[#16a34a] shrink-0">
          <Plus className="size-3.5 sm:size-4" />
          <span className="hidden sm:inline">Add Menu Item</span>
          <span className="sm:hidden">Add</span>
        </Button>
      }
    >
      {showAddModal && <AddMenuModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} />}
      {editingDish && <EditRecipeModal dish={editingDish} onClose={() => setEditingDish(null)} onSave={handleSave} />}

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        {/* ── Left: Menu catalogue ── */}
        <div className="space-y-4">
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Dishes</p>
                <span className="rounded-full bg-slate-100 p-1.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300"><UtensilsCrossed className="size-3.5" /></span>
              </div>
              <p className="mt-2 text-xl font-bold">{totalMenuItems}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Top Seller</p>
                <span className="rounded-full bg-amber-50 p-1.5 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"><FileText className="size-3.5" /></span>
              </div>
              <p className="mt-2 text-base font-bold truncate">Sobolo Drink</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">In Cart</p>
                <span className="rounded-full bg-emerald-50 p-1.5 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"><TrendingUp className="size-3.5" /></span>
              </div>
              <p className="mt-2 text-xl font-bold text-emerald-600 dark:text-emerald-400">{lines.length} items</p>
            </div>
          </div>

          {/* Search + category pills */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search dish name…" className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring" />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {(["All Categories","Mains","Starters","Grill","Seafood","Drinks"] as Category[]).map((cat) => (
                <button key={cat} onClick={() => setCategoryFilter(cat)}
                  className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                    categoryFilter === cat
                      ? CATEGORY_CHIP_COLORS[cat] ?? "bg-zinc-900 text-white"
                      : "bg-secondary text-muted-foreground hover:bg-border"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Dish grid — clicking adds to cart */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filteredItems.length === 0 && (
              <p className="col-span-full py-10 text-center text-sm text-muted-foreground">No dishes found.</p>
            )}
            {filteredItems.map((dish) => (
              <div key={dish.id} className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-3 transition-all hover:border-[#22c55e] hover:shadow-sm">
                <div>
                  <p className="text-sm font-semibold leading-tight">{dish.name}</p>
                  <span className="mt-1 inline-block rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{dish.category}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="num text-base font-bold">{currency(dish.price)}</p>
                  <div className="flex items-center gap-1">
                    {cart[dish.id] ? (
                      <>
                        <button onClick={() => decCart(dish.id)} className="grid size-7 place-items-center rounded-md border border-border text-sm hover:bg-secondary">−</button>
                        <span className="num w-6 text-center text-sm font-semibold">{cart[dish.id]}</span>
                        <button onClick={() => addToCart(dish.id)} className="grid size-7 place-items-center rounded-md border border-border text-sm hover:bg-secondary">+</button>
                      </>
                    ) : (
                      <button onClick={() => addToCart(dish.id)} className="grid size-7 place-items-center rounded-md bg-[#22c55e] text-white hover:bg-[#16a34a]">
                        <Plus className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                {/* Edit button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingDish(dish); }}
                  className="absolute top-2 right-2 hidden group-hover:grid size-6 place-items-center rounded-md bg-card border border-border text-muted-foreground hover:text-[#22c55e] transition-colors"
                >
                  <Pencil className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Order panel ── */}
        <section className="flex flex-col rounded-lg border border-border bg-card sticky top-20 h-fit">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-sm font-semibold">Current order</h2>
            <button onClick={clearCart} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive">
              <Trash2 className="size-3.5" /> Clear
            </button>
          </div>

          {/* Cart items */}
          <div className="max-h-56 divide-y divide-border overflow-y-auto">
            {lines.length === 0 && (
              <p className="p-8 text-center text-sm text-muted-foreground">Tap a dish to start the order.</p>
            )}
            {lines.map((l) => (
              <div key={l.id} className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{l.name}</p>
                  <p className="num text-xs text-muted-foreground">{currency(l.price)} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => decCart(l.id)} className="size-7 rounded-md border border-border text-sm hover:bg-secondary">−</button>
                  <span className="num w-6 text-center text-sm font-medium">{l.qty}</span>
                  <button onClick={() => addToCart(l.id)} className="size-7 rounded-md border border-border text-sm hover:bg-secondary">+</button>
                </div>
                <span className="num w-20 text-right text-sm font-semibold">{currency(l.price * l.qty)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1.5 border-t border-border p-4 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="num">{currency(subtotal)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>VAT 15%</span><span className="num">{currency(vat)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>NHIL + GETFund 6%</span><span className="num">{currency(levies)}</span></div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold"><span>Total</span><span className="num">{currency(total)}</span></div>
          </div>

          {/* Payment methods */}
          <div className="border-t border-border p-4">
            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Payment method</p>
            <div className="grid grid-cols-3 gap-2">
              {methods.map((m) => (
                <button key={m.id} onClick={() => !m.disabled && setMethod(m.id)} disabled={m.disabled}
                  className={cn(
                    "relative flex flex-col items-start gap-1 rounded-lg border p-2 text-left transition-all shadow-2xs",
                    m.disabled
                      ? "cursor-not-allowed border-border/40 bg-muted/40 opacity-70"
                      : method === m.id
                        ? "border-emerald-700 bg-emerald-700 text-white shadow-xs"
                        : "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
                  )}
                >
                  {m.disabled && (
                    <span className="absolute top-1 right-1 flex items-center gap-0.5 rounded-full bg-muted px-1 py-0.5 text-[9px] font-semibold text-muted-foreground">
                      <Lock className="size-2.5" /> Soon
                    </span>
                  )}
                  <m.icon className={cn("size-3.5", m.disabled ? "text-muted-foreground" : method === m.id ? "text-white" : "text-emerald-600 dark:text-emerald-400")} />
                  <span className="text-[10px] leading-tight font-semibold">{m.label}</span>
                  <span className={cn("text-[9px] leading-tight", m.disabled ? "text-muted-foreground" : method === m.id ? "text-emerald-100" : "text-emerald-700 dark:text-emerald-400")}>{m.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Charge / status */}
          <div className="border-t border-border p-4">
            {phase === "idle" && (
              <Button onClick={charge} disabled={lines.length === 0} className="h-12 w-full bg-[#22c55e] text-sm font-semibold text-white hover:bg-[#16a34a]">
                Charge {currency(total)}
              </Button>
            )}
            {phase === "pending" && (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary p-3">
                <Loader2 className="size-4 animate-spin" />
                <div>
                  <p className="text-xs font-medium">Awaiting confirmation…</p>
                  <p className="text-[10px] text-muted-foreground">Prompt sent · TRX-88215</p>
                </div>
              </div>
            )}
            {phase === "done" && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-[#22c55e] bg-emerald-50/50 dark:bg-emerald-950/20 p-3">
                  <Check className="size-4 text-[#22c55e]" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold">Payment confirmed</p>
                    <p className="text-[10px] text-muted-foreground">{currency(total)} · GCB ****4410</p>
                  </div>
                  <StatusBadge tone="good">confirmed</StatusBadge>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {["SMS","Email","WhatsApp","Print"].map((r) => (
                    <Button key={r} variant="outline" size="sm" className="text-[10px] px-1">{r}</Button>
                  ))}
                </div>
                <Button variant="secondary" className="w-full text-xs" onClick={clearCart}>New order</Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
