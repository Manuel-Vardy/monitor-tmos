import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useRef } from "react";
import type { DateRange } from "react-day-picker";
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Award,
  Crown,
  UserCheck,
  Wallet,
  Coins,
  FolderKanban,
  FileSpreadsheet,
  Upload,
  Download,
  X,
  Check,
  Tag,
  Receipt,
  Printer,
  Edit,
  Trash2,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/date-range-picker";
import { StatusBadge } from "@/components/status-badge";
import { currency } from "@/lib/mos-data";
import {
  NGO_MEMBERS,
  DEFAULT_CHURCH_PAYMENT_TYPES,
  CHURCH_PAYMENT_RECORDS,
  type NgoMember,
  type ChurchPaymentType,
  type ChurchPaymentRecord,
} from "@/lib/ngo-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/members")({
  head: () => ({
    meta: [
      { title: "Dues & Payment — Trite Merchant OS" },
      {
        name: "description",
        content:
          "Church dues, tithes, welfare collections, project funding, custom payment types, and bulk CSV member enrollment.",
      },
      { property: "og:title", content: "Dues & Payment — Trite Merchant OS" },
    ],
  }),
  component: DuesAndPaymentPage,
});

type Role = NgoMember["role"];

const ROLE_CONFIG: Record<Role, { icon: React.ElementType; color: string; bg: string }> = {
  "Pastor / Minister": {
    icon: Crown,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
  },
  "Elder / Deacon": {
    icon: Award,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
  },
  "Board Member": {
    icon: UserCheck,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
  },
  "Welfare Committee": {
    icon: Wallet,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800",
  },
  "Youth Leader": {
    icon: Users,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
  },
  Member: {
    icon: Users,
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800",
  },
};

