import React from "react";
import { useAcademicYear } from "@/contexts/academic-year-context";
import { cn } from "@/lib/utils";

export function AcademicYearSelector({ className }: { className?: string }) {
  const {
    academicYear,
    setAcademicYear,
    customStartYear,
    setCustomStartYear,
    customEndYear,
    setCustomEndYear,
    availableYearRanges,
  } = useAcademicYear();

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
        Academic Year Range:
      </span>
      <select
        value={academicYear}
        onChange={(e) => setAcademicYear(e.target.value)}
        className="h-8.5 px-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-accent shadow-2xs hover:bg-secondary/40 transition-colors cursor-pointer"
        aria-label="Select Academic Year Range"
      >
        <option value="all">All Academic Years</option>
        {availableYearRanges.map((yr) => (
          <option key={yr} value={yr}>
            {yr}
          </option>
        ))}
        <option value="custom">Type Custom Year Range...</option>
      </select>

      {academicYear === "custom" && (
        <div className="flex items-center gap-1.5 rounded-lg bg-secondary/40 border border-border px-2 py-0.5 animate-in fade-in duration-150">
          <input
            type="number"
            placeholder="Start (2026)"
            value={customStartYear}
            onChange={(e) => setCustomStartYear(e.target.value)}
            className="w-20 h-6 text-xs px-1.5 rounded border border-border bg-background text-foreground outline-none font-mono"
          />
          <span className="text-xs text-muted-foreground font-bold">–</span>
          <input
            type="number"
            placeholder="End (2030)"
            value={customEndYear}
            onChange={(e) => setCustomEndYear(e.target.value)}
            className="w-20 h-6 text-xs px-1.5 rounded border border-border bg-background text-foreground outline-none font-mono"
          />
        </div>
      )}
    </div>
  );
}
