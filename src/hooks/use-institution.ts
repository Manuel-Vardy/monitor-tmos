import { useContext } from "react";
import {
  InstitutionContext,
  type InstitutionContextValue,
} from "@/contexts/institution-context";

export function useInstitution(): InstitutionContextValue {
  const context = useContext(InstitutionContext);
  if (context === null) {
    throw new Error(
      "useInstitution must be used within an InstitutionProvider"
    );
  }
  return context;
}
