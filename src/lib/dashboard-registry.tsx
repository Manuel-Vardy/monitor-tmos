import React from "react";
import type { InstitutionType } from "./institution-types";
import { DashboardErrorBoundary } from "@/components/dashboards/dashboard-error-boundary";

// Import all 11 dashboard components
import { RetailDashboard } from "@/components/dashboards/retail-dashboard";
// import { WholesaleDashboard } from "@/components/dashboards/wholesale-dashboard"; // temporarily removed
import { RestaurantDashboard } from "@/components/dashboards/restaurant-dashboard";
import { PharmacyDashboard } from "@/components/dashboards/pharmacy-dashboard";
import { SchoolDashboard } from "@/components/dashboards/school-dashboard";
import { ChurchDashboard } from "@/components/dashboards/church-dashboard";
// import { SalonDashboard } from "@/components/dashboards/salon-dashboard"; // temporarily removed
import { HotelDashboard } from "@/components/dashboards/hotel-dashboard";
import { ProfessionalServicesDashboard } from "@/components/dashboards/professional-services-dashboard";
import { ManufacturerDashboard } from "@/components/dashboards/manufacturer-dashboard";
import { CooperativeDashboard } from "@/components/dashboards/cooperative-dashboard";

export type DashboardComponent = React.ComponentType;

export const DASHBOARD_REGISTRY: Record<InstitutionType, DashboardComponent> = {
  retail: RetailDashboard,
  // wholesale: WholesaleDashboard, // temporarily removed
  restaurant: RestaurantDashboard,
  pharmacy: PharmacyDashboard,
  school: SchoolDashboard,
  ngo: ChurchDashboard,
  // salon: SalonDashboard, // temporarily removed
  hotel: HotelDashboard,
  professional_services: ProfessionalServicesDashboard,
  manufacturer: ManufacturerDashboard,
  cooperative: CooperativeDashboard,
};

/** Renders the dashboard for the given type; falls back to retail with a console.warn. */
export function DashboardRenderer({
  institutionType,
}: {
  institutionType: InstitutionType | null;
}) {
  if (!institutionType || !(institutionType in DASHBOARD_REGISTRY)) {
    console.warn(
      `[Trite] DashboardRenderer: unknown institution type "${institutionType}", falling back to retail.`
    );
    const FallbackDashboard = DASHBOARD_REGISTRY.retail;
    return (
      <DashboardErrorBoundary institutionType="retail">
        <FallbackDashboard />
      </DashboardErrorBoundary>
    );
  }
  const Template = DASHBOARD_REGISTRY[institutionType];
  return (
    <DashboardErrorBoundary institutionType={institutionType}>
      <Template />
    </DashboardErrorBoundary>
  );
}
