import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  Bell,
  ChevronDown,
  Lock,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { useBranches } from "@/lib/branches-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInstitution } from "@/hooks/use-institution";
import { resolveNavProfile } from "@/lib/nav-profiles";
import { InstitutionSwitcher } from "@/components/institution-switcher";
import { AcademicYearSelector } from "@/components/academic-year-selector";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

export function Wordmark({ className }: { className?: string }) {
  return (
    <img
      src="/Trite-WB.png"
      alt="Trite logo"
      className={cn("h-7 w-auto object-contain", className)}
    />
  );
}

/** Compact green logo used in the mobile top bar */
function MobileLogo({ className }: { className?: string }) {
  return (
    <img
      src="/tritee-logo.png"
      alt="Trite"
      className={cn("h-7 w-auto object-contain", className)}
    />
  );
}

function BranchSwitcher() {
  const { branches } = useBranches();
  const [current, setCurrent] = useState(branches[0]!);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-left text-sm transition-colors hover:bg-secondary shadow-xs">
        <Building2 className="size-4 text-muted-foreground" />
        <span className="hidden sm:block">
          <span className="block leading-tight font-medium">{current.name}</span>
          <span className="block text-[11px] leading-tight text-muted-foreground">
            {current.city}
          </span>
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Branch context</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {branches.map((b) => (
          <DropdownMenuItem key={b.id} onSelect={() => setCurrent(b)} className="gap-2">
            <span
              className={cn(
                "size-1.5 rounded-full",
                b.id === current.id ? "bg-accent" : "bg-border",
              )}
            />
            <span className="flex-1">{b.name}</span>
            <span className="text-xs text-muted-foreground">{b.city}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const { institutionType, linkedAccounts, accountId, setInstitution } = useInstitution();
  const navProfile = resolveNavProfile(institutionType);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  // Track collapsed state per section group — all expanded by default
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggleSection = (group: string) =>
    setCollapsed((prev) => ({ ...prev, [group]: !prev[group] }));

  function handleLogout() {
    localStorage.removeItem("tmos_session_v1");
    navigate({ to: "/login" });
  }

  // Mobile bottom-nav: 5 priority items (Dashboard, 3 key operational tabs, and Settings as 5th tab)
  const allPriorityItems = navProfile
    .flatMap((g) => g.items)
    .filter((i) => i.priority !== undefined)
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));

  const bottomNavItems = allPriorityItems.slice(0, 5);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-16 items-center px-5 text-sidebar-accent-foreground">
          <Wordmark />
        </div>
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
          {navProfile.map((section) => {
            const isCollapsed = !!collapsed[section.group];
            return (
              <div key={section.group}>
                <button
                  onClick={() => toggleSection(section.group)}
                  className="flex w-full items-center justify-between px-2 pb-2 group"
                >
                  <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-white">
                    {section.group}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-3 text-white/60 transition-transform duration-200",
                      isCollapsed ? "-rotate-90" : "rotate-0",
                    )}
                  />
                </button>
                {!isCollapsed && (
                  <ul className="space-y-0.5">
                    {section.items.map((item) => {
                      const active = pathname === item.to;
                      return (
                        <li key={item.to}>
                          {item.locked ? (
                            <span
                              className="group flex items-center gap-3 rounded-md px-2.5 py-2 text-[13px] opacity-40 cursor-not-allowed select-none"
                              title="Coming soon"
                            >
                              <item.icon className="size-4 shrink-0" />
                              <span className="flex-1">{item.label}</span>
                              <Lock className="size-3 shrink-0" />
                            </span>
                          ) : (
                            <Link
                              to={item.to}
                              className={cn(
                                "group flex items-center gap-3 rounded-md px-2.5 py-2 text-[13px] transition-colors",
                                active
                                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                                  : "hover:bg-sidebar-accent/60",
                              )}
                            >
                              <item.icon className="size-4 shrink-0 opacity-80" />
                              <span className="flex-1">{item.label}</span>
                              {active && <span className="size-1.5 rounded-full bg-sidebar-primary" />}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            <div className="grid size-8 place-items-center rounded-full bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">
              ES
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-accent-foreground">
                Efua Sarpong
              </p>
              <p className="truncate text-[11px] opacity-60">Owner · Sarpong Retail Ltd</p>
            </div>
          </div>
          <button
            onClick={() => setLogoutOpen(true)}
            className="mt-1 flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-red-400"
          >
            <LogOut className="size-4 shrink-0" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 bg-background/85 backdrop-blur shadow-xs">
          {/* ── Mobile top bar: logo on left, hamburger menu at the far right ── */}
          <div className="flex h-14 items-center justify-between px-4 lg:hidden">
            <MobileLogo className="h-7 shrink-0" />
            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setMenuOpen(true)}
              className="grid size-9 shrink-0 place-items-center rounded-lg bg-card border border-border/50 text-foreground transition-colors hover:bg-secondary active:scale-95 shadow-xs"
            >
              <Menu className="size-5" />
            </button>
          </div>

          {/* ── Desktop bar ── */}
          <div className="hidden h-16 items-center gap-3 px-6 lg:flex">
            {institutionType !== "school" && <BranchSwitcher />}
            {linkedAccounts.length > 1 && (
              <InstitutionSwitcher
                accounts={linkedAccounts}
                activeAccountId={accountId ?? ""}
                onSwitch={(account) =>
                  setInstitution(account.institutionType, account.accountId)
                }
              />
            )}
            {/* Page title + subtitle inline */}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold leading-tight">{title}</h1>
              {subtitle && (
                <p className="truncate text-[11px] text-muted-foreground leading-tight">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {institutionType === "school" && <AcademicYearSelector />}
              <button className="relative grid size-9 place-items-center rounded-md border border-border bg-card transition-colors hover:bg-secondary">
                <Bell className="size-4" />
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-accent" />
              </button>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          </div>
        </header>

        <main className="flex-1 lg:px-6">
          {/* ── Mobile page header (scrolls with content) ── */}
          <div className="px-4 pt-4 pb-2 lg:hidden">
            <h1 className="text-lg font-bold leading-tight">{title}</h1>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{subtitle}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {institutionType !== "school" && <BranchSwitcher />}
                {linkedAccounts.length > 1 && (
                  <InstitutionSwitcher
                    accounts={linkedAccounts}
                    activeAccountId={accountId ?? ""}
                    onSwitch={(account) =>
                      setInstitution(account.institutionType, account.accountId)
                    }
                  />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {institutionType === "school" && <AcademicYearSelector />}
                {actions && (
                  <div className="flex flex-wrap items-center gap-2">{actions}</div>
                )}
              </div>
            </div>
          </div>

          {/* Page content */}
          <div className="px-4 py-4 lg:py-6">{children}</div>
        </main>

        {/* ── Mobile Bottom Navigation: 5 tabs (Ending with Settings) ── */}
        <nav className="sticky bottom-0 z-30 flex items-center justify-around border-t border-border bg-card px-1 py-1.5 lg:hidden">
          {bottomNavItems.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 rounded-lg py-1.5 px-0.5 text-[10px] font-medium transition-colors min-w-0",
                  active
                    ? "text-accent bg-accent/10 font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className={cn("size-5 shrink-0", active && "text-accent")} />
                <span className="truncate max-w-[56px] text-center leading-none">
                  {item.label.split(" / ")[0].split(" & ")[0]}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* ── Animated Mobile Hamburger Drawer (Full Navigation Menu) ── */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetContent
            side="right"
            className="w-[82%] max-w-xs p-0 flex flex-col bg-card border-l border-border shadow-2xl transition-all duration-300 ease-out"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <MobileLogo className="h-6 shrink-0" />
                <SheetTitle className="sr-only">Navigation</SheetTitle>
              </div>
            </div>

            {/* All nav sections */}
            <div className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
              {navProfile.map((section) => {
                const isCollapsed = !!collapsed[section.group];
                return (
                  <div key={section.group}>
                    <button
                      onClick={() => toggleSection(section.group)}
                      className="flex w-full items-center justify-between px-2 pb-1.5"
                    >
                      <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-foreground">
                        {section.group}
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-3 text-foreground/50 transition-transform duration-200",
                          isCollapsed ? "-rotate-90" : "rotate-0",
                        )}
                      />
                    </button>
                    {!isCollapsed && (
                      <ul className="space-y-0.5">
                        {section.items.map((item) => {
                          const active = pathname === item.to;
                          return (
                            <li key={item.to}>
                              <Link
                                to={item.to}
                                onClick={() => setMenuOpen(false)}
                                className={cn(
                                  "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors",
                                  active
                                    ? "bg-accent/15 font-medium text-accent"
                                    : "hover:bg-secondary text-foreground/90",
                                )}
                              >
                                <item.icon className="size-4 shrink-0 opacity-80" />
                                <span className="flex-1">{item.label}</span>
                                {active && <span className="size-1.5 rounded-full bg-accent" />}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>

            {/* User profile & Logout */}
            <div className="border-t border-border p-3 bg-muted/20">
              <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
                <div className="grid size-8 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  ES
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">
                    Efua Sarpong
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">Owner · Sarpong Ltd</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setLogoutOpen(true);
                }}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-red-500"
              >
                <LogOut className="size-4 shrink-0" />
                <span>Log out</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>
        {/* ── Logout confirmation dialog ── */}
        <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LogOut className="size-4 text-red-500" />
                Log out
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to log out?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-2 flex gap-2 sm:flex-row">
              <button
                onClick={() => setLogoutOpen(false)}
                className="flex-1 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Yes, log out
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