// ── 1. Modal: Add New Custom Payment Type ──
function AddPaymentTypeModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: Omit<ChurchPaymentType, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ChurchPaymentType["category"]>("Tithe");
  const [customCategory, setCustomCategory] = useState("");
  const [defaultAmount, setDefaultAmount] = useState(100);
  const [frequency, setFrequency] = useState<ChurchPaymentType["frequency"]>("Monthly");
  const [isProject, setIsProject] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      category: category === "Other" && customCategory.trim()
        ? (customCategory.trim() as ChurchPaymentType["category"])
        : category,
      defaultAmount: Number(defaultAmount) || 0,
      frequency,
      isProject,
      projectName: isProject ? projectName.trim() || name.trim() : undefined,
      description: description.trim(),
    });
  };

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
          <div className="flex items-center gap-2">
            <Coins className="size-5 text-[#22c55e]" />
            <h2 className="text-base font-bold text-foreground">Create Church Payment Type</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-secondary transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
              Payment Name *
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cathedral Building Fund, Harvest, Youth Bus"
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const cat = e.target.value as ChurchPaymentType["category"];
                  setCategory(cat);
                  if (cat === "Project") setIsProject(true);
                }}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="Tithe">Tithe</option>
                <option value="Offering">Sunday Offering</option>
                <option value="Welfare">Welfare</option>
                <option value="Project">Church Project</option>
                <option value="Dues">Membership Dues</option>
                <option value="Special">Special Thanksgiving</option>
                <option value="Other">Other (specify)</option>
              </select>
              {category === "Other" && (
                <input
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category"
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent mt-1.5"
                />
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                Default Target (GH₵)
              </label>
              <input
                type="number"
                min="0"
                value={defaultAmount}
                onChange={(e) => setDefaultAmount(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
              Payment Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as any)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="Weekly">Weekly (Every Sunday)</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Annual">Annual / Once a Year</option>
              <option value="One-Time">One-Time Contribution</option>
              <option value="None">None</option>
            </select>
          </div>

          {/* ── PROJECT CHECKBOX ── */}
          <div className="rounded-xl border border-border bg-secondary/30 p-3 space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isProject}
                onChange={(e) => setIsProject(e.target.checked)}
                className="size-4 rounded border-border text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
              />
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <FolderKanban className="size-3.5 text-accent" />
                <span>This payment is designated for a church project</span>
              </div>
            </label>

            {isProject && (
              <div className="pt-1.5">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                  Project Title / Initiative Name
                </label>
                <input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Cathedral Auditorium Construction"
                  className="w-full h-8 px-2.5 rounded-md border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
              Description / Ministry Purpose
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context on where funds will be allocated..."
              className="w-full p-2.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-[#22c55e] text-white hover:bg-[#16a34a]">
              Create Payment Type
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── 2. Modal: CSV Bulk Member Import & Payment Assignment ──
function CsvImportModal({
  availablePaymentTypes,
  onClose,
  onImportSuccess,
}: {
  availablePaymentTypes: ChurchPaymentType[];
  onClose: () => void;
  onImportSuccess: (newMembers: NgoMember[]) => void;
}) {
  const [csvText, setCsvText] = useState("");
  const [selectedDefaultPayments, setSelectedDefaultPayments] = useState<string[]>([
    "Tithe",
    "Welfare",
  ]);
  const [markAsProject, setMarkAsProject] = useState(false);
  const [projectName, setProjectName] = useState("Cathedral Building Project");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleCsv = `Member Name,Phone,Payment Types,Amount Paid
Rev. Isaac Donkor,+233 24 555 0101,Tithe,1500
Deaconess Mary Ansah,+233 20 888 0202,Tithe,800
Bro Joshua Mensah,+233 27 777 0303,Sunday General Offering,300
Sis Grace Koomson,+233 54 222 0404,Welfare,500`;

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "church_members_import_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) setCsvText(text);
    };
    reader.readAsText(file);
  };

  const handleProcessImport = () => {
    const lines = csvText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length <= 1) {
      alert("Please upload a valid CSV with at least one member row.");
      return;
    }

    const startIndex = lines[0]?.toLowerCase().includes("name") ? 1 : 0;
    const parsedMembers: NgoMember[] = [];

    for (let i = startIndex; i < lines.length; i++) {
      const parts = lines[i]!.split(",").map((p) => p.replace(/^"|"$/g, "").trim());
      if (parts.length < 1 || !parts[0]) continue;

      const name = parts[0];
      const roleStr = parts[1] || "Member";
      const phone = parts[2] || "+233 20 000 0000";
      const email = parts[3] || `${name.toLowerCase().replace(/\s+/g, ".")}@church.org`;
      const tithe = Number(parts[4]) || 500;
      const welfare = Number(parts[5]) || 50;
      const projectAmt = Number(parts[6]) || (markAsProject ? 500 : 0);

      const assigned = [...selectedDefaultPayments];
      if (markAsProject && !assigned.some((a) => a.toLowerCase().includes("project"))) {
        assigned.push(projectName);
      }

      const totalTarget = tithe * 12 + welfare * 12 + projectAmt;
      const totalPaid = Math.round(totalTarget * 0.7);
      const balanceDue = Math.max(0, totalTarget - totalPaid);

      parsedMembers.push({
        id: `MEM-${Date.now()}-${i}`,
        memberId: `CHU-MBR-${String(100 + i).padStart(3, "0")}`,
        name,
        role: (roleStr as Role) || "Member",
        email,
        phone,
        assignedPaymentTypes: assigned,
        annualDues: totalTarget,
        duesPaid: totalPaid,
        duesStatus: balanceDue === 0 ? "Paid" : "Outstanding",
        monthlyTithe: tithe,
        welfarePaid: welfare * 12,
        projectContributions: projectAmt,
        totalPaid,
        balanceDue,
        joinedDate: "Aug 2026",
      });
    }

    if (parsedMembers.length === 0) {
      alert("Could not parse any member records from the CSV.");
      return;
    }

    onImportSuccess(parsedMembers);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-card shadow-2xl border border-border p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="size-5 text-[#22c55e]" />
            <div>
              <h2 className="text-base font-bold text-foreground">
                Automatic CSV Member & Payment Assignment
              </h2>
              <p className="text-xs text-muted-foreground">
                Import church members from a spreadsheet and automatically assign payment
                obligations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-secondary transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Column 1: Payment Assignment Settings */}
          <div className="space-y-3 rounded-xl border border-border bg-secondary/20 p-4">
            <h3 className="font-bold text-foreground text-xs uppercase tracking-wide flex items-center gap-1.5">
              <Tag className="size-3.5 text-accent" />
              1. Assign Payment Types
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Select which church payments to automatically assign to the imported members:
            </p>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {availablePaymentTypes.map((pt) => {
                const isSelected = selectedDefaultPayments.includes(pt.name);
                return (
                  <label
                    key={pt.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-border bg-card cursor-pointer hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDefaultPayments([...selectedDefaultPayments, pt.name]);
                          } else {
                            setSelectedDefaultPayments(
                              selectedDefaultPayments.filter((p) => p !== pt.name),
                            );
                          }
                        }}
                        className="size-3.5 rounded border-border text-emerald-600 accent-emerald-600"
                      />
                      <span className="font-semibold text-foreground text-xs">{pt.name}</span>
                    </div>
                    {pt.isProject && (
                      <span className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-1.5 py-0.5 rounded">
                        Project
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            {/* Project Checkbox */}
            <div className="pt-2 border-t border-border/60">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={markAsProject}
                  onChange={(e) => setMarkAsProject(e.target.checked)}
                  className="size-4 rounded border-border text-emerald-600 accent-emerald-600"
                />
                <span className="font-bold text-foreground text-[11px]">
                  Link member payments to a Church Project
                </span>
              </label>

              {markAsProject && (
                <div className="mt-2">
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                    Select Church Project
                  </label>
                  <select
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full h-8 px-2 rounded-md border border-border bg-background text-xs text-foreground focus:outline-none"
                  >
                    <option value="Cathedral Building Project">Cathedral Building Project</option>
                    <option value="Evangelism Bus Acquisition">Evangelism Bus Acquisition</option>
                    <option value="Community Welfare Fund">Community Welfare Fund</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Upload or Paste CSV */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wide flex items-center gap-1.5">
                <Upload className="size-3.5 text-accent" />
                2. CSV Data / File
              </h3>
              <button
                onClick={handleDownloadSample}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Download className="size-3" /> Template
              </button>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-emerald-500/60 rounded-xl p-3 text-center cursor-pointer bg-secondary/10 transition-colors"
            >
              <Upload className="size-5 mx-auto text-muted-foreground mb-1" />
              <p className="font-semibold text-xs text-foreground">Click to upload .csv file</p>
              <p className="text-[10px] text-muted-foreground">or paste CSV formatted text below</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                Paste / Preview CSV Data:
              </label>
              <textarea
                rows={4}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Name, Role, Phone, Email, MonthlyTithe, WelfareDues, ProjectAmount..."
                className="w-full p-2 rounded-lg border border-border bg-background font-mono text-[11px] text-foreground focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setCsvText(sampleCsv)}
            className="h-8 text-xs text-muted-foreground"
          >
            Load Sample Data
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleProcessImport}
              className="bg-[#22c55e] text-white hover:bg-[#16a34a] gap-1.5 h-8 text-xs"
            >
              <Upload className="size-3.5" />
              <span>Import & Assign Payments</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 3. Modal: Record Member Payment ──
function RecordPaymentModal({
  members,
  paymentTypes,
  initialMember,
  onClose,
  onRecordSuccess,
}: {
  members: NgoMember[];
  paymentTypes: ChurchPaymentType[];
  initialMember?: NgoMember | undefined;
  onClose: () => void;
  onRecordSuccess: (paymentRecord: ChurchPaymentRecord, updatedMember: NgoMember) => void;
}) {
  const [memberName, setMemberName] = useState(initialMember?.name || "");
  const [phone, setPhone] = useState(initialMember?.phone || "");
  const [selectedPaymentTypeName, setSelectedPaymentTypeName] = useState(
    paymentTypes[0]?.name || "Tithe",
  );
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<
    "Mobile Money" | "Bank Transfer" | "Cash Deposit"
  >("Mobile Money");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  // Auto-fill phone when typing a known member name
  const handleNameChange = (val: string) => {
    setMemberName(val);
    const match = members.find((m) => m.name.toLowerCase() === val.toLowerCase().trim());
    if (match && !phone) {
      setPhone(match.phone);
    }
  };

  const currentPaymentType = useMemo(
    () => paymentTypes.find((p) => p.name === selectedPaymentTypeName),
    [paymentTypes, selectedPaymentTypeName],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!memberName.trim() || !numAmount || numAmount <= 0) {
      alert("Please enter the member's name and a valid amount.");
      return;
    }

    const receiptNo = `RCP-CH-${Date.now().toString().slice(-6)}`;
    const isProject = Boolean(currentPaymentType?.isProject);
    const projectName = currentPaymentType?.projectName;

    const formattedDate = date
      ? new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    // Find existing member or create a new one
    const existingMember = members.find(
      (m) =>
        m.name.toLowerCase().trim() === memberName.toLowerCase().trim() ||
        (phone.trim() && m.phone.replace(/\s+/g, "") === phone.replace(/\s+/g, "")),
    );

    const memberId = existingMember
      ? existingMember.memberId
      : `CHU-MBR-${String(members.length + 101).padStart(3, "0")}`;

    const newRecord: ChurchPaymentRecord = {
      id: `TX-CH-${Date.now()}`,
      receiptNo,
      memberId,
      memberName: memberName.trim(),
      paymentType: selectedPaymentTypeName,
      category: currentPaymentType?.category || "Special",
      isProject,
      projectName,
      amount: numAmount,
      paymentMethod,
      date: formattedDate,
      receivedBy: "Treasury",
      status: "Confirmed",
    };

    let updatedMember: NgoMember;

    if (existingMember) {
      const newTotalPaid = existingMember.totalPaid + numAmount;
      const newBalanceDue = Math.max(0, existingMember.balanceDue - numAmount);
      const assigned = existingMember.assignedPaymentTypes || [];
      const newAssigned = assigned.includes(selectedPaymentTypeName)
        ? assigned
        : [...assigned, selectedPaymentTypeName];

      updatedMember = {
        ...existingMember,
        phone: phone.trim() || existingMember.phone,
        totalPaid: newTotalPaid,
        balanceDue: newBalanceDue,
        duesStatus: newBalanceDue === 0 ? "Paid" : "Outstanding",
        assignedPaymentTypes: newAssigned,
        projectContributions: isProject
          ? (existingMember.projectContributions || 0) + numAmount
          : existingMember.projectContributions,
        welfarePaid:
          currentPaymentType?.category === "Welfare"
            ? (existingMember.welfarePaid || 0) + numAmount
            : existingMember.welfarePaid,
        monthlyTithe:
          currentPaymentType?.category === "Tithe"
            ? (existingMember.monthlyTithe || 0) + numAmount
            : existingMember.monthlyTithe,
      };
    } else {
      // Create new member record
      updatedMember = {
        id: `MEM-${Date.now()}`,
        memberId,
        name: memberName.trim(),
        role: "Member",
        email: `${memberName.toLowerCase().replace(/\s+/g, ".")}@church.org`,
        phone: phone.trim() || "+233 20 000 0000",
        assignedPaymentTypes: [selectedPaymentTypeName],
        annualDues: numAmount,
        duesPaid: numAmount,
        duesStatus: "Paid",
        monthlyTithe: currentPaymentType?.category === "Tithe" ? numAmount : 0,
        welfarePaid: currentPaymentType?.category === "Welfare" ? numAmount : 0,
        projectContributions: isProject ? numAmount : 0,
        totalPaid: numAmount,
        balanceDue: 0,
        joinedDate: date,
      };
    }

    onRecordSuccess(newRecord, updatedMember);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-card shadow-2xl border border-border p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Receipt className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Record Member Church Payment</h2>
              <p className="text-xs text-muted-foreground">
                Receive and ledger Tithes, Offerings, Welfare, and Project funding
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-secondary transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Member Name and Telephone inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
                Member Name *
              </label>
              <input
                required
                list="church-members-list"
                value={memberName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Type member name..."
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent font-medium"
              />
              <datalist id="church-members-list">
                {members.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.phone}
                  </option>
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
                Telephone Number *
              </label>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +233 24 123 4567"
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent font-mono"
              />
            </div>
          </div>

          {/* Payment Type Selection & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
                Payment Type / Purpose *
              </label>
              <select
                value={selectedPaymentTypeName}
                onChange={(e) => setSelectedPaymentTypeName(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {paymentTypes.map((pt) => (
                  <option key={pt.id} value={pt.name}>
                    {pt.name} {pt.isProject ? " (Project 🏗️)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
                Amount Paid (GH₵) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount (GH₵)..."
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {/* Project Banner Indicator */}
          {currentPaymentType?.isProject && (
            <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 p-2.5 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
              <FolderKanban className="size-4 shrink-0 text-amber-600" />
              <span>
                <strong>Church Project Payment:</strong> This receipt will be designated for{" "}
                <span className="underline font-bold">
                  {currentPaymentType.projectName || currentPaymentType.name}
                </span>
                .
              </span>
            </div>
          )}

          {/* Payment Method & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="Mobile Money">Mobile Money (MoMo)</option>
                <option value="Bank Transfer">Bank Transfer / Direct Deposit</option>
                <option value="Cash Deposit">Cash / Physical Offering</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
                Payment Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-[#22c55e] text-white hover:bg-[#16a34a] gap-1.5"
            >
              <Check className="size-4" />
              <span>Record</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── 5. Main Dues & Payment Page Component ──
function DuesAndPaymentPage() {
  const [members, setMembers] = useState<NgoMember[]>(NGO_MEMBERS);
  const [paymentTypes, setPaymentTypes] = useState<ChurchPaymentType[]>(
    DEFAULT_CHURCH_PAYMENT_TYPES,
  );
  const [transactions, setTransactions] = useState<ChurchPaymentRecord[]>(CHURCH_PAYMENT_RECORDS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ChurchPaymentRecord["category"] | "all">("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [cardLabels, setCardLabels] = useState({
    "Church Collections": "Church Collections",
    "Tithe": "Tithe",
    "Sunday Offering": "Sunday Offering",
    "Welfare": "Welfare",
  });
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [draftLabel, setDraftLabel] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");

  // Modals
  const [isAddPaymentTypeOpen, setIsAddPaymentTypeOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedMemberForPayment, setSelectedMemberForPayment] = useState<NgoMember | undefined>(
    undefined,
  );

  const filteredPayments = useMemo(() => {
    const query = search.toLowerCase().trim();
    return transactions.filter((transaction) => {
      const matchesCategory = statusFilter === "all" || transaction.category === statusFilter;
      const matchesSearch =
        !query ||
        transaction.memberName.toLowerCase().includes(query) ||
        transaction.memberId.toLowerCase().includes(query) ||
        transaction.receiptNo.toLowerCase().includes(query) ||
        transaction.paymentType.toLowerCase().includes(query) ||
        transaction.paymentMethod.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [transactions, search, statusFilter]);
  const filtered = members;

  const totalCollected = members.reduce((a, m) => a + m.totalPaid, 0);
  const totalArrears = members.reduce((a, m) => a + m.balanceDue, 0);
  const totalTithes = transactions
    .filter((transaction) => transaction.category === "Tithe")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const totalSundayOfferings = transactions
    .filter((transaction) => transaction.category === "Offering")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const totalWelfare = transactions
    .filter((transaction) => transaction.category === "Welfare")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const projectMembersCount = members.filter((m) =>
    m.assignedPaymentTypes?.some(
      (p) => p.toLowerCase().includes("project") || p.toLowerCase().includes("bus"),
    ),
  ).length;

  const handleAddCustomPaymentType = (newType: Omit<ChurchPaymentType, "id">) => {
    const created: ChurchPaymentType = {
      ...newType,
      id: `cpay-${Date.now()}`,
    };
    setPaymentTypes([created, ...paymentTypes]);
    setIsAddPaymentTypeOpen(false);
  };

  const handleDeletePaymentType = (id: string) => {
    setConfirmDelete(id);
    setConfirmText("");
  };

  const confirmDeleteHandler = () => {
    if (!confirmDelete) return;
    const pt = paymentTypes.find((p) => p.id === confirmDelete);
    if (!pt) return;
    const displayName =
      pt.category === "Offering"
        ? "Sunday Offering"
        : pt.category === "Welfare"
          ? "Welfare"
          : pt.name;
    if (confirmText.trim() === displayName) {
      setPaymentTypes((prev) => prev.filter((p) => p.id !== confirmDelete));
    }
    setConfirmDelete(null);
    setConfirmText("");
  };

  const handleCsvImportSuccess = (newMembers: NgoMember[]) => {
    setMembers([...newMembers, ...members]);
    setIsCsvImportOpen(false);
  };

  const handleRecordPaymentSuccess = (newRecord: ChurchPaymentRecord, updatedMember: NgoMember) => {
    setTransactions([newRecord, ...transactions]);
    const exists = members.some((m) => m.id === updatedMember.id);
    if (exists) {
      setMembers(members.map((m) => (m.id === updatedMember.id ? updatedMember : m)));
    } else {
      setMembers([updatedMember, ...members]);
    }
    setIsRecordPaymentOpen(false);
  };

  return (
    <AppShell
      title="Church Dues & Payment Management"
      subtitle={`${members.length} registered members · ${currency(totalCollected)} church collections (Tithes, Offerings, Welfare & Projects)`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddPaymentTypeOpen(true)}
            className="h-8 text-xs gap-1.5"
          >
            <Coins className="size-3.5 text-accent" />
            <span>Add Payment Type</span>
          </Button>
        </div>
      }
    >
      {/* ══════════════════════════════════════════════
          1. STAT SUMMARY CARDS
      ══════════════════════════════════════════════ */}
      <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Church Collections */}
        <div className="relative rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {cardLabels["Church Collections"]}
            </p>
            <span className="rounded-full bg-emerald-50 p-1.5 sm:p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {currency(totalCollected)}
          </p>
          <button
            onClick={() => {
              setEditingCard("Church Collections");
              setDraftLabel(cardLabels["Church Collections"]);
            }}
            className="absolute bottom-3 right-3 grid size-6 place-items-center rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Edit label"
          >
            <Edit className="size-3" />
          </button>
        </div>

        {/* Card 2: Tithe */}
        <div className="relative rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {cardLabels["Tithe"]}
            </p>
            <span className="rounded-full bg-violet-50 p-1.5 sm:p-2 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
              <Coins className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-violet-600 dark:text-violet-400">
            {currency(totalTithes)}
          </p>
          <button
            onClick={() => {
              setEditingCard("Tithe");
              setDraftLabel(cardLabels["Tithe"]);
            }}
            className="absolute bottom-3 right-3 grid size-6 place-items-center rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Edit label"
          >
            <Edit className="size-3" />
          </button>
        </div>

        {/* Card 3: Sunday Offering */}
        <div className="relative rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {cardLabels["Sunday Offering"]}
            </p>
            <span className="rounded-full bg-amber-50 p-1.5 sm:p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Receipt className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {currency(totalSundayOfferings)}
          </p>
          <button
            onClick={() => {
              setEditingCard("Sunday Offering");
              setDraftLabel(cardLabels["Sunday Offering"]);
            }}
            className="absolute bottom-3 right-3 grid size-6 place-items-center rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Edit label"
          >
            <Edit className="size-3" />
          </button>
        </div>

        {/* Card 4: Welfare */}
        <div className="relative rounded-xl border border-border bg-card p-3 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {cardLabels["Welfare"]}
            </p>
            <span className="rounded-full bg-teal-50 p-1.5 sm:p-2 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
              <Wallet className="size-3.5 sm:size-4" />
            </span>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-teal-600 dark:text-teal-400">
            {currency(totalWelfare)}
          </p>
          <button
            onClick={() => {
              setEditingCard("Welfare");
              setDraftLabel(cardLabels["Welfare"]);
            }}
            className="absolute bottom-3 right-3 grid size-6 place-items-center rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Edit label"
          >
            <Edit className="size-3" />
          </button>
        </div>
      </div>

      {editingCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setEditingCard(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-card shadow-2xl border border-border p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setEditingCard(null)}
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
                  if (draftLabel.trim()) {
                    setCardLabels((p) => ({ ...p, [editingCard]: draftLabel.trim() }));
                    setEditingCard(null);
                  }
                }
                if (e.key === "Escape") setEditingCard(null);
              }}
            />
            <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
              <button
                onClick={() => setEditingCard(null)}
                className="px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (draftLabel.trim()) {
                    setCardLabels((p) => ({ ...p, [editingCard]: draftLabel.trim() }));
                    setEditingCard(null);
                  }
                }}
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

      {/* ══════════════════════════════════════════════
          2. ACTIVE PAYMENT TYPES TILES (4 PER ROW)
      ══════════════════════════════════════════════ */}
      <div className="mb-4 rounded-xl border border-border bg-card p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="size-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Active Church Payment Types ({paymentTypes.length})
            </h3>
          </div>
          <button
            onClick={() => setIsAddPaymentTypeOpen(true)}
            className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <Plus className="size-3" /> New Payment Type
          </button>
        </div>

        {/* 4 Cards per column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {paymentTypes.map((pt) => {
            const isProj = Boolean(pt.isProject);
            const displayName =
              pt.category === "Offering"
                ? "Sunday Offering"
                : pt.category === "Welfare"
                  ? "Welfare"
                  : pt.name;
            return (
              <div
                key={pt.id}
                className={cn(
                  "relative flex items-center justify-between p-2.5 rounded-xl border transition-colors",
                  isProj
                    ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-800/50"
                    : "bg-secondary/30 border-border hover:bg-secondary/50",
                )}
              >
                <div className="min-w-0 flex-1 pr-2">
                  <p className="font-semibold text-xs text-foreground truncate" title={displayName}>
                    {displayName}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {isProj && (
                      <span className="rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 text-[9px] font-bold">
                        🏗️ Project
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeletePaymentType(pt.id)}
                  className="ml-2 grid size-6 shrink-0 place-items-center rounded-lg bg-muted/30 text-muted-foreground hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-colors"
                  aria-label={`Delete ${displayName}`}
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-card shadow-2xl border border-border p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setConfirmDelete(null)}
              className="absolute top-4 right-4 grid size-7 place-items-center rounded-full hover:bg-secondary transition-colors"
              aria-label="Close"
            >
              <X className="size-4 text-muted-foreground" />
            </button>
            <h3 className="text-lg font-bold mb-2 text-foreground">
              Are you sure you want to delete this payment type?
            </h3>
            {(() => {
              const pt = paymentTypes.find((p) => p.id === confirmDelete);
              if (!pt) return null;
              const displayName =
                pt.category === "Offering"
                  ? "Sunday Offering"
                  : pt.category === "Welfare"
                    ? "Welfare"
                    : pt.name;
              return (
                <p className="text-xs text-muted-foreground mb-4">
                  Type{" "}
                  <span className="font-semibold text-foreground">"{displayName}"</span> to confirm.
                </p>
              );
            })()}
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent mb-5"
              placeholder="Type the payment type name..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Escape") setConfirmDelete(null);
              }}
            />
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteHandler}
                className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={!confirmText.trim()}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          3. SEARCH & FILTER TOOLBAR
      ══════════════════════════════════════════════ */}
      <div className="mb-4 space-y-2.5">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member name, ID, phone, email, or payment type…"
            className="h-9 w-full rounded-md border border-border bg-card pl-9 pr-3 text-xs outline-none placeholder:text-muted-foreground focus:border-ring"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setStatusFilter("all")}
            className={cn(
              "rounded-full px-3.5 py-1 text-xs font-semibold transition-all border shrink-0",
              statusFilter === "all"
                ? "bg-foreground text-background border-transparent"
                : "bg-card text-muted-foreground border-border hover:bg-secondary",
            )}
          >
            All Payments ({transactions.length})
          </button>
          <button
            onClick={() => setStatusFilter("Tithe")}
            className={cn(
              "rounded-full px-3.5 py-1 text-xs font-semibold transition-all border shrink-0",
              statusFilter === "Tithe"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-card text-muted-foreground border-border hover:bg-secondary",
            )}
          >
            Tithe ({transactions.filter((transaction) => transaction.category === "Tithe").length})
          </button>
          <button
            onClick={() => setStatusFilter("Offering")}
            className={cn(
              "rounded-full px-3.5 py-1 text-xs font-semibold transition-all border shrink-0",
              statusFilter === "Offering"
                ? "bg-sky-600 text-white border-sky-600"
                : "bg-card text-muted-foreground border-border hover:bg-secondary",
            )}
          >
            Sunday Offering (
            {transactions.filter((transaction) => transaction.category === "Offering").length})
          </button>
          <button
            onClick={() => setStatusFilter("Welfare")}
            className={cn(
              "rounded-full px-3.5 py-1 text-xs font-semibold transition-all border shrink-0",
              statusFilter === "Welfare"
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-card text-muted-foreground border-border hover:bg-secondary",
            )}
          >
            Welfare (
            {transactions.filter((transaction) => transaction.category === "Welfare").length})
          </button>
          <button
            onClick={() => setStatusFilter("Project")}
            className={cn(
              "rounded-full px-3.5 py-1 text-xs font-semibold transition-all border shrink-0",
              statusFilter === "Project"
                ? "bg-amber-600 text-white border-amber-600"
                : "bg-card text-muted-foreground border-border hover:bg-secondary",
            )}
          >
            Projects (
            {transactions.filter((transaction) => transaction.category === "Project").length})
          </button>

          <div className="shrink-0 ml-auto">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          4. INCOMING PAYMENTS LEDGER
      ══════════════════════════════════════════════ */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-3">
          <div>
            <h2 className="text-sm font-bold text-foreground">Incoming Payments</h2>
            <p className="text-xs text-muted-foreground">
              Confirmed collections grouped by payment type
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            {filteredPayments.length} received
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-secondary/30 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-2.5">Receipt</th>
                <th className="px-5 py-2.5">Payment Type</th>
                <th className="px-5 py-2.5">Received From</th>
                <th className="px-5 py-2.5">Method</th>
                <th className="px-5 py-2.5">Date</th>
                <th className="px-5 py-2.5 text-right">Amount Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No incoming payments match this search or payment type.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  const paymentLabel =
                    payment.category === "Offering"
                      ? "Sunday Offering"
                      : payment.category === "Welfare"
                        ? "Welfare"
                        : payment.paymentType;
                  const badgeClass =
                    payment.category === "Tithe"
                      ? "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                      : payment.category === "Offering"
                        ? "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                        : payment.category === "Welfare"
                          ? "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
                  return (
                    <tr key={payment.id} className="transition-colors hover:bg-secondary/30">
                      <td className="px-5 py-3 font-mono text-xs font-semibold text-foreground">
                        {payment.receiptNo}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-semibold",
                            badgeClass,
                          )}
                        >
                          {paymentLabel}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-foreground">{payment.memberName}</p>
                        <p className="text-[11px] font-mono text-muted-foreground">
                          {payment.memberId}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {payment.paymentMethod}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {payment.date}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {currency(payment.amount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="hidden rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/40 text-xs font-bold text-muted-foreground uppercase border-b border-border">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-5 py-3">Member Name</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Payment Types</th>
                <th className="px-5 py-3 text-right">Amount Paid</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                    No church members found matching your search or filters.
                  </td>
                </tr>
              ) : (
                filtered.map((m, idx) => {
                  const assigned = m.assignedPaymentTypes || [
                    "Tithe",
                    "Welfare",
                  ];

                  // Group payment types into categories for display
                  const CATEGORY_COLORS: Record<string, string> = {
                    tithe:
                      "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
                    offering:
                      "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
                    welfare:
                      "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800",
                    dues: "bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
                    project:
                      "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
                    special:
                      "bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800",
                  };

                  const getBadgeColor = (name: string) => {
                    const n = name.toLowerCase();
                    if (n.includes("tithe")) return CATEGORY_COLORS["tithe"];
                    if (n.includes("offering")) return CATEGORY_COLORS["offering"];
                    if (n.includes("welfare") || n.includes("benevolence"))
                      return CATEGORY_COLORS["welfare"];
                    if (
                      n.includes("project") ||
                      n.includes("bus") ||
                      n.includes("building") ||
                      n.includes("cathedral")
                    )
                      return CATEGORY_COLORS["project"];
                    if (n.includes("dues")) return CATEGORY_COLORS["dues"];
                    if (
                      n.includes("harvest") ||
                      n.includes("thanksgiving") ||
                      n.includes("special")
                    )
                      return CATEGORY_COLORS["special"];
                    return CATEGORY_COLORS["dues"];
                  };

                  return (
                    <tr key={m.id} className="hover:bg-secondary/30 transition-colors">
                      {/* # */}
                      <td className="px-4 py-4 text-xs font-bold text-muted-foreground">
                        {idx + 1}
                      </td>

                      {/* Member Name */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-foreground text-sm">{m.name}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{m.memberId}</p>
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-4">
                        <p className="text-xs font-mono text-foreground flex items-center gap-1">
                          <Phone className="size-3 text-muted-foreground opacity-70 shrink-0" />
                          {m.phone}
                        </p>
                      </td>

                      {/* Payment Types — colored badges per type */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-[320px]">
                          {assigned.map((pName, pi) => {
                            const isProject =
                              pName.toLowerCase().includes("project") ||
                              pName.toLowerCase().includes("bus") ||
                              pName.toLowerCase().includes("building") ||
                              pName.toLowerCase().includes("cathedral");
                            return (
                              <span
                                key={pi}
                                className={cn(
                                  "text-[10px] font-semibold px-2.5 py-0.5 rounded-full border",
                                  getBadgeColor(pName),
                                )}
                              >
                                {isProject ? "🏗️ " : ""}
                                {pName}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Amount Paid */}
                      <td className="px-5 py-4 text-right">
                        <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                          {currency(m.totalPaid)}
                        </p>
                        {m.balanceDue > 0 && (
                          <p className="text-[10px] text-rose-500 dark:text-rose-400 font-semibold">
                            Due: {currency(m.balanceDue)}
                          </p>
                        )}
                      </td>

                      {/* Pay Action */}
                      <td className="px-5 py-4 text-center">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedMemberForPayment(m);
                            setIsRecordPaymentOpen(true);
                          }}
                          className="bg-[#22c55e] text-white hover:bg-[#16a34a] h-7 px-3 text-[11px] font-semibold gap-1"
                        >
                          <Receipt className="size-3" />
                          <span>Record Payment</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Payment Type Modal ── */}
      {isAddPaymentTypeOpen && (
        <AddPaymentTypeModal
          onClose={() => setIsAddPaymentTypeOpen(false)}
          onSubmit={handleAddCustomPaymentType}
        />
      )}

      {/* ── CSV Import Modal ── */}
      {isCsvImportOpen && (
        <CsvImportModal
          availablePaymentTypes={paymentTypes}
          onClose={() => setIsCsvImportOpen(false)}
          onImportSuccess={handleCsvImportSuccess}
        />
      )}

      {/* ── Record Member Payment Modal ── */}
      {isRecordPaymentOpen && (
        <RecordPaymentModal
          members={members}
          paymentTypes={paymentTypes}
          initialMember={selectedMemberForPayment}
          onClose={() => setIsRecordPaymentOpen(false)}
          onRecordSuccess={handleRecordPaymentSuccess}
        />
      )}
    </AppShell>
  );
}
