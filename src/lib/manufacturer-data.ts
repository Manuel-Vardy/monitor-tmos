// ─── Manufacturer — Shared Data ───────────────────────────────────────────────
// All entities cross-reference each other so every page shows consistent data.

// ── Types ─────────────────────────────────────────────────────────────────────

export type RawMaterialStatus = "In Stock" | "Low Stock" | "Out of Stock" | "On Order";
export type ProductionStatus = "Scheduled" | "In Progress" | "Completed" | "On Hold" | "Quality Check";
export type POStatus = "Pending" | "Approved" | "Received" | "Cancelled" | "Partial";
export type FinishedGoodStatus = "Available" | "Reserved" | "Shipped" | "Low Stock";

export interface RawMaterial {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantityInStock: number;
  reorderLevel: number;
  unitCost: number;
  supplierId: string;
  supplierName: string;
  lastRestockedDate: string;
  status: RawMaterialStatus;
}

export interface ProductionBatch {
  id: string;
  productName: string;
  rawMaterialIds: string[];
  inputMaterials: { materialId: string; materialName: string; quantity: number; unit: string }[];
  outputQuantity: number;
  outputUnit: string;
  targetQuantity: number;
  progressPct: number;
  startDate: string;
  expectedEndDate: string;
  status: ProductionStatus;
  assignedLine: string;
  supervisor: string;
  finishedGoodId?: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  orderDate: string;
  expectedDelivery: string;
  status: POStatus;
  approvedBy?: string;
  notes: string;
}

export interface FinishedGood {
  id: string;
  name: string;
  category: string;
  batchId: string;
  quantityAvailable: number;
  quantityReserved: number;
  unit: string;
  unitCost: number;
  sellingPrice: number;
  warehouseLocation: string;
  manufacturedDate: string;
  expiryDate?: string;
  status: FinishedGoodStatus;
}

// ── Suppliers (referenced across POs and raw materials) ───────────────────────

export const SUPPLIERS = [
  { id: "SUP-01", name: "AgroLink Supplies Ltd.", contact: "Mr. Kwame Asare", phone: "+233 20 111 2233" },
  { id: "SUP-02", name: "West Africa Chemicals Co.", contact: "Ms. Ama Boateng", phone: "+233 24 222 3344" },
  { id: "SUP-03", name: "Ghana Palm Processors", contact: "Mr. Kofi Mensah", phone: "+233 27 333 4455" },
  { id: "SUP-04", name: "Northern Shea Cooperative", contact: "Mrs. Efua Darko", phone: "+233 26 444 5566" },
  { id: "SUP-05", name: "Tropical Flavours Ltd.", contact: "Dr. Yaw Frimpong", phone: "+233 50 555 6677" },
];

// ── Raw Materials ─────────────────────────────────────────────────────────────

export const RAW_MATERIALS: RawMaterial[] = [
  {
    id: "RM-001",
    name: "Raw Cocoa Beans",
    category: "Agricultural",
    unit: "kg",
    quantityInStock: 2400,
    reorderLevel: 500,
    unitCost: 28,
    supplierId: "SUP-01",
    supplierName: "AgroLink Supplies Ltd.",
    lastRestockedDate: "05 Aug 2026",
    status: "In Stock",
  },
  {
    id: "RM-002",
    name: "Crude Palm Oil",
    category: "Agricultural",
    unit: "litres",
    quantityInStock: 310,
    reorderLevel: 400,
    unitCost: 12,
    supplierId: "SUP-03",
    supplierName: "Ghana Palm Processors",
    lastRestockedDate: "28 Jul 2026",
    status: "Low Stock",
  },
  {
    id: "RM-003",
    name: "Raw Shea Kernels",
    category: "Agricultural",
    unit: "kg",
    quantityInStock: 3800,
    reorderLevel: 800,
    unitCost: 18,
    supplierId: "SUP-04",
    supplierName: "Northern Shea Cooperative",
    lastRestockedDate: "01 Aug 2026",
    status: "In Stock",
  },
  {
    id: "RM-004",
    name: "Refined Cane Sugar",
    category: "Food Ingredient",
    unit: "kg",
    quantityInStock: 0,
    reorderLevel: 200,
    unitCost: 8,
    supplierId: "SUP-01",
    supplierName: "AgroLink Supplies Ltd.",
    lastRestockedDate: "10 Jul 2026",
    status: "Out of Stock",
  },
  {
    id: "RM-005",
    name: "Arabica Coffee Beans",
    category: "Agricultural",
    unit: "kg",
    quantityInStock: 680,
    reorderLevel: 200,
    unitCost: 45,
    supplierId: "SUP-05",
    supplierName: "Tropical Flavours Ltd.",
    lastRestockedDate: "08 Aug 2026",
    status: "In Stock",
  },
  {
    id: "RM-006",
    name: "Sodium Hydroxide (Lye)",
    category: "Chemical",
    unit: "kg",
    quantityInStock: 120,
    reorderLevel: 150,
    unitCost: 22,
    supplierId: "SUP-02",
    supplierName: "West Africa Chemicals Co.",
    lastRestockedDate: "03 Aug 2026",
    status: "Low Stock",
  },
  {
    id: "RM-007",
    name: "Cocoa Butter",
    category: "Agricultural",
    unit: "kg",
    quantityInStock: 900,
    reorderLevel: 300,
    unitCost: 60,
    supplierId: "SUP-01",
    supplierName: "AgroLink Supplies Ltd.",
    lastRestockedDate: "06 Aug 2026",
    status: "In Stock",
  },
  {
    id: "RM-008",
    name: "Fragrance Oils (Lavender)",
    category: "Chemical",
    unit: "litres",
    quantityInStock: 45,
    reorderLevel: 50,
    unitCost: 85,
    supplierId: "SUP-02",
    supplierName: "West Africa Chemicals Co.",
    lastRestockedDate: "25 Jul 2026",
    status: "Low Stock",
  },
];

