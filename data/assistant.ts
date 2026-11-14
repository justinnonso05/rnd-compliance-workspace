export interface ScriptedQA {
  id: number;
  question: string;
  answer: string;
  sources: string;
  keywords: string[];
}

export const SCRIPTED_QUESTIONS: ScriptedQA[] = [
  {
    id: 1,
    question: "How long do we have to file the R&D plan?",
    answer: "Within six months of submitting the Nigerian Content Plan for the project.",
    sources: "Reg 10",
    keywords: ["how long", "file", "deadline", "six months", "submit", "content plan"],
  },
  {
    id: 2,
    question: "How often must the approved plan be updated?",
    answer: "Every six months from the date the Board approves it.",
    sources: "Reg 12",
    keywords: ["how often", "update", "updated", "six months", "approved", "frequency"],
  },
  {
    id: 3,
    question: "What must the plan contain?",
    answer: "A full description of sixteen particulars, (a) to (p), including a revolving 3 to 5 year plan, expected outcome, scope, planned expenditure, methodology, environmental impact analysis and a training plan for Nigerian personnel.",
    sources: "Reg 11; Schedule I",
    keywords: ["what must", "contain", "particulars", "schedule i", "sixteen", "contents", "requirements"],
  },
  {
    id: 4,
    question: "What happens if the Board disapproves the plan?",
    answer: "The operator submits a revised plan and performs any outstanding obligations within 14 days of notification.",
    sources: "Reg 16",
    keywords: ["disapproves", "disapproval", "reject", "revised", "14 days"],
  },
  {
    id: 5,
    question: "What if a deviation is not fixed in 14 days?",
    answer: "The Board may order suspension of the plan. The operator must then stop related activities, may submit a written representation within 14 days of the suspension, and the Board reverses the suspension once the deviation is fixed or the representation is accepted.",
    sources: "Reg 17 to 20",
    keywords: ["deviation", "not fixed", "suspension", "suspend", "14 days", "representation"],
  },
  {
    id: 6,
    question: "When is the progress report due?",
    answer: "On the first working day of each quarter.",
    sources: "Reg 21",
    keywords: ["when is", "progress report", "quarterly", "due", "first working day"],
  },
  {
    id: 7,
    question: "Can we get more time?",
    answer: "Yes. Ask the Board at least seven days before the due date. The Board replies within seven days, and an extension for a plan or quarterly report will not be considered more than once a year.",
    sources: "Reg 22",
    keywords: ["more time", "extension", "delay", "postpone", "seven days", "once a year"],
  },
  {
    id: 8,
    question: "Which areas can the research cover?",
    answer: "Regulation 13 lists engineering studies, geological and geophysical studies, safety and environmental studies, and local materials substitution studies. It says the scope 'shall include' these, so other areas are for the Board to judge. The NCDMB Template also lists technology development studies.",
    sources: "Reg 13; Template 1.2",
    keywords: ["which areas", "focus area", "research cover", "scope", "regulation 13", "topics"],
  },
  {
    id: 9,
    question: "Who owns the intellectual property?",
    answer: "It is vested in the operator, subject to relevant laws such as the Trademarks Act and the Patents and Designs Act.",
    sources: "Reg 27",
    keywords: ["intellectual property", "ip", "patent", "trademarks", "ownership", "who owns"],
  },
  {
    id: 10,
    question: "What are the penalties?",
    answer: "Breach is liable to fines, sanctions or penalties under the Nigerian Oil and Gas Industry Enforcement and Compliance Regulation 2021 or as the Board determines, without prejudice to Section 68 of the Act.",
    sources: "Reg 36",
    keywords: ["penalties", "fine", "sanction", "breach", "section 68", "violation", "punishment"],
  },
];

