import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useRef } from "react";
import type { DateRange } from "react-day-picker";
import {
  GraduationCap,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  Users,
  ArrowUpDown,
  X,
  Building2,
  FolderPlus,
  Upload,
  Download,
  FileDown,
  FileSpreadsheet,
  LayoutGrid,
  Table as TableIcon,
  RotateCcw,
  Check,
  Calendar,
  Sparkles,
  Layers,
  Laptop,
  Briefcase,
  BookOpen,
  Palette,
  Landmark,
  ArrowRight,
  ChevronLeft,
  Coins,
  Pencil,
  Banknote,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useAcademicYear } from "@/contexts/academic-year-context";
import { DateRangePicker } from "@/components/date-range-picker";
import { currency } from "@/lib/mos-data";
import {
  SCHOOL_STUDENTS,
  SCHOOL_SUMMARY,
  FEE_TRANSACTIONS,
  DEFAULT_FEE_TYPES,
  DEFAULT_ACADEMIC_YEAR_RANGES,
  getStudentYearRange,
  type Student,
  type FeeTransaction,
  type FeeType,
} from "@/lib/school-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/students")({
  head: () => ({
    meta: [
      { title: "Tertiary Student Accounts — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Tertiary student fee directory, department billing tiles, tuition balances, and payment tracking for the Trite Merchant OS platform.",
      },
      { property: "og:title", content: "Tertiary Student Accounts — Trite Merchant OS" },
    ],
  }),
  component: StudentsPage,
});

export type Department = {
  id: string;
  name: string;
  code: string;
  description?: string | undefined;
  defaultTuition?: number | undefined;
};

// ── Tertiary Departments Focus ──
const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: "dept-it",
    name: "IT Department",
    code: "IT",
    description: "Computer Science, Software Engineering, Cybersecurity & Networks",
    defaultTuition: 3200,
  },
  {
    id: "dept-hr",
    name: "HR Department",
    code: "HR",
    description: "Human Resource Management, Talent Dev & Organizational Strategy",
    defaultTuition: 2800,
  },
  {
    id: "dept-soc",
    name: "Social Studies Department",
    code: "SOC",
    description: "Sociology, Development Policy, Public Relations & Social Work",
    defaultTuition: 2600,
  },
  {
    id: "dept-art",
    name: "Art Department",
    code: "ART",
    description: "Graphic Design, Industrial Arts, Multimedia & Digital Production",
    defaultTuition: 3000,
  },
  {
    id: "dept-bus",
    name: "Business Administration",
    code: "BUS",
    description: "Banking & Finance, Marketing, Supply Chain & Entrepreneurship",
    defaultTuition: 3400,
  },
  {
    id: "dept-acc",
    name: "Accounting & Finance",
    code: "ACC",
    description: "Corporate Accounting, Tax Practice, Forensic Auditing & Actuarial",
    defaultTuition: 3500,
  },
];

export function getStudentDeptName(student: Student): string {
  if (student.department) return student.department;
  const id = student.studentId.toUpperCase();
  if (id.includes("-IT")) return "IT Department";
  if (id.includes("-HR")) return "HR Department";
  if (id.includes("-SOC")) return "Social Studies Department";
  if (id.includes("-ART")) return "Art Department";
  if (id.includes("-BUS")) return "Business Administration";
  if (id.includes("-ACC")) return "Accounting & Finance";

  const num = parseInt(student.id.replace(/\D/g, "") || "1", 10);
  const idx = (num - 1) % INITIAL_DEPARTMENTS.length;
  return INITIAL_DEPARTMENTS[idx]?.name || "IT Department";
}

export function getStudentFeeTypes(student: Student): string[] {
  if (student.assignedFeeTypes && student.assignedFeeTypes.length > 0) {
    return student.assignedFeeTypes;
  }
  return [
    "Semester Academic Tuition",
    "Faculty Lab & Practical Levy",
    "Semester Examination Fee",
    "Campus ICT & Digital Access",
    "SRC & Student Development Dues",
  ];
}

function getDeptStyle(code: string) {
  switch (code.toUpperCase()) {
    case "IT":
      return {
        icon: Laptop,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60",
        badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300",
      };
    case "HR":
      return {
        icon: Briefcase,
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60",
        badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300",
      };
    case "SOC":
      return {
        icon: BookOpen,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60",
        badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300",
      };
    case "ART":
      return {
        icon: Palette,
        color: "text-rose-600 dark:text-rose-400",
        bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60",
        badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300",
      };
    case "BUS":
      return {
        icon: Building2,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60",
        badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
      };
    case "ACC":
      return {
        icon: Landmark,
        color: "text-cyan-600 dark:text-cyan-400",
        bg: "bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800/60",
        badge: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-300",
      };
    default:
      return {
        icon: GraduationCap,
        color: "text-indigo-600 dark:text-indigo-400",
        bg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60",
        badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300",
      };
  }
}

type Standing = Student["status"];
type SortKey = "name" | "balanceDue" | "paidAmount" | "tuitionFee" | "academicYearRange";

const STATUS_CONFIG: Record<
  Standing,
  { label: string; icon: React.ElementType; color: string; bg: string; activePill: string }
> = {
  "Paid Full": {
    label: "Paid Full",
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400 font-semibold",
    bg: "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800",
    activePill: "bg-emerald-600 text-white",
  },
  "Partial Payment": {
    label: "Partial Payment",
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400 font-semibold",
    bg: "bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800",
    activePill: "bg-amber-600 text-white",
  },
  Overdue: {
    label: "Overdue",
    icon: AlertCircle,
    color: "text-rose-600 dark:text-rose-400 font-semibold",
    bg: "bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800",
    activePill: "bg-rose-600 text-white",
  },
};

