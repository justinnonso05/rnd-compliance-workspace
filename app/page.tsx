"use client";

import Link from "next/link";
import { useState } from "react";
import { useComplianceStore, ProjectPhase } from "@/store/useComplianceStore";
import { RoleGuard } from "@/components/RoleGuard";
import {
  AlertCircle,
  AlertTriangle,
  Timer,
  CheckCircle2,
  Calendar,
  History,
  ArrowRight,
  ShieldCheck,
  FileText,
} from "lucide-react";

const PHASES: ProjectPhase[] = [
  "Formulate",
  "Plan",
  "Conduct",
  "Audit",
  "Report",
];

export default function DashboardPage() {
  const {
    workingPlan,
    activeSampleId,
    currentPhase,
    advancePhase,
    findings,
    activityLog,
    demoDate,
    activePersonaId,
  } = useComplianceStore();

  const [phaseGateError, setPhaseGateError] = useState<string | null>(null);

  // Computed metrics
  const defectsCount = findings.filter(
    (f) => f.severity === "defect" && f.status !== "resolved" && f.status !== "acknowledged"
  ).length;

  const advisoriesCount = findings.filter(
    (f) => f.severity === "advisory" && f.status !== "resolved" && f.status !== "acknowledged"
  ).length;

  const timersCount = findings.filter(
    (f) => f.severity === "timer" && f.status !== "resolved"
  ).length;

  const acknowledgedCount = findings.filter(
    (f) => f.status === "acknowledged"
  ).length;

  const openCorrectableCount = findings.filter(
    (f) => f.correctable && f.status !== "resolved"
  ).length;

  const handleAdvance = () => {
    setPhaseGateError(null);
    const result = advancePhase();
    if (!result.success) {
      setPhaseGateError(result.reason || "Phase transition blocked.");
    }
  };

  const currentPhaseIndex = PHASES.indexOf(currentPhase);

  return (
    <div>
      {/* Project Header */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="badge badge-info" style={{ fontWeight: 600 }}>
                Sample {activeSampleId} ({workingPlan.label})
              </span>
              <span className="chip" style={{ fontSize: 11 }}>
                Operator: {workingPlan.operator}
              </span>
            </div>
            <h1 className="page-title" style={{ fontSize: 18, marginBottom: 4 }}>
              {workingPlan.project?.title || "R&D Compliance Plan"}
            </h1>
            <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", gap: 16 }}>
              <span>
                <strong>Focus Area:</strong> {workingPlan.project?.focus_area}
              </span>
              <span>
                <strong>Period:</strong> {workingPlan.filing?.plan_start} to{" "}
                {workingPlan.filing?.plan_end}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/audit" className="btn btn-secondary btn-sm">
              <ShieldCheck size={14} /> View Audit
            </Link>
            <RoleGuard fallback={null}>
              <Link href="/fix" className="btn btn-primary btn-sm">
                <FileText size={14} /> Fix Findings ({openCorrectableCount})
              </Link>
            </RoleGuard>
          </div>
        </div>
      </div>

      {/* Phase Tracker */}
      <div className="panel" style={{ marginBottom: 16, padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
            Project Lifecycle Phase
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {phaseGateError && (
              <span style={{ fontSize: 12, color: "var(--defect)", fontWeight: 500 }}>
                {phaseGateError}{" "}
                <Link href="/fix" style={{ textDecoration: "underline", color: "var(--defect)" }}>
                  Open Fix Workspace &rarr;
                </Link>
              </span>
            )}

            <RoleGuard
              allowedRoles={["lead"]}
              deniedTooltip="Only Lead Researcher (Dr. Ada Okeke) can advance project phases"
            >
              <button
                onClick={handleAdvance}
                className="btn btn-primary btn-sm"
                disabled={currentPhase === "Report"}
              >
                Advance phase <ArrowRight size={14} />
              </button>
            </RoleGuard>
          </div>
        </div>

        {/* Stepper bar */}
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          {PHASES.map((phase, idx) => {
            const isDone = idx < currentPhaseIndex;
            const isCurrent = idx === currentPhaseIndex;

            return (
              <div
                key={phase}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: idx < PHASES.length - 1 ? 1 : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      background: isDone
                        ? "var(--pass)"
                        : isCurrent
                        ? "var(--green-600)"
                        : "var(--surface)",
                      color: isDone || isCurrent ? "#fff" : "var(--text-muted)",
                      border: isDone || isCurrent ? "none" : "2px solid var(--border-strong)",
                    }}
                  >
                    {isDone ? "✓" : idx + 1}
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: isCurrent ? 600 : 500,
                      color: isCurrent
                        ? "var(--text)"
                        : isDone
                        ? "var(--green-700)"
                        : "var(--text-muted)",
                    }}
                  >
                    {phase}
                  </span>
                </div>

                {idx < PHASES.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      margin: "0 12px",
                      background: isDone ? "var(--pass)" : "var(--border)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div className="panel" style={{ borderLeft: "4px solid var(--defect)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
              Open Defects
            </span>
            <AlertCircle size={16} color="var(--defect)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--defect)", marginTop: 4 }}>
            {defectsCount}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            Non-compliant with Regulations/Template
          </div>
        </div>

        <div className="panel" style={{ borderLeft: "4px solid var(--advisory)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
              Advisories
            </span>
            <AlertTriangle size={16} color="var(--advisory)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--advisory)", marginTop: 4 }}>
            {advisoriesCount}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            Flags for Board discretionary review
          </div>
        </div>

        <div className="panel" style={{ borderLeft: "4px solid var(--timer)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
              Active 14-Day Timers
            </span>
            <Timer size={16} color="var(--timer)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--timer)", marginTop: 4 }}>
            {timersCount}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            Board notice rectification windows
          </div>
        </div>

        <div className="panel" style={{ borderLeft: "4px solid var(--pass)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
              Historical Acknowledged
            </span>
            <CheckCircle2 size={16} color="var(--pass)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--pass)", marginTop: 4 }}>
            {acknowledgedCount}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            Documented non-correctable items
          </div>
        </div>
      </div>

      {/* Deadlines & Activity Split */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Deadlines Panel */}
        <div className="panel">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={16} color="var(--green-600)" />
              <h2 className="section-heading" style={{ margin: 0 }}>
                Next Compliance Deadlines
              </h2>
            </div>
            <Link href="/deadlines" style={{ fontSize: 12, color: "var(--green-600)" }}>
              Full calendar &rarr;
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 10px",
                background: "var(--bg)",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Next 6-Monthly Plan Update</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Reg 12 obligation (Update 2 due from approval date)
                </div>
              </div>
              <span className="badge badge-defect">Due 2026-11-03 (Overdue)</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 10px",
                background: "var(--bg)",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Next Quarterly Progress Report</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Reg 21 obligation (Q4 2026 first working day)
                </div>
              </div>
              <span className="badge badge-info">Due 2027-01-04</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 10px",
                background: "var(--bg)",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Board Notice (Deviation) Rectification</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Reg 17 statutory notice: 14-day clock active
                </div>
              </div>
              <span className="badge badge-timer">7 day(s) remaining (2026-11-23)</span>
            </div>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="panel">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <History size={16} color="var(--green-600)" />
              <h2 className="section-heading" style={{ margin: 0 }}>
                Recent Activity & Audit Trail
              </h2>
            </div>
            <Link href="/team" style={{ fontSize: 12, color: "var(--green-600)" }}>
              View all &rarr;
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {activityLog.slice(-5).reverse().map((act, idx) => (
              <div
                key={`dash-act-${act.id}-${idx}`}
                style={{
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: 8,
                  fontSize: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{act.action}</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {act.timestamp}
                  </span>
                </div>
                <div style={{ color: "var(--text-muted)" }}>
                  <span style={{ fontWeight: 500, color: "var(--green-700)" }}>{act.by}:</span>{" "}
                  {act.details}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
