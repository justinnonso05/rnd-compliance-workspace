"use client";

import Link from "next/link";
import { useComplianceStore } from "@/store/useComplianceStore";
import { check } from "@/engine/index";
import sampleAData from "@/public/samples/data/Sample_A_Compliant.json";
import sampleBData from "@/public/samples/data/Sample_B_Defective.json";
import sampleCData from "@/public/samples/data/Sample_C_Edge_Case.json";
import { Extracted } from "@/engine/types";
import {
  ShieldAlert,
  Eye,
  CheckCircle2,
  AlertCircle,
  Timer,
  Building,
  ArrowRight,
} from "lucide-react";

export default function NcdmbPage() {
  const { demoDate, setActiveSample } = useComplianceStore();

  const portfolio = [
    {
      id: "A" as const,
      sample: sampleAData as unknown as Extracted,
      operator: "Sample Operator Ltd",
      label: "Sample A (Compliant)",
      submittedDate: "2025-06-02",
      findings: check(sampleAData as unknown as Extracted, demoDate),
    },
    {
      id: "B" as const,
      sample: sampleBData as unknown as Extracted,
      operator: "Sample Operator Ltd",
      label: "Sample B (Defective - Remediation Required)",
      submittedDate: "2025-02-03",
      findings: check(sampleBData as unknown as Extracted, demoDate),
    },
    {
      id: "C" as const,
      sample: sampleCData as unknown as Extracted,
      operator: "Sample Operator Ltd",
      label: "Sample C (Edge Case - 1 Late Update)",
      submittedDate: "2025-06-02",
      findings: check(sampleCData as unknown as Extracted, demoDate),
    },
  ];

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Eye size={22} color="var(--green-700)" />
          <div>
            <h1 className="page-title">NCDMB Regulatory Oversight Portfolio</h1>
            <p className="text-muted" style={{ marginTop: 2, fontSize: 13 }}>
              Regulator view of operator R&D plans, statutory filing compliance, open deviation timers, and pre-audit results.
            </p>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <h2 className="section-heading" style={{ marginBottom: 12 }}>
          Industry R&D Submissions Portfolio
        </h2>

        <table className="data-table">
          <thead>
            <tr>
              <th>Operator</th>
              <th>Plan Sample</th>
              <th>NC Plan Date</th>
              <th>Defects</th>
              <th>Advisories</th>
              <th>Timers</th>
              <th>Compliance Status</th>
              <th>Oversight Action</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((item) => {
              const defects = item.findings.filter((f) => f.severity === "defect").length;
              const advisories = item.findings.filter((f) => f.severity === "advisory").length;
              const timers = item.findings.filter((f) => f.severity === "timer").length;

              const isCompliant = item.findings.length === 0;

              return (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.operator}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {item.sample.project.title.slice(0, 50)}...
                    </div>
                  </td>
                  <td className="mono" style={{ fontSize: 12 }}>{item.submittedDate}</td>
                  <td>
                    {defects > 0 ? (
                      <span className="badge badge-defect">{defects} defects</span>
                    ) : (
                      <span className="badge badge-pass">0</span>
                    )}
                  </td>
                  <td>
                    {advisories > 0 ? (
                      <span className="badge badge-advisory">{advisories}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {timers > 0 ? (
                      <span className="badge badge-timer">{timers} open</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {isCompliant ? (
                      <span className="badge badge-pass">Fully Compliant</span>
                    ) : (
                      <span className="badge badge-defect">Action Required</span>
                    )}
                  </td>
                  <td>
                    <Link
                      href="/audit"
                      onClick={() => setActiveSample(item.id)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Eye size={12} /> Inspect Audit &rarr;
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        style={{
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 14,
          fontSize: 12,
          lineHeight: 1.5,
        }}
      >
        <div style={{ fontWeight: 600, color: "var(--green-950)", marginBottom: 4 }}>
          Regulator Oversight Value
        </div>
        <p style={{ margin: 0, color: "var(--text)" }}>
          By standardizing automated validation against S.I. No. 34 of 2021 before official submission,
          regulators receive standardized, verified plans with zero arithmetic inconsistencies, pre-checked
          statutory timelines, and certified Schedule I particular completeness.
        </p>
      </div>
    </div>
  );
}