function downloadCsvTemplate(selectedDeptName?: string) {
  const dept = selectedDeptName && selectedDeptName !== "all" ? selectedDeptName : "IT Department";
  const headers = [
    "Index Number",
    "First Name",
    "Last Name",
    "Phone Number",
    "Department",
    "Academic Year Range",
    "Tuition Fee",
  ];
  const sampleRows = [
    ["UG-2026-IT101", "Kofi", "Mensah", "+233 24 100 2201", dept, "2026 - 2029", "3200"],
    ["UG-2026-IT102", "Ama", "Osei", "+233 20 441 5512", dept, "2026 - 2029", "3200"],
    ["UG-2025-IT103", "Kwame", "Boateng", "+233 54 820 1104", dept, "2025 - 2028", "3200"],
    ["UG-2024-IT104", "Abena", "Sarkodie", "+233 27 303 8890", dept, "2024 - 2027", "3200"],
  ];
  const csvContent = [headers.join(","), ...sampleRows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `tertiary_students_${dept.toLowerCase().replace(/[^a-z0-9]/g, "_")}_template.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ── Modals ──

function EditDepartmentModal({
  dept,
  onClose,
  onSubmit,
}: {
  dept: Department;
  onClose: () => void;
  onSubmit: (updated: Department) => void;
}) {
  const [name, setName] = useState(dept.name);
  const [code, setCode] = useState(dept.code);
  const [description, setDescription] = useState(dept.description ?? "");
  const [tuition, setTuition] = useState(String(dept.defaultTuition ?? 3000));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ ...dept, name: name.trim(), code: code.trim().toUpperCase(), description: description.trim() || undefined, defaultTuition: Number(tuition) || dept.defaultTuition });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-base font-bold">Edit Department</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary">
            <X className="size-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Department Name *</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Department Code</label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. IT, HR, SOC"
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Semester Tuition (GH₵)</label>
              <input type="number" value={tuition} onChange={(e) => setTuition(e.target.value)}
                placeholder="3000"
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Programs / Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. B.Sc. Computer Science & Software Dev"
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a] gap-1.5">
              <Check className="size-4" /> Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditStudentModal({
  student,
  onClose,
  onSubmit,
}: {
  student: Student;
  onClose: () => void;
  onSubmit: (updated: Student) => void;
}) {
  const [name, setName] = useState(student.name);
  const [studentId, setStudentId] = useState(student.studentId);
  const [phone, setPhone] = useState(student.guardianPhone);
  const [academicYearRange, setAcademicYearRange] = useState(
    student.academicYearRange || "2026 - 2029"
  );
  const [tuitionFee, setTuitionFee] = useState(String(student.tuitionFee));
  const [assignedFees, setAssignedFees] = useState<string[]>(getStudentFeeTypes(student));

  const toggleFeeType = (feeName: string) => {
    setAssignedFees((prev) =>
      prev.includes(feeName) ? prev.filter((f) => f !== feeName) : [...prev, feeName]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newTuition = Number(tuitionFee) || student.tuitionFee;
    const newBalance = Math.max(0, newTuition - student.paidAmount);
    const newStatus: Student["status"] =
      newBalance === 0 ? "Paid Full" : student.paidAmount > 0 ? "Partial Payment" : "Overdue";
    onSubmit({
      ...student,
      name: name.trim(),
      studentId: studentId.trim(),
      guardianPhone: phone.trim(),
      guardianName: name.trim(),
      academicYearRange,
      assignedFeeTypes: assignedFees,
      tuitionFee: newTuition,
      balanceDue: newBalance,
      status: newStatus,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold">Edit Student Details</h2>
            <p className="text-xs text-muted-foreground">Update profile, cohort years, and assigned fees</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary">
            <X className="size-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Index Number</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Cohort / Academic Year Range
            </label>
            <input
              type="text"
              value={academicYearRange}
              onChange={(e) => setAcademicYearRange(e.target.value)}
              placeholder="e.g. 2026 - 2029"
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Assigned Fee Types Taking *
            </label>
            <div className="space-y-1.5 rounded-xl border border-border bg-secondary/20 p-2.5">
              {DEFAULT_FEE_TYPES.map((ft) => {
                const isSelected = assignedFees.includes(ft.name) || assignedFees.includes(ft.name.split(" ")[0] || "");
                return (
                  <label
                    key={ft.id}
                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-secondary/40 cursor-pointer text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleFeeType(ft.name)}
                        className="rounded border-border text-accent focus:ring-accent size-3.5"
                      />
                      <span className="font-medium text-foreground">{ft.name}</span>
                    </div>
                    <span className="font-semibold text-muted-foreground">{currency(ft.amount)}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Total Semester Fee (GH₵)
            </label>
            <input
              type="number"
              value={tuitionFee}
              onChange={(e) => setTuitionFee(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a] gap-1.5">
              <Check className="size-4" /> Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddDepartmentModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (dept: Department) => void;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [tuition, setTuition] = useState("3000");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase() || name.slice(0, 4).toUpperCase(),
      description: description.trim() || undefined,
      defaultTuition: Number(tuition) || 3000,
    };
    onSubmit(newDept);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/10 text-accent">
              <Building2 className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Add Tertiary Department</h2>
              <p className="text-xs text-muted-foreground">Create a new academic faculty or department</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Department Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. IT Department, HR Department, Art Department..."
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Department Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. IT, HR, SOC, ART"
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Semester Tuition (GH₵)
              </label>
              <input
                type="number"
                value={tuition}
                onChange={(e) => setTuition(e.target.value)}
                placeholder="3000"
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Programs / Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. B.Sc. Computer Science & Software Dev"
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a] gap-1.5">
              <FolderPlus className="size-4" />
              Save Department
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UploadStudentsCsvModal({
  departments,
  selectedDept,
  onClose,
  onImport,
}: {
  departments: Department[];
  selectedDept: string;
  onClose: () => void;
  onImport: (newStudents: Student[], targetDeptName: string) => void;
}) {
  const [targetDept, setTargetDept] = useState(
    selectedDept !== "all" ? selectedDept : (departments[0]?.name ?? "IT Department")
  );
  const [targetYearRange, setTargetYearRange] = useState("2026 - 2029");
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<
    Array<{
      indexNo: string;
      name: string;
      phone: string;
      dept: string;
      yearRange: string;
      tuition: number;
    }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentDeptObj = departments.find((d) => d.name === targetDept) ?? departments[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      if (lines.length <= 1) return;

      const results: Array<{
        indexNo: string;
        name: string;
        phone: string;
        dept: string;
        yearRange: string;
        tuition: number;
      }> = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i]!;
        const parts = row.split(",").map((p) => p.replace(/^["']|["']$/g, "").trim());
        if (parts.length < 2) continue;

        const indexNo = parts[0] || `UG-2026-${(currentDeptObj?.code ?? "STU")}${Math.floor(Math.random() * 900) + 100}`;
        const firstName = parts[1] || "";
        const lastName = parts[2] || "";
        const fullName = `${firstName} ${lastName}`.trim() || parts[1] || "Student";
        const phone = parts[3] || "—";
        const dept = parts[4] && parts[4] !== "—" ? parts[4] : targetDept;

        // Check if 5th or 6th column is year range vs tuition
        let rowYearRange = targetYearRange;
        let tuition = currentDeptObj?.defaultTuition ?? 3000;

        if (parts.length >= 7) {
          rowYearRange = parts[5] || targetYearRange;
          tuition = Number(parts[6]) || (currentDeptObj?.defaultTuition ?? 3000);
        } else if (parts.length === 6) {
          if (parts[5]?.includes("-")) {
            rowYearRange = parts[5];
          } else {
            tuition = Number(parts[5]) || (currentDeptObj?.defaultTuition ?? 3000);
          }
        }

        results.push({
          indexNo,
          name: fullName,
          phone,
          dept,
          yearRange: rowYearRange,
          tuition,
        });
      }

      setParsedRows(results);
    };
    reader.readAsText(f);
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;

    const newStudents: Student[] = parsedRows.map((r, i) => ({
      id: `STU-IMP-${Date.now()}-${i}`,
      studentId: r.indexNo,
      name: r.name,
      department: targetDept,
      academicYearRange: r.yearRange || targetYearRange,
      guardianName: r.name,
      guardianPhone: r.phone,
      tuitionFee: r.tuition || (currentDeptObj?.defaultTuition ?? 3000),
      paidAmount: 0,
      balanceDue: r.tuition || (currentDeptObj?.defaultTuition ?? 3000),
      status: "Overdue",
      term: "Term 3, 2026",
    }));

    onImport(newStudents, targetDept);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-4 shrink-0">
          <div>
            <h2 className="text-lg font-bold">Import Students by Department</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select target tertiary department & cohort year range, then upload CSV
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* ── QUESTION 1: TARGET DEPARTMENT & COHORT YEAR SELECTION ── */}
        <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3 shrink-0">
          <div>
            <label className="text-sm font-semibold text-foreground">
              Target Department & Program Cohort Years
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              Select the faculty department and type or select the academic year range (e.g. 2026 - 2029, 2025 - 2030, etc.).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Department
              </label>
              <select
                value={targetDept}
                onChange={(e) => {
                  setTargetDept(e.target.value);
                  setParsedRows((prev) => prev.map((r) => ({ ...r, dept: e.target.value })));
                }}
                className="h-10 px-3 rounded-lg border border-border bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 w-full"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.code}) — Tuition: {currency(d.defaultTuition || 3000)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Cohort Academic Year Range
              </label>
              <input
                type="text"
                value={targetYearRange}
                onChange={(e) => {
                  setTargetYearRange(e.target.value);
                  setParsedRows((prev) => prev.map((r) => ({ ...r, yearRange: e.target.value })));
                }}
                placeholder="e.g. 2026 - 2029"
                className="h-10 px-3 rounded-lg border border-border bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 w-full"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => downloadCsvTemplate(targetDept)}
            className="h-9 px-4 rounded-lg text-xs font-semibold text-white bg-[#22c55e] hover:bg-[#16a34a] transition-colors w-full"
          >
            Download CSV Template with Academic Year Columns
          </button>
        </div>

        {/* ── STEP 2: FILE DROPZONE ── */}
        <div className="space-y-2 shrink-0">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Upload CSV File
          </label>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-accent/50 rounded-xl p-8 text-center cursor-pointer transition-colors bg-background/50 hover:bg-secondary/20"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-sm font-medium text-foreground">
              {file ? file.name : `Click to select a CSV file`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Columns: Index Number, First Name, Last Name, Phone, Department, Academic Year Range, Tuition
            </p>
          </div>
        </div>


        {/* ── STEP 3: FILE READY SUMMARY (no table preview) ── */}
        {parsedRows.length > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 shrink-0">
            <div className="size-2 rounded-full bg-emerald-500 shrink-0" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              <span className="font-bold">{parsedRows.length} students</span> parsed and ready to import into{" "}
              <span className="font-bold">{targetDept}</span>
            </p>
          </div>
        )}


        <div className="flex items-center justify-between pt-3 border-t border-border shrink-0">
          <p className="text-xs text-muted-foreground">
            Target Department: <strong className="text-foreground">{targetDept}</strong>
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmImport}
              disabled={parsedRows.length === 0}
              className="bg-[#22c55e] text-white hover:bg-[#16a34a] gap-1.5"
            >
              <Check className="size-4" />
              Import {parsedRows.length > 0 ? `${parsedRows.length} Students` : ""} into {targetDept.split(" ")[0]}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentStatementModal({
  student,
  transactions,
  onClose,
}: {
  student: Student;
  transactions: FeeTransaction[];
  onClose: () => void;
}) {
  const pctPaid =
    student.tuitionFee > 0 ? Math.round((student.paidAmount / student.tuitionFee) * 100) : 100;
  const history = transactions.filter((t) => t.studentId === student.studentId);
  const deptName = getStudentDeptName(student);
  const assignedFees = getStudentFeeTypes(student);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label={`Statement for ${student.name}`}
      onClick={onClose}
    >
      <div
        className="relative z-10 w-full max-w-md rounded-2xl bg-card shadow-2xl overflow-hidden border border-border p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-lg font-bold">{student.name}</h2>
            <p className="text-xs font-mono text-muted-foreground">
              Index No: {student.studentId} · {deptName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary hover:bg-border transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-secondary/30 p-3 text-sm space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Phone Number
            </p>
            <p className="text-sm font-medium flex items-center gap-1.5">
              <Phone className="size-3.5 text-muted-foreground" />
              <span className="font-mono">{student.guardianPhone}</span>
            </p>
          </div>

          {/* Assigned Fee Types Taking */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Fee Types Taking ({assignedFees.length})
            </p>
            <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl border border-border bg-secondary/20">
              {assignedFees.map((ft, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-card text-xs font-medium text-foreground border border-border shadow-2xs"
                >
                  {ft}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-border p-2 bg-card">
              <p className="text-[10px] uppercase font-semibold text-muted-foreground">Total Fee</p>
              <p className="font-bold text-sm mt-0.5">{currency(student.tuitionFee)}</p>
            </div>
            <div className="rounded-xl border border-border p-2 bg-emerald-500/10">
              <p className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400">Paid</p>
              <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
                {currency(student.paidAmount)}
              </p>
            </div>
            <div className="rounded-xl border border-border p-2 bg-rose-500/10">
              <p className="text-[10px] uppercase font-semibold text-rose-600 dark:text-rose-400">Balance</p>
              <p
                className={`font-bold text-sm mt-0.5 ${
                  student.balanceDue > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {currency(student.balanceDue)}
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-semibold mb-1">
              <span className="text-muted-foreground">Payment Fulfillment</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{pctPaid}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  pctPaid >= 100 ? "bg-emerald-500" : pctPaid > 0 ? "bg-amber-500" : "bg-rose-500"
                )}
                style={{ width: `${Math.min(100, pctPaid)}%` }}
              />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Receipt History ({history.length})
            </h3>
            {history.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2">No payments recorded yet for this student.</p>
            ) : (
              <ul className="divide-y divide-border rounded-xl border border-border max-h-36 overflow-y-auto">
                {history.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 text-xs"
                  >
                    <div>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">+{currency(t.amountPaid)}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {t.date} · {t.paymentMethod} {t.feeType ? `· ${t.feeType}` : ""}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">{t.receiptNo}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function StudentCollectModal({
  student,
  onClose,
  onSubmit,
}: {
  student: Student;
  onClose: () => void;
  onSubmit: (tx: FeeTransaction) => void;
}) {
  const PAYMENT_METHODS = ["Mobile Money (MTN)", "Bank Transfer", "Cash Deposit"] as const;
  const assignedFees = getStudentFeeTypes(student);
  const [feeType, setFeeType] = useState(assignedFees[0] ?? "Tuition Fee (Core Academic)");
  const [amount, setAmount] = useState(String(student.balanceDue > 0 ? student.balanceDue : student.tuitionFee));
  const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number]>("Mobile Money (MTN)");

  const inputClass =
    "h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-accent";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paid = Number(amount) || 0;
    if (paid <= 0) return;
    const today = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    onSubmit({
      id: `REC-${Date.now()}`,
      receiptNo: `RCP-2026-0${Math.floor(Math.random() * 9000) + 1000}`,
      studentId: student.studentId,
      schoolId: student.schoolId,
      studentName: student.name,
      feeType,
      amountPaid: paid,
      paymentMethod: method,
      date: today,
      term: student.term,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label={`Collect payment for ${student.name}`}
      onClick={onClose}
    >
      <div
        className="relative z-10 w-full max-w-md rounded-2xl bg-card shadow-2xl border border-border p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-lg font-bold">Collect Fee Payment</h2>
            <p className="text-xs text-muted-foreground">
              {student.name} · Balance {currency(student.balanceDue)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary hover:bg-border transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Type of Fee Paying *
            </label>
            <select
              value={feeType}
              onChange={(e) => setFeeType(e.target.value)}
              className={inputClass}
            >
              {assignedFees.map((ft, i) => (
                <option key={i} value={ft}>
                  {ft}
                </option>
              ))}
              <option value="General Semester Fee">General Semester Fee Balance</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Amount to Collect (GH₵) *
            </label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Payment Method *
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className={inputClass}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-[#22c55e] text-white hover:bg-[#16a34a] gap-1.5"
              disabled={(Number(amount) || 0) <= 0}
            >
              <Check className="size-4" /> Record Payment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EnrollStudentModal({
  departments,
  selectedDept,
  onClose,
  onSubmit,
}: {
  departments: Department[];
  selectedDept: string;
  onClose: () => void;
  onSubmit: (student: Student) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [dept, setDept] = useState(
    selectedDept !== "all" ? selectedDept : (departments[0]?.name ?? "IT Department")
  );
  const [academicYearRange, setAcademicYearRange] = useState("2026 - 2029");
  const [assignedFees, setAssignedFees] = useState<string[]>(
    DEFAULT_FEE_TYPES.map((ft) => ft.name)
  );

  const calculatedFeeTotal = useMemo(() => {
    return DEFAULT_FEE_TYPES.filter((ft) => assignedFees.includes(ft.name)).reduce(
      (sum, ft) => sum + ft.amount,
      0
    );
  }, [assignedFees]);

  const [tuitionFee, setTuitionFee] = useState(String(calculatedFeeTotal || 3250));

  const toggleFeeType = (feeName: string) => {
    setAssignedFees((prev) => {
      const next = prev.includes(feeName)
        ? prev.filter((f) => f !== feeName)
        : [...prev, feeName];
      const sum = DEFAULT_FEE_TYPES.filter((ft) => next.includes(ft.name)).reduce(
        (acc, ft) => acc + ft.amount,
        0
      );
      setTuitionFee(String(sum));
      return next;
    });
  };

  const inputClass =
    "h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-accent";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const currentDeptObj = departments.find((d) => d.name === dept);
    const fee = Number(tuitionFee) || calculatedFeeTotal || currentDeptObj?.defaultTuition || 3000;
    const idNum = Math.floor(Math.random() * 900) + 100;
    const code = currentDeptObj?.code || "UG";
    onSubmit({
      id: `STU-${Date.now()}`,
      studentId: schoolId.trim() || `UG-2026-${code}${idNum}`,
      schoolId: schoolId.trim() || undefined,
      department: dept,
      academicYearRange,
      assignedFeeTypes: assignedFees,
      name: name.trim(),
      guardianName: name.trim(),
      guardianPhone: phone.trim() || "—",
      tuitionFee: fee,
      paidAmount: 0,
      balanceDue: fee,
      status: fee === 0 ? "Paid Full" : "Overdue",
      term: "Term 3, 2026",
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Enroll New Student"
      onClick={onClose}
    >
      <div
        className="relative z-10 w-full max-w-md rounded-2xl bg-card shadow-2xl border border-border p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-lg font-bold">Enroll Tertiary Student</h2>
            <p className="text-xs text-muted-foreground">Assign student to department, cohort years & fee types</p>
          </div>
          <button
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary hover:bg-border transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Student Name *
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kwesi Mensah"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                Index Number / ID
              </label>
              <input
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                placeholder="e.g. UG-2026-IT104"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                Phone Number
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +233 24 000 0000"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                Department
              </label>
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className={inputClass}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                Cohort Years
              </label>
              <input
                type="text"
                value={academicYearRange}
                onChange={(e) => setAcademicYearRange(e.target.value)}
                placeholder="e.g. 2026 - 2029"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Assigned School Tuition & Fee Types *
            </label>
            <div className="space-y-1.5 rounded-xl border border-border bg-secondary/20 p-2.5">
              {DEFAULT_FEE_TYPES.map((ft) => {
                const isSelected = assignedFees.includes(ft.name);
                return (
                  <label
                    key={ft.id}
                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-secondary/40 cursor-pointer text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleFeeType(ft.name)}
                        className="rounded border-border text-accent focus:ring-accent size-3.5"
                      />
                      <span className="font-medium text-foreground">{ft.name}</span>
                    </div>
                    <span className="font-semibold text-muted-foreground">{currency(ft.amount)}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Total Calculated Fees to Pay (GH₵)
            </label>
            <input
              type="number"
              value={tuitionFee}
              onChange={(e) => setTuitionFee(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-[#22c55e] text-white hover:bg-[#16a34a] gap-1.5"
              disabled={!name.trim()}
            >
              <Plus className="size-4" /> Enroll Student
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StudentCard({
  s,
  onStatement,
  onCollect,
}: {
  s: Student;
  onStatement: (s: Student) => void;
  onCollect: (s: Student) => void;
}) {
  const cfg = STATUS_CONFIG[s.status];
  const Icon = cfg.icon;
  const pctPaid = s.tuitionFee > 0 ? Math.round((s.paidAmount / s.tuitionFee) * 100) : 100;
  const deptName = getStudentDeptName(s);
  const yearRange = getStudentYearRange(s);

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-accent/40 shadow-xs">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-[10px] text-muted-foreground font-semibold">
                {s.studentId}
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-secondary text-foreground">
                {deptName}
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40 font-mono">
                {yearRange}
              </span>
            </div>
            <h3 className="truncate text-sm font-bold text-foreground mt-0.5">{s.name}</h3>
          </div>
          <span
            className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] leading-none ${cfg.bg} ${cfg.color}`}
          >
            <Icon className="size-3" />
            {cfg.label}
          </span>
        </div>

        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Phone className="size-3 shrink-0 text-muted-foreground" />
            <span className="font-mono">{s.guardianPhone}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] uppercase tracking-wide mb-1">
            <span className="text-muted-foreground">Payment Progress</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{pctPaid}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                pctPaid >= 100 ? "bg-emerald-500" : pctPaid > 0 ? "bg-amber-500" : "bg-rose-500"
              )}
              style={{ width: `${Math.min(100, pctPaid)}%` }}
            />
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-secondary/40 p-2.5 space-y-0.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fee:</span>
            <span className="font-medium">{currency(s.tuitionFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paid:</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {currency(s.paidAmount)}
            </span>
          </div>
          <div className="flex justify-between pt-1 border-t border-border/50">
            <span className="font-semibold">Balance:</span>
            <span
              className={`font-bold ${
                s.balanceDue > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {currency(s.balanceDue)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-1.5">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onStatement(s)}
          className="w-full text-xs h-7"
        >
          Statement
        </Button>
        <Button
          size="sm"
          onClick={() => onCollect(s)}
          className="w-full bg-[#22c55e] text-white hover:bg-[#16a34a] text-xs h-7"
        >
          Collect
        </Button>
      </div>
    </div>
  );
}

// ── Department Overview Tile (4 on each column layout) ──
function DepartmentTile({
  dept,
  students,
  onClick,
  onEdit,
}: {
  dept: Department;
  students: Student[];
  onClick: () => void;
  onEdit: (dept: Department) => void;
}) {
  const deptStudents = students.filter((s) => getStudentDeptName(s) === dept.name);

  const totalFee = deptStudents.reduce((sum, s) => sum + s.tuitionFee, 0);
  const totalPaid = deptStudents.reduce((sum, s) => sum + s.paidAmount, 0);
  const totalArrears = deptStudents.reduce((sum, s) => sum + s.balanceDue, 0);
  const paidCount = deptStudents.filter((s) => s.status === "Paid Full").length;
  const overdueCount = deptStudents.filter((s) => s.status === "Overdue").length;
  const partialCount = deptStudents.filter((s) => s.status === "Partial Payment").length;
  const pct = totalFee > 0 ? Math.round((totalPaid / totalFee) * 100) : 0;

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:shadow-lg hover:bg-secondary/40 cursor-pointer text-left"
    >
      <div>
        {/* Title row with edit icon */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-base font-bold text-foreground transition-colors">
              {dept.name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1 min-h-[32px]">
              {dept.description || `Faculty cohort & student management`}
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(dept); }}
            className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors mt-0.5"
            title="Edit department"
          >
            <Pencil className="size-3.5" />
          </button>
        </div>

        {/* Live Metrics Grid inside tile */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-secondary/40 p-2.5">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase">Enrolled</p>
            <p className="text-sm font-bold text-foreground mt-0.5">{deptStudents.length} Students</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Paid Full</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{paidCount} Paid</p>
          </div>
          <div className="pt-1.5 border-t border-border/50">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase">Collected</p>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{currency(totalPaid)}</p>
          </div>
          <div className="pt-1.5 border-t border-border/50">
            <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 uppercase">Arrears</p>
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-0.5">{currency(totalArrears)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] font-semibold mb-1">
            <span className="text-muted-foreground">Settlement Rate</span>
            <span className={pct >= 70 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-amber-600 dark:text-amber-400 font-bold"}>
              {pct}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                pct >= 80 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-rose-500"
              )}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer link */}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-accent group-hover:underline">
        <span>View Department Info & Students</span>
      </div>
    </div>
  );
}

// ── Main Page Component ──

function StudentsPage() {
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<Standing | "all">("all");
  const {
    academicYear: cohortYearFilter,
    setAcademicYear: setCohortYearFilter,
    customStartYear,
    setCustomStartYear,
    customEndYear,
    setCustomEndYear,
    availableYearRanges,
  } = useAcademicYear();
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortKey, setSortKey] = useState<SortKey>("balanceDue");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [students, setStudents] = useState<Student[]>(SCHOOL_STUDENTS);
  const [transactions, setTransactions] = useState<FeeTransaction[]>(FEE_TRANSACTIONS);

  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [isUploadCsvOpen, setIsUploadCsvOpen] = useState(false);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [statementStudent, setStatementStudent] = useState<Student | null>(null);
  const [collectStudent, setCollectStudent] = useState<Student | null>(null);
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [editStudent, setEditStudent] = useState<Student | null>(null);

  const handleAddDepartment = (newDept: Department) => {
    setDepartments((prev) => [...prev, newDept]);
    setSelectedDept(newDept.name);
  };

  const handleEditDepartment = (updated: Department) => {
    setDepartments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    // Keep selected dept name in sync if it was renamed
    if (selectedDept === editDept?.name && updated.name !== editDept?.name) {
      setSelectedDept(updated.name);
    }
  };

  const handleEditStudent = (updated: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleImportCsvStudents = (newStudents: Student[], targetDeptName: string) => {
    setStudents((prev) => [...prev, ...newStudents]);
    // Automatically switch to that department straight away!
    setSelectedDept(targetDeptName);
  };

  const handleCollectPayment = (tx: FeeTransaction) => {
    setTransactions((prev) => [tx, ...prev]);
    setStudents((prev) =>
      prev.map((s) => {
        if (s.studentId === tx.studentId) {
          const newPaid = s.paidAmount + tx.amountPaid;
          const newBalance = Math.max(0, s.tuitionFee - newPaid);
          const newStatus: Standing =
            newBalance === 0 ? "Paid Full" : newPaid > 0 ? "Partial Payment" : "Overdue";
          return {
            ...s,
            paidAmount: newPaid,
            balanceDue: newBalance,
            status: newStatus,
          };
        }
        return s;
      })
    );
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir(key === "name" || key === "academicYearRange" ? "asc" : "desc");
    }
  };

  // ── Filter by Department & Status & Cohort Year & Search ──
  const departmentStudents = useMemo(() => {
    if (selectedDept === "all") return students;
    return students.filter((s) => getStudentDeptName(s) === selectedDept);
  }, [students, selectedDept]);

  const filtered = useMemo(() => {
    return departmentStudents
      .filter((s) => {
        // Status filter
        if (statusFilter !== "all" && s.status !== statusFilter) {
          return false;
        }

        // Cohort / Academic Year Range filter
        if (cohortYearFilter !== "all") {
          const studentYear = getStudentYearRange(s);
          if (cohortYearFilter === "custom" && customStartYear && customEndYear) {
            const targetRange = `${customStartYear.trim()} - ${customEndYear.trim()}`;
            if (studentYear !== targetRange) return false;
          } else if (cohortYearFilter !== "custom") {
            if (studentYear !== cohortYearFilter) return false;
          }
        }

        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = s.name.toLowerCase().includes(q);
          const matchId = s.studentId.toLowerCase().includes(q);
          const matchPhone = s.guardianPhone.toLowerCase().includes(q);
          const matchYear = getStudentYearRange(s).toLowerCase().includes(q);
          if (!matchName && !matchId && !matchPhone && !matchYear) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        switch (sortKey) {
          case "name":
            cmp = a.name.localeCompare(b.name);
            break;
          case "academicYearRange":
            cmp = getStudentYearRange(a).localeCompare(getStudentYearRange(b));
            break;
          case "balanceDue":
            cmp = a.balanceDue - b.balanceDue;
            break;
          case "paidAmount":
            cmp = a.paidAmount - b.paidAmount;
            break;
          case "tuitionFee":
            cmp = a.tuitionFee - b.tuitionFee;
            break;
        }
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [departmentStudents, statusFilter, cohortYearFilter, customStartYear, customEndYear, search, sortKey, sortDir]);

  // ── Reactive KPI Stats for active view ──
  const totalExpected = departmentStudents.reduce((s, st) => s + st.tuitionFee, 0);
  const totalCollected = departmentStudents.reduce((s, st) => s + st.paidAmount, 0);
  const totalArrears = departmentStudents.reduce((s, st) => s + st.balanceDue, 0);
  const clearedCount = departmentStudents.filter((s) => s.status === "Paid Full").length;
  const partialCount = departmentStudents.filter((s) => s.status === "Partial Payment").length;
  const overdueCount = departmentStudents.filter((s) => s.status === "Overdue").length;
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  const isOverview = selectedDept === "all";
  const activeDeptObj = departments.find((d) => d.name === selectedDept);

  return (
    <AppShell
      title={isOverview ? "Tertiary Academic Departments" : `${selectedDept}`}
      subtitle={
        isOverview
          ? `${departments.length} tertiary departments · ${students.length} enrolled students · ${currency(totalCollected)} collected`
          : `${departmentStudents.length} enrolled students · ${currency(totalCollected)} collected in ${selectedDept}`
      }
      actions={
        <div className="flex items-center gap-2">
          {!isOverview && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedDept("all")}
              className="h-8 px-2.5 text-xs gap-1"
            >
              <ChevronLeft className="size-3.5" />
              <span>All Departments</span>
            </Button>
          )}

          <Link to="/fees">
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2.5 text-xs gap-1.5"
            >
              <Banknote className="size-3.5 text-accent" />
              <span>Fee Management</span>
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={() => setIsEnrollOpen(true)}
            className="h-8 px-3 text-xs bg-[#22c55e] text-white hover:bg-[#16a34a] gap-1.5"
          >
            <Plus className="size-3.5" />
            <span>Enroll Student</span>
          </Button>
        </div>
      }
    >
      {/* ══════════════════════════════════════════════
          TOP SUMMARY KPI CARDS (Maintained fees collected)
      ══════════════════════════════════════════════ */}
      <div className="mb-6 grid gap-3 grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Selected Department Info */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {isOverview ? "Total Enrolled" : "Department Cohort"}
            </p>
            <span className="rounded-full bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Building2 className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold truncate text-foreground">
            {isOverview ? `${students.length} Students` : `${departmentStudents.length} Students`}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isOverview ? `Across ${departments.length} departments` : `In ${selectedDept}`}
          </p>
        </div>

        {/* Card 2: Fees Collected (Maintained as requested) */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Fees Collected
            </p>
            <span className="rounded-full bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 num">
            {currency(totalCollected)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {clearedCount} fully cleared · {partialCount} partial
          </p>
        </div>

        {/* Card 3: Receivables / Unpaid Arrears */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Fee Arrears (Unpaid)
            </p>
            <span className="rounded-full bg-rose-50 p-2 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <AlertCircle className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 num">
            {currency(totalArrears)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {overdueCount} students with overdue balances
          </p>
        </div>

        {/* Card 4: Collection Efficiency */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Collection Efficiency
            </p>
            <span className="rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Coins className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-foreground num">
            {collectionRate}%
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Target: {currency(totalExpected)}
          </p>
        </div>
      </div>


      {/* ══════════════════════════════════════════════
          VIEW 1: DEPARTMENT TILES GRID (4 COLUMNS)
          (When "All Departments" is active)
      ══════════════════════════════════════════════ */}
      {isOverview ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Tertiary Faculties & Departments</h2>
              <p className="text-xs text-muted-foreground">
                Click any department tile below to inspect student accounts, who has paid, and who is in arrears.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsUploadCsvOpen(true)}
              className="bg-[#22c55e] text-white hover:bg-[#16a34a] text-xs gap-1.5 h-8"
            >
              <Upload className="size-3.5" />
              <span>Import Students CSV</span>
            </Button>
          </div>

          {/* 4-Column Grid of Department Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {departments.map((dept) => (
              <DepartmentTile
                key={dept.id}
                dept={dept}
                students={students}
                onClick={() => setSelectedDept(dept.name)}
                onEdit={(d) => setEditDept(d)}
              />
            ))}

            {/* "+ Add New Department" Tile */}
            <div
              onClick={() => setIsAddDeptOpen(true)}
              className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-border hover:border-accent bg-card/50 hover:bg-secondary/40 text-center cursor-pointer transition-all min-h-[220px] group"
            >
              <div className="p-3 rounded-full bg-secondary group-hover:bg-accent/10 group-hover:text-accent transition-colors mb-2 text-muted-foreground">
                <Plus className="size-6" />
              </div>
              <p className="text-sm font-bold text-foreground group-hover:text-accent">Add New Department</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[180px]">
                Create a new tertiary program or faculty tile
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════
            VIEW 2: ACTIVE DEPARTMENT STUDENTS DETAILS
            (When a specific department tile is clicked)
        ══════════════════════════════════════════════ */
        <div className="space-y-4">
          {/* Department Breadcrumb & Subheader */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDept("all")}
                className="h-8 px-2.5 text-xs gap-1 hover:border-accent"
              >
                <ChevronLeft className="size-3.5" />
                <span>All Departments</span>
              </Button>
              <div className="h-4 w-px bg-border hidden sm:block" />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-foreground">{selectedDept}</h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                    {activeDeptObj?.code || "DEPT"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {departmentStudents.length} students enrolled · {clearedCount} paid in full · {overdueCount} in arrears
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadCsvTemplate(selectedDept)}
                className="h-8 text-xs gap-1.5"
              >
                <FileDown className="size-3.5 text-accent" />
                <span>Template</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setIsUploadCsvOpen(true)}
                className="h-8 text-xs bg-[#22c55e] text-white hover:bg-[#16a34a] gap-1.5"
              >
                <Upload className="size-3.5" />
                <span>Import to {selectedDept.split(" ")[0]}</span>
              </Button>
            </div>
          </div>

          {/* ── TOOLBAR: WHO HAS PAID / UNPAID, COHORT YEARS & SEARCH ── */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Search bar */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${selectedDept} by name, index number, phone, years…`}
                  className="h-9 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-accent"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    viewMode === "grid" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Card Grid View"
                >
                  <LayoutGrid className="size-4" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    viewMode === "table" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Table View"
                >
                  <TableIcon className="size-4" />
                </button>
              </div>
            </div>

            {/* Row 1: Status Filter Pills (Paid vs Unpaid Under This Department) */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition-all border",
                    statusFilter === "all"
                      ? "bg-foreground text-background border-transparent"
                      : "bg-card text-muted-foreground border-border hover:bg-secondary"
                  )}
                >
                  All in {selectedDept.split(" ")[0]} ({departmentStudents.length})
                </button>

                <button
                  onClick={() => setStatusFilter("Paid Full")}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition-all border flex items-center gap-1",
                    statusFilter === "Paid Full"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-card text-emerald-600 dark:text-emerald-400 border-border hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  )}
                >
                  <CheckCircle2 className="size-3" />
                  Paid Full ({departmentStudents.filter((s) => s.status === "Paid Full").length})
                </button>

                <button
                  onClick={() => setStatusFilter("Partial Payment")}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition-all border flex items-center gap-1",
                    statusFilter === "Partial Payment"
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-card text-amber-600 dark:text-amber-400 border-border hover:bg-amber-50 dark:hover:bg-amber-950/40"
                  )}
                >
                  <Clock className="size-3" />
                  Partial ({departmentStudents.filter((s) => s.status === "Partial Payment").length})
                </button>

                <button
                  onClick={() => setStatusFilter("Overdue")}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition-all border flex items-center gap-1",
                    statusFilter === "Overdue"
                      ? "bg-rose-600 text-white border-rose-600"
                      : "bg-card text-rose-600 dark:text-rose-400 border-border hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  )}
                >
                  <AlertCircle className="size-3" />
                  Overdue / Unpaid ({departmentStudents.filter((s) => s.status === "Overdue").length})
                </button>
              </div>

              {/* Sort controls */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-semibold">Sort By:</span>
                {[
                  { key: "balanceDue" as SortKey, label: "Balance" },
                  { key: "name" as SortKey, label: "Name" },
                  { key: "paidAmount" as SortKey, label: "Paid" },
                  { key: "academicYearRange" as SortKey, label: "Cohort / Years" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => toggleSort(key)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold transition-all",
                      sortKey === key ? "bg-accent/15 text-accent font-bold" : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {label}
                    <ArrowUpDown className="size-2.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── STUDENTS CARDS / TABLE LIST (4 on each column) ── */}
          {filtered.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-border bg-card space-y-3">
              <GraduationCap className="size-10 text-muted-foreground mx-auto" />
              <h3 className="text-base font-bold">No students found in {selectedDept}</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {search
                  ? "No students match your search query."
                  : `There are no students in ${selectedDept} matching the selected status or cohort year.`}
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setStatusFilter("all");
                    setCohortYearFilter("all");
                    setSearch("");
                  }}
                >
                  Reset Filters
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsUploadCsvOpen(true)}
                  className="bg-[#22c55e] text-white hover:bg-[#16a34a] gap-1.5"
                >
                  <Upload className="size-3.5" /> Import CSV into {selectedDept}
                </Button>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            /* 4-Column Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filtered.map((s) => (
                <StudentCard
                  key={s.id}
                  s={s}
                  onStatement={(st) => setStatementStudent(st)}
                  onCollect={(st) => setCollectStudent(st)}
                />
              ))}
            </div>
          ) : (
            /* Table View with Cohort / Years column */
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-secondary/40 text-xs font-bold text-muted-foreground uppercase border-b border-border">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-5 py-3">Student Name</th>
                      <th className="px-4 py-3">Index Number</th>
                      <th className="px-4 py-3">Cohort / Years</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Fee Types Taking</th>
                      <th className="px-4 py-3 text-right">Tuition</th>
                      <th className="px-4 py-3 text-right">Paid</th>
                      <th className="px-4 py-3 text-right">Balance</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((s, idx) => {
                      const cfg = STATUS_CONFIG[s.status];
                      const studentFees = getStudentFeeTypes(s);
                      const yearRange = getStudentYearRange(s);
                      return (
                        <tr key={s.id} className="hover:bg-secondary/30 transition-colors">
                          <td className="px-4 py-3 text-xs font-bold text-muted-foreground">{idx + 1}</td>
                          <td className="px-5 py-3 font-semibold text-foreground">{s.name}</td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.studentId}</td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40 whitespace-nowrap">
                              {yearRange}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.guardianPhone}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {studentFees.slice(0, 2).map((ft, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center rounded-md bg-secondary/80 px-1.5 py-0.5 text-[10px] font-medium text-foreground border border-border/50"
                                >
                                  {ft.split(" ")[0]}
                                </span>
                              ))}
                              {studentFees.length > 2 && (
                                <span className="inline-flex items-center rounded-md bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                                  +{studentFees.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">{currency(s.tuitionFee)}</td>
                          <td className="px-4 py-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                            {currency(s.paidAmount)}
                          </td>
                          <td className="px-4 py-3 text-right font-bold">
                            {s.balanceDue > 0 ? (
                              <span className="text-rose-600 dark:text-rose-400">{currency(s.balanceDue)}</span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400">Cleared</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold", cfg.bg, cfg.color)}>
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditStudent(s)}
                                className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                                title="Edit student"
                              >
                                <Pencil className="size-3.5" />
                              </button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStatementStudent(s)}
                                className="h-7 text-xs px-2"
                              >
                                Statement
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => setCollectStudent(s)}
                                className="h-7 text-xs bg-[#22c55e] text-white hover:bg-[#16a34a] px-2.5"
                              >
                                Collect
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Dialog Modals ── */}
      {isAddDeptOpen && (
        <AddDepartmentModal
          onClose={() => setIsAddDeptOpen(false)}
          onSubmit={handleAddDepartment}
        />
      )}

      {isUploadCsvOpen && (
        <UploadStudentsCsvModal
          departments={departments}
          selectedDept={selectedDept}
          onClose={() => setIsUploadCsvOpen(false)}
          onImport={handleImportCsvStudents}
        />
      )}

      {isEnrollOpen && (
        <EnrollStudentModal
          departments={departments}
          selectedDept={selectedDept}
          onClose={() => setIsEnrollOpen(false)}
          onSubmit={(newSt) => setStudents((prev) => [newSt, ...prev])}
        />
      )}

      {statementStudent && (
        <StudentStatementModal
          student={statementStudent}
          transactions={transactions}
          onClose={() => setStatementStudent(null)}
        />
      )}

      {collectStudent && (
        <StudentCollectModal
          student={collectStudent}
          onClose={() => setCollectStudent(null)}
          onSubmit={handleCollectPayment}
        />
      )}

      {editDept && (
        <EditDepartmentModal
          dept={editDept}
          onClose={() => setEditDept(null)}
          onSubmit={handleEditDepartment}
        />
      )}

      {editStudent && (
        <EditStudentModal
          student={editStudent}
          onClose={() => setEditStudent(null)}
          onSubmit={handleEditStudent}
        />
      )}
    </AppShell>
  );
}
