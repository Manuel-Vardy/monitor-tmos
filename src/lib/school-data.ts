export type Student = {
  id: string;
  studentId: string;
  schoolId?: string | undefined;
  name: string;
  guardianName: string;
  guardianPhone: string;
  tuitionFee: number;
  paidAmount: number;
  balanceDue: number;
  status: "Paid Full" | "Partial Payment" | "Overdue";
  term: "Term 3, 2026";
};

export type FeeTransaction = {
  id: string;
  receiptNo: string;
  studentId: string;
  schoolId?: string | undefined;
  studentName: string;
  amountPaid: number;
  paymentMethod: "Mobile Money (MTN)" | "Bank Transfer" | "Cash Deposit";
  date: string;
  term: string;
  receivedBy: string;
};

export type StaffPayroll = {
  id: string;
  staffId: string;
  name: string;
  role:
    | "Mathematics Teacher"
    | "Science Teacher"
    | "English Teacher"
    | "Headmaster"
    | "Accountant"
    | "Lab Technician";
  basicSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  status: "Paid" | "Processing";
  bankAccount: string;
};

export type SchoolExpense = {
  id: string;
  voucherNo: string;
  category:
    | "Utilities & Fuel"
    | "Lab Supplies"
    | "Textbooks & Exam Papers"
    | "Facility Maintenance"
    | "Sports Equipment";
  description: string;
  amount: number;
  date: string;
  approvedBy: string;
  status: "Approved" | "Pending Approval";
};

