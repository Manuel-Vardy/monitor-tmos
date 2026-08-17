# Requirements Document

## Introduction

Trite is expanding from a retail-only merchant operating system into a multi-institution business OS
that serves eleven industry verticals. The core platform (payments, inventory, invoicing, staff,
branches, reporting) remains shared. What changes per institution is the login experience, the
onboarding flow, the sidebar navigation, and the dashboard KPIs and widgets shown after sign-in.

A user selects their institution type during account creation or login. The Router stores that
selection in a persisted session context. Every subsequent navigation decision — which nav groups to
show, which dashboard template to render, which quick-action buttons appear — is driven by that
institution type. Users may belong to more than one institution account and switch between them
without re-entering credentials.

## Glossary

- **Institution_Type**: One of eleven enumerated values that classifies a business:
  `retail`, `wholesale`, `restaurant`, `pharmacy`, `school`, `ngo`, `salon`, `hotel`,
  `professional_services`, `manufacturer`, `cooperative`.
- **Institution_Selector**: The UI component on the login / sign-up screen that lets a user choose
  their Institution_Type before or during authentication.
- **Session_Context**: The client-side persisted state (localStorage + React context) that stores the
  authenticated user's active Institution_Type, account identifier, and feature flags.
- **Dashboard_Template**: The institution-specific layout rendered on the home route (`/`) once the
  user is authenticated. Each template composes a set of KPI cards, charts, and quick-action widgets
  relevant to that Institution_Type.
- **Core_Shell**: The shared `AppShell` component (sidebar, top-bar, mobile bottom-nav) that wraps
  every Dashboard_Template and provides navigation, branch switching, notifications, and search.
- **Nav_Profile**: An institution-specific configuration object that lists which sidebar groups and
  route links are visible for a given Institution_Type.
- **Module**: A self-contained feature area (e.g. Inventory, POS, Invoicing, Kitchen, Reservations)
  that may be shared across multiple Institution_Types or exclusive to one.
- **KPI_Card**: A summary statistic widget surfaced on a Dashboard_Template (e.g. Gross Sales, Table
  Turns, Bed Occupancy Rate).
- **Institution_Switcher**: A UI control in the top-bar or sidebar that lets a multi-account user
  switch the active Institution_Type without re-authenticating.
- **Onboarding_Flow**: The multi-step setup wizard (already at `/onboarding`) extended to include
  the institution type selection step as its first screen.
- **Auth_Guard**: The route-level guard that redirects unauthenticated users to `/login` and users
  who have not completed onboarding to `/onboarding`.
- **Protected_Route**: Any application route behind the Auth_Guard.
- **Login_Page**: The `/login` route where users authenticate. It contains the Institution_Selector.
- **Feature_Flag**: A boolean stored in Session_Context that enables or disables a specific Module
  for a given Institution_Type.

---

## Requirements

### Requirement 1: Institution Type Selection at Login

**User Story:** As a new or returning user, I want to choose my institution type on the login screen,
so that Trite loads the correct dashboard and modules for my business without manual configuration.

#### Acceptance Criteria

1. THE Login_Page SHALL display the Institution_Selector as a scrollable grid of labelled tiles,
   one per Institution_Type, before the credential fields.
2. WHEN a user clicks an Institution_Selector tile, THE Login_Page SHALL highlight the selected tile
   with a distinct active state (border + fill) and store the selection in transient form state.
3. WHEN a user submits the login form without selecting an Institution_Type, THE Login_Page SHALL
   display an inline validation message reading "Please choose your institution type" and SHALL NOT
   proceed to authentication.
4. WHEN authentication succeeds and an Institution_Type has been selected, THE Session_Context SHALL
   persist the Institution_Type and the authenticated account identifier to localStorage.
5. IF authentication fails, THEN THE Login_Page SHALL display an error message and SHALL preserve
   the previously selected Institution_Type tile so the user does not need to re-select it.
6. THE Login_Page SHALL display all eleven Institution_Types with a representative icon and a
   two-line label (name + one-sentence description).
7. WHERE a returning user has a persisted Session_Context, THE Login_Page SHALL pre-select the tile
   matching the stored Institution_Type on page load.

---

