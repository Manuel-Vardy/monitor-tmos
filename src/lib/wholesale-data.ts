export type WholesaleCustomer = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  creditLimit: number;
  balanceUsed: number;
  overdue: number;
  status: "active" | "credit_hold" | "inactive";
};

export type WholesaleOrder = {
  id: string;
  customerId: string;
  customerName: string;
  items: number;
  total: number;
  status: "pending" | "processing" | "dispatched" | "delivered" | "cancelled";
  date: string;
  branch: string;
  routeId?: string;
};

export type WholesalePurchaseOrder = {
  id: string;
  supplier: string;
  itemsCount: number;
  totalCost: number;
  status: "draft" | "submitted" | "partially_received" | "received" | "cancelled";
  orderDate: string;
  expectedDelivery: string;
  branch: string;
};

export type WholesaleDeliveryRoute = {
  id: string;
  driver: string;
  destination: string;
  customerName: string;
  status: "In transit" | "Loading" | "Delayed" | "Scheduled";
  eta: string;
};

// ─── Central Wholesale Customers ─────────────────────────────────────────────

export const WHOLESALE_CUSTOMERS: WholesaleCustomer[] = [
  {
    id: "CUST-001",
    name: "Kwame Mensah",
    company: "Ashanti Stores",
    email: "kwame@ashantistores.com",
    phone: "+233 24 412 3456",
    city: "Accra",
    totalOrders: 42,
    totalSpent: 184_200,
    creditLimit: 50_000,
    balanceUsed: 32_000,
    overdue: 0,
    status: "active",
  },
  {
    id: "CUST-002",
    name: "Kofi Aboagye",
    company: "Northern Traders",
    email: "kofi@northerntraders.gh",
    phone: "+233 20 891 2345",
    city: "Kumasi",
    totalOrders: 28,
    totalSpent: 112_400,
    creditLimit: 30_000,
    balanceUsed: 28_500,
    overdue: 8_500,
    status: "credit_hold",
  },
  {
    id: "CUST-003",
    name: "Abena Darkoa",
    company: "Eastern Supplies",
    email: "abena@easternsupplies.com",
    phone: "+233 55 678 9012",
    city: "Koforidua",
    totalOrders: 35,
    totalSpent: 98_900,
    creditLimit: 20_000,
    balanceUsed: 14_000,
    overdue: 0,
    status: "active",
  },
  {
    id: "CUST-004",
    name: "Emmanuel Acheampong",
    company: "Central Mart",
    email: "e.acheampong@centralmart.com",
    phone: "+233 27 345 6789",
    city: "Cape Coast",
    totalOrders: 19,
    totalSpent: 64_800,
    creditLimit: 15_000,
    balanceUsed: 15_000,
    overdue: 3_200,
    status: "credit_hold",
  },
  {
    id: "CUST-005",
    name: "Yaa Fosua",
    company: "Western Co-op",
    email: "yaa.fosua@westerncoop.com",
    phone: "+233 24 901 2345",
    city: "Takoradi",
    totalOrders: 22,
    totalSpent: 88_100,
    creditLimit: 25_000,
    balanceUsed: 18_000,
    overdue: 0,
    status: "active",
  },
  {
    id: "CUST-006",
    name: "Nana Yaw Agyeman",
    company: "Mensah Wholesalers Ltd",
    email: "nanayaw@mensahwholesalers.com",
    phone: "+233 50 123 4567",
    city: "Accra",
    totalOrders: 34,
    totalSpent: 145_600,
    creditLimit: 40_000,
    balanceUsed: 12_480,
    overdue: 1_800,
    status: "active",
  },
];

// ─── Central Wholesale Orders ────────────────────────────────────────────────

export const WHOLESALE_ORDERS: WholesaleOrder[] = [
  {
    id: "ORD-0091",
    customerId: "CUST-001",
    customerName: "Ashanti Stores",
    items: 24,
    total: 32_000,
    status: "delivered",
    date: "11 Aug 2026",
    branch: "Osu Flagship",
    routeId: "RT-001",
  },
  {
    id: "ORD-0090",
    customerId: "CUST-002",
    customerName: "Northern Traders",
    items: 18,
    total: 28_500,
    status: "dispatched",
    date: "11 Aug 2026",
    branch: "Kumasi Adum",
    routeId: "RT-002",
  },
  {
    id: "ORD-0089",
    customerId: "CUST-005",
    customerName: "Western Co-op",
    items: 36,
    total: 18_000,
    status: "processing",
    date: "10 Aug 2026",
    branch: "Takoradi Market Circle",
    routeId: "RT-003",
  },
  {
    id: "ORD-0088",
    customerId: "CUST-004",
    customerName: "Central Mart",
    items: 12,
    total: 15_000,
    status: "pending",
    date: "10 Aug 2026",
    branch: "Osu Flagship",
    routeId: "RT-004",
  },
  {
    id: "ORD-0087",
    customerId: "CUST-003",
    customerName: "Eastern Supplies",
    items: 14,
    total: 14_000,
    status: "dispatched",
    date: "09 Aug 2026",
    branch: "East Legon",
    routeId: "RT-005",
  },
  {
    id: "ORD-0086",
    customerId: "CUST-006",
    customerName: "Mensah Wholesalers Ltd",
    items: 20,
    total: 12_480,
    status: "delivered",
    date: "09 Aug 2026",
    branch: "Osu Flagship",
  },
  {
    id: "ORD-0085",
    customerId: "CUST-001",
    customerName: "Ashanti Stores",
    items: 42,
    total: 45_600,
    status: "delivered",
    date: "08 Aug 2026",
    branch: "Osu Flagship",
  },
  {
    id: "ORD-0084",
    customerId: "CUST-002",
    customerName: "Northern Traders",
    items: 9,
    total: 16_800,
    status: "delivered",
    date: "08 Aug 2026",
    branch: "Kumasi Adum",
  },
  {
    id: "ORD-0083",
    customerId: "CUST-005",
    customerName: "Western Co-op",
    items: 60,
    total: 31_200,
    status: "delivered",
    date: "07 Aug 2026",
    branch: "Takoradi Market Circle",
  },
  {
    id: "ORD-0082",
    customerId: "CUST-003",
    customerName: "Eastern Supplies",
    items: 15,
    total: 21_000,
    status: "cancelled",
    date: "07 Aug 2026",
    branch: "East Legon",
  },
];

