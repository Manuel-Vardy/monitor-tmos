import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import {
  Banknote,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Receipt,
  FileSpreadsheet,
  X,
  Layers,
  Check,
  Building2,
  Calendar,
  CreditCard,
  Phone,
  Coins,
  ArrowUpDown,
  Filter,
  Pencil,
  Trash2,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { currency } from "@/lib/mos-data";
import {
  SCHOOL_STUDENTS,
  FEE_TRANSACTIONS,
  type Student,
  type FeeTransaction,
} from "@/lib/school-data";
import { useAcademicYear } from "@/contexts/academic-year-context";
import { cn } from "@/lib/utils";
import { AppSelect } from "@/components/app-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/fees")({
  head: () => ({
    meta: [
      { title: "Fee Management & Fee Types — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Tertiary fee management: fees to be paid, fee schedules by type, and fee collection ledger.",
      },
      { property: "og:title", content: "Fee Management — Trite Merchant OS" },
    ],
  }),
  component: FeeManagementPage,
});

export type FeeTypeItem = {
  id: string;
  code: string;
  name: string;
  category: "Academic Core" | "Faculty & Lab" | "Assessment" | "Infrastructure" | "Statutory Dues" | "Services";
  amount: number;
  frequency: "Per Semester" | "Per Academic Year" | "One-Time";
  isCompulsory: boolean;
  description: string;
};

const INITIAL_FEE_TYPES: FeeTypeItem[] = [
  {
    id: "fee-tui",
    code: "TUI-101",
    name: "Tuition Fee (Core Academic)",
    category: "Academic Core",
    amount: 2400,
    frequency: "Per Semester",
    isCompulsory: true,
    description: "Main faculty lecture instruction, course module materials, and academic syllabus",
  },
  {
    id: "fee-lab",
    code: "LAB-201",
    name: "Faculty & Practical Laboratory Fee",
    category: "Faculty & Lab",
    amount: 350,
    frequency: "Per Semester",
    isCompulsory: true,
    description: "Computing lab access, specialized software licenses, and technical workshop supplies",
  },
  {
    id: "fee-exm",
    code: "EXM-301",
    name: "Examination & Assessment Levy",
    category: "Assessment",
    amount: 250,
    frequency: "Per Semester",
    isCompulsory: true,
    description: "End-of-semester examination processing, invigilation, and transcript records",
  },
  {
    id: "fee-ict",
    code: "ICT-102",
    name: "Library & ICT Infrastructure Levy",
    category: "Infrastructure",
    amount: 150,
    frequency: "Per Semester",
    isCompulsory: true,
    description: "Campus high-speed Wi-Fi, digital library database access, and e-learning portals",
  },
  {
    id: "fee-src",
    code: "SRC-101",
    name: "SRC & Student Development Dues",
    category: "Statutory Dues",
    amount: 100,
    frequency: "Per Semester",
    isCompulsory: true,
    description: "Student Representative Council activities, welfare fund, and student union dues",
  },
];

function getStudentDept(s: Student): string {
  if (s.department) return s.department;
  const id = s.studentId || "";
  if (id.includes("-IT") || id.includes("-C01") || id.includes("-P6") || id.includes("-J3"))
    return "IT Department";
  if (id.includes("-HR") || id.includes("-C02") || id.includes("-P5") || id.includes("-J2"))
    return "HR Department";
  if (id.includes("-SOC") || id.includes("-N101") || id.includes("-N102") || id.includes("-P4") || id.includes("-J1"))
    return "Social Studies Department";
  if (id.includes("-ART") || id.includes("-N201") || id.includes("-P3") || id.includes("-K101"))
    return "Art Department";
  if (id.includes("-BUS") || id.includes("-K102") || id.includes("-P2") || id.includes("-J202"))
    return "Business Administration";
  if (id.includes("-ACC") || id.includes("-K201") || id.includes("-P1"))
    return "Accounting & Finance";
  return "IT Department";
}

