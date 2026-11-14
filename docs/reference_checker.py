"""Reference checker for the three synthetic samples.
Implements the rule library in plain Python so the demo's JavaScript rule engine can be tested against it.
Usage: python3 reference_checker.py data/Sample_B_Defective.json"""
import json, sys, calendar
from datetime import date, timedelta

REG13 = ["Engineering studies", "Geological and geophysical studies", "Safety and environmental studies", "Local materials substitution studies"]
TEMPLATE_FOCUS = REG13 + ["Technology development studies"]
HOLIDAYS = {date(2025, 10, 1), date(2026, 1, 1), date(2026, 10, 1)}  # only holidays that fall on quarter starts; confirm against the official calendar

def d(s): return date.fromisoformat(s) if s else None
def add_months(x, n):
    m = x.month - 1 + n; y = x.year + m // 12; m = m % 12 + 1
    return date(y, m, min(x.day, calendar.monthrange(y, m)[1]))
def first_working_day(q):
    x = q
    while x.weekday() >= 5 or x in HOLIDAYS: x += timedelta(days=1)
    return x
def words(t): return len(t.split())

def check(s):
    F = []; today = d(s["demo_today"]); fl = s["filing"]; P = s["project"]
    def add(rid, prov, sev, msg): F.append({"rule": rid, "provision": prov, "severity": sev, "message": msg})
    # R1
    miss = [k for k, v in s["schedule_I"].items() if not v["present"]]
    if miss: add("R1", "Reg 11; Schedule I", "defect", "Missing Schedule I particulars: " + ", ".join(f"({k})" for k in miss))
    # R2
    st, en = d(fl["plan_start"]), d(fl["plan_end"]) + timedelta(days=1)
    months = (en.year - st.year) * 12 + en.month - st.month
    if not 36 <= months <= 60: add("R2", "Schedule I(a)", "defect", f"Plan covers {months} months; a revolving 3 to 5 year plan is required")
    # R3
    dl = add_months(d(fl["nc_plan_submitted"]), 6)
    if d(fl["rd_plan_filed"]) > dl: add("R3", "Reg 10", "defect", f"Plan filed {fl['rd_plan_filed']}; deadline was {dl}")
    # R4
    ap = d(fl["board_approved"]); k = 1
    while add_months(ap, 6 * k) <= today:
        due = add_months(ap, 6 * k); u = next((x for x in s["updates"] if x["n"] == k), None)
        if not u: add("R4", "Reg 12", "defect", f"Update {k} not filed; was due {due}")
        elif d(u["date"]) > due: add("R4", "Reg 12", "defect", f"Update {k} filed {u['date']}; due {due} ({(d(u['date']) - due).days} day(s) late)")
        k += 1
    # R5
    if P["focus_area"] not in REG13:
        sev = "info" if P["focus_area"] in TEMPLATE_FOCUS else "advisory"
        add("R5", "Reg 13; Template 1.2", sev, f"Focus area '{P['focus_area']}' is not in the Regulation 13 list")
    # R6 + R7 (extensions honoured only if the request was on time)
    ext = {}
    for e in s["extension_requests"]:
        gap = (d(e["due_date"]) - d(e["request_date"])).days
        if gap < 7: add("R7", "Reg 22(1)", "defect", f"Extension requested {gap} day(s) before the due date; at least 7 days required")
        elif e["granted_until"]: ext[e["due_date"]] = d(e["granted_until"])
    yrs = {}
    for e in s["extension_requests"]: yrs[e["request_date"][:4]] = yrs.get(e["request_date"][:4], 0) + 1
    if any(v > 1 for v in yrs.values()): add("R7", "Reg 22(4)", "defect", "More than one extension request in a year")
    rep = {r["quarter_start"]: r["filed"] for r in s["quarterly_reports"]}
    q = date(ap.year, ((ap.month - 1) // 3) * 3 + 1, 1)
    while True:
        q = add_months(q, 3); fw = first_working_day(q)
        if fw > today: break
        if fw <= ap: continue
        due = ext.get(str(fw), fw); filed = d(rep.get(str(q)))
        if not filed: add("R6", "Reg 21", "defect", f"Progress report for the quarter starting {q} not filed (due {due})")
        elif filed > due: add("R6", "Reg 21", "defect", f"Progress report for the quarter starting {q} filed {filed}; due {due}")
    # R8 / R9 notices
    for n in s["board_notices"]:
        dline = d(n["notice_date"]) + timedelta(days=14); reg = "Reg 16" if n["type"] == "disapproval" else "Reg 17"
        rid = "R8" if n["type"] == "disapproval" else "R9"
        if n["rectified_date"]:
            if d(n["rectified_date"]) > dline: add(rid, reg, "defect", f"Corrected {n['rectified_date']}; deadline was {dline}")
        elif today > dline: add(rid, reg, "defect", f"14-day deadline {dline} passed without correction")
        else: add(rid, reg, "timer", f"Open; deadline {dline}; {(dline - today).days} day(s) remaining")
    # R10 heuristic
    if not any(c.isdigit() for c in s["expected_outcome_text"]): add("R10", "Schedule I(b); Template 5.1", "defect", "Expected outcome has no measurable target (heuristic: no number found)")
    # Budget arithmetic
    tot = sum(b["amount"] for b in P["budget_items"])
    if tot != P["budget_stated_total"]: add("BUD", "Schedule I(e); Template 4.1", "defect", f"Budget lines sum to {tot:,}; stated total {P['budget_stated_total']:,}")
    ex = sum(r["i1"] + r["i2"] for r in s["planned_expenditure"]["rows"])
    if ex != s["planned_expenditure"]["stated_total"]: add("EXP", "Schedule I(e)", "defect", "Yearly expenditure does not add up to the stated plan total")
    # Template project rules
    if words(P["title"]) > 20: add("T1", "Template 1.3", "defect", f"Title has {words(P['title'])} words; maximum 20")
    if words(P["goals_and_objectives"]) > 800: add("T2", "Template 1.4", "defect", "Goals and objectives exceed 800 words")
    if not 5 <= len(P["keywords"]) <= 8: add("T3", "Template 1.5", "defect", f"{len(P['keywords'])} keywords; 5 to 8 required")
    if not (P["start"] and P["end"]): add("T4", "Template 1.6", "defect", "Start or completion date missing")
    if not P["principal_investigator"]: add("T5", "Template 3.1", "defect", "No principal investigator named")
    if {b["code"] for b in P["budget_items"]} != set("abcdefgh"): add("T6", "Template 4.1", "defect", "Budget does not cover items a to h")
    kp = {k["activity"] for k in P["kpis"]}
    if [a for a in P["activities"] if a not in kp]: add("T7", "Template 5.1", "defect", "Activity without a performance indicator")
    if not all(P["steering_team"].values()): add("T8", "Template 6.2", "defect", "Steering team must include NCDMB, the Company and the research centre")
    if not P["plagiarism_statement_signed"]: add("T9", "Template 7.0", "defect", "Plagiarism statement not signed")
    return F

if __name__ == "__main__":
    for f in sys.argv[1:]:
        s = json.load(open(f)); r = check(s)
        print(f"{s['sample_id']}: {len(r)} finding(s)")
        for x in r: print(f"  [{x['severity']}] {x['rule']} ({x['provision']}): {x['message']}")
