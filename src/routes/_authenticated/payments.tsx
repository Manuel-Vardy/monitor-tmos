import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Printer,
  Smartphone,
  Landmark,
  Banknote,
  FileSpreadsheet,
  X,
  LayoutGrid,
  List,
  Building2,
  Receipt,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { currency } from "@/lib/mos-data";
import { HOTEL_PAYMENTS, HOTEL_SUMMARY, type HotelPayment } from "@/lib/hotel-data";

export const Route = createFileRoute("/_authenticated/payments")({
  head: () => ({
    meta: [
      { title: "Payments — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Hotel guest folio payments, credit card settlements, corporate billing accounts, and reception cash receipts.",
      },
      { property: "og:title", content: "Payments — Trite Merchant OS" },
    ],
  }),
  component: PaymentsPage,
});

type Method = HotelPayment["paymentMethod"];

const METHOD_CONFIG: Record<
  Method,
  { icon: React.ElementType; color: string; bg: string; activePill: string }
> = {
  "Visa / Mastercard": {
    icon: CreditCard,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800",
    activePill: "bg-blue-600 text-white",
  },
  "Mobile Money (MTN)": {
    icon: Smartphone,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800",
    activePill: "bg-amber-500 text-white",
  },
  Cash: {
    icon: Banknote,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800",
    activePill: "bg-emerald-600 text-white",
  },
  "Corporate Bill": {
    icon: Landmark,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800",
    activePill: "bg-purple-600 text-white",
  },
  "Wire Transfer": {
    icon: Building2,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800",
    activePill: "bg-indigo-600 text-white",
  },
};

