# Design Document: Multi-Institution Dashboard

## Overview

Trite is expanding from a retail-only merchant OS into an eleven-vertical business OS. The core
platform (payments, inventory, invoicing, staff, branches, reporting) stays shared. What changes per
institution type is the login experience, the onboarding flow, the sidebar navigation profile, and
the dashboard KPI widgets rendered after sign-in.

This design describes:

- A typed `Session_Context` (React context + localStorage) that carries the active
  `Institution_Type`, account identifier, and feature flags across page refreshes and tabs.
- A `useInstitution` hook that is the single point of access for institution state throughout the app.
- An `Institution_Selector` tile-grid component shared between the login page and onboarding step 1.
- A static `NAV_PROFILE_MAP` configuration that drives the `AppShell` sidebar and mobile bottom-nav.
- A `DashboardRegistry` pattern that maps every `Institution_Type` to its concrete dashboard
  component, with a `retail` fallback for unknown types.
- An `AuthGuard` implemented as a TanStack Router `beforeLoad` hook that enforces three redirect
  rules: unauthenticated → `/login`, unauthenticated-onboarding → `/onboarding`, and
  already-authed attempting to re-enter `/login` or `/onboarding` → `/`.
- An `Institution_Switcher` dropdown in the top-bar for multi-account users.
- An extended `Onboarding_Flow` that inserts institution type selection as step 0.

The design is additive — the existing retail dashboard, `AppShell`, routing infrastructure, and
`mos-data.ts` mock data layer are preserved without modification.

---

## Architecture

### High-Level Component Tree

```
RootComponent (__root.tsx)
└── InstitutionProvider          ← new: wraps entire app with Session_Context
    └── QueryClientProvider
        └── Outlet
            ├── /login           ← Login_Page (new route)
            │   └── InstitutionSelector
            ├── /onboarding      ← extended Onboarding_Flow
            │   └── InstitutionSelector (step 0)
            └── _authenticated   ← layout route: runs AuthGuard beforeLoad
                └── AppShell     ← extended: reads Nav_Profile from context
                    ├── Sidebar (dynamic, from NAV_PROFILE_MAP)
                    ├── TopBar
                    │   └── InstitutionSwitcher (conditional)
                    ├── MobileBottomNav (dynamic, priority-ordered)
                    └── Outlet
                        ├── /             ← DashboardRenderer
                        ├── /pos
                        ├── /inventory
                        └── ... (other protected routes)
```

### Data Flow

```
localStorage                    React Context (InstitutionProvider)
  tmos_session_v1  ──rehydrate──►  { institutionType, accountId, featureFlags }
                                        │
                                        ├──► useInstitution()  (hook)
                                        ├──► NAV_PROFILE_MAP[institutionType]  (sidebar)
                                        └──► DASHBOARD_REGISTRY[institutionType]  (dashboard)
```

### Key Design Decisions

**Static config maps over dynamic fetching.** `NAV_PROFILE_MAP` and `DASHBOARD_REGISTRY` are
compile-time constants. This eliminates a network round-trip on every institution switch and makes
the mapping fully tree-shakeable per institution bundle in the future.

**Separate `_authenticated` layout route.** Rather than duplicating `beforeLoad` auth logic in
every route file, a single layout route at `src/routes/_authenticated.tsx` acts as the Auth Guard.
All protected routes become children of this layout. The `/login` and `/onboarding` routes remain
at root level and are excluded.

**`retail` as the fallback type.** The existing dashboard is the retail template. Making it the
fallback means zero regression for any path that reaches the dashboard renderer without a valid
institution type.

**Shared `InstitutionSelector` component.** Login and onboarding step 0 both render the same
component. Visual and behavioural consistency is guaranteed at the component level rather than
through documentation.

---

## Components and Interfaces

### `InstitutionProvider` — `src/contexts/institution-context.tsx`

Wraps the whole app. Reads `localStorage` synchronously during initialisation to rehydrate state,
then exposes the context.

```tsx
interface SessionState {
  institutionType: InstitutionType | null;
  accountId: string | null;
  featureFlags: Record<string, boolean>;
  isAuthenticated: boolean;
  onboardingComplete: boolean;
}

interface InstitutionContextValue extends SessionState {
  setInstitution: (type: InstitutionType, accountId: string) => void;
  signOut: () => void;
  isRehydrating: boolean;
}
```

