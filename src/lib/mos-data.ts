export const currency = (n: number) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 2,
  }).format(n);

export type Branch = {
  id: string;
  name: string;
  city: string;
  staff: number;
  revenue: number;
  growth: number;
  stockValue: number;
  settlement: string;
};

export const branches: Branch[] = [
  {
    id: "all",
    name: "All branches",
    city: "Organisation-wide",
    staff: 34,
    revenue: 482_310,
    growth: 12.4,
    stockValue: 611_400,
    settlement: "HQ consolidated",
  },
  {
    id: "osu",
    name: "Osu Flagship",
    city: "Accra",
    staff: 11,
    revenue: 186_420,
    growth: 14.2,
    stockValue: 224_800,
    settlement: "GCB · ****4410",
  },
  {
    id: "east-legon",
    name: "East Legon",
    city: "Accra",
    staff: 8,
    revenue: 121_980,
    growth: 6.1,
    stockValue: 158_200,
    settlement: "MTN MoMo · ****0245",
  },
  {
    id: "kumasi",
    name: "Kumasi Adum",
    city: "Kumasi",
    staff: 9,
    revenue: 104_530,
    growth: -3.4,
    stockValue: 141_600,
    settlement: "HQ consolidated",
  },
  {
    id: "takoradi",
    name: "Takoradi Market Circle",
    city: "Takoradi",
    staff: 6,
    revenue: 69_380,
    growth: 21.7,
    stockValue: 86_800,
    settlement: "Telecel Cash · ****7781",
  },
];

export const revenueSeries = [
  { day: "Mon", sales: 52_400, settled: 49_100 },
  { day: "Tue", sales: 61_200, settled: 58_800 },
  { day: "Wed", sales: 48_900, settled: 47_600 },
  { day: "Thu", sales: 73_100, settled: 68_400 },
  { day: "Fri", sales: 91_800, settled: 84_200 },
  { day: "Sat", sales: 108_400, settled: 96_100 },
  { day: "Sun", sales: 46_510, settled: 44_000 },
];

export const paymentMix = [
  { method: "Mobile money", value: 46, amount: 221_862 },
  { method: "Card", value: 22, amount: 106_108 },
  { method: "Bank transfer", value: 17, amount: 81_993 },
  { method: "Stablecoin", value: 9, amount: 43_408 },
  { method: "Cash", value: 6, amount: 28_939 },
];

export type PayStatus = "settled" | "confirmed" | "pending" | "failed";

export const activity = [
  {
    id: "TRX-88214",
    what: "Sale · 4 items",
    who: "Ama Boateng · Cashier",
    where: "Osu Flagship",
    when: "2 min ago",
    amount: 480,
    status: "confirmed" as PayStatus,
    method: "MTN MoMo",
  },
  {
    id: "TRX-88213",
    what: "Invoice INV-2041 paid",
    who: "System · Trite PSP",
    where: "East Legon",
    when: "9 min ago",
    amount: 12_400,
    status: "settled" as PayStatus,
    method: "Bank transfer",
  },
  {
    id: "TRX-88212",
    what: "Sale · 1 item",
    who: "Kwesi Mensah · Cashier",
    where: "Kumasi Adum",
    when: "14 min ago",
    amount: 2_150,
    status: "pending" as PayStatus,
    method: "USDC",
  },
  {
    id: "TRX-88211",
    what: "Refund · order 88190",
    who: "Nana Adjei · Branch manager",
    where: "Takoradi",
    when: "31 min ago",
    amount: -320,
    status: "settled" as PayStatus,
    method: "Card",
  },
  {
    id: "TRX-88210",
    what: "Sale · 12 items",
    who: "Ama Boateng · Cashier",
    where: "Osu Flagship",
    when: "48 min ago",
    amount: 3_890,
    status: "failed" as PayStatus,
    method: "Card",
  },
];

export type Product = {
  sku: string;
  name: string;
  variant: string;
  category: string;
  price: number;
  stock: number;
  threshold: number;
  branch: string;
  expiry?: string; // ISO date string (YYYY-MM-DD), optional
};

