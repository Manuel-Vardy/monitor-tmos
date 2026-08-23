import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Plus,
  ArrowLeftRight,
  Search,
  Download,
  Upload,
  FileSpreadsheet,
  ChevronDown,
  Boxes,
  MoveRight,
  PackageCheck,
  Pill,
  Stethoscope,
  FlaskConical,
  Bell,
  HeartPulse,
} from "lucide-react";
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
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { currency, products as seedProducts, branches as seedBranches, type Product } from "@/lib/mos-data";
import { useBranches } from "@/lib/branches-context";
import { cn } from "@/lib/utils";
import { useInstitution } from "@/hooks/use-institution";
import {
  PHARMACY_MEDICATIONS,
  type PharmacyMedication,
} from "@/lib/pharmacy-data";

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

const branchOptions = seedBranches.filter((b) => b.id !== "all");
const categories = ["Personal care", "Beverages", "Groceries", "Apparel", "Snacks", "Other"];
const PHARMACY_CATEGORIES = ["Antibiotics", "Analgesics", "Antihypertensives", "Antidiabetics", "Vitamins & Supplements", "Other"];
const PHARMACY_FORMS = ["Tablet", "Capsule", "Syrup", "Injection", "Ointment", "Other"];

function fmtExpiry(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function expiryTone(iso: string): "good" | "warn" | "bad" {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms < 0) return "bad";
  if (ms < 60 * 24 * 60 * 60 * 1000) return "warn";
  return "good";
}

function isExpiringWithin(days: number, expiryStr: string): boolean {
  const exp = new Date(expiryStr);
  const now = new Date();
  const threshold = new Date();
  threshold.setDate(now.getDate() + days);
  return exp <= threshold && exp >= now;
}

type FormState = {
  name: string;
  variant: string;
  category: string;
  customCategory: string;
  price: string;
  stock: string;
  threshold: string;
  branch: string;
  expiry: string;
  // Pharmacy-only fields
  genericName: string;
  strength: string;
  dosageForm: string;
  batchNumber: string;
  prescriptionRequired: boolean;
};

const emptyForm: FormState = {
  name: "",
  variant: "",
  category: "Groceries",
  customCategory: "",
  price: "",
  stock: "",
  threshold: "",
  branch: branchOptions[0]!.name,
  expiry: "",
  genericName: "",
  strength: "",
  dosageForm: "Tablet",
  batchNumber: "",
  prescriptionRequired: false,
};

