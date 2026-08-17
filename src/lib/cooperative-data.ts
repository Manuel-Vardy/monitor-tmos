// ─── Cooperative Society — Shared Data ───────────────────────────────────────

export type ContributionType = "Monthly Savings" | "Share Capital" | "Special Levy" | "Emergency Fund";
export type ContributionStatus = "Paid" | "Pending" | "Overdue";
export type DisbursementType = "Personal Loan" | "Business Support Loan" | "Dividend Payout" | "Emergency Grant";
export type DisbursementStatus = "Active Repayment" | "Fully Paid" | "Pending Approval" | "Defaulted";
export type ReconciliationStatus = "Matched" | "Unmatched" | "Discrepancy Logged";

export interface CoopMember {
  id: string;
  memberNo: string;
  name: string;
  phone: string;
  email: string;
  joinDate: string;
  totalSavings: number;
  shareCapital: number;
  activeLoanBalance: number;
  status: "Active" | "Inactive" | "Suspended";
}

export interface ContributionRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberNo: string;
  type: ContributionType;
  amount: number;
  date: string;
  period: string;
  paymentMethod: "Mobile Money (MTN)" | "Bank Transfer" | "Cash Deposit";
  status: ContributionStatus;
  receivedBy: string;
}

export interface DisbursementRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberNo: string;
  type: DisbursementType;
  principalAmount: number;
  interestRatePct: number;
  totalRepayable: number;
  amountRepaid: number;
  disbursementDate: string;
  dueDate: string;
  status: DisbursementStatus;
  guarantors: string[];
}

export interface ReconciliationRecord {
  id: string;
  date: string;
  transactionRef: string;
  bankDescription: string;
  ledgerDescription: string;
  bankAmount: number;
  ledgerAmount: number;
  discrepancy: number;
  status: ReconciliationStatus;
  reconciledBy: string;
  notes: string;
}

// ── Mock Members ──────────────────────────────────────────────────────────────

export const COOP_MEMBERS: CoopMember[] = [
  {
    id: "MBR-001",
    memberNo: "COP-2024-001",
    name: "Mr. Kwaku Addo",
    phone: "+233 24 100 2001",
    email: "k.addo@gmail.com",
    joinDate: "15 Jan 2024",
    totalSavings: 18500,
    shareCapital: 5000,
    activeLoanBalance: 12000,
    status: "Active",
  },
  {
    id: "MBR-002",
    memberNo: "COP-2024-002",
    name: "Mrs. Abena Kyei",
    phone: "+233 20 200 3002",
    email: "abena.kyei@yahoo.com",
    joinDate: "01 Feb 2024",
    totalSavings: 24000,
    shareCapital: 7500,
    activeLoanBalance: 0,
    status: "Active",
  },
  {
    id: "MBR-003",
    memberNo: "COP-2024-003",
    name: "Mr. Ebenezer Ofori",
    phone: "+233 27 300 4003",
    email: "e.ofori@outlook.com",
    joinDate: "10 Mar 2024",
    totalSavings: 14200,
    shareCapital: 4000,
    activeLoanBalance: 25000,
    status: "Active",
  },
  {
    id: "MBR-004",
    memberNo: "COP-2024-004",
    name: "Ms. Grace Mensah",
    phone: "+233 26 400 5004",
    email: "g.mensah@gmail.com",
    joinDate: "20 Apr 2024",
    totalSavings: 31000,
    shareCapital: 10000,
    activeLoanBalance: 0,
    status: "Active",
  },
  {
    id: "MBR-005",
    memberNo: "COP-2024-005",
    name: "Dr. Isaac Boateng",
    phone: "+233 50 500 6005",
    email: "i.boateng@ug.edu.gh",
    joinDate: "05 May 2024",
    totalSavings: 45000,
    shareCapital: 15000,
    activeLoanBalance: 18500,
    status: "Active",
  },
];

// ── Contributions ─────────────────────────────────────────────────────────────