export const products: Product[] = [
  {
    sku: "TRT-1001",
    name: "Shea Butter Tub",
    variant: "500g",
    category: "Personal care",
    price: 65,
    stock: 4,
    threshold: 12,
    branch: "Osu Flagship",
  },
  {
    sku: "TRT-1002",
    name: "Sobolo Concentrate",
    variant: "1L",
    category: "Beverages",
    price: 38,
    stock: 96,
    threshold: 20,
    branch: "Osu Flagship",
    expiry: "2025-08-12",
  },
  {
    sku: "TRT-1003",
    name: "Kente Tote Bag",
    variant: "Large / Blue",
    category: "Apparel",
    price: 220,
    stock: 0,
    threshold: 6,
    branch: "East Legon",
  },
  {
    sku: "TRT-1004",
    name: "Cocoa Powder",
    variant: "250g",
    category: "Groceries",
    price: 42,
    stock: 18,
    threshold: 25,
    branch: "Kumasi Adum",
    expiry: "2025-09-03",
  },
  {
    sku: "TRT-1005",
    name: "Palm Oil",
    variant: "5L",
    category: "Groceries",
    price: 180,
    stock: 61,
    threshold: 15,
    branch: "Kumasi Adum",
  },
  {
    sku: "TRT-1006",
    name: "Black Soap Bar",
    variant: "Pack of 6",
    category: "Personal care",
    price: 54,
    stock: 9,
    threshold: 20,
    branch: "Takoradi",
  },
  {
    sku: "TRT-1007",
    name: "Rice · Local",
    variant: "25kg",
    category: "Groceries",
    price: 640,
    stock: 32,
    threshold: 10,
    branch: "Osu Flagship",
  },
  {
    sku: "TRT-1008",
    name: "Bottled Water",
    variant: "Crate of 24",
    category: "Beverages",
    price: 45,
    stock: 210,
    threshold: 40,
    branch: "East Legon",
    expiry: "2025-11-14",
  },
];

export const posCatalogue = [
  { sku: "TRT-1002", name: "Sobolo Concentrate", price: 38, category: "Beverages" },
  { sku: "TRT-1008", name: "Bottled Water", price: 45, category: "Beverages" },
  { sku: "TRT-1001", name: "Shea Butter Tub", price: 65, category: "Personal care" },
  { sku: "TRT-1006", name: "Black Soap Bar", price: 54, category: "Personal care" },
  { sku: "TRT-1004", name: "Cocoa Powder", price: 42, category: "Groceries" },
  { sku: "TRT-1005", name: "Palm Oil", price: 180, category: "Groceries" },
  { sku: "TRT-1007", name: "Rice · Local", price: 640, category: "Groceries" },
  { sku: "TRT-1003", name: "Kente Tote Bag", price: 220, category: "Apparel" },
  { sku: "TRT-1009", name: "Groundnut Paste", price: 28, category: "Groceries" },
  { sku: "TRT-1010", name: "Plantain Chips", price: 12, category: "Snacks" },
  { sku: "TRT-1011", name: "Ginger Tea Box", price: 33, category: "Beverages" },
  { sku: "TRT-1012", name: "Cotton Wrapper", price: 145, category: "Apparel" },
];

export type Invoice = {
  id: string;
  customer: string;
  issued: string;
  due: string;
  amount: number;
  status: "draft" | "sent" | "viewed" | "paid" | "overdue";
  recurring: boolean;
};

export const invoices: Invoice[] = [
  {
    id: "INV-2044",
    customer: "Melcom Procurement",
    issued: "12 Jul",
    due: "26 Jul",
    amount: 48_200,
    status: "overdue",
    recurring: false,
  },
  {
    id: "INV-2043",
    customer: "Ridge Hospital Pharmacy",
    issued: "18 Jul",
    due: "01 Aug",
    amount: 21_450,
    status: "viewed",
    recurring: true,
  },
  {
    id: "INV-2042",
    customer: "Kofi's Mini Mart",
    issued: "21 Jul",
    due: "04 Aug",
    amount: 6_780,
    status: "sent",
    recurring: false,
  },
  {
    id: "INV-2041",
    customer: "Legon Hall Catering",
    issued: "22 Jul",
    due: "05 Aug",
    amount: 12_400,
    status: "paid",
    recurring: true,
  },
  {
    id: "INV-2040",
    customer: "Tema Wholesale Ltd",
    issued: "24 Jul",
    due: "07 Aug",
    amount: 92_300,
    status: "draft",
    recurring: false,
  },
];

