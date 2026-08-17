export type RestaurantTable = {
  id: string;
  number: number;
  section: "Main Dining" | "Terrace" | "VIP Lounge" | "Bar Area";
  seats: number;
  status: "available" | "occupied" | "reserved" | "billing";
  currentOrder?: {
    orderId: string;
    server: string;
    guests: number;
    itemsCount: number;
    total: number;
    timeOpened: string;
    orderedDishes: { name: string; qty: number; price: number }[];
  };
};

export type KitchenOrder = {
  id: string;
  orderId: string;
  tableNumber: number;
  section: "Main Dining" | "Terrace" | "VIP Lounge" | "Bar Area";
  server: string;
  status: "pending" | "preparing" | "ready" | "served";
  items: {
    name: string;
    quantity: number;
    notes?: string;
    station: "Grill" | "Fryer" | "Cold Station" | "Drinks" | "Pastry";
  }[];
  timePlaced: string;
  prepTimeMinutes: number;
};

export type MenuItem = {
  id: string;
  name: string;
  category: "Starters" | "Mains" | "Grill" | "Seafood" | "Drinks" | "Desserts";
  price: number;
  cost: number;
  available: boolean;
  preparationStation: "Grill" | "Fryer" | "Cold Station" | "Drinks" | "Pastry";
  ingredients: { name: string; qty: string }[];
  dailySalesCount: number;
};

export type WastageLog = {
  id: string;
  date: string;
  item: string;
  category: string;
  quantity: string;
  costValue: number;
  reason: "Expired Ingredient" | "Spill / Drop" | "Overcooked" | "Customer Return" | "Prep Trimmings";
  reportedBy: string;
  branch: string;
};

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "MNU-001",
    name: "Jollof Rice with Grilled Tilapia",
    category: "Mains",
    price: 95,
    cost: 32,
    available: true,
    preparationStation: "Grill",
    ingredients: [
      { name: "Jollof Rice Base", qty: "300g" },
      { name: "Fresh Tilapia", qty: "1 whole" },
      { name: "Shito Pepper", qty: "50g" },
    ],
    dailySalesCount: 42,
  },
  {
    id: "MNU-002",
    name: "Charcoal Grilled Goat Chops",
    category: "Grill",
    price: 130,
    cost: 45,
    available: true,
    preparationStation: "Grill",
    ingredients: [
      { name: "Goat Meat Ribs", qty: "400g" },
      { name: "Suya Spice Blend", qty: "30g" },
    ],
    dailySalesCount: 28,
  },
  {
    id: "MNU-003",
    name: "Seafood Platter Deluxe",
    category: "Seafood",
    price: 280,
    cost: 110,
    available: true,
    preparationStation: "Grill",
    ingredients: [
      { name: "Prawns", qty: "6 pcs" },
      { name: "Calamari Rings", qty: "200g" },
      { name: "Lobster Tail", qty: "1 pc" },
    ],
    dailySalesCount: 14,
  },
  {
    id: "MNU-004",
    name: "Fried Plantain (Kelewele)",
    category: "Starters",
    price: 35,
    cost: 10,
    available: true,
    preparationStation: "Fryer",
    ingredients: [
      { name: "Ripe Plantain", qty: "2 fingers" },
      { name: "Ginger Pepper Mix", qty: "20g" },
    ],
    dailySalesCount: 65,
  },
  {
    id: "MNU-005",
    name: "Banku with Tilapia Soup",
    category: "Mains",
    price: 90,
    cost: 28,
    available: true,
    preparationStation: "Grill",
    ingredients: [
      { name: "Banku Balls", qty: "2 pcs" },
      { name: "Fresh Tilapia Fish", qty: "1 pc" },
    ],
    dailySalesCount: 39,
  },
  {
    id: "MNU-006",
    name: "Fresh Sobolo Drink",
    category: "Drinks",
    price: 25,
    cost: 6,
    available: true,
    preparationStation: "Drinks",
    ingredients: [
      { name: "Hibiscus Leaves", qty: "50g" },
      { name: "Ginger & Pineapple Syrup", qty: "30ml" },
    ],
    dailySalesCount: 88,
  },
  {
    id: "MNU-007",
    name: "Yam Chips with Shito",
    category: "Starters",
    price: 40,
    cost: 12,
    available: true,
    preparationStation: "Fryer",
    ingredients: [
      { name: "Pona Yam Cubes", qty: "300g" },
      { name: "Black Pepper Shito", qty: "40g" },
    ],
    dailySalesCount: 52,
  },
  {
    id: "MNU-008",
    name: "Suya Beef Skewers",
    category: "Starters",
    price: 45,
    cost: 15,
    available: true,
    preparationStation: "Grill",
    ingredients: [
      { name: "Beef Fillet Cubes", qty: "250g" },
      { name: "Suya Kankankan Spice", qty: "25g" },
    ],
    dailySalesCount: 74,
  },
];