export const SCHOOL_STUDENTS: Student[] = [
  {
    id: "STU-C01",
    studentId: "SCH-2026-C01",
    name: "Abena Boateng",
    guardianName: "Dr. Nana Boateng",
    guardianPhone: "+233 24 100 2201",
    tuitionFee: 800,
    paidAmount: 800,
    balanceDue: 0,
    status: "Paid Full",
    term: "Term 3, 2026",
  },
  {
    id: "STU-C02",
    studentId: "SCH-2026-C02",
    name: "Kofi Asante",
    guardianName: "Mrs. Adwoa Asante",
    guardianPhone: "+233 20 441 5512",
    tuitionFee: 800,
    paidAmount: 500,
    balanceDue: 300,
    status: "Partial Payment",
    term: "Term 3, 2026",
  },
  {
    id: "STU-N101",
    studentId: "SCH-2026-N101",
    name: "Ama Sarkodie",
    guardianName: "Mr. Kweku Sarkodie",
    guardianPhone: "+233 27 303 8890",
    tuitionFee: 900,
    paidAmount: 900,
    balanceDue: 0,
    status: "Paid Full",
    term: "Term 3, 2026",
  },
  {
    id: "STU-N102",
    studentId: "SCH-2026-N102",
    name: "Bright Ofori",
    guardianName: "Mrs. Felicia Ofori",
    guardianPhone: "+233 54 820 1104",
    tuitionFee: 900,
    paidAmount: 0,
    balanceDue: 900,
    status: "Overdue",
    term: "Term 3, 2026",
  },
  {
    id: "STU-N201",
    studentId: "SCH-2026-N201",
    name: "Yaa Appiah",
    guardianName: "Capt. Eric Appiah",
    guardianPhone: "+233 24 552 0034",
    tuitionFee: 950,
    paidAmount: 950,
    balanceDue: 0,
    status: "Paid Full",
    term: "Term 3, 2026",
  },
  {
    id: "STU-K101",
    studentId: "SCH-2026-K101",
    name: "Nana Esi Mensah",
    guardianName: "Dr. Ama Mensah",
    guardianPhone: "+233 20 990 1122",
    tuitionFee: 1000,
    paidAmount: 1000,
    balanceDue: 0,
    status: "Paid Full",
    term: "Term 3, 2026",
  },
  {
    id: "STU-K102",
    studentId: "SCH-2026-K102",
    name: "Patrick Quaye",
    guardianName: "Mrs. Comfort Quaye",
    guardianPhone: "+233 27 400 3312",
    tuitionFee: 1000,
    paidAmount: 600,
    balanceDue: 400,
    status: "Partial Payment",
    term: "Term 3, 2026",
  },
  {
    id: "STU-K201",
    studentId: "SCH-2026-K201",
    name: "Adwoa Tetteh",
    guardianName: "Mr. Joseph Tetteh",
    guardianPhone: "+233 54 711 6600",
    tuitionFee: 1050,
    paidAmount: 1050,
    balanceDue: 0,
    status: "Paid Full",
    term: "Term 3, 2026",
  },
  {
    id: "STU-P101",
    studentId: "SCH-2026-P101",
    name: "Kwame Boakye",
    guardianName: "Mr. Kwame Boakye Sr.",
    guardianPhone: "+233 24 224 4422",
    tuitionFee: 1200,
    paidAmount: 1200,
    balanceDue: 0,
    status: "Paid Full",
    term: "Term 3, 2026",
  },
  {
    id: "STU-P102",
    studentId: "SCH-2026-P102",
    name: "Mercy Asiedu",
    guardianName: "Mrs. Grace Asiedu",
    guardianPhone: "+233 20 772 8834",
    tuitionFee: 1200,
    paidAmount: 800,
    balanceDue: 400,
    status: "Partial Payment",
    term: "Term 3, 2026",
  },
  {
    id: "STU-P201",
    studentId: "SCH-2026-P201",
    name: "Samuel Larbi",
    guardianName: "Mr. Robert Larbi",
    guardianPhone: "+233 27 110 5566",
    tuitionFee: 1250,
    paidAmount: 1250,
    balanceDue: 0,
    status: "Paid Full",
    term: "Term 3, 2026",
  },
  {
    id: "STU-P301",
    studentId: "SCH-2026-P301",
    name: "Efua Nyarko",
    guardianName: "Dr. Frank Nyarko",
    guardianPhone: "+233 24 983 7712",
    tuitionFee: 1300,
    paidAmount: 1300,
    balanceDue: 0,
    status: "Paid Full",
    term: "Term 3, 2026",
  },
  {
    id: "STU-P302",
    studentId: "SCH-2026-P302",
    name: "Michael Acheampong",
    guardianName: "Mrs. Helena Acheampong",
    guardianPhone: "+233 54 900 1123",
    tuitionFee: 1300,
    paidAmount: 0,
    balanceDue: 1300,
    status: "Overdue",
    term: "Term 3, 2026",
  },
  {
    id: "STU-P401",
    studentId: "SCH-2026-P401",
    name: "Abigail Amponsah",
    guardianName: "Mr. Isaac Amponsah",
    guardianPhone: "+233 20 556 2290",
    tuitionFee: 1400,
    paidAmount: 1400,
    balanceDue: 0,
    status: "Paid Full",
    term: "Term 3, 2026",
  },
  {
    id: "STU-P501",
    studentId: "SCH-2026-P501",
    name: "Daniel Frimpong",
    guardianName: "Mrs. Akua Frimpong",
    guardianPhone: "+233 27 330 4450",
    tuitionFee: 1500,
    paidAmount: 900,
    balanceDue: 600,
    status: "Partial Payment",
    term: "Term 3, 2026",
  },
  {
    id: "STU-P502",
    studentId: "SCH-2026-P502",
    name: "Christiana Osei",
    guardianName: "Mr. Anthony Osei",
    guardianPhone: "+233 24 771 3321",
    tuitionFee: 1500,
    paidAmount: 1500,
    balanceDue: 0,
    status: "Paid Full",
    term: "Term 3, 2026",
  },
  {
    id: "STU-P601",
    studentId: "SCH-2026-P601",
    name: "Francis Darko",
    guardianName: "Mrs. Vivian Darko",
    guardianPhone: "+233 20 882 7788",
    tuitionFee: 1600,
    paidAmount: 1600,
    balanceDue: 0,
    status: "Paid Full",
    term: "Term 3, 2026",
  },
  {
    id: "STU-P602",
    studentId: "SCH-2026-P602",
    name: "Priscilla Nkrumah",
    guardianName: "Alhaji Nkrumah",
    guardianPhone: "+233 27 441 9920",
    tuitionFee: 1600,
    paidAmount: 800,
    balanceDue: 800,
    status: "Partial Payment",
    term: "Term 3, 2026",
  },
  {
    id: "STU-J101",
    studentId: "SCH-2026-J101",
    name: "Emmanuel Owusu",
    guardianName: "Grace Owusu",
    guardianPhone: "+233 20 882 1104",
    tuitionFee: 2000,
    paidAmount: 1200,
    balanceDue: 800,
    status: "Partial Payment",
    term: "Term 3, 2026",
  },
  {
    id: "STU-J102",
    studentId: "SCH-2026-J102",
    name: "Patricia Ampofo",
    guardianName: "Mr. Ben Ampofo",
    guardianPhone: "+233 24 660 2200",
    tuitionFee: 2000,
    paidAmount: 2000,
    balanceDue: 0,
    status: "Paid Full",
    term: "Term 3, 2026",
  },
  {
    id: "STU-J201",
    studentId: "SCH-2026-J201",
    name: "Jessica Ansah",
    guardianName: "Captain Ansah",
    guardianPhone: "+233 27 334 0019",
    tuitionFee: 2200,
    paidAmount: 1000,
    balanceDue: 1200,
    status: "Overdue",
    term: "Term 3, 2026",
  },
  {
    id: "STU-J202",
    studentId: "SCH-2026-J202",
    name: "Kweku Asare",
    guardianName: "Mrs. Linda Asare",
    guardianPhone: "+233 54 551 7701",
    tuitionFee: 2200,
    paidAmount: 2200,
    balanceDue: 0,
    status: "Paid Full",
    term: "Term 3, 2026",
  },
  {
    id: "STU-J301",
    studentId: "SCH-2026-J301",
    name: "David Kpakpo",
    guardianName: "Florence Kpakpo",
    guardianPhone: "+233 54 901 8832",
    tuitionFee: 2400,
    paidAmount: 2400,
    balanceDue: 0,
    status: "Paid Full",
    term: "Term 3, 2026",
  },
  {
    id: "STU-J302",
    studentId: "SCH-2026-J302",
    name: "Akosua Frimpong",
    guardianName: "Dr. Samuel Frimpong",
    guardianPhone: "+233 24 551 9021",
    tuitionFee: 2400,
    paidAmount: 2400,
    balanceDue: 0,
    status: "Paid Full",
    term: "Term 3, 2026",
  },
  {
    id: "STU-J303",
    studentId: "SCH-2026-J303",
    name: "Bernard Agyei",
    guardianName: "Mr. Collins Agyei",
    guardianPhone: "+233 27 990 5544",
    tuitionFee: 2400,
    paidAmount: 1000,
    balanceDue: 1400,
    status: "Overdue",
    term: "Term 3, 2026",
  },
];

