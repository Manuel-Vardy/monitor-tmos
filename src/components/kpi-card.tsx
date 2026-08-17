import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface KpiCardProps {
  label: string;
  value: string | number;
  /** Percentage change vs previous period. Positive = up (green), negative = down (red). */
  delta?: number;
  sub: string;
  icon: LucideIcon;
  "data-testid"?: string;
}

export function KpiCard({
  label,
  value,
  delta,
  sub,
  icon: Icon,
  "data-testid": testId = "kpi-card",
}: KpiCardProps) {
  const hasDelta = delta !== undefined;
  const isPositive = hasDelta && delta >= 0;

  return (
    <Card
      data-testid={testId}
      className="relative flex flex-col gap-2 p-3 sm:gap-3 sm:p-5 overflow-hidden"
    >
      {/* Icon — top-right corner */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 grid size-7 sm:size-9 place-items-center rounded-lg bg-muted">
        <Icon className="size-4 sm:size-5 text-muted-foreground" />
      </div>

      {/* Label */}
      <p className="text-[10px] sm:text-sm font-medium text-muted-foreground pr-8 sm:pr-12 leading-tight uppercase tracking-wide">{label}</p>

      {/* Value */}
      <p className="text-base sm:text-3xl font-bold tracking-tight text-foreground leading-tight">{value}</p>

      {/* Delta indicator */}
      {hasDelta && (
        <div
          className={cn(
            "inline-flex items-center gap-1 text-[10px] sm:text-sm font-medium",
            isPositive ? "text-emerald-600" : "text-red-500",
          )}
        >
          {isPositive ? (
            <TrendingUp className="size-3 sm:size-4 shrink-0" />
          ) : (
            <TrendingDown className="size-3 sm:size-4 shrink-0" />
          )}
          <span>
            {isPositive ? "+" : ""}
            {delta}%
          </span>
        </div>
      )}

      {/* Sub text */}
      <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{sub}</p>
    </Card>
  );
}
