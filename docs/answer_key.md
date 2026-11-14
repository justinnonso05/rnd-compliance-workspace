# Answer key (private)
Use this to check the demo. It is not accuracy evidence: the findings were planted by us, on synthetic data.
Demo date is fixed at **16 November 2026** (`demo_today` in each data file). Severity: `defect`, `advisory` (flag for review), `timer` (open deadline), `info`.

## Sample A: Compliant plan (should pass every check)
Expected result: **no findings.** Every check passes.

## Sample B: Defective plan (main demo document, planted defects)
| ID | Rule | Provision | Expected message | Where in the plan | Must show |
|---|---|---|---|---|---|
| B-01 | R1 (defect) | Reg 11; Schedule I | Missing Schedule I particulars: (j), (o) | Part A, missing headings | Yes |
| B-02 | R2 (defect) | Schedule I(a) | Plan covers 24 months; a revolving 3 to 5 year plan is required | Filing particulars; Part A (a) | Yes |
| B-03 | R3 (defect) | Reg 10 | Plan filed 2025-10-06; deadline was 2025-08-03 | Filing particulars; (see NC Plan and filing dates) | Yes |
| B-04 | R4 (defect) | Reg 12 | Update 1 filed 2026-08-05; due 2026-05-03 (94 day(s) late) | Filing particulars, six-monthly updates | Yes |
| B-05 | R4 (defect) | Reg 12 | Update 2 not filed; was due 2026-11-03 | Filing particulars, six-monthly updates | Yes |
| B-06 | R5 (advisory) | Reg 13; Template 1.2 | Focus area 'Retail marketing and customer-brand studies' is not in the Regulation 13 list | Annex 1, section 1.2 |  |
| B-07 | R7 (defect) | Reg 22(1) | Extension requested 2 day(s) before the due date; at least 7 days required | Filing particulars, extension requests | Yes |
| B-08 | R6 (defect) | Reg 21 | Progress report for the quarter starting 2026-07-01 not filed (due 2026-07-01) | Filing particulars, quarterly reports | Yes |
| B-09 | R9 (timer) | Reg 17 | Open; deadline 2026-11-23; 7 day(s) remaining | Board notices | Yes |
| B-10 | R10 (defect) | Schedule I(b); Template 5.1 | Expected outcome has no measurable target (heuristic: no number found) | Part A (b) |  |
| B-11 | BUD (defect) | Schedule I(e); Template 4.1 | Budget lines sum to 16,500,000; stated total 17,500,000 | Annex 1, section 4.1 | Yes |
| B-12 | T1 (defect) | Template 1.3 | Title has 26 words; maximum 20 | Annex 1, section 1.3 |  |
| B-13 | T3 (defect) | Template 1.5 | 3 keywords; 5 to 8 required | Annex 1, section 1.5 |  |
| B-14 | T8 (defect) | Template 6.2 | Steering team must include NCDMB, the Company and the research centre | Annex 1, section 6.2 |  |
| B-15 | T9 (defect) | Template 7.0 | Plagiarism statement not signed | Annex 1, section 7.0 |  |

## Sample C: Edge case (values on the limits; exactly one day-late defect)
| ID | Rule | Provision | Expected message | Where in the plan |
|---|---|---|---|---|
| C-01 | R4 (defect) | Reg 12 | Update 1 filed 2026-06-23; due 2026-06-22 (1 day(s) late) | Filing particulars, six-monthly updates |

## Boundary cases the demo should get right (Sample C)
- Filed on 2 December 2025, exactly six months after the Nigerian Content Plan (2 June 2025): **passes** (Reg 10).
- Extension requested on 24 June 2026, exactly seven days before the 1 July due date: **passes**, and the extended date (8 July 2026) is honoured (Reg 22).
- Quarter-start reports on 2 January 2026 and 2 October 2026: **pass**, because 1 January and 1 October are public holidays, so the first working day is the 2nd (Reg 21).
- Deviation notice of 2 November 2026 corrected on 16 November 2026, the fourteenth day: **passes** (Reg 17).
- Title has exactly 20 words and there are exactly 5 keywords: **pass** (Template 1.3, 1.5).
- Update filed 23 June 2026 against a due date of 22 June 2026: **one day late, flagged** (Reg 12). This is the only finding in Sample C.