const TERTIARY_DEPTS = [
  "IT Department",
  "HR Department",
  "Social Studies Department",
  "Art Department",
  "Business Administration",
  "Accounting & Finance",
] as const;

function getTxDept(tx: FeeTransaction, students: Student[]): string {
  const st = students.find((s) => s.studentId === tx.studentId || s.name === tx.studentName);
  if (st) return getStudentDept(st);
  const id = tx.studentId || "";
  if (id.includes("-IT") || id.includes("-C01") || id.includes("-P6") || id.includes("-J3"))
    return "IT Department";
  if (id.includes("-HR") || id.includes("-C02") || id.includes("-P5") || id.includes("-J2"))
    return "HR Department";
  if (id.includes("-SOC") || id.includes("-N101") || id.includes("-N102") || id.includes("-P4") || id.includes("-J1"))
    return "Social Studies Department";
  if (id.includes("-ART") || id.includes("-N201") || id.includes("-P3") || id.includes("-K101"))
    return "Art Department";
  if (id.includes("-BUS") || id.includes("-K102") || id.includes("-P2") || id.includes("-J202"))
    return "Business Administration";
  if (id.includes("-ACC") || id.includes("-K201") || id.includes("-P1"))
    return "Accounting & Finance";
  return "IT Department";
}

// ── Modals ──

function AddFeeTypeModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (feeType: FeeTypeItem) => void;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState<FeeTypeItem["category"]>("Academic Core");
  const [amount, setAmount] = useState("300");
  const [frequency, setFrequency] = useState<FeeTypeItem["frequency"]>("Per Semester");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;
    onSubmit({
      id: `fee-${Date.now()}`,
      code: code.trim().toUpperCase() || `FEE-${Math.floor(Math.random() * 900) + 100}`,
      name: name.trim(),
      category,
      amount: Number(amount) || 0,
      frequency,
      isCompulsory: true,
      description: "Institutional student fee item",
    });
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
          <div>
            <h2 className="text-base font-bold">Add Type of Fee to be Paid</h2>
            <p className="text-xs text-muted-foreground">Define a new fee category or schedule</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Fee Type Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Examination & Assessment Levy"
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Fee Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. EXM-301"
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Amount (GH₵)
              </label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="250"
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Fee Category
              </label>
              <AppSelect
                value={category}
                onChange={(val) => setCategory(val as any)}
                options={[
                  { value: "Academic Core", label: "Academic Core" },
                  { value: "Faculty & Lab", label: "Faculty & Lab" },
                  { value: "Assessment", label: "Assessment" },
                  { value: "Infrastructure", label: "Infrastructure" },
                  { value: "Statutory Dues", label: "Statutory Dues" },
                  { value: "Services", label: "Services" },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Billing Frequency
              </label>
              <AppSelect
                value={frequency}
                onChange={(val) => setFrequency(val as any)}
                options={[
                  { value: "Per Semester", label: "Per Semester" },
                  { value: "Per Academic Year", label: "Per Year" },
                  { value: "One-Time", label: "One-Time" },
                ]}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a] gap-1.5">
              <Check className="size-4" /> Save Fee Type
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CollectFeePaymentModal({
  students,
  feeTypes,
  onClose,
  onSubmit,
}: {
  students: Student[];
  feeTypes: FeeTypeItem[];
  onClose: () => void;
  onSubmit: (tx: FeeTransaction, feeTypeId: string) => void;
}) {
  const PAYMENT_METHODS = ["Mobile Money (MTN)", "Bank Transfer"] as const;

  const [studentId, setStudentId] = useState(students[0]?.studentId ?? "");
  const selectedStudent = students.find((s) => s.studentId === studentId) ?? students[0];
  const [selectedFeeType, setSelectedFeeType] = useState(feeTypes[0]?.name ?? "Tuition Fee (Core Academic)");
  const [amount, setAmount] = useState(
    selectedStudent ? String(selectedStudent.balanceDue > 0 ? selectedStudent.balanceDue : selectedStudent.tuitionFee) : "500"
  );
  const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number]>("Mobile Money (MTN)");

  const handleStudentChange = (id: string) => {
    setStudentId(id);
    const stu = students.find((s) => s.studentId === id);
    if (stu) {
      setAmount(String(stu.balanceDue > 0 ? stu.balanceDue : stu.tuitionFee));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paid = Number(amount) || 0;
    if (!selectedStudent || paid <= 0) return;

    const today = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const tx: FeeTransaction = {
      id: `REC-${Date.now()}`,
      receiptNo: `RCP-2026-0${Math.floor(Math.random() * 9000) + 1000}`,
      studentId: selectedStudent.studentId,
      schoolId: selectedStudent.schoolId,
      studentName: selectedStudent.name,
      amountPaid: paid,
      paymentMethod: method,
      date: today,
      term: selectedStudent.term,
      receivedBy: "Bursar Department",
    };

    onSubmit(tx, selectedFeeType);
    onClose();
  };

  const inputClass =
    "h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-accent";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-card shadow-2xl border border-border p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-lg font-bold">Collect Fee Payment</h2>
            <p className="text-xs text-muted-foreground">
              Record fee collection for a student account
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Select Student *
            </label>
            <Select value={studentId} onValueChange={(val) => handleStudentChange(val)}>
              <SelectTrigger className="h-9 w-full text-sm font-medium">
                <SelectValue placeholder="Select student..." />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.studentId}>
                    {s.name} ({s.studentId}) — Balance: {currency(s.balanceDue)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStudent && (
            <div className="rounded-lg bg-secondary/40 px-3 py-2 text-xs flex justify-between items-center text-muted-foreground">
              <span>
                Department: <strong className="text-foreground">{getStudentDept(selectedStudent)}</strong>
              </span>
              <span>
                Balance:{" "}
                <strong className={selectedStudent.balanceDue > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}>
                  {currency(selectedStudent.balanceDue)}
                </strong>
              </span>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Type of Fee to be Paid *
            </label>
            <Select value={selectedFeeType} onValueChange={setSelectedFeeType}>
              <SelectTrigger className="h-9 w-full text-sm font-medium">
                <SelectValue placeholder="Select fee type..." />
              </SelectTrigger>
              <SelectContent>
                {feeTypes.map((ft) => (
                  <SelectItem key={ft.id} value={ft.name}>
                    {ft.name} ({currency(ft.amount)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Amount Collected (GH₵) *
            </label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Payment Method *
            </label>
            <Select value={method} onValueChange={(val) => setMethod(val as any)}>
              <SelectTrigger className="h-9 w-full text-sm font-medium">
                <SelectValue placeholder="Select method..." />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

// ── Main Page Component ──

// ── Delete Confirmation Modal ─────────────────────────────────────────────────

function DeleteFeeTypeModal({
  feeType,
  onClose,
  onConfirm,
}: {
  feeType: FeeTypeItem;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [input, setInput] = useState("");
  const matches = input.trim().toLowerCase() === feeType.name.trim().toLowerCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border pb-3 gap-3">
          <div>
            <h2 className="text-base font-bold text-foreground">Remove Fee Type</h2>
            <p className="text-xs text-muted-foreground mt-0.5">This action cannot be undone.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary transition-colors shrink-0">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-3.5 text-sm text-rose-700 dark:text-rose-400">
            <p>You are about to permanently remove <strong>"{feeType.name}"</strong> from your fee schedule. This will not affect payments already recorded against this fee type, but it will no longer appear as an active fee category for future collections.</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-muted-foreground">
              To confirm, type the name of the fee type below:
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={feeType.name}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-rose-500 placeholder:text-muted-foreground/50"
            />
            {input.length > 0 && !matches && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400">Name does not match. Please type the exact fee type name.</p>
            )}
            {matches && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400">✓ Name confirmed. You may proceed.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!matches}
            onClick={onConfirm}
            className="bg-rose-600 text-white hover:bg-rose-700 gap-1.5 disabled:opacity-50"
          >
            <Trash2 className="size-3.5" /> Remove Fee Type
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Fee Type Modal ────────────────────────────────────────────────────────

function EditFeeTypeModal({
  feeType,
  onClose,
  onSubmit,
}: {
  feeType: FeeTypeItem;
  onClose: () => void;
  onSubmit: (updated: FeeTypeItem) => void;
}) {
  const [name, setName] = useState(feeType.name);
  const [code, setCode] = useState(feeType.code);
  const [category, setCategory] = useState<FeeTypeItem["category"]>(feeType.category);
  const [amount, setAmount] = useState(String(feeType.amount));
  const [frequency, setFrequency] = useState<FeeTypeItem["frequency"]>(feeType.frequency);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;
    onSubmit({ ...feeType, name: name.trim(), code: code.trim().toUpperCase(), category, amount: Number(amount) || 0, frequency });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold">Edit Fee Type</h2>
            <p className="text-xs text-muted-foreground">Update the details for this fee category</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Fee Type Name *</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Fee Code</label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Amount (GH₵) *</label>
              <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Category</label>
              <AppSelect
                value={category}
                onChange={(val) => setCategory(val as FeeTypeItem["category"])}
                options={[
                  { value: "Academic Core", label: "Academic Core" },
                  { value: "Faculty & Lab", label: "Faculty & Lab" },
                  { value: "Assessment", label: "Assessment" },
                  { value: "Infrastructure", label: "Infrastructure" },
                  { value: "Statutory Dues", label: "Statutory Dues" },
                  { value: "Services", label: "Services" },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Frequency</label>
              <AppSelect
                value={frequency}
                onChange={(val) => setFrequency(val as FeeTypeItem["frequency"])}
                options={[
                  { value: "Per Semester", label: "Per Semester" },
                  { value: "Per Academic Year", label: "Per Academic Year" },
                  { value: "One-Time", label: "One-Time" },
                ]}
              />
            </div>
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

function FeeManagementPage() {
  const [tab, setTab] = useState<"fee-types" | "collected-ledger">("fee-types");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [feeTypes, setFeeTypes] = useState<FeeTypeItem[]>(INITIAL_FEE_TYPES);
  const [students, setStudents] = useState<Student[]>(SCHOOL_STUDENTS);
  const [transactions, setTransactions] = useState<FeeTransaction[]>(FEE_TRANSACTIONS);
  const [selectedLedgerDept, setSelectedLedgerDept] = useState<string>("all");
  const [isAddFeeTypeOpen, setIsAddFeeTypeOpen] = useState(false);
  const [deletingFeeType, setDeletingFeeType] = useState<FeeTypeItem | null>(null);
  const [editingFeeType, setEditingFeeType] = useState<FeeTypeItem | null>(null);
  const { filterStudentsByYear } = useAcademicYear();

  const yearFilteredStudents = useMemo(() => filterStudentsByYear(students), [students, filterStudentsByYear]);

  // ── Reactive Stats ──
  const totalFeesExpected = useMemo(() => {
    return yearFilteredStudents.reduce((sum, s) => sum + s.tuitionFee, 0);
  }, [yearFilteredStudents]);

  const totalFeesCollected = useMemo(() => {
    return yearFilteredStudents.reduce((sum, s) => sum + s.paidAmount, 0);
  }, [yearFilteredStudents]);

  const totalFeesArrears = useMemo(() => {
    return yearFilteredStudents.reduce((sum, s) => sum + s.balanceDue, 0);
  }, [yearFilteredStudents]);

  const collectionRate =
    totalFeesExpected > 0 ? Math.round((totalFeesCollected / totalFeesExpected) * 100) : 0;
  const clearedStudentsCount = yearFilteredStudents.filter((s) => s.status === "Paid Full").length;
  const overdueStudentsCount = yearFilteredStudents.filter((s) => s.status === "Overdue").length;

  // Per-department collected stats
  const deptCollectionStats = useMemo(() => {
    const stats: Record<string, { total: number; count: number }> = {};
    TERTIARY_DEPTS.forEach((d) => {
      stats[d] = { total: 0, count: 0 };
    });
    transactions.forEach((tx) => {
      const d = getTxDept(tx, students);
      if (!stats[d]) stats[d] = { total: 0, count: 0 };
      stats[d].total += tx.amountPaid;
      stats[d].count += 1;
    });
    return stats;
  }, [transactions, students]);

  // Ledger transactions filtered by selected department
  const ledgerTransactions = useMemo(() => {
    if (selectedLedgerDept === "all") return transactions;
    return transactions.filter((tx) => getTxDept(tx, students) === selectedLedgerDept);
  }, [transactions, students, selectedLedgerDept]);

  const selectedDeptTotal = useMemo(() => {
    if (selectedLedgerDept === "all") return totalFeesCollected;
    return deptCollectionStats[selectedLedgerDept]?.total || 0;
  }, [selectedLedgerDept, totalFeesCollected, deptCollectionStats]);

  const handleRecordCollection = (tx: FeeTransaction, _feeTypeName: string) => {
    setTransactions((prev) => [tx, ...prev]);
    setStudents((prev) =>
      prev.map((s) => {
        if (s.studentId === tx.studentId) {
          const newPaid = s.paidAmount + tx.amountPaid;
          const newBalance = Math.max(0, s.tuitionFee - newPaid);
          const newStatus: Student["status"] =
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

  const handleAddFeeType = (newFt: FeeTypeItem) => {
    setFeeTypes((prev) => [...prev, newFt]);
  };

  const handleEditFeeType = (updated: FeeTypeItem) => {
    setFeeTypes((prev) => prev.map((ft) => ft.id === updated.id ? updated : ft));
  };

  const handleDeleteFeeType = (id: string) => {
    setFeeTypes((prev) => prev.filter((ft) => ft.id !== id));
    setDeletingFeeType(null);
  };

  // Filtered Students Due
  const filteredStudents = useMemo(() => {
    if (!search.trim()) return yearFilteredStudents;
    const q = search.toLowerCase();
    return yearFilteredStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.guardianPhone.toLowerCase().includes(q) ||
        getStudentDept(s).toLowerCase().includes(q)
    );
  }, [yearFilteredStudents, search]);

  // Filtered Ledger Transactions
  const filteredTransactions = useMemo(() => {
    if (!search.trim()) return transactions;
    const q = search.toLowerCase();
    return transactions.filter(
      (tx) =>
        tx.receiptNo.toLowerCase().includes(q) ||
        tx.studentName.toLowerCase().includes(q) ||
        tx.studentId.toLowerCase().includes(q) ||
        tx.paymentMethod.toLowerCase().includes(q)
    );
  }, [transactions, search]);

  return (
    <AppShell
      title="Fee Management & Collection Ledger"
      subtitle={<span className="hidden sm:inline">{`${feeTypes.length} active fee schedules · ${currency(totalFeesCollected)} collected (${collectionRate}%) · ${currency(totalFeesArrears)} outstanding fees to be paid`}</span>}
      actions={
        <Button
          size="sm"
          onClick={() => setIsAddFeeTypeOpen(true)}
          className="h-8 px-3 text-xs bg-[#22c55e] text-white hover:bg-[#16a34a] gap-1.5"
        >
          <Plus className="size-3.5" />
          <span>Add Fee Type</span>
        </Button>
      }
    >
      {/* ══════════════════════════════════════════════
          1. TOP STATS: FEES TO BE PAID & COLLECTED
      ══════════════════════════════════════════════ */}
      <div className="mb-6">
        {/* ── MOBILE: green hero + 3 stacked cards ── */}
        <div className="lg:hidden space-y-2.5">
          <div className="relative rounded-2xl bg-[#22c55e] p-5 shadow-lg text-white overflow-hidden">
            <div className="pointer-events-none absolute rounded-full bg-white/10"
              style={{ width: "260px", height: "260px", bottom: "-120px", right: "-60px" }} />
            <div className="relative z-10">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/80">Fees to be Paid (Expected)</p>
              <p className="mt-2 text-3xl font-extrabold num">{currency(totalFeesExpected)}</p>
              <p className="mt-1 text-[11px] text-white/75">
                Across {yearFilteredStudents.length} enrolled students
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
              <div className="flex items-start justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Fees Collected</p>
                <span className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" />
                </span>
              </div>
              <p className="mt-2 text-base font-extrabold text-foreground num">{currency(totalFeesCollected)}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{clearedStudentsCount} cleared · {collectionRate}% rate</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
              <div className="flex items-start justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Fee Arrears (To be Paid)</p>
                <span className="rounded-lg bg-rose-50 p-1.5 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                  <AlertCircle className="size-3.5" />
                </span>
              </div>
              <p className="mt-2 text-base font-extrabold text-foreground num">{currency(totalFeesArrears)}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{overdueStudentsCount} overdue accounts</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
              <div className="flex items-start justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Fee Types</p>
                <span className="rounded-lg bg-purple-50 p-1.5 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                  <Layers className="size-3.5" />
                </span>
              </div>
              <p className="mt-2 text-base font-extrabold text-foreground num">{feeTypes.length} Categories</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Structured institutional fee schedules</p>
            </div>
          </div>
        </div>

        {/* ── DESKTOP: original 4-card grid ── */}
        <div className="hidden lg:grid gap-3 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">Fees to be Paid (Expected)</p>
              <span className="rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <Banknote className="size-4" />
              </span>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-extrabold text-foreground num">{currency(totalFeesExpected)}</p>
            <p className="mt-0.5 text-xs font-semibold text-foreground/90">Total expected fees across {yearFilteredStudents.length} enrolled students</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">Fees Collected</p>
              <span className="rounded-full bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
              </span>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 num">{currency(totalFeesCollected)}</p>
            <p className="mt-0.5 text-xs font-semibold text-foreground/90">{clearedStudentsCount} students cleared · {collectionRate}% fulfillment rate</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">Fee Arrears (To be Paid)</p>
              <span className="rounded-full bg-rose-50 p-2 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                <AlertCircle className="size-4" />
              </span>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400 num">{currency(totalFeesArrears)}</p>
            <p className="mt-0.5 text-xs font-semibold text-foreground/90">{overdueStudentsCount} overdue accounts with balance due</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">Active Fee Types</p>
              <span className="rounded-full bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                <Layers className="size-4" />
              </span>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-extrabold text-purple-600 dark:text-purple-400 num">{feeTypes.length} Categories</p>
            <p className="mt-0.5 text-xs font-semibold text-foreground/90">Structured institutional fee schedules</p>
          </div>
        </div>
      </div>
      {/* ══════════════════════════════════════════════
          2. NAVIGATION TABS: FEE TYPES | DUE | COLLECTED
      ══════════════════════════════════════════════ */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-1.5 bg-secondary/50 p-1 rounded-xl">
            <button
              onClick={() => setTab("fee-types")}
              className={cn(
                "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all",
                tab === "fee-types"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Types of Fee to be Paid ({feeTypes.length})
            </button>
            <button
              onClick={() => setTab("collected-ledger")}
              className={cn(
                "px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all",
                tab === "collected-ledger"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Fees Collected Ledger ({transactions.length})
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            TAB 1: TYPES OF FEE TO BE PAID (SCHEDULES)
        ══════════════════════════════════════════════ */}
        {tab === "fee-types" && (
          <div className="space-y-4">
            <div className="hidden sm:flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Institutional Fee Types & Schedules</h3>
                <p className="text-xs text-muted-foreground">
                  Categories of fees to be paid per student, billing amounts, and collection fulfillment
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsAddFeeTypeOpen(true)}
                className="h-8 text-xs bg-[#22c55e] text-white hover:bg-[#16a34a] gap-1.5"
              >
                <Plus className="size-3.5" />
                <span>Add Fee Type</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {feeTypes.map((ft, idx) => {
                // Each fee type's share of the total expected billing
                const totalFeeTypeBilling = feeTypes.reduce((s, f) => s + f.amount, 0);
                const ftShare = totalFeeTypeBilling > 0 ? ft.amount / totalFeeTypeBilling : 1 / feeTypes.length;

                // Distribute the real totals proportionally across fee types.
                // For the last fee type, use the remainder to avoid rounding drift.
                const isLast = idx === feeTypes.length - 1;
                const prevCollected = feeTypes
                  .slice(0, idx)
                  .reduce((s, f) => {
                    const share = totalFeeTypeBilling > 0 ? f.amount / totalFeeTypeBilling : 1 / feeTypes.length;
                    return s + Math.round(totalFeesCollected * share);
                  }, 0);
                const prevArrears = feeTypes
                  .slice(0, idx)
                  .reduce((s, f) => {
                    const share = totalFeeTypeBilling > 0 ? f.amount / totalFeeTypeBilling : 1 / feeTypes.length;
                    return s + Math.round(totalFeesArrears * share);
                  }, 0);

                const collectedAmount = isLast
                  ? totalFeesCollected - prevCollected
                  : Math.round(totalFeesCollected * ftShare);
                const remainingArrears = isLast
                  ? totalFeesArrears - prevArrears
                  : Math.round(totalFeesArrears * ftShare);
                const targetBilling = collectedAmount + remainingArrears;

                return (
                  <div
                    key={ft.id}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:shadow-lg hover:bg-secondary/20 text-left"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            {ft.category}
                          </span>
                          <h4 className="text-base font-bold text-foreground mt-1.5">{ft.name}</h4>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setEditingFeeType(ft)}
                            className="grid size-7 place-items-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Edit fee type"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingFeeType(ft)}
                            className="grid size-7 place-items-center rounded-lg hover:bg-rose-50 text-muted-foreground hover:text-rose-600 transition-colors dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                            aria-label="Delete fee type"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl bg-secondary/40 p-3 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground font-medium">Fee to be Paid:</span>
                          <span className="font-bold text-foreground">{currency(ft.amount)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground font-medium">Frequency:</span>
                          <span className="font-semibold text-muted-foreground">{ft.frequency}</span>
                        </div>
                        <div className="pt-2 border-t border-border/50 flex justify-between items-center text-xs">
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Fees Collected:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{currency(collectedAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-rose-600 dark:text-rose-400 font-medium">Outstanding to be Paid:</span>
                          <span className="font-bold text-rose-600 dark:text-rose-400">{currency(remainingArrears)}</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] font-semibold mb-1">
                          <span className="text-muted-foreground">Collection Settlement</span>
                          <span className="font-bold text-foreground">{collectionRate}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              collectionRate >= 80 ? "bg-emerald-500" : collectionRate >= 40 ? "bg-amber-500" : "bg-rose-500"
                            )}
                            style={{ width: `${Math.min(100, collectionRate)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB 2: FEES COLLECTED LEDGER (BY DEPARTMENT)
        ══════════════════════════════════════════════ */}
        {tab === "collected-ledger" && (
          <div className="space-y-4">
            {/* Department Header for Ledger */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Fees Collected by Department</h3>
                <p className="text-xs text-muted-foreground">
                  Click any department below to view its specific fee collection transactions
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {selectedLedgerDept === "all" ? "Total Collected" : `${selectedLedgerDept} Total`}:
                </p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {currency(selectedDeptTotal)}
                </p>
              </div>
            </div>

            {/* Department Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedLedgerDept("all")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-all border shrink-0",
                  selectedLedgerDept === "all"
                    ? "bg-foreground text-background border-transparent"
                    : "bg-card text-muted-foreground border-border hover:bg-secondary"
                )}
              >
                All Departments ({transactions.length})
              </button>

              {(
                [
                  { dept: "IT Department",             activeBg: "bg-violet-600",  activeBorder: "border-violet-600",  activeText: "text-violet-100",  idleText: "text-violet-600 dark:text-violet-400" },
                  { dept: "HR Department",             activeBg: "bg-sky-600",     activeBorder: "border-sky-600",     activeText: "text-sky-100",     idleText: "text-sky-600 dark:text-sky-400" },
                  { dept: "Social Studies Department", activeBg: "bg-amber-600",   activeBorder: "border-amber-600",   activeText: "text-amber-100",   idleText: "text-amber-600 dark:text-amber-400" },
                  { dept: "Art Department",            activeBg: "bg-pink-600",    activeBorder: "border-pink-600",    activeText: "text-pink-100",    idleText: "text-pink-600 dark:text-pink-400" },
                  { dept: "Business Administration",   activeBg: "bg-orange-600",  activeBorder: "border-orange-600",  activeText: "text-orange-100",  idleText: "text-orange-600 dark:text-orange-400" },
                  { dept: "Accounting & Finance",      activeBg: "bg-teal-600",    activeBorder: "border-teal-600",    activeText: "text-teal-100",    idleText: "text-teal-600 dark:text-teal-400" },
                ] as const
              ).map(({ dept, activeBg, activeBorder, activeText, idleText }) => {
                const stats = deptCollectionStats[dept] || { total: 0, count: 0 };
                const isSelected = selectedLedgerDept === dept;
                return (
                  <button
                    key={dept}
                    onClick={() => setSelectedLedgerDept(dept)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold transition-all border shrink-0 flex items-center gap-1.5",
                      isSelected
                        ? `${activeBg} text-white ${activeBorder}`
                        : "bg-card text-muted-foreground border-border hover:bg-secondary"
                    )}
                  >
                    <span>{dept.split(" ")[0]}</span>
                    <span className={cn("text-[11px] font-bold", isSelected ? activeText : idleText)}>
                      {currency(stats.total)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Ledger Table filtered by department */}
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-secondary/40 text-xs font-bold text-muted-foreground uppercase border-b border-border">
                    <tr>
                      <th className="px-5 py-3">Receipt No</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Student Name</th>
                      <th className="px-5 py-3">Index Number</th>
                      <th className="px-5 py-3">Department</th>
                      <th className="px-5 py-3">Payment Method</th>
                      <th className="px-5 py-3 text-right font-bold">Fees Collected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ledgerTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-xs text-muted-foreground">
                          No fee collection transactions recorded for{" "}
                          {selectedLedgerDept === "all" ? "the institution" : selectedLedgerDept}.
                        </td>
                      </tr>
                    ) : (
                      ledgerTransactions.map((tx) => {
                        const dept = getTxDept(tx, students);
                        return (
                          <tr key={tx.id} className="hover:bg-secondary/30 transition-colors">
                            <td className="px-5 py-3 font-mono text-xs font-semibold text-foreground">
                              {tx.receiptNo}
                            </td>
                            <td className="px-5 py-3 text-xs text-muted-foreground">{tx.date}</td>
                            <td className="px-5 py-3 font-semibold text-foreground">{tx.studentName}</td>
                            <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{tx.studentId}</td>
                            <td className="px-5 py-3 text-xs font-medium text-foreground">{dept}</td>
                            <td className="px-5 py-3">
                              <span className="rounded-md bg-secondary px-2.5 py-0.5 text-xs font-medium text-foreground">
                                {tx.paymentMethod}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                              {currency(tx.amountPaid)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Dialog Modals ── */}
      {isAddFeeTypeOpen && (
        <AddFeeTypeModal onClose={() => setIsAddFeeTypeOpen(false)} onSubmit={handleAddFeeType} />
      )}
      {editingFeeType && (
        <EditFeeTypeModal feeType={editingFeeType} onClose={() => setEditingFeeType(null)} onSubmit={handleEditFeeType} />
      )}
      {deletingFeeType && (
        <DeleteFeeTypeModal feeType={deletingFeeType} onClose={() => setDeletingFeeType(null)} onConfirm={() => handleDeleteFeeType(deletingFeeType.id)} />
      )}
    </AppShell>
  );
}