### Requirement 2: Session Context and Institution Type Persistence

**User Story:** As an authenticated user, I want my institution type to be remembered across page
refreshes and browser tabs, so that I do not have to re-select it on every visit.

#### Acceptance Criteria

1. THE Session_Context SHALL store Institution_Type, account identifier, and feature flags in
   localStorage under a versioned key.
2. WHEN the application boots, THE Session_Context SHALL read localStorage and rehydrate the
   context before any route renders, preventing a flash of the wrong dashboard template.
3. WHEN a user signs out, THE Session_Context SHALL clear all persisted data from localStorage and
   redirect the user to THE Login_Page.
4. IF localStorage is unavailable (e.g. private browsing), THEN THE Session_Context SHALL fall back
   to in-memory state and SHALL NOT throw a runtime error.
5. THE Session_Context SHALL expose a typed React context hook (`useInstitution`) that returns the
   current Institution_Type and a setter for institution switching.
6. WHILE the Session_Context is rehydrating on boot, THE Core_Shell SHALL display a full-screen
   loading skeleton and SHALL NOT render any route content.

---

### Requirement 3: Auth Guard and Route Protection

**User Story:** As the platform, I want unauthenticated users to be redirected to the login page and
users who skipped onboarding to be redirected to setup, so that no Protected_Route is accessible
without a valid session.

#### Acceptance Criteria

1. WHEN an unauthenticated user navigates to any Protected_Route, THE Auth_Guard SHALL redirect the
   user to `/login`, preserving the originally requested path as a `redirect` query parameter.
2. WHEN an authenticated user who has not completed onboarding navigates to any Protected_Route
   other than `/onboarding`, THE Auth_Guard SHALL redirect the user to `/onboarding`. The Auth_Guard
   SHALL apply this redirect only for routes that require a completed onboarding state and SHALL NOT
   redirect universally.
3. WHEN an authenticated user with a completed onboarding navigates to `/login` or `/onboarding`,
   THE Auth_Guard SHALL redirect the user to `/`.
4. THE Auth_Guard SHALL NOT redirect users navigating to the `/login` or `/onboarding` routes.
5. WHEN authentication succeeds and a `redirect` query parameter is present, THE Auth_Guard SHALL
   navigate the user to the preserved path instead of the default `/`.

---

### Requirement 4: Institution-Specific Navigation (Nav Profile)

**User Story:** As a user of any institution type, I want the sidebar and bottom mobile nav to show
only the modules relevant to my business, so that I am not overwhelmed by features I will never use.

#### Acceptance Criteria

1. THE Core_Shell SHALL resolve the Nav_Profile for the active Institution_Type from a statically
   defined configuration map before rendering the sidebar.
2. WHEN the active Institution_Type changes, THE Core_Shell SHALL re-render the sidebar with the
   new Nav_Profile without a full page reload.
3. THE Nav_Profile for every Institution_Type SHALL include at minimum one Overview group and one
   Operations group, each with at least one route link.
4. THE Core_Shell SHALL NOT render sidebar links for routes not present in the active Nav_Profile.
5. THE Core_Shell mobile bottom-nav SHALL display the available links from the active Nav_Profile
   in priority order defined per institution, up to a maximum of five links.

---

### Requirement 5: Retail Dashboard Template (existing, baseline)

**User Story:** As a retail merchant, I want to see my organisation-wide revenue, branch comparison,
payment mix, and stock alerts on the home dashboard, so that I can manage a multi-location retail
business from one screen.

#### Acceptance Criteria

1. WHEN Institution_Type is `retail`, THE Dashboard_Template SHALL render the existing dashboard
   (sales vs settlement area chart, payment method mix, branch comparison bar chart, low-stock
   alerts, recent activity table).
2. WHILE the Dashboard_Template for `retail` is rendered, THE Dashboard_Template SHALL display four
   KPI_Cards: Gross Sales, Settled by Trite, Transactions, and Stock at Risk.
3. WHEN a branch filter chip is clicked, THE Dashboard_Template SHALL filter all charts and the
   activity table to the selected branch within 100 ms.

---

### Requirement 6: Wholesale & Distribution Dashboard Template

