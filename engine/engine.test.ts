import { describe, it, expect } from "vitest";
import { check } from "./index";
import { Extracted } from "./types";
import sampleA from "../public/samples/data/Sample_A_Compliant.json";
import sampleB from "../public/samples/data/Sample_B_Defective.json";
import sampleC from "../public/samples/data/Sample_C_Edge_Case.json";
import answerKey from "../public/answer_key.json";

describe("R&D Compliance Rule Engine", () => {
  it("Sample A (Compliant) should produce exactly 0 findings", () => {
    const findings = check(sampleA as unknown as Extracted);
    expect(findings).toHaveLength(0);
  });

  it("Sample B (Defective) should produce exactly 15 findings matching answer_key.json", () => {
    const findings = check(sampleB as unknown as Extracted);
    expect(findings).toHaveLength(15);

    const expectedFindings = answerKey.B;

    for (let i = 0; i < expectedFindings.length; i++) {
      const actual = findings[i];
      const expected = expectedFindings[i];

      expect(actual.id).toBe(expected.id);
      expect(actual.rule).toBe(expected.rule);
      expect(actual.provision).toBe(expected.provision);
      expect(actual.severity).toBe(expected.severity);
      expect(actual.message).toBe(expected.message);
    }
  });

  it("Sample C (Edge Case) should produce exactly 1 finding matching answer_key.json", () => {
    const findings = check(sampleC as unknown as Extracted);
    expect(findings).toHaveLength(1);

    const actual = findings[0];
    const expected = answerKey.C[0];

    expect(actual.id).toBe(expected.id);
    expect(actual.rule).toBe(expected.rule);
    expect(actual.provision).toBe(expected.provision);
    expect(actual.severity).toBe(expected.severity);
    expect(actual.message).toBe(expected.message);
  });

  it("Boundary test: exactly 6 months filing deadline passes", () => {
    const copy = JSON.parse(JSON.stringify(sampleA)) as Extracted;
    // NC plan submitted: 2025-06-02 -> +6 months is 2025-12-02
    copy.filing.nc_plan_submitted = "2025-06-02";
    copy.filing.rd_plan_filed = "2025-12-02";
    const findings = check(copy);
    const r3Findings = findings.filter((f) => f.rule === "R3");
    expect(r3Findings).toHaveLength(0);
  });

  it("Boundary test: 1 day past 6 months filing deadline fails", () => {
    const copy = JSON.parse(JSON.stringify(sampleA)) as Extracted;
    copy.filing.nc_plan_submitted = "2025-06-02";
    copy.filing.rd_plan_filed = "2025-12-03";
    const findings = check(copy);
    const r3Findings = findings.filter((f) => f.rule === "R3");
    expect(r3Findings).toHaveLength(1);
    expect(r3Findings[0].message).toBe("Plan filed 2025-12-03; deadline was 2025-12-02");
  });

  it("Boundary test: extension requested exactly 7 days before due date passes", () => {
    const copy = JSON.parse(JSON.stringify(sampleA)) as Extracted;
    copy.extension_requests = [
      {
        applies_to: "Quarterly report Q3 2026",
        due_date: "2026-07-01",
        request_date: "2026-06-24", // exactly 7 days before
        granted_until: "2026-07-08",
      },
    ];
    const findings = check(copy);
    const r7Findings = findings.filter((f) => f.rule === "R7");
    expect(r7Findings).toHaveLength(0);
  });

  it("Boundary test: extension requested 6 days before due date fails", () => {
    const copy = JSON.parse(JSON.stringify(sampleA)) as Extracted;
    copy.extension_requests = [
      {
        applies_to: "Quarterly report Q3 2026",
        due_date: "2026-07-01",
        request_date: "2026-06-25", // 6 days before
        granted_until: null,
      },
    ];
    const findings = check(copy);
    const r7Findings = findings.filter((f) => f.rule === "R7");
    expect(r7Findings).toHaveLength(1);
    expect(r7Findings[0].message).toBe("Extension requested 6 day(s) before the due date; at least 7 days required");
  });

  it("Boundary test: Board notice corrected on day 14 passes", () => {
    const copy = JSON.parse(JSON.stringify(sampleA)) as Extracted;
    copy.board_notices = [
      {
        type: "deviation",
        reg: "Reg 17",
        notice_date: "2026-11-02",
        rectified_date: "2026-11-16", // day 14 (notice + 14)
        logged_by: "Ms. Chioma Eze-Sample",
        description: "Test notice",
      },
    ];
    const findings = check(copy, "2026-11-16");
    const r9Findings = findings.filter((f) => f.rule === "R9");
    expect(r9Findings).toHaveLength(0);
  });

  it("Boundary test: Board notice corrected on day 15 fails as defect", () => {
    const copy = JSON.parse(JSON.stringify(sampleA)) as Extracted;
    copy.board_notices = [
      {
        type: "deviation",
        reg: "Reg 17",
        notice_date: "2026-11-02",
        rectified_date: "2026-11-17", // day 15
        logged_by: "Ms. Chioma Eze-Sample",
        description: "Test notice",
      },
    ];
    const findings = check(copy, "2026-11-16");
    const r9Findings = findings.filter((f) => f.rule === "R9");
    expect(r9Findings).toHaveLength(1);
    expect(r9Findings[0].severity).toBe("defect");
    expect(r9Findings[0].message).toBe("Corrected 2026-11-17; deadline was 2026-11-16");
  });
});
