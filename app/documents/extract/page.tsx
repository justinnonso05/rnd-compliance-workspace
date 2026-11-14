"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useComplianceStore } from "@/store/useComplianceStore";
import { RoleGuard } from "@/components/RoleGuard";
import {
  FileSearch,
  CheckCircle2,
  ArrowRight,
  Edit2,
  ShieldCheck,
  Building,
  ListChecks,
  FolderGit2,
} from "lucide-react";

const STAGES = [
  "Reading file",
  "Locating Schedule I headings",
  "Reading dates and logs",
  "Reading project annex",
  "Done",
];

function ExtractReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sampleParam = searchParams.get("id") as "A" | "B" | "C" | null;

  const {
    workingPlan,
    activeSampleId,
    setActiveSample,
    updateField,
    runAudit,
  } = useComplianceStore();

  useEffect(() => {
    if (sampleParam && ["A", "B", "C"].includes(sampleParam) && sampleParam !== activeSampleId) {
      setActiveSample(sampleParam);
    }
  }, [sampleParam, activeSampleId, setActiveSample]);

  // Extraction progression simulation: ~4 seconds total (800ms per stage)
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [activeTab, setActiveTab] = useState<"filing" | "schedule" | "annex">("filing");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStageIdx((prev) => {
        if (prev < STAGES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setIsDone(true);
          return prev;
        }
      });
    }, 700);

    return () => clearInterval(timer);
  }, []);

  const handleRunAudit = () => {
    runAudit();
    router.push("/audit");
  };

  const progressPercent = Math.round(((currentStageIdx + 1) / STAGES.length) * 100);

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className="page-title">Simulated Document Extraction Review</h1>
            <p className="text-muted" style={{ marginTop: 2, fontSize: 13 }}>
              Inspecting fields extracted from <strong>Sample_{activeSampleId}</strong>. Fields are live-editable for re-audit testing.
            </p>
          </div>

          {isDone && (
            <button className="btn btn-primary" onClick={handleRunAudit}>
              <ShieldCheck size={16} /> Run Compliance Audit <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Determinate Progress Stepper */}
      {!isDone && (
        <div className="panel" style={{ marginBottom: 16, padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
            <span style={{ fontWeight: 600, color: "var(--green-950)" }}>
              Extracting structured fields: {STAGES[currentStageIdx]}...
            </span>
            <span className="mono" style={{ fontWeight: 600 }}>{progressPercent}%</span>
          </div>

          <div
            style={{
              width: "100%",
              height: 8,
              background: "var(--bg)",
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                background: "var(--green-600)",
                transition: "width 300ms ease",
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "var(--text-muted)" }}>
            {STAGES.map((stage, idx) => (
              <span
                key={stage}
                style={{
                  color: idx <= currentStageIdx ? "var(--green-700)" : "var(--text-muted)",
                  fontWeight: idx === currentStageIdx ? 600 : 400,
                }}
              >
                {idx + 1}. {stage}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Extraction Review Tabs */}
      {isDone && (
        <div>
          {/* Tab buttons */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button
              onClick={() => setActiveTab("filing")}
              className={`btn ${activeTab === "filing" ? "btn-primary" : "btn-secondary"}`}
            >
              <Building size={14} /> Filing Particulars & Logs
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`btn ${activeTab === "schedule" ? "btn-primary" : "btn-secondary"}`}
            >
              <ListChecks size={14} /> Schedule I Particulars (a to p)
            </button>
            <button
              onClick={() => setActiveTab("annex")}
              className={`btn ${activeTab === "annex" ? "btn-primary" : "btn-secondary"}`}
            >
              <FolderGit2 size={14} /> Project Annex & Governance
            </button>
          </div>

          {/* TAB 1: Filing and logs */}
          {activeTab === "filing" && (
            <div className="panel">
              <h2 className="section-heading" style={{ marginBottom: 12 }}>
                Filing Particulars & Statutory Timeline
              </h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Extracted Value</th>
                    <th>Source Document Location</th>
                    <th>Edit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Operator Name</td>
                    <td>
                      <input
                        type="text"
                        value={workingPlan.operator}
                        onChange={(e) => updateField("operator", e.target.value)}
                        style={{ padding: "4px 8px", width: "100%", fontSize: 13 }}
                      />
                    </td>
                    <td className="mono" style={{ fontSize: 11 }}>Filing Section 1.1</td>
                    <td><Edit2 size={12} color="var(--text-muted)" /></td>
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 600 }}>NC Plan Submitted (Reg 10 baseline)</td>
                    <td>
                      <input
                        type="date"
                        value={workingPlan.filing.nc_plan_submitted}
                        onChange={(e) => updateField("filing.nc_plan_submitted", e.target.value)}
                        className="mono"
                        style={{ padding: "4px 8px", fontSize: 12 }}
                      />
                    </td>
                    <td className="mono" style={{ fontSize: 11 }}>Part A, Filing Particulars</td>
                    <td><Edit2 size={12} color="var(--text-muted)" /></td>
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 600 }}>R&D Plan Filed Date</td>
                    <td>
                      <input
                        type="date"
                        value={workingPlan.filing.rd_plan_filed}
                        onChange={(e) => updateField("filing.rd_plan_filed", e.target.value)}
                        className="mono"
                        style={{ padding: "4px 8px", fontSize: 12 }}
                      />
                    </td>
                    <td className="mono" style={{ fontSize: 11 }}>Filing Stamp</td>
                    <td><Edit2 size={12} color="var(--text-muted)" /></td>
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 600 }}>Board Approved Date</td>
                    <td>
                      <input
                        type="date"
                        value={workingPlan.filing.board_approved}
                        onChange={(e) => updateField("filing.board_approved", e.target.value)}
                        className="mono"
                        style={{ padding: "4px 8px", fontSize: 12 }}
                      />
                    </td>
                    <td className="mono" style={{ fontSize: 11 }}>Board Approval Notice</td>
                    <td><Edit2 size={12} color="var(--text-muted)" /></td>
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 600 }}>Plan Period (Start / End)</td>
                    <td>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input
                          type="date"
                          value={workingPlan.filing.plan_start}
                          onChange={(e) => updateField("filing.plan_start", e.target.value)}
                          className="mono"
                          style={{ padding: "4px 8px", fontSize: 12 }}
                        />
                        <span>to</span>
                        <input
                          type="date"
                          value={workingPlan.filing.plan_end}
                          onChange={(e) => updateField("filing.plan_end", e.target.value)}
                          className="mono"
                          style={{ padding: "4px 8px", fontSize: 12 }}
                        />
                      </div>
                    </td>
                    <td className="mono" style={{ fontSize: 11 }}>Part A (a) Duration</td>
                    <td><Edit2 size={12} color="var(--text-muted)" /></td>
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 600 }}>Six-Monthly Updates Count</td>
                    <td>
                      <span className="badge badge-info">
                        {workingPlan.updates.length} updates recorded
                      </span>
                    </td>
                    <td className="mono" style={{ fontSize: 11 }}>Filing Section 2.1</td>
                    <td>—</td>
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 600 }}>Quarterly Progress Reports</td>
                    <td>
                      <span className="badge badge-info">
                        {workingPlan.quarterly_reports.length} reports filed
                      </span>
                    </td>
                    <td className="mono" style={{ fontSize: 11 }}>Filing Section 2.2</td>
                    <td>—</td>
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 600 }}>Extension Requests</td>
                    <td>
                      <span className="badge badge-info">
                        {workingPlan.extension_requests.length} requests
                      </span>
                    </td>
                    <td className="mono" style={{ fontSize: 11 }}>Filing Section 2.3</td>
                    <td>—</td>
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 600 }}>Board Notices Logged</td>
                    <td>
                      <span className="badge badge-timer">
                        {workingPlan.board_notices.length} notices
                      </span>
                    </td>
                    <td className="mono" style={{ fontSize: 11 }}>Board Correspondence Log</td>
                    <td>—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: Schedule I */}
          {activeTab === "schedule" && (
            <div className="panel">
              <h2 className="section-heading" style={{ marginBottom: 12 }}>
                Schedule I Particulars Presence (Reg 11 (a) to (p))
              </h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Requirement</th>
                    <th>Present in Draft</th>
                    <th>Summary Text</th>
                    <th>Source Section</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      ["a", "Duration of plan (revolving 3 to 5 years)", "Part A (a)"],
                      ["b", "Expected outcome with measurable metrics", "Part A (b)"],
                      ["c", "Scope of work and technical objectives", "Part A (c)"],
                      ["d", "Technical challenges addressed", "Part A (d)"],
                      ["e", "Planned expenditure and yearly budget", "Part A (e)"],
                      ["f", "Methodology and research strategy", "Part A (f)"],
                      ["g", "Timeline and milestones", "Part A (g)"],
                      ["h", "Facilities and infrastructure usage", "Part A (h)"],
                      ["i", "Collaboration with Nigerian research centres", "Part A (i)"],
                      ["j", "Personnel and expertise requirements", "Part A (j)"],
                      ["k", "Training plan for Nigerian personnel", "Part A (k)"],
                      ["l", "Succession plan and knowledge transfer", "Part A (l)"],
                      ["m", "Collaboration with other operators", "Part A (m)"],
                      ["n", "Risk assessment and mitigation", "Part A (n)"],
                      ["o", "Environmental impact analysis", "Part A (o)"],
                      ["p", "Dissemination and commercialization", "Part A (p)"],
                    ] as const
                  ).map(([key, label, loc]) => {
                    const item = workingPlan.schedule_I[key];
                    const isPresent = Boolean(item?.present);

                    return (
                      <tr key={key}>
                        <td style={{ fontWeight: 600 }}>({key})</td>
                        <td>{label}</td>
                        <td>
                          <button
                            onClick={() =>
                              updateField(`schedule_I.${key}.present`, !isPresent)
                            }
                            className={`badge ${
                              isPresent ? "badge-pass" : "badge-defect"
                            }`}
                            style={{ cursor: "pointer", border: "none" }}
                            title="Click to toggle presence for re-audit"
                          >
                            {isPresent ? "✓ Present" : "✗ Missing"}
                          </button>
                        </td>
                        <td>
                          <input
                            type="text"
                            value={item?.text || ""}
                            onChange={(e) =>
                              updateField(`schedule_I.${key}.text`, e.target.value)
                            }
                            placeholder="Add text to fix missing particular..."
                            style={{
                              padding: "4px 8px",
                              width: "100%",
                              fontSize: 12,
                              border: isPresent
                                ? "1px solid var(--border)"
                                : "1px solid var(--defect)",
                            }}
                          />
                        </td>
                        <td className="mono" style={{ fontSize: 11 }}>{loc}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: Project Annex */}
          {activeTab === "annex" && (
            <div className="panel">
              <h2 className="section-heading" style={{ marginBottom: 12 }}>
                Project Annex & Template Structure (Annex 1)
              </h2>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Extracted Value</th>
                    <th>Source Location</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Project Title</td>
                    <td>
                      <textarea
                        rows={2}
                        value={workingPlan.project.title}
                        onChange={(e) => updateField("project.title", e.target.value)}
                        style={{ width: "100%", padding: "4px 8px", fontSize: 12 }}
                      />
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        Words: {workingPlan.project.title.trim().split(/\s+/).filter(Boolean).length} / 20
                      </span>
                    </td>
                    <td className="mono" style={{ fontSize: 11 }}>Annex 1, Section 1.3</td>
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 600 }}>Focus Area</td>
                    <td>
                      <input
                        type="text"
                        value={workingPlan.project.focus_area}
                        onChange={(e) => updateField("project.focus_area", e.target.value)}
                        style={{ width: "100%", padding: "4px 8px", fontSize: 12 }}
                      />
                    </td>
                    <td className="mono" style={{ fontSize: 11 }}>Annex 1, Section 1.2</td>
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 600 }}>Keywords</td>
                    <td>
                      <input
                        type="text"
                        value={workingPlan.project.keywords.join(", ")}
                        onChange={(e) =>
                          updateField(
                            "project.keywords",
                            e.target.value.split(",").map((k) => k.trim()).filter(Boolean)
                          )
                        }
                        style={{ width: "100%", padding: "4px 8px", fontSize: 12 }}
                      />
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        Count: {workingPlan.project.keywords.length} (Template requires 5 to 8)
                      </span>
                    </td>
                    <td className="mono" style={{ fontSize: 11 }}>Annex 1, Section 1.5</td>
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 600 }}>Principal Investigator</td>
                    <td>
                      <input
                        type="text"
                        value={workingPlan.project.principal_investigator?.name || ""}
                        onChange={(e) =>
                          updateField(
                            "project.principal_investigator.name",
                            e.target.value
                          )
                        }
                        placeholder="PI Name..."
                        style={{ width: "100%", padding: "4px 8px", fontSize: 12 }}
                      />
                    </td>
                    <td className="mono" style={{ fontSize: 11 }}>Annex 1, Section 3.1</td>
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 600 }}>Budget Lines Stated Total</td>
                    <td>
                      <input
                        type="number"
                        value={workingPlan.project.budget_stated_total}
                        onChange={(e) =>
                          updateField(
                            "project.budget_stated_total",
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        className="mono"
                        style={{ padding: "4px 8px", fontSize: 12 }}
                      />
                      <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 8 }}>
                        Sum of items:{" "}
                        {workingPlan.project.budget_items
                          .reduce((acc, b) => acc + b.amount, 0)
                          .toLocaleString("en-US")}
                      </span>
                    </td>
                    <td className="mono" style={{ fontSize: 11 }}>Annex 1, Section 4.1</td>
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 600 }}>Steering Team Membership</td>
                    <td>
                      <div style={{ display: "flex", gap: 14 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                          <input
                            type="checkbox"
                            checked={workingPlan.project.steering_team?.ncdmb}
                            onChange={(e) =>
                              updateField("project.steering_team.ncdmb", e.target.checked)
                            }
                          />
                          NCDMB
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                          <input
                            type="checkbox"
                            checked={workingPlan.project.steering_team?.company}
                            onChange={(e) =>
                              updateField("project.steering_team.company", e.target.checked)
                            }
                          />
                          Company
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                          <input
                            type="checkbox"
                            checked={workingPlan.project.steering_team?.research_center}
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
                    </td>
                    <td className="mono" style={{ fontSize: 11 }}>Annex 1, Section 6.2</td>
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 600 }}>Plagiarism Statement</td>
                    <td>
                      <button
                        onClick={() =>
                          updateField(
                            "project.plagiarism_statement_signed",
                            !workingPlan.project.plagiarism_statement_signed
                          )
                        }
                        className={`badge ${
                          workingPlan.project.plagiarism_statement_signed
                            ? "badge-pass"
                            : "badge-defect"
                        }`}
                        style={{ cursor: "pointer", border: "none" }}
                      >
                        {workingPlan.project.plagiarism_statement_signed
                          ? "✓ Signed"
                          : "✗ Not Signed"}
                      </button>
                    </td>
                    <td className="mono" style={{ fontSize: 11 }}>Annex 1, Section 7.0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ExtractPage() {
  return (
    <Suspense fallback={<div className="panel"><p className="text-muted">Loading extraction...</p></div>}>
      <ExtractReviewContent />
    </Suspense>
  );
}
