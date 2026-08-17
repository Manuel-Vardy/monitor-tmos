import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  format,
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
} from "date-fns";
import { CalendarDays, ChevronDown } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Preset = {
  label: string;
  range: () => DateRange;
};

const PRESETS: Preset[] = [
  {
    label: "Last 7 days",
    range: () => ({ from: subDays(new Date(), 6), to: new Date() }),
  },
  {
    label: "Last 14 days",
    range: () => ({ from: subDays(new Date(), 13), to: new Date() }),
  },
  {
    label: "Last 30 days",
    range: () => ({ from: subDays(new Date(), 29), to: new Date() }),
  },
  {
    label: "Last 60 days",
    range: () => ({ from: subDays(new Date(), 59), to: new Date() }),
  },
  {
    label: "Last 90 days",
    range: () => ({ from: subDays(new Date(), 89), to: new Date() }),
  },
  {
    label: "This month",
    range: () => ({ from: startOfMonth(new Date()), to: new Date() }),
  },
  {
    label: "Last month",
    range: () => ({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    }),
  },
  {
    label: "This quarter",
    range: () => ({ from: startOfQuarter(new Date()), to: new Date() }),
  },
  {
    label: "Last quarter",
    range: () => ({
      from: startOfQuarter(subMonths(new Date(), 3)),
      to: endOfQuarter(subMonths(new Date(), 3)),
    }),
  },
  {
    label: "This year",
    range: () => ({ from: startOfYear(new Date()), to: new Date() }),
  },
];

function toInputDate(d: Date | undefined): string {
  if (!d) return "";
  return format(d, "yyyy-MM-dd");
}

export function DateRangePicker({
  value,
  onChange,
  className,
}: {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<string>("Last 30 days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // determine trigger label
  const triggerLabel = value?.from
    ? value.to && value.from.toDateString() !== value.to.toDateString()
      ? activePreset !== ""
        ? activePreset
        : `${format(value.from, "dd MMM yyyy")} – ${format(value.to, "dd MMM yyyy")}`
      : format(value.from, "dd MMM yyyy")
    : "Last 30 days";

  function applyPreset(preset: Preset) {
    const range = preset.range();
    setActivePreset(preset.label);
    setCustomStart("");
    setCustomEnd("");
    onChange(range);
    setOpen(false);
  }

  function applyCustomRange() {
    if (!customStart || !customEnd) return;
    const from = new Date(customStart);
    const to = new Date(customEnd);
    if (from > to) return;
    setActivePreset("");
    onChange({ from, to });
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all shadow-xs cursor-pointer",
            value?.from
              ? "bg-[#22c55e]/15 text-[#166534] dark:bg-[#22c55e]/20 dark:text-[#4ade80]"
              : "bg-card text-foreground hover:bg-secondary",
            className,
          )}
        >
          <CalendarDays className="size-3.5" />
          {triggerLabel}
          <ChevronDown className="size-3 opacity-60" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[calc(100vw-2rem)] max-w-[480px] p-0 shadow-lg"
        align="end"
        sideOffset={8}
      >
        <div className="flex flex-col divide-y divide-border sm:flex-row sm:divide-x sm:divide-y-0">
          {/* ── Presets ─────────────────────────── */}
          <div className="flex flex-col py-3 sm:w-[180px]">
            <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Presets
            </p>
            {/* On mobile: horizontal scrolling pill row; on sm+: vertical list */}
            <div className="flex gap-2 overflow-x-auto px-4 pb-1 sm:hidden">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
                    activePreset === preset.label
                      ? "border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e] font-semibold"
                      : "border-border bg-card text-foreground hover:bg-secondary",
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="hidden sm:flex sm:flex-col overflow-y-auto max-h-[280px]">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  className={cn(
                    "px-4 py-2 text-left text-sm transition-colors hover:bg-secondary",
                    activePreset === preset.label
                      ? "font-semibold text-[#22c55e]"
                      : "text-foreground",
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Custom Range ────────────────────── */}
          <div className="flex flex-1 flex-col gap-3 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Custom Range
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-1 sm:gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStart}
                  max={customEnd || toInputDate(new Date())}
                  onChange={(e) => {
                    setCustomStart(e.target.value);
                    setActivePreset("");
                  }}
                  className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEnd}
                  min={customStart}
                  max={toInputDate(new Date())}
                  onChange={(e) => {
                    setCustomEnd(e.target.value);
                    setActivePreset("");
                  }}
                  className="h-9 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-[#22c55e]"
                />
              </div>
            </div>

            <button
              onClick={applyCustomRange}
              disabled={!customStart || !customEnd}
              className={cn(
                "mt-auto h-10 w-full rounded-lg text-sm font-semibold transition-colors",
                customStart && customEnd
                  ? "bg-foreground text-background hover:bg-foreground/85 cursor-pointer"
                  : "bg-secondary text-muted-foreground cursor-not-allowed",
              )}
            >
              Apply Custom Range
            </button>

            {value?.from && (
              <button
                onClick={() => {
                  onChange(undefined);
                  setActivePreset("Last 30 days");
                  setCustomStart("");
                  setCustomEnd("");
                  setOpen(false);
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
              >
                Clear selection
              </button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