export const auditLog = [
  {
    time: "14:22:08",
    who: "Ama Boateng",
    role: "Cashier",
    action: "Sale completed",
    target: "TRX-88214",
    branch: "Osu Flagship",
    type: "payment",
  },
  {
    time: "14:16:51",
    who: "System",
    role: "Trite PSP",
    action: "Settlement posted",
    target: "STL-3391",
    branch: "Organisation",
    type: "settlement",
  },
  {
    time: "13:58:12",
    who: "Nana Adjei",
    role: "Branch manager",
    action: "Price edited · 220 → 245",
    target: "TRT-1003",
    branch: "East Legon",
    type: "stock",
  },
  {
    time: "13:40:03",
    who: "Kwesi Mensah",
    role: "Cashier",
    action: "Refund issued",
    target: "TRX-88190",
    branch: "Kumasi Adum",
    type: "refund",
  },
  {
    time: "12:11:47",
    who: "Efua Sarpong",
    role: "Owner",
    action: "Permission granted · Accountant",
    target: "user_2298",
    branch: "Organisation",
    type: "permission",
  },
  {
    time: "11:02:19",
    who: "Supplier link",
    role: "External API",
    action: "Restock confirmed · +120 units",
    target: "TRT-1008",
    branch: "East Legon",
    type: "stock",
  },
];

export const deliveries = [
  {
    id: "ORD-5512",
    customer: "Akosua Danso",
    partner: "Bolt Send",
    status: "in-transit",
    fee: 25,
    branch: "Osu Flagship",
    eta: "18 min",
  },
  {
    id: "ORD-5511",
    customer: "Yaw Owusu",
    partner: "Glovo",
    status: "ready",
    fee: 18,
    branch: "East Legon",
    eta: "Awaiting courier",
  },
  {
    id: "ORD-5510",
    customer: "Tema Wholesale Ltd",
    partner: "Speedaf",
    status: "delivered",
    fee: 140,
    branch: "Kumasi Adum",
    eta: "Delivered 11:04",
  },
  {
    id: "ORD-5509",
    customer: "Mariam Issah",
    partner: "Bolt Send",
    status: "delayed",
    fee: 25,
    branch: "Takoradi",
    eta: "42 min late",
  },
];

export const partners = [
  { name: "Bolt Send", connected: true, onTime: 94, costPerDelivery: 24 },
  { name: "Glovo", connected: true, onTime: 88, costPerDelivery: 19 },
  { name: "Speedaf", connected: true, onTime: 91, costPerDelivery: 132 },
  { name: "Jumia Logistics", connected: false, onTime: 0, costPerDelivery: 0 },
];

export const roles = [
  {
    role: "Owner / Admin",
    people: 2,
    scope: "All branches",
    perms: "Full access, staff & settlement control",
  },
  {
    role: "Branch manager",
    people: 4,
    scope: "Assigned branch",
    perms: "Stock, sales, staff, daily reconciliation",
  },
  {
    role: "Cashier",
    people: 21,
    scope: "Assigned till",
    perms: "Checkout, receipts, till open/close",
  },
  {
    role: "Accountant",
    people: 3,
    scope: "All branches",
    perms: "Exports, settlements, invoice status",
  },
  { role: "Auditor", people: 2, scope: "All branches", perms: "Read-only audit trail" },
  {
    role: "Delivery coordinator",
    people: 2,
    scope: "All branches",
    perms: "Fulfilment queue, courier assignment",
  },
];

/* ---------- Dashboard drill-down helpers (mock derivations) ---------- */

export const branchOf = (label: string) =>
  branches.find(
    (b) => b.id !== "all" && b.name.toLowerCase().startsWith(label.toLowerCase().split(" ")[0]!),
  )?.id ?? "all";

