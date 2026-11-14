# Demo pack: three synthetic R&D plans

Fixed demo date: **16 November 2026** (`demo_today`). Change it in each data file and rules.json together, and the timers move.

| Sample | File | Purpose | Expected result |
|---|---|---|---|
| A | Sample_A_Compliant | Shows the tool does not cry wolf | 0 findings |
| B | Sample_B_Defective | Main demo document | 15 findings (see answer_key.md) |
| C | Sample_C_Edge_Case | Shows the rules are exact | 1 finding (a plan update one day late) |

Files
- plans/*.docx and *.pdf: the plans to "upload" (identical content).
- data/*.json: the extracted fields your demo reads after the simulated extraction step.
- rules.json: the rule library, with provisions and the assumptions still to confirm.
- answer_key.md / answer_key.json: every planted finding. For checking the demo only, not accuracy evidence.
- reference_checker.py: plain-Python version of the rules. Run `python3 reference_checker.py data/Sample_B_Defective.json` and compare your JavaScript rule engine's output with it.

Say on screen: synthetic data, simulated extraction and scripted assistant. The rule checks run for real on the fields.