export const FEE_TRANSACTIONS: FeeTransaction[] = [
  {
    id: "REC-101",
    receiptNo: "RCP-2026-0811",
    studentId: "SCH-2026-J301",
    studentName: "David Kpakpo",
    amountPaid: 2400,
    paymentMethod: "Mobile Money (MTN)",
    date: "11 Aug 2026",
    term: "Term 3, 2026",
    receivedBy: "Bursar Mr. Mensah",
  },
  {
    id: "REC-102",
    receiptNo: "RCP-2026-0810",
    studentId: "SCH-2026-J101",
    studentName: "Emmanuel Owusu",
    amountPaid: 1200,
    paymentMethod: "Bank Transfer",
    date: "10 Aug 2026",
    term: "Term 3, 2026",
    receivedBy: "Bursar Mr. Mensah",
  },
  {
    id: "REC-103",
    receiptNo: "RCP-2026-0809",
    studentId: "SCH-2026-J302",
    studentName: "Akosua Frimpong",
    amountPaid: 2400,
    paymentMethod: "Cash Deposit",
    date: "09 Aug 2026",
    term: "Term 3, 2026",
    receivedBy: "Assistant Bursar Ama",
  },
  {
    id: "REC-104",
    receiptNo: "RCP-2026-0808",
    studentId: "SCH-2026-P601",
    studentName: "Francis Darko",
    amountPaid: 1600,
    paymentMethod: "Mobile Money (MTN)",
    date: "08 Aug 2026",
    term: "Term 3, 2026",
    receivedBy: "Bursar Mr. Mensah",
  },
  {
    id: "REC-105",
    receiptNo: "RCP-2026-0807",
    studentId: "SCH-2026-K101",
    studentName: "Nana Esi Mensah",
    amountPaid: 1000,
    paymentMethod: "Bank Transfer",
    date: "07 Aug 2026",
    term: "Term 3, 2026",
    receivedBy: "Assistant Bursar Ama",
  },
];

