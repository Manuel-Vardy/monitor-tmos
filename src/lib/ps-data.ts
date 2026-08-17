// ─── Professional Services — Shared Data ──────────────────────────────────────
// All entities are cross-referenced so every page shows consistent data.

// ── Types ─────────────────────────────────────────────────────────────────────

export type ClientStatus = "Active" | "On Hold" | "Inactive" | "Prospect";
export type ProjectStatus = "In Progress" | "Completed" | "On Hold" | "Cancelled" | "Scoping";
export type BillingType = "Billable" | "Retainer" | "Fixed Fee" | "Pro Bono";
export type RetainerStatus = "Active" | "Paused" | "Expired" | "Pending Renewal";
export type TimeEntryStatus = "Approved" | "Pending" | "Invoiced";

export interface PSClient {
  id: string;
  name: string;
  industry: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: ClientStatus;
  totalRevenue: number;
  outstandingBalance: number;
  projectIds: string[];
  retainerId?: string;
  joinedDate: string;
}

export interface PSProject {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  billingType: BillingType;
  budget: number;
  hoursLogged: number;
  hourlyRate: number;
  startDate: string;
  deadline: string;
  status: ProjectStatus;
  teamLead: string;
  description: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  staffName: string;
  role: string;
  date: string;
  hours: number;
  description: string;
  billable: boolean;
  status: TimeEntryStatus;
  hourlyRate: number;
}

export interface PSRetainer {
  id: string;
  clientId: string;
  clientName: string;
  service: string;
  monthlyFee: number;
  hoursIncluded: number;
  hoursUsed: number;
  startDate: string;
  renewalDate: string;
  status: RetainerStatus;
  contactPerson: string;
  notes: string;
}

// ── Clients ───────────────────────────────────────────────────────────────────

export const PS_CLIENTS: PSClient[] = [
  {
    id: "CLT-001",
    name: "Accra Mining Co.",
    industry: "Mining & Resources",
    contactPerson: "Mr. Kwame Asante",
    email: "k.asante@accramining.com",
    phone: "+233 20 111 2233",
    status: "Active",
    totalRevenue: 145000,
    outstandingBalance: 24500,
    projectIds: ["PRJ-001", "PRJ-006"],
    joinedDate: "Jan 2024",
  },
  {
    id: "CLT-002",
    name: "Kofi & Sons Ltd.",
    industry: "FMCG & Distribution",
    contactPerson: "Mr. Kofi Mensah",
    email: "kofi@kofisonsltd.com",
    phone: "+233 24 222 3344",
    status: "Active",
    totalRevenue: 88000,
    outstandingBalance: 0,
    projectIds: ["PRJ-002"],
    retainerId: "RET-001",
    joinedDate: "Mar 2024",
  },
  {
    id: "CLT-003",
    name: "Coastal Exports Ghana",
    industry: "Logistics & Trade",
    contactPerson: "Ms. Ama Ofori",
    email: "a.ofori@coastalexports.gh",
    phone: "+233 27 333 4455",
    status: "Active",
    totalRevenue: 62000,
    outstandingBalance: 9800,
    projectIds: ["PRJ-003"],
    joinedDate: "Feb 2024",
  },
  {
    id: "CLT-004",
    name: "GovTech Ghana",
    industry: "Public Sector / ICT",
    contactPerson: "Dr. Nana Adjei",
    email: "n.adjei@govtech.gov.gh",
    phone: "+233 30 444 5566",
    status: "Active",
    totalRevenue: 220000,
    outstandingBalance: 55000,
    projectIds: ["PRJ-004"],
    retainerId: "RET-002",
    joinedDate: "Nov 2023",
  },
  {
    id: "CLT-005",
    name: "Volta Foods Ltd.",
    industry: "Food & Beverage",
    contactPerson: "Mrs. Efua Boateng",
    email: "e.boateng@voltafoods.com",
    phone: "+233 26 555 6677",
    status: "Active",
    totalRevenue: 41000,
    outstandingBalance: 0,
    projectIds: ["PRJ-005"],
    joinedDate: "May 2024",
  },
  {
    id: "CLT-006",
    name: "NovaBridge Capital",
    industry: "Finance & Investment",
    contactPerson: "Mr. James Osei",
    email: "j.osei@novabridge.com",
    phone: "+233 50 666 7788",
    status: "Active",
    totalRevenue: 115000,
    outstandingBalance: 18000,
    projectIds: ["PRJ-007"],
    retainerId: "RET-003",
    joinedDate: "Jun 2023",
  },
  {
    id: "CLT-007",
    name: "EduReach Foundation",
    industry: "Non-Profit / Education",
    contactPerson: "Ms. Abena Darko",
    email: "a.darko@edureach.org",
    phone: "+233 54 777 8899",
    status: "On Hold",
    totalRevenue: 22000,
    outstandingBalance: 4200,
    projectIds: [],
    joinedDate: "Aug 2024",
  },
  {
    id: "CLT-008",
    name: "Prestige Hotels Group",
    industry: "Hospitality & Tourism",
    contactPerson: "Mr. Richard Ampah",
    email: "r.ampah@prestigehotels.gh",
    phone: "+233 24 888 9900",
    status: "Prospect",
    totalRevenue: 0,
    outstandingBalance: 0,
    projectIds: [],
    joinedDate: "Aug 2026",
  },
];

