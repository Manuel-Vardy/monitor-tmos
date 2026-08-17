import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { type InstitutionType, isValidInstitutionType } from "@/lib/institution-types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SessionState {
  institutionType: InstitutionType | null;
  accountId: string | null;
  featureFlags: Record<string, boolean>;
  isAuthenticated: boolean;
  onboardingComplete: boolean;
}

export interface LinkedAccount {
  accountId: string;
  institutionType: InstitutionType;
  displayName: string;
}

export interface InstitutionContextValue extends SessionState {
  setInstitution: (type: InstitutionType, accountId: string) => void;
  signOut: () => void;
  isRehydrating: boolean;
  linkedAccounts: LinkedAccount[];
}

/** Shape of the JSON object persisted to localStorage under `tmos_session_v1`. */
interface PersistedSession {
  version: 1;
  institutionType: InstitutionType;
  accountId: string;
  onboardingComplete: boolean;
  featureFlags: Record<string, boolean>;
  linkedAccounts: LinkedAccount[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = "tmos_session_v1";

const DEFAULT_STATE: SessionState = {
  institutionType: null,
  accountId: null,
  featureFlags: {},
  isAuthenticated: false,
  onboardingComplete: false,
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const InstitutionContext = createContext<InstitutionContextValue | null>(
  null
);

// ---------------------------------------------------------------------------
// localStorage helpers (all wrapped in try/catch for private-browsing safety)
// ---------------------------------------------------------------------------

function readStorage(): PersistedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedSession>;
    // Basic schema validation
    if (
      parsed.version !== 1 ||
      !isValidInstitutionType(parsed.institutionType) ||
      typeof parsed.accountId !== "string"
    ) {
      return null;
    }
    return parsed as PersistedSession;
  } catch (err) {
    console.warn(
      "[Trite] InstitutionProvider: could not read localStorage — falling back to in-memory state.",
      err
    );
    return null;
  }
}

function writeStorage(session: PersistedSession): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn(
      "[Trite] InstitutionProvider: could not write to localStorage — operating in in-memory mode.",
      err
    );
  }
}

function removeStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn(
      "[Trite] InstitutionProvider: could not remove item from localStorage.",
      err
    );
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function InstitutionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sessionState, setSessionState] = useState<SessionState>(DEFAULT_STATE);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [isRehydrating, setIsRehydrating] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const persisted = readStorage();
    if (persisted) {
      setSessionState({
        institutionType: persisted.institutionType,
        accountId: persisted.accountId,
        featureFlags: persisted.featureFlags ?? {},
        isAuthenticated: true,
        onboardingComplete: persisted.onboardingComplete ?? false,
      });
      setLinkedAccounts(persisted.linkedAccounts ?? []);
    }
    setIsRehydrating(false);
  }, []);

  /** Persist a new institution selection and mark the user as authenticated. */
  const setInstitution = useCallback(
    (type: InstitutionType, accountId: string) => {
      setSessionState((prev) => {
        const next: SessionState = {
          ...prev,
          institutionType: type,
          accountId,
          isAuthenticated: true,
        };

        // Build the persisted payload, merging existing linked-accounts state
        setLinkedAccounts((prevAccounts) => {
          const payload: PersistedSession = {
            version: 1,
            institutionType: type,
            accountId,
            onboardingComplete: next.onboardingComplete,
            featureFlags: next.featureFlags,
            linkedAccounts: prevAccounts,
          };
          writeStorage(payload);
          return prevAccounts;
        });

        return next;
      });
    },
    []
  );

  /** Clear all session state and remove the persisted key from localStorage. */
  const signOut = useCallback(() => {
    removeStorage();
    setSessionState(DEFAULT_STATE);
    setLinkedAccounts([]);
  }, []);

  const value: InstitutionContextValue = {
    ...sessionState,
    linkedAccounts,
    isRehydrating,
    setInstitution,
    signOut,
  };

  return (
    <InstitutionContext.Provider value={value}>
      {children}
    </InstitutionContext.Provider>
  );
}