export const STAFF_PAYROLL: StaffPayroll[] = [
  {
    id: "PAY-01",
    staffId: "TCH-001",
    name: "Mr. Kwabena Addo",
    role: "Mathematics Teacher",
    basicSalary: 4500,
    allowances: 600,
    deductions: 450,
    netPay: 4650,
    status: "Paid",
    bankAccount: "GCB Bank · ****4819",
  },
  {
    id: "PAY-02",
    staffId: "TCH-004",
    name: "Mrs. Sarah Appiah",
    role: "Science Teacher",
    basicSalary: 4800,
    allowances: 700,
    deductions: 480,
    netPay: 5020,
    status: "Paid",
    bankAccount: "Ecobank Ghana · ****9012",
  },
  {
    id: "PAY-03",
    staffId: "ADM-002",
    name: "Mr. Ebenezer Mensah",
    role: "Accountant",
    basicSalary: 5200,
    allowances: 800,
    deductions: 520,
    netPay: 5480,
    status: "Processing",
    bankAccount: "Stanbic Bank · ****3301",
  },
];

export const SCHOOL_EXPENSES: SchoolExpense[] = [
  {
    id: "EXP-301",
    voucherNo: "VOUCH-901",
    category: "Utilities & Fuel",
    description: "August ECG Electricity Bill & Generator Diesel",
    amount: 3850,
    date: "11 Aug 2026",
    approvedBy: "Headmaster Dr. Quaye",
    status: "Approved",
  },
  {
    id: "EXP-302",
    voucherNo: "VOUCH-902",
    category: "Lab Supplies",
    description: "WASSCE Chemistry & Physics Exam Reagents",
    amount: 2400,
    date: "10 Aug 2026",
    approvedBy: "Headmaster Dr. Quaye",
    status: "Approved",
  },
  {
    id: "EXP-303",
    voucherNo: "VOUCH-903",
    category: "Textbooks & Exam Papers",
    description: "Mock Exam Question Printing & Answer Sheets",
    amount: 1950,
    date: "08 Aug 2026",
    approvedBy: "Bursar Mr. Mensah",
    status: "Approved",
  },
  {
    id: "EXP-304",
    voucherNo: "VOUCH-904",
    category: "Facility Maintenance",
    description: "Block Ceiling Repair & Painting",
    amount: 2800,
    date: "06 Aug 2026",
    approvedBy: "Headmaster Dr. Quaye",
    status: "Pending Approval",
  },
];

export const SCHOOL_SUMMARY = {
  totalStudentsCount: SCHOOL_STUDENTS.length,
  totalFeesCollected: SCHOOL_STUDENTS.reduce((acc, s) => acc + s.paidAmount, 0),
  totalOutstandingFees: SCHOOL_STUDENTS.reduce((acc, s) => acc + s.balanceDue, 0),
  totalMonthlyPayroll: STAFF_PAYROLL.reduce((acc, p) => acc + p.netPay, 0),
  totalMonthlyExpenses: SCHOOL_EXPENSES.reduce((acc, e) => acc + e.amount, 0),
};