function PaymentsPage() {
  const [paymentsList, setPaymentsList] = useState<HotelPayment[]>(HOTEL_PAYMENTS);
  const [methodFilter, setMethodFilter] = useState<Method | "all">("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Selected Folio for Modal View
  const [selectedFolio, setSelectedFolio] = useState<HotelPayment | null>(null);

  // New Payment Modal State
  const [isNewPaymentOpen, setIsNewPaymentOpen] = useState(false);
  const [newGuestName, setNewGuestName] = useState("");
  const [newRoomNumber, setNewRoomNumber] = useState("Room 102");
  const [newAmount, setNewAmount] = useState("850");
  const [newMethod, setNewMethod] = useState<Method>("Visa / Mastercard");
  const [newDesc, setNewDesc] = useState("Room Accommodation & Breakfast");

  const filtered = paymentsList.filter((pay) => {
    const matchMethod = methodFilter === "all" || pay.paymentMethod === methodFilter;
    const matchSearch =
      search === "" ||
      pay.folioNo.toLowerCase().includes(search.toLowerCase()) ||
      pay.guestName.toLowerCase().includes(search.toLowerCase()) ||
      pay.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
      pay.bookingRef.toLowerCase().includes(search.toLowerCase());
    return matchMethod && matchSearch;
  });

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName || !newAmount) return;

    const newPayment: HotelPayment = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      folioNo: `FOLIO-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingRef: `HTL-2026-${Math.floor(8000 + Math.random() * 900)}`,
      guestName: newGuestName,
      roomNumber: newRoomNumber,
      amountPaid: parseFloat(newAmount),
      paymentMethod: newMethod,
      date: "11 Aug 2026",
      itemDescription: newDesc as HotelPayment["itemDescription"],
      receivedBy: "Front Desk Officer",
    };

    setPaymentsList([newPayment, ...paymentsList]);
    setIsNewPaymentOpen(false);
    setNewGuestName("");
    setNewAmount("850");
  };

  return (
    <AppShell
      title="Guest Folio Payments & Billing"
      subtitle={`${currency(paymentsList.reduce((a, p) => a + p.amountPaid, 0))} total in guest room settlements today · ${paymentsList.length} processed payment folios`}
      actions={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsNewPaymentOpen(true)}
            className="h-8 px-2.5 sm:h-9 sm:px-3 text-xs sm:text-sm bg-[#22c55e] text-white hover:bg-[#16a34a] shrink-0"
          >
            <Plus className="size-3.5 sm:size-4" />
            <span className="hidden sm:inline">Process Payment</span>
            <span className="sm:hidden">New Payment</span>
          </Button>
        </div>
      }
    >
      {/* Stat Cards */}
      <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Payments</p>
            <span className="rounded-full bg-emerald-50 p-1.5 sm:p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CreditCard className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {currency(paymentsList.reduce((a, p) => a + p.amountPaid, 0))}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Settled today</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Card Settlements</p>
            <span className="rounded-full bg-blue-50 p-1.5 sm:p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <CreditCard className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
            {paymentsList.filter((p) => p.paymentMethod === "Visa / Mastercard").length} folios
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Visa / Mastercard POS</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Corporate Accounts</p>
            <span className="rounded-full bg-purple-50 p-1.5 sm:p-2 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Landmark className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
            {paymentsList.filter((p) => p.paymentMethod === "Corporate Bill").length} accounts
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Invoiced to corporate</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Folios Issued</p>
            <span className="rounded-full bg-slate-100 p-1.5 sm:p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <FileSpreadsheet className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold">{paymentsList.length}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Receipts logged</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 space-y-2.5">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search folio #, guest name, room number, or booking ref…"
            className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
          />
        </div>

        {/* Filter pills & controls — horizontally scrollable */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setMethodFilter("all")}
            className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
              methodFilter === "all"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-secondary text-muted-foreground hover:bg-border"
            }`}
          >
            All Methods
          </button>
          {(Object.keys(METHOD_CONFIG) as Method[]).map((m) => {
            const cfg = METHOD_CONFIG[m];
            return (
              <button
                key={m}
                onClick={() => setMethodFilter(m)}
                className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                  methodFilter === m ? cfg.activePill : "bg-secondary text-muted-foreground hover:bg-border"
                }`}
              >
                {m}
              </button>
            );
          })}

          {/* View Toggle */}
          <div className="shrink-0 flex items-center rounded-lg border border-border bg-card p-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === "table" ? "bg-secondary text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table View"
            >
              <List className="size-3.5" />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === "cards" ? "bg-secondary text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Folio Cards View"
            >
              <LayoutGrid className="size-3.5" />
            </button>
          </div>

          <div className="shrink-0">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>
      </div>

      {/* Main Content Area: Table vs Cards */}
      {viewMode === "table" ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-2xs">
          <table className="w-full min-w-[780px] text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 whitespace-nowrap">Folio No</th>
                <th className="px-4 py-3 whitespace-nowrap">Date</th>
                <th className="px-4 py-3 whitespace-nowrap">Guest Name</th>
                <th className="px-4 py-3 whitespace-nowrap">Room #</th>
                <th className="px-4 py-3 whitespace-nowrap">Description</th>
                <th className="px-4 py-3 whitespace-nowrap">Payment Method</th>
                <th className="px-4 py-3 font-bold whitespace-nowrap">Amount Paid</th>
                <th className="hidden px-4 py-3 md:table-cell whitespace-nowrap">Received By</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                    No payment folios match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((pay) => {
                  const cfg = METHOD_CONFIG[pay.paymentMethod];
                  const Icon = cfg.icon;
                  return (
                    <tr key={pay.id} className="transition-colors hover:bg-secondary/30">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground whitespace-nowrap">{pay.folioNo}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{pay.date}</td>
                      <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{pay.guestName}</td>
                      <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{pay.roomNumber}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{pay.itemDescription}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ${cfg.bg} ${cfg.color}`}>
                          <Icon className="size-3" />
                          {pay.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{currency(pay.amountPaid)}</td>
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell whitespace-nowrap">{pay.receivedBy}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedFolio(pay)}
                          className="text-xs h-7"
                        >
                          <Printer className="size-3" /> View Folio
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Folio Cards View */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pay) => {
            const cfg = METHOD_CONFIG[pay.paymentMethod];
            const Icon = cfg.icon;
            return (
              <div
                key={pay.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-muted-foreground/30"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-muted-foreground">{pay.folioNo}</span>
                      <h3 className="text-base font-bold text-foreground">{pay.guestName}</h3>
                      <p className="text-xs text-muted-foreground">{pay.roomNumber} · Ref: {pay.bookingRef}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs ${cfg.bg} ${cfg.color}`}>
                      <Icon className="size-3" />
                      {pay.paymentMethod}
                    </span>
                  </div>

                  <div className="my-3 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Charge Item:</span>
                      <span className="font-medium text-foreground">{pay.itemDescription}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date Settled:</span>
                      <span className="font-medium text-foreground">{pay.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cashier:</span>
                      <span className="font-medium text-foreground">{pay.receivedBy}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground">Total Settled</p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{currency(pay.amountPaid)}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedFolio(pay)}
                    className="text-xs h-7"
                  >
                    <Printer className="size-3" /> View Folio
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── PRINTABLE GUEST FOLIO STATEMENT MODAL ────────────────────────────────────── */}
      {selectedFolio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedFolio(null)}
              className="absolute top-4 right-4 rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            {/* Folio Statement Header */}
            <div className="border-b border-border pb-4 text-center">
              <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <Building2 className="size-5" />
                <span className="text-base uppercase tracking-wider">Trite Merchant Hotel & Resort</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">14 Airport Residential Area, Accra Ghana · Tel: +233 30 200 8800</p>
              <span className="inline-block mt-3 rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-wide">
                OFFICIAL GUEST FOLIO STATEMENT
              </span>
            </div>

            {/* Guest & Reservation Metadata */}
            <div className="my-4 grid grid-cols-2 gap-3 text-xs bg-secondary/30 p-3 rounded-lg border border-border/60">
              <div>
                <p className="text-muted-foreground">Guest Name:</p>
                <p className="font-bold text-foreground">{selectedFolio.guestName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Folio Number:</p>
                <p className="font-mono font-bold text-foreground">{selectedFolio.folioNo}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Room Number:</p>
                <p className="font-semibold text-foreground">{selectedFolio.roomNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Booking Ref:</p>
                <p className="font-mono text-foreground">{selectedFolio.bookingRef}</p>
              </div>
            </div>

            {/* Folio Charges Line Items */}
            <div className="my-4 space-y-2 text-xs">
              <p className="font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">
                Itemized Charges & Tax Breakdown
              </p>
              <div className="flex justify-between py-1">
                <span>{selectedFolio.itemDescription}</span>
                <span className="font-semibold">{currency(Math.round(selectedFolio.amountPaid * 0.8))}</span>
              </div>
              <div className="flex justify-between py-1 text-muted-foreground">
                <span>Ghana Tourism Levy (1%)</span>
                <span>{currency(Math.round(selectedFolio.amountPaid * 0.01))}</span>
              </div>
              <div className="flex justify-between py-1 text-muted-foreground">
                <span>VAT (15%) & Statutory Taxes</span>
                <span>{currency(Math.round(selectedFolio.amountPaid * 0.19))}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-sm font-bold">
                <span>Total Folio Settlement</span>
                <span className="text-emerald-600 dark:text-emerald-400">{currency(selectedFolio.amountPaid)}</span>
              </div>
            </div>

            {/* Payment Method Badge & Cashier */}
            <div className="my-4 rounded-lg bg-secondary/40 p-3 text-xs flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">Payment Method</p>
                <p className="font-bold text-foreground">{selectedFolio.paymentMethod}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase text-muted-foreground">Issued By</p>
                <p className="font-semibold text-foreground">{selectedFolio.receivedBy}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-2">
              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={() => window.print()}
              >
                <Printer className="size-4" /> Print Folio Receipt
              </Button>
              <Button
                className="w-full bg-[#22c55e] text-white hover:bg-[#16a34a] text-xs"
                onClick={() => setSelectedFolio(null)}
              >
                Close Statement
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── PROCESS NEW PAYMENT MODAL ──────────────────────────────────────────────── */}
      {isNewPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleAddPayment}
            className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95"
          >
            <button
              type="button"
              onClick={() => setIsNewPaymentOpen(false)}
              className="absolute top-4 right-4 rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold mb-4">
              <Receipt className="size-5" />
              <h2 className="text-lg">Process Guest Folio Settlement</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Guest Full Name</label>
                <input
                  required
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  placeholder="e.g. Chief Nana Mensah"
                  className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Room Number</label>
                  <select
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                    className="h-9 w-full rounded-md border border-border bg-card px-2 text-xs outline-none focus:border-ring"
                  >
                    <option value="Room 101">Room 101 (Deluxe King)</option>
                    <option value="Room 102">Room 102 (Standard Twin)</option>
                    <option value="Room 201">Room 201 (Executive Suite)</option>
                    <option value="Penthouse 401">Penthouse 401 (Presidential)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Amount (GHS)</label>
                  <input
                    required
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="850"
                    className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-ring"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Payment Method</label>
                <select
                  value={newMethod}
                  onChange={(e) => setNewMethod(e.target.value as Method)}
                  className="h-9 w-full rounded-md border border-border bg-card px-2 text-xs outline-none focus:border-ring"
                >
                  <option value="Visa / Mastercard">Visa / Mastercard</option>
                  <option value="Mobile Money (MTN)">Mobile Money (MTN)</option>
                  <option value="Cash">Cash</option>
                  <option value="Corporate Bill">Corporate Bill Account</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Charge Description</label>
                <input
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Room Accommodation & Breakfast"
                  className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-ring"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full text-xs"
                onClick={() => setIsNewPaymentOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full bg-[#22c55e] text-white hover:bg-[#16a34a] text-xs"
              >
                Settle & Issue Folio
              </Button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