export const RESTAURANT_TABLES: RestaurantTable[] = [
  {
    id: "TBL-01",
    number: 1,
    section: "Main Dining",
    seats: 4,
    status: "occupied",
    currentOrder: {
      orderId: "ORD-701",
      server: "Ama K.",
      guests: 3,
      itemsCount: 5,
      total: 345, // 2x Jollof (190) + 1x Kelewele (35) + 2x Sobolo (50) + 1x Yam Chips (40) = 315
      timeOpened: "12:15 PM",
      orderedDishes: [
        { name: "Jollof Rice with Grilled Tilapia", qty: 2, price: 95 },
        { name: "Fried Plantain (Kelewele)", qty: 1, price: 35 },
        { name: "Fresh Sobolo Drink", qty: 2, price: 25 },
        { name: "Yam Chips with Shito", qty: 1, price: 40 },
      ],
    },
  },
  {
    id: "TBL-02",
    number: 2,
    section: "Main Dining",
    seats: 2,
    status: "billing",
    currentOrder: {
      orderId: "ORD-698",
      server: "Kofi B.",
      guests: 2,
      itemsCount: 3,
      total: 215,
      timeOpened: "11:45 AM",
      orderedDishes: [
        { name: "Charcoal Grilled Goat Chops", qty: 1, price: 130 },
        { name: "Suya Beef Skewers", qty: 1, price: 45 },
        { name: "Yam Chips with Shito", qty: 1, price: 40 },
      ],
    },
  },
  {
    id: "TBL-03",
    number: 3,
    section: "Main Dining",
    seats: 6,
    status: "available",
  },
  {
    id: "TBL-04",
    number: 4,
    section: "Main Dining",
    seats: 4,
    status: "reserved",
  },
  {
    id: "TBL-05",
    number: 5,
    section: "Terrace",
    seats: 4,
    status: "occupied",
    currentOrder: {
      orderId: "ORD-705",
      server: "Kwame M.",
      guests: 4,
      itemsCount: 8,
      total: 580,
      timeOpened: "12:30 PM",
      orderedDishes: [
        { name: "Charcoal Grilled Goat Chops", qty: 2, price: 130 },
        { name: "Yam Chips with Shito", qty: 2, price: 40 },
        { name: "Suya Beef Skewers", qty: 4, price: 45 },
      ],
    },
  },
  {
    id: "TBL-06",
    number: 6,
    section: "Terrace",
    seats: 2,
    status: "available",
  },
  {
    id: "TBL-07",
    number: 7,
    section: "VIP Lounge",
    seats: 8,
    status: "occupied",
    currentOrder: {
      orderId: "ORD-700",
      server: "Abena S.",
      guests: 6,
      itemsCount: 12,
      total: 1250,
      timeOpened: "12:00 PM",
      orderedDishes: [
        { name: "Seafood Platter Deluxe", qty: 2, price: 280 },
        { name: "Banku with Tilapia Soup", qty: 3, price: 90 },
        { name: "Charcoal Grilled Goat Chops", qty: 2, price: 130 },
        { name: "Fresh Sobolo Drink", qty: 6, price: 25 },
      ],
    },
  },
  {
    id: "TBL-08",
    number: 8,
    section: "VIP Lounge",
    seats: 10,
    status: "reserved",
  },
  {
    id: "TBL-09",
    number: 9,
    section: "Bar Area",
    seats: 2,
    status: "occupied",
    currentOrder: {
      orderId: "ORD-709",
      server: "Ama K.",
      guests: 1,
      itemsCount: 2,
      total: 115,
      timeOpened: "12:40 PM",
      orderedDishes: [
        { name: "Suya Beef Skewers", qty: 2, price: 45 },
        { name: "Fresh Sobolo Drink", qty: 1, price: 25 },
      ],
    },
  },
  {
    id: "TBL-10",
    number: 10,
    section: "Bar Area",
    seats: 2,
    status: "available",
  },
];

