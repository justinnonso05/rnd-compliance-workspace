"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useComplianceStore } from "@/store/useComplianceStore";
import { RoleGuard } from "@/components/RoleGuard";
import {
  Upload,
  FileText,
  AlertTriangle,
  ArrowRight,
  Eye,
  CheckCircle2,
} from "lucide-react";

interface DocItem {
  id: "A" | "B" | "C";
  filename: string;
  filesize: string;
  uploadedBy: string;
  uploadedAt: string;
  status: "Uploaded" | "Extracted" | "Audited";
  pdfUrl: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const {
    activeSampleId,
    setActiveSample,
    activityLog,
    demoDate,
    activePersonaId,
  } = useComplianceStore();

  const [docsList, setDocsList] = useState<DocItem[]>([
    {
      id: "A",
      filename: "Sample_A_Compliant.pdf",
      filesize: "142 KB",
      uploadedBy: "Ms. Chioma Eze-Sample",
      uploadedAt: "2026-11-16 08:30",
      status: "Audited",
      pdfUrl: "/samples/plans/Sample_A_Compliant.pdf",
    },
    {
      id: "B",
      filename: "Sample_B_Defective.pdf",
      filesize: "148 KB",
      uploadedBy: "Ms. Chioma Eze-Sample",
      uploadedAt: "2026-11-16 09:00",
      status: "Audited",
      pdfUrl: "/samples/plans/Sample_B_Defective.pdf",
    },
    {
      id: "C",
      filename: "Sample_C_Edge_Case.pdf",
      filesize: "139 KB",
      uploadedBy: "Ms. Chioma Eze-Sample",
      uploadedAt: "2026-11-16 09:15",
      status: "Audited",
      pdfUrl: "/samples/plans/Sample_C_Edge_Case.pdf",
    },
  ]);

  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<DocItem>(docsList[1]);
  const [unrecognizedError, setUnrecognizedError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUnrecognizedError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const name = file.name;

    let matchedId: "A" | "B" | "C" | null = null;
    if (name.includes("Sample_A")) matchedId = "A";
    else if (name.includes("Sample_B")) matchedId = "B";
    else if (name.includes("Sample_C")) matchedId = "C";

    if (!matchedId) {
      setUnrecognizedError(
        "This prototype recognises only the three synthetic sample plans. Extraction for other documents is not simulated."
      );
      return;
    }

    setActiveSample(matchedId);
    router.push(`/documents/extract?id=${matchedId}`);
  };

  const handleSelectSample = (doc: DocItem) => {
    setActiveSample(doc.id);
    setSelectedPreviewDoc(doc);
  };

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <h1 className="page-title">Documents & Plan Ingestion</h1>
        <p className="text-muted" style={{ marginTop: 2, fontSize: 13 }}>
          Upload operator R&D proposals or revolving 3–5 year plans for simulated Schedule I extraction and audit.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 20 }}>
        {/* Left Column: Upload Dropzone & Document Table */}
        <div>
          {/* Drop Zone */}
          <div
            className="panel"
            style={{
              marginBottom: 16,
              border: "2px dashed var(--border-strong)",
              background: "var(--bg)",
              textAlign: "center",
              padding: "28px 20px",
            }}
          >
            <Upload size={28} color="var(--green-700)" style={{ margin: "0 auto 8px" }} />
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
              Drop R&D Plan Document here or Browse
            </div>
            <p className="text-muted" style={{ fontSize: 12, margin: "0 0 12px" }}>
              Accepts <strong>.pdf</strong> and <strong>.docx</strong> (Sample_A, Sample_B, Sample_C)
            </p>

            <RoleGuard>
              <label className="btn btn-primary btn-sm" style={{ cursor: "pointer" }}>
                <span>Select file</span>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
              </label>
            </RoleGuard>

            {unrecognizedError && (
              <div
                style={{
                  marginTop: 12,
                  padding: "8px 12px",
                  borderRadius: "var(--radius)",
                  background: "var(--defect-bg)",
                  border: "1px solid var(--defect)",
                  color: "var(--defect)",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  textAlign: "left",
                }}
              >
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>{unrecognizedError}</span>
              </div>
            )}
          </div>

          {/* Available Sample Documents Table */}
          <div className="panel">
            <h2 className="section-heading" style={{ marginBottom: 10 }}>
              Recognized Plan Documents
            </h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Size</th>
                  <th>Uploaded By</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {docsList.map((doc) => {
                  const isActive = activeSampleId === doc.id;
                  return (
                    <tr
                      key={doc.id}
                      style={{
                        background: isActive ? "var(--green-100)" : undefined,
                      }}
                    >
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <FileText size={15} color="var(--green-600)" />
                          <span style={{ fontWeight: 500 }}>{doc.filename}</span>
                        </div>
                      </td>
                      <td className="mono" style={{ fontSize: 11 }}>{doc.filesize}</td>
                      <td>{doc.uploadedBy}</td>
                      <td>
                        <span className="badge badge-pass">
                          <CheckCircle2 size={12} /> {doc.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleSelectSample(doc)}
                            title="Preview document"
                          >
                            <Eye size={12} />
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setActiveSample(doc.id);
                              router.push(`/documents/extract?id=${doc.id}`);
                            }}
                          >
                            Extract &rarr;
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: PDF Preview */}
        <div className="panel" style={{ display: "flex", flexDirection: "column", height: 600 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
              paddingBottom: 8,
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 13 }}>
              Preview: {selectedPreviewDoc.filename}
            </div>
            <a
              href={selectedPreviewDoc.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
            >
              Open in new tab
            </a>
          </div>

          <div style={{ flex: 1, background: "var(--bg)", border: "1px solid var(--border)" }}>
            <iframe
              src={`${selectedPreviewDoc.pdfUrl}#toolbar=0`}
              width="100%"
              height="100%"
              style={{ border: "none" }}
              title="Plan Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
