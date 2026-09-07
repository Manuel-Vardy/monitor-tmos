import React, { createContext, useContext, useState, useMemo } from "react";
import { DEFAULT_ACADEMIC_YEAR_RANGES, SCHOOL_STUDENTS, getStudentYearRange, type Student } from "@/lib/school-data";

export type YearFilterMode = "all" | "range" | "single";

export interface AcademicYearEntry {
  id: string;
  label: string;
  startYear: number;
  endYear: number;
  mode: "range" | "single";
  isDefault: boolean;
}

interface AcademicYearContextValue {
  selectedId: string;          // "all" | entry.id
  setSelectedId: (id: string) => void;
  selectedSingleYear: number | null;  // when drilling into a range
  setSelectedSingleYear: (year: number | null) => void;
  effectiveEntry: AcademicYearEntry | null;

  entries: AcademicYearEntry[];
  addEntry: (startYear: number, endYear: number, mode: "range" | "single") => void;
  editEntry: (id: string, startYear: number, endYear: number, mode: "range" | "single") => void;
  deleteEntry: (id: string) => void;

  filterStudentsByYear: (students: Student[]) => Student[];

  // ── Backward-compat shims for reports.tsx / students.tsx ──
  academicYear: string;
  setAcademicYear: (val: string) => void;
  customStartYear: string;
  setCustomStartYear: (val: string) => void;
  customEndYear: string;
  setCustomEndYear: (val: string) => void;
  availableYearRanges: string[];
  effectiveYearRange: string | null;
}

const AcademicYearContext = createContext<AcademicYearContextValue | null>(null);

const STORAGE_KEY_ENTRIES = "tmos_academic_year_entries";
const STORAGE_KEY_SELECTED = "tmos_academic_year_selected";

function makeLabel(startYear: number, endYear: number, mode: "range" | "single") {
  return mode === "single" ? `${startYear}` : `${startYear} – ${endYear}`;
}

function loadEntries(): AcademicYearEntry[] {
  // Build default entries from DEFAULT_ACADEMIC_YEAR_RANGES
  const defaults: AcademicYearEntry[] = DEFAULT_ACADEMIC_YEAR_RANGES.map((yr) => {
    const parts = yr.split(/[\s–\-]+/).map(Number).filter(Boolean);
    const start = parts[0] ?? 2026;
    const end = parts[1] ?? start;
    const mode: "range" | "single" = end !== start ? "range" : "single";
    return {
      id: `default-${yr}`,
      label: makeLabel(start, end, mode),
      startYear: start,
      endYear: end,
      mode,
      isDefault: true,
    };
  });

  // Also derive from student data
  const extra = new Set<string>();
  SCHOOL_STUDENTS.forEach((s) => {
    const yr = getStudentYearRange(s);
    if (yr) extra.add(yr);
  });
  const defaultIds = new Set(defaults.map((d) => d.label));
  const extraEntries: AcademicYearEntry[] = [];
  extra.forEach((yr) => {
    if (!defaultIds.has(yr)) {
      const parts = yr.split(/[\s–\-]+/).map(Number).filter(Boolean);
      const start = parts[0] ?? 2026;
      const end = parts[1] ?? start;
      const mode: "range" | "single" = end !== start ? "range" : "single";
      extraEntries.push({
        id: `derived-${yr}`,
        label: makeLabel(start, end, mode),
        startYear: start,
        endYear: end,
        mode,
        isDefault: true,
      });
    }
  });

  // Load user-added entries from localStorage
  let userEntries: AcademicYearEntry[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ENTRIES);
      if (raw) userEntries = JSON.parse(raw);
    } catch {}
  }

  // Merge: defaults first, then user-added (dedup by label)
  const seen = new Set<string>();
  const all = [...defaults, ...extraEntries, ...userEntries];
  return all.filter((e) => {
    if (seen.has(e.label)) return false;
    seen.add(e.label);
    return true;
  });
}

function saveUserEntries(entries: AcademicYearEntry[]) {
  if (typeof window === "undefined") return;
  const userOnly = entries.filter((e) => !e.isDefault);
  try { localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(userOnly)); } catch {}
}

