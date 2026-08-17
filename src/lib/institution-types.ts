export const INSTITUTION_TYPES = [
  "retail",
  // "wholesale",  // temporarily removed — will be added back later
  "restaurant",
  "pharmacy",
  "school",
  "ngo",
  // "salon",              // coming soon — will be enabled later
  // "hotel",             // coming soon — will be enabled later
  // "professional_services", // coming soon — will be enabled later
  // "manufacturer",     // coming soon — will be enabled later
  // "cooperative",      // coming soon — will be enabled later
] as const;

export type InstitutionType = (typeof INSTITUTION_TYPES)[number];

export function isValidInstitutionType(value: unknown): value is InstitutionType {
  return INSTITUTION_TYPES.includes(value as InstitutionType);
}
