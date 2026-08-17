# Implementation Plan: Multi-Institution Dashboard

## Overview

Implement the multi-institution dashboard expansion incrementally, starting with the shared
type system and session context, then the routing layer, then nav profiles, then dashboard
templates, and finally wiring everything together. The existing retail dashboard is never
touched; it becomes the fallback automatically when `DashboardRenderer` is introduced.

All code is TypeScript + React. Tests use Vitest + fast-check + @testing-library/react.

---

## Tasks

- [x] 1. Define the `InstitutionType` enum and shared type utilities
  - [x] 1.1 Create `src/lib/institution-types.ts`
    - Export `INSTITUTION_TYPES` as const tuple of all 11 values
    - Export `InstitutionType` union type derived from the tuple
    - Export `isValidInstitutionType(value: unknown): value is InstitutionType` guard
    - _Requirements: 1.6, 2.1, 18.1_

  - [ ]* 1.2 Write property test for `isValidInstitutionType`
    - **Property 17 (partial): every member of `INSTITUTION_TYPES` passes the guard; arbitrary strings that are not members do not**
    - **Validates: Requirements 18.1, 18.2**

- [x] 2. Build `INSTITUTION_META` configuration map
  - [x] 2.1 Create `src/lib/institution-config.ts`
    - Define `INSTITUTION_META` record with `label`, `description`, `icon` (Lucide), and `branchLabel` for all 11 types
    - Import icons: `Store`, `Warehouse`, `UtensilsCrossed`, `Pill`, `GraduationCap`, `HeartHandshake`, `Scissors`, `BedDouble`, `Briefcase`, `Factory`, `Users2`
    - _Requirements: 1.6, 17.2_

  - [ ]* 2.2 Write unit tests for `INSTITUTION_META` completeness
    - Assert every `InstitutionType` has a non-empty `label`, `description`, `icon`, and `branchLabel`
    - _Requirements: 1.6_

- [x] 3. Implement `InstitutionProvider` and `useInstitution` hook
  - [x] 3.1 Create `src/contexts/institution-context.tsx`
    - Define `SessionState` and `InstitutionContextValue` interfaces
    - Implement `InstitutionProvider` with `localStorage` read on mount (key `tmos_session_v1`)
    - Implement `setInstitution`, `signOut`, and `isRehydrating` flag
    - Wrap all `localStorage` calls in `try/catch` for private-browsing fallback
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.2 Create `src/hooks/use-institution.ts`
    - Export `useInstitution()` that throws a descriptive error when called outside provider
    - _Requirements: 2.5_

  - [ ]* 3.3 Write property test for session round-trip persistence
    - **Property 2: for any valid `InstitutionType` and non-empty `accountId`, `setInstitution` writes a parseable session to `localStorage` with matching fields**
    - **Validates: Requirements 1.4, 2.1**

  - [ ]* 3.4 Write property test for `signOut` clearing localStorage
    - **Property 5: for any session state, calling `signOut()` results in `localStorage.getItem("tmos_session_v1")` returning `null`**
    - **Validates: Requirements 2.3**

- [x] 4. Mount `InstitutionProvider` in the root component
  - [x] 4.1 Wrap `QueryClientProvider` with `InstitutionProvider` in `src/routes/__root.tsx`
    - Add `isRehydrating` skeleton gate to `AppShell` (renders a full-screen skeleton while `isRehydrating === true`)
    - _Requirements: 2.2, 2.6_

- [x] 5. Implement `AuthGuard` as the `_authenticated` layout route
  - [x] 5.1 Create `src/routes/_authenticated.tsx`
    - Implement `beforeLoad` that redirects unauthenticated users to `/login?redirect=<path>`
    - Implement `beforeLoad` that redirects authenticated-but-not-onboarded users to `/onboarding`
    - Implement inverse guard on `/login` and `/onboarding` routes: already-authed + onboarded → redirect to `/`
    - Move all existing protected route files under the `_authenticated` layout
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 5.2 Write property test for Auth Guard — unauthenticated redirect preserves path
    - **Property 6: for any protected route path, unauthenticated navigation redirects to `/login` with `redirect` query param equal to the original path**
    - **Validates: Requirements 3.1**

  - [ ]* 5.3 Write property test for Auth Guard — non-onboarded user redirect
    - **Property 7: for any protected route path, authenticated-but-not-onboarded navigation redirects to `/onboarding`**
    - **Validates: Requirements 3.2**

  - [ ]* 5.4 Write property test for Auth Guard — redirect param navigation after login
    - **Property 8: for any valid route path stored as the `redirect` query param, completing auth navigates to that path rather than `/`**
    - **Validates: Requirements 3.5**