**User Story:** As a wholesaler or distributor, I want to see bulk order volumes, supplier purchase
status, outstanding credit customer balances, and delivery route progress on my home dashboard, so
that I can manage wholesale operations at a glance.

#### Acceptance Criteria

1. WHEN Institution_Type is `wholesale`, THE Dashboard_Template SHALL render four KPI_Cards:
   Bulk Order Value, Supplier Payables, Credit Customer Receivables, and Routes Active.
2. THE Dashboard_Template for `wholesale` SHALL render a Pending Delivery Routes widget listing the
   top five open routes with driver name, destination, and estimated arrival.
3. THE Dashboard_Template for `wholesale` SHALL render a Credit Customers table showing customer
   name, credit limit, balance used, and overdue amount.
4. THE Nav_Profile for `wholesale` SHALL include modules: Dashboard, Orders, Purchasing, Delivery
   Routes, Customers, Inventory, Invoicing, Reports, Branches, Audit, Settings.

---

### Requirement 7: Restaurant & Food Business Dashboard Template

**User Story:** As a restaurant operator, I want to see covers served, kitchen queue length, top
menu items, and wastage value on my home dashboard, so that I can manage table service and kitchen
operations in real time.

#### Acceptance Criteria

1. WHEN Institution_Type is `restaurant`, THE Dashboard_Template SHALL render four KPI_Cards:
   Covers Today, Average Spend per Cover, Kitchen Queue (open tickets), and Wastage Value (daily).
2. WHILE the Dashboard_Template for `restaurant` is rendered, THE Dashboard_Template SHALL render a
   live Kitchen Queue widget listing open orders grouped by table number, with elapsed time since
   order was placed.
3. WHILE the Dashboard_Template for `restaurant` is rendered, THE Dashboard_Template SHALL render a
   Top Menu Items bar chart showing the ten highest-revenue items for the current day.
4. IF any required Dashboard_Template component for `restaurant` fails to render, THEN THE
   Dashboard_Template renderer SHALL halt rendering and display an error state for the entire
   dashboard rather than a partial view.
5. THE Nav_Profile for `restaurant` SHALL include modules: Dashboard, Table Orders, Kitchen,
   Menu & Recipes, Inventory, Wastage, Invoicing, Reports, Branches, Audit, Settings.

---

### Requirement 8: Pharmacy & Clinic Dashboard Template

**User Story:** As a pharmacy or clinic operator, I want to see dispensed items, expiry alerts,
patient billing status, and regulated inventory on my home dashboard, so that I can manage
compliance and cash flow simultaneously.

#### Acceptance Criteria

1. WHEN Institution_Type is `pharmacy`, THE Dashboard_Template SHALL render four KPI_Cards:
   Prescriptions Dispensed Today, Items Expiring Within 30 Days, Outstanding Patient Balances, and
   Regulated Stock Value.
2. WHILE the Dashboard_Template for `pharmacy` is rendered, THE Dashboard_Template SHALL render an
   Expiry Alerts list showing the ten products nearest expiry, with batch number, expiry date, and
   quantity on hand.
3. THE Nav_Profile for `pharmacy` SHALL load and render independently of dashboard content; sidebar
   navigation modules SHALL be available to the user regardless of whether the Dashboard_Template
   KPI_Cards have finished loading.
4. THE Nav_Profile for `pharmacy` SHALL include modules: Dashboard, Dispensary, Patient Billing,
   Inventory (with Batch/Expiry), Purchasing, Reports, Branches, Audit, Settings.

---

### Requirement 9: School & Training Centre Dashboard Template

**User Story:** As a school administrator, I want to see fee collection progress, student enrolment
count, outstanding fee balances, and payroll status on my home dashboard, so that I can manage
school finances in one view.

#### Acceptance Criteria

1. WHEN Institution_Type is `school`, THE Dashboard_Template SHALL render four KPI_Cards: Fees
   Collected (current term), Enrolment Count, Outstanding Balances, and Payroll Due Date.
2. THE Dashboard_Template for `school` SHALL render a Fee Collection Progress chart showing the
   percentage of expected term fees collected per grade or class.
3. THE Nav_Profile for `school` SHALL include modules: Dashboard, Students, Fee Management,
   Payroll, Expenses, Receipts, Reports, Settings.

