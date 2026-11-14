"use client";

import { useState } from "react";
import Link from "next/link";
import { useComplianceStore } from "@/store/useComplianceStore";
import { Finding, FindingStatus } from "@/engine/types";
import { REG13_AREAS } from "@/engine/dates";
import { RoleGuard } from "@/components/RoleGuard";
import {
  Wrench,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Timer,
  Save,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Sparkles,
} from "lucide-react";

export default function FixPage() {
  const {
    findings,
    workingPlan,
    updateField,
    runAudit,
    updateFindingStatus,
    addFindingComment,
    baselineCount,
  } = useComplianceStore();

  const correctableFindings = findings.filter((f) => f.correctable);
  const historicalFindings = findings.filter((f) => !f.correctable);

  const [selectedFindingId, setSelectedFindingId] = useState<string>(
    correctableFindings[0]?.id || ""
  );

  const [reAuditMessage, setReAuditMessage] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");

  const activeFinding = findings.find((f) => f.id === selectedFindingId) || correctableFindings[0];

  const handleSaveAndReaudit = () => {
    runAudit();
    setReAuditMessage("Plan saved and rule engine re-evaluated live.");
    setTimeout(() => setReAuditMessage(null), 4000);
  };

  const handleApplyFix = (rule: string) => {
    switch (rule) {
      case "R1":
        // Fix Schedule I missing (j) and (o)
        updateField("schedule_I.j.present", true);
        updateField(
          "schedule_I.j.text",
          "Qualified engineering personnel with deepwater pipeline integrity credentials."
        );
        updateField("schedule_I.o.present", true);
        updateField(
          "schedule_I.o.text",
          "Comprehensive environmental impact assessment conducted for deepwater benthic ecosystems."
        );
        break;

      case "R2":
        // Fix 24-month duration to 36 months (e.g. 2026-01-01 to 2028-12-31)
        updateField("filing.plan_end", "2028-12-31");
        break;

      case "R5":
        // Switch to an explicit Reg 13 focus area
        updateField("project.focus_area", "Engineering studies");
        break;

      case "R10":
        // Add measurable numeral target to expected outcome
        updateField(
          "expected_outcome_text",
          "Development and field validation of local composite pipe repair sleeves achieving 99.5% tensile retention and 20-year design life."
        );
        break;

      case "BUD":
        // Fix budget sum (e.g. adjust item a to 4,000,000 or stated total to 16,500,000)
        updateField("project.budget_stated_total", 16500000);
        break;

      case "EXP":
        // Fix planned expenditure total
        updateField("planned_expenditure.stated_total", 16500000);
        break;

      case "T1":
        // Shorten title to <= 20 words
        updateField(
          "project.title",
          "Subsea Pipeline Integrity and Local Materials Substitution in Deepwater Offshore Nigeria"
        );
        break;

      case "T3":
        // Add keywords to 5
        updateField("project.keywords", [
          "subsea pipelines",
          "composite repair",
          "local materials",
          "deepwater",
          "pipeline integrity",
        ]);
        break;

      case "T8":
        // Ensure tripartite steering team
        updateField("project.steering_team.ncdmb", true);
        updateField("project.steering_team.company", true);
        updateField("project.steering_team.research_center", true);
        break;

      case "T9":
        // Sign plagiarism statement
        updateField("project.plagiarism_statement_signed", true);
        break;

      case "R8":
      case "R9":
        // Record rectification for Board notice
        if (workingPlan.board_notices.length > 0) {
          updateField("board_notices.0.rectified_date", "2026-11-20");
        }
        break;

      default:
        break;
    }

    runAudit();
    setReAuditMessage(`Compliant modification applied for ${rule}. Re-audit updated live.`);
    setTimeout(() => setReAuditMessage(null), 4000);
  };

  const handleAcknowledgeHistorical = (f: Finding) => {
    if (!commentInput.trim()) {
      alert("Please provide an acknowledgment comment/rationale for this historical item.");
      return;
    }
    addFindingComment(f.id, commentInput.trim());
    updateFindingStatus(f.id, "acknowledged");
    setCommentInput("");
  };

  const openCorrectableCount = findings.filter(
    (f) => f.correctable && f.status !== "resolved"
  ).length;

  const acknowledgedCount = findings.filter(
    (f) => f.status === "acknowledged"
  ).length;

  return (
    <div>
      {/* Title */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className="page-title">Fix & Re-Audit Workspace</h1>
            <p className="text-muted" style={{ marginTop: 2, fontSize: 13 }}>
              Triage and remediate draft defects in real-time, and document formal acknowledgment for immutable historical obligations.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span
              className={`badge ${
                openCorrectableCount === 0 ? "badge-pass" : "badge-defect"
              }`}
              style={{ fontSize: 12, padding: "4px 10px" }}
            >
              {openCorrectableCount === 0
                ? "✓ 0 Open Correctable Items"
                : `${openCorrectableCount} Correctable Finding(s) Open`}
            </span>

            <RoleGuard>
              <button className="btn btn-primary btn-sm" onClick={handleSaveAndReaudit}>
                <Save size={14} /> Save & Re-Audit
              </button>
            </RoleGuard>
          </div>
        </div>
      </div>

      {/* Re-audit message toast banner */}
      {reAuditMessage && (
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
          <span>{reAuditMessage}</span>
        </div>
      )}

      {/* Two-Pane Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16 }}>
        {/* Left Pane: Finding List */}
        <div className="panel" style={{ padding: 12, height: "calc(100vh - 230px)", overflowY: "auto" }}>
          <div style={{ fontWeight: 600, fontSize: 12, color: "var(--green-950)", marginBottom: 8, textTransform: "uppercase" }}>
            Correctable Draft Findings ({correctableFindings.length})
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
            {correctableFindings.map((f) => {
              const isSelected = activeFinding?.id === f.id;
              const isResolved = f.status === "resolved";

              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedFindingId(f.id)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "var(--radius)",
                    border: isSelected
                      ? "2px solid var(--green-600)"
                      : "1px solid var(--border)",
                    background: isSelected ? "var(--green-100)" : "var(--surface)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="mono" style={{ fontWeight: 700, fontSize: 12 }}>{f.id}</span>
                      <span className="chip" style={{ fontSize: 10, padding: "1px 4px" }}>{f.rule}</span>
                    </div>
                    <span
                      className={`badge ${
                        isResolved
                          ? "badge-pass"
                          : f.severity === "defect"
                          ? "badge-defect"
                          : f.severity === "advisory"
                          ? "badge-advisory"
                          : "badge-timer"
                      }`}
                      style={{ fontSize: 10 }}
                    >
                      {f.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text)", lineHeight: 1.3 }}>
                    {f.message}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Historical Items section */}
          <div style={{ fontWeight: 600, fontSize: 12, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", paddingTop: 8, borderTop: "1px solid var(--border)" }}>
            Historical Non-Correctable ({historicalFindings.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {historicalFindings.map((f) => {
              const isSelected = activeFinding?.id === f.id;
              const isAck = f.status === "acknowledged";

              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedFindingId(f.id)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "var(--radius)",
                    border: isSelected
                      ? "2px solid var(--info)"
                      : "1px solid var(--border)",
                    background: isSelected ? "var(--info-bg)" : "var(--surface)",
                    cursor: "pointer",
                    opacity: isAck ? 0.75 : 1,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="mono" style={{ fontWeight: 700, fontSize: 12 }}>{f.id}</span>
                      <span className="chip" style={{ fontSize: 10, padding: "1px 4px" }}>{f.rule}</span>
                    </div>
                    <span className={`badge ${isAck ? "badge-info" : "badge-defect"}`} style={{ fontSize: 10 }}>
                      {f.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text)", lineHeight: 1.3 }}>
                    {f.message}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Targeted Field Editor & Remediation Tool */}
        <div className="panel" style={{ height: "calc(100vh - 230px)", overflowY: "auto" }}>
          {activeFinding ? (
            <div>
              {/* Active Finding Banner */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  paddingBottom: 12,
                  marginBottom: 16,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span className="mono" style={{ fontWeight: 700, fontSize: 15 }}>
                      {activeFinding.id}: {activeFinding.rule}
                    </span>
                    <span className="chip" style={{ fontSize: 11 }}>
                      {activeFinding.provision}
                    </span>
                    <span
                      className={`badge ${
                        activeFinding.severity === "defect"
                          ? "badge-defect"
                          : activeFinding.severity === "advisory"
                          ? "badge-advisory"
                          : "badge-timer"
                      }`}
                    >
                      {activeFinding.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{activeFinding.message}</div>
                </div>

                {/* 1-Click Auto Remediation button for demo presentation */}
                {activeFinding.correctable && (
                  <RoleGuard>
                    <button
                      onClick={() => handleApplyFix(activeFinding.rule)}
                      className="btn btn-secondary btn-sm"
                      title="Apply recommended compliant modification directly"
                    >
                      <Sparkles size={14} color="var(--green-600)" />
                      Apply Compliant Fix
                    </button>
                  </RoleGuard>
                )}
              </div>

              {/* Specific Field Editor based on rule */}
              <div style={{ marginBottom: 20 }}>
                {/* R1: Schedule I particulars */}
                {activeFinding.rule === "R1" && (
                  <div>
                    <h3 className="section-heading" style={{ marginBottom: 8, fontSize: 13 }}>
                      Schedule I Missing Particulars Editor
                    </h3>
                    <p className="text-muted" style={{ fontSize: 12, marginBottom: 12 }}>
                      Particulars (j) Personnel and (o) Environmental Impact are missing from the draft. Provide content below:
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                          Schedule I (j): Personnel & Expertise Requirements
                        </label>
                        <textarea
                          rows={3}
                          value={workingPlan.schedule_I?.j?.text || ""}
                          onChange={(e) => {
                            updateField("schedule_I.j.text", e.target.value);
                            updateField("schedule_I.j.present", Boolean(e.target.value.trim()));
                          }}
                          placeholder="Detail required engineering competencies and Nigerian staffing..."
                          style={{ width: "100%", padding: "8px", fontSize: 12, border: "1px solid var(--border-strong)", borderRadius: "var(--radius)" }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                          Schedule I (o): Environmental Impact Analysis
                        </label>
                        <textarea
                          rows={3}
                          value={workingPlan.schedule_I?.o?.text || ""}
                          onChange={(e) => {
                            updateField("schedule_I.o.text", e.target.value);
                            updateField("schedule_I.o.present", Boolean(e.target.value.trim()));
                          }}
                          placeholder="Detail environmental baseline studies and spill risk mitigations..."
                          style={{ width: "100%", padding: "8px", fontSize: 12, border: "1px solid var(--border-strong)", borderRadius: "var(--radius)" }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* R2: Plan Duration */}
                {activeFinding.rule === "R2" && (
                  <div>
                    <h3 className="section-heading" style={{ marginBottom: 8, fontSize: 13 }}>
                      Revolving Plan Duration Editor (Schedule I(a))
                    </h3>
                    <p className="text-muted" style={{ fontSize: 12, marginBottom: 12 }}>
                      Current plan covers 24 months (2026-01-01 to {workingPlan.filing?.plan_end}). Extend the plan completion date to 36–60 months:
                    </p>

                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                          Plan Start Date
                        </label>
                        <input
                          type="date"
                          value={workingPlan.filing?.plan_start}
                          onChange={(e) => updateField("filing.plan_start", e.target.value)}
                          className="mono"
                          style={{ padding: "6px 8px", fontSize: 12 }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                          Plan End Date (Target: &ge; 2028-12-31)
                        </label>
                        <input
                          type="date"
                          value={workingPlan.filing?.plan_end}
                          onChange={(e) => updateField("filing.plan_end", e.target.value)}
                          className="mono"
                          style={{ padding: "6px 8px", fontSize: 12 }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* R5: Focus Area */}
                {activeFinding.rule === "R5" && (
                  <div>
                    <h3 className="section-heading" style={{ marginBottom: 8, fontSize: 13 }}>
                      Focus Area Alignment (Reg 13)
                    </h3>
                    <p className="text-muted" style={{ fontSize: 12, marginBottom: 12 }}>
                      Current area '{workingPlan.project?.focus_area}' is flagged for review. Select one of the statutory Regulation 13 areas:
                    </p>

                    <select
                      value={workingPlan.project?.focus_area}
                      onChange={(e) => updateField("project.focus_area", e.target.value)}
                      style={{ width: "100%", padding: "6px 8px", fontSize: 13 }}
                    >
                      {REG13_AREAS.map((a) => (
                        <option key={a} value={a}>
                          {a} (Regulation 13 Approved)
                        </option>
                      ))}
                      <option value="Retail marketing and customer-brand studies">
                        Retail marketing and customer-brand studies (Off-list)
                      </option>
                    </select>
                  </div>
                )}

                {/* R10: Measurable Outcome */}
                {activeFinding.rule === "R10" && (
                  <div>
                    <h3 className="section-heading" style={{ marginBottom: 8, fontSize: 13 }}>
                      Measurable Target & Expected Outcome (Schedule I(b))
                    </h3>
                    <p className="text-muted" style={{ fontSize: 12, marginBottom: 12 }}>
                      The expected outcome must contain a quantifiable numeric target:
                    </p>

                    <textarea
                      rows={3}
                      value={workingPlan.expected_outcome_text}
                      onChange={(e) => updateField("expected_outcome_text", e.target.value)}
                      style={{ width: "100%", padding: "8px", fontSize: 12 }}
                    />
                  </div>
                )}

                {/* BUD: Budget Total */}
                {activeFinding.rule === "BUD" && (
                  <div>
                    <h3 className="section-heading" style={{ marginBottom: 8, fontSize: 13 }}>
                      Budget Sum vs Stated Total (Schedule I(e))
                    </h3>
                    <p className="text-muted" style={{ fontSize: 12, marginBottom: 12 }}>
                      Itemized budget rows sum to 16,500,000, but stated total is {workingPlan.project?.budget_stated_total.toLocaleString("en-US")}:
                    </p>

                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                      Correct Stated Total Amount
                    </label>
                    <input
                      type="number"
                      value={workingPlan.project?.budget_stated_total}
                      onChange={(e) =>
                        updateField(
                          "project.budget_stated_total",
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                      className="mono"
                      style={{ padding: "6px 8px", fontSize: 12, width: 200 }}
                    />
                  </div>
                )}

                {/* T1: Title word count */}
                {activeFinding.rule === "T1" && (
                  <div>
                    <h3 className="section-heading" style={{ marginBottom: 8, fontSize: 13 }}>
                      Project Title Word Limit (Template 1.3: Max 20 Words)
                    </h3>
                    <textarea
                      rows={3}
                      value={workingPlan.project?.title}
                      onChange={(e) => updateField("project.title", e.target.value)}
                      style={{ width: "100%", padding: "8px", fontSize: 12 }}
                    />
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                      Words: {workingPlan.project?.title.trim().split(/\s+/).filter(Boolean).length} / 20
                    </div>
                  </div>
                )}

                {/* T3: Keywords */}
                {activeFinding.rule === "T3" && (
                  <div>
                    <h3 className="section-heading" style={{ marginBottom: 8, fontSize: 13 }}>
                      Project Keywords (Template 1.5: 5 to 8 required)
                    </h3>
                    <input
                      type="text"
                      value={workingPlan.project?.keywords.join(", ")}
                      onChange={(e) =>
                        updateField(
                          "project.keywords",
                          e.target.value.split(",").map((k) => k.trim()).filter(Boolean)
                        )
                      }
                      style={{ width: "100%", padding: "6px 8px", fontSize: 12 }}
                    />
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                      Current Count: {workingPlan.project?.keywords.length} (Comma-separated)
                    </div>
                  </div>
                )}

                {/* T8: Steering Team */}
                {activeFinding.rule === "T8" && (
                  <div>
                    <h3 className="section-heading" style={{ marginBottom: 8, fontSize: 13 }}>
                      Steering Team Membership (Template 6.2)
                    </h3>
                    <p className="text-muted" style={{ fontSize: 12, marginBottom: 12 }}>
                      Must include representation from NCDMB, the Operator Company, and the Research Centre:
                    </p>

                    <div style={{ display: "flex", gap: 16 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                        <input
                          type="checkbox"
                          checked={workingPlan.project?.steering_team?.ncdmb}
                          onChange={(e) =>
                            updateField("project.steering_team.ncdmb", e.target.checked)
                          }
                        />
                        NCDMB Representative
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                        <input
                          type="checkbox"
                          checked={workingPlan.project?.steering_team?.company}
                          onChange={(e) =>
                            updateField("project.steering_team.company", e.target.checked)
                          }
                        />
                        Operating Company
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                        <input
                          type="checkbox"
                          checked={workingPlan.project?.steering_team?.research_center}
                          onChange={(e) =>
                            updateField(
                              "project.steering_team.research_center",
                              e.target.checked
                            )
                          }
                        />
                        Research Centre
                      </label>
                    </div>
                  </div>
                )}

                {/* T9: Plagiarism Statement */}
                {activeFinding.rule === "T9" && (
                  <div>
                    <h3 className="section-heading" style={{ marginBottom: 8, fontSize: 13 }}>
                      Plagiarism & Originality Declaration (Template 7.0)
                    </h3>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                      <input
                        type="checkbox"
                        checked={workingPlan.project?.plagiarism_statement_signed}
                        onChange={(e) =>
                          updateField(
                            "project.plagiarism_statement_signed",
                            e.target.checked
                          )
                        }
                      />
                      I certify that this R&D proposal is original and the plagiarism statement has been officially signed.
                    </label>
                  </div>
                )}

                {/* R8 / R9 Notice Timer */}
                {(activeFinding.rule === "R8" || activeFinding.rule === "R9") && (
                  <div>
                    <h3 className="section-heading" style={{ marginBottom: 8, fontSize: 13 }}>
                      Board Notice Rectification (Reg 16 / 17)
                    </h3>
                    <p className="text-muted" style={{ fontSize: 12, marginBottom: 12 }}>
                      Record the official rectification date (on or before deadline 2026-11-23):
                    </p>

                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                      Rectified Date
                    </label>
                    <input
                      type="date"
                      value={workingPlan.board_notices[0]?.rectified_date || ""}
                      onChange={(e) =>
                        updateField("board_notices.0.rectified_date", e.target.value)
                      }
                      className="mono"
                      style={{ padding: "6px 8px", fontSize: 12 }}
                    />
                  </div>
                )}

                {/* Historical Uncorrectable Item: Formal Acknowledgment */}
                {!activeFinding.correctable && (
                  <div
                    style={{
                      background: "var(--info-bg)",
                      border: "1px solid var(--info)",
                      borderRadius: "var(--radius)",
                      padding: 14,
                    }}
                  >
                    <div style={{ fontWeight: 600, color: "var(--info)", marginBottom: 6 }}>
                      Historical Regulatory Non-Compliance
                    </div>
                    <p style={{ fontSize: 12, margin: "0 0 12px", color: "var(--text)" }}>
                      This finding represents a past statutory filing or update that missed its deadline.
                      Under NCDMB audit rules, past dates cannot be retroactively modified. It must be formally
                      acknowledged with a justification rationale for the compliance file.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <label style={{ fontSize: 11, fontWeight: 600 }}>
                        Required Acknowledgment Justification
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Acknowledged. Delay occurred due to statutory transition period."
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        style={{ padding: "6px 8px", fontSize: 12, border: "1px solid var(--border-strong)", borderRadius: "var(--radius)" }}
                      />
                      <RoleGuard>
                        <button
                          onClick={() => handleAcknowledgeHistorical(activeFinding)}
                          className="btn btn-primary btn-sm"
                          style={{ alignSelf: "flex-start" }}
                        >
                          Mark as Acknowledged
                        </button>
                      </RoleGuard>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Action Bar */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 16,
                  borderTop: "1px solid var(--border)",
                }}
              >
                <Link href="/audit" className="btn btn-secondary btn-sm">
                  &larr; Return to Audit Results
                </Link>

                <RoleGuard>
                  <button className="btn btn-primary" onClick={handleSaveAndReaudit}>
                    <RotateCcw size={14} /> Save & Re-Audit Plan
                  </button>
                </RoleGuard>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <CheckCircle2 size={32} color="var(--pass)" style={{ margin: "0 auto 8px" }} />
              <div style={{ fontWeight: 600, fontSize: 14 }}>All correctable findings resolved!</div>
              <p className="text-muted" style={{ margin: "4px 0 12px" }}>
                Zero open defects. The phase gate to Report is now open.
              </p>
              <Link href="/" className="btn btn-primary btn-sm">
                Go to Dashboard &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
