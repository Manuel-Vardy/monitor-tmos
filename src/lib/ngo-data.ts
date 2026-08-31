export type ChurchPaymentType = {
  id: string;
  name: string;
  category: "Tithe" | "Offering" | "Welfare" | "Project" | "Dues" | "Special" | "Other";
  defaultAmount: number;
  frequency: "Weekly" | "Monthly" | "Quarterly" | "Annual" | "One-Time" | "None";
  isProject: boolean;
  projectName?: string | undefined;
  description?: string | undefined;
};

export const DEFAULT_CHURCH_PAYMENT_TYPES: ChurchPaymentType[] = [
  {
    id: "cpay-tithe",
    name: "Tithe",
    category: "Tithe",
    defaultAmount: 600,
    frequency: "Monthly",
    isProject: false,
    description: "Ten percent covenant tithe offering for ministry advancement",
  },
  {
    id: "cpay-offering",
    name: "Sunday General Offering",
    category: "Offering",
    defaultAmount: 150,
    frequency: "Weekly",
    isProject: false,
    description: "General Sunday service and midweek fellowship offerings",
  },
  {
    id: "cpay-welfare",
    name: "Welfare",
    category: "Welfare",
    defaultAmount: 50,
    frequency: "Monthly",
    isProject: false,
    description: "Member bereavement, emergency support, and hospital visitation fund",
  },
  {
    id: "cpay-bldg",
    name: "Cathedral Building Project",
    category: "Project",
    defaultAmount: 1000,
    frequency: "Annual",
    isProject: true,
    projectName: "Cathedral Building Project",
    description: "New multi-purpose church auditorium and youth fellowship complex",
  },
  {
    id: "cpay-harvest",
    name: "Annual Harvest & Thanksgiving",
    category: "Special",
    defaultAmount: 500,
    frequency: "Annual",
    isProject: false,
    description: "Annual church anniversary thanksgiving and harvest sacrifice",
  },
  {
    id: "cpay-bus",
    name: "Evangelism Bus Project",
    category: "Project",
    defaultAmount: 350,
    frequency: "One-Time",
    isProject: true,
    projectName: "Evangelism Bus Acquisition",
    description: "Purchase of a 32-seater coaster bus for church outreach and community evangelism",
  },
];

export type NgoMember = {
  id: string;
  memberId: string;
  name: string;
  role: "Pastor / Minister" | "Elder / Deacon" | "Board Member" | "Welfare Committee" | "Youth Leader" | "Member";
  email: string;
  phone: string;
  assignedPaymentTypes?: string[] | undefined;
  annualDues: number;
  duesPaid: number;
  duesStatus: "Paid" | "Outstanding";
  monthlyTithe?: number | undefined;
  welfarePaid?: number | undefined;
  projectContributions?: number | undefined;
  totalPaid: number;
  balanceDue: number;
  joinedDate: string;
};

export type ChurchPaymentRecord = {
  id: string;
  receiptNo: string;
  memberId: string;
  memberName: string;
  paymentType: string;
  category: "Tithe" | "Offering" | "Welfare" | "Project" | "Dues" | "Special" | "Other";
  isProject: boolean;
  projectName?: string | undefined;
  amount: number;
  paymentMethod: "Mobile Money" | "Bank Transfer" | "Cash Deposit";
  date: string;
  receivedBy?: string | undefined;
  status: "Confirmed";
};

export type NgoProject = {
  id: string;
  code: string;
  title: string;
  location: string;
  budgetAllocated: number;
  fundsSpent: number;
  leadCoordinator: string;
  startDate: string;
  targetEndDate: string;
  status: "Active Implementation" | "Planning Phase" | "Completed";
  beneficiariesCount: number;
};

export type BudgetApproval = {
  id: string;
  requestNo: string;
  projectCode: string;
  projectName: string;
  category: "Field Operations" | "Medical Supplies" | "Educational Materials" | "Community Training" | "Logistics";
  amountRequested: number;
  requestedBy: string;
  approvedBy: string;
  date: string;
  status: "Approved" | "Pending Approval";
};