// ─── Central Wholesale Purchase Orders (Supplier Payables) ───────────────────

export const WHOLESALE_PURCHASE_ORDERS: WholesalePurchaseOrder[] = [
  {
    id: "PO-2026-041",
    supplier: "Unilever Ghana Ltd",
    itemsCount: 150,
    totalCost: 45_200,
    status: "received",
    orderDate: "05 Aug 2026",
    expectedDelivery: "09 Aug 2026",
    branch: "Osu Flagship",
  },
  {
    id: "PO-2026-042",
    supplier: "Nestlé Ghana Ltd",
    itemsCount: 80,
    totalCost: 28_400,
    status: "partially_received",
    orderDate: "07 Aug 2026",
    expectedDelivery: "12 Aug 2026",
    branch: "East Legon",
  },
  {
    id: "PO-2026-043",
    supplier: "Fan Milk PLC",
    itemsCount: 200,
    totalCost: 18_900,
    status: "submitted",
    orderDate: "09 Aug 2026",
    expectedDelivery: "13 Aug 2026",
    branch: "Kumasi Adum",
  },
  {
    id: "PO-2026-044",
    supplier: "Guinness Ghana Breweries",
    itemsCount: 320,
    totalCost: 64_000,
    status: "submitted",
    orderDate: "10 Aug 2026",
    expectedDelivery: "14 Aug 2026",
    branch: "Osu Flagship",
  },
  {
    id: "PO-2026-045",
    supplier: "Kasapreko Company Ltd",
    itemsCount: 95,
    totalCost: 14_300,
    status: "draft",
    orderDate: "11 Aug 2026",
    expectedDelivery: "16 Aug 2026",
    branch: "Takoradi Market Circle",
  },
  {
    id: "PO-2026-046",
    supplier: "Wilmar Africa Ltd",
    itemsCount: 60,
    totalCost: 32_100,
    status: "received",
    orderDate: "02 Aug 2026",
    expectedDelivery: "06 Aug 2026",
    branch: "Kumasi Adum",
  },
];

// ─── Central Wholesale Delivery Routes ───────────────────────────────────────

export const WHOLESALE_DELIVERY_ROUTES: WholesaleDeliveryRoute[] = [
  { id: "RT-001", driver: "Kwame A",  destination: "Tema",        customerName: "Ashanti Stores",   status: "In transit", eta: "2h" },
  { id: "RT-002", driver: "Ama B",    destination: "Kumasi",      customerName: "Northern Traders", status: "Loading",    eta: "4h" },
  { id: "RT-003", driver: "Kofi C",   destination: "Takoradi",    customerName: "Western Co-op",    status: "Delayed",    eta: "6h" },
  { id: "RT-004", driver: "Abena D",  destination: "Cape Coast",  customerName: "Central Mart",     status: "In transit", eta: "3h" },
  { id: "RT-005", driver: "Yaw E",    destination: "Koforidua",   customerName: "Eastern Supplies", status: "Scheduled",  eta: "8h" },
];

// ─── Derived Wholesale Metrics (Computed dynamically for perfect consistency) ─

export const WHOLESALE_SUMMARY = {
  bulkOrderValue: WHOLESALE_ORDERS.reduce((acc, o) => acc + (o.status !== "cancelled" ? o.total : 0), 0),
  supplierPayables: WHOLESALE_PURCHASE_ORDERS.filter((po) => po.status === "submitted" || po.status === "partially_received").reduce((acc, po) => acc + po.totalCost, 0),
  creditReceivables: WHOLESALE_CUSTOMERS.reduce((acc, c) => acc + c.balanceUsed, 0),
  totalOverdueReceivables: WHOLESALE_CUSTOMERS.reduce((acc, c) => acc + c.overdue, 0),
  overdueCount: WHOLESALE_CUSTOMERS.filter((c) => c.overdue > 0).length,
  activeRoutesCount: 12,
  delayedRoutesCount: WHOLESALE_DELIVERY_ROUTES.filter((r) => r.status === "Delayed").length,
};
