import React, { type ReactNode } from "react";
import type { InstitutionType } from "@/lib/institution-types";
import { DashboardErrorState } from "./dashboard-error-state";

interface Props {
  children: ReactNode;
  institutionType: InstitutionType | null;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class DashboardErrorBoundary extends React.Component<Props, State> {
  override state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <DashboardErrorState
          institutionType={this.props.institutionType}
          error={this.state.error}
        />
      );
    }
    return this.props.children;
  }
}
