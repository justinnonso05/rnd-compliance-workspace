"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useComplianceStore, PERSONAS } from "@/store/useComplianceStore";
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  ListChecks,
  MessageSquareText,
  Users,
  CalendarClock,
  FileDown,
  Eye,
  Settings,
  Shield,
  Briefcase,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  roles: string[];
  badge?: string;
}

const ALL_NAV_ITEMS: NavItem[] = [
  // Operator Dashboard
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    roles: ["lead", "co_researcher", "compliance"],
  },
  // NCDMB Primary View
  {
    label: "Regulator Portfolio",
    href: "/ncdmb",
    icon: Eye,
    roles: ["ncdmb"],
    badge: "Oversight",
  },
  // Ingestion
  {
    label: "Documents",
    href: "/documents",
    icon: FileText,
    roles: ["lead", "co_researcher", "compliance"],
  },
  // Audit (Universal Inspection)
  {
    label: "Audit Inspection",
    href: "/audit",
    icon: ShieldCheck,
    roles: ["ncdmb", "lead", "co_researcher", "compliance"],
  },
  // Remediation
  {
    label: "Fix & Remediation",
    href: "/fix",
    icon: ListChecks,
    roles: ["lead", "co_researcher", "compliance"],
  },
  // Legal QA (Universal)
  {
    label: "Regulatory Assistant",
    href: "/assistant",
    icon: MessageSquareText,
    roles: ["ncdmb", "lead", "co_researcher", "compliance"],
  },
  // Triage
  {
    label: "Team Workload",
    href: "/team",
    icon: Users,
    roles: ["lead", "co_researcher", "compliance"],
  },
  // Statutory Calendar (Universal)
  {
    label: "Statutory Deadlines",
    href: "/deadlines",
    icon: CalendarClock,
    roles: ["ncdmb", "lead", "co_researcher", "compliance"],
  },
  // Submissions
  {
    label: "Export & JQS",
    href: "/export",
    icon: FileDown,
    roles: ["lead", "compliance"],
  },
  // Setup
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["lead", "compliance"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { activePersonaId, isHydrated } = useComplianceStore();

  const currentRoleId = isHydrated ? activePersonaId : "lead";
  const activePersona =
    PERSONAS.find((p) => p.id === currentRoleId) || PERSONAS[0];

  const visibleNavItems = ALL_NAV_ITEMS.filter((item) =>
    item.roles.includes(currentRoleId)
  );

  const isRegulator = currentRoleId === "ncdmb";

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">RC</div>
        <div>
          <div className="sidebar-product-name">R&D Compliance</div>
          <div className="sidebar-product-tag">PROTOTYPE</div>
        </div>
      </div>

      {/* Role Context Pill */}
      <div
        style={{
          padding: "10px 16px",
          background: isRegulator
            ? "rgba(23, 92, 211, 0.15)"
            : "rgba(255, 255, 255, 0.04)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 10,
            color: isRegulator ? "#93C5FD" : "var(--green-400)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontWeight: 700,
          }}
        >
          {isRegulator ? <Shield size={12} /> : <Briefcase size={12} />}
          <span>{isRegulator ? "Regulator View" : "Operator View"}</span>
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-on-dark)",
            marginTop: 2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={activePersona.name}
        >
          {activePersona.role}
        </div>
        <div style={{ fontSize: 11, color: "rgba(231,240,234,0.6)" }}>
          {activePersona.name}
        </div>
      </div>

      {/* Role-Specific Navigation Links */}
      <ul className="sidebar-nav">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`nav-item ${isActive ? "active" : ""}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon size={18} strokeWidth={1.75} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      fontSize: 10,
                      padding: "1px 5px",
                      borderRadius: 3,
                      background: "rgba(255, 255, 255, 0.15)",
                      color: "#fff",
                      fontWeight: 600,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Role Restrictions Footer Notice */}
      <div
        style={{
          padding: "12px 16px",
          marginTop: "auto",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          fontSize: 11,
          color: "rgba(231, 240, 234, 0.5)",
          lineHeight: 1.4,
        }}
      >
        {isRegulator ? (
          <div>
            <strong style={{ color: "var(--text-on-dark)" }}>Read-Only Mode:</strong>{" "}
            Operator drafting & fix tools hidden. All submission actions disabled.
          </div>
        ) : (
          <div>
            <strong>Role Actions:</strong>{" "}
            {currentRoleId === "lead" && "Phase advance & JQS sign-off enabled."}
            {currentRoleId === "co_researcher" && "Technical field edits & draft fixes enabled."}
            {currentRoleId === "compliance" && "Board notice logging & plan upload enabled."}
          </div>
        )}
      </div>
    </aside>
  );
}