The provider writes to `localStorage` under the key `tmos_session_v1` using `JSON.stringify`. On
mount it performs a synchronous read; if `localStorage` throws (private browsing) it silently falls
back to in-memory state. While `isRehydrating` is `true`, the `AppShell` renders a full-screen
loading skeleton instead of route content.

### `useInstitution` hook — `src/hooks/use-institution.ts`

```tsx
export function useInstitution(): InstitutionContextValue
```

Throws a descriptive error if called outside `InstitutionProvider`. This is the only import
consumers need — they never touch the context object directly.

### `InstitutionSelector` — `src/components/institution-selector.tsx`

Renders a scrollable grid of labelled tiles, one per `InstitutionType`. Receives `value` and
`onChange` as controlled props so both the login form and the onboarding wizard can manage their own
state.

```tsx
interface InstitutionSelectorProps {
  value: InstitutionType | null;
  onChange: (type: InstitutionType) => void;
  error?: string;
}
```

Each tile renders:
- A Lucide icon (one per institution type, from `INSTITUTION_META`)
- A bold name line
- A muted one-sentence description line
- Active state: `border-accent bg-accent/15` (matches the existing onboarding tile pattern)

### `INSTITUTION_META` map — `src/lib/institution-config.ts`

```tsx
export const INSTITUTION_META: Record<InstitutionType, {
  label: string;
  description: string;
  icon: LucideIcon;
  branchLabel: string;     // used in onboarding step 3
}> = {
  retail:                { label: "Retail",                description: "Shops and general merchandise stores.",                        icon: Store,         branchLabel: "Branch"    },
  wholesale:             { label: "Wholesale",             description: "Bulk distribution and trade supply.",                          icon: Warehouse,     branchLabel: "Depot"     },
  restaurant:            { label: "Restaurant",            description: "Table service, takeaways and food courts.",                    icon: UtensilsCrossed, branchLabel: "Outlet"  },
  pharmacy:              { label: "Pharmacy / Clinic",     description: "Dispensaries, clinics and health retail.",                     icon: Pill,          branchLabel: "Branch"    },
  school:                { label: "School",                description: "Schools, training centres and academies.",                     icon: GraduationCap, branchLabel: "Campus"    },
  ngo:                   { label: "NGO / Church",          description: "Churches, associations and non-profits.",                      icon: HeartHandshake, branchLabel: "Chapter" },
  salon:                 { label: "Salon / Spa",           description: "Hair, beauty, barbershops and spas.",                         icon: Scissors,      branchLabel: "Location"  },
  hotel:                 { label: "Hotel",                 description: "Hotels, guesthouses and lodges.",                             icon: BedDouble,     branchLabel: "Room"      },
  professional_services: { label: "Professional Services", description: "Consultancies, law firms and agencies.",                       icon: Briefcase,     branchLabel: "Office"    },
  manufacturer:          { label: "Manufacturer",          description: "Factories, agro-processors and producers.",                   icon: Factory,       branchLabel: "Plant"     },
  cooperative:           { label: "Cooperative",           description: "Savings groups, SACCOs and cooperatives.",                    icon: Users2,        branchLabel: "Chapter"   },
};
```

### `NAV_PROFILE_MAP` — `src/lib/nav-profiles.ts`

