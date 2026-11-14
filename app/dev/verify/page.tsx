"use client";

import { useMemo } from "react";
import Link from "next/link";
import { check } from "@/engine/index";
import { Extracted } from "@/engine/types";
import sampleAData from "@/public/samples/data/Sample_A_Compliant.json";
import sampleBData from "@/public/samples/data/Sample_B_Defective.json";
import sampleCData from "@/public/samples/data/Sample_C_Edge_Case.json";
import answerKey from "@/public/answer_key.json";
import { CheckCircle2, XCircle, ArrowLeft, ShieldCheck } from "lucide-react";

interface VerificationItem {
  sampleId: "A" | "B" | "C";
  expectedCount: number;
  actualCount: number;
  countMatch: boolean;
  findingsMatch: boolean;
  mismatches: string[];
}

export default function DevVerifyPage() {
  const verificationResults = useMemo(() => {
    const samples: Array<["A" | "B" | "C", Extracted, any[]]> = [
      ["A", sampleAData as unknown as Extracted, answerKey.A],
      ["B", sampleBData as unknown as Extracted, answerKey.B],
      ["C", sampleCData as unknown as Extracted, answerKey.C],
    ];

    return samples.map(([id, sample, expected]): VerificationItem => {
      const actual = check(sample, sample.demo_today);
      const mismatches: string[] = [];

      const countMatch = actual.length === expected.length;
      if (!countMatch) {
        mismatches.push(
          `Count mismatch: expected ${expected.length}, got ${actual.length}`
        );
      }

      for (let i = 0; i < expected.length; i++) {
        const exp = expected[i];
        const act = actual[i];

        if (!act) {
          mismatches.push(`Missing finding ${exp.id} (${exp.rule})`);
          continue;
        }

        if (act.rule !== exp.rule) {
          mismatches.push(`Rule mismatch at [${i}]: expected ${exp.rule}, got ${act.rule}`);
        }
        if (act.severity !== exp.severity) {
          mismatches.push(`Severity mismatch at ${exp.id}: expected ${exp.severity}, got ${act.severity}`);
        }
        if (act.message !== exp.message) {
          mismatches.push(`Message mismatch at ${exp.id}: expected "${exp.message}", got "${act.message}"`);
        }
      }

      return {
        sampleId: id,
        expectedCount: expected.length,
        actualCount: actual.length,
        countMatch,
        findingsMatch: mismatches.length === 0,
        mismatches,
      };
    });
  }, []);

  const allPassed = verificationResults.every((r) => r.findingsMatch);

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <ShieldCheck size={20} color="var(--green-600)" />
              <h1 className="page-title">Developer Engine Verification Test Suite</h1>
            </div>
            <p className="text-muted" style={{ marginTop: 2, fontSize: 13 }}>
              Automated in-browser test harness verifying TypeScript rule engine execution against answer_key.json.
            </p>
          </div>

          <Link href="/settings" className="btn btn-secondary btn-sm">
            <ArrowLeft size={14} /> Back to Settings
          </Link>
        </div>
      </div>

      {/* Global Status Banner */}
      <div
        style={{
          background: allPassed ? "var(--green-100)" : "var(--defect-bg)",
          border: `1px solid ${allPassed ? "var(--green-200)" : "var(--defect)"}`,
          color: allPassed ? "var(--green-950)" : "var(--defect)",
          padding: "12px 16px",
          borderRadius: "var(--radius)",
          marginBottom: 16,
          fontWeight: 600,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {allPassed ? (
          <>
            <CheckCircle2 size={20} color="var(--green-600)" />
            <span>ALL ENGINE VERIFICATION CHECKS PASSED (100% MATCH WITH ANSWER KEY)</span>
          </>
        ) : (
          <>
            <XCircle size={20} color="var(--defect)" />
            <span>VERIFICATION DISCREPANCY DETECTED</span>
          </>
        )}
      </div>

      {/* Verification Matrix Table */}
      <div className="panel">
        <h2 className="section-heading" style={{ marginBottom: 12 }}>
          Sample Test Results Matrix
        </h2>

        <table className="data-table">
          <thead>
            <tr>
              <th>Dataset</th>
              <th>Purpose</th>
              <th>Expected Findings</th>
              <th>Actual Findings</th>
              <th>Verification Status</th>
              <th>Details / Diff</th>
            </tr>
          </thead>
          <tbody>
            {verificationResults.map((res) => (
              <tr key={res.sampleId}>
                <td style={{ fontWeight: 700 }}>Sample {res.sampleId}</td>
                <td>
                  {res.sampleId === "A" && "Compliant plan (proves engine doesn't cry wolf)"}
                  {res.sampleId === "B" && "Defective main demo document (15 planted findings)"}
                  {res.sampleId === "C" && "Boundary edge case (proves 1-day late exactness)"}
                </td>
                <td className="mono">{res.expectedCount}</td>
                <td className="mono">{res.actualCount}</td>
                <td>
                  {res.findingsMatch ? (
                    <span className="badge badge-pass">
                      <CheckCircle2 size={12} /> PASS
                    </span>
                  ) : (
                    <span className="badge badge-defect">
                      <XCircle size={12} /> FAIL
                    </span>
                  )}
                </td>
                <td>
                  {res.findingsMatch ? (
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      Exact match with answer_key.json
                    </span>
                  ) : (
                    <div style={{ color: "var(--defect)", fontSize: 11 }}>
                      {res.mismatches.join("; ")}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