export const branchName = (id: string) => branches.find((b) => b.id === id)?.name ?? "All branches";

/** Share of organisation revenue held by a branch (1 for "all"). */
export const branchShare = (id: string) => {
  if (id === "all") return 1;
  const b = branches.find((x) => x.id === id);
  return b ? b.revenue / branches[0]!.revenue : 1;
};

export const ranges = [
  { key: "7d", label: "7 days", points: 7 },
  { key: "14d", label: "14 days", points: 14 },
  { key: "30d", label: "30 days", points: 30 },
] as const;

export type RangeKey = (typeof ranges)[number]["key"];

/** Deterministic pseudo-series for a branch + range. */
export function seriesFor(branchId: string, rangeKey: RangeKey) {
  const points = ranges.find((r) => r.key === rangeKey)?.points ?? 7;
  const share = branchShare(branchId);
  return Array.from({ length: points }, (_, i) => {
    const base = revenueSeries[i % revenueSeries.length]!;
    const wobble = 0.88 + ((Math.sin(i * 1.7 + points) + 1) / 2) * 0.28;
    const sales = Math.round(base.sales * share * wobble);
    const settled = Math.round(base.settled * share * wobble * 0.96);
    return {
      day: points <= 7 ? base.day : `D${i + 1}`,
      label: points <= 7 ? base.day : `Day ${i + 1}`,
      sales,
      settled,
      gap: sales - settled,
    };
  });
}

export function paymentMixFor(branchId: string) {
  const share = branchShare(branchId);
  const tilt: Record<string, number> = {
    osu: 1.05,
    "east-legon": 0.95,
    kumasi: 1.12,
    takoradi: 0.9,
  };
  const t = tilt[branchId] ?? 1;
  const raw = paymentMix.map((m, i) => ({
    ...m,
    amount: Math.round(m.amount * share * (i === 0 ? t : 1)),
    value: Math.max(1, Math.round(m.value * (i === 0 ? t : 1))),
  }));
  const total = raw.reduce((s, m) => s + m.value, 0);
  return raw.map((m) => ({ ...m, value: Math.round((m.value / total) * 100) }));
}

export type LineItem = {
  sku: string;
  name: string;
  qty: number;
  unitPrice: number;
};

export const activityLineItems: Record<string, LineItem[]> = {
  "TRX-88214": [
    { sku: "TRT-1001", name: "Shea Butter Tub (500g)",   qty: 2, unitPrice: 65  },
    { sku: "TRT-1004", name: "Cocoa Powder (250g)",       qty: 1, unitPrice: 42  },
    { sku: "TRT-1010", name: "Plantain Chips",            qty: 1, unitPrice: 12  },
  ],
  "TRX-88213": [],  // Invoice payment — no line items
  "TRX-88212": [
    { sku: "TRT-1007", name: "Rice · Local (25kg)",       qty: 1, unitPrice: 640 },
  ],
  "TRX-88211": [
    { sku: "TRT-1003", name: "Kente Tote Bag (Large/Blue)", qty: 1, unitPrice: 220 },
  ],
  "TRX-88210": [
    { sku: "TRT-1005", name: "Palm Oil (5L)",             qty: 4, unitPrice: 180 },
    { sku: "TRT-1002", name: "Sobolo Concentrate (1L)",   qty: 3, unitPrice: 38  },
    { sku: "TRT-1006", name: "Black Soap Bar (Pack of 6)", qty: 2, unitPrice: 54 },
    { sku: "TRT-1009", name: "Groundnut Paste",           qty: 2, unitPrice: 28  },
    { sku: "TRT-1011", name: "Ginger Tea Box",            qty: 1, unitPrice: 33  },
    { sku: "TRT-1008", name: "Bottled Water (Crate/24)",  qty: 1, unitPrice: 45  },
    { sku: "TRT-1012", name: "Cotton Wrapper",            qty: 1, unitPrice: 145 },
  ],
};
export const activityRows = activity.map((a) => ({ ...a, branchId: branchOf(a.where) }));
export const productRows = products.map((p) => ({ ...p, branchId: branchOf(p.branch) }));
