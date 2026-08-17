import { AlertTriangle, RefreshCw } from "lucide-react";
import type { InstitutionType } from "@/lib/institution-types";

interface DashboardErrorStateProps {
  institutionType: InstitutionType | null;
  error: Error | null;
}

export function DashboardErrorState({ institutionType, error }: DashboardErrorStateProps) {
  const label = institutionType ?? "retail";

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Dashboard unavailable</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Something went wrong loading the {label} dashboard. Please try refreshing.
        </p>
        {error && (
          <p className="text-xs text-muted-foreground/60 font-mono max-w-sm truncate">
            {error.message}
          </p>
        )}
      </div>

      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Refresh page
      </button>
    </div>
  );
}