---

### Requirement 10: Church, NGO & Association Dashboard Template

**User Story:** As an administrator of a church, NGO, or association, I want to see donations
collected, membership dues status, active project budgets, and pending approvals on my home
dashboard, so that I can govern finances and projects transparently.

#### Acceptance Criteria

1. WHEN Institution_Type is `ngo`, THE Dashboard_Template SHALL render four KPI_Cards: Donations
   This Month, Dues Collected (%), Active Projects, and Pending Approvals.
2. THE Dashboard_Template for `ngo` SHALL render a Project Budgets widget listing active projects
   with budget, spent amount, and a visual progress bar.
3. THE Nav_Profile for `ngo` SHALL include modules: Dashboard, Donations, Dues & Members, Projects,
   Budget & Approvals, Expenses, Reports, Settings.

---

### Requirement 11: Salon, Spa & Barbershop Dashboard Template

**User Story:** As a salon or spa owner, I want to see appointments for the day, staff commissions
earned, active memberships, and retail product sales on my home dashboard, so that I can monitor
service and product performance together.

#### Acceptance Criteria

1. WHEN Institution_Type is `salon`, THE Dashboard_Template SHALL render four KPI_Cards: Appointments
   Today, Commission Payable, Active Memberships, and Retail Product Revenue.
2. THE Dashboard_Template for `salon` SHALL render a Today's Appointments timeline widget showing
   each appointment with client name, service, assigned staff, and start time.
3. THE Nav_Profile for `salon` SHALL include modules: Dashboard, Appointments, Staff & Commissions,
   Memberships, Retail Products, Invoicing, Reports, Settings.

---

### Requirement 12: Hotel & Guesthouse Dashboard Template

**User Story:** As a hotel manager, I want to see occupancy rate, arrivals and departures for today,
housekeeping task status, and revenue by room type on my home dashboard, so that I can manage
front-desk and back-of-house operations from one screen.

#### Acceptance Criteria

1. WHEN Institution_Type is `hotel`, THE Dashboard_Template SHALL render exactly four KPI_Cards:
   Occupancy Rate (%), Arrivals Today, Departures Today, and Revenue Today. THE hotel dashboard
   SHALL NOT allow customisation of the KPI_Card set or count.
2. THE Dashboard_Template for `hotel` SHALL render a Room Status grid showing each room's current
   status (Available, Occupied, Due Out, Dirty, Maintenance) using colour-coded cells.
3. THE Dashboard_Template for `hotel` SHALL render a Housekeeping Tasks widget listing rooms that
   need cleaning, with assignee and priority.
4. THE Nav_Profile for `hotel` SHALL include modules: Dashboard, Reservations, Rooms, Housekeeping,
   Payments, Expenses, Reports, Branches, Audit, Settings.

---

### Requirement 13: Professional Services Dashboard Template

**User Story:** As a professional services firm manager, I want to see active client engagements,
billable hours logged this week, outstanding invoices, and retainer balances on my home dashboard,
so that I can track project health and cash flow together.

#### Acceptance Criteria

1. WHEN Institution_Type is `professional_services`, THE Dashboard_Template SHALL render four
   KPI_Cards: Active Clients, Billable Hours (this week), Outstanding Invoices, and Retainer Balance.
2. THE Dashboard_Template for `professional_services` SHALL render an Active Projects table showing
   project name, client, budget, hours logged, and billing status.
3. THE Nav_Profile for `professional_services` SHALL include modules: Dashboard, Clients, Projects,
   Time Tracking, Invoicing, Retainers, Reports, Settings.

---

### Requirement 14: Manufacturer & Agro-Processor Dashboard Template

**User Story:** As a manufacturer or agro-processor, I want to see raw material stock levels,
open production batches, purchase orders awaiting delivery, and finished goods stock on my home
dashboard, so that I can coordinate procurement, production, and despatch.

#### Acceptance Criteria

1. WHEN Institution_Type is `manufacturer`, THE Dashboard_Template SHALL render four KPI_Cards:
   Raw Material Value, Open Production Batches, Purchase Orders Pending, and Finished Goods Value.
2. THE Dashboard_Template for `manufacturer` SHALL render a Production Batches widget listing open
   batches with input materials, expected output, and completion percentage.
