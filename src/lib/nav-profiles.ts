import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ScanLine,
  ShoppingCart,
  Boxes,
  Truck,
  FileText,
  BarChart3,
  Building2,
  ScrollText,
  Settings,
  PackageSearch,
  Users,
  ClipboardList,
  ChefHat,
  UtensilsCrossed,
  Trash2,
  Pill,
  UserRound,
  GraduationCap,
  Banknote,
  Receipt,
  HeartHandshake,
  FolderKanban,
  PiggyBank,
  Wallet,
  CalendarClock,
  UserCog,
  Star,
  ShoppingBag,
  BedDouble,
  DoorOpen,
  SprayCan,
  CreditCard,
  Briefcase,
  Clock,
  FileStack,
  Factory,
  Layers,
  Package,
  Wrench,
  WarehouseIcon,
} from "lucide-react";
import type { InstitutionType } from "./institution-types";

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  priority?: number;
  locked?: boolean;
};

export type NavGroup = {
  group: string;
  items: NavItem[];
};

export type NavProfile = NavGroup[];

export const NAV_PROFILE_MAP: Record<InstitutionType, NavProfile> = {
  retail: [
    {
      group: "Overview",
      items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard, priority: 1 }],
    },
    {
      group: "Operations",
      items: [
        { to: "/pos", label: "Checkout / POS", icon: ScanLine, priority: 2 },
        { to: "/sales", label: "Sales", icon: ShoppingCart, priority: 3 },
        { to: "/inventory", label: "Inventory", icon: Boxes, priority: 4 },
        { to: "/delivery", label: "Delivery", icon: Truck, locked: true },
      ],
    },
    {
      group: "Money",
      items: [
        { to: "/invoices", label: "Invoicing", icon: FileText, locked: true },
        { to: "/reports", label: "Reports", icon: BarChart3 },
      ],
    },
    {
      group: "Organisation",
      items: [
        { to: "/branches", label: "Branches", icon: Building2 },
        { to: "/audit", label: "Audit trail", icon: ScrollText },
        { to: "/settings", label: "Settings", icon: Settings, priority: 5 },
      ],
    },
  ],

  wholesale: [
    {
      group: "Overview",
      items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard, priority: 1 }],
    },
    {
      group: "Operations",
      items: [
        { to: "/orders", label: "Orders", icon: ClipboardList, priority: 2 },
        { to: "/purchasing", label: "Purchasing", icon: PackageSearch, priority: 3 },
        { to: "/delivery", label: "Delivery Routes", icon: Truck, priority: 4, locked: true },
        { to: "/customers", label: "Customers", icon: Users },
        { to: "/inventory", label: "Inventory", icon: Boxes },
      ],
    },
    {
      group: "Money",
      items: [
        { to: "/invoices", label: "Invoicing", icon: FileText, locked: true },
        { to: "/reports", label: "Reports", icon: BarChart3 },
      ],
    },
    {
      group: "Organisation",
      items: [
        { to: "/branches", label: "Branches", icon: Building2 },
        { to: "/audit", label: "Audit trail", icon: ScrollText },
        { to: "/settings", label: "Settings", icon: Settings, priority: 5 },
      ],
    },
  ],

  restaurant: [
    {
      group: "Overview",
      items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard, priority: 1 }],
    },
    {
      group: "Operations",
      items: [
        { to: "/menu", label: "Menu & Recipes", icon: FileText, priority: 2 },
        { to: "/eatery-inventory", label: "Inventory", icon: Boxes, priority: 3 },
      ],
    },
    {
      group: "Money",
      items: [
        { to: "/eatery-sales", label: "Sales", icon: ShoppingCart, priority: 4 },
        { to: "/eatery-reports", label: "Reports", icon: BarChart3 },
      ],
    },
    {
      group: "Organisation",
      items: [
        { to: "/branches", label: "Branches", icon: Building2 },
        { to: "/audit", label: "Audit trail", icon: ScrollText },
        { to: "/settings", label: "Settings", icon: Settings, priority: 5 },
      ],
    },
  ],

  pharmacy: [
    {
      group: "Overview",
      items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard, priority: 1 }],
    },
    {
      group: "Operations",
      items: [
        { to: "/pharmacy-checkout", label: "Checkout / POS", icon: ScanLine, priority: 2 },
        { to: "/sales", label: "Sales", icon: ShoppingCart, priority: 3 },
        { to: "/inventory", label: "Inventory", icon: Boxes, priority: 4 },
        { to: "/purchasing", label: "Purchasing", icon: PackageSearch, priority: 5 },
      ],
    },
    {
      group: "Money",
      items: [{ to: "/reports", label: "Reports", icon: BarChart3 }],
    },
    {
      group: "Organisation",
      items: [
        { to: "/branches", label: "Branches", icon: Building2 },
        { to: "/audit", label: "Audit trail", icon: ScrollText },
        { to: "/settings", label: "Settings", icon: Settings, priority: 6 },
      ],
    },
  ],

  school: [
    {
      group: "Overview",
      items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard, priority: 1 }],
    },
    {
      group: "Operations",
      items: [
        { to: "/students", label: "Students", icon: GraduationCap, priority: 2 },
        { to: "/fees", label: "Fee Management", icon: Banknote, priority: 3 },
      ],
    },
    {
      group: "Money",
      items: [
        { to: "/receipts", label: "Receipts", icon: Receipt },
        { to: "/reports", label: "Reports", icon: BarChart3 },
      ],
    },
    {
      group: "Organisation",
      items: [{ to: "/settings", label: "Settings", icon: Settings, priority: 5 }],
    },
  ],

  ngo: [
    {
      group: "Overview",
      items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard, priority: 1 }],
    },
    {
      group: "Operations",
      items: [
        { to: "/donations", label: "Donations", icon: HeartHandshake, priority: 2 },
        { to: "/members", label: "Dues & Members", icon: Users, priority: 3 },
        { to: "/projects", label: "Projects", icon: FolderKanban, priority: 4 },
      ],
    },
    {
      group: "Money",
      items: [
        { to: "/budget", label: "Budget & Approvals", icon: PiggyBank },
        { to: "/reports", label: "Reports", icon: BarChart3 },
      ],
    },
    {
      group: "Organisation",
      items: [{ to: "/settings", label: "Settings", icon: Settings, priority: 5 }],
    },
  ],

  salon: [
    {
      group: "Overview",
      items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard, priority: 1 }],
    },
    {
      group: "Operations",
      items: [
        { to: "/appointments", label: "Appointments", icon: CalendarClock, priority: 2 },
        { to: "/staff", label: "Staff & Commissions", icon: UserCog, priority: 3 },
        { to: "/memberships", label: "Memberships", icon: Star, priority: 4 },
        { to: "/retail-products", label: "Retail Products", icon: ShoppingBag },
      ],
    },
    {
      group: "Money",
      items: [
        { to: "/invoices", label: "Invoicing", icon: FileText, locked: true },
        { to: "/reports", label: "Reports", icon: BarChart3 },
      ],
    },
    {
      group: "Organisation",
      items: [{ to: "/settings", label: "Settings", icon: Settings, priority: 5 }],
    },
  ],

  hotel: [
    {
      group: "Overview",
      items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard, priority: 1 }],
    },
    {
      group: "Operations",
      items: [
        { to: "/reservations", label: "Reservations", icon: BedDouble, priority: 2 },
        { to: "/rooms", label: "Rooms", icon: DoorOpen, priority: 3 },
        { to: "/housekeeping", label: "Housekeeping", icon: SprayCan, priority: 4 },
      ],
    },
    {
      group: "Money",
      items: [
        { to: "/payments", label: "Payments", icon: CreditCard },
        { to: "/expenses", label: "Expenses", icon: Wallet },
        { to: "/reports", label: "Reports", icon: BarChart3 },
      ],
    },
    {
      group: "Organisation",
      items: [
        { to: "/branches", label: "Branches", icon: Building2 },
        { to: "/audit", label: "Audit trail", icon: ScrollText },
        { to: "/settings", label: "Settings", icon: Settings, priority: 5 },
      ],
    },
  ],

  professional_services: [
    {
      group: "Overview",
      items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard, priority: 1 }],
    },
    {
      group: "Operations",
      items: [
        { to: "/clients", label: "Clients", icon: Briefcase, priority: 2 },
        { to: "/projects", label: "Projects", icon: FolderKanban, priority: 3 },
        { to: "/time-tracking", label: "Time Tracking", icon: Clock, priority: 4 },
      ],
    },
    {
      group: "Money",
      items: [
        { to: "/invoices", label: "Invoicing", icon: FileText, locked: true },
        { to: "/retainers", label: "Retainers", icon: FileStack },
        { to: "/reports", label: "Reports", icon: BarChart3 },
      ],
    },
    {
      group: "Organisation",
      items: [{ to: "/settings", label: "Settings", icon: Settings, priority: 5 }],
    },
  ],

  manufacturer: [
    {
      group: "Overview",
      items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard, priority: 1 }],
    },
    {
      group: "Operations",
      items: [
        { to: "/raw-materials", label: "Raw Materials", icon: Wrench, priority: 2 },
        { to: "/production", label: "Production", icon: Factory, priority: 3 },
        { to: "/purchase-orders", label: "Purchase Orders", icon: PackageSearch, priority: 4 },
        { to: "/finished-goods", label: "Finished Goods", icon: Package },
      ],
    },
    {
      group: "Money",
      items: [
        { to: "/invoices", label: "Invoicing", icon: FileText, locked: true },
        { to: "/reports", label: "Reports", icon: BarChart3 },
      ],
    },
    {
      group: "Organisation",
      items: [
        { to: "/branches", label: "Branches", icon: Building2 },
        { to: "/audit", label: "Audit trail", icon: ScrollText },
        { to: "/settings", label: "Settings", icon: Settings, priority: 5 },
      ],
    },
  ],

  cooperative: [
    {
      group: "Overview",
      items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard, priority: 1 }],
    },
    {
      group: "Operations",
      items: [
        { to: "/members", label: "Members", icon: Users, priority: 2 },
        { to: "/contributions", label: "Contributions", icon: PiggyBank, priority: 3 },
        { to: "/disbursements", label: "Disbursements", icon: Banknote, priority: 4 },
      ],
    },
    {
      group: "Money",
      items: [
        { to: "/reconciliation", label: "Reconciliation", icon: Layers },
        { to: "/reports", label: "Reports", icon: BarChart3 },
      ],
    },
    {
      group: "Organisation",
      items: [{ to: "/settings", label: "Settings", icon: Settings, priority: 5 }],
    },
  ],
};

export function resolveNavProfile(type: InstitutionType | null | undefined): NavProfile {
  if (!type || !(type in NAV_PROFILE_MAP)) {
    console.warn(
      `[Trite] resolveNavProfile: unknown institution type "${type}", returning empty profile.`,
    );
    return [];
  }
  return NAV_PROFILE_MAP[type];
}
