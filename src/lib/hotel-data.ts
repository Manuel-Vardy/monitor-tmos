export type HotelRoom = {
  id: string;
  roomNumber: string;
  roomType: "Executive Suite" | "Deluxe King" | "Standard Twin" | "Presidential Suite" | "Family Suite";
  floor: "1st Floor" | "2nd Floor" | "3rd Floor" | "Penthouse";
  ratePerNight: number;
  status: "Occupied" | "Vacant Clean" | "Dirty / Cleaning" | "Maintenance";
  currentGuest?: string;
  checkOutDate?: string;
  bookingRef?: string;
  housekeepingStatus?: "In Progress" | "Pending" | "Inspected & Passed";
};

export type Reservation = {
  id: string;
  bookingRef: string;
  guestName: string;
  guestPhone: string;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  totalAmount: number;
  depositPaid: number;
  balanceDue: number;
  status: "Checked In" | "Confirmed" | "Checked Out" | "Cancelled";
  channel: "Direct Walk-in" | "Booking.com" | "Expedia" | "Corporate Contract";
  folioNo?: string;
};

export type HousekeepingTask = {
  id: string;
  roomNumber: string;
  roomType: string;
  assignedStaff: string;
  cleaningType: "Turnover Clean" | "Stayover Refresh" | "Deep Sanitize";
  priority: "High" | "Normal" | "Low";
  status: "In Progress" | "Pending" | "Inspected & Passed";
  timeLogged: string;
  currentGuest?: string;
};

export type HotelPayment = {
  id: string;
  folioNo: string;
  bookingRef: string;
  guestName: string;
  roomNumber: string;
  amountPaid: number;
  paymentMethod: "Visa / Mastercard" | "Mobile Money (MTN)" | "Cash" | "Corporate Bill" | "Wire Transfer";
  date: string;
  itemDescription: "Room Accommodation & Breakfast" | "Room Service & Laundry" | "Conference Hall Rental";
  receivedBy: string;
};

export const HOTEL_ROOMS: HotelRoom[] = [
  {
    id: "RM-101",
    roomNumber: "Room 101",
    roomType: "Deluxe King",
    floor: "1st Floor",
    ratePerNight: 850,
    status: "Occupied",
    currentGuest: "Dr. Kofi Annan Jr.",
    checkOutDate: "13 Aug 2026",
    bookingRef: "HTL-2026-8801",
    housekeepingStatus: "Pending",
  },
  {
    id: "RM-102",
    roomNumber: "Room 102",
    roomType: "Standard Twin",
    floor: "1st Floor",
    ratePerNight: 650,
    status: "Vacant Clean",
    housekeepingStatus: "Inspected & Passed",
  },
  {
    id: "RM-201",
    roomNumber: "Room 201",
    roomType: "Executive Suite",
    floor: "2nd Floor",
    ratePerNight: 1400,
    status: "Occupied",
    currentGuest: "Sarah Jenkins (Chevron Corp)",
    checkOutDate: "15 Aug 2026",
    bookingRef: "HTL-2026-8802",
    housekeepingStatus: "Inspected & Passed",
  },
  {
    id: "RM-202",
    roomNumber: "Room 202",
    roomType: "Deluxe King",
    floor: "2nd Floor",
    ratePerNight: 850,
    status: "Dirty / Cleaning",
    housekeepingStatus: "In Progress",
  },
  {
    id: "RM-301",
    roomNumber: "Room 301",
    roomType: "Family Suite",
    floor: "3rd Floor",
    ratePerNight: 1800,
    status: "Vacant Clean",
    bookingRef: "HTL-2026-8804",
    housekeepingStatus: "Inspected & Passed",
  },
  {
    id: "RM-401",
    roomNumber: "Penthouse 401",
    roomType: "Presidential Suite",
    floor: "Penthouse",
    ratePerNight: 3500,
    status: "Occupied",
    currentGuest: "Ambassador Mensah",
    checkOutDate: "18 Aug 2026",
    bookingRef: "HTL-2026-8803",
    housekeepingStatus: "Inspected & Passed",
  },
];