// ── Production Batches ────────────────────────────────────────────────────────

export const PRODUCTION_BATCHES: ProductionBatch[] = [
  {
    id: "PB-2201",
    productName: "Dark Chocolate Bars (72%)",
    rawMaterialIds: ["RM-001", "RM-007"],
    inputMaterials: [
      { materialId: "RM-001", materialName: "Raw Cocoa Beans", quantity: 500, unit: "kg" },
      { materialId: "RM-007", materialName: "Cocoa Butter", quantity: 80, unit: "kg" },
    ],
    outputQuantity: 340,
    outputUnit: "kg",
    targetQuantity: 400,
    progressPct: 65,
    startDate: "08 Aug 2026",
    expectedEndDate: "14 Aug 2026",
    status: "In Progress",
    assignedLine: "Line A",
    supervisor: "Ama Mensah",
    finishedGoodId: "FG-001",
  },
  {
    id: "PB-2202",
    productName: "Organic Shea Soap Bars",
    rawMaterialIds: ["RM-002", "RM-003", "RM-006", "RM-008"],
    inputMaterials: [
      { materialId: "RM-003", materialName: "Raw Shea Kernels", quantity: 300, unit: "kg" },
      { materialId: "RM-002", materialName: "Crude Palm Oil", quantity: 200, unit: "litres" },
      { materialId: "RM-006", materialName: "Sodium Hydroxide (Lye)", quantity: 40, unit: "kg" },
      { materialId: "RM-008", materialName: "Fragrance Oils (Lavender)", quantity: 8, unit: "litres" },
    ],
    outputQuantity: 180,
    outputUnit: "kg",
    targetQuantity: 450,
    progressPct: 40,
    startDate: "10 Aug 2026",
    expectedEndDate: "20 Aug 2026",
    status: "In Progress",
    assignedLine: "Line B",
    supervisor: "Kofi Agyeman",
    finishedGoodId: "FG-002",
  },
  {
    id: "PB-2203",
    productName: "Shea Butter (Refined)",
    rawMaterialIds: ["RM-003"],
    inputMaterials: [
      { materialId: "RM-003", materialName: "Raw Shea Kernels", quantity: 1000, unit: "kg" },
    ],
    outputQuantity: 850,
    outputUnit: "kg",
    targetQuantity: 960,
    progressPct: 88,
    startDate: "02 Aug 2026",
    expectedEndDate: "12 Aug 2026",
    status: "Quality Check",
    assignedLine: "Line C",
    supervisor: "Josephine Darko",
    finishedGoodId: "FG-003",
  },
  {
    id: "PB-2204",
    productName: "Honey & Cocoa Candy",
    rawMaterialIds: ["RM-001", "RM-004"],
    inputMaterials: [
      { materialId: "RM-001", materialName: "Raw Cocoa Beans", quantity: 150, unit: "kg" },
      { materialId: "RM-004", materialName: "Refined Cane Sugar", quantity: 300, unit: "kg" },
    ],
    outputQuantity: 0,
    outputUnit: "kg",
    targetQuantity: 280,
    progressPct: 0,
    startDate: "15 Aug 2026",
    expectedEndDate: "25 Aug 2026",
    status: "On Hold",
    assignedLine: "Line A",
    supervisor: "Ama Mensah",
    finishedGoodId: "FG-004",
  },
  {
    id: "PB-2205",
    productName: "Premium Roasted Coffee",
    rawMaterialIds: ["RM-005"],
    inputMaterials: [
      { materialId: "RM-005", materialName: "Arabica Coffee Beans", quantity: 150, unit: "kg" },
    ],
    outputQuantity: 94,
    outputUnit: "kg",
    targetQuantity: 120,
    progressPct: 78,
    startDate: "09 Aug 2026",
    expectedEndDate: "13 Aug 2026",
    status: "In Progress",
    assignedLine: "Line D",
    supervisor: "Emmanuel Tetteh",
    finishedGoodId: "FG-005",
  },
  {
    id: "PB-2206",
    productName: "Cocoa Powder (Unsweetened)",
    rawMaterialIds: ["RM-001", "RM-007"],
    inputMaterials: [
      { materialId: "RM-001", materialName: "Raw Cocoa Beans", quantity: 400, unit: "kg" },
    ],
    outputQuantity: 320,
    outputUnit: "kg",
    targetQuantity: 320,
    progressPct: 100,
    startDate: "01 Aug 2026",
    expectedEndDate: "07 Aug 2026",
    status: "Completed",
    assignedLine: "Line B",
    supervisor: "Kofi Agyeman",
    finishedGoodId: "FG-006",
  },
];

