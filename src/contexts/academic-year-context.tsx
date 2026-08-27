import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { DEFAULT_ACADEMIC_YEAR_RANGES, SCHOOL_STUDENTS, getStudentYearRange, type Student } from "@/lib/school-data";

interface AcademicYearContextValue {
  academicYear: string; // "all" | "2026 - 2029" | ... | "custom"
  setAcademicYear: (val: string) => void;
  customStartYear: string;
  setCustomStartYear: (val: string) => void;
  customEndYear: string;
  setCustomEndYear: (val: string) => void;
  availableYearRanges: string[];
  effectiveYearRange: string | null; // null if "all", or "2026 - 2029"
  filterStudentsByYear: (students: Student[]) => Student[];
}

const AcademicYearContext = createContext<AcademicYearContextValue | null>(null);

const STORAGE_KEY = "tmos_academic_year_range";

export function AcademicYearProvider({ children }: { children: React.ReactNode }) {
  const [academicYear, setAcademicYearState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return saved;
      } catch {}
    }
    return "all";
  });

  const [customStartYear, setCustomStartYear] = useState<string>("");
  const [customEndYear, setCustomEndYear] = useState<string>("");

  const setAcademicYear = (val: string) => {
    setAcademicYearState(val);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, val);
      } catch {}
    }
  };

  const availableYearRanges = useMemo(() => {
    const set = new Set<string>();
    DEFAULT_ACADEMIC_YEAR_RANGES.forEach((yr) => set.add(yr));
    SCHOOL_STUDENTS.forEach((s) => {
      const yr = getStudentYearRange(s);
      if (yr) set.add(yr);
    });
    return Array.from(set).sort().reverse();
  }, []);

  const effectiveYearRange = useMemo(() => {
    if (academicYear === "all") return null;
    if (academicYear === "custom") {
      if (customStartYear.trim() && customEndYear.trim()) {
        return `${customStartYear.trim()} - ${customEndYear.trim()}`;
      }
      return null;
    }
    return academicYear;
  }, [academicYear, customStartYear, customEndYear]);

  const filterStudentsByYear = useMemo(() => {
    return (studentList: Student[]) => {
      if (!effectiveYearRange) return studentList;
      return studentList.filter((s) => getStudentYearRange(s) === effectiveYearRange);
    };
  }, [effectiveYearRange]);

  const value = useMemo<AcademicYearContextValue>(
    () => ({
      academicYear,
      setAcademicYear,
      customStartYear,
      setCustomStartYear,
      customEndYear,
      setCustomEndYear,
      availableYearRanges,
      effectiveYearRange,
      filterStudentsByYear,
    }),
    [
      academicYear,
      customStartYear,
      customEndYear,
      availableYearRanges,
      effectiveYearRange,
      filterStudentsByYear,
    ]
  );

  return <AcademicYearContext.Provider value={value}>{children}</AcademicYearContext.Provider>;
}

export function useAcademicYear(): AcademicYearContextValue {
  const context = useContext(AcademicYearContext);
  if (!context) {
    // Return a safe fallback if used outside provider
    return {
      academicYear: "all",
      setAcademicYear: () => {},
      customStartYear: "",
      setCustomStartYear: () => {},
      customEndYear: "",
      setCustomEndYear: () => {},
      availableYearRanges: [...DEFAULT_ACADEMIC_YEAR_RANGES],
      effectiveYearRange: null,
      filterStudentsByYear: (s) => s,
    };
  }
  return context;
}