function AddProductDialog({
  onAdd,
  branchOptions: liveBranchOptions,
  isPharmacy,
}: {
  onAdd: (p: Product) => void;
  branchOptions: typeof branchOptions;
  isPharmacy: boolean;
}) {
  const [open, setOpen] = useState(false);
  const defaultCategory = isPharmacy ? "Antibiotics" : "Groceries";
  const [form, setForm] = useState<FormState>({
    ...emptyForm,
    category: defaultCategory,
    branch: liveBranchOptions[0]?.name ?? emptyForm.branch,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const reset = () => {
    setForm({ ...emptyForm, category: defaultCategory, branch: liveBranchOptions[0]?.name ?? emptyForm.branch });
    setErrors({});
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = isPharmacy ? "Brand name is required" : "Product name is required";
    if (isPharmacy && !form.genericName.trim()) next.genericName = "Generic/drug name is required";
    if (isPharmacy && !form.strength.trim()) next.strength = "Strength is required";
    if (isPharmacy && !form.batchNumber.trim()) next.batchNumber = "Batch number is required";
    if (form.price === "" || Number(form.price) < 0 || Number.isNaN(Number(form.price)))
      next.price = "Enter a valid price";
    if (form.stock === "" || Number(form.stock) < 0 || Number.isNaN(Number(form.stock)))
      next.stock = "Enter a valid quantity";
    if (form.threshold === "" || Number(form.threshold) < 0 || Number.isNaN(Number(form.threshold)))
      next.threshold = "Enter a valid threshold";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const product: Product = {
      sku: isPharmacy
        ? `MED-${Math.floor(2000 + Math.random() * 7999)}`
        : `TRT-${Math.floor(2000 + Math.random() * 7999)}`,
      name: form.name.trim(),
      variant: isPharmacy ? `${form.strength} · ${form.dosageForm}` : form.variant.trim() || "Standard",
      category:
        form.category === "Other" && form.customCategory.trim()
          ? form.customCategory.trim()
          : form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      threshold: Number(form.threshold),
      branch: form.branch,
      ...(form.expiry ? { expiry: form.expiry } : {}),
    };
    onAdd(product);
    toast.success(isPharmacy ? `${product.name} medication added` : `${product.name} added`, {
      description: `${product.sku} · ${product.branch}`,
    });
    reset();
    setOpen(false);
  };

  const categoryList = isPharmacy ? PHARMACY_CATEGORIES : categories;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          className={cn(
            "h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm shrink-0",
            isPharmacy
              ? "bg-[#22c55e] text-white hover:bg-[#16a34a]"
              : "bg-accent text-accent-foreground hover:bg-accent/85"
          )}
        >
          <Plus className="size-3.5 sm:size-4" />
          <span className="hidden sm:inline">{isPharmacy ? "Add medication" : "Add product"}</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isPharmacy ? "Add medication" : "Add product"}</DialogTitle>
          <DialogDescription>
            {isPharmacy
              ? "New SKUs are stocked at the selected branch with batch and expiry tracking."
              : "New SKUs are stocked at the selected branch and sync to POS immediately."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          {isPharmacy ? (
            <>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="p-name">Brand name</Label>
                <Input
                  id="p-name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Augmentin"
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="p-generic">Generic / Drug name</Label>
                <Input
                  id="p-generic"
                  value={form.genericName}
                  onChange={(e) => set("genericName", e.target.value)}
                  placeholder="Amoxicillin + Clavulanic Acid"
                />
                {errors.genericName && <p className="text-xs text-destructive">{errors.genericName}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-strength">Strength</Label>
                <Input
                  id="p-strength"
                  value={form.strength}
                  onChange={(e) => set("strength", e.target.value)}
                  placeholder="625 mg / 200ml"
                />
                {errors.strength && <p className="text-xs text-destructive">{errors.strength}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Dosage form</Label>
                <Select value={form.dosageForm} onValueChange={(v) => set("dosageForm", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PHARMACY_FORMS.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Category (ATC / therapeutic)</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => {
                    set("category", v);
                    if (v !== "Other") set("customCategory", "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryList.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.category === "Other" && (
                  <Input
                    value={form.customCategory}
                    onChange={(e) => set("customCategory", e.target.value)}
                    placeholder="Enter therapeutic class"
                    className="mt-1.5"
                  />
                )}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="p-batch">Batch number</Label>
                <Input
                  id="p-batch"
                  value={form.batchNumber}
                  onChange={(e) => set("batchNumber", e.target.value)}
                  placeholder="BATCH-2026A"
                />
                {errors.batchNumber && <p className="text-xs text-destructive">{errors.batchNumber}</p>}
              </div>
            </>
          ) : (
            <>
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
                <Select
                  value={form.category}
                  onValueChange={(v) => {
                    set("category", v);
                    if (v !== "Other") set("customCategory", "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryList.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.category === "Other" && (
                  <Input
                    value={form.customCategory}
                    onChange={(e) => set("customCategory", e.target.value)}
                    placeholder="Enter your category"
                    className="mt-1.5"
                  />
                )}
              </div>
            </>
          )}

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
                {liveBranchOptions.map((b) => (
                  <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
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
            <Label htmlFor="p-threshold">
              {isPharmacy ? "Reorder level" : "Set low-stock threshold"}
            </Label>
            <Input
              id="p-threshold"
              inputMode="numeric"
              value={form.threshold}
              onChange={(e) => set("threshold", e.target.value)}
              placeholder={isPharmacy ? "50" : "10"}
            />
            {errors.threshold && <p className="text-xs text-destructive">{errors.threshold}</p>}
          </div>

          <div className="space-y-1.5 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="p-expiry">
                {isPharmacy ? "Expiry date" : "Expiry date "}
                {!isPharmacy && (
                  <span className="text-muted-foreground font-normal">(optional)</span>
                )}
              </Label>
              <Input
                id="p-expiry"
                type="date"
                value={form.expiry}
                onChange={(e) => set("expiry", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            {isPharmacy && (
              <div className="space-y-1.5 flex items-end">
                <div className="flex items-center justify-between w-full rounded-lg border border-border bg-secondary/40 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="size-4 text-blue-600 dark:text-blue-400" />
                    <Label htmlFor="p-rx" className="cursor-pointer text-sm font-medium">
                      Prescription only (Rx)
                    </Label>
                  </div>
                  <Switch
                    id="p-rx"
                    checked={form.prescriptionRequired}
                    onCheckedChange={(v) => set("prescriptionRequired", v)}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className={cn(
                isPharmacy
                  ? "bg-[#22c55e] text-white hover:bg-[#16a34a]"
                  : "bg-accent text-accent-foreground hover:bg-accent/85"
              )}
            >
              {isPharmacy ? "Add medication" : "Add product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Transfer Stock Dialog ────────────────────────────────────────────────────

type TransferStep = "branches" | "product";

type TransferForm = {
  fromBranch: string;
  toBranch: string;
  sku: string;
  qty: string;
  note: string;
};

const emptyTransfer: TransferForm = {
  fromBranch: branchOptions[0]!.name,
  toBranch: branchOptions[1]!.name,
  sku: "",
  qty: "",
  note: "",
};

function TransferStockDialog({
  items,
  onTransfer,
  branchOptions: liveBranchOptions,
}: {
  items: Product[];
  onTransfer: (sku: string, fromBranch: string, toBranch: string, qty: number) => void;
  branchOptions: typeof branchOptions;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<TransferStep>("branches");
  const [form, setForm] = useState<TransferForm>({
    ...emptyTransfer,
    fromBranch: liveBranchOptions[0]?.name ?? emptyTransfer.fromBranch,
    toBranch: liveBranchOptions[1]?.name ?? emptyTransfer.toBranch,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TransferForm, string>>>({});

  const set = <K extends keyof TransferForm>(key: K, value: TransferForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const sourceProducts = items.filter((p) => p.branch === form.fromBranch && p.stock > 0);
  const selectedProduct = items.find((p) => p.sku === form.sku && p.branch === form.fromBranch);

  function resetAndClose() {
    setOpen(false);
    setStep("branches");
    setForm(emptyTransfer);
    setErrors({});
  }

  function handleBranchNext() {
    const next: Partial<Record<keyof TransferForm, string>> = {};
    if (!form.fromBranch) next.fromBranch = "Select a source branch";
    if (!form.toBranch) next.toBranch = "Select a destination branch";
    if (form.fromBranch && form.toBranch && form.fromBranch === form.toBranch)
      next.toBranch = "Destination must differ from source";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setErrors({});
    setStep("product");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Partial<Record<keyof TransferForm, string>> = {};
    if (!form.sku) next.sku = "Select a product";
    const qty = Number(form.qty);
    if (!form.qty || Number.isNaN(qty) || qty <= 0) next.qty = "Enter a valid quantity";
    else if (selectedProduct && qty > selectedProduct.stock)
      next.qty = `Only ${selectedProduct.stock} units available`;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onTransfer(form.sku, form.fromBranch, form.toBranch, qty);
    toast.success("Stock transferred", {
      description: `${qty} × ${selectedProduct?.name} · ${form.fromBranch} → ${form.toBranch}`,
    });
    resetAndClose();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) resetAndClose();
        else setOpen(true);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm shrink-0">
          <ArrowLeftRight className="size-3.5 sm:size-4" />
          <span className="hidden sm:inline">Transfer stock</span>
          <span className="sm:hidden">Transfer</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md overflow-hidden p-0 gap-0 border-0 shadow-2xl flex flex-col">
        <div className="bg-foreground px-6 pt-6 pb-5 relative">
          <DialogPrimitive.Close className="absolute right-4 top-4 flex size-7 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white focus:outline-none">
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-lg font-bold text-background leading-snug">
                Transfer stock
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-background/60">
                Move inventory between branches. Stock adjusts in real time on both sides.
              </DialogDescription>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs">
            <span className={cn(
              "flex size-6 items-center justify-center rounded-full text-[11px] font-bold",
              step === "branches"
                ? "bg-accent text-accent-foreground"
                : "bg-background/20 text-background/60"
            )}>
              1
            </span>
            <span className={cn("font-medium", step === "branches" ? "text-background" : "text-background/50")}>
              Choose branches
            </span>
            <div className="h-px flex-1 bg-background/20" />
            <span className={cn(
              "flex size-6 items-center justify-center rounded-full text-[11px] font-bold",
              step === "product"
                ? "bg-accent text-accent-foreground"
                : "bg-background/20 text-background/60"
            )}>
              2
            </span>
            <span className={cn("font-medium", step === "product" ? "text-background" : "text-background/50")}>
              Product &amp; qty
            </span>
          </div>
        </div>

        <div className="bg-card px-6 py-6">
          {step === "branches" && (
            <div className="space-y-5">
              <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">From branch</Label>
                  <Select
                    value={form.fromBranch}
                    onValueChange={(v) => {
                      set("fromBranch", v);
                      set("sku", "");
                    }}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {liveBranchOptions.map((b) => (
                        <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.fromBranch && <p className="text-xs text-destructive">{errors.fromBranch}</p>}
                </div>

                <div className="pb-1 flex items-center justify-center">
                  <div className="flex size-9 items-center justify-center rounded-full border border-border bg-secondary shadow-sm">
                    <MoveRight className="size-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">To branch</Label>
                  <Select value={form.toBranch} onValueChange={(v) => set("toBranch", v)}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {liveBranchOptions.map((b) => (
                        <SelectItem key={b.id} value={b.name} disabled={b.name === form.fromBranch}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.toBranch && <p className="text-xs text-destructive">{errors.toBranch}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[form.fromBranch, form.toBranch].map((bName, i) => {
                  const branch = liveBranchOptions.find((b) => b.name === bName);
                  const skuCount = items.filter((p) => p.branch === bName).length;
                  return (
                    <div key={i} className="rounded-lg border border-border bg-secondary/50 p-3.5 space-y-0.5">
                      <p className="text-sm font-semibold text-foreground truncate">{bName}</p>
                      <p className="text-xs text-muted-foreground">{branch?.city}</p>
                      <p className="text-xs text-muted-foreground pt-1">{skuCount} SKUs in stock</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" onClick={resetAndClose}>Cancel</Button>
                <Button
                  type="button"
                  className="bg-accent text-accent-foreground hover:bg-accent/85 px-6"
                  onClick={handleBranchNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === "product" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-4 py-2.5 text-sm">
                <span className="font-semibold truncate">{form.fromBranch}</span>
                <MoveRight className="size-4 shrink-0 text-muted-foreground" />
                <span className="font-semibold truncate">{form.toBranch}</span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Product</Label>
                {sourceProducts.length === 0 ? (
                  <p className="rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
                    No products with available stock at {form.fromBranch}.
                  </p>
                ) : (
                  <Select value={form.sku} onValueChange={(v) => set("sku", v)}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select a product…" />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceProducts.map((p) => (
                        <SelectItem key={p.sku} value={p.sku}>
                          <span className="flex items-center gap-2">
                            <span>{p.name}</span>
                            <span className="text-muted-foreground text-[11px]">
                              {p.variant} · {p.stock} avail.
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.sku && <p className="text-xs text-destructive">{errors.sku}</p>}
              </div>

              {selectedProduct && (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 px-4 py-3">
                  <PackageCheck className="size-5 shrink-0 text-accent" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">
                      {selectedProduct.name} · {selectedProduct.variant}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedProduct.sku} · {selectedProduct.stock} units available
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="t-qty" className="text-sm font-semibold">Quantity</Label>
                  <Input
                    id="t-qty"
                    inputMode="numeric"
                    className="h-10"
                    value={form.qty}
                    onChange={(e) => set("qty", e.target.value)}
                    placeholder={selectedProduct ? `Max ${selectedProduct.stock}` : "0"}
                  />
                  {errors.qty && <p className="text-xs text-destructive">{errors.qty}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="t-note" className="text-sm font-semibold">
                    Note <span className="font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="t-note"
                    className="h-10"
                    value={form.note}
                    onChange={(e) => set("note", e.target.value)}
                    placeholder="e.g. Weekend restock"
                  />
                </div>
              </div>

              {selectedProduct && form.qty && !Number.isNaN(Number(form.qty)) && Number(form.qty) > 0 && Number(form.qty) <= selectedProduct.stock && (
                <div className="rounded-lg bg-accent/10 border border-accent/20 px-4 py-3 space-y-2">
                  <p className="text-xs font-semibold text-accent uppercase tracking-wide">After transfer</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{form.fromBranch}</span>
                    <span className="num font-semibold text-foreground">
                      {selectedProduct.stock - Number(form.qty)} units
                    </span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{form.toBranch}</span>
                    <span className="num font-semibold text-foreground">
                      {(items.find((p) => p.sku === selectedProduct.sku && p.branch === form.toBranch)?.stock ?? 0) + Number(form.qty)} units
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => setStep("branches")}>
                  ← Back
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={resetAndClose}>Cancel</Button>
                  <Button
                    type="submit"
                    className="bg-accent text-accent-foreground hover:bg-accent/85 px-5"
                    disabled={sourceProducts.length === 0}
                  >
                    Confirm transfer
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const CSV_TEMPLATE_HEADERS = "sku,name,variant,category,price,stock,threshold,branch\n";
const CSV_TEMPLATE_EXAMPLE =
  "TRT-1001,Shea Butter Tub,500g,Personal care,65,24,10,Osu Flagship\n";

const PHARMACY_CSV_HEADERS = "sku,brandName,genericName,strength,dosageForm,category,unitPrice,stockLevel,reorderLevel,batchNumber,expiryDate,prescriptionRequired\n";

function CsvDropdown({ items, isPharmacy }: { items: Product[]; isPharmacy: boolean }) {
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function downloadTemplate() {
    const headers = isPharmacy ? PHARMACY_CSV_HEADERS : CSV_TEMPLATE_HEADERS;
    const example = isPharmacy
      ? "MED-001,Augmentin,Amoxicillin + Clavulanic Acid,625mg,Tablet,Antibiotics,85,140,50,BATCH-2026A,2027-10-15,true\n"
      : CSV_TEMPLATE_EXAMPLE;
    const blob = new Blob([headers + example], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = isPharmacy ? "medication_inventory_template.csv" : "inventory_template.csv";
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
    toast.success("Template downloaded");
  }

  function downloadCsv() {
    const headers = isPharmacy ? PHARMACY_CSV_HEADERS : CSV_TEMPLATE_HEADERS.trim();
    const rows = isPharmacy
      ? [
          headers,
          ...PHARMACY_MEDICATIONS.map((m) =>
            [
              m.id,
              m.brandName,
              m.drugName,
              m.strength,
              m.dosageForm,
              m.category,
              m.unitPrice,
              m.stockLevel,
              m.reorderLevel,
              m.batchNumber,
              m.expiryDate,
              m.prescriptionRequired,
            ].join(","),
          ),
        ].join("\n")
      : [
          headers,
          ...items.map((p) =>
            [p.sku, p.name, p.variant, p.category, p.price, p.stock, p.threshold, p.branch].join(","),
          ),
        ].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = isPharmacy ? "medication_export.csv" : "inventory_export.csv";
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
    toast.success(isPharmacy ? "Medication list exported" : "Inventory exported");
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.success(`${file.name} uploaded`, {
      description: isPharmacy ? "Medications will sync shortly." : "Products will sync shortly.",
    });
    e.target.value = "";
    setOpen(false);
  }

  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 sm:h-9 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 sm:px-3 text-xs sm:text-sm font-medium hover:bg-secondary transition-colors"
      >
        <FileSpreadsheet className="size-3.5 sm:size-4" />
        <span className="hidden sm:inline">CSV</span>
        <ChevronDown className="size-3 opacity-60" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-40 mt-1.5 w-64 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
            <button
              onClick={downloadTemplate}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-secondary transition-colors"
            >
              <FileSpreadsheet className="size-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Download template</p>
                <p className="text-[10px] text-muted-foreground">
                  Blank CSV with headers
                </p>
              </div>
            </button>
            <div className="h-px bg-border" />
            <button
              onClick={() => { fileRef.current?.click(); }}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-secondary transition-colors"
            >
              <Upload className="size-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Upload CSV</p>
                <p className="text-[10px] text-muted-foreground">
                  {isPharmacy ? "Import medications in bulk" : "Import products in bulk"}
                </p>
              </div>
            </button>
            <div className="h-px bg-border" />
            <button
              onClick={downloadCsv}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-secondary transition-colors"
            >
              <Download className="size-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Download CSV</p>
                <p className="text-[10px] text-muted-foreground">
                  {isPharmacy ? "Export medication list" : "Export current inventory"}
                </p>
              </div>
            </button>
          </div>
        </>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".csv"
        className="sr-only"
        onChange={handleUpload}
      />
    </div>
  );
}

function Inventory() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Product[]>(seedProducts);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [stockFilter, setStockFilter] = useState<"all" | "healthy" | "low" | "out" | "expiring">("all");
  const { branches } = useBranches();
  const { institutionType } = useInstitution();
  const isPharmacy = institutionType === "pharmacy";
  const liveBranchOptions = branches.filter((b) => b.id !== "all");

  const pharmacyAsProducts = useMemo<Product[]>(() => {
    const defaultBranch = liveBranchOptions[0]?.name ?? "Osu Flagship";
    return PHARMACY_MEDICATIONS.map((m) => ({
      sku: m.id,
      name: m.brandName,
      variant: `${m.strength} · ${m.dosageForm}`,
      category: m.category,
      price: m.unitPrice,
      stock: m.stockLevel,
      threshold: m.reorderLevel,
      branch: defaultBranch,
      expiry: m.expiryDate,
    }));
  }, [liveBranchOptions]);

  const combinedItems = useMemo<Product[]>(() => {
    if (!isPharmacy) return items;
    const pharmacySkus = new Set(pharmacyAsProducts.map((p) => p.sku));
    const nonPharmacy = items.filter((p) => !pharmacySkus.has(p.sku));
    return [...pharmacyAsProducts, ...nonPharmacy];
  }, [isPharmacy, items, pharmacyAsProducts]);

  const rows = useMemo(() => {
    if (isPharmacy) {
      let filtered = PHARMACY_MEDICATIONS.filter((m) =>
        (m.brandName + m.drugName + m.batchNumber + m.category).toLowerCase().includes(q.toLowerCase()),
      );
      if (stockFilter === "healthy") filtered = filtered.filter((m) => m.stockLevel > m.reorderLevel);
      if (stockFilter === "low")     filtered = filtered.filter((m) => m.stockLevel > 0 && m.stockLevel <= m.reorderLevel);
      if (stockFilter === "out")     filtered = filtered.filter((m) => m.stockLevel === 0);
      if (stockFilter === "expiring") filtered = filtered.filter((m) => isExpiringWithin(90, m.expiryDate));
      return filtered;
    }
    let filtered = items.filter((p) =>
      (p.name + p.sku + p.category).toLowerCase().includes(q.toLowerCase()),
    );
    if (stockFilter === "healthy")  filtered = filtered.filter((p) => p.stock > p.threshold);
    if (stockFilter === "low")      filtered = filtered.filter((p) => p.stock > 0 && p.stock <= p.threshold);
    if (stockFilter === "out")      filtered = filtered.filter((p) => p.stock === 0);
    if (stockFilter === "expiring") filtered = filtered.filter((p) => !!p.expiry && isExpiringWithin(90, p.expiry));
    return filtered;
  }, [isPharmacy, items, q, stockFilter]);

  const stockValue = useMemo(() => {
    if (isPharmacy)
      return PHARMACY_MEDICATIONS.reduce((sum, m) => sum + m.unitPrice * m.stockLevel, 0);
    return items.reduce((sum, p) => sum + p.price * p.stock, 0);
  }, [isPharmacy, items]);

  const skuCount = isPharmacy ? PHARMACY_MEDICATIONS.length : items.length;
  const lowStockCount = isPharmacy
    ? PHARMACY_MEDICATIONS.filter((m) => m.stockLevel <= m.reorderLevel).length
    : items.filter((p) => p.stock <= p.threshold).length;

  function handleTransfer(sku: string, fromBranch: string, toBranch: string, qty: number) {
    setItems((prev) => {
      const updated = prev.map((p) =>
        p.sku === sku && p.branch === fromBranch ? { ...p, stock: p.stock - qty } : p,
      );
      const destExists = updated.some((p) => p.sku === sku && p.branch === toBranch);
      if (destExists) {
        return updated.map((p) =>
          p.sku === sku && p.branch === toBranch ? { ...p, stock: p.stock + qty } : p,
        );
      }
      const source = prev.find((p) => p.sku === sku && p.branch === fromBranch)!;
      return [...updated, { ...source, branch: toBranch, stock: qty }];
    });
  }

  const pageTitle = isPharmacy ? "Drug Inventory" : "Inventory";
  const pageSubtitle = isPharmacy
    ? `${skuCount} SKUs · ${lowStockCount} below reorder · total stock value ${currency(stockValue)}`
    : `${items.length} SKUs across 4 branches · stock value ${currency(stockValue)}`;

  return (
    <AppShell
      title={pageTitle}
      subtitle={pageSubtitle}
      actions={
        <div className="flex items-center gap-1.5 sm:gap-2">
          <TransferStockDialog
            items={combinedItems}
            onTransfer={handleTransfer}
            branchOptions={liveBranchOptions}
          />
          <AddProductDialog
            onAdd={(p) => setItems((prev) => [p, ...prev])}
            branchOptions={liveBranchOptions}
            isPharmacy={isPharmacy}
          />
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
                placeholder={
                  isPharmacy
                    ? "Search brand, generic, batch number or category"
                    : "Search SKU, product or category"
                }
                className="h-9 w-full rounded-md border border-border bg-background pr-3 pl-9 text-sm outline-none focus:border-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 sm:flex-initial min-w-0">
                <DateRangePicker value={dateRange} onChange={setDateRange} />
              </div>
              <CsvDropdown items={rows as unknown as Product[]} isPharmacy={isPharmacy} />
            </div>
          </div>

          {/* Stock filter chips */}
          <div className="flex flex-wrap gap-1.5 px-3 py-2 border-b border-border">
            {([
              { key: "all",      label: "All",       activeClass: "bg-foreground text-background" },
              { key: "healthy",  label: "Healthy",   activeClass: "bg-emerald-600 text-white" },
              { key: "low",      label: "Low",       activeClass: "bg-amber-500 text-white" },
              { key: "out",      label: "Out",       activeClass: "bg-red-600 text-white" },
              { key: "expiring", label: "Expiring",  activeClass: "bg-orange-500 text-white" },
            ] as const).map(({ key, label, activeClass }) => (
              <button
                key={key}
                onClick={() => setStockFilter(key)}
                aria-pressed={stockFilter === key}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-all shadow-xs border",
                  stockFilter === key
                    ? cn(activeClass, "border-transparent")
                    : "bg-card text-foreground border-border hover:bg-secondary",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Mobile Card List View */}
          <div className="divide-y divide-border sm:hidden">
            {isPharmacy
              ? (rows as unknown as PharmacyMedication[]).map((m) => {
                  const pct = Math.min(100, (m.stockLevel / Math.max(1, m.reorderLevel * 3)) * 100);
                  const low = m.stockLevel <= m.reorderLevel;
                  return (
                    <div key={m.id} className="p-3.5 space-y-2 transition-colors hover:bg-secondary/40">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm leading-snug text-foreground">
                            {m.brandName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {m.drugName}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400 border border-violet-200 dark:border-violet-900/60">
                              {m.category}
                            </span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-900/60">
                              {m.strength} · {m.dosageForm}
                            </span>
                            {m.prescriptionRequired ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
                                Rx
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60">
                                OTC
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="num text-sm font-bold text-foreground shrink-0">{currency(m.unitPrice)}</p>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-0.5 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                          <span className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded border border-border/70 shrink-0 font-medium">
                            {m.batchNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="num font-semibold text-foreground">
                            {m.stockLevel} <span className="text-[10px] font-normal text-muted-foreground">units</span>
                          </span>
                          <StatusBadge tone={m.stockLevel === 0 ? "bad" : low ? "warn" : "good"}>
                            {m.stockLevel === 0 ? "Out" : low ? "Reorder" : "Adequate"}
                          </StatusBadge>
                        </div>
                      </div>

                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            m.stockLevel === 0
                              ? "bg-destructive"
                              : low
                              ? "bg-warning"
                              : "bg-accent",
                          )}
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-xs text-muted-foreground">Expiry</span>
                        <StatusBadge tone={expiryTone(m.expiryDate)}>
                          {m.expiryDate}
                        </StatusBadge>
                      </div>
                    </div>
                  );
                })
              : (rows as unknown as Product[]).map((p) => {
                  const pct = Math.min(100, (p.stock / Math.max(1, p.threshold * 3)) * 100);
                  const low = p.stock <= p.threshold;
                  return (
                    <div key={p.sku} className="p-3.5 space-y-2 transition-colors hover:bg-secondary/40">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm leading-snug text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {p.variant} · {p.category}
                          </p>
                        </div>
                        <p className="num text-sm font-bold text-foreground shrink-0">{currency(p.price)}</p>
                      </div>

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

                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            p.stock === 0 ? "bg-destructive" : low ? "bg-warning" : "bg-accent",
                          )}
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>

                      {p.expiry && (
                        <div className="flex items-center justify-between pt-0.5">
                          <span className="text-xs text-muted-foreground">Expiry</span>
                          <StatusBadge tone={expiryTone(p.expiry)}>
                            {fmtExpiry(p.expiry)}
                          </StatusBadge>
                        </div>
                      )}
                    </div>
                  );
                })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
                  {isPharmacy ? (
                    <>
                      <th className="px-4 py-2.5 font-medium">Medication (Brand / Generic)</th>
                      <th className="px-4 py-2.5 font-medium">Therapeutic Class</th>
                      <th className="px-4 py-2.5 font-medium">Strength &amp; Form</th>
                      <th className="px-4 py-2.5 font-medium">Batch</th>
                      <th className="px-4 py-2.5 text-right font-medium">Unit Price</th>
                      <th className="px-4 py-2.5 text-right font-medium">Stock</th>
                      <th className="px-4 py-2.5 font-medium">Rx</th>
                      <th className="px-4 py-2.5 font-medium">Expiry</th>
                      <th className="px-4 py-2.5 font-medium">Stock Level</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-2.5 font-medium">Product</th>
                      <th className="px-4 py-2.5 font-medium">SKU</th>
                      <th className="px-4 py-2.5 font-medium">Branch</th>
                      <th className="px-4 py-2.5 text-right font-medium">Price</th>
                      <th className="px-4 py-2.5 text-right font-medium">On hand</th>
                      <th className="px-4 py-2.5 font-medium">Expiry</th>
                      <th className="px-4 py-2.5 font-medium">Level</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isPharmacy
                  ? (rows as unknown as PharmacyMedication[]).map((m) => {
                      const pct = Math.min(100, (m.stockLevel / Math.max(1, m.reorderLevel * 3)) * 100);
                      const low = m.stockLevel <= m.reorderLevel;
                      return (
                        <tr key={m.id} className="transition-colors hover:bg-secondary/60">
                          <td className="px-4 py-3">
                            <p className="font-medium">{m.brandName}</p>
                            <p className="text-xs text-muted-foreground">{m.drugName}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900/60 text-violet-700 dark:text-violet-400 px-2 py-0.5 text-[11px] font-semibold">
                              {m.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground text-xs">{m.strength}</span>
                            <span className="mx-1 opacity-50">·</span>
                            {m.dosageForm}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{m.batchNumber}</td>
                          <td className="num px-4 py-3 text-right font-semibold">{currency(m.unitPrice)}</td>
                          <td className="num px-4 py-3 text-right">
                            <span className={low ? "font-semibold text-amber-600 dark:text-amber-400" : "font-semibold"}>
                              {m.stockLevel}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {m.prescriptionRequired ? (
                              <span className="inline-flex items-center rounded bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-400 px-2 py-0.5 text-[11px] font-bold">
                                Rx
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-[11px] font-bold">
                                OTC
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge tone={expiryTone(m.expiryDate)}>
                              {m.expiryDate}
                            </StatusBadge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                                <div
                                  className={cn(
                                    "h-full rounded-full",
                                    m.stockLevel === 0
                                      ? "bg-destructive"
                                      : low
                                      ? "bg-warning"
                                      : "bg-accent",
                                  )}
                                  style={{ width: `${Math.max(pct, 4)}%` }}
                                />
                              </div>
                              <StatusBadge tone={m.stockLevel === 0 ? "bad" : low ? "warn" : "good"}>
                                {m.stockLevel === 0 ? "Out" : low ? "Reorder" : "OK"}
                              </StatusBadge>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  : (rows as unknown as Product[]).map((p) => {
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
                            {p.expiry ? (
                              <StatusBadge tone={expiryTone(p.expiry)}>
                                {fmtExpiry(p.expiry)}
                              </StatusBadge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
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
              {isPharmacy ? (
                <Pill className="size-8 text-muted-foreground" />
              ) : (
                <Boxes className="size-8 text-muted-foreground" />
              )}
              <p className="text-sm font-medium">
                {stockFilter !== "all"
                  ? `No ${stockFilter} stock items found`
                  : isPharmacy ? `No medications match "${q}"` : `No products match "${q}"`}
              </p>
              <Button variant="outline" size="sm" onClick={() => { setQ(""); setStockFilter("all"); }}>
                Clear filters
              </Button>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          {isPharmacy ? (
            <>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FlaskConical className="size-4 text-violet-600 dark:text-violet-400" />
                  <h2 className="text-sm font-semibold">Therapeutic Breakdown</h2>
                </div>
                {(() => {
                  const cats = Array.from(new Set(PHARMACY_MEDICATIONS.map((m) => m.category))).map(
                    (c) => ({
                      name: c,
                      count: PHARMACY_MEDICATIONS.filter((m) => m.category === c).length,
                    }),
                  );
                  return (
                    <ul className="space-y-2 text-sm">
                      {cats.map((c) => (
                        <li key={c.name} className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{c.name}</span>
                          <span className="font-semibold num">{c.count}</span>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="size-4 text-amber-500" />
                  <h2 className="text-sm font-semibold">Expiry &amp; Batch</h2>
                </div>
                {(() => {
                  const expiring = PHARMACY_MEDICATIONS.sort(
                    (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime(),
                  ).slice(0, 5);
                  return (
                    <ul className="space-y-3 text-sm">
                      {expiring.map((m) => (
                        <li key={m.id} className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{m.brandName}</p>
                            <p className="num text-xs text-muted-foreground">{m.batchNumber}</p>
                          </div>
                          <StatusBadge tone={expiryTone(m.expiryDate)}>
                            {m.expiryDate.split(" ").slice(0, 2).join(" ")}
                          </StatusBadge>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <h2 className="text-sm font-semibold mb-3">Classification</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 p-3">
                    <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                      <Stethoscope className="size-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Rx Only</span>
                    </div>
                    <p className="mt-1.5 text-2xl font-bold text-blue-800 dark:text-blue-300 num">
                      {PHARMACY_MEDICATIONS.filter((m) => m.prescriptionRequired).length}
                    </p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 p-3">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                      <HeartPulse className="size-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">OTC</span>
                    </div>
                    <p className="mt-1.5 text-2xl font-bold text-emerald-800 dark:text-emerald-300 num">
                      {PHARMACY_MEDICATIONS.filter((m) => !m.prescriptionRequired).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <h2 className="text-sm font-semibold">Below Reorder Level</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {PHARMACY_MEDICATIONS.filter((m) => m.stockLevel <= m.reorderLevel).length === 0 ? (
                    <li className="text-xs text-muted-foreground">All stock levels adequate.</li>
                  ) : (
                    PHARMACY_MEDICATIONS.filter((m) => m.stockLevel <= m.reorderLevel)
                      .slice(0, 4)
                      .map((m) => (
                        <li key={m.id} className="flex items-center justify-between">
                          <span className="truncate text-xs">{m.brandName}</span>
                          <span className="text-xs font-semibold num text-amber-600 dark:text-amber-400">
                            {m.stockLevel} / {m.reorderLevel}
                          </span>
                        </li>
                      ))
                  )}
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-lg border border-border bg-card p-4">
                <h2 className="text-sm font-semibold">Batch &amp; expiry</h2>
                {(() => {
                  const expiring = items
                    .filter((p) => p.expiry)
                    .sort((a, b) => new Date(a.expiry!).getTime() - new Date(b.expiry!).getTime())
                    .slice(0, 5);
                  return expiring.length === 0 ? (
                    <p className="mt-3 text-xs text-muted-foreground">No expiry dates recorded.</p>
                  ) : (
                    <ul className="mt-3 space-y-3 text-sm">
                      {expiring.map((p) => (
                        <li key={p.sku} className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate">{p.name}</p>
                            <p className="num text-xs text-muted-foreground">{p.sku}</p>
                          </div>
                          <StatusBadge tone={expiryTone(p.expiry!)}>
                            {new Date(p.expiry!).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
                          </StatusBadge>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
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
            </>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