```tsx
export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  priority?: number;   // for mobile bottom-nav ordering (lower = higher priority)
};

export type NavGroup = {
  group: string;
  items: NavItem[];
};

export type NavProfile = NavGroup[];

export const NAV_PROFILE_MAP: Record<InstitutionType, NavProfile> = {
  retail: [
    { group: "Overview",      items: [{ to: "/",          label: "Dashboard",     icon: LayoutDashboard, priority: 1 }] },
    { group: "Operations",    items: [{ to: "/pos",       label: "Checkout / POS",icon: ScanLine,        priority: 2 },
                                      { to: "/sales",     label: "Sales",         icon: ShoppingCart,    priority: 3 },
                                      { to: "/inventory", label: "Inventory",     icon: Boxes,           priority: 4 },
                                      { to: "/delivery",  label: "Delivery",      icon: Truck                      }] },
    { group: "Money",         items: [{ to: "/invoices",  label: "Invoicing",     icon: FileText,        priority: 5 },
                                      { to: "/reports",   label: "Reports",       icon: BarChart3                  }] },
    { group: "Organisation",  items: [{ to: "/branches",  label: "Branches",      icon: Building2                  },
                                      { to: "/audit",     label: "Audit trail",   icon: ScrollText                 },
                                      { to: "/settings",  label: "Settings",      icon: Settings                   }] },
  ],
  wholesale:    [ /* Dashboard, Orders, Purchasing, Delivery Routes, Customers, Inventory, Invoicing, Reports, Branches, Audit, Settings */ ],
  restaurant:   [ /* Dashboard, Table Orders, Kitchen, Menu & Recipes, Inventory, Wastage, Invoicing, Reports, Branches, Audit, Settings */ ],
  pharmacy:     [ /* Dashboard, Dispensary, Patient Billing, Inventory (Batch/Expiry), Purchasing, Reports, Branches, Audit, Settings */ ],
  school:       [ /* Dashboard, Students, Fee Management, Payroll, Expenses, Receipts, Reports, Settings */ ],
  ngo:          [ /* Dashboard, Donations, Dues & Members, Projects, Budget & Approvals, Expenses, Reports, Settings */ ],
  salon:        [ /* Dashboard, Appointments, Staff & Commissions, Memberships, Retail Products, Invoicing, Reports, Settings */ ],
  hotel:        [ /* Dashboard, Reservations, Rooms, Housekeeping, Payments, Expenses, Reports, Branches, Audit, Settings */ ],
  professional_services: [ /* Dashboard, Clients, Projects, Time Tracking, Invoicing, Retainers, Reports, Settings */ ],
  manufacturer: [ /* Dashboard, Raw Materials, Production, Purchase Orders, Finished Goods, Invoicing, Reports, Branches, Audit, Settings */ ],
  cooperative:  [ /* Dashboard, Members, Contributions, Disbursements, Reconciliation, Reports, Settings */ ],
};

/** Resolves the Nav_Profile for a given type, returns empty array with console.warn for unknown types. */
export function resolveNavProfile(type: InstitutionType | null | undefined): NavProfile {
  if (!type || !(type in NAV_PROFILE_MAP)) {
    console.warn(`[Trite] resolveNavProfile: unknown institution type "${type}", returning empty profile.`);
    return [];
  }
  return NAV_PROFILE_MAP[type];
}
```

### `DASHBOARD_REGISTRY` — `src/lib/dashboard-registry.ts`

```tsx
export type DashboardComponent = React.ComponentType;

export const DASHBOARD_REGISTRY: Record<InstitutionType, DashboardComponent> = {
  retail:                RetailDashboard,
  wholesale:             WholesaleDashboard,
  restaurant:            RestaurantDashboard,
  pharmacy:              PharmacyDashboard,
  school:                SchoolDashboard,
  ngo:                   NgoDashboard,
  salon:                 SalonDashboard,
  hotel:                 HotelDashboard,
  professional_services: ProfessionalServicesDashboard,
  manufacturer:          ManufacturerDashboard,
  cooperative:           CooperativeDashboard,
};

/** Renders the dashboard for the given type; falls back to retail with a console.warn. */
export function DashboardRenderer({ institutionType }: { institutionType: InstitutionType | null }) {
  if (!institutionType || !(institutionType in DASHBOARD_REGISTRY)) {
    console.warn(`[Trite] DashboardRenderer: unknown institution type "${institutionType}", falling back to retail.`);
    const FallbackDashboard = DASHBOARD_REGISTRY.retail;
    return <FallbackDashboard />;
  }
  const Template = DASHBOARD_REGISTRY[institutionType];
  return <Template />;
}
```

Each dashboard component lives at `src/components/dashboards/{type}-dashboard.tsx`. They are thin
templates that compose shared `KpiCard`, Recharts chart wrappers, and institution-specific widget
components from `src/components/widgets/`.

### `AppShell` (extended) — `src/components/app-shell.tsx`

The existing `AppShell` is modified to read the active nav profile from context instead of the
hardcoded `nav` constant:

```tsx
// Replace the hardcoded `nav` constant with:
const { institutionType } = useInstitution();
const navProfile = resolveNavProfile(institutionType);

// Mobile bottom-nav: pick items with priority defined, sort ascending, take top 5
const bottomNavItems = navProfile
  .flatMap((g) => g.items)
  .filter((i) => i.priority !== undefined)
  .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
  .slice(0, 5);
```

