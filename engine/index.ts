import {
  Extracted,
  Finding,
  Severity,
  ScheduleIKey,
} from "./types";
import {
  parseISODate,
  formatISODate,
  addMonths,
  addDays,
  diffInDays,
  compareDates,
  firstWorkingDay,
  countWords,
  REG13_AREAS,
  TEMPLATE_FOCUS_AREAS,
  SimpleDate,
} from "./dates";

export function check(sample: Extracted, customToday?: string): Finding[] {
  const findings: Finding[] = [];
  const todayStr = customToday || sample.demo_today;
  const today = parseISODate(todayStr);
  const fl = sample.filing;
  const project = sample.project;
  let counter = 1;

  function addFinding(params: {
    rule: string;
    provision: string;
    severity: Severity;
    message: string;
    field: string;
    where?: string;
    must_show?: boolean;
    facts: Record<string, string | number | boolean>;
    correctable: boolean;
  }) {
    const id = `${sample.sample_id}-${counter.toString().padStart(2, "0")}`;
    counter++;
    findings.push({
      id,
      rule: params.rule,
      provision: params.provision,
      severity: params.severity,
      message: params.message,
      field: params.field,
      where: params.where,
      must_show: params.must_show,
      facts: params.facts,
      correctable: params.correctable,
      status: "open",
      comments: [],
    });
  }

  // ── R1: Schedule I particulars (a) to (p) presence ──────────────────
  const missingKeys: ScheduleIKey[] = [];
  const validKeys: ScheduleIKey[] = [
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p"
  ];
  for (const k of validKeys) {
    if (!sample.schedule_I[k] || !sample.schedule_I[k].present) {
      missingKeys.push(k);
    }
  }
  if (missingKeys.length > 0) {
    addFinding({
      rule: "R1",
      provision: "Reg 11; Schedule I",
      severity: "defect",
      message: "Missing Schedule I particulars: " + missingKeys.map((k) => `(${k})`).join(", "),
      field: "schedule_I",
      where: "Part A, missing headings",
      must_show: true,
      facts: { missing: missingKeys.join(", ") },
      correctable: true,
    });
  }

  // ── R2: 36 to 60 months duration ────────────────────────────────────
  const st = parseISODate(fl.plan_start);
  const enOriginal = parseISODate(fl.plan_end);
  const en = addDays(enOriginal, 1);
  const months = (en.year - st.year) * 12 + en.month - st.month;
  if (months < 36 || months > 60) {
    addFinding({
      rule: "R2",
      provision: "Schedule I(a)",
      severity: "defect",
      message: `Plan covers ${months} months; a revolving 3 to 5 year plan is required`,
      field: "filing.plan_end",
      where: "Filing particulars; Part A (a)",
      must_show: true,
      facts: { months, start: fl.plan_start, end: fl.plan_end },
      correctable: true,
    });
  }

  // ── R3: R&D plan filed <= 6 months after NC plan submitted ──────────
  const ncSubmitted = parseISODate(fl.nc_plan_submitted);
  const rdFiled = parseISODate(fl.rd_plan_filed);
  const r3Deadline = addMonths(ncSubmitted, 6);
  const r3DeadlineStr = formatISODate(r3Deadline);
  if (compareDates(rdFiled, r3Deadline) > 0) {
    const lateDays = diffInDays(rdFiled, r3Deadline);
    addFinding({
      rule: "R3",
      provision: "Reg 10",
      severity: "defect",
      message: `Plan filed ${fl.rd_plan_filed}; deadline was ${r3DeadlineStr}`,
      field: "filing.rd_plan_filed",
      where: "Filing particulars; (see NC Plan and filing dates)",
      must_show: true,
      facts: {
        nc_date: fl.nc_plan_submitted,
        deadline: r3DeadlineStr,
        filed: fl.rd_plan_filed,
        days_late: lateDays,
      },
      correctable: false, // historical fact
    });
  }

  // ── R4: 6-monthly updates from approval date ────────────────────────
  const boardApproved = parseISODate(fl.board_approved);
  let updateK = 1;
  while (true) {
    const dueK = addMonths(boardApproved, 6 * updateK);
    if (compareDates(dueK, today) > 0) break;

    const dueKStr = formatISODate(dueK);
    const updateRecord = sample.updates.find((u) => u.n === updateK);

    if (!updateRecord) {
      addFinding({
        rule: "R4",
        provision: "Reg 12",
        severity: "defect",
        message: `Update ${updateK} not filed; was due ${dueKStr}`,
        field: "updates",
        where: "Filing particulars, six-monthly updates",
        must_show: true,
        facts: { update_number: updateK, due: dueKStr, status: "not_filed" },
        correctable: false, // historical
      });
    } else {
      const updateDate = parseISODate(updateRecord.date);
      if (compareDates(updateDate, dueK) > 0) {
        const daysLate = diffInDays(updateDate, dueK);
        addFinding({
          rule: "R4",
          provision: "Reg 12",
          severity: "defect",
          message: `Update ${updateK} filed ${updateRecord.date}; due ${dueKStr} (${daysLate} day(s) late)`,
          field: "updates",
          where: "Filing particulars, six-monthly updates",
          must_show: true,
          facts: {
            update_number: updateK,
            filed: updateRecord.date,
            due: dueKStr,
            days_late: daysLate,
          },
          correctable: false, // historical
        });
      }
    }
    updateK++;
  }

  // ── R5: Focus area check ────────────────────────────────────────────
  if (!REG13_AREAS.includes(project.focus_area)) {
    const sev: Severity = TEMPLATE_FOCUS_AREAS.includes(project.focus_area)
      ? "info"
      : "advisory";
    addFinding({
      rule: "R5",
      provision: "Reg 13; Template 1.2",
      severity: sev,
      message: `Focus area '${project.focus_area}' is not in the Regulation 13 list`,
      field: "project.focus_area",
      where: "Annex 1, section 1.2",
      must_show: false,
      facts: { focus_area: project.focus_area },
      correctable: true,
    });
  }

  // ── R6 + R7: Extension requests & Quarterly progress reports ────────
  const grantedExtensions: Record<string, SimpleDate> = {};

  for (const extReq of sample.extension_requests) {
    const dueD = parseISODate(extReq.due_date);
    const reqD = parseISODate(extReq.request_date);
    const gap = diffInDays(dueD, reqD);

    if (gap < 7) {
      addFinding({
        rule: "R7",
        provision: "Reg 22(1)",
        severity: "defect",
        message: `Extension requested ${gap} day(s) before the due date; at least 7 days required`,
        field: "extension_requests",
        where: "Filing particulars, extension requests",
        must_show: true,
        facts: { gap, request_date: extReq.request_date, due_date: extReq.due_date },
        correctable: false, // historical
      });
    } else if (extReq.granted_until) {
      grantedExtensions[extReq.due_date] = parseISODate(extReq.granted_until);
    }
  }

  // R7: At most one extension per calendar year
  const extYearsCount: Record<string, number> = {};
  for (const extReq of sample.extension_requests) {
    const yr = extReq.request_date.slice(0, 4);
    extYearsCount[yr] = (extYearsCount[yr] || 0) + 1;
  }
  if (Object.values(extYearsCount).some((v) => v > 1)) {
    addFinding({
      rule: "R7",
      provision: "Reg 22(4)",
      severity: "defect",
      message: "More than one extension request in a year",
      field: "extension_requests",
      where: "Filing particulars, extension requests",
      must_show: true,
      facts: {},
      correctable: false,
    });
  }

  // Quarterly reports check
  const quarterlyReportsMap = new Map<string, string>();
  for (const qr of sample.quarterly_reports) {
    quarterlyReportsMap.set(qr.quarter_start, qr.filed);
  }

  // Starting quarter: quarter containing board_approved
  const startQuarterMonth = Math.floor((boardApproved.month - 1) / 3) * 3 + 1;
  let qDate: SimpleDate = {
    year: boardApproved.year,
    month: startQuarterMonth,
    day: 1,
  };

  while (true) {
    qDate = addMonths(qDate, 3);
    const fw = firstWorkingDay(qDate);

    if (compareDates(fw, today) > 0) break;
    if (compareDates(fw, boardApproved) <= 0) continue;

    const fwStr = formatISODate(fw);
    const qStr = formatISODate(qDate);
    const extendedDue = grantedExtensions[fwStr] || fw;
    const dueStr = formatISODate(extendedDue);

    const filedStr = quarterlyReportsMap.get(qStr);

    if (!filedStr) {
      addFinding({
        rule: "R6",
        provision: "Reg 21",
        severity: "defect",
        message: `Progress report for the quarter starting ${qStr} not filed (due ${dueStr})`,
        field: "quarterly_reports",
        where: "Filing particulars, quarterly reports",
        must_show: true,
        facts: { quarter_start: qStr, due: dueStr },
        correctable: false, // historical
      });
    } else {
      const filedDate = parseISODate(filedStr);
      if (compareDates(filedDate, extendedDue) > 0) {
        addFinding({
          rule: "R6",
          provision: "Reg 21",
          severity: "defect",
          message: `Progress report for the quarter starting ${qStr} filed ${filedStr}; due ${dueStr}`,
          field: "quarterly_reports",
          where: "Filing particulars, quarterly reports",
          must_show: true,
          facts: { quarter_start: qStr, filed: filedStr, due: dueStr },
          correctable: false, // historical
        });
      }
    }
  }

  // ── R8 / R9: Board Notices (disapproval vs deviation) ───────────────
  for (const notice of sample.board_notices) {
    const noticeDate = parseISODate(notice.notice_date);
    const dline = addDays(noticeDate, 14);
    const dlineStr = formatISODate(dline);
    const isDisapproval = notice.type === "disapproval";
    const reg = isDisapproval ? "Reg 16" : "Reg 17";
    const rid = isDisapproval ? "R8" : "R9";

    if (notice.rectified_date) {
      const rectDate = parseISODate(notice.rectified_date);
      if (compareDates(rectDate, dline) > 0) {
        addFinding({
          rule: rid,
          provision: reg,
          severity: "defect",
          message: `Corrected ${notice.rectified_date}; deadline was ${dlineStr}`,
          field: "board_notices",
          where: "Board notices",
          must_show: true,
          facts: { rectified: notice.rectified_date, deadline: dlineStr },
          correctable: false,
        });
      }
    } else if (compareDates(today, dline) > 0) {
      addFinding({
        rule: rid,
        provision: reg,
        severity: "defect",
        message: `14-day deadline ${dlineStr} passed without correction`,
        field: "board_notices",
        where: "Board notices",
        must_show: true,
        facts: { deadline: dlineStr },
        correctable: false,
      });
    } else {
      const daysRemaining = diffInDays(dline, today);
      addFinding({
        rule: rid,
        provision: reg,
        severity: "timer",
        message: `Open; deadline ${dlineStr}; ${daysRemaining} day(s) remaining`,
        field: "board_notices",
        where: "Board notices",
        must_show: true,
        facts: { deadline: dlineStr, days_remaining: daysRemaining },
        correctable: true,
      });
    }
  }

  // ── R10: Measurable outcome heuristic (digit required) ──────────────
  if (!/\d/.test(sample.expected_outcome_text || "")) {
    addFinding({
      rule: "R10",
      provision: "Schedule I(b); Template 5.1",
      severity: "defect",
      message: "Expected outcome has no measurable target (heuristic: no number found)",
      field: "expected_outcome_text",
      where: "Part A (b)",
      must_show: false,
      facts: {},
      correctable: true,
    });
  }

  // ── BUD: Budget items sum check ─────────────────────────────────────
  const budgetSum = project.budget_items.reduce((acc, b) => acc + b.amount, 0);
  if (budgetSum !== project.budget_stated_total) {
    const sumFormatted = budgetSum.toLocaleString("en-US");
    const totalFormatted = project.budget_stated_total.toLocaleString("en-US");
    addFinding({
      rule: "BUD",
      provision: "Schedule I(e); Template 4.1",
      severity: "defect",
      message: `Budget lines sum to ${sumFormatted}; stated total ${totalFormatted}`,
      field: "project.budget_stated_total",
      where: "Annex 1, section 4.1",
      must_show: true,
      facts: {
        sum: budgetSum,
        stated_total: project.budget_stated_total,
      },
      correctable: true,
    });
  }

  // ── EXP: Planned expenditure sum check ──────────────────────────────
  const expSum = sample.planned_expenditure.rows.reduce(
    (acc, r) => acc + r.i1 + r.i2,
    0
  );
  if (expSum !== sample.planned_expenditure.stated_total) {
    addFinding({
      rule: "EXP",
      provision: "Schedule I(e)",
      severity: "defect",
      message: "Yearly expenditure does not add up to the stated plan total",
      field: "planned_expenditure.stated_total",
      where: "Part A (e)",
      must_show: true,
      facts: { sum: expSum, stated_total: sample.planned_expenditure.stated_total },
      correctable: true,
    });
  }

  // ── T1: Title word limit (max 20 words) ──────────────────────────────
  const titleWords = countWords(project.title);
  if (titleWords > 20) {
    addFinding({
      rule: "T1",
      provision: "Template 1.3",
      severity: "defect",
      message: `Title has ${titleWords} words; maximum 20`,
      field: "project.title",
      where: "Annex 1, section 1.3",
      must_show: false,
      facts: { word_count: titleWords, max: 20 },
      correctable: true,
    });
  }

  // ── T2: Goals and objectives word limit (max 800 words) ─────────────
  const goalsWords = countWords(project.goals_and_objectives);
  if (goalsWords > 800) {
    addFinding({
      rule: "T2",
      provision: "Template 1.4",
      severity: "defect",
      message: "Goals and objectives exceed 800 words",
      field: "project.goals_and_objectives",
      where: "Annex 1, section 1.4",
      must_show: false,
      facts: { word_count: goalsWords, max: 800 },
      correctable: true,
    });
  }

  // ── T3: Keywords count (5 to 8) ─────────────────────────────────────
  const kwCount = project.keywords ? project.keywords.length : 0;
  if (kwCount < 5 || kwCount > 8) {
    addFinding({
      rule: "T3",
      provision: "Template 1.5",
      severity: "defect",
      message: `${kwCount} keywords; 5 to 8 required`,
      field: "project.keywords",
      where: "Annex 1, section 1.5",
      must_show: false,
      facts: { count: kwCount, min: 5, max: 8 },
      correctable: true,
    });
  }

  // ── T4: Start and end dates present ─────────────────────────────────
  if (!project.start || !project.end) {
    addFinding({
      rule: "T4",
      provision: "Template 1.6",
      severity: "defect",
      message: "Start or completion date missing",
      field: "project.start",
      where: "Annex 1, section 1.6",
      must_show: false,
      facts: {},
      correctable: true,
    });
  }

  // ── T5: Principal investigator named ────────────────────────────────
  if (!project.principal_investigator || !project.principal_investigator.name) {
    addFinding({
      rule: "T5",
      provision: "Template 3.1",
      severity: "defect",
      message: "No principal investigator named",
      field: "project.principal_investigator",
      where: "Annex 1, section 3.1",
      must_show: false,
      facts: {},
      correctable: true,
    });
  }

  // ── T6: Budget covers items a to h ──────────────────────────────────
  const presentCodes = new Set(project.budget_items.map((b) => b.code));
  const requiredCodes = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const coversAll = requiredCodes.every((c) => presentCodes.has(c));
  if (!coversAll) {
    addFinding({
      rule: "T6",
      provision: "Template 4.1",
      severity: "defect",
      message: "Budget does not cover items a to h",
      field: "project.budget_items",
      where: "Annex 1, section 4.1",
      must_show: false,
      facts: {},
      correctable: true,
    });
  }

  // ── T7: Every activity has a KPI indicator ──────────────────────────
  const kpiActivities = new Set(project.kpis.map((k) => k.activity));
  const uncoveredActivities = project.activities.filter(
    (a) => !kpiActivities.has(a)
  );
  if (uncoveredActivities.length > 0) {
    addFinding({
      rule: "T7",
      provision: "Template 5.1",
      severity: "defect",
      message: "Activity without a performance indicator",
      field: "project.activities",
      where: "Annex 1, section 5.1",
      must_show: false,
      facts: { missing_activities: uncoveredActivities.join(", ") },
      correctable: true,
    });
  }

  // ── T8: Steering team composition ───────────────────────────────────
  const stTeam = project.steering_team;
  if (!stTeam || !stTeam.ncdmb || !stTeam.company || !stTeam.research_center) {
    addFinding({
      rule: "T8",
      provision: "Template 6.2",
      severity: "defect",
      message: "Steering team must include NCDMB, the Company and the research centre",
      field: "project.steering_team",
      where: "Annex 1, section 6.2",
      must_show: false,
      facts: {
        ncdmb: Boolean(stTeam?.ncdmb),
        company: Boolean(stTeam?.company),
        research_center: Boolean(stTeam?.research_center),
      },
      correctable: true,
    });
  }

  // ── T9: Plagiarism statement signed ─────────────────────────────────
  if (!project.plagiarism_statement_signed) {
    addFinding({
      rule: "T9",
      provision: "Template 7.0",
      severity: "defect",
      message: "Plagiarism statement not signed",
      field: "project.plagiarism_statement_signed",
      where: "Annex 1, section 7.0",
      must_show: false,
      facts: {},
      correctable: true,
    });
  }

  return findings;
}