// ── Purchase Orders ───────────────────────────────────────────────────────────

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "PO-5501",
    supplierId: "SUP-01",
    supplierName: "AgroLink Supplies Ltd.",
    materialId: "RM-004",
    materialName: "Refined Cane Sugar",
    quantity: 500,
    unit: "kg",
    unitPrice: 8,
    totalValue: 4000,
    orderDate: "11 Aug 2026",
    expectedDelivery: "16 Aug 2026",
    status: "Approved",
    approvedBy: "Production Manager",
    notes: "Urgent restock — PB-2204 is on hold pending this delivery.",
  },
  {
    id: "PO-5502",
    supplierId: "SUP-03",
    supplierName: "Ghana Palm Processors",
    materialId: "RM-002",
    materialName: "Crude Palm Oil",
    quantity: 800,
    unit: "litres",
    unitPrice: 12,
    totalValue: 9600,
    orderDate: "10 Aug 2026",
    expectedDelivery: "17 Aug 2026",
    status: "Pending",
    notes: "Standard monthly restock for soap line.",
  },
  {
    id: "PO-5503",
    supplierId: "SUP-02",
    supplierName: "West Africa Chemicals Co.",
    materialId: "RM-006",
    materialName: "Sodium Hydroxide (Lye)",
    quantity: 200,
    unit: "kg",
    unitPrice: 22,
    totalValue: 4400,
    orderDate: "09 Aug 2026",
    expectedDelivery: "14 Aug 2026",
    status: "Received",
    approvedBy: "Store Manager",
    notes: "Received in full. Quantity verified by store.",
  },
  {
    id: "PO-5504",
    supplierId: "SUP-02",
    supplierName: "West Africa Chemicals Co.",
    materialId: "RM-008",
    materialName: "Fragrance Oils (Lavender)",
    quantity: 30,
    unit: "litres",
    unitPrice: 85,
    totalValue: 2550,
    orderDate: "08 Aug 2026",
    expectedDelivery: "15 Aug 2026",
    status: "Approved",
    approvedBy: "Production Manager",
    notes: "Restocking for next soap batch cycle.",
  },
  {
    id: "PO-5505",
    supplierId: "SUP-04",
    supplierName: "Northern Shea Cooperative",
    materialId: "RM-003",
    materialName: "Raw Shea Kernels",
    quantity: 2000,
    unit: "kg",
    unitPrice: 18,
    totalValue: 36000,
    orderDate: "07 Aug 2026",
    expectedDelivery: "20 Aug 2026",
    status: "Partial",
    approvedBy: "Procurement Director",
    notes: "1,200 kg received on 11 Aug. Remaining 800 kg expected by 20 Aug.",
  },
  {
    id: "PO-5506",
    supplierId: "SUP-05",
    supplierName: "Tropical Flavours Ltd.",
    materialId: "RM-005",
    materialName: "Arabica Coffee Beans",
    quantity: 300,
    unit: "kg",
    unitPrice: 45,
    totalValue: 13500,
    orderDate: "05 Aug 2026",
    expectedDelivery: "12 Aug 2026",
    status: "Pending",
    notes: "Quarterly top-up for coffee roasting line.",
  },
  {
    id: "PO-5507",
    supplierId: "SUP-01",
    supplierName: "AgroLink Supplies Ltd.",
    materialId: "RM-001",
    materialName: "Raw Cocoa Beans",
    quantity: 1000,
    unit: "kg",
    unitPrice: 28,
    totalValue: 28000,
    orderDate: "03 Aug 2026",
    expectedDelivery: "10 Aug 2026",
    status: "Received",
    approvedBy: "Procurement Director",
    notes: "Received and weighed at 1,005 kg. Variance logged.",
  },
];

