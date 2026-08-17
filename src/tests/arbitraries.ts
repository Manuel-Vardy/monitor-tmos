import fc from "fast-check";
import { INSTITUTION_TYPES } from "@/lib/institution-types";

export const arbInstitutionType = fc.constantFrom(...INSTITUTION_TYPES);

export const arbSession = fc.record({
  institutionType: arbInstitutionType,
  accountId: fc.uuid(),
  onboardingComplete: fc.boolean(),
  featureFlags: fc.dictionary(fc.string(), fc.boolean()),
  linkedAccounts: fc.array(
    fc.record({
      accountId: fc.uuid(),
      institutionType: arbInstitutionType,
      displayName: fc.string({ minLength: 1, maxLength: 40 }),
    }),
    { minLength: 1, maxLength: 5 }
  ),
});

export const arbProtectedPath = fc.constantFrom(
  "/",
  "/pos",
  "/inventory",
  "/invoices",
  "/delivery",
  "/reports",
  "/branches",
  "/audit",
  "/settings",
  "/sales"
);
