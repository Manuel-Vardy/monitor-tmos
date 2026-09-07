/**
 * AppSelect — drop-in replacement for native <select> elements.
 * Uses Radix UI Select under the hood for fully custom styling.
 *
 * Usage:
 *   <AppSelect value={val} onChange={setVal} options={[
 *     { value: "all", label: "All" },
 *     { value: "Tithe", label: "Tithe" },
 *   ]} />
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface AppSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface AppSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: AppSelectOption[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

export function AppSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  className,
  triggerClassName,
}: AppSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("h-9 text-xs font-semibold", triggerClassName)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={cn("min-w-[10rem]", className)}>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