// ── Projects ──────────────────────────────────────────────────────────────────

export const PS_PROJECTS: PSProject[] = [
  {
    id: "PRJ-001",
    name: "Legal Due Diligence",
    clientId: "CLT-001",
    clientName: "Accra Mining Co.",
    billingType: "Billable",
    budget: 45000,
    hoursLogged: 62,
    hourlyRate: 450,
    startDate: "01 Jun 2026",
    deadline: "31 Aug 2026",
    status: "In Progress",
    teamLead: "Kwabena Agyeman (Sr. Counsel)",
    description: "Full due diligence covering title review, regulatory compliance, and environmental permits for a proposed mine expansion.",
  },
  {
    id: "PRJ-002",
    name: "Brand Strategy & Identity",
    clientId: "CLT-002",
    clientName: "Kofi & Sons Ltd.",
    billingType: "Retainer",
    budget: 28000,
    hoursLogged: 38,
    hourlyRate: 350,
    startDate: "15 May 2026",
    deadline: "15 Sep 2026",
    status: "In Progress",
    teamLead: "Sandra Asare (Brand Lead)",
    description: "Comprehensive brand refresh including logo redesign, brand guidelines, marketing collateral templates, and digital presence strategy.",
  },
  {
    id: "PRJ-003",
    name: "Tax Advisory Q3 2026",
    clientId: "CLT-003",
    clientName: "Coastal Exports Ghana",
    billingType: "Billable",
    budget: 18000,
    hoursLogged: 24,
    hourlyRate: 400,
    startDate: "01 Jul 2026",
    deadline: "30 Sep 2026",
    status: "In Progress",
    teamLead: "Adjoa Mensah (Tax Manager)",
    description: "Q3 tax planning, GRA compliance filings, transfer pricing documentation for cross-border trade transactions.",
  },
  {
    id: "PRJ-004",
    name: "IT Infrastructure Audit",
    clientId: "CLT-004",
    clientName: "GovTech Ghana",
    billingType: "Fixed Fee",
    budget: 55000,
    hoursLogged: 81,
    hourlyRate: 500,
    startDate: "10 Apr 2026",
    deadline: "10 Aug 2026",
    status: "In Progress",
    teamLead: "Emmanuel Tetteh (IT Audit Lead)",
    description: "End-to-end IT infrastructure audit including cybersecurity assessment, data governance review, and system resilience recommendations.",
  },
  {
    id: "PRJ-005",
    name: "HR Policy Review & Update",
    clientId: "CLT-005",
    clientName: "Volta Foods Ltd.",
    billingType: "Billable",
    budget: 12000,
    hoursLogged: 18,
    hourlyRate: 380,
    startDate: "20 Jul 2026",
    deadline: "20 Aug 2026",
    status: "Completed",
    teamLead: "Josephine Owusu (HR Consultant)",
    description: "Full review of employee handbook, contracts, leave policies, and Labour Act compliance.",
  },
  {
    id: "PRJ-006",
    name: "Environmental Impact Report",
    clientId: "CLT-001",
    clientName: "Accra Mining Co.",
    billingType: "Fixed Fee",
    budget: 32000,
    hoursLogged: 44,
    hourlyRate: 420,
    startDate: "01 May 2026",
    deadline: "01 Sep 2026",
    status: "In Progress",
    teamLead: "Dr. Yaw Frimpong (Environmental Expert)",
    description: "Environmental impact assessment and mitigation plan for EPA submission.",
  },
  {
    id: "PRJ-007",
    name: "Financial Modelling & Valuation",
    clientId: "CLT-006",
    clientName: "NovaBridge Capital",
    billingType: "Retainer",
    budget: 30000,
    hoursLogged: 44,
    hourlyRate: 500,
    startDate: "01 Mar 2026",
    deadline: "31 Oct 2026",
    status: "In Progress",
    teamLead: "Akosua Barimah (CFO Advisor)",
    description: "Ongoing financial modelling, scenario analysis, and investment valuation support for portfolio acquisitions.",
  },
];

