"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  useComplianceStore,
  PERSONAS,
  ROLE_ALLOWED_ROUTES,
} from "@/store/useComplianceStore";

const ROUTE_NAMES: Record<string, string> = {
  "/": "Dashboard",
  "/onboarding": "Onboarding",
  "/documents": "Documents & Upload",
  "/documents/extract": "Document Extraction",
  "/audit": "Audit Inspection",
  "/fix": "Fix & Remediation",
  "/assistant": "Regulatory Assistant",
  "/team": "Team Workload & Triage",
  "/deadlines": "Statutory Deadlines & Notices",
  "/export": "Export & JQS Submission",
  "/ncdmb": "NCDMB Regulator View",
  "/settings": "Settings & Demo Controls",
  "/dev/verify": "Verification Test Harness",
};

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    activePersonaId,
    setActivePersona,
    demoDate,
    isHydrated,
    setHydrated,
  } = useComplianceStore();

  useEffect(() => {
    useComplianceStore.persist.rehydrate();
    setHydrated();
  }, [setHydrated]);

  const activePersona =
    PERSONAS.find((p) => p.id === (isHydrated ? activePersonaId : "lead")) ||
    PERSONAS[0];

  const currentRouteName = ROUTE_NAMES[pathname] || "Workspace";

  const handleRoleChange = (newRoleId: string) => {
    setActivePersona(newRoleId);

    // Check if the current route is allowed for the newly selected role
    const allowed = ROLE_ALLOWED_ROUTES[newRoleId] || ["/"];
    const isCurrentAllowed = allowed.some(
      (r) => r === pathname || (r !== "/" && pathname.startsWith(r))
    );

    if (!isCurrentAllowed) {
      if (newRoleId === "ncdmb") {
        router.push("/ncdmb");
      } else {
        router.push("/");
      }
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-breadcrumb">
        <span>Workspace</span> / <strong>{currentRouteName}</strong>
      </div>

      <div className="topbar-controls">
        <span className="demo-date-chip">Demo: {isHydrated ? demoDate : "2026-11-16"}</span>

        <label
          htmlFor="role-select"
          style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}
        >
          Viewing as:
        </label>
        <select
          id="role-select"
          className="role-select"
          value={isHydrated ? activePersonaId : "lead"}
          onChange={(e) => handleRoleChange(e.target.value)}
          style={{
            fontWeight: 600,
            borderColor:
              activePersonaId === "ncdmb" ? "var(--timer)" : "var(--border-strong)",
            background:
              activePersonaId === "ncdmb" ? "var(--timer-bg)" : "var(--surface)",
            color: activePersonaId === "ncdmb" ? "var(--timer)" : "var(--text)",
          }}
        >
          {PERSONAS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.role} — {p.name}
            </option>
          ))}
        </select>

        <div
          className="avatar"
          style={{
            background:
              activePersonaId === "ncdmb" ? "var(--timer)" : "var(--green-600)",
          }}
          title={`${activePersona.role} (${activePersona.name})`}
        >
          {activePersona.initials}
        </div>
      </div>
    </header>
  );
}
