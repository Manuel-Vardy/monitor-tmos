import {
  Store,
  UtensilsCrossed,
  Pill,
  GraduationCap,
  HeartHandshake,
  BedDouble,
  Briefcase,
  Factory,
  Users2,
  type LucideIcon,
} from "lucide-react";
import type { InstitutionType } from "./institution-types";

export const INSTITUTION_META: Record<
  InstitutionType,
  {
    label: string;
    description: string;
    icon: LucideIcon;
    branchLabel: string;
  }
> = {
  retail: {
    label: "Retail Shop",
    description: "Shops and general merchandise stores.",
    icon: Store,
    branchLabel: "Branch",
  },
  // wholesale temporarily removed — will be added back later
  restaurant: {
    label: "Eatery",
    description: "Table service, takeaways and food courts.",
    icon: UtensilsCrossed,
    branchLabel: "Outlet",
  },
  pharmacy: {
    label: "Pharmacy",
    description: "Dispensaries, clinics and health retail.",
    icon: Pill,
    branchLabel: "Branch",
  },
  school: {
    label: "Academic Institution",
    description: "Schools, training centres and academies.",
    icon: GraduationCap,
    branchLabel: "Campus",
  },
  ngo: {
    label: "Church",
    description: "Churches, associations and non-profits.",
    icon: HeartHandshake,
    branchLabel: "Chapter",
  },
};

// ── Coming-soon dashboards (hidden from signup until ready) ────────────────────
// Uncomment the corresponding line in institution-types.ts to make these visible.
export const HIDDEN_INSTITUTION_META = {
  // salon temporarily removed — will be added back later
  hotel: {
    label: "Hotel",
    description: "Hotels, guesthouses and lodges.",
    icon: BedDouble,
    branchLabel: "Room",
  },
  professional_services: {
    label: "Professional Services",
    description: "Consultancies, law firms and agencies.",
    icon: Briefcase,
    branchLabel: "Office",
  },
  manufacturer: {
    label: "Manufacturer",
    description: "Factories, agro-processors and producers.",
    icon: Factory,
    branchLabel: "Plant",
  },
  cooperative: {
    label: "Cooperative",
    description: "Savings groups, SACCOs and cooperatives.",
    icon: Users2,
    branchLabel: "Chapter",
  },
};