export const HOTEL_RESERVATIONS: Reservation[] = [
  {
    id: "RES-001",
    bookingRef: "HTL-2026-8801",
    guestName: "Dr. Kofi Annan Jr.",
    guestPhone: "+233 24 990 1123",
    roomNumber: "Room 101",
    roomType: "Deluxe King",
    checkInDate: "10 Aug 2026",
    checkOutDate: "13 Aug 2026",
    nights: 3,
    totalAmount: 2550,
    depositPaid: 2550,
    balanceDue: 0,
    status: "Checked In",
    channel: "Booking.com",
    folioNo: "FOLIO-9901",
  },
  {
    id: "RES-002",
    bookingRef: "HTL-2026-8802",
    guestName: "Sarah Jenkins (Chevron Corp)",
    guestPhone: "+1 415 800 9920",
    roomNumber: "Room 201",
    roomType: "Executive Suite",
    checkInDate: "11 Aug 2026",
    checkOutDate: "15 Aug 2026",
    nights: 4,
    totalAmount: 5600,
    depositPaid: 2800,
    balanceDue: 2800,
    status: "Checked In",
    channel: "Corporate Contract",
    folioNo: "FOLIO-9902",
  },
  {
    id: "RES-003",
    bookingRef: "HTL-2026-8803",
    guestName: "Ambassador Mensah",
    guestPhone: "+233 20 112 4499",
    roomNumber: "Penthouse 401",
    roomType: "Presidential Suite",
    checkInDate: "11 Aug 2026",
    checkOutDate: "18 Aug 2026",
    nights: 7,
    totalAmount: 24500,
    depositPaid: 24500,
    balanceDue: 0,
    status: "Checked In",
    channel: "Direct Walk-in",
    folioNo: "FOLIO-9903",
  },
  {
    id: "RES-004",
    bookingRef: "HTL-2026-8804",
    guestName: "Emmanuel & Grace Boateng",
    guestPhone: "+233 27 551 0022",
    roomNumber: "Room 301",
    roomType: "Family Suite",
    checkInDate: "14 Aug 2026",
    checkOutDate: "16 Aug 2026",
    nights: 2,
    totalAmount: 3600,
    depositPaid: 1000,
    balanceDue: 2600,
    status: "Confirmed",
    channel: "Expedia",
    folioNo: "FOLIO-9905",
  },
  {
    id: "RES-005",
    bookingRef: "HTL-2026-8798",
    guestName: "Mr. Emmanuel Darko",
    guestPhone: "+233 24 331 4455",
    roomNumber: "Room 202",
    roomType: "Deluxe King",
    checkInDate: "08 Aug 2026",
    checkOutDate: "11 Aug 2026",
    nights: 3,
    totalAmount: 2550,
    depositPaid: 2550,
    balanceDue: 0,
    status: "Checked Out",
    channel: "Direct Walk-in",
    folioNo: "FOLIO-9904",
  },
];

export const HOUSEKEEPING_TASKS: HousekeepingTask[] = [
  {
    id: "HK-01",
    roomNumber: "Room 202",
    roomType: "Deluxe King",
    assignedStaff: "Abena Osei",
    cleaningType: "Turnover Clean",
    priority: "High",
    status: "In Progress",
    timeLogged: "11:15 AM",
    currentGuest: "Turnover (Post Check-out)",
  },
  {
    id: "HK-02",
    roomNumber: "Room 101",
    roomType: "Deluxe King",
    assignedStaff: "Grace Mensah",
    cleaningType: "Stayover Refresh",
    priority: "Normal",
    status: "Pending",
    timeLogged: "10:30 AM",
    currentGuest: "Dr. Kofi Annan Jr.",
  },
  {
    id: "HK-03",
    roomNumber: "Room 102",
    roomType: "Standard Twin",
    assignedStaff: "Abena Osei",
    cleaningType: "Deep Sanitize",
    priority: "Low",
    status: "Inspected & Passed",
    timeLogged: "09:00 AM",
  },
  {
    id: "HK-04",
    roomNumber: "Room 301",
    roomType: "Family Suite",
    assignedStaff: "Grace Mensah",
    cleaningType: "Stayover Refresh",
    priority: "Normal",
    status: "Inspected & Passed",
    timeLogged: "08:30 AM",
    currentGuest: "Pre-arrival for Boateng Family",
  },
];

