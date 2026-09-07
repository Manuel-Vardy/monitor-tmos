import { useState, useRef, useEffect } from "react";
import { CalendarRange, Plus, Pencil, Trash2, Check, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAcademicYear, type AcademicYearEntry } from "@/contexts/academic-year-context";
import { cn } from "@/lib/utils";

// ── Inline entry form ─────────────────────────────────────────────────────────

function EntryForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: { startYear: string; endYear: string; mode: "range" | "single" };
  onSave: (start: number, end: number, mode: "range" | "single") => void;
  onCancel: () => void;
}) {
  const [mode, setMode] = useState<"range" | "single">(initial?.mode ?? "range");
  const [start, setStart] = useState(initial?.startYear ?? "");
  const [end, setEnd] = useState(initial?.endYear ?? "");
  const [err, setErr] = useState("");

  const handle = () => {
    const s = Number(start);
    const e = mode === "single" ? s : Number(end);
    if (!start || isNaN(s) || s < 2000) { setErr("Enter a valid start year (≥ 2000)"); return; }
    if (mode === "range" && (!end || isNaN(e) || e <= s)) { setErr("End year must be after start year"); return; }
    setErr("");
    onSave(s, e, mode);
  };

  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-3 space-y-3">
      <div className="flex gap-1.5">
        {(["range", "single"] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={cn("rounded-full px-3 py-1 text-xs font-semibold transition-all",
              mode === m ? "bg-[#22c55e] text-white" : "bg-secondary text-muted-foreground hover:bg-border"
            )}>
            {m === "range" ? "Year Range" : "Single Year"}
          </button>
        ))}
      </div>
      <div className={cn("grid gap-2", mode === "range" ? "grid-cols-2" : "grid-cols-1")}>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            {mode === "range" ? "Start Year" : "Year"}
          </label>
          <input type="number" min="2000" max="2100" placeholder="2026" value={start}
            onChange={(e) => { setStart(e.target.value); setErr(""); }}
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm font-mono outline-none focus:border-[#22c55e]"
          />
        </div>
        {mode === "range" && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">End Year</label>
            <input type="number" min="2000" max="2100" placeholder="2030" value={end}
              onChange={(e) => { setEnd(e.target.value); setErr(""); }}
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm font-mono outline-none focus:border-[#22c55e]"
            />
          </div>
        )}
      </div>
      {err && <p className="text-xs text-rose-600 dark:text-rose-400">{err}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          <X className="size-3.5" /> Cancel
        </Button>
        <Button type="button" size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a]" onClick={handle}>
          <Check className="size-3.5" /> Save
        </Button>
      </div>
    </div>
  );
}

// ── Option list ───────────────────────────────────────────────────────────────

