import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Users, ArrowUpRight, ArrowDownRight, Wallet, Trash2, X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
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
import { currency, type Branch } from "@/lib/mos-data";
import { useBranches } from "@/lib/branches-context";
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

// ── Add Branch Form Types ────────────────────────────────────────────────────
type AddForm = {
  name: string;
  city: string;
  staff: string;
  settlement: string;
};

const emptyAddForm: AddForm = { name: "", city: "", staff: "", settlement: "" };

// ── Add Branch Dialog ────────────────────────────────────────────────────────
function AddBranchDialog({
  onAdd,
  open,
  onOpenChange,
}: {
  onAdd: (b: Branch) => void;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [form, setForm] = useState<AddForm>(emptyAddForm);
  const [errors, setErrors] = useState<Partial<Record<keyof AddForm, string>>>({});

  const set = <K extends keyof AddForm>(key: K, val: AddForm[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Partial<Record<keyof AddForm, string>> = {};
    if (!form.name.trim()) next.name = "Branch name is required";
    if (!form.city.trim()) next.city = "City is required";
    if (!form.staff.trim() || Number.isNaN(Number(form.staff)) || Number(form.staff) < 0)
      next.staff = "Enter a valid number";
    if (!form.settlement.trim()) next.settlement = "Settlement account is required";
    setErrors(next);
    if (Object.keys(next).length) return;

    const newBranch: Branch = {
      id: form.name.toLowerCase().replace(/\s+/g, "-"),
      name: form.name.trim(),
      city: form.city.trim(),
      staff: Number(form.staff),
      revenue: 0,
      growth: 0,
      stockValue: 0,
      settlement: form.settlement.trim(),
    };
    onAdd(newBranch);
    toast.success(`${newBranch.name} added`, { description: `${newBranch.city} · ${newBranch.settlement}` });
    setForm(emptyAddForm);
    setErrors({});
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setErrors({}); setForm(emptyAddForm); } }}>
      <DialogContent className="sm:max-w-md overflow-hidden p-0 gap-0 border-0 shadow-2xl flex flex-col">
        {/* Dark header */}
        <div className="px-6 pt-6 pb-5 relative" style={{ background: "oklch(0.213 0.006 17)" }}>
          <DialogPrimitive.Close className="absolute right-4 top-4 flex size-7 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white focus:outline-none">
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
          <DialogTitle className="text-lg font-bold text-white leading-snug">
            Add branch
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-white/60">
            New branches get their own stock, staff, and settlement destination.
          </DialogDescription>
        </div>

        {/* White body */}
        <div className="bg-card px-6 py-6">
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="b-name" className="text-sm font-semibold">Branch name</Label>
              <Input
                id="b-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Accra Central"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="b-city" className="text-sm font-semibold">City</Label>
              <Input
                id="b-city"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="e.g. Accra"
              />
              {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="b-staff" className="text-sm font-semibold">Initial staff count</Label>
              <Input
                id="b-staff"
                inputMode="numeric"
                value={form.staff}
                onChange={(e) => set("staff", e.target.value)}
                placeholder="e.g. 5"
              />
              {errors.staff && <p className="text-xs text-destructive">{errors.staff}</p>}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="b-settlement" className="text-sm font-semibold">Settlement account</Label>
              <Input
                id="b-settlement"
                value={form.settlement}
                onChange={(e) => set("settlement", e.target.value)}
                placeholder="e.g. MTN MoMo · ****1234"
              />
              {errors.settlement && <p className="text-xs text-destructive">{errors.settlement}</p>}
            </div>

            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/85">
                Add branch
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Confirmation Dialog ───────────────────────────────────────────────
function DeleteBranchDialog({
  branch,
  onDelete,
}: {
  branch: Branch;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");

  function handleDelete() {
    onDelete();
    toast.success(`${branch.name} removed`);
    setOpen(false);
    setConfirm("");
  }

  const isMatch = confirm.trim().toLowerCase() === branch.name.trim().toLowerCase();

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setConfirm(""); }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs sm:text-sm text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm overflow-hidden p-0 gap-0 border-0 shadow-2xl flex flex-col">
        {/* Dark header */}
        <div className="px-6 pt-6 pb-5 relative" style={{ background: "oklch(0.213 0.006 17)" }}>
          <DialogPrimitive.Close className="absolute right-4 top-4 flex size-7 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white focus:outline-none">
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-500/20">
              <Trash2 className="size-4 text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white leading-snug">
                Delete branch
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-white/60">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* White body */}
        <div className="bg-card px-6 py-6 space-y-4">
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <p className="font-semibold">{branch.name}</p>
            <p className="mt-0.5 text-xs opacity-80">
              {branch.city} · {branch.staff} staff · {currency(branch.revenue)} revenue
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            All stock, staff assignments, and sales data for this branch will be permanently removed.
            To confirm, type the branch name below.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="del-confirm" className="text-sm font-semibold">
              Type <span className="text-destructive font-mono">{branch.name}</span> to confirm
            </Label>
            <Input
              id="del-confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={branch.name}
              className={cn(confirm && !isMatch && "border-destructive focus-visible:ring-destructive")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              type="button"
              disabled={!isMatch}
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-40"
            >
              Delete branch
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Branches Page ───────────────────────────────────────────────────────
function Branches() {
  const [view, setView] = useState<"rollup" | "per-branch">("rollup");
  const [addOpen, setAddOpen] = useState(false);
  const { branches, addBranch, deleteBranch } = useBranches();
  // Exclude the "all" meta-entry from the display list
  const list = branches.filter((b) => b.id !== "all");

  const totalRevenue = list.reduce((s, b) => s + b.revenue, 0);
  const totalStock = list.reduce((s, b) => s + b.stockValue, 0);

  return (
    <AppShell
      title="Branch management"
      subtitle={`${list.length} branches · ${list.reduce((s, b) => s + b.staff, 0)} staff · Sarpong Retail Ltd`}
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
          <Button
            size="sm"
            className="h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm bg-accent text-accent-foreground hover:bg-accent/85 shrink-0"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="size-3.5 sm:size-4" />
            <span className="hidden sm:inline">Add branch</span>
            <span className="sm:hidden">Add</span>
          </Button>
          <AddBranchDialog onAdd={addBranch} open={addOpen} onOpenChange={setAddOpen} />
        </div>
      }
    >
      <div className="space-y-4">
        {view === "rollup" && (
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { l: "Consolidated revenue", v: currency(totalRevenue || 482_310) },
              { l: "Stock value held", v: currency(totalStock || 611_400) },
              { l: "Settlement accounts", v: `${new Set(list.map((b) => b.settlement)).size} destinations` },
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
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-display text-base font-semibold leading-tight truncate">{b.name}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{b.city}</p>
                  </div>
                  <StatusBadge tone={b.revenue === 0 ? "neutral" : up ? "good" : "warn"} className="shrink-0">
                    {b.revenue === 0 ? "New" : up ? "Growing" : "Declining"}
                  </StatusBadge>
                </div>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-3 text-sm">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="num font-semibold text-sm break-all">
                      {b.revenue ? currency(b.revenue) : "—"}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Stock value</p>
                    <p className="num font-semibold text-sm break-all">
                      {b.stockValue ? currency(b.stockValue) : "—"}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex sm:block items-center gap-3">
                    <p className="text-xs text-muted-foreground">Week on week</p>
                    {b.revenue === 0 ? (
                      <p className="text-xs text-muted-foreground">N/A</p>
                    ) : (
                      <p className={cn("num inline-flex items-center gap-0.5 font-semibold", up ? "text-accent" : "text-destructive")}>
                        {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                        {Math.abs(b.growth)}%
                      </p>
                    )}
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

                {/* Actions */}
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm">
                    Manage staff
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm">
                    Branch dashboard
                  </Button>
                  <DeleteBranchDialog branch={b} onDelete={() => deleteBranch(b.id)} />
                </div>
              </div>
            );
          })}

          {/* Add branch card */}
          <button
            onClick={() => setAddOpen(true)}
            className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/50 p-6 text-center transition-colors hover:border-accent"
          >
            <Plus className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">Add another branch</p>
            <p className="max-w-56 text-xs text-muted-foreground">
              Unlimited branches under one organisation, each with its own stock and settlement destination.
            </p>
          </button>
        </div>
      </div>
    </AppShell>
  );
}