export const HOTEL_PAYMENTS: HotelPayment[] = [
  {
    id: "PAY-801",
    folioNo: "FOLIO-9901",
    bookingRef: "HTL-2026-8801",
    guestName: "Dr. Kofi Annan Jr.",
    roomNumber: "Room 101",
    amountPaid: 2550,
    paymentMethod: "Visa / Mastercard",
    date: "10 Aug 2026",
    itemDescription: "Room Accommodation & Breakfast",
    receivedBy: "Front Desk Janet",
  },
  {
    id: "PAY-802",
    folioNo: "FOLIO-9902",
    bookingRef: "HTL-2026-8802",
    guestName: "Sarah Jenkins (Chevron Corp)",
    roomNumber: "Room 201",
    amountPaid: 2800,
    paymentMethod: "Corporate Bill",
    date: "11 Aug 2026",
    itemDescription: "Room Accommodation & Breakfast",
    receivedBy: "Front Desk Alex",
  },
  {
    id: "PAY-803",
    folioNo: "FOLIO-9903",
    bookingRef: "HTL-2026-8803",
    guestName: "Ambassador Mensah",
    roomNumber: "Penthouse 401",
    amountPaid: 24500,
    paymentMethod: "Wire Transfer",
    date: "11 Aug 2026",
    itemDescription: "Room Accommodation & Breakfast",
    receivedBy: "Front Desk Manager Richard",
  },
  {
    id: "PAY-804",
    folioNo: "FOLIO-9904",
    bookingRef: "HTL-2026-8798",
    guestName: "Mr. Emmanuel Darko",
    roomNumber: "Room 202",
    amountPaid: 1200,
    paymentMethod: "Cash",
    date: "11 Aug 2026",
    itemDescription: "Room Service & Laundry",
    receivedBy: "Front Desk Janet",
  },
  {
    id: "PAY-805",
    folioNo: "FOLIO-9905",
    bookingRef: "HTL-2026-8804",
    guestName: "Emmanuel & Grace Boateng",
    roomNumber: "Room 301",
    amountPaid: 1000,
    paymentMethod: "Mobile Money (MTN)",
    date: "12 Aug 2026",
    itemDescription: "Room Accommodation & Breakfast",
    receivedBy: "Front Desk Alex",
  },
  {
    id: "PAY-806",
    folioNo: "FOLIO-9906",
    bookingRef: "HTL-2026-8802",
    guestName: "Sarah Jenkins (Chevron Corp)",
    roomNumber: "Room 201",
    amountPaid: 3400,
    paymentMethod: "Visa / Mastercard",
    date: "12 Aug 2026",
    itemDescription: "Conference Hall Rental",
    receivedBy: "Front Desk Manager Richard",
  },
];

export const HOTEL_SUMMARY = {
  totalRooms: HOTEL_ROOMS.length,
  occupiedRooms: HOTEL_ROOMS.filter((r) => r.status === "Occupied").length,
  occupancyRate: Math.round((HOTEL_ROOMS.filter((r) => r.status === "Occupied").length / HOTEL_ROOMS.length) * 100),
  totalRevenueToday: HOTEL_PAYMENTS.reduce((a, p) => a + p.amountPaid, 0),
  pendingHousekeeping: HOUSEKEEPING_TASKS.filter((h) => h.status !== "Inspected & Passed").length,
  totalActiveReservations: HOTEL_RESERVATIONS.filter((r) => r.status === "Checked In" || r.status === "Confirmed").length,
};

// ── Hotel Expenses ─────────────────────────────────────────────────────────────

export type HotelExpense = {
  id: string;
  voucherNo: string;
  category: "Utilities & Fuel" | "Housekeeping Supplies" | "F&B Procurement" | "Maintenance & Repairs" | "Staff & Wages" | "Marketing & Commissions";
  description: string;
  amount: number;
  date: string;
  approvedBy: string;
  status: "Approved" | "Pending Approval";
  relatedRoom?: string;
};

