import { createContext, useContext, useState } from "react";
import { branches as seedBranches, type Branch } from "@/lib/mos-data";

type BranchesContextValue = {
  branches: Branch[];
  addBranch: (b: Branch) => void;
  deleteBranch: (id: string) => void;
};

const BranchesContext = createContext<BranchesContextValue | null>(null);

export function BranchesProvider({ children }: { children: React.ReactNode }) {
  const [branches, setBranches] = useState<Branch[]>(seedBranches);

  function addBranch(b: Branch) {
    setBranches((prev) => [...prev, b]);
  }

  function deleteBranch(id: string) {
    // Never delete the "all" entry
    setBranches((prev) => prev.filter((x) => x.id !== id || x.id === "all"));
  }

  return (
    <BranchesContext.Provider value={{ branches, addBranch, deleteBranch }}>
      {children}
    </BranchesContext.Provider>
  );
}

export function useBranches() {
  const ctx = useContext(BranchesContext);
  if (!ctx) throw new Error("useBranches must be used within BranchesProvider");
  return ctx;
}
