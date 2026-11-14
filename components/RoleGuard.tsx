"use client";

import { useComplianceStore } from "@/store/useComplianceStore";

interface RoleGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireNonRegulator?: boolean;
  allowedRoles?: string[];
  deniedTooltip?: string;
}

export function RoleGuard({
  children,
  fallback,
  requireNonRegulator = true,
  allowedRoles,
  deniedTooltip,
}: RoleGuardProps) {
  const { activePersonaId, isHydrated } = useComplianceStore();

  if (!isHydrated) {
    return <>{children}</>;
  }

  const isRegulator = activePersonaId === "ncdmb";

  if (requireNonRegulator && isRegulator) {
    if (fallback) return <>{fallback}</>;
    return (
      <span
        className="badge badge-info"
        title="Disabled for NCDMB view-only account"
        style={{ cursor: "not-allowed" }}
      >
        View only
      </span>
    );
  }

  if (allowedRoles && !allowedRoles.includes(activePersonaId)) {
    if (fallback) return <>{fallback}</>;
    return (
      <span
        className="badge badge-info"
        title={deniedTooltip || "Restricted for current persona"}
        style={{ cursor: "not-allowed", opacity: 0.7 }}
      >
        Restricted
      </span>
    );
  }

  return <>{children}</>;
}