export const HOTEL_EXPENSES: HotelExpense[] = [
  {
    id: "EXP-H01",
    voucherNo: "VCH-2026-801",
    category: "Utilities & Fuel",
    description: "DISCO electricity bill — main hotel block & Penthouse floor air conditioning August 2026",
    amount: 4200,
    date: "10 Aug 2026",
    approvedBy: "GM Kwabena Asare",
    status: "Approved",
  },
  {
    id: "EXP-H02",
    voucherNo: "VCH-2026-802",
    category: "Housekeeping Supplies",
    description: "Laundry detergents, linen softeners, amenity packs (soaps, shampoo, toiletries) for Rooms 101–401",
    amount: 1850,
    date: "10 Aug 2026",
    approvedBy: "Housekeeping Supervisor Abena",
    status: "Approved",
    relatedRoom: "All Floors",
  },
  {
    id: "EXP-H03",
    voucherNo: "VCH-2026-803",
    category: "F&B Procurement",
    description: "Breakfast buffet stock: fresh produce, eggs, bread, juices — Trite Merchant Hotel Restaurant Aug 11",
    amount: 3100,
    date: "11 Aug 2026",
    approvedBy: "F&B Manager Ama Kyei",
    status: "Approved",
  },
  {
    id: "EXP-H04",
    voucherNo: "VCH-2026-804",
    category: "Maintenance & Repairs",
    description: "Air conditioning compressor repair — Room 202 (post-checkout Darko); HVAC maintenance Penthouse 401",
    amount: 2750,
    date: "11 Aug 2026",
    approvedBy: "GM Kwabena Asare",
    status: "Approved",
    relatedRoom: "Room 202 / Penthouse 401",
  },
  {
    id: "EXP-H05",
    voucherNo: "VCH-2026-805",
    category: "Marketing & Commissions",
    description: "Booking.com 15% commission on HTL-2026-8801 (Dr. Kofi Annan Jr.) and Expedia 12% on HTL-2026-8804 (Boateng Family)",
    amount: 816,
    date: "11 Aug 2026",
    approvedBy: "Finance Officer Janet",
    status: "Approved",
  },
  {
    id: "EXP-H06",
    voucherNo: "VCH-2026-806",
    category: "Staff & Wages",
    description: "August fortnightly wage disbursement — Front Desk (Janet, Alex, Richard), Housekeeping (Abena Osei, Grace Mensah)",
    amount: 9400,
    date: "12 Aug 2026",
    approvedBy: "GM Kwabena Asare",
    status: "Approved",
  },
  {
    id: "EXP-H07",
    voucherNo: "VCH-2026-807",
    category: "Housekeeping Supplies",
    description: "Replacement bed linen set (King size) for Room 101 & Presidential Suite 401 — guest stayover upgrade",
    amount: 980,
    date: "12 Aug 2026",
    approvedBy: "Housekeeping Supervisor Abena",
    status: "Pending Approval",
    relatedRoom: "Room 101 / Penthouse 401",
  },
  {
    id: "EXP-H08",
    voucherNo: "VCH-2026-808",
    category: "Maintenance & Repairs",
    description: "Pool pump motor overhaul and external garden lighting repair — guest complaint from Sarah Jenkins (Room 201)",
    amount: 1600,
    date: "13 Aug 2026",
    approvedBy: "Engineering Supervisor Kofi",
    status: "Pending Approval",
    relatedRoom: "Room 201",
  },
];

export const HOTEL_EXPENSE_SUMMARY = {
  totalExpenses: HOTEL_EXPENSES.reduce((a, e) => a + e.amount, 0),
  approved: HOTEL_EXPENSES.filter((e) => e.status === "Approved"),
  pending: HOTEL_EXPENSES.filter((e) => e.status === "Pending Approval"),
};

// ── Hotel Revenue Trend (last 8 days) ──────────────────────────────────────────
export const HOTEL_REVENUE_TREND = [
  { day: "08 Aug", revenue: 5200, expenses: 3100, occupancy: 60 },
  { day: "09 Aug", revenue: 6800, expenses: 2900, occupancy: 67 },
  { day: "10 Aug", revenue: 7400, expenses: 4200, occupancy: 67 },
  { day: "11 Aug", revenue: 28100, expenses: 6900, occupancy: 83 },
  { day: "12 Aug", revenue: 6200, expenses: 4380, occupancy: 83 },
  { day: "13 Aug", revenue: 4800, expenses: 1600, occupancy: 67 },
  { day: "14 Aug", revenue: 5500, expenses: 1850, occupancy: 67 },
  { day: "15 Aug", revenue: 35450, expenses: 9400, occupancy: 83 },
];

// ── Payment Method Breakdown (from HOTEL_PAYMENTS) ─────────────────────────────
export const HOTEL_PAYMENT_MIX = [
  {
    method: "Visa / Mastercard",
    amount: HOTEL_PAYMENTS.filter((p) => p.paymentMethod === "Visa / Mastercard").reduce((a, p) => a + p.amountPaid, 0),
    share: 0,
    settlement: "T+1 Banking",
  },
  {
    method: "Wire Transfer",
    amount: HOTEL_PAYMENTS.filter((p) => p.paymentMethod === "Wire Transfer").reduce((a, p) => a + p.amountPaid, 0),
    share: 0,
    settlement: "T+1 Banking",
  },
  {
    method: "Corporate Bill",
    amount: HOTEL_PAYMENTS.filter((p) => p.paymentMethod === "Corporate Bill").reduce((a, p) => a + p.amountPaid, 0),
    share: 0,
    settlement: "Monthly Invoice",
  },
  {
    method: "Mobile Money (MTN)",
    amount: HOTEL_PAYMENTS.filter((p) => p.paymentMethod === "Mobile Money (MTN)").reduce((a, p) => a + p.amountPaid, 0),
    share: 0,
    settlement: "Instant (T+0)",
  },
  {
    method: "Cash",
    amount: HOTEL_PAYMENTS.filter((p) => p.paymentMethod === "Cash").reduce((a, p) => a + p.amountPaid, 0),
    share: 0,
    settlement: "Immediate",
  },
].map((m) => ({
  ...m,
  share: Math.round((m.amount / HOTEL_PAYMENTS.reduce((a, p) => a + p.amountPaid, 0)) * 100),
}));