// ── Finished Goods ────────────────────────────────────────────────────────────

export const FINISHED_GOODS: FinishedGood[] = [
  {
    id: "FG-001",
    name: "Dark Chocolate Bars (72%)",
    category: "Confectionery",
    batchId: "PB-2201",
    quantityAvailable: 340,
    quantityReserved: 120,
    unit: "kg",
    unitCost: 85,
    sellingPrice: 140,
    warehouseLocation: "Bay A-1",
    manufacturedDate: "08 Aug 2026",
    expiryDate: "08 Feb 2027",
    status: "Available",
  },
  {
    id: "FG-002",
    name: "Organic Shea Soap Bars",
    category: "Personal Care",
    batchId: "PB-2202",
    quantityAvailable: 180,
    quantityReserved: 80,
    unit: "kg",
    unitCost: 42,
    sellingPrice: 75,
    warehouseLocation: "Bay B-3",
    manufacturedDate: "10 Aug 2026",
    expiryDate: "10 Aug 2028",
    status: "Available",
  },
  {
    id: "FG-003",
    name: "Refined Shea Butter",
    category: "Personal Care",
    batchId: "PB-2203",
    quantityAvailable: 850,
    quantityReserved: 400,
    unit: "kg",
    unitCost: 55,
    sellingPrice: 90,
    warehouseLocation: "Bay C-2",
    manufacturedDate: "02 Aug 2026",
    expiryDate: "02 Aug 2028",
    status: "Reserved",
  },
  {
    id: "FG-004",
    name: "Honey & Cocoa Candy",
    category: "Confectionery",
    batchId: "PB-2204",
    quantityAvailable: 0,
    quantityReserved: 0,
    unit: "kg",
    unitCost: 0,
    sellingPrice: 110,
    warehouseLocation: "TBD",
    manufacturedDate: "—",
    expiryDate: "—",
    status: "Low Stock",
  },
  {
    id: "FG-005",
    name: "Premium Roasted Coffee",
    category: "Beverages",
    batchId: "PB-2205",
    quantityAvailable: 94,
    quantityReserved: 50,
    unit: "kg",
    unitCost: 62,
    sellingPrice: 120,
    warehouseLocation: "Bay D-1",
    manufacturedDate: "09 Aug 2026",
    expiryDate: "09 Feb 2027",
    status: "Available",
  },
  {
    id: "FG-006",
    name: "Cocoa Powder (Unsweetened)",
    category: "Confectionery",
    batchId: "PB-2206",
    quantityAvailable: 320,
    quantityReserved: 0,
    unit: "kg",
    unitCost: 48,
    sellingPrice: 85,
    warehouseLocation: "Bay A-2",
    manufacturedDate: "01 Aug 2026",
    expiryDate: "01 Feb 2027",
    status: "Available",
  },
];

// ── Summary ───────────────────────────────────────────────────────────────────

export const MFG_SUMMARY = {
  rawMaterialValue: RAW_MATERIALS.reduce((a, m) => a + m.quantityInStock * m.unitCost, 0),
  lowStockMaterials: RAW_MATERIALS.filter((m) => m.status === "Low Stock" || m.status === "Out of Stock").length,
  openBatches: PRODUCTION_BATCHES.filter((b) => b.status === "In Progress" || b.status === "Scheduled").length,
  pendingPOs: PURCHASE_ORDERS.filter((po) => po.status === "Pending" || po.status === "Approved").length,
  pendingPOValue: PURCHASE_ORDERS.filter((po) => po.status === "Pending" || po.status === "Approved").reduce((a, po) => a + po.totalValue, 0),
  finishedGoodsValue: FINISHED_GOODS.reduce((a, g) => a + g.quantityAvailable * g.unitCost, 0),
};
