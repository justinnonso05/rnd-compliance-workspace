"use client";

import { useState } from "react";
import { useComplianceStore, PERSONAS } from "@/store/useComplianceStore";
import { RoleGuard } from "@/components/RoleGuard";
import {
  Users,
  History,
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
} from "lucide-react";

export default function TeamPage() {
  const {
    findings,
    activityLog,
    activePersonaId,
    assignFinding,
    updateFindingStatus,
  } = useComplianceStore();

  const [selectedAssignee, setSelectedAssignee] = useState<string>("all");
  const [bulkAssignTarget, setBulkAssignTarget] = useState<string>(PERSONAS[1].name);

  const canManageAssignments =
    activePersonaId === "lead" || activePersonaId === "compliance";

  // Compute workload per persona
  const workload = PERSONAS.map((p) => {
    const assignedFindings = findings.filter((f) => f.assignee === p.name);
    const openCount = assignedFindings.filter((f) => f.status === "open").length;
    const inProgressCount = assignedFindings.filter((f) => f.status === "in_progress").length;
    const resolvedCount = assignedFindings.filter(
      (f) => f.status === "resolved" || f.status === "acknowledged"
    ).length;
    return {
      persona: p,
      total: assignedFindings.length,
      open: openCount,
      inProgress: inProgressCount,
      resolved: resolvedCount,
    };
  });

  const unassignedFindings = findings.filter((f) => !f.assignee);

  const handleBulkAssignUnassigned = () => {
    unassignedFindings.forEach((f) => {
      assignFinding(f.id, bulkAssignTarget);
    });
  };

  const filteredFindings = findings.filter((f) => {
    if (selectedAssignee === "all") return true;
    if (selectedAssignee === "unassigned") return !f.assignee;
    return f.assignee === selectedAssignee;
  });

  return (
    <div>
      {/* Title */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className="page-title">Team Workload & Audit Trail</h1>
            <p className="text-muted" style={{ marginTop: 2, fontSize: 13 }}>
              Manage finding triage, assignments, and inspect the chronological compliance event log.
            </p>
          </div>

          {canManageAssignments && unassignedFindings.length > 0 && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Bulk assign {unassignedFindings.length} unassigned to:
              </span>
              <select
                value={bulkAssignTarget}
                onChange={(e) => setBulkAssignTarget(e.target.value)}
                className="role-select"
              >
                {PERSONAS.filter((p) => p.id !== "ncdmb").map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} ({p.role})
                  </option>
                ))}
              </select>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleBulkAssignUnassigned}
              >
                Assign All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Roster & Workload Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {workload.map(({ persona, total, open, inProgress, resolved }) => (
          <div
            key={persona.id}
            className="panel"
            style={{
              borderTop:
                persona.id === activePersonaId
                  ? "3px solid var(--green-600)"
                  : "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div className="avatar">{persona.initials}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{persona.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{persona.role}</div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 12 }}>
              <span>
                <strong>{open}</strong> open
              </span>
              <span>
                <strong>{inProgress}</strong> in progress
              </span>
              <span style={{ color: "var(--pass)" }}>
                <strong>{resolved}</strong> resolved
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Findings Triage Table & Activity Log Split */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        {/* Triage Table */}
        <div className="panel">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <h2 className="section-heading" style={{ margin: 0 }}>
              Assigned Findings Triage
            </h2>

            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="role-select"
            >
              <option value="all">All Assignees ({findings.length})</option>
              <option value="unassigned">Unassigned ({unassignedFindings.length})</option>
              {PERSONAS.filter((p) => p.id !== "ncdmb").map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ overflowY: "auto", maxHeight: 480 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Rule</th>
                  <th>Assignee</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredFindings.map((f) => (
                  <tr key={f.id}>
                    <td className="mono" style={{ fontWeight: 700 }}>{f.id}</td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 12 }}>{f.rule}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{f.provision}</div>
                    </td>
                    <td>
                      <RoleGuard fallback={<span style={{ fontSize: 12 }}>{f.assignee || "—"}</span>}>
                        <select
                          value={f.assignee || ""}
                          onChange={(e) => assignFinding(f.id, e.target.value)}
                          className="role-select"
                          style={{ fontSize: 11, padding: "2px 4px" }}
                        >
                          <option value="">Unassigned</option>
                          {PERSONAS.filter((p) => p.id !== "ncdmb").map((p) => (
                            <option key={p.id} value={p.name}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </RoleGuard>
                    </td>
                    <td>
                      <RoleGuard fallback={<span className="badge badge-info">{f.status}</span>}>
                        <select
                          value={f.status}
                          onChange={(e) => updateFindingStatus(f.id, e.target.value as any)}
                          className="role-select"
                          style={{ fontSize: 11, padding: "2px 4px" }}
                        >
                          <option value="open">open</option>
                          <option value="in_progress">in_progress</option>
                          {f.correctable && <option value="resolved">resolved</option>}
                          <option value="acknowledged">acknowledged</option>
                        </select>
                      </RoleGuard>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Trail / Activity Log */}
        <div className="panel" style={{ display: "flex", flexDirection: "column", maxHeight: 540 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <History size={18} color="var(--green-700)" />
            <h2 className="section-heading" style={{ margin: 0 }}>
              Chronological Audit Trail ({activityLog.length})
            </h2>
          </div>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {activityLog.slice().reverse().map((act, idx) => (
              <div
                key={`team-act-${act.id}-${idx}`}
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "8px 10px",
                  fontSize: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, color: "var(--green-950)" }}>{act.action}</span>
                  <span className="mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>
                    {act.timestamp}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  <span style={{ fontWeight: 500, color: "var(--text)" }}>{act.by}:</span>{" "}
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