export const COOP_CONTRIBUTIONS: ContributionRecord[] = [
  {
    id: "CNT-8001",
    memberId: "MBR-001",
    memberName: "Mr. Kwaku Addo",
    memberNo: "COP-2024-001",
    type: "Monthly Savings",
    amount: 1500,
    date: "10 Aug 2026",
    period: "August 2026",
    paymentMethod: "Mobile Money (MTN)",
    status: "Paid",
    receivedBy: "Treasury Officer Janet",
  },
  {
    id: "CNT-8002",
    memberId: "MBR-002",
    memberName: "Mrs. Abena Kyei",
    memberNo: "COP-2024-002",
    type: "Monthly Savings",
    amount: 2000,
    date: "09 Aug 2026",
    period: "August 2026",
    paymentMethod: "Bank Transfer",
    status: "Paid",
    receivedBy: "Treasury Officer Janet",
  },
  {
    id: "CNT-8003",
    memberId: "MBR-003",
    memberName: "Mr. Ebenezer Ofori",
    memberNo: "COP-2024-003",
    type: "Share Capital",
    amount: 1000,
    date: "08 Aug 2026",
    period: "Q3 2026",
    paymentMethod: "Cash Deposit",
    status: "Paid",
    receivedBy: "Cashier Alex",
  },
  {
    id: "CNT-8004",
    memberId: "MBR-004",
    memberName: "Ms. Grace Mensah",
    memberNo: "COP-2024-004",
    type: "Monthly Savings",
    amount: 2500,
    date: "11 Aug 2026",
    period: "August 2026",
    paymentMethod: "Mobile Money (MTN)",
    status: "Paid",
    receivedBy: "Treasury Officer Janet",
  },
  {
    id: "CNT-8005",
    memberId: "MBR-005",
    memberName: "Dr. Isaac Boateng",
    memberNo: "COP-2024-005",
    type: "Emergency Fund",
    amount: 500,
    date: "05 Aug 2026",
    period: "August 2026",
    paymentMethod: "Bank Transfer",
    status: "Paid",
    receivedBy: "Treasury Officer Janet",
  },
  {
    id: "CNT-8006",
    memberId: "MBR-001",
    memberName: "Mr. Kwaku Addo",
    memberNo: "COP-2024-001",
    type: "Special Levy",
    amount: 300,
    date: "01 Aug 2026",
    period: "Building Fund",
    paymentMethod: "Cash Deposit",
    status: "Pending",
    receivedBy: "System Auto",
  },
];

// ── Disbursements ─────────────────────────────────────────────────────────────

export const COOP_DISBURSEMENTS: DisbursementRecord[] = [
  {
    id: "DSB-9001",
    memberId: "MBR-001",
    memberName: "Mr. Kwaku Addo",
    memberNo: "COP-2024-001",
    type: "Personal Loan",
    principalAmount: 15000,
    interestRatePct: 8,
    totalRepayable: 16200,
    amountRepaid: 4200,
    disbursementDate: "15 Apr 2026",
    dueDate: "15 Apr 2027",
    status: "Active Repayment",
    guarantors: ["Mrs. Abena Kyei", "Ms. Grace Mensah"],
  },
  {
    id: "DSB-9002",
    memberId: "MBR-003",
    memberName: "Mr. Ebenezer Ofori",
    memberNo: "COP-2024-003",
    type: "Business Support Loan",
    principalAmount: 30000,
    interestRatePct: 10,
    totalRepayable: 33000,
    amountRepaid: 8000,
    disbursementDate: "01 Jun 2026",
    dueDate: "01 Jun 2027",
    status: "Active Repayment",
    guarantors: ["Dr. Isaac Boateng", "Mrs. Abena Kyei"],
  },
  {
    id: "DSB-9003",
    memberId: "MBR-005",
    memberName: "Dr. Isaac Boateng",
    memberNo: "COP-2024-005",
    type: "Personal Loan",
    principalAmount: 20000,
    interestRatePct: 8,
    totalRepayable: 21600,
    amountRepaid: 3100,
    disbursementDate: "10 Jul 2026",
    dueDate: "10 Jul 2027",
    status: "Active Repayment",
    guarantors: ["Ms. Grace Mensah"],
  },
  {
    id: "DSB-9004",
    memberId: "MBR-002",
    memberName: "Mrs. Abena Kyei",
    memberNo: "COP-2024-002",
    type: "Dividend Payout",
    principalAmount: 8500,
    interestRatePct: 0,
    totalRepayable: 8500,
    amountRepaid: 8500,
    disbursementDate: "01 Jan 2026",
    dueDate: "01 Jan 2026",
    status: "Fully Paid",
    guarantors: [],
  },
  {
    id: "DSB-9005",
    memberId: "MBR-004",
    memberName: "Ms. Grace Mensah",
    memberNo: "COP-2024-004",
    type: "Emergency Grant",
    principalAmount: 5000,
    interestRatePct: 0,
    totalRepayable: 5000,
    amountRepaid: 0,
    disbursementDate: "12 Aug 2026",
    dueDate: "12 Nov 2026",
    status: "Pending Approval",
    guarantors: ["Mr. Kwaku Addo"],
  },
];

