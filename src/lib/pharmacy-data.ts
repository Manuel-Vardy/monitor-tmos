export type PrescriptionItem = {
  medicationId: string;
  drugName: string;
  dosage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  refillsAllowed: number;
};

export type Prescription = {
  id: string;
  rxNumber: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  clinic: string;
  status: "pending" | "dispensed" | "partially_filled" | "cancelled";
  items: PrescriptionItem[];
  totalAmount: number;
  insuranceClaimNumber?: string;
  insuranceProvider?: string;
  copayAmount: number;
  date: string;
  pharmacist: string;
};

export type PatientRecord = {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female";
  phone: string;
  email: string;
  insuranceProvider: "NHIS (National Health)" | "Glico Health" | "Enterprise Life" | "Private Cash";
  insuranceNumber: string;
  outstandingBalance: number;
  totalPrescriptions: number;
  allergies: string[];
  lastVisit: string;
};

export type PharmacyMedication = {
  id: string;
  drugName: string;
  brandName: string;
  category: "Antibiotics" | "Analgesics" | "Antihypertensives" | "Antidiabetics" | "Vitamins & Supplements";
  dosageForm: "Tablet" | "Capsule" | "Syrup" | "Injection" | "Ointment";
  strength: string;
  stockLevel: number;
  reorderLevel: number;
  unitPrice: number;
  batchNumber: string;
  expiryDate: string;
  prescriptionRequired: boolean;
};

export const PHARMACY_MEDICATIONS: PharmacyMedication[] = [
  {
    id: "MED-001",
    drugName: "Amoxicillin + Clavulanic Acid",
    brandName: "Augmentin",
    category: "Antibiotics",
    dosageForm: "Tablet",
    strength: "625 mg",
    stockLevel: 140,
    reorderLevel: 50,
    unitPrice: 85,
    batchNumber: "BATCH-2026A",
    expiryDate: "15 Oct 2027",
    prescriptionRequired: true,
  },
  {
    id: "MED-002",
    drugName: "Paracetamol + Caffeine",
    brandName: "Panadol Extra",
    category: "Analgesics",
    dosageForm: "Tablet",
    strength: "500 mg / 65 mg",
    stockLevel: 450,
    reorderLevel: 100,
    unitPrice: 15,
    batchNumber: "BATCH-2026B",
    expiryDate: "20 Dec 2028",
    prescriptionRequired: false,
  },
  {
    id: "MED-003",
    drugName: "Amlodipine Besylate",
    brandName: "Norvasc",
    category: "Antihypertensives",
    dosageForm: "Tablet",
    strength: "10 mg",
    stockLevel: 85,
    reorderLevel: 40,
    unitPrice: 45,
    batchNumber: "BATCH-2026C",
    expiryDate: "10 Aug 2027",
    prescriptionRequired: true,
  },
  {
    id: "MED-004",
    drugName: "Metformin Hydrochloride",
    brandName: "Glucophage",
    category: "Antidiabetics",
    dosageForm: "Tablet",
    strength: "500 mg",
    stockLevel: 210,
    reorderLevel: 60,
    unitPrice: 35,
    batchNumber: "BATCH-2026D",
    expiryDate: "05 May 2028",
    prescriptionRequired: true,
  },
  {
    id: "MED-005",
    drugName: "Multivitamin + Iron Syrup",
    brandName: "Feroglobin Syrup",
    category: "Vitamins & Supplements",
    dosageForm: "Syrup",
    strength: "200 ml",
    stockLevel: 95,
    reorderLevel: 30,
    unitPrice: 65,
    batchNumber: "BATCH-2026E",
    expiryDate: "18 Sep 2027",
    prescriptionRequired: false,
  },
];