export const KITCHEN_ORDERS: KitchenOrder[] = [
  {
    id: "K-101",
    orderId: "ORD-701",
    tableNumber: 1,
    section: "Main Dining",
    server: "Ama K.",
    status: "preparing",
    timePlaced: "12:20 PM",
    prepTimeMinutes: 14,
    items: [
      { name: "Jollof Rice with Grilled Tilapia", quantity: 2, notes: "Medium spicy", station: "Grill" },
      { name: "Fried Plantain (Kelewele)", quantity: 1, station: "Fryer" },
      { name: "Fresh Sobolo Drink", quantity: 2, station: "Drinks" },
      { name: "Yam Chips with Shito", quantity: 1, station: "Fryer" },
    ],
  },
  {
    id: "K-102",
    orderId: "ORD-705",
    tableNumber: 5,
    section: "Terrace",
    server: "Kwame M.",
    status: "pending",
    timePlaced: "12:32 PM",
    prepTimeMinutes: 5,
    items: [
      { name: "Charcoal Grilled Goat Chops", quantity: 2, notes: "Extra pepper sauce", station: "Grill" },
      { name: "Yam Chips with Shito", quantity: 2, station: "Fryer" },
      { name: "Suya Beef Skewers", quantity: 4, notes: "Spicy peanut rub", station: "Grill" },
    ],
  },
  {
    id: "K-103",
    orderId: "ORD-700",
    tableNumber: 7,
    section: "VIP Lounge",
    server: "Abena S.",
    status: "preparing",
    timePlaced: "12:10 PM",
    prepTimeMinutes: 22,
    items: [
      { name: "Seafood Platter Deluxe", quantity: 2, notes: "No lobster allergy check", station: "Grill" },
      { name: "Banku with Tilapia Soup", quantity: 3, station: "Grill" },
      { name: "Fresh Sobolo Drink", quantity: 6, station: "Drinks" },
    ],
  },
  {
    id: "K-104",
    orderId: "ORD-709",
    tableNumber: 9,
    section: "Bar Area",
    server: "Ama K.",
    status: "ready",
    timePlaced: "12:41 PM",
    prepTimeMinutes: 8,
    items: [
      { name: "Suya Beef Skewers", quantity: 2, notes: "Well done", station: "Grill" },
      { name: "Fresh Sobolo Drink", quantity: 1, station: "Drinks" },
    ],
  },
];

export const WASTAGE_LOGS: WastageLog[] = [
  {
    id: "WST-201",
    date: "11 Aug 2026",
    item: "Fresh Tilapia (Raw Fish)",
    category: "Seafood & Fish",
    quantity: "3.5 kg",
    costValue: 185,
    reason: "Expired Ingredient",
    reportedBy: "Chef Mensah",
    branch: "Osu Flagship",
  },
  {
    id: "WST-202",
    date: "11 Aug 2026",
    item: "Jollof Rice Base Batch #4",
    category: "Prepared Foods",
    quantity: "2.0 kg",
    costValue: 65,
    reason: "Overcooked",
    reportedBy: "Kofi B.",
    branch: "Osu Flagship",
  },
  {
    id: "WST-203",
    date: "10 Aug 2026",
    item: "Ginger & Pineapple Syrup (Sobolo)",
    category: "Beverage Prep",
    quantity: "5 Litres",
    costValue: 40,
    reason: "Spill / Drop",
    reportedBy: "Ama K.",
    branch: "East Legon Branch",
  },
  {
    id: "WST-204",
    date: "09 Aug 2026",
    item: "Ripe Plantain Fingers (Kelewele)",
    category: "Produce",
    quantity: "12 pcs",
    costValue: 35,
    reason: "Prep Trimmings",
    reportedBy: "Chef Mensah",
    branch: "Osu Flagship",
  },
];

export const RESTAURANT_SUMMARY = {
  totalOccupiedTables: RESTAURANT_TABLES.filter((t) => t.status === "occupied").length,
  totalAvailableTables: RESTAURANT_TABLES.filter((t) => t.status === "available").length,
  activeOrderRevenue: RESTAURANT_TABLES.reduce((acc, t) => acc + (t.currentOrder?.total || 0), 0),
  activeKitchenTickets: KITCHEN_ORDERS.filter((k) => k.status !== "served").length,
  todayWastageCost: WASTAGE_LOGS.reduce((acc, w) => acc + w.costValue, 0),
};