// ── Reconciliation ────────────────────────────────────────────────────────────

export const COOP_RECONCILIATIONS: ReconciliationRecord[] = [
  {
    id: "REC-101",
    date: "11 Aug 2026",
    transactionRef: "MTN-MM-99201",
    bankDescription: "MTN MoMo Deposit — Grace Mensah",
    ledgerDescription: "Monthly Savings — COP-2024-004",
    bankAmount: 2500,
    ledgerAmount: 2500,
    discrepancy: 0,
    status: "Matched",
    reconciledBy: "Internal Auditor Osei",
    notes: "Matched perfectly with MoMo statement.",
  },
  {
    id: "REC-102",
    date: "10 Aug 2026",
    transactionRef: "GCB-TRF-44102",
    bankDescription: "GCB Bank Transfer — Abena Kyei",
    ledgerDescription: "Monthly Savings — COP-2024-002",
    bankAmount: 2000,
    ledgerAmount: 2000,
    discrepancy: 0,
    status: "Matched",
    reconciledBy: "Internal Auditor Osei",
    notes: "Direct bank credit verified.",
  },
  {
    id: "REC-103",
    date: "09 Aug 2026",
    transactionRef: "CASH-DEP-0081",
    bankDescription: "Cash Counter Deposit",
    ledgerDescription: "Share Capital — COP-2024-003",
    bankAmount: 1050,
    ledgerAmount: 1000,
    discrepancy: 50,
    status: "Discrepancy Logged",
    reconciledBy: "Internal Auditor Osei",
    notes: "GHS 50 overage in cash deposit counter slip vs member receipt.",
  },
  {
    id: "REC-104",
    date: "08 Aug 2026",
    transactionRef: "MTN-MM-98772",
    bankDescription: "MTN MoMo Deposit — Unknown Sender",
    ledgerDescription: "Unmatched Mobile Money",
    bankAmount: 1800,
    ledgerAmount: 0,
    discrepancy: 1800,
    status: "Unmatched",
    reconciledBy: "System Auto",
    notes: "Deposit received without member reference in transaction text.",
  },
];

// ── Summary ───────────────────────────────────────────────────────────────────

export const COOP_SUMMARY = {
  totalSavingsPool: COOP_MEMBERS.reduce((a, m) => a + m.totalSavings, 0),
  totalShareCapital: COOP_MEMBERS.reduce((a, m) => a + m.shareCapital, 0),
  activeLoanBalance: COOP_MEMBERS.reduce((a, m) => a + m.activeLoanBalance, 0),
  totalMembers: COOP_MEMBERS.length,
  recentContributionsTotal: COOP_CONTRIBUTIONS.filter((c) => c.status === "Paid").reduce((a, c) => a + c.amount, 0),
  discrepanciesCount: COOP_RECONCILIATIONS.filter((r) => r.status !== "Matched").length,
};