3. THE Nav_Profile for `manufacturer` SHALL include modules: Dashboard, Raw Materials, Production,
   Purchase Orders, Finished Goods, Invoicing, Reports, Branches, Audit, Settings.

---

### Requirement 15: Cooperative & Savings Group Dashboard Template

**User Story:** As a cooperative administrator, I want to see total member contributions, active
loan disbursements, reconciliation status, and member count on my home dashboard, so that I can
manage the cooperative's financial health transparently.

#### Acceptance Criteria

1. WHEN Institution_Type is `cooperative`, THE Dashboard_Template SHALL render four KPI_Cards:
   Total Contributions, Active Disbursements, Members, and Reconciliation Status.
2. THE Dashboard_Template for `cooperative` SHALL render a Contributions Summary chart showing
   monthly contributions vs disbursements for the current financial year.
3. THE Nav_Profile for `cooperative` SHALL include modules: Dashboard, Members, Contributions,
   Disbursements, Reconciliation, Reports, Settings.

---

### Requirement 16: Institution Switcher for Multi-Account Users

**User Story:** As a user who manages multiple institution accounts (e.g. a retail shop and a
restaurant), I want to switch between them from the top-bar without re-authenticating, so that I
can manage both businesses without separate login sessions.

#### Acceptance Criteria

1. THE Core_Shell top-bar SHALL display an Institution_Switcher dropdown when the authenticated
   user has more than one institution account linked to their credentials.
2. WHEN the user selects a different institution from the Institution_Switcher, THE Session_Context
   SHALL update the active Institution_Type and account identifier, THE Core_Shell SHALL re-render
   the Nav_Profile, and THE Dashboard_Template SHALL load the correct template — all within 300 ms.
3. THE Institution_Switcher SHALL display the institution name and a representative icon for each
   linked account.
4. IF the user has only one linked institution account, THEN THE Institution_Switcher SHALL NOT be
   displayed.

---

### Requirement 17: Extended Onboarding with Institution Type Step

**User Story:** As a new user going through onboarding, I want institution type selection to be the
first step, so that all subsequent onboarding steps (KYC, first branch, first product) are
contextualised to my business type.

#### Acceptance Criteria

1. THE Onboarding_Flow SHALL add "Institution type" as step 1 (index 0), shifting the existing
   steps (Verification, First branch, First product) to steps 2–4.
2. WHEN a user selects an Institution_Type in the Onboarding_Flow, THE Onboarding_Flow SHALL update
   the step 3 ("First branch") labels and placeholder text to match the selected institution
   (e.g. "Room" instead of "Branch" for hotels; "Classroom" for schools).
3. WHEN the user completes the Onboarding_Flow, THE Session_Context SHALL persist the selected
   Institution_Type alongside the account data.
4. WHEN a user selects an Institution_Type during the Onboarding_Flow, THE Onboarding_Flow SHALL
   immediately persist that selection to localStorage so that it is available if the user returns to
   onboarding after abandoning the flow before completion.
5. THE Onboarding_Flow step 1 SHALL use the same Institution_Selector tile grid component used on
   THE Login_Page to ensure visual and behavioural consistency.

---

### Requirement 18: Dashboard Template Rendering Correctness

**User Story:** As the platform, I want each dashboard template to render only the widgets, KPI
cards, and nav links defined for its institution type, so that no module bleeds into an unintended
institution context.

#### Acceptance Criteria

1. THE Dashboard_Template renderer SHALL accept Institution_Type as its sole discriminator and SHALL
   render exactly the template registered for that type.
2. IF an unrecognised or null Institution_Type is passed to the Dashboard_Template renderer, THEN
   THE Dashboard_Template renderer SHALL render the `retail` template as the fallback, SHALL return
   an empty Nav_Profile array, and SHALL log a warning to the browser console.
3. THE Nav_Profile resolver SHALL return an empty array for any Institution_Type not present in the
   configuration map and SHALL log a warning.
4. FOR ALL valid Institution_Types, resolving the Nav_Profile and then rendering the Dashboard_Template
   SHALL produce a page that contains at least one KPI_Card and at least one sidebar navigation link
   (round-trip rendering property).