export function findAnswerByQuery(query: string): { answer: string; sources: string } {
  const qLower = query.toLowerCase();

  // Try keyword matching
  let bestMatch: ScriptedQA | null = null;
  let maxScore = 0;

  for (const item of SCRIPTED_QUESTIONS) {
    let score = 0;
    for (const kw of item.keywords) {
      if (qLower.includes(kw)) {
        score += 2;
      }
    }
    // Also check words in question
    const qWords = item.question.toLowerCase().split(/\s+/);
    for (const w of qWords) {
      if (w.length > 3 && qLower.includes(w)) {
        score += 1;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && maxScore >= 2) {
    return {
      answer: bestMatch.answer,
      sources: bestMatch.sources,
    };
  }

  return {
    answer: "That question is outside the scripted demo. Try one of the suggested questions.",
    sources: "Assistant Knowledge Base",
  };
}

export function generateFindingExplanation(
  rule: string,
  facts: Record<string, string | number | boolean>,
  message: string
): { explanation: string; provision: string } {
  switch (rule) {
    case "R1":
      return {
        explanation: `Regulation 11 and Schedule I require every R&D plan submitted to provide full descriptions of all 16 particulars (a) through (p). This draft is missing headings and text for particulars: ${facts.missing || "(j), (o)"}. Add sections addressing these requirements.`,
        provision: "Reg 11; Schedule I",
      };
    case "R2":
      return {
        explanation: `Schedule I(a) mandates that the R&D plan must cover a revolving period of 3 to 5 years (36 to 60 calendar months). The current draft spans ${facts.months || 24} months (from ${facts.start || "2026-01-01"} to ${facts.end || "2027-12-31"}), which falls short of the statutory 3-year minimum.`,
        provision: "Schedule I(a)",
      };
    case "R3":
      return {
        explanation: `The Nigerian Content Plan was submitted on ${facts.nc_date || "2025-02-03"}. Regulation 10 gives six months to file the R&D Plan, establishing a deadline of ${facts.deadline || "2025-08-03"}. This plan was filed on ${facts.filed || "2025-10-06"}, which is ${facts.days_late || 64} days after the deadline. Because this is a historical event, it cannot be undone and must be acknowledged with documented justification.`,
        provision: "Reg 10",
      };
    case "R4":
      return {
        explanation: `Regulation 12 requires approved R&D plans to be updated every six months from the date of Board approval. Update ${facts.update_number || "1"} ${facts.status === "not_filed" ? `was due on ${facts.due} but was never filed` : `was filed on ${facts.filed}, which is ${facts.days_late} day(s) late against the statutory deadline of ${facts.due}`}. Historical late filings remain on the audit log and must be acknowledged.`,
        provision: "Reg 12",
      };
    case "R5":
      return {
        explanation: `Regulation 13 enumerates engineering, geological/geophysical, safety/environmental, and local materials substitution studies. While the phrase 'shall include' gives the Board discretion to accept other domains, focus area '${facts.focus_area}' is flagged as an Advisory for reviewer assessment.`,
        provision: "Reg 13; Template 1.2",
      };
    case "R6":
      return {
        explanation: `Regulation 21 requires a written progress report to be submitted to the Board on the first working day of each quarter. The progress report for the quarter starting ${facts.quarter_start || "2026-07-01"} was due on ${facts.due || "2026-07-01"} and was not filed on time.`,
        provision: "Reg 21",
      };
    case "R7":
      return {
        explanation: `Regulation 22(1) requires extension requests to be submitted to the Board at least seven (7) days before the due date. The extension request was made only ${facts.gap ?? 2} day(s) before the due date. Furthermore, Regulation 22(4) prohibits more than one extension request per calendar year.`,
        provision: "Reg 22(1), 22(4)",
      };
    case "R8":
    case "R9":
      return {
        explanation: `Under ${rule === "R8" ? "Regulation 16 (Disapproval)" : "Regulation 17 (Deviation)"}, the operator is allowed 14 days from official notification to rectify deviations or submit a revised plan. The deadline is ${facts.deadline}. ${facts.days_remaining ? `There are ${facts.days_remaining} day(s) remaining on the statutory countdown.` : "The 14-day window has expired without recorded rectification."}`,
        provision: rule === "R8" ? "Reg 16" : "Reg 17",
      };
    case "R10":
      return {
        explanation: "Schedule I(b) and Template Section 5.1 require stated outcomes to have concrete, measurable targets. The heuristic check requires at least one numeral or quantitative benchmark in the expected outcomes section.",
        provision: "Schedule I(b); Template 5.1",
      };
    case "BUD":
      return {
        explanation: `Under Schedule I(e) and Template 4.1, the internal arithmetic must be consistent. The sum of itemized budget rows (a to h) equals ${typeof facts.sum === "number" ? facts.sum.toLocaleString("en-US") : facts.sum}, which does not match the stated project budget total of ${typeof facts.stated_total === "number" ? facts.stated_total.toLocaleString("en-US") : facts.stated_total}.`,
        provision: "Schedule I(e); Template 4.1",
      };
    case "EXP":
      return {
        explanation: "Schedule I(e) requires the sum of yearly planned expenditure entries to exactly equal the stated total plan expenditure across the 3 to 5 year lifecycle.",
        provision: "Schedule I(e)",
      };
    default:
      return {
        explanation: `Template requirement check (${rule}): ${message}. Consult the 2019 NCDMB R&D Plan Template guidelines.`,
        provision: "NCDMB Template 2019",
      };
  }
}
