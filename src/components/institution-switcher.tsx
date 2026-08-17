import { Check, ChevronDown } from "lucide-react";

import { type LinkedAccount } from "@/contexts/institution-context";
import { INSTITUTION_META } from "@/lib/institution-config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface InstitutionSwitcherProps {
  accounts: LinkedAccount[];
  activeAccountId: string;
  onSwitch: (account: LinkedAccount) => void;
}

export function InstitutionSwitcher({
  accounts,
  activeAccountId,
  onSwitch,
}: InstitutionSwitcherProps) {
  const activeAccount = accounts.find((a) => a.accountId === activeAccountId);
  const ActiveIcon = activeAccount
    ? INSTITUTION_META[activeAccount.institutionType].icon
    : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-left text-sm transition-colors hover:bg-secondary">
        {ActiveIcon && <ActiveIcon className="size-4 shrink-0 text-muted-foreground" />}
        <span className="hidden max-w-[10rem] truncate sm:block font-medium">
          {activeAccount?.displayName ?? "Switch account"}
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Linked accounts</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {accounts.map((account) => {
          const { icon: Icon } = INSTITUTION_META[account.institutionType];
          const isActive = account.accountId === activeAccountId;

          return (
            <DropdownMenuItem
              key={account.accountId}
              onSelect={() => onSwitch(account)}
              className={cn("gap-2", isActive && "font-medium")}
            >
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate">{account.displayName}</span>
              {isActive && <Check className="size-4 shrink-0 text-accent" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