export const PATIENT_RECORDS: PatientRecord[] = [
  {
    id: "PAT-101",
    name: "Kofi Mensah",
    age: 44,
    gender: "Male",
    phone: "+233 24 412 8901",
    email: "kofi.mensah@gmail.com",
    insuranceProvider: "NHIS (National Health)",
    insuranceNumber: "NHIS-8829104",
    outstandingBalance: 120,
    totalPrescriptions: 8,
    allergies: ["Penicillin"],
    lastVisit: "11 Aug 2026",
  },
  {
    id: "PAT-102",
    name: "Esi Akoto",
    age: 36,
    gender: "Female",
    phone: "+233 20 551 3422",
    email: "esi.akoto@yahoo.com",
    insuranceProvider: "Glico Health",
    insuranceNumber: "GLC-994102",
    outstandingBalance: 0,
    totalPrescriptions: 14,
    allergies: ["None"],
    lastVisit: "10 Aug 2026",
  },
  {
    id: "PAT-103",
    name: "Kwaku Addo",
    age: 62,
    gender: "Male",
    phone: "+233 27 789 0112",
    email: "kwaku.addo@hotmail.com",
    insuranceProvider: "Enterprise Life",
    insuranceNumber: "ENT-330192",
    outstandingBalance: 240,
    totalPrescriptions: 22,
    allergies: ["Sulfa Drugs"],
    lastVisit: "11 Aug 2026",
  },
  {
    id: "PAT-104",
    name: "Abena Osei",
    age: 28,
    gender: "Female",
    phone: "+233 54 321 9876",
    email: "abena.osei@gmail.com",
    insuranceProvider: "Private Cash",
    insuranceNumber: "N/A (Cash)",
    outstandingBalance: 0,
    totalPrescriptions: 5,
    allergies: ["Aspirin"],
    lastVisit: "09 Aug 2026",
  },
];

export const PRESCRIPTIONS: Prescription[] = [
  {
    id: "RX-501",
    rxNumber: "RX-2026-0091",
    patientId: "PAT-101",
    patientName: "Kofi Mensah",
    doctorName: "Dr. Seth Appiah",
    clinic: "Ridge Hospital Accra",
    status: "pending",
    items: [
      {
        medicationId: "MED-001",
        drugName: "Augmentin (Amoxicillin 625mg)",
        dosage: "1 tab twice daily x 7 days",
        quantity: 14,
        unitPrice: 85,
        totalPrice: 170,
        refillsAllowed: 0,
      },
      {
        medicationId: "MED-002",
        drugName: "Panadol Extra 500mg",
        dosage: "2 tabs 8-hourly as needed",
        quantity: 20,
        unitPrice: 15,
        totalPrice: 30,
        refillsAllowed: 2,
      },
    ],
    totalAmount: 200,
    insuranceClaimNumber: "NHIS-CLM-9012",
    insuranceProvider: "NHIS (National Health)",
    copayAmount: 40,
    date: "11 Aug 2026",
    pharmacist: "Pharm. Janet Boateng",
  },
  {
    id: "RX-502",
    rxNumber: "RX-2026-0092",
    patientId: "PAT-103",
    patientName: "Kwaku Addo",
    doctorName: "Dr. Mary Ofori",
    clinic: "Korle Bu Teaching Hospital",
    status: "dispensed",
    items: [
      {
        medicationId: "MED-003",
        drugName: "Norvasc (Amlodipine 10mg)",
        dosage: "1 tab daily x 30 days",
        quantity: 30,
        unitPrice: 45,
        totalPrice: 135,
        refillsAllowed: 5,
      },
      {
        medicationId: "MED-004",
        drugName: "Glucophage (Metformin 500mg)",
        dosage: "1 tab with meals x 60 days",
        quantity: 60,
        unitPrice: 35,
        totalPrice: 210,
        refillsAllowed: 3,
      },
    ],
    totalAmount: 345,
    insuranceClaimNumber: "ENT-CLM-4481",
    insuranceProvider: "Enterprise Life",
    copayAmount: 69,
    date: "11 Aug 2026",
    pharmacist: "Pharm. Janet Boateng",
  },
  {
    id: "RX-503",
    rxNumber: "RX-2026-0093",
    patientId: "PAT-102",
    patientName: "Esi Akoto",
    doctorName: "Dr. Seth Appiah",
    clinic: "37 Military Hospital",
    status: "pending",
    items: [
      {
        medicationId: "MED-005",
        drugName: "Feroglobin Syrup 200ml",
        dosage: "10ml daily after meals",
        quantity: 1,
        unitPrice: 65,
        totalPrice: 65,
        refillsAllowed: 1,
      },
    ],
    totalAmount: 65,
    insuranceClaimNumber: "GLC-CLM-1102",
    insuranceProvider: "Glico Health",
    copayAmount: 13,
    date: "10 Aug 2026",
    pharmacist: "Pharm. Emmanuel Danso",
  },
];

export const PHARMACY_SUMMARY = {
  totalPendingDispensary: PRESCRIPTIONS.filter((r) => r.status === "pending").length,
  totalDispensedToday: PRESCRIPTIONS.filter((r) => r.status === "dispensed").length,
  totalPrescriptionRevenue: PRESCRIPTIONS.reduce((acc, r) => acc + r.totalAmount, 0),
  totalPatientsRegistered: PATIENT_RECORDS.length,
  totalOutstandingReceivables: PATIENT_RECORDS.reduce((acc, p) => acc + p.outstandingBalance, 0),
};
