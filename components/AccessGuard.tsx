"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useComplianceStore, ROLE_ALLOWED_ROUTES, PERSONAS } from "@/store/useComplianceStore";
import { ShieldAlert, ArrowRight, Eye, Shield } from "lucide-react";

interface AccessGuardProps {
  children: React.ReactNode;
}

export function AccessGuard({ children }: AccessGuardProps) {
  const pathname = usePathname();
  const { activePersonaId, isHydrated } = useComplianceStore();

  if (!isHydrated) {
    return <>{children}</>;
  }

  const allowedRoutes = ROLE_ALLOWED_ROUTES[activePersonaId] || ["/"];
  const isAllowed = allowedRoutes.some(
    (r) => r === pathname || (r !== "/" && pathname.startsWith(r))
  );

  if (!isAllowed) {
    const activePersona =
      PERSONAS.find((p) => p.id === activePersonaId) || PERSONAS[0];
    const isNcdmb = activePersonaId === "ncdmb";

    return (
      <div className="panel" style={{ textAlign: "center", padding: "48px 24px", marginTop: 24 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: isNcdmb ? "var(--timer-bg)" : "var(--advisory-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          {isNcdmb ? (
            <Shield size={28} color="var(--timer)" />
          ) : (
            <ShieldAlert size={28} color="var(--advisory)" />
          )}
        </div>

        <h1 className="page-title" style={{ fontSize: 18, marginBottom: 8 }}>
          {isNcdmb
            ? "Operator-Internal Workspace Section"
            : "Role Access Restriction"}
        </h1>

        <p
          className="text-muted"
          style={{
            maxWidth: 520,
            margin: "0 auto 20px",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {isNcdmb ? (
            <>
              You are currently viewing as <strong>NCDMB Analyst (Regulator View)</strong>.
              This section is reserved for operating company internal drafting, file staging,
              and remediation workflows. As a regulator, please inspect submissions via the
              Oversight Portfolio or Audit Inspection views.
            </>
          ) : (
            <>
              You are currently viewing as <strong>{activePersona.role} ({activePersona.name})</strong>.
              This section is not accessible to your assigned role permissions.
            </>
          )}
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          {isNcdmb ? (
            <>
              <Link href="/ncdmb" className="btn btn-primary">
                <Eye size={15} /> Go to Regulator Portfolio &rarr;
              </Link>
              <Link href="/audit" className="btn btn-secondary">
                Inspect Plan Audit
              </Link>
            </>
          ) : (
            <Link href="/" className="btn btn-primary">
              Return to Project Dashboard &rarr;
            </Link>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
