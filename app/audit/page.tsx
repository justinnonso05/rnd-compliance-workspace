"use client";

import { useState } from "react";
import Link from "next/link";
import { useComplianceStore } from "@/store/useComplianceStore";
import { Finding, Severity, FindingStatus } from "@/engine/types";
import { FindingDrawer } from "@/components/FindingDrawer";
import { RoleGuard } from "@/components/RoleGuard";
import {
  ShieldAlert,
  Filter,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  AlertTriangle,
  Timer,
  CheckCircle2,
  FileEdit,
} from "lucide-react";

export default function AuditPage() {
  const {
    findings,
    workingPlan,
    activeSampleId,
    baselineCount,
    runAudit,
  } = useComplianceStore();

  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  // Filter states
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [layerFilter, setLayerFilter] = useState<string>("all");

  const openFindings = findings.filter(
    (f) => f.status !== "resolved" && f.status !== "acknowledged"
  );
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
  const resolvedCount = findings.filter(
    (f) => f.status === "resolved"
  ).length;

  const currentActiveCount = openFindings.length;
  const deltaText =
    baselineCount !== null && baselineCount !== currentActiveCount
      ? `Re-Audit Delta: Before ${baselineCount}, after ${currentActiveCount} (${baselineCount - currentActiveCount} cleared)`
      : null;

  // Filter findings
  const filteredFindings = findings.filter((f) => {
    if (severityFilter !== "all" && f.severity !== severityFilter) return false;
    if (statusFilter !== "all" && f.status !== statusFilter) return false;
    if (assigneeFilter !== "all" && (f.assignee || "unassigned") !== assigneeFilter)
      return false;
    if (layerFilter === "regulations" && !f.rule.startsWith("R")) return false;
    if (layerFilter === "template" && (f.rule.startsWith("R") || f.rule === "BUD" || f.rule === "EXP")) {
      if (layerFilter === "template" && !f.rule.startsWith("T")) return false;
    }
    return true;
  });

  return (
    <div>
      {/* Title & Actions */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="badge badge-info">Sample {activeSampleId}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{workingPlan.operator}</span>
            </div>
            <h1 className="page-title">Compliance Audit Results</h1>
            <p className="text-muted" style={{ marginTop: 2, fontSize: 13 }}>
              Statutory verification against S.I. No. 34 of 2021 and NCDMB R&D Plan Template (2019).
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <RoleGuard fallback={<span className="badge badge-info">View only (NCDMB Analyst)</span>}>
              <button className="btn btn-secondary btn-sm" onClick={() => runAudit()}>
                <RotateCcw size={14} /> Re-run Audit
              </button>
            </RoleGuard>
            <RoleGuard fallback={null}>
              <Link href="/fix" className="btn btn-primary btn-sm">
                <FileEdit size={14} /> Open Fix Workspace
              </Link>
            </RoleGuard>
          </div>
        </div>
      </div>

      {/* Delta Banner if re-audit was run */}
      {deltaText && (
        <div
          style={{
            background: "var(--green-100)",
            border: "1px solid var(--green-200)",
            color: "var(--green-950)",
            padding: "8px 16px",
            borderRadius: "var(--radius)",
            marginBottom: 16,
            fontWeight: 600,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CheckCircle2 size={16} color="var(--green-600)" />
          <span>{deltaText}</span>
        </div>
      )}

      {/* Summary Metric Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div className="panel" style={{ padding: "12px 14px", borderLeft: "3px solid var(--green-600)" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>TOTAL FINDINGS</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{findings.length}</div>
        </div>

        <div className="panel" style={{ padding: "12px 14px", borderLeft: "3px solid var(--defect)" }}>
          <div style={{ fontSize: 11, color: "var(--defect)", fontWeight: 600 }}>DEFECTS</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--defect)", marginTop: 2 }}>
            {defectsCount}
          </div>
        </div>

        <div className="panel" style={{ padding: "12px 14px", borderLeft: "3px solid var(--advisory)" }}>
          <div style={{ fontSize: 11, color: "var(--advisory)", fontWeight: 600 }}>ADVISORIES</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--advisory)", marginTop: 2 }}>
            {advisoriesCount}
          </div>
        </div>

        <div className="panel" style={{ padding: "12px 14px", borderLeft: "3px solid var(--timer)" }}>
          <div style={{ fontSize: 11, color: "var(--timer)", fontWeight: 600 }}>ACTIVE TIMERS</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--timer)", marginTop: 2 }}>
            {timersCount}
          </div>
        </div>

        <div className="panel" style={{ padding: "12px 14px", borderLeft: "3px solid var(--pass)" }}>
          <div style={{ fontSize: 11, color: "var(--pass)", fontWeight: 600 }}>ACKNOWLEDGED</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--pass)", marginTop: 2 }}>
            {acknowledgedCount}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className="panel"
        style={{
          padding: "10px 14px",
          marginBottom: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600 }}>
          <Filter size={14} color="var(--green-700)" /> Filter by:
        </div>

        <div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="role-select"
          >
            <option value="all">Severity: All</option>
            <option value="defect">Defects</option>
            <option value="advisory">Advisories</option>
            <option value="timer">Timers</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="role-select"
          >
            <option value="all">Status: All</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="acknowledged">Acknowledged</option>
          </select>
        </div>

        <div>
          <select
            value={layerFilter}
            onChange={(e) => setLayerFilter(e.target.value)}
            className="role-select"
          >
            <option value="all">Rule Layer: All</option>
            <option value="regulations">Regulations (S.I. No. 34)</option>
            <option value="template">NCDMB Template</option>
          </select>
        </div>

        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>
          Showing <strong>{filteredFindings.length}</strong> of {findings.length} findings
        </div>
      </div>

      {/* Findings Table */}
      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        {filteredFindings.length === 0 ? (
          <div className="empty-state">
            <CheckCircle2 size={32} color="var(--pass)" style={{ margin: "0 auto 8px" }} />
            <div style={{ fontWeight: 600, fontSize: 14 }}>No findings matching current filters</div>
            <p className="text-muted" style={{ margin: "4px 0 0" }}>
              Every check in this category passes.
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>ID</th>
                <th style={{ width: 70 }}>Rule</th>
                <th style={{ width: 90 }}>Severity</th>
                <th style={{ width: 140 }}>Provision</th>
                <th>Finding Message</th>
                <th>Field Path</th>
                <th>Assignee</th>
                <th style={{ width: 110 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredFindings.map((finding) => {
                const isSelected = selectedFinding?.id === finding.id;
                return (
                  <tr
                    key={finding.id}
                    onClick={() => setSelectedFinding(finding)}
                    style={{
                      cursor: "pointer",
                      background: isSelected ? "var(--green-100)" : undefined,
                    }}
                  >
                    <td className="mono" style={{ fontWeight: 700 }}>
                      {finding.id}
                    </td>
                    <td className="mono" style={{ fontWeight: 600 }}>
                      {finding.rule}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          finding.severity === "defect"
                            ? "badge-defect"
                            : finding.severity === "advisory"
                            ? "badge-advisory"
                            : "badge-timer"
                        }`}
                      >
                        {finding.severity}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, fontWeight: 500 }}>
                      {finding.provision}
                    </td>
                    <td style={{ fontWeight: 500 }}>{finding.message}</td>
                    <td className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {finding.field}
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {finding.assignee || <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          finding.status === "resolved"
                            ? "badge-pass"
                            : finding.status === "acknowledged"
                            ? "badge-info"
                            : finding.status === "in_progress"
                            ? "badge-timer"
                            : "badge-defect"
                        }`}
                      >
                        {finding.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Slide-out Finding Drawer */}
      <FindingDrawer
        finding={selectedFinding}
        onClose={() => setSelectedFinding(null)}
      />
    </div>
  );
}