export function AcademicYearProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<AcademicYearEntry[]>(() => loadEntries());
  const [selectedId, setSelectedIdState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try { return localStorage.getItem(STORAGE_KEY_SELECTED) ?? "all"; } catch {}
    }
    return "all";
  });
  const [selectedSingleYear, setSelectedSingleYearState] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const v = localStorage.getItem("tmos_academic_single_year");
        return v ? Number(v) : null;
      } catch {}
    }
    return null;
  });

  const setSelectedId = (id: string) => {
    setSelectedIdState(id);
    // Clear single-year drill when switching to a new range
    setSelectedSingleYearState(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_SELECTED, id);
        localStorage.removeItem("tmos_academic_single_year");
      } catch {}
    }
  };

  const setSelectedSingleYear = (year: number | null) => {
    setSelectedSingleYearState(year);
    if (typeof window !== "undefined") {
      try {
        if (year == null) localStorage.removeItem("tmos_academic_single_year");
        else localStorage.setItem("tmos_academic_single_year", String(year));
      } catch {}
    }
  };

  // ── Backward-compat shim state ──
  const [customStartYear, setCustomStartYear] = useState<string>("");
  const [customEndYear, setCustomEndYear] = useState<string>("");

  // Shim: academicYear mirrors selectedId for old consumers
  const academicYear = selectedId;
  const setAcademicYear = setSelectedId;

  const availableYearRanges = useMemo(
    () => entries.map((e) => e.label),
    [entries]
  );

  const addEntry = (startYear: number, endYear: number, mode: "range" | "single") => {
    const label = makeLabel(startYear, endYear, mode);
    if (entries.some((e) => e.label === label)) return; // no duplicates
    const newEntry: AcademicYearEntry = {
      id: `user-${Date.now()}`,
      label,
      startYear,
      endYear: mode === "single" ? startYear : endYear,
      mode,
      isDefault: false,
    };
    const updated = [...entries, newEntry];
    setEntries(updated);
    saveUserEntries(updated);
    setSelectedId(newEntry.id);
  };

  const editEntry = (id: string, startYear: number, endYear: number, mode: "range" | "single") => {
    const label = makeLabel(startYear, endYear, mode);
    const updated = entries.map((e) =>
      e.id === id ? { ...e, label, startYear, endYear: mode === "single" ? startYear : endYear, mode } : e
    );
    setEntries(updated);
    saveUserEntries(updated);
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    saveUserEntries(updated);
    if (selectedId === id) setSelectedId("all");
  };

  const effectiveEntry = useMemo(
    () => entries.find((e) => e.id === selectedId) ?? null,
    [entries, selectedId]
  );

  const effectiveYearRange = useMemo(() => {
    if (!effectiveEntry) return null;
    return effectiveEntry.label;
  }, [effectiveEntry]);

  const filterStudentsByYear = useMemo(() => {
    return (studentList: Student[]) => {
      if (!effectiveEntry) return studentList;
      return studentList.filter((s) => {
        const yr = getStudentYearRange(s);
        if (!yr) return false;
        // Drill-down: filter by single year within a range
        if (selectedSingleYear !== null) {
          const parts = yr.split(/[\s–\-]+/).map(Number).filter(Boolean);
          return parts.some((p) => p === selectedSingleYear) ||
            (parts.length >= 2 && parts[0]! <= selectedSingleYear && selectedSingleYear <= parts[1]!);
        }
        if (effectiveEntry.mode === "single") {
          const parts = yr.split(/[\s–\-]+/).map(Number).filter(Boolean);
          return parts.includes(effectiveEntry.startYear);
        }
        return yr === effectiveEntry.label;
      });
    };
  }, [effectiveEntry, selectedSingleYear]);

  const value = useMemo<AcademicYearContextValue>(
    () => ({
      selectedId,
      setSelectedId,
      selectedSingleYear,
      setSelectedSingleYear,
      effectiveEntry,
      entries,
      addEntry,
      editEntry,
      deleteEntry,
      filterStudentsByYear,
      // shims
      academicYear,
      setAcademicYear,
      customStartYear,
      setCustomStartYear,
      customEndYear,
      setCustomEndYear,
      availableYearRanges,
      effectiveYearRange,
    }),
    [selectedId, selectedSingleYear, effectiveEntry, entries, filterStudentsByYear,
     customStartYear, customEndYear, availableYearRanges, effectiveYearRange]
  );

  return <AcademicYearContext.Provider value={value}>{children}</AcademicYearContext.Provider>;
}

export function useAcademicYear(): AcademicYearContextValue {
  const ctx = useContext(AcademicYearContext);
  if (!ctx) {
    return {
      selectedId: "all",
      setSelectedId: () => {},
      selectedSingleYear: null,
      setSelectedSingleYear: () => {},
      effectiveEntry: null,
      entries: [],
      addEntry: () => {},
      editEntry: () => {},
      deleteEntry: () => {},
      filterStudentsByYear: (s) => s,
      // shims
      academicYear: "all",
      setAcademicYear: () => {},
      customStartYear: "",
      setCustomStartYear: () => {},
      customEndYear: "",
      setCustomEndYear: () => {},
      availableYearRanges: [...DEFAULT_ACADEMIC_YEAR_RANGES],
      effectiveYearRange: null,
    };
  }
  return ctx;
}