### `InstitutionSwitcher` — `src/components/institution-switcher.tsx`

Rendered inside `AppShell`'s top-bar, conditionally when `linkedAccounts.length > 1`.

```tsx
interface LinkedAccount {
  accountId: string;
  institutionType: InstitutionType;
  displayName: string;
}

interface InstitutionSwitcherProps {
  accounts: LinkedAccount[];
  activeAccountId: string;
  onSwitch: (account: LinkedAccount) => void;
}
```

Uses a Radix `DropdownMenu`. Each item shows `INSTITUTION_META[account.institutionType].icon` and
`account.displayName`. On selection, calls `setInstitution(account.institutionType, account.accountId)`.
The entire switch (context update + re-render) must complete within 300 ms; since both `resolveNavProfile`
and `DASHBOARD_REGISTRY` lookups are synchronous O(1) operations this is guaranteed by design.

### `AuthGuard` — `src/routes/_authenticated.tsx`

```tsx
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context, location }) => {
    const session = context.session; // injected by router context
    const isProtected = !isPublicRoute(location.pathname);

    if (!session.isAuthenticated) {
      throw redirect({ to: "/login", search: { redirect: location.pathname } });
    }

    if (!session.onboardingComplete) {
      throw redirect({ to: "/onboarding" });
    }
  },
  component: Outlet,
});
```

Public routes (`/login`, `/onboarding`) are at the root level and are never children of
`_authenticated`, so the guard never fires for them. A separate `beforeLoad` on the `/login`
and `/onboarding` routes redirects already-authenticated users to `/`.

---

## Data Models

### TypeScript Types — `src/lib/institution-types.ts`

```ts
export const INSTITUTION_TYPES = [
  "retail",
  "wholesale",
  "restaurant",
  "pharmacy",
  "school",
  "ngo",
  "salon",
  "hotel",
  "professional_services",
  "manufacturer",
  "cooperative",
] as const;

export type InstitutionType = (typeof INSTITUTION_TYPES)[number];

export function isValidInstitutionType(value: unknown): value is InstitutionType {
  return INSTITUTION_TYPES.includes(value as InstitutionType);
}
```

### Session Storage Schema — `tmos_session_v1`

```ts
interface PersistedSession {
  version: 1;
  institutionType: InstitutionType;
  accountId: string;
  onboardingComplete: boolean;
  featureFlags: Record<string, boolean>;
  linkedAccounts: Array<{
    accountId: string;
    institutionType: InstitutionType;
    displayName: string;
  }>;
}
```

The versioned key `tmos_session_v1` allows schema migrations without colliding with future versions.
A future migration function compares `version` and upcasts accordingly.

### `KpiCardProps` — `src/components/kpi-card.tsx`