function OptionList({
  entries, selectedId, selectedSingleYear, editingId, adding,
  onSelect, onSelectSingleYear, onEdit, onCancelEdit, onSaveEdit,
  onDelete, onAdd, onCancelAdd,
}: {
  entries: AcademicYearEntry[];
  selectedId: string;
  selectedSingleYear: number | null;
  editingId: string | null;
  adding: boolean;
  onSelect: (id: string) => void;
  onSelectSingleYear: (year: number) => void;
  onEdit: (id: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string, s: number, e: number, m: "range" | "single") => void;
  onDelete: (id: string) => void;
  onAdd: (s: number, e: number, m: "range" | "single") => void;
  onCancelAdd: () => void;
}) {
  // Track which range entry is expanded to show sub-year chips
  const [expandedId, setExpandedId] = useState<string | null>(
    // Auto-expand selected range entry
    selectedId !== "all" ? selectedId : null
  );

  return (
    <>
      {/* All years */}
      <button type="button" onClick={() => onSelect("all")}
        className={cn(
          "w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          selectedId === "all" ? "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30" : "hover:bg-secondary"
        )}>
        <span>All Academic Years</span>
        {selectedId === "all" && <Check className="size-4" />}
      </button>

      {/* Year entries */}
      {entries.map((entry) => {
        const isSelected = selectedId === entry.id;
        const isExpanded = expandedId === entry.id;
        const isRange = entry.mode === "range" && entry.endYear > entry.startYear;
        // Generate year chips for range entries
        const yearChips = isRange
          ? Array.from({ length: entry.endYear - entry.startYear + 1 }, (_, i) => entry.startYear + i)
          : [];

        return (
          <div key={entry.id} className="space-y-1">
            {editingId === entry.id ? (
              <EntryForm
                initial={{ startYear: String(entry.startYear), endYear: String(entry.endYear), mode: entry.mode }}
                onSave={(s, e, m) => onSaveEdit(entry.id, s, e, m)}
                onCancel={onCancelEdit}
              />
            ) : (
              <>
                {/* Main row */}
                <div className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 transition-colors",
                  isSelected && !selectedSingleYear ? "bg-[#22c55e]/10 border border-[#22c55e]/30" : "hover:bg-secondary"
                )}>
                  {/* Click label to select the full range */}
                  <button type="button" className="flex-1 flex items-center gap-2 min-w-0 text-left"
                    onClick={() => {
                      onSelect(entry.id);
                      if (isRange) setExpandedId(isExpanded ? null : entry.id);
                    }}>
                    <span className={cn("text-sm font-medium", isSelected && !selectedSingleYear && "text-[#22c55e]")}>
                      {entry.label}
                    </span>
                    <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold shrink-0",
                      entry.mode === "single"
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                    )}>
                      {entry.mode === "single" ? "Single" : "Range"}
                    </span>
                    {isSelected && !selectedSingleYear && <Check className="size-3.5 text-[#22c55e] ml-auto shrink-0" />}
                  </button>

                  {/* Expand toggle for ranges */}
                  {isRange && (
                    <button type="button"
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      className="grid size-6 place-items-center rounded-md hover:bg-border text-muted-foreground transition-colors shrink-0"
                      aria-label={isExpanded ? "Collapse" : "Expand years"}>
                      <ChevronDown className={cn("size-3.5 transition-transform", isExpanded && "rotate-180")} />
                    </button>
                  )}

                  {/* Edit / delete */}
                  <button type="button" onClick={() => onEdit(entry.id)}
                    className="grid size-6 place-items-center rounded-md hover:bg-border text-muted-foreground transition-colors shrink-0"
                    aria-label="Edit">
                    <Pencil className="size-3" />
                  </button>
                  {!entry.isDefault && (
                    <button type="button" onClick={() => onDelete(entry.id)}
                      className="grid size-6 place-items-center rounded-md hover:bg-rose-50 text-muted-foreground hover:text-rose-600 transition-colors dark:hover:bg-rose-950/40 shrink-0"
                      aria-label="Delete">
                      <Trash2 className="size-3" />
                    </button>
                  )}
                </div>

                {/* Sub-year chips */}
                {isRange && isExpanded && (
                  <div className="ml-3 flex flex-wrap gap-1.5 px-2 pb-1">
                    {yearChips.map((yr) => {
                      const isYearActive = isSelected && selectedSingleYear === yr;
                      return (
                        <button key={yr} type="button"
                          onClick={() => {
                            onSelect(entry.id);
                            onSelectSingleYear(yr);
                          }}
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all border",
                            isYearActive
                              ? "bg-[#22c55e] text-white border-[#22c55e]"
                              : "bg-secondary text-muted-foreground border-transparent hover:border-[#22c55e] hover:text-[#22c55e]"
                          )}>
                          {yr}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}

      {/* Add form */}
      {adding && (
        <EntryForm onSave={onAdd} onCancel={onCancelAdd} />
      )}
    </>
  );
}

// ── Main selector ─────────────────────────────────────────────────────────────

export function AcademicYearSelector({ className }: { className?: string }) {
  const {
    selectedId, setSelectedId,
    selectedSingleYear, setSelectedSingleYear,
    effectiveEntry, entries, addEntry, editEntry, deleteEntry,
  } = useAcademicYear();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside on desktop
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false); setAdding(false); setEditingId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Build display label
  let label = "All Years";
  if (effectiveEntry) {
    label = selectedSingleYear !== null ? `${selectedSingleYear}` : effectiveEntry.label;
  }

  const handleSelect = (id: string) => {
    setSelectedId(id);       // clears selectedSingleYear in context
  };

  const handleSelectSingleYear = (year: number) => {
    setSelectedSingleYear(year);
    setOpen(false);
    setAdding(false);
    setEditingId(null);
  };

  const optionListProps = {
    entries,
    selectedId,
    selectedSingleYear,
    editingId,
    adding,
    onSelect: handleSelect,
    onSelectSingleYear: handleSelectSingleYear,
    onEdit: (id: string) => { setEditingId(id); setAdding(false); },
    onCancelEdit: () => setEditingId(null),
    onSaveEdit: (id: string, s: number, e: number, m: "range" | "single") => {
      editEntry(id, s, e, m); setEditingId(null);
    },
    onDelete: deleteEntry,
    onAdd: (s: number, e: number, m: "range" | "single") => {
      addEntry(s, e, m); setAdding(false); setOpen(false);
    },
    onCancelAdd: () => setAdding(false),
  };

  const addFooter = !adding && !editingId && (
    <div className="px-3 py-2.5 border-t border-border shrink-0">
      <button type="button" onClick={() => { setAdding(true); setEditingId(null); }}
        className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-1.5 text-xs font-medium text-muted-foreground hover:border-[#22c55e] hover:text-[#22c55e] transition-colors">
        <Plus className="size-3.5" /> Add year range or single year
      </button>
    </div>
  );

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      {/* Trigger */}
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-xs hover:bg-secondary/50 transition-colors">
        <CalendarRange className="size-3.5 text-[#22c55e] shrink-0" />
        <span className="max-w-[120px] truncate">{label}</span>
        <ChevronDown className={cn("size-3 text-muted-foreground transition-transform shrink-0", open && "rotate-180")} />
      </button>

      {/* Desktop dropdown */}
      {open && (
        <div className="hidden lg:flex absolute right-0 top-full mt-2 z-50 w-72 flex-col rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
          style={{ maxHeight: "72vh" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div>
              <p className="text-sm font-bold">Academic Year Filter</p>
              <p className="text-xs text-muted-foreground">Select a range or drill into a single year</p>
            </div>
            <button onClick={() => { setOpen(false); setAdding(false); setEditingId(null); }}
              className="grid size-6 place-items-center rounded-full hover:bg-secondary">
              <X className="size-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
            <OptionList {...optionListProps} />
          </div>
          {addFooter}
        </div>
      )}

      {/* Mobile modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { setOpen(false); setAdding(false); setEditingId(null); }} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-card shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: "85vh" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div>
                <h2 className="text-sm font-bold">Academic Year Filter</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Select a range or drill into a single year</p>
              </div>
              <button onClick={() => { setOpen(false); setAdding(false); setEditingId(null); }}
                className="grid size-7 place-items-center rounded-full hover:bg-secondary">
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
              <OptionList {...optionListProps} />
            </div>
            {!adding && !editingId && (
              <div className="px-4 py-3 border-t border-border shrink-0">
                <button type="button" onClick={() => { setAdding(true); setEditingId(null); }}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs font-medium text-muted-foreground hover:border-[#22c55e] hover:text-[#22c55e] transition-colors">
                  <Plus className="size-3.5" /> Add year range or single year
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