// ── Time Entries ──────────────────────────────────────────────────────────────

export const PS_TIME_ENTRIES: TimeEntry[] = [
  {
    id: "TE-001",
    projectId: "PRJ-001",
    projectName: "Legal Due Diligence",
    clientId: "CLT-001",
    clientName: "Accra Mining Co.",
    staffName: "Kwabena Agyeman",
    role: "Sr. Counsel",
    date: "11 Aug 2026",
    hours: 4.5,
    description: "Title deed review and regulatory compliance mapping",
    billable: true,
    status: "Approved",
    hourlyRate: 450,
  },
  {
    id: "TE-002",
    projectId: "PRJ-001",
    projectName: "Legal Due Diligence",
    clientId: "CLT-001",
    clientName: "Accra Mining Co.",
    staffName: "Sandra Asare",
    role: "Research Associate",
    date: "11 Aug 2026",
    hours: 3.0,
    description: "Environmental permit research and documentation",
    billable: true,
    status: "Pending",
    hourlyRate: 300,
  },
  {
    id: "TE-003",
    projectId: "PRJ-004",
    projectName: "IT Infrastructure Audit",
    clientId: "CLT-004",
    clientName: "GovTech Ghana",
    staffName: "Emmanuel Tetteh",
    role: "IT Audit Lead",
    date: "10 Aug 2026",
    hours: 7.0,
    description: "Server room inspection and network topology mapping",
    billable: true,
    status: "Invoiced",
    hourlyRate: 500,
  },
  {
    id: "TE-004",
    projectId: "PRJ-007",
    projectName: "Financial Modelling & Valuation",
    clientId: "CLT-006",
    clientName: "NovaBridge Capital",
    staffName: "Akosua Barimah",
    role: "CFO Advisor",
    date: "11 Aug 2026",
    hours: 3.5,
    description: "DCF model update and sensitivity analysis for Q3 acquisitions",
    billable: true,
    status: "Approved",
    hourlyRate: 500,
  },
  {
    id: "TE-005",
    projectId: "PRJ-002",
    projectName: "Brand Strategy & Identity",
    clientId: "CLT-002",
    clientName: "Kofi & Sons Ltd.",
    staffName: "Josephine Owusu",
    role: "Brand Lead",
    date: "09 Aug 2026",
    hours: 5.0,
    description: "Logo concepts v2 - client presentation deck",
    billable: true,
    status: "Approved",
    hourlyRate: 350,
  },
  {
    id: "TE-006",
    projectId: "PRJ-003",
    projectName: "Tax Advisory Q3 2026",
    clientId: "CLT-003",
    clientName: "Coastal Exports Ghana",
    staffName: "Adjoa Mensah",
    role: "Tax Manager",
    date: "08 Aug 2026",
    hours: 6.0,
    description: "Transfer pricing documentation and GRA filing prep",
    billable: true,
    status: "Invoiced",
    hourlyRate: 400,
  },
  {
    id: "TE-007",
    projectId: "PRJ-005",
    projectName: "HR Policy Review & Update",
    clientId: "CLT-005",
    clientName: "Volta Foods Ltd.",
    staffName: "Josephine Owusu",
    role: "HR Consultant",
    date: "07 Aug 2026",
    hours: 4.0,
    description: "Final HR handbook review and Labour Act compliance check",
    billable: true,
    status: "Invoiced",
    hourlyRate: 380,
  },
  {
    id: "TE-008",
    projectId: "PRJ-006",
    projectName: "Environmental Impact Report",
    clientId: "CLT-001",
    clientName: "Accra Mining Co.",
    staffName: "Dr. Yaw Frimpong",
    role: "Environmental Expert",
    date: "10 Aug 2026",
    hours: 8.0,
    description: "Field survey - soil and water sampling at site B",
    billable: true,
    status: "Pending",
    hourlyRate: 420,
  },
  {
    id: "TE-009",
    projectId: "PRJ-007",
    projectName: "Financial Modelling & Valuation",
    clientId: "CLT-006",
    clientName: "NovaBridge Capital",
    staffName: "Kwabena Agyeman",
    role: "Legal Advisor",
    date: "06 Aug 2026",
    hours: 2.0,
    description: "Review of share purchase agreement terms",
    billable: false,
    status: "Approved",
    hourlyRate: 450,
  },
  {
    id: "TE-010",
    projectId: "PRJ-004",
    projectName: "IT Infrastructure Audit",
    clientId: "CLT-004",
    clientName: "GovTech Ghana",
    staffName: "Emmanuel Tetteh",
    role: "IT Audit Lead",
    date: "05 Aug 2026",
    hours: 6.5,
    description: "Cybersecurity vulnerability assessment - Phase 2",
    billable: true,
    status: "Invoiced",
    hourlyRate: 500,
  },
];

