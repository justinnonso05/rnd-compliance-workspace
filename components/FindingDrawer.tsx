"use client";

import { useState } from "react";
import Link from "next/link";
import { Finding, FindingStatus } from "@/engine/types";
import { useComplianceStore, PERSONAS } from "@/store/useComplianceStore";
import { RoleGuard } from "@/components/RoleGuard";
import { generateFindingExplanation } from "@/data/assistant";
import {
  X,
  MessageSquareText,
  AlertCircle,
  AlertTriangle,
  Timer,
  CheckCircle,
  Clock,
  ArrowRight,
  Send,
  HelpCircle,
} from "lucide-react";

interface FindingDrawerProps {
  finding: Finding | null;
  onClose: () => void;
}

export function FindingDrawer({ finding, onClose }: FindingDrawerProps) {
  const {
    updateFindingStatus,
    assignFinding,
    addFindingComment,
    activePersonaId,
    workingPlan,
  } = useComplianceStore();

  const [commentInput, setCommentInput] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);

  if (!finding) return null;

  const isHistorical = !finding.correctable;
  const explanation = generateFindingExplanation(
    finding.rule,
    finding.facts,
    finding.message
  );

  const handleStatusChange = (newStatus: FindingStatus) => {
    updateFindingStatus(finding.id, newStatus);
  };

  const handleAssigneeChange = (assignee: string) => {
    assignFinding(finding.id, assignee);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addFindingComment(finding.id, commentInput.trim());
    setCommentInput("");
  };

  return (
    <div className="drawer" style={{ width: 480, zIndex: 250 }}>
      {/* Header */}
      <div className="drawer-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            className={`badge ${
              finding.severity === "defect"
                ? "badge-defect"
                : finding.severity === "advisory"
                ? "badge-advisory"
                : "badge-timer"
            }`}
          >
            {finding.severity.toUpperCase()}
          </span>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{finding.id}</span>
          <span className="chip" style={{ fontSize: 11 }}>
            {finding.provision}
          </span>
        </div>

        <button
          onClick={onClose}
          className="btn btn-ghost btn-sm"
          style={{ padding: 4 }}
          aria-label="Close drawer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="drawer-body">
        {/* Rule statement */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Rule Violation / Finding Statement
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginTop: 4 }}>
            {finding.message}
          </div>
        </div>

        {/* Legal Provision Context */}
        <div
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: 12,
            marginBottom: 16,
            fontSize: 12,
          }}
        >
          <div style={{ fontWeight: 600, color: "var(--green-950)", marginBottom: 4 }}>
            Statutory Provision: {finding.provision}
          </div>
          <p style={{ margin: 0, color: "var(--text)" }}>
            {isHistorical
              ? "Historical regulatory obligation. Because this event occurred in the past, it cannot be undone in this draft and must be acknowledged with justification."
              : "Active compliance requirement. Rectifying the draft field will resolve this finding on re-audit."}
          </p>
        </div>

        {/* Computed Facts */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>
            Computed Evidence & Facts
          </div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
            <table className="data-table" style={{ fontSize: 12 }}>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600, width: "40%" }}>Associated Field</td>
                  <td className="mono">{finding.field}</td>
                </tr>
                {finding.where && (
                  <tr>
                    <td style={{ fontWeight: 600 }}>Plan Location</td>
                    <td>{finding.where}</td>
                  </tr>
                )}
                {Object.entries(finding.facts).map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ fontWeight: 600 }}>{k.replace(/_/g, " ")}</td>
                    <td className="mono">{String(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action button to Fix */}
        {finding.correctable && (
          <RoleGuard fallback={null}>
            <div style={{ marginBottom: 16 }}>
              <Link
                href="/fix"
                className="btn btn-primary btn-sm"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Open in Fix Workspace &rarr;
              </Link>
            </div>
          </RoleGuard>
        )}

        {/* Explain this finding (Assistant integration) */}
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="btn btn-secondary btn-sm"
            style={{ width: "100%", justifyContent: "center", gap: 6 }}
          >
            <HelpCircle size={14} />
            {showExplanation ? "Hide Explanation" : "Ask Assistant to explain this finding"}
          </button>

          {showExplanation && (
            <div
              style={{
                marginTop: 8,
                padding: 12,
                borderRadius: "var(--radius)",
                background: "var(--green-100)",
                border: "1px solid var(--green-200)",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontWeight: 600, color: "var(--green-950)", marginBottom: 4 }}>
                Legal Analysis ({explanation.provision})
              </div>
              <p style={{ margin: 0, color: "var(--text)" }}>{explanation.explanation}</p>
            </div>
          )}
        </div>

        {/* Assignment & Status Controls */}
        <div
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: 12,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                Assignee
              </label>
              <RoleGuard fallback={<span style={{ fontSize: 12 }}>{finding.assignee || "Unassigned"}</span>}>
                <select
                  value={finding.assignee || ""}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  style={{ width: "100%", padding: "4px 8px", fontSize: 12, borderRadius: "var(--radius)", border: "1px solid var(--border-strong)" }}
                >
                  <option value="">Unassigned</option>
                  {PERSONAS.filter((p) => p.id !== "ncdmb").map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </RoleGuard>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                Status
              </label>
              <RoleGuard fallback={<span style={{ fontSize: 12 }}>{finding.status}</span>}>
                <select
                  value={finding.status}
                  onChange={(e) => handleStatusChange(e.target.value as FindingStatus)}
                  style={{ width: "100%", padding: "4px 8px", fontSize: 12, borderRadius: "var(--radius)", border: "1px solid var(--border-strong)" }}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  {finding.correctable && <option value="resolved">Resolved</option>}
                  <option value="acknowledged">Acknowledged (Historical)</option>
                </select>
              </RoleGuard>
            </div>
          </div>
        </div>

        {/* Comments & Discussion Thread */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>
            Audit Thread & Comments ({finding.comments.length})
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {finding.comments.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
                No comments logged yet.
              </div>
            ) : (
              finding.comments.map((c, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: 8,
                    fontSize: 12,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, color: "var(--green-950)" }}>{c.by}</span>
                    <span className="mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>
                      {c.at}
                    </span>
                  </div>
                  <div style={{ color: "var(--text)" }}>{c.text}</div>
                </div>
              ))
            )}
          </div>

          {/* Add comment form */}
          <RoleGuard fallback={<div style={{ fontSize: 11, color: "var(--text-muted)" }}>Comments disabled in view-only role.</div>}>
            <form onSubmit={handleAddComment} style={{ display: "flex", gap: 6 }}>
              <input
                type="text"
                placeholder={isHistorical ? "Document acknowledgment rationale..." : "Add a team note or justification..."}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  fontSize: 12,
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--radius)",
                }}
              />
              <button type="submit" className="btn btn-secondary btn-sm">
                <Send size={12} />
              </button>
            </form>
          </RoleGuard>
        </div>
      </div>

      {/* Footer */}
      <div className="drawer-footer">
        <button onClick={onClose} className="btn btn-secondary btn-sm">
          Close
        </button>
      </div>
    </div>
  );
}
