import { useState } from "react";
import { Edit, X, TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: number;
  sub?: string;
  icon: LucideIcon;
  onEditLabel?: (newLabel: string) => void;
  "data-testid"?: string;
}

export function KpiCard({
  label,
  value,
  delta,
  sub,
  icon: Icon,
  onEditLabel,
  "data-testid": testId = "kpi-card",
}: KpiCardProps) {
  const hasDelta = delta !== undefined;
  const isPositive = hasDelta && delta >= 0;
  const [editOpen, setEditOpen] = useState(false);
  const [draftLabel, setDraftLabel] = useState(label);

  const handleSave = () => {
    if (draftLabel.trim() && onEditLabel) {
      onEditLabel(draftLabel.trim());
      setEditOpen(false);
    }
  };

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
      <p className="text-[11px] sm:text-xs font-bold text-foreground pr-8 sm:pr-12 leading-tight uppercase tracking-wider">{label}</p>

      {/* Value */}
      <p className="text-base sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">{value}</p>

      {/* Delta indicator */}
      {hasDelta && (
        <div
          className={cn(
            "inline-flex items-center gap-1 text-[10px] sm:text-sm font-semibold",
            isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
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

  {sub && (
    <p className="text-[11px] sm:text-xs font-semibold text-foreground/90 leading-tight">{sub}</p>
  )}

      {onEditLabel && (
        <button
          onClick={() => setEditOpen(true)}
          className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 grid size-6 place-items-center rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label={`Edit ${label} label`}
        >
          <Edit className="size-3 sm:size-3.5" />
        </button>
      )}

      {onEditLabel && editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setEditOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-card shadow-2xl border border-border p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setEditOpen(false)}
              className="absolute top-4 right-4 grid size-7 place-items-center rounded-full hover:bg-secondary transition-colors"
              aria-label="Close"
            >
              <X className="size-4 text-muted-foreground" />
            </button>
            <h3 className="text-lg font-bold mb-4 text-foreground">Edit Card Label</h3>
            <input
              type="text"
              value={draftLabel}
              onChange={(e) => setDraftLabel(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
                if (e.key === "Escape") setEditOpen(false);
              }}
            />
            <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
              <button
                onClick={() => setEditOpen(false)}
                className="px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!draftLabel.trim()}
                className={cn(
                  "px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors",
                  draftLabel.trim()
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-muted text-muted-foreground cursor-not-allowed",
                )}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
