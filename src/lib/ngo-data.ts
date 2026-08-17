export type Donation = {
  id: string;
  donorId: string;
  donorName: string;
  donorType: "Individual Partner" | "Corporate Sponsor" | "International Grant" | "Community Foundation";
  amount: number;
  currency: "GHS" | "USD";
  allocatedProject: string;
  date: string;
  paymentMethod: "Mobile Money (MTN)" | "Wire Transfer" | "Credit Card" | "Cheque";
  status: "Received" | "Pledged";
  receiptNo: string;
};

export type NgoMember = {
  id: string;
  memberId: string;
  name: string;
  role: "Board Member" | "Volunteer Leader" | "Executive Member" | "Patron Member";
  email: string;
  phone: string;
  annualDues: number;
  duesPaid: number;
  duesStatus: "Paid" | "Outstanding";
  joinedDate: string;
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

export const NGO_DONATIONS: Donation[] = [
  {
    id: "DON-001",
    donorId: "DNR-501",
    donorName: "MTN Ghana Foundation",
    donorType: "Corporate Sponsor",
    amount: 75000,
    currency: "GHS",
    allocatedProject: "Clean Water Borehole Initiative",
    date: "11 Aug 2026",
    paymentMethod: "Wire Transfer",
    status: "Received",
    receiptNo: "REC-NGO-901",
  },
  {
    id: "DON-002",
    donorId: "DNR-502",
    donorName: "Dr. Kwesi Appiah",
    donorType: "Individual Partner",
    amount: 12000,
    currency: "GHS",
    allocatedProject: "Rural Health & Maternal Care Outreach",
    date: "10 Aug 2026",
    paymentMethod: "Mobile Money (MTN)",
    status: "Received",
    receiptNo: "REC-NGO-902",
  },
  {
    id: "DON-003",
    donorId: "DNR-503",
    donorName: "Global Literacy Alliance (USA)",
    donorType: "International Grant",
    amount: 15000,
    currency: "USD",
    allocatedProject: "Digital Libraries for Basic Schools",
    date: "08 Aug 2026",
    paymentMethod: "Wire Transfer",
    status: "Pledged",
    receiptNo: "PLG-NGO-903",
  },
  {
    id: "DON-004",
    donorId: "DNR-504",
    donorName: "Stanbic Bank CSR Fund",
    donorType: "Corporate Sponsor",
    amount: 45000,
    currency: "GHS",
    allocatedProject: "Youth Vocational Skills Empowerment",
    date: "05 Aug 2026",
    paymentMethod: "Cheque",
    status: "Received",
    receiptNo: "REC-NGO-904",
  },
];

export const NGO_MEMBERS: NgoMember[] = [
  {
    id: "MEM-001",
    memberId: "NGO-MBR-01",
    name: "Rev. Prof. Emmanuel Osei",
    role: "Board Member",
    email: "e.osei@foundation.org",
    phone: "+233 24 411 9002",
    annualDues: 2000,
    duesPaid: 2000,
    duesStatus: "Paid",
    joinedDate: "15 Jan 2022",
  },
  {
    id: "MEM-002",
    memberId: "NGO-MBR-04",
    name: "Lawyer Clara Mensah",
    role: "Executive Member",
    email: "c.mensah@chambers.gh",
    phone: "+233 20 881 2299",
    annualDues: 1500,
    duesPaid: 1500,
    duesStatus: "Paid",
    joinedDate: "10 Mar 2023",
  },
  {
    id: "MEM-003",
    memberId: "NGO-MBR-12",
    name: "Michael Kobby Addo",
    role: "Volunteer Leader",
    email: "kobby.m@gmail.com",
    phone: "+233 27 550 4411",
    annualDues: 500,
    duesPaid: 0,
    duesStatus: "Outstanding",
    joinedDate: "01 Feb 2025",
  },
  {
    id: "MEM-004",
    memberId: "NGO-MBR-18",
    name: "Dr. Hannah Quartey",
    role: "Patron Member",
    email: "hannah.q@korlebu.edu.gh",
    phone: "+233 54 901 3322",
    annualDues: 3000,
    duesPaid: 3000,
    duesStatus: "Paid",
    joinedDate: "20 Jun 2021",
  },
];

export const NGO_PROJECTS: NgoProject[] = [
  {
    id: "PRJ-01",
    code: "PRJ-WTR-01",
    title: "Clean Water Borehole Initiative",
    location: "Akwapim North District, Eastern Region",
    budgetAllocated: 120000,
    fundsSpent: 78500,
    leadCoordinator: "Eng. Kwame Asante",
    startDate: "01 Mar 2026",
    targetEndDate: "30 Oct 2026",
    status: "Active Implementation",
    beneficiariesCount: 14500,
  },
  {
    id: "PRJ-02",
    code: "PRJ-HLT-02",
    title: "Rural Health & Maternal Care Outreach",
    location: "Ada East & West Districts, Greater Accra",
    budgetAllocated: 85000,
    fundsSpent: 42000,
    leadCoordinator: "Dr. Hannah Quartey",
    startDate: "15 Apr 2026",
    targetEndDate: "15 Dec 2026",
    status: "Active Implementation",
    beneficiariesCount: 8200,
  },
  {
    id: "PRJ-03",
    code: "PRJ-EDU-03",
    title: "Digital Libraries for Basic Schools",
    location: "Tamale Metro, Northern Region",
    budgetAllocated: 150000,
    fundsSpent: 15000,
    leadCoordinator: "Michael Kobby Addo",
    startDate: "01 Jun 2026",
    targetEndDate: "28 Feb 2027",
    status: "Planning Phase",
    beneficiariesCount: 22000,
  },
];

export const BUDGET_APPROVALS: BudgetApproval[] = [
  {
    id: "BGT-101",
    requestNo: "REQ-2026-401",
    projectCode: "PRJ-WTR-01",
    projectName: "Clean Water Borehole Initiative",
    category: "Medical Supplies",
    amountRequested: 18500,
    requestedBy: "Eng. Kwame Asante",
    approvedBy: "Rev. Prof. Emmanuel Osei",
    date: "10 Aug 2026",
    status: "Approved",
  },
  {
    id: "BGT-102",
    requestNo: "REQ-2026-402",
    projectCode: "PRJ-HLT-02",
    projectName: "Rural Health & Maternal Care Outreach",
    category: "Field Operations",
    amountRequested: 12400,
    requestedBy: "Dr. Hannah Quartey",
    approvedBy: "Lawyer Clara Mensah",
    date: "09 Aug 2026",
    status: "Approved",
  },
  {
    id: "BGT-103",
    requestNo: "REQ-2026-403",
    projectCode: "PRJ-EDU-03",
    projectName: "Digital Libraries for Basic Schools",
    category: "Educational Materials",
    amountRequested: 25000,
    requestedBy: "Michael Kobby Addo",
    approvedBy: "Rev. Prof. Emmanuel Osei",
    date: "07 Aug 2026",
    status: "Pending Approval",
  },
];

export const NGO_SUMMARY = {
  totalDonationsRaised: NGO_DONATIONS.filter((d) => d.status === "Received" && d.currency === "GHS").reduce((a, d) => a + d.amount, 0),
  totalActiveProjects: NGO_PROJECTS.filter((p) => p.status === "Active Implementation").length,
  totalBeneficiariesReached: NGO_PROJECTS.reduce((a, p) => a + p.beneficiariesCount, 0),
  totalMembersCount: NGO_MEMBERS.length,
  totalDuesCollected: NGO_MEMBERS.reduce((a, m) => a + m.duesPaid, 0),
  totalBudgetRequested: BUDGET_APPROVALS.reduce((a, b) => a + b.amountRequested, 0),
};
