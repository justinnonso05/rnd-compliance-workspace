"use client";

import { useState } from "react";
import { useComplianceStore } from "@/store/useComplianceStore";
import { RoleGuard } from "@/components/RoleGuard";
import {
  FileDown,
  FileText,
  Download,
  CheckSquare,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function ExportPage() {
  const {
    workingPlan,
    findings,
    activeSampleId,
    demoDate,
    baselineCount,
    activityLog,
    activePersonaId,
  } = useComplianceStore();

  const [leadApproved, setLeadApproved] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const isNcdmb = activePersonaId === "ncdmb";

  // PDF Generation with dynamic import to ensure 100% client-side execution
  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true);
    setDownloadSuccess(null);

    try {
      const { jsPDF } = await import("jspdf");
      const autoTableModule = await import("jspdf-autotable");
      const autoTable = autoTableModule.default || autoTableModule;

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Header Banner
      doc.setFillColor(10, 58, 30); // --green-950
      doc.rect(0, 0, 210, 24, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("R&D COMPLIANCE WORKSPACE", 14, 11);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("STATUTORY PRE-AUDIT COMPLIANCE REPORT (S.I. NO. 34 OF 2021)", 14, 18);

      // Prototype Notice Tag
      doc.setTextColor(180, 35, 24);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("PROTOTYPE // SYNTHETIC DATA ONLY", 135, 11);

      // Metadata Block
      doc.setTextColor(28, 36, 32);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("1. PROJECT & FILING PARTICULARS", 14, 32);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Operator: ${workingPlan.operator}`, 14, 38);
      doc.text(`Project Title: ${workingPlan.project.title.slice(0, 75)}...`, 14, 43);
      doc.text(`Focus Area: ${workingPlan.project.focus_area}`, 14, 48);
      doc.text(`Sample Dataset: Sample ${activeSampleId} (${workingPlan.label})`, 14, 53);
      doc.text(`Demo Date: ${demoDate}  |  Report Generated: ${new Date().toISOString().slice(0, 10)}`, 14, 58);

      // Summary Counts
      const defects = findings.filter(
        (f) => f.severity === "defect" && f.status !== "resolved" && f.status !== "acknowledged"
      ).length;
      const advisories = findings.filter(
        (f) => f.severity === "advisory" && f.status !== "resolved" && f.status !== "acknowledged"
      ).length;
      const timers = findings.filter(
        (f) => f.severity === "timer" && f.status !== "resolved"
      ).length;
      const acknowledged = findings.filter((f) => f.status === "acknowledged").length;

      doc.setFont("helvetica", "bold");
      doc.text("2. AUDIT FINDINGS SUMMARY", 14, 68);

      doc.setFont("helvetica", "normal");
      const summaryText = `Total Initial Findings: ${baselineCount ?? findings.length}   |   Current Open Defects: ${defects}   |   Advisories: ${advisories}   |   Active Timers: ${timers}   |   Acknowledged Historical: ${acknowledged}`;
      doc.text(summaryText, 14, 74);

      // Findings Table
      const tableRows = findings.map((f) => [
        f.id,
        f.rule,
        f.provision,
        f.severity.toUpperCase(),
        f.message,
        f.status.toUpperCase(),
        f.assignee || "Unassigned",
      ]);

      (autoTable as any)(doc, {
        startY: 80,
        head: [["ID", "Rule", "Provision", "Severity", "Finding Message", "Status", "Assignee"]],
        body: tableRows,
        theme: "plain",
        headStyles: {
          fillColor: [233, 244, 236], // --green-100
          textColor: [28, 36, 32],
          fontStyle: "bold",
          fontSize: 8,
        },
        styles: {
          fontSize: 7.5,
          cellPadding: 2,
          lineColor: [221, 226, 222],
          lineWidth: 0.2,
        },
        columnStyles: {
          0: { cellWidth: 12 },
          1: { cellWidth: 12 },
          2: { cellWidth: 26 },
          3: { cellWidth: 16 },
          4: { cellWidth: 80 },
          5: { cellWidth: 22 },
          6: { cellWidth: 24 },
        },
      });

      // Footer disclaimer on all pages
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7.5);
        doc.setTextColor(91, 102, 95);
        doc.text(
          "R&D Compliance Workspace Prototype — Illustrative audit format. Not an official NCDMB verification instrument.",
          14,
          290
        );
        doc.text(`Page ${i} of ${pageCount}`, 190, 290);
      }

      doc.save(`RDW_Compliance_Report_Sample_${activeSampleId}.pdf`);
      setDownloadSuccess("PDF Compliance Report generated and downloaded successfully.");
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Check browser console.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // JQS Illustrative JSON Download
  const handleDownloadJqsJson = () => {
    const payload = {
      _notice: "Illustrative format, not the official NOGIC JQS schema",
      generator: "R&D Compliance Workspace Prototype",
      generated_at: new Date().toISOString(),
      demo_date: demoDate,
      lead_researcher_approval: {
        approved: leadApproved,
        approved_by: "Dr. Ada Okeke-Sample",
        role: "Lead researcher",
      },
      operator_particulars: {
        name: workingPlan.operator,
        sample_id: activeSampleId,
        nc_plan_submitted: workingPlan.filing.nc_plan_submitted,
        rd_plan_filed: workingPlan.filing.rd_plan_filed,
        board_approved: workingPlan.filing.board_approved,
        plan_period: {
          start: workingPlan.filing.plan_start,
          end: workingPlan.filing.plan_end,
        },
      },
      schedule_I_presence: workingPlan.schedule_I,
      project: workingPlan.project,
      audit_findings: findings,
      activity_trail: activityLog.slice(-10),
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `JQS_Submission_Sample_${activeSampleId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess("Illustrative JQS JSON submission file downloaded successfully.");
  };

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <h1 className="page-title">Export & JQS Submission</h1>
        <p className="text-muted" style={{ marginTop: 2, fontSize: 13 }}>
          Generate the official pre-audit compliance dossier and illustrative NOGIC JQS portal submission package.
        </p>
      </div>

      {downloadSuccess && (
        <div
          style={{
            background: "var(--green-100)",
            border: "1px solid var(--green-200)",
            color: "var(--green-950)",
            padding: "10px 16px",
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
          <span>{downloadSuccess}</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* PDF Report Export Card */}
        <div className="panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <FileText size={20} color="var(--green-700)" />
              <h2 className="section-heading" style={{ margin: 0 }}>
                Audit Compliance Report (PDF)
              </h2>
            </div>
            <p className="text-muted" style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 14 }}>
              Generates an executive-ready compliance dossier containing full Schedule I verification metrics,
              detailed findings table, acknowledged historical deviations with comments, 14-day notice statuses,
              and re-audit before/after delta counters.
            </p>

            <ul style={{ fontSize: 12, color: "var(--text)", paddingLeft: 16, margin: "0 0 16px" }}>
              <li>Full statutory breakdown against S.I. No. 34 of 2021</li>
              <li>Includes all 16 particulars (a to p) presence mapping</li>
              <li>Documented audit trail and team comment records</li>
              <li>Includes synthetic prototype disclaimer in header/footer</li>
            </ul>
          </div>

          <div>
            <RoleGuard fallback={<button className="btn btn-secondary btn-sm" disabled>View only (Regulator)</button>}>
              <button
                onClick={handleGeneratePdf}
                disabled={isGeneratingPdf}
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <Download size={14} />
                {isGeneratingPdf ? "Compiling PDF..." : "Generate & Download PDF Report"}
              </button>
            </RoleGuard>
          </div>
        </div>

        {/* JQS Submission Package Card */}
        <div className="panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <FileDown size={20} color="var(--green-700)" />
              <h2 className="section-heading" style={{ margin: 0 }}>
                NOGIC JQS Data Submission Payload
              </h2>
            </div>
            <p className="text-muted" style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 14 }}>
              Exports the structured plan dataset for electronic ingestion into the NOGIC JQS portal.
              Tagged clearly: <em>"Illustrative format, not the official NOGIC JQS schema"</em>.
            </p>

            {/* Simulated Lead Approval Checkbox */}
            <div
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: 12,
                marginBottom: 16,
              }}
            >
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: activePersonaId === "lead" ? "pointer" : "not-allowed" }}>
                <input
                  type="checkbox"
                  checked={leadApproved}
                  disabled={activePersonaId !== "lead"}
                  onChange={(e) => setLeadApproved(e.target.checked)}
                />
                <span style={{ fontWeight: 600 }}>
                  Reviewed and approved by Lead Researcher (Dr. Ada Okeke-Sample)
                </span>
              </label>
              <span style={{ display: "block", fontSize: 11, color: activePersonaId === "lead" ? "var(--text-muted)" : "var(--advisory)", marginTop: 4, marginLeft: 22 }}>
                {activePersonaId === "lead"
                  ? "Governance sign-off required prior to official portal export."
                  : "Approval restricted to Lead Researcher (Dr. Ada Okeke-Sample). Switch to Lead Researcher to sign off."}
              </span>
            </div>
          </div>

          <div>
            <RoleGuard fallback={<button className="btn btn-secondary btn-sm" disabled>View only (Regulator)</button>}>
              <button
                onClick={handleDownloadJqsJson}
                disabled={!leadApproved || isNcdmb}
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                title={!leadApproved ? "Check the Lead Researcher approval box above to enable export" : ""}
              >
                <Download size={14} /> Download JQS JSON Payload
              </button>
            </RoleGuard>
          </div>
        </div>
      </div>
    </div>
  );
}
