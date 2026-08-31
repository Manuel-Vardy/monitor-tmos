import { useState } from "react";

import { Button } from "@/components/ui/button";
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
  const [isCustomRangeEditorOpen, setIsCustomRangeEditorOpen] = useState(false);
  const [previousAcademicYear, setPreviousAcademicYear] = useState("all");
  const [draftStartYear, setDraftStartYear] = useState("");
  const [draftEndYear, setDraftEndYear] = useState("");

  const openCustomRangeEditor = () => {
    setPreviousAcademicYear(academicYear === "custom" ? "all" : academicYear);
    setDraftStartYear(customStartYear);
    setDraftEndYear(customEndYear);
    setAcademicYear("custom");
    setIsCustomRangeEditorOpen(true);
  };

  const closeCustomRangeEditor = () => {
    setIsCustomRangeEditorOpen(false);
    if (!customStartYear || !customEndYear) setAcademicYear(previousAcademicYear);
  };

  const saveCustomRange = () => {
    if (!draftStartYear || !draftEndYear || Number(draftStartYear) > Number(draftEndYear)) {
      return;
    }
    setCustomStartYear(draftStartYear);
    setCustomEndYear(draftEndYear);
    setAcademicYear("custom");
    setIsCustomRangeEditorOpen(false);
  };

  const hasInvalidRange =
    !draftStartYear || !draftEndYear || Number(draftStartYear) > Number(draftEndYear);

  return (
    <div className={cn("relative flex flex-wrap items-center gap-2", className)}>
      <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
        Academic Year Range:
      </span>
      <select
        value={academicYear}
        onChange={(e) => {
          const nextYear = e.target.value;
          if (nextYear === "custom") {
            openCustomRangeEditor();
            return;
          }
          setAcademicYear(nextYear);
          setIsCustomRangeEditorOpen(false);
        }}
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

      {academicYear === "custom" &&
        customStartYear &&
        customEndYear &&
        !isCustomRangeEditorOpen && (
          <button
            type="button"
            onClick={openCustomRangeEditor}
            className="rounded-md bg-secondary/60 px-2 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            {customStartYear} – {customEndYear} · Edit
          </button>
        )}

      {isCustomRangeEditorOpen && (
        <div
          role="dialog"
          aria-label="Custom academic year range"
          className="absolute right-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-border bg-card p-4 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <div className="mb-3">
            <h3 className="text-sm font-bold text-foreground">Custom Academic Year Range</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Set or edit the range used across all school pages.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Start year
              </span>
              <input
                type="number"
                min="2000"
                max="2100"
                placeholder="2026"
                value={draftStartYear}
                onChange={(e) => setDraftStartYear(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm font-mono text-foreground outline-none focus:ring-1 focus:ring-accent"
              />
            </label>
            <label className="space-y-1">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                End year
              </span>
              <input
                type="number"
                min="2000"
                max="2100"
                placeholder="2030"
                value={draftEndYear}
                onChange={(e) => setDraftEndYear(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm font-mono text-foreground outline-none focus:ring-1 focus:ring-accent"
              />
            </label>
          </div>

          {draftStartYear && draftEndYear && Number(draftStartYear) > Number(draftEndYear) && (
            <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">
              The end year must be later than the start year.
            </p>
          )}

          <div className="mt-4 flex justify-end gap-2 border-t border-border pt-3">
            <Button type="button" variant="outline" size="sm" onClick={closeCustomRangeEditor}>
              Cancel
            </Button>
            <Button type="button" size="sm" disabled={hasInvalidRange} onClick={saveCustomRange}>
              Save range
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
