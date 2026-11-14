"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  useComplianceStore,
  PERSONAS,
  PersonaInfo,
} from "@/store/useComplianceStore";
import { REG13_AREAS, TEMPLATE_FOCUS_AREAS } from "@/engine/dates";
import {
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  UserPlus,
  ShieldAlert,
  Building2,
  Users,
  Compass,
  FileCheck,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Prototype notice", icon: ShieldAlert },
  { id: 2, label: "Sign in", icon: Users },
  { id: 3, label: "Workspace setup", icon: Building2 },
  { id: 4, label: "Project setup", icon: Compass },
  { id: 5, label: "Team review", icon: FileCheck },
];

const SAMPLE_FOCUS_AREAS = [
  ...TEMPLATE_FOCUS_AREAS,
  "Retail marketing and customer-brand studies",
];

export default function OnboardingPage() {
  const router = useRouter();
  const {
    activePersonaId,
    setActivePersona,
    workingPlan,
    updateField,
    setActiveSample,
  } = useComplianceStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [operatorName, setOperatorName] = useState(workingPlan.operator || "Sample Operator Ltd");
  const [operatorState] = useState("Rivers State");
  const [ncPlanDate, setNcPlanDate] = useState(workingPlan.filing?.nc_plan_submitted || "2025-02-03");

  const [projectTitle, setProjectTitle] = useState(
    workingPlan.project?.title ||
      "Comprehensive Subsea Pipeline Integrity Management and Local Materials Substitution in Deepwater Offshore Nigeria"
  );
  const [focusArea, setFocusArea] = useState(
    workingPlan.project?.focus_area || "Engineering studies"
  );
  const [researchCenter, setResearchCenter] = useState("Federal University of Petroleum Resources, Effurun");
  const [planStart, setPlanStart] = useState(workingPlan.filing?.plan_start || "2026-01-01");
  const [planEnd, setPlanEnd] = useState(workingPlan.filing?.plan_end || "2028-12-31");

  const [invitedTeam, setInvitedTeam] = useState<Array<{ name: string; role: string; status: string }>>([
    { name: "Dr. Ada Okeke-Sample", role: "Lead researcher", status: "Active" },
    { name: "Engr. Musa Bello-Sample", role: "Co-researcher", status: "Active" },
    { name: "Ms. Chioma Eze-Sample", role: "Compliance reviewer", status: "Active" },
    { name: "NCDMB Analyst", role: "Regulator (view-only)", status: "Active" },
  ]);

  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("Co-researcher");

  const isFocusReg13 = REG13_AREAS.includes(focusArea);
  const isFocusTemplate = TEMPLATE_FOCUS_AREAS.includes(focusArea);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim()) return;
    setInvitedTeam((prev) => [
      ...prev,
      { name: inviteName.trim(), role: inviteRole, status: "Invited" },
    ]);
    setInviteName("");
  };

  const handleFinishOnboarding = () => {
    updateField("operator", operatorName);
    updateField("filing.nc_plan_submitted", ncPlanDate);
    updateField("filing.plan_start", planStart);
    updateField("filing.plan_end", planEnd);
    updateField("project.title", projectTitle);
    updateField("project.focus_area", focusArea);
    router.push("/");
  };

  const handleSkipToDemo = () => {
    setActiveSample("B");
    router.push("/");
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <h1 className="page-title">Onboarding & Workspace Setup</h1>
          <p className="text-muted" style={{ marginTop: 2, fontSize: 13 }}>
            Initialize your compliance workspace and configure the R&D project particulars.
          </p>
        </div>

        {activePersonaId !== "ncdmb" && (
          <button
            onClick={handleSkipToDemo}
            className="btn btn-secondary btn-sm"
            title="Presenter shortcut: load Sample B (defective demo document) immediately"
          >
            Skip to demo (Load Sample B)
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24 }}>
        {/* Left Vertical Stepper */}
        <div className="panel" style={{ padding: "16px 12px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {STEPS.map((step) => {
              const isDone = currentStep > step.id;
              const isActive = currentStep === step.id;

              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: "var(--radius)",
                    border: "none",
                    background: isActive ? "var(--green-100)" : "transparent",
                    color: isActive ? "var(--green-950)" : "var(--text-muted)",
                    fontWeight: isActive ? 600 : 500,
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 13,
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      background: isDone
                        ? "var(--pass)"
                        : isActive
                        ? "var(--green-600)"
                        : "var(--surface)",
                      color: isDone || isActive ? "#fff" : "var(--text-muted)",
                      border: isDone || isActive ? "none" : "1px solid var(--border-strong)",
                    }}
                  >
                    {isDone ? "✓" : step.id}
                  </div>
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Step Content */}
        <div className="panel">
          {/* STEP 1: Prototype Notice */}
          {currentStep === 1 && (
            <div>
              <h2 className="section-heading" style={{ marginBottom: 12 }}>
                Step 1: Prototype Notice & Scope
              </h2>
              <div
                style={{
                  background: "var(--advisory-bg)",
                  border: "1px solid var(--advisory)",
                  borderRadius: "var(--radius)",
                  padding: 16,
                  marginBottom: 16,
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                <div style={{ fontWeight: 600, color: "var(--advisory)", marginBottom: 6 }}>
                  Notice of Prototype Scope & Synthetic Data
                </div>
                <p style={{ margin: 0 }}>
                  This workspace is an interactive prototype demonstrating automated compliance checks
                  for R&D plans under the <strong>Nigerian Oil and Gas Research and Development Regulations, 2021 (S.I. No. 34 of 2021)</strong>.
                </p>
                <ul style={{ margin: "8px 0 0 16px", padding: 0 }}>
                  <li><strong>Rule Checks:</strong> Live in-browser execution on all extracted fields (R1–R10, BUD, EXP, T1–T9).</li>
                  <li><strong>Document Extraction:</strong> Simulated recognition for synthetic plans Sample A, B, and C.</li>
                  <li><strong>Assistant:</strong> Scripted demo responses citing verified provisions.</li>
                  <li><strong>Data:</strong> Synthetic data only; no confidential operator data is stored.</li>
                </ul>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentStep(2)}
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Persona Sign-In */}
          {currentStep === 2 && (
            <div>
              <h2 className="section-heading" style={{ marginBottom: 4 }}>
                Step 2: Select Demo Account
              </h2>
              <p className="text-muted" style={{ marginBottom: 16, fontSize: 13 }}>
                Demo accounts only — no password required. Switch personas at any time via the top bar.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                {PERSONAS.map((p) => {
                  const isSelected = activePersonaId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setActivePersona(p.id)}
                      style={{
                        border: isSelected
                          ? "2px solid var(--green-600)"
                          : "1px solid var(--border)",
                        background: isSelected ? "var(--green-100)" : "var(--surface)",
                        padding: 14,
                        borderRadius: "var(--radius)",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <div className="avatar">{p.initials}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.role}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                        {p.id === "lead" && "Advances project phases, approves final JQS exports."}
                        {p.id === "co_researcher" && "Edits technical fields, rectifies findings, drafts milestones."}
                        {p.id === "compliance" && "Uploads plans, assigns findings, logs Board notices."}
                        {p.id === "ncdmb" && "View-only regulator role; all action controls are disabled."}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button className="btn btn-secondary" onClick={() => setCurrentStep(1)}>
                  Back
                </button>
                <button className="btn btn-primary" onClick={() => setCurrentStep(3)}>
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Workspace Setup */}
          {currentStep === 3 && (
            <div>
              <h2 className="section-heading" style={{ marginBottom: 4 }}>
                Step 3: Operator Workspace
              </h2>
              <p className="text-muted" style={{ marginBottom: 16, fontSize: 13 }}>
                Configure the operating company and statutory submission baseline date.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 500, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    Operator Company Name
                  </label>
                  <input
                    type="text"
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      fontSize: 13,
                      border: "1px solid var(--border-strong)",
                      borderRadius: "var(--radius)",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    Operating Jurisdiction State (Read-only)
                  </label>
                  <input
                    type="text"
                    value={operatorState}
                    disabled
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      fontSize: 13,
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      color: "var(--text-muted)",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    Nigerian Content Plan (NCP) Submission Date
                  </label>
                  <input
                    type="date"
                    value={ncPlanDate}
                    onChange={(e) => setNcPlanDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      fontSize: 13,
                      fontFamily: "var(--font-mono), monospace",
                      border: "1px solid var(--border-strong)",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, display: "block" }}>
                    Reg 10 statutory clock: R&D Plan must be filed within 6 months of this date.
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button className="btn btn-secondary" onClick={() => setCurrentStep(2)}>
                  Back
                </button>
                <button className="btn btn-primary" onClick={() => setCurrentStep(4)}>
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Project Setup */}
          {currentStep === 4 && (
            <div>
              <h2 className="section-heading" style={{ marginBottom: 4 }}>
                Step 4: Project Setup & Requirements Checklist
              </h2>
              <p className="text-muted" style={{ marginBottom: 16, fontSize: 13 }}>
                Title, focus area, research centre partnership, and statutory 3–5 year duration.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20, marginBottom: 20 }}>
                {/* Form Inputs */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                      Project Title (Template 1.3: Max 20 words)
                    </label>
                    <textarea
                      rows={3}
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        fontSize: 13,
                        border: "1px solid var(--border-strong)",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                      Words: {projectTitle.trim().split(/\s+/).filter(Boolean).length} / 20
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                      R&D Focus Area (Reg 13 / Template 1.2)
                    </label>
                    <select
                      value={focusArea}
                      onChange={(e) => setFocusArea(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        fontSize: 13,
                        border: "1px solid var(--border-strong)",
                        borderRadius: "var(--radius)",
                        background: "var(--surface)",
                      }}
                    >
                      {SAMPLE_FOCUS_AREAS.map((fa) => (
                        <option key={fa} value={fa}>
                          {fa}
                        </option>
                      ))}
                    </select>

                    {/* Live Rule R5 Advisory Banner */}
                    {!isFocusReg13 && (
                      <div
                        style={{
                          marginTop: 6,
                          padding: "6px 10px",
                          borderRadius: "var(--radius)",
                          background: isFocusTemplate ? "var(--info-bg)" : "var(--advisory-bg)",
                          border: `1px solid ${isFocusTemplate ? "var(--info)" : "var(--advisory)"}`,
                          color: isFocusTemplate ? "var(--info)" : "var(--advisory)",
                          fontSize: 12,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <AlertTriangle size={14} />
                        <span>
                          {isFocusTemplate
                            ? "Rule R5 Notice: Recognized in Template 1.2 but outside the 4 explicit Reg 13 areas."
                            : "Rule R5 Advisory: Off-list focus area. Will trigger an Advisory finding for Board evaluation."}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                      Partner Research Centre
                    </label>
                    <input
                      type="text"
                      value={researchCenter}
                      onChange={(e) => setResearchCenter(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        fontSize: 13,
                        border: "1px solid var(--border-strong)",
                        borderRadius: "var(--radius)",
                      }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                        Plan Start Date
                      </label>
                      <input
                        type="date"
                        value={planStart}
                        onChange={(e) => setPlanStart(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          fontSize: 12,
                          fontFamily: "var(--font-mono), monospace",
                          border: "1px solid var(--border-strong)",
                          borderRadius: "var(--radius)",
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                        Plan End Date
                      </label>
                      <input
                        type="date"
                        value={planEnd}
                        onChange={(e) => setPlanEnd(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          fontSize: 12,
                          fontFamily: "var(--font-mono), monospace",
                          border: "1px solid var(--border-strong)",
                          borderRadius: "var(--radius)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Requirements Checklist */}
                <div
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: 12,
                    fontSize: 12,
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 8, color: "var(--green-950)" }}>
                    Schedule I Mandatory Particulars:
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 240, overflowY: "auto" }}>
                    {[
                      "(a) Revolving 3-5 year plan duration",
                      "(b) Stated expected outcomes & targets",
                      "(c) Scope of work and technical objectives",
                      "(d) Technical challenges addressed",
                      "(e) Planned expenditure & annual budget",
                      "(f) Methodology & experimental approach",
                      "(g) Project timeline & key milestones",
                      "(h) Facilities, equipment, infrastructure",
                      "(i) Nigerian research centre partnerships",
                      "(j) Personnel & expertise requirements",
                      "(k) Training plan for Nigerian personnel",
                      "(l) Succession & knowledge transfer",
                      "(m) Collaboration with other operators",
                      "(n) Risk assessment & mitigation matrix",
                      "(o) Environmental impact analysis",
                      "(p) Dissemination & commercialization plan",
                    ].map((item, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <CheckCircle size={13} color="var(--green-600)" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button className="btn btn-secondary" onClick={() => setCurrentStep(3)}>
                  Back
                </button>
                <button className="btn btn-primary" onClick={() => setCurrentStep(5)}>
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Team Review */}
          {currentStep === 5 && (
            <div>
              <h2 className="section-heading" style={{ marginBottom: 4 }}>
                Step 5: Project Team Roster
              </h2>
              <p className="text-muted" style={{ marginBottom: 16, fontSize: 13 }}>
                Review assigned team members and invite collaborators.
              </p>

              <table className="data-table" style={{ marginBottom: 16 }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invitedTeam.map((member, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500 }}>{member.name}</td>
                      <td>{member.role}</td>
                      <td>
                        <span
                          className={`badge ${
                            member.status === "Active" ? "badge-pass" : "badge-info"
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Simulated Invite Form */}
              <form
                onSubmit={handleInvite}
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  background: "var(--bg)",
                  padding: 10,
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                  marginBottom: 20,
                }}
              >
                <input
                  type="text"
                  placeholder="Collaborator name..."
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "6px 8px",
                    fontSize: 12,
                    border: "1px solid var(--border-strong)",
                    borderRadius: "var(--radius)",
                  }}
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  style={{
                    padding: "6px 8px",
                    fontSize: 12,
                    border: "1px solid var(--border-strong)",
                    borderRadius: "var(--radius)",
                    background: "var(--surface)",
                  }}
                >
                  <option value="Co-researcher">Co-researcher</option>
                  <option value="Research Engineer">Research Engineer</option>
                  <option value="External Analyst">External Analyst</option>
                </select>
                <button type="submit" className="btn btn-secondary btn-sm">
                  <UserPlus size={14} /> Invite
                </button>
              </form>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button className="btn btn-secondary" onClick={() => setCurrentStep(4)}>
                  Back
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleFinishOnboarding}
                >
                  Open project dashboard <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