export const CHURCH_PAYMENT_RECORDS: ChurchPaymentRecord[] = [
  {
    id: "TX-CH-101",
    receiptNo: "RCP-CH-2026-001",
    memberId: "CHU-MBR-001",
    memberName: "Rev. Prof. Emmanuel Osei",
    paymentType: "Tithe",
    category: "Tithe",
    isProject: false,
    amount: 1500,
    paymentMethod: "Bank Transfer",
    date: "14 Aug 2026",
    receivedBy: "Finance Deacon",
    status: "Confirmed",
  },
  {
    id: "TX-CH-102",
    receiptNo: "RCP-CH-2026-002",
    memberId: "CHU-MBR-002",
    memberName: "Elder Clara Mensah",
    paymentType: "Cathedral Building Project",
    category: "Project",
    isProject: true,
    projectName: "Cathedral Building Project",
    amount: 1000,
    paymentMethod: "Mobile Money",
    date: "12 Aug 2026",
    receivedBy: "Project Treasurer",
    status: "Confirmed",
  },
  {
    id: "TX-CH-103",
    receiptNo: "RCP-CH-2026-003",
    memberId: "CHU-MBR-004",
    memberName: "Dr. Hannah Quartey",
    paymentType: "Tithe",
    category: "Tithe",
    isProject: false,
    amount: 2000,
    paymentMethod: "Bank Transfer",
    date: "11 Aug 2026",
    receivedBy: "Finance Deacon",
    status: "Confirmed",
  },
  {
    id: "TX-CH-104",
    receiptNo: "RCP-CH-2026-004",
    memberId: "CHU-MBR-003",
    memberName: "Michael Kobby Addo",
    paymentType: "Evangelism Bus Project",
    category: "Project",
    isProject: true,
    projectName: "Evangelism Bus Acquisition",
    amount: 350,
    paymentMethod: "Mobile Money",
    date: "09 Aug 2026",
    receivedBy: "Youth Treasurer",
    status: "Confirmed",
  },
  {
    id: "TX-CH-105",
    receiptNo: "RCP-CH-2026-005",
    memberId: "CHU-MBR-005",
    memberName: "Deacon Samuel Frimpong",
    paymentType: "Welfare",
    category: "Welfare",
    isProject: false,
    amount: 200,
    paymentMethod: "Cash Deposit",
    date: "08 Aug 2026",
    receivedBy: "Welfare Head",
    status: "Confirmed",
  },
];

export const NGO_MEMBERS: NgoMember[] = [
  {
    id: "MEM-001",
    memberId: "CHU-MBR-001",
    name: "Rev. Prof. Emmanuel Osei",
    role: "Pastor / Minister",
    email: "e.osei@churchministry.org",
    phone: "+233 24 411 9002",
    assignedPaymentTypes: ["Tithe", "Cathedral Building Project", "Welfare"],
    annualDues: 2500,
    duesPaid: 2500,
    duesStatus: "Paid",
    monthlyTithe: 1500,
    welfarePaid: 200,
    projectContributions: 1000,
    totalPaid: 2700,
    balanceDue: 0,
    joinedDate: "15 Jan 2022",
  },
  {
    id: "MEM-002",
    memberId: "CHU-MBR-002",
    name: "Elder Clara Mensah",
    role: "Elder / Deacon",
    email: "c.mensah@chambers.gh",
    phone: "+233 20 881 2299",
    assignedPaymentTypes: ["Tithe", "Cathedral Building Project", "Welfare"],
    annualDues: 2000,
    duesPaid: 2000,
    duesStatus: "Paid",
    monthlyTithe: 1200,
    welfarePaid: 200,
    projectContributions: 1000,
    totalPaid: 2400,
    balanceDue: 0,
    joinedDate: "10 Mar 2023",
  },
  {
    id: "MEM-003",
    memberId: "CHU-MBR-003",
    name: "Michael Kobby Addo",
    role: "Youth Leader",
    email: "kobby.m@gmail.com",
    phone: "+233 27 550 4411",
    assignedPaymentTypes: ["Tithe", "Evangelism Bus Project", "Welfare"],
    annualDues: 900,
    duesPaid: 350,
    duesStatus: "Outstanding",
    monthlyTithe: 200,
    welfarePaid: 50,
    projectContributions: 350,
    totalPaid: 600,
    balanceDue: 300,
    joinedDate: "01 Feb 2025",
  },
  {
    id: "MEM-004",
    memberId: "CHU-MBR-004",
    name: "Dr. Hannah Quartey",
    role: "Board Member",
    email: "hannah.q@korlebu.edu.gh",
    phone: "+233 54 901 3322",
    assignedPaymentTypes: ["Tithe", "Cathedral Building Project", "Welfare", "Annual Harvest & Thanksgiving"],
    annualDues: 3500,
    duesPaid: 3500,
    duesStatus: "Paid",
    monthlyTithe: 2000,
    welfarePaid: 300,
    projectContributions: 1200,
    totalPaid: 3500,
    balanceDue: 0,
    joinedDate: "20 Jun 2021",
  },
  {
    id: "MEM-005",
    memberId: "CHU-MBR-005",
    name: "Deacon Samuel Frimpong",
    role: "Welfare Committee",
    email: "s.frimpong@welfare.org",
    phone: "+233 24 991 8821",
    assignedPaymentTypes: ["Tithe", "Welfare", "Evangelism Bus Project"],
    annualDues: 1200,
    duesPaid: 950,
    duesStatus: "Outstanding",
    monthlyTithe: 600,
    welfarePaid: 200,
    projectContributions: 150,
    totalPaid: 950,
    balanceDue: 250,
    joinedDate: "12 Apr 2023",
  },
  {
    id: "MEM-006",
    memberId: "CHU-MBR-006",
    name: "Sister Abigail Darko",
    role: "Member",
    email: "abigail.darko@yahoo.com",
    phone: "+233 20 114 7733",
    assignedPaymentTypes: ["Tithe", "Welfare", "Cathedral Building Project"],
    annualDues: 1500,
    duesPaid: 1500,
    duesStatus: "Paid",
    monthlyTithe: 500,
    welfarePaid: 150,
    projectContributions: 850,
    totalPaid: 1500,
    balanceDue: 0,
    joinedDate: "05 Sep 2024",
  },
];