- [x] 6. Implement `NAV_PROFILE_MAP` and `resolveNavProfile`
  - [x] 6.1 Create `src/lib/nav-profiles.ts`
    - Define `NavItem`, `NavGroup`, and `NavProfile` types
    - Implement `NAV_PROFILE_MAP` with full nav groups for all 11 institution types (see design for each type's modules)
    - Implement `resolveNavProfile(type)` with `console.warn` + empty-array fallback for unknown/null types
    - _Requirements: 4.1, 4.3, 6.4, 7.5, 8.4, 9.3, 10.3, 11.3, 12.4, 13.3, 14.3, 15.3, 18.2, 18.3_

  - [ ]* 6.2 Write property test for Nav Profile lookup completeness
    - **Property 9: for any `InstitutionType`, `resolveNavProfile(type)` returns a non-empty array with at least one "Overview" group and one "Operations" group, each with ≥ 1 route link**
    - **Validates: Requirements 4.1, 4.3**

  - [ ]* 6.3 Write property test for unknown type returns empty array
    - **Property 9 (complement): `resolveNavProfile(null)` and `resolveNavProfile(undefined)` return `[]`**
    - **Validates: Requirements 18.3**

- [x] 7. Extend `AppShell` with dynamic nav from context
  - [x] 7.1 Modify `src/components/app-shell.tsx`
    - Replace hardcoded `nav` constant with `resolveNavProfile(institutionType)` from `useInstitution()`
    - Compute `bottomNavItems` by filtering `priority !== undefined`, sorting ascending, taking top 5
    - Conditionally render `InstitutionSwitcher` when `linkedAccounts.length > 1`
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 16.1, 16.4_

  - [ ]* 7.2 Write property test for sidebar links subset of nav profile
    - **Property 10: for any `InstitutionType`, every `<Link>` in `AppShell` sidebar has a `to` attribute present in `resolveNavProfile(type)`**
    - **Validates: Requirements 4.4**

  - [ ]* 7.3 Write property test for mobile bottom-nav priority and maximum
    - **Property 11: for any `InstitutionType`'s `NavProfile`, the rendered mobile bottom-nav contains ≤ 5 items in ascending `priority` order**
    - **Validates: Requirements 4.5**

- [ ] 8. Implement `InstitutionSelector` tile-grid component
  - [x] 8.1 Create `src/components/institution-selector.tsx`
    - Render a scrollable grid of tiles, one per `InstitutionType`, using `INSTITUTION_META`
    - Accept `value`, `onChange`, and optional `error` as controlled props
    - Apply active state `border-accent bg-accent/15` on selected tile
    - Each tile renders: Lucide icon, bold name, muted description
    - Add `aria-pressed` attribute per tile (true/false)
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 17.5_

  - [ ]* 8.2 Write property test for tile selection exclusivity
    - **Property 1: for any `InstitutionType`, clicking its tile sets exactly that tile's `aria-pressed="true"` and all others to `aria-pressed="false"`**
    - **Validates: Requirements 1.2**

  - [ ]* 8.3 Write property test for tile rendering structure
    - **Property 3: for any `InstitutionType`, the rendered tile contains ≥ 1 SVG icon element and exactly 2 text nodes (name + description)**
    - **Validates: Requirements 1.6**

  - [ ]* 8.4 Write property test for returning-user pre-selection
    - **Property 4: for any valid `InstitutionType` in `localStorage` as `tmos_session_v1.institutionType`, mounting `Login_Page` pre-selects that tile (`aria-pressed="true"`) and all others `aria-pressed="false"`**
    - **Validates: Requirements 1.7**

- [x] 9. Checkpoint — core wiring
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Create `Login_Page` route
  - [x] 10.1 Create `src/routes/login.tsx`
    - Render `InstitutionSelector` above credential fields
    - Maintain `selectedType` in local form state, pre-populate from `useInstitution()` if available
    - Show inline validation "Please choose your institution type" when submitting without a selection
    - On auth success call `setInstitution(type, accountId)` then navigate to `redirect` param or `/`
    - On auth failure preserve selected tile
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 3.5_

- [x] 11. Extend Onboarding flow with institution type as step 0
  - [x] 11.1 Modify `src/routes/onboarding.tsx` (or its step components)
    - Insert `InstitutionSelector` as step index 0
    - Shift existing steps (Verification, First branch, First product) to indices 1–3
    - On step 0 selection, immediately write `institutionType` to `localStorage` via `setInstitution` partial
    - Wire `branchLabel` from `INSTITUTION_META[selectedType].branchLabel` into step 2 form labels and placeholders
    - On flow completion persist `onboardingComplete: true` alongside `institutionType`
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

  - [ ]* 11.2 Write property test for branch label adapting to institution type
    - **Property 14: for any `InstitutionType` with a non-default `branchLabel`, selecting it in step 0 updates step 2 field labels and placeholders to the institution-specific label**
    - **Validates: Requirements 17.2**

  - [ ]* 11.3 Write property test for onboarding completion persisting institution type
    - **Property 15: for any `InstitutionType` selected in step 0, completing the flow persists `institutionType` and `onboardingComplete: true` to `localStorage`**
    - **Validates: Requirements 17.3**

  - [ ]* 11.4 Write property test for step 0 immediately persisting selection
    - **Property 16: for any `InstitutionType` selected on step 0, before advancing, `tmos_session_v1` in `localStorage` already contains that `institutionType`**
    - **Validates: Requirements 17.4**

- [x] 12. Implement `InstitutionSwitcher` dropdown
  - [x] 12.1 Create `src/components/institution-switcher.tsx`
    - Accept `accounts: LinkedAccount[]`, `activeAccountId`, and `onSwitch` props
    - Use Radix `DropdownMenu`; each item shows `INSTITUTION_META[account.institutionType].icon` and `account.displayName`
    - On selection call `setInstitution(account.institutionType, account.accountId)`
    - _Requirements: 16.1, 16.2, 16.3, 16.4_

  - [ ]* 12.2 Write property test for switcher renders one item per linked account
    - **Property 13: for any non-empty `LinkedAccount[]`, `InstitutionSwitcher` renders exactly one dropdown item per account, each with `displayName` and the correct institution icon**
    - **Validates: Requirements 16.3**

  - [ ]* 12.3 Write property test for institution switch updates within 300 ms
    - **Property 12: for any two distinct `InstitutionType` values in `linkedAccounts`, switching via `InstitutionSwitcher` updates `useInstitution()` context, sidebar nav, and `DashboardRenderer` within 300 ms**
    - **Validates: Requirements 16.2**

- [x] 13. Implement `KpiCard` shared widget
  - [x] 13.1 Create `src/components/kpi-card.tsx`
    - Accept `label`, `value`, `delta`, `sub`, `icon`, and `data-testid` props
    - Render delta indicator (positive = green up-arrow, negative = red down-arrow) when `delta` is defined
    - Apply `data-testid="kpi-card"` by default (overridable)
    - _Requirements: 5.2, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1, 12.1, 13.1, 14.1, 15.1_

- [x] 14. Implement `DashboardErrorBoundary`
  - [x] 14.1 Create `src/components/dashboards/dashboard-error-boundary.tsx`
    - Class component with `getDerivedStateFromError`
    - Render `DashboardErrorState` with `institutionType` and `error` props when `hasError` is true
    - Create `src/components/dashboards/dashboard-error-state.tsx` with a user-facing error UI
    - _Requirements: 7.4_

- [ ] 15. Implement `DASHBOARD_REGISTRY` and `DashboardRenderer`
  - [x] 15.1 Create `src/lib/dashboard-registry.ts`
    - Import all 11 dashboard components (forward-reference; stubs are sufficient until task 16)
    - Build `DASHBOARD_REGISTRY` record mapping every `InstitutionType` to its component
    - Implement `DashboardRenderer({ institutionType })` with retail fallback + `console.warn` for unknown/null
    - Wrap each template in `DashboardErrorBoundary` inside `DashboardRenderer`
    - _Requirements: 18.1, 18.2, 7.4_

  - [ ]* 15.2 Write property test for dashboard round-trip rendering correctness
    - **Property 17: for every valid `InstitutionType`, `resolveNavProfile(type)` is non-empty and `DashboardRenderer({ institutionType: type })` renders ≥ 1 `[data-testid="kpi-card"]` element**
    - **Validates: Requirements 18.1, 18.4**

- [x] 16. Implement all 11 institution-specific dashboard templates
  - [x] 16.1 Create `src/components/dashboards/retail-dashboard.tsx` (preserve existing)
    - Migrate or re-export the existing retail dashboard as this file
    - Confirm four KPI cards: Gross Sales, Settled by Trite, Transactions, Stock at Risk
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 16.2 Create `src/components/dashboards/wholesale-dashboard.tsx`
    - Four KPI cards: Bulk Order Value, Supplier Payables, Credit Customer Receivables, Routes Active
    - Pending Delivery Routes widget (top 5 routes)
    - Credit Customers table (name, credit limit, balance used, overdue amount)
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 16.3 Create `src/components/dashboards/restaurant-dashboard.tsx`
    - Four KPI cards: Covers Today, Avg Spend per Cover, Kitchen Queue, Wastage Value
    - Live Kitchen Queue widget (open orders grouped by table, elapsed time)
    - Top Menu Items bar chart (top 10 by revenue, current day)
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 16.4 Create `src/components/dashboards/pharmacy-dashboard.tsx`
    - Four KPI cards: Prescriptions Dispensed Today, Items Expiring Within 30 Days, Outstanding Patient Balances, Regulated Stock Value
    - Expiry Alerts list (top 10 nearest expiry: batch, date, qty)
    - _Requirements: 8.1, 8.2_

  - [x] 16.5 Create `src/components/dashboards/school-dashboard.tsx`
    - Four KPI cards: Fees Collected, Enrolment Count, Outstanding Balances, Payroll Due Date
    - Fee Collection Progress chart (% expected term fees per grade)
    - _Requirements: 9.1, 9.2_

  - [x] 16.6 Create `src/components/dashboards/ngo-dashboard.tsx`
    - Four KPI cards: Donations This Month, Dues Collected (%), Active Projects, Pending Approvals
    - Project Budgets widget (active projects, budget, spent, progress bar)
    - _Requirements: 10.1, 10.2_

  - [x] 16.7 Create `src/components/dashboards/salon-dashboard.tsx`
    - Four KPI cards: Appointments Today, Commission Payable, Active Memberships, Retail Product Revenue
    - Today's Appointments timeline widget (client, service, staff, start time)
    - _Requirements: 11.1, 11.2_

  - [x] 16.8 Create `src/components/dashboards/hotel-dashboard.tsx`
    - Exactly four KPI cards: Occupancy Rate (%), Arrivals Today, Departures Today, Revenue Today — no customisation
    - Room Status grid (Available/Occupied/Due Out/Dirty/Maintenance, colour-coded cells)
    - Housekeeping Tasks widget (rooms needing cleaning, assignee, priority)
    - _Requirements: 12.1, 12.2, 12.3_

  - [x] 16.9 Create `src/components/dashboards/professional-services-dashboard.tsx`
    - Four KPI cards: Active Clients, Billable Hours (this week), Outstanding Invoices, Retainer Balance
    - Active Projects table (name, client, budget, hours logged, billing status)
    - _Requirements: 13.1, 13.2_

  - [x] 16.10 Create `src/components/dashboards/manufacturer-dashboard.tsx`
    - Four KPI cards: Raw Material Value, Open Production Batches, Purchase Orders Pending, Finished Goods Value
    - Production Batches widget (open batches, input materials, expected output, completion %)
    - _Requirements: 14.1, 14.2_

  - [x] 16.11 Create `src/components/dashboards/cooperative-dashboard.tsx`
    - Four KPI cards: Total Contributions, Active Disbursements, Members, Reconciliation Status
    - Contributions Summary chart (monthly contributions vs disbursements for current financial year)
    - _Requirements: 15.1, 15.2_

- [x] 17. Create test arbitraries and test infrastructure
  - [x] 17.1 Create `src/tests/arbitraries.ts`
    - Export `arbInstitutionType`, `arbSession`, and `arbProtectedPath` as defined in the design
    - Install `fast-check`, `vitest`, `@testing-library/react`, `@testing-library/user-event` if not present
    - _Requirements: 18.4_

- [x] 18. Checkpoint — all dashboards and registry
  - Ensure all tests pass, ask the user if questions arise.

- [x] 19. Wire dashboard route to `DashboardRenderer`
  - [x] 19.1 Modify `src/routes/_authenticated/index.tsx` (the `/` route)
    - Replace direct render of retail dashboard with `<DashboardRenderer institutionType={institutionType} />`
    - Read `institutionType` from `useInstitution()`
    - _Requirements: 18.1, 18.2, 5.1_

- [x] 20. Final checkpoint — full integration
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The existing retail dashboard is never deleted; it becomes the registered `retail` entry in `DASHBOARD_REGISTRY`
- All `localStorage` access must stay inside `try/catch` per requirement 2.4
- The `_authenticated` layout route must be the parent of all existing protected routes; route file moves may be needed in task 5.1
- `fast-check` runs minimum 100 iterations per property (`{ numRuns: 100 }`)
- Property tests are co-located in `src/tests/` — see design for the 7 test file names

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["1.2", "2.2", "3.1"] },
    { "id": 2, "tasks": ["3.2", "3.3", "3.4"] },
    { "id": 3, "tasks": ["4.1", "6.1"] },
    { "id": 4, "tasks": ["5.1", "6.2", "6.3", "13.1", "14.1"] },
    { "id": 5, "tasks": ["5.2", "5.3", "5.4", "7.1", "8.1"] },
    { "id": 6, "tasks": ["7.2", "7.3", "8.2", "8.3", "8.4", "17.1"] },
    { "id": 7, "tasks": ["10.1", "11.1", "12.1", "15.1"] },
    { "id": 8, "tasks": ["11.2", "11.3", "11.4", "12.2", "12.3", "15.2"] },
    { "id": 9, "tasks": ["16.1", "16.2", "16.3", "16.4", "16.5", "16.6", "16.7", "16.8", "16.9", "16.10", "16.11"] },
    { "id": 10, "tasks": ["19.1"] }
  ]
}
```