// ── Retainers ─────────────────────────────────────────────────────────────────

export const PS_RETAINERS: PSRetainer[] = [
  {
    id: "RET-001",
    clientId: "CLT-002",
    clientName: "Kofi & Sons Ltd.",
    service: "Brand & Marketing Strategy",
    monthlyFee: 8500,
    hoursIncluded: 24,
    hoursUsed: 18,
    startDate: "01 May 2026",
    renewalDate: "01 Nov 2026",
    status: "Active",
    contactPerson: "Mr. Kofi Mensah",
    notes: "Monthly retainer covers strategy sessions, content review, and brand asset production up to 24 hours.",
  },
  {
    id: "RET-002",
    clientId: "CLT-004",
    clientName: "GovTech Ghana",
    service: "IT Advisory & Cybersecurity",
    monthlyFee: 15000,
    hoursIncluded: 40,
    hoursUsed: 36,
    startDate: "01 Jan 2026",
    renewalDate: "31 Dec 2026",
    status: "Active",
    contactPerson: "Dr. Nana Adjei",
    notes: "Annual retainer for ongoing IT advisory, monthly cybersecurity patch review, and quarterly board reporting.",
  },
  {
    id: "RET-003",
    clientId: "CLT-006",
    clientName: "NovaBridge Capital",
    service: "CFO Advisory & Financial Modelling",
    monthlyFee: 12000,
    hoursIncluded: 32,
    hoursUsed: 28,
    startDate: "01 Mar 2026",
    renewalDate: "01 Sep 2026",
    status: "Pending Renewal",
    contactPerson: "Mr. James Osei",
    notes: "Retainer covers ongoing DCF modelling, investor reporting, and deal due diligence support. Up for renewal this month.",
  },
  {
    id: "RET-004",
    clientId: "CLT-007",
    clientName: "EduReach Foundation",
    service: "Grant Writing & Compliance",
    monthlyFee: 4200,
    hoursIncluded: 16,
    hoursUsed: 16,
    startDate: "01 Feb 2026",
    renewalDate: "01 Aug 2026",
    status: "Paused",
    contactPerson: "Ms. Abena Darko",
    notes: "Client requested a pause due to internal restructuring. Contract renewal pending board approval.",
  },
];

// ── Summary ───────────────────────────────────────────────────────────────────

export const PS_SUMMARY = {
  totalClients: PS_CLIENTS.filter((c) => c.status === "Active").length,
  totalProjects: PS_PROJECTS.length,
  activeProjects: PS_PROJECTS.filter((p) => p.status === "In Progress").length,
  totalBillableHours: PS_TIME_ENTRIES.filter((t) => t.billable).reduce((a, t) => a + t.hours, 0),
  totalBillableValue: PS_TIME_ENTRIES.filter((t) => t.billable).reduce((a, t) => a + t.hours * t.hourlyRate, 0),
  outstandingInvoices: PS_CLIENTS.reduce((a, c) => a + c.outstandingBalance, 0),
  activeRetainers: PS_RETAINERS.filter((r) => r.status === "Active").length,
  monthlyRetainerRevenue: PS_RETAINERS.filter((r) => r.status === "Active").reduce((a, r) => a + r.monthlyFee, 0),
};
