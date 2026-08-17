import { cn } from "@/lib/utils";

type Tone = "good" | "pending" | "bad" | "warn" | "neutral";

const toneMap: Record<Tone, string> = {
  good: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  bad: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
  warn: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  neutral: "bg-secondary text-foreground border-border",
};

const dotMap: Record<Tone, string> = {
  good: "bg-emerald-500",
  pending: "bg-amber-500",
  bad: "bg-red-500",
  warn: "bg-amber-500",
  neutral: "bg-muted-foreground",
};

/** Status pill. Never relies on colour alone — always carries a label + glyph. */
export function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        toneMap[tone],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dotMap[tone])} aria-hidden />
      {children}
    </span>
  );
}

export const payTone: Record<string, Tone> = {
  settled: "good",
  confirmed: "good",
  paid: "good",
  delivered: "good",
  pending: "pending",
  sent: "pending",
  draft: "pending",
  ready: "pending",
  viewed: "pending",
  "in-transit": "pending",
  failed: "bad",
  overdue: "bad",
  delayed: "bad",
};