export const NGO_PROJECTS: NgoProject[] = [
  {
    id: "PRJ-01",
    code: "PRJ-BLD-01",
    title: "Cathedral Building Project",
    location: "Main Sanctuary Complex, Accra",
    budgetAllocated: 250000,
    fundsSpent: 128500,
    leadCoordinator: "Elder Clara Mensah",
    startDate: "01 Jan 2026",
    targetEndDate: "30 Dec 2026",
    status: "Active Implementation",
    beneficiariesCount: 3500,
  },
  {
    id: "PRJ-02",
    code: "PRJ-BUS-02",
    title: "Evangelism Bus Acquisition",
    location: "Community Outreach Missions",
    budgetAllocated: 65000,
    fundsSpent: 38000,
    leadCoordinator: "Michael Kobby Addo",
    startDate: "15 Mar 2026",
    targetEndDate: "15 Oct 2026",
    status: "Active Implementation",
    beneficiariesCount: 5000,
  },
  {
    id: "PRJ-03",
    code: "PRJ-WFR-03",
    title: "Community Food & Welfare Outreach",
    location: "Urban Welfare Centers",
    budgetAllocated: 40000,
    fundsSpent: 15000,
    leadCoordinator: "Deacon Samuel Frimpong",
    startDate: "01 May 2026",
    targetEndDate: "28 Feb 2027",
    status: "Planning Phase",
    beneficiariesCount: 2200,
  },
];

export const BUDGET_APPROVALS: BudgetApproval[] = [
  {
    id: "BGT-101",
    requestNo: "REQ-2026-401",
    projectCode: "PRJ-BLD-01",
    projectName: "Cathedral Building Project",
    category: "Field Operations",
    amountRequested: 18500,
    requestedBy: "Elder Clara Mensah",
    approvedBy: "Rev. Prof. Emmanuel Osei",
    date: "10 Aug 2026",
    status: "Approved",
  },
  {
    id: "BGT-102",
    requestNo: "REQ-2026-402",
    projectCode: "PRJ-BUS-02",
    projectName: "Evangelism Bus Acquisition",
    category: "Logistics",
    amountRequested: 12400,
    requestedBy: "Michael Kobby Addo",
    approvedBy: "Rev. Prof. Emmanuel Osei",
    date: "09 Aug 2026",
    status: "Approved",
  },
  {
    id: "BGT-103",
    requestNo: "REQ-2026-403",
    projectCode: "PRJ-WFR-03",
    projectName: "Community Food & Welfare Outreach",
    category: "Community Training",
    amountRequested: 7500,
    requestedBy: "Deacon Samuel Frimpong",
    approvedBy: "Rev. Prof. Emmanuel Osei",
    date: "07 Aug 2026",
    status: "Pending Approval",
  },
];

// Calculation helpers
export const NGO_SUMMARY = {
  totalChurchCollections: CHURCH_PAYMENT_RECORDS.reduce((a, t) => a + t.amount, 0),
  totalTithesCollected: CHURCH_PAYMENT_RECORDS.filter((t) => t.category === "Tithe").reduce((a, t) => a + t.amount, 0),
  totalOfferingsCollected: CHURCH_PAYMENT_RECORDS.filter((t) => t.category === "Offering").reduce((a, t) => a + t.amount, 0),
  totalWelfareCollected: CHURCH_PAYMENT_RECORDS.filter((t) => t.category === "Welfare").reduce((a, t) => a + t.amount, 0),
  totalProjectFundsCollected: CHURCH_PAYMENT_RECORDS.filter((t) => t.isProject).reduce((a, t) => a + t.amount, 0),
  totalMembersCount: NGO_MEMBERS.length,
  totalDuesCollected: NGO_MEMBERS.reduce((a, m) => a + m.duesPaid, 0),
  totalOutstandingDues: NGO_MEMBERS.reduce((a, m) => a + m.balanceDue, 0),
  totalActiveProjects: NGO_PROJECTS.filter((p) => p.status === "Active Implementation").length,
  totalBeneficiariesReached: NGO_PROJECTS.reduce((a, p) => a + p.beneficiariesCount, 0),
  totalBudgetRequested: BUDGET_APPROVALS.reduce((a, b) => a + b.amountRequested, 0),
};