```ts
interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: number;        // percentage change vs previous period; positive = up
  sub: string;
  icon: LucideIcon;
  "data-testid"?: string; // for property-based test selectors
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a
system — essentially, a formal statement about what the system should do. Properties serve as the
bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Institution tile selection is exclusive

*For any* `InstitutionType`, clicking its tile in `InstitutionSelector` should result in exactly
that tile having the active CSS state, and every other tile having the inactive state.

**Validates: Requirements 1.2**

---

### Property 2: Auth login persists session round-trip

*For any* valid `InstitutionType` and non-empty `accountId`, a successful login should result in
`localStorage` containing a parseable session object with an `institutionType` equal to the one
passed to the login handler and an `accountId` equal to the one returned by authentication.

**Validates: Requirements 1.4, 2.1**

---

### Property 3: Institution tiles display required structure for all types

*For any* `InstitutionType` in the enum, the rendered `InstitutionSelector` tile for that type
should contain at least one SVG icon element and exactly two text nodes (the institution name and
its one-sentence description).

**Validates: Requirements 1.6**

---

### Property 4: Returning user pre-selection round-trip

*For any* valid `InstitutionType` written to `localStorage` as `tmos_session_v1.institutionType`,
mounting the `Login_Page` should produce a pre-selected tile whose `aria-pressed` attribute equals
`"true"` for that institution type and `"false"` for all others.

**Validates: Requirements 1.7**

---

### Property 5: Session signout clears all persisted data

*For any* session state (any `InstitutionType`, any `accountId`), calling `signOut()` from
`useInstitution` should result in `localStorage.getItem("tmos_session_v1")` returning `null`.

**Validates: Requirements 2.3**

---

### Property 6: Auth Guard redirect preserves path

*For any* protected route path (any route that is a child of `_authenticated`), an unauthenticated
navigation attempt should redirect to `/login` with a `redirect` query parameter equal to the
originally requested pathname.

**Validates: Requirements 3.1**

---

### Property 7: Auth Guard blocks non-onboarded users

*For any* protected route path (excluding `/onboarding` itself), an authenticated but
non-onboarded user should be redirected to `/onboarding` and not reach the route component.

**Validates: Requirements 3.2**

---

### Property 8: Successful auth navigates to redirect target

*For any* valid route path stored as the `redirect` query parameter, completing authentication
successfully should navigate to that path rather than the default `/`.

**Validates: Requirements 3.5**

---

### Property 9: Nav Profile lookup completeness

*For any* `InstitutionType` in the enum, `resolveNavProfile(type)` should return a non-empty
`NavProfile` array containing at least one group labelled `"Overview"` with at least one route
link, and at least one group labelled `"Operations"` with at least one route link.

**Validates: Requirements 4.1, 4.3**

---

### Property 10: Sidebar links are a subset of active Nav Profile

*For any* `InstitutionType`, every `<Link>` rendered inside `AppShell`'s sidebar should have a
`to` attribute that is present in at least one item of `resolveNavProfile(type)`. No link outside
the profile should appear.

**Validates: Requirements 4.4**

---

### Property 11: Mobile bottom-nav respects priority and maximum

*For any* `InstitutionType`'s `NavProfile`, the rendered mobile bottom-nav should contain at most
five link items, and those items should appear in ascending `priority` order as defined in the
profile.

**Validates: Requirements 4.5**

---

### Property 12: Institution switch updates all three surfaces within 300 ms

*For any* two distinct `InstitutionType` values in a multi-account `linkedAccounts` list,
switching from the first to the second via `InstitutionSwitcher` should update `useInstitution()`
context, the sidebar nav items, and the rendered `DashboardRenderer` — all within 300 ms of the
selection event.

**Validates: Requirements 16.2**

---

### Property 13: Switcher renders name and icon for every linked account

*For any* non-empty list of `LinkedAccount` objects, `InstitutionSwitcher` should render exactly
one dropdown item per account, each containing the account's `displayName` and the icon associated
with its `institutionType` in `INSTITUTION_META`.

**Validates: Requirements 16.3**

---

### Property 14: Onboarding branch label adapts to institution type

*For any* `InstitutionType` that has a non-default `branchLabel` in `INSTITUTION_META` (e.g.
`hotel` → `"Room"`, `school` → `"Classroom"`), selecting that type in onboarding step 0 should
update the step 3 form field labels and placeholder text to use the institution-specific label.

**Validates: Requirements 17.2**

---

### Property 15: Onboarding completion persists institution type

*For any* `InstitutionType` selected during onboarding step 0, completing the full onboarding flow
should result in `localStorage` containing a session object with `institutionType` equal to the
selected type and `onboardingComplete: true`.

**Validates: Requirements 17.3**

---

### Property 16: Onboarding step 0 immediately persists selection

*For any* `InstitutionType` selected on onboarding step 0, before advancing to step 1, the value
at `tmos_session_v1` in `localStorage` should already contain that `institutionType`.

**Validates: Requirements 17.4**

---

### Property 17: Dashboard round-trip rendering correctness (primary property)

*For every* valid `InstitutionType`, resolving `resolveNavProfile(type)` and rendering
`DashboardRenderer({ institutionType: type })` should produce a DOM that contains at least one
element with `data-testid="kpi-card"` and at least one sidebar `<a>` (or `<Link>`) element. No
widget from a different institution type's template should be present.

**Validates: Requirements 18.1, 18.4**

---

## Property Reflection

Reviewing for redundancy:

- Properties 2 and 5 both test localStorage round-trips but for different operations (login write
  vs signout clear) — they are complementary, not redundant.
- Property 9 (Nav Profile lookup) partially overlaps with Property 10 (sidebar links subset).
  Property 10 tests the rendered output while Property 9 tests the resolver function in isolation.
  Both are retained because one could pass while the other fails (the resolver returns the right
  data but the component renders it incorrectly, or vice versa).
- Property 17 is the most comprehensive dashboard property and subsumes individual per-institution
  rendering checks. The per-institution checks (Requirements 5–15) are better handled as targeted
  example-based tests.
- Properties 6 and 7 both test Auth Guard behaviour but for different user states (unauthenticated
  vs authenticated-but-not-onboarded) — retained as distinct.
- Properties 15 and 16 both test onboarding persistence but for different timing (step selection
  vs flow completion) — retained as distinct.

No further consolidation needed.

---

## Error Handling

### Dashboard rendering failure

Per Requirement 7.4, if any required component for a dashboard template throws during render,
the `DashboardRenderer` should catch the error and display a full-error state rather than a partial
view. Each dashboard template is wrapped in a React Error Boundary:

```tsx
// src/components/dashboards/dashboard-error-boundary.tsx
class DashboardErrorBoundary extends React.Component<
  { children: ReactNode; institutionType: InstitutionType },
  { hasError: boolean; error: Error | null }
> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <DashboardErrorState institutionType={this.props.institutionType} error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

`DashboardRenderer` wraps every template in this boundary.

### localStorage unavailability

`InstitutionProvider` wraps every `localStorage` read/write in a `try/catch`. On catch, it logs
a `console.warn` and operates in in-memory-only mode for the duration of the session.

### Unknown institution type

Both `resolveNavProfile` and `DashboardRenderer` handle unknown or `null` types explicitly: log
a `console.warn` and return a safe default (empty array / retail template respectively).

### Auth redirect loop prevention

The `beforeLoad` on `/login` and `/onboarding` only redirects if the session is authenticated
**and** onboarding is complete. This prevents a loop where incomplete-onboarding users are bounced
back and forth between `/onboarding` and `/login`.

---

## Testing Strategy

### Approach

This feature combines UI interaction, state management, pure config resolution, and routing logic.
The testing strategy uses:

- **Property-based tests** (via [fast-check](https://github.com/dubzzz/fast-check)) for the 17
  correctness properties above. Each test exercises the pure logic layer — resolver functions,
  session serialisation/deserialisation, Auth Guard decision logic — with generated inputs, minimum
  100 iterations per property.
- **Example-based unit tests** (Vitest) for specific UI snapshots, concrete error messages, and
  the per-institution dashboard content checks.
- **Integration tests** for the full routing flow (unauthenticated redirect, onboarding gate,
  institution switch) using TanStack Router's in-memory test router.

### Property-Based Testing Setup

```bash
npm install --save-dev fast-check vitest @testing-library/react @testing-library/user-event
```

Each property test is tagged in a comment:

```ts
// Feature: multi-institution-dashboard, Property 17: Dashboard round-trip rendering correctness
fc.assert(fc.property(
  fc.constantFrom(...INSTITUTION_TYPES),
  (institutionType) => {
    const navProfile = resolveNavProfile(institutionType);
    const { container } = render(<DashboardRenderer institutionType={institutionType} />);
    expect(navProfile.length).toBeGreaterThan(0);
    expect(container.querySelectorAll('[data-testid="kpi-card"]').length).toBeGreaterThan(0);
  }
), { numRuns: 100 });
```

### Arbitraries

```ts
// src/tests/arbitraries.ts
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
  "/", "/pos", "/inventory", "/invoices", "/delivery",
  "/reports", "/branches", "/audit", "/settings", "/sales"
);
```

### Unit Test Coverage

Per-institution dashboard tests (Requirements 5–15) use example-based tests:

```ts
describe.each(INSTITUTION_TYPES)("Dashboard: %s", (type) => {
  it("renders at least one KPI card", () => { ... });
  it("does not render widgets from other institutions", () => { ... });
});
```

### Files

| File | Contents |
|---|---|
| `src/tests/institution-selector.test.tsx` | Properties 3, 4; tile grid examples |
| `src/tests/session-context.test.tsx` | Properties 2, 5; rehydration examples |
| `src/tests/auth-guard.test.ts` | Properties 6, 7, 8; redirect examples |
| `src/tests/nav-profile.test.ts` | Properties 9, 10, 11 |
| `src/tests/institution-switcher.test.tsx` | Properties 12, 13; switcher examples |
| `src/tests/onboarding.test.tsx` | Properties 14, 15, 16; step ordering examples |
| `src/tests/dashboard-renderer.test.tsx` | Property 17; per-institution examples |
