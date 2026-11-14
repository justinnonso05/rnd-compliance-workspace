# Implementation plan: R&D Compliance Workspace (demo front end)

Audience: the agent that will build the demo. Read this whole file before writing code. Where the plan and the demo pack disagree, stop and ask.

## 1. What you are building

A browser-only front end that demonstrates the proposal's platform end to end, from onboarding to export, using the three synthetic samples in the demo pack (A compliant, B defective, C edge case).

**What is real and what is simulated.** This must be shown on screen and said when presenting.

| Part | Status |
|---|---|
| Rule checks (R1 to R10, BUD, EXP, T1 to T9) | **Real.** They run in the browser on the extracted fields. Editing a field changes the result. |
| Date logic and 14-day timers | **Real**, against a fixed demo date |
| Document extraction | **Simulated.** Only the three sample plans are recognised. Stretch goal in section 11 makes it real for the sample .docx files. |
| AI assistant | **Scripted.** Fixed questions and answers with citations. Label it "Scripted demo responses". |
| Team members and activity | **Simulated** personas |
| JQS export | **Illustrative format.** We do not have the official NOGIC JQS schema. |

Persistent banner on every screen: **"Prototype. Synthetic data. Extraction and assistant are simulated. Rule checks run live."**

Scope: R&D plan auditing only (the proposal's first module). No expatriate-quota or procurement checks.

## 2. Two-stage flow to demonstrate

1. **Pre-audit.** The team drafts, the rule engine checks, findings are triaged and fixed before the plan is exported for the official JQS submission.
2. **Remediation.** After the Board's official notice arrives through the JQS portal, the operator's **Compliance Reviewer** logs the notice date. The 14-day countdown starts. The team fixes, re-audits and re-exports. NCDMB stays **view-only** and never clicks anything in the workspace.

## 3. Stack

- **Next.js 14 or later (App Router) with React 18 and TypeScript.** This is the same React the proposal names, used through the Next.js framework.
- **Static export only.** Set `output: 'export'` in `next.config.js`, plus `images: { unoptimized: true }` and `trailingSlash: true`. There is no server, no API routes, no server actions and no middleware. `next build` must produce a plain `out/` folder that opens from any static host or from a local file server.
- **Client components.** Every interactive screen starts with `"use client"`. Layouts, the shell and the banner may be server components, but nothing may depend on a Node runtime.
- **Routing.** File-based App Router. Do not use dynamic route segments such as `/documents/[id]` (they need `generateStaticParams` under static export). Use a fixed path with a query string instead, for example `/documents/extract?id=...`, read with `useSearchParams` inside a `Suspense` boundary.
- Styling: plain CSS with design tokens as CSS variables (section 4), loaded from `app/globals.css`. Tailwind is acceptable only if the tokens are mapped one to one.
- Icons: `lucide-react`, 18 px, stroke width 1.75.
- Fonts: IBM Plex Sans (UI) and IBM Plex Mono (IDs, dates in tables), self-hosted with `next/font/local` or `@fontsource`. No Google Fonts or CDN calls at runtime.
- Dates: `date-fns`. State: Zustand with `persist` to localStorage (key `rdw-demo-v1`). Because Next.js pre-renders on the server, read persisted state only after mount (use `skipHydration` and call `rehydrate()` in an effect, or gate rendering on a `hydrated` flag) so the page does not show a hydration mismatch. Provide "Reset demo data".
- PDF report: `jspdf` and `jspdf-autotable`, imported with `next/dynamic` and `ssr: false` (or a dynamic `import()` inside the click handler) so they never run on the server. Fall back to a print stylesheet if the PDF looks worse.
- File reading (hashes, optional .docx parsing): browser APIs only (`crypto.subtle`, `FileReader`). No Node `fs` anywhere.
- Tests: Vitest for the rule engine (the engine is plain TypeScript with no Next.js imports). Playwright for the end-to-end script in section 12, run against `next build` output served statically.
- Must run fully offline: bundle fonts, sample PDFs and data. The projector Wi-Fi may fail. Check by serving `out/` locally with the network off.

Folder layout:

```
app/
  layout.tsx            shell: sidebar, top bar, prototype banner
  globals.css           tokens and base styles
  page.tsx              dashboard
  onboarding/page.tsx
  documents/page.tsx
  documents/extract/page.tsx
  audit/page.tsx
  assistant/page.tsx
  team/page.tsx
  deadlines/page.tsx
  fix/page.tsx
  export/page.tsx
  ncdmb/page.tsx
  settings/page.tsx
  dev/verify/page.tsx   hidden
components/             Button, Table, Badge, Stepper, Drawer, Tabs, Field, RoleGuard
features/               onboarding, dashboard, upload, extraction, audit, finding, assistant,
                        team, deadlines, reaudit, export, ncdmb-view, settings, dev-verify
engine/                 rules/*.ts, dates.ts, index.ts, engine.test.ts   (no React, no Next.js)
data/                   types.ts, samples loader, assistant.ts (scripted Q&A)
store/                  Zustand store
public/
  samples/              data/*.json, plans/*.pdf, plans/*.docx
  rules.json
  answer_key.json       (loaded only by /dev/verify)
```

## 4. Visual design

Goal: sober, government-and-enterprise software. It must not look generated. Think a well-made internal portal, not a startup landing page.

**Do not use:** emojis, gradients (any), neon colours, glow, glassmorphism, drop shadows (use 1 px borders), animated counters, skeleton shimmer, confetti, illustrations, hero banners, rounded pill buttons, gradient avatars, decorative icons in every heading, bouncing toasts.

**Motion:** none, apart from instant state changes and a 100 ms focus ring. The extraction progress bar is determinate (it fills as stages complete), not a spinner.

**Relationship to the real portal.** The NOGIC JQS screens use a dark green sidebar, white content and a vertical stepper. Match that general feel with our own layout. Do **not** copy its logo, emblem, wording or screens, and do not use any NCDMB or government seal. The product name on screen is **"R&D Compliance Workspace"** with a small "Prototype" tag. Placeholder mark: a plain square with the initials "RC" in a text logo, no emblem.

### Tokens

```css
:root {
  /* greens */
  --green-950: #0A3A1E;   /* sidebar */
  --green-900: #0F4A29;   /* sidebar hover */
  --green-700: #14612F;   /* button hover */
  --green-600: #1A7F37;   /* primary */
  --green-400: #4CC26B;   /* active link text on dark */
  --green-100: #E9F4EC;   /* tint */
  --green-200: #BFDDC8;   /* green border */
  /* neutrals */
  --bg: #F6F7F6;  --surface: #FFFFFF;  --border: #DDE2DE;  --border-strong: #C3CBC5;
  --text: #1C2420;  --text-muted: #5B665F;  --text-on-dark: #E7F0EA;
  /* status: always paired with a text label, never colour alone */
  --defect: #B42318;   --defect-bg: #FDECEA;
  --advisory: #8A5A00; --advisory-bg: #FFF3D6;
  --timer: #175CD3;    --timer-bg: #E8F0FE;
  --pass: #1A7F37;     --pass-bg: #E9F4EC;
  --info: #475467;     --info-bg: #EEF0F2;
  --radius: 4px;
}
```

Typography: base 14 px, line height 1.5. Page title 20 px semibold. Section heading 16 px semibold. Table text 13 px. Sentence case everywhere. No exclamation marks.

Layout:
- Left sidebar, 240 px, `--green-950`. Product mark at top. Nav items with an icon and label. The active item has a 3 px left border in `--green-400` and green text.
- Top bar, 56 px, white, 1 px bottom border. Left: breadcrumb. Right: **Demo date** chip, **Viewing as** role switcher, avatar with initials.
- Content area on `--bg`. Panels are white with a 1 px border and a 4 px radius. Content max width 1200 px.
- Tables: dense, 40 px rows, header row on `--green-100`, no zebra, 1 px row borders. Dates in mono.
- Buttons: primary solid `--green-600`, secondary white with border, destructive text only. Square-ish, 4 px radius, 36 px high.
- Status badges: small rectangular tag, 12 px text, coloured text on the matching `-bg`, with an icon and a word (for example "Defect", "Advisory", "Timer", "Resolved").
- Focus ring: 2 px `--green-600` with 2 px offset. Minimum contrast 4.5:1 for text.
- Desktop first, 1366 px wide minimum. Make it usable at 1024 px. Mobile is out of scope.

Icon map (Lucide): dashboard `layout-dashboard`, projects `folder-open`, documents `file-text`, audit `shield-check`, findings `list-checks`, assistant `message-square-text`, team `users`, deadlines `calendar-clock`, export `file-down`, NCDMB view `eye`, settings `settings`, defect `circle-alert`, advisory `triangle-alert`, timer `timer`, resolved `circle-check`, upload `upload`, comment `message-square`, activity `history`.

## 5. Roles and permissions

Demo personas (fictional, fixed across all samples):

| Role | Persona | Can do |
|---|---|---|
| Lead researcher | Dr. Ada Okeke-Sample | Everything except logging Board notices. Advances phases. Approves exports. |
| Co-researcher | Engr. Musa Bello-Sample | Edit fields, fix findings, comment, change status of findings assigned to them |
| Compliance reviewer | Ms. Chioma Eze-Sample | Upload, assign findings, mark resolved or acknowledged, **log Board notices**, export |
| NCDMB view-only | NCDMB analyst (view-only account) | Read everything. All inputs and action buttons are disabled with the label "View only". No edit, comment or status change. |

The **Viewing as** switcher changes role instantly. There is no real login.

## 6. Screens and flow

Routes and purpose. Build every screen listed. Items marked optional can wait.

### 6.1 Onboarding (route `/onboarding`, five steps, vertical stepper on the left)

1. **Prototype notice.** One short panel stating what is simulated (the banner text) and a "Continue" button.
2. **Sign in.** Pick a demo account from a list of the four personas. No password field. Label: "Demo accounts, no real sign-in".
3. **Workspace.** Create or select an operator workspace. Preselect "Sample Operator Ltd". Fields: operator name, state (read-only here), Nigerian Content Plan submission date (prefilled from the sample once one is loaded; editable before).
4. **Project setup.** Project title, focus area (select, values from `rules.json` `template_focus_areas`), research centre, plan period. Choosing a focus area loads a **requirements checklist** (the Template headings and Schedule I (a) to (p)), shown on the right. If the focus area is not one of the four Regulation 13 areas, show an advisory badge here already (this is rule R5).
5. **Team.** Show the persona roster with roles. "Invite" is simulated: it adds a row with status "Invited".

Ends with "Open project", which goes to the dashboard. A "Skip to demo" link loads Sample B directly (presenter shortcut) and is hidden when role is NCDMB view-only.

### 6.2 Dashboard (`/`)

- Project header: title, operator, focus area, sample label.
- **Phase tracker** (from the proposal's Figure 1): Formulate, Plan, Conduct, Audit, Report. Horizontal stepper. The current phase is highlighted. "Advance phase" is gated: Audit to Report requires zero open correctable findings (see section 8). If blocked, show why in one sentence and a link to the findings.
- Summary cards (plain, bordered): open defects, advisories, open timers, historical acknowledged.
- **Deadlines panel**: next dated items (update due, next quarterly report, open notices with days left).
- Recent activity (last five events).

### 6.3 Documents and upload (`/documents`)

- Drop zone and file button. Accept `.pdf` and `.docx`.
- Recognition: match by file name containing `Sample_A`, `Sample_B` or `Sample_C`. As a fallback compare a SHA-256 hash of the file against hashes computed at build time. Anything else gets this message: "This prototype recognises only the three synthetic sample plans. Extraction for other documents is not simulated." Do not fake extraction for unknown files.
- Document list: name, type, uploaded by, time, status (Uploaded, Extracted, Audited).
- Preview: embed the PDF with the browser viewer.

### 6.4 Simulated extraction (`/documents/extract?id=...`)

- A determinate progress bar with named stages, about 4 seconds in total: Reading file, Locating Schedule I headings, Reading dates and logs, Reading project annex, Done.
- Then the **extraction review**: three tabs (Filing and logs, Schedule I, Project annex). Each row shows field, extracted value and source location (for example "Part A (b)" or "Annex 1, 1.5"). Do not show confidence percentages. Fields are editable (this is what makes re-audit real).
- Button: "Run audit".

### 6.5 Audit results (`/audit`)

- Summary strip: total findings, by severity (defect, advisory, timer), and a **Re-audit delta** when a previous run exists ("Before 15, after 6").
- Filters: severity, status, assignee, rule layer (Regulations, Template).
- Findings table columns: ID, rule, severity badge, provision (for example "Reg 10"), message, field, assignee, status.
- Click a row to open the **finding drawer** (right side, 480 px, no overlay animation):
  - Rule statement and provision, with a short paraphrase of the provision (see section 9).
  - The offending field and its current value, with a link to edit it.
  - For date rules: the computed dates (deadline, filed date, days difference).
  - 14-day timer where it applies.
  - Assign to (persona), status (Open, In progress, Resolved, Acknowledged), comment box and thread.
  - "Ask the assistant about this finding", which opens the assistant with a templated explanation.

### 6.6 Assistant panel (`/assistant`, also a docked side panel)

- Header label: "Scripted demo responses. The full platform uses retrieval-augmented AI over the loaded legal texts."
- Suggested question chips (the list in section 9) plus a text box. Free text is matched by keywords to the nearest scripted answer. If nothing matches: "That question is outside the scripted demo. Try one of the suggested questions."
- Each answer shows a **Sources** line with the provision, as a small bordered tag.
- A separate "Explain this finding" template fills in the numbers from the loaded sample (see section 9).
- No typing animation. The answer appears at once.

### 6.7 Team triage (`/team`)

- Table of findings grouped by assignee, with status columns. Bulk assign for the compliance reviewer and lead.
- **Activity log**: timestamped events (assigned, commented, status changed, field edited, audit run, notice logged, export created). Persisted. This is the audit trail the proposal promises. Timestamps use the demo clock (fixed date plus real time of day).
- Roster panel with roles and each person's open items.

### 6.8 Deadlines and notices (`/deadlines`)

- Table of computed obligations: the next update due dates (approval date plus 6, 12 months), the next quarterly report date (first working day), open extension windows, and open Board notices.
- **Log Board notice** form (compliance reviewer only): type (Deviation, Reg 17, or Disapproval, Reg 16), notice date, description, attach reference (free text). Saving creates a timer: deadline = notice date plus 14 days, "N days remaining" counted from the demo date. The timer shows the exact deadline date and turns to "Due today" and "Overdue" with labels, not just colour.
- Record correction: set a corrected-on date. A date on or before the deadline closes the timer as met.
- Make clear in one line of help text: "The workspace does not contact NCDMB. Enter the date shown on the official notice."

### 6.9 Fix and re-audit (`/fix`, reached from findings)

See section 8 for what can be fixed and how. Layout: left, the list of correctable findings; right, an editor for the relevant field. "Save and re-audit" reruns the engine, closes cleared findings and shows the delta strip.

### 6.10 Export (`/export`)

- **Compliance report (PDF).** Contents: title, synthetic label, operator and project, demo date, summary counts, findings table (ID, rule, provision, severity, status, assignee), acknowledged historical items with the comment, open timers, re-audit before and after counts, the activity log excerpt, and the prototype disclaimer in the footer.
- **JQS-style file.** JSON download of the audited plan: filing particulars, Schedule I presence map, findings, project fields. Title it "Illustrative format, not the official NOGIC JQS schema". Offer XML as a second option only if time allows.
- Export is blocked for NCDMB view-only. Lead researcher's approval is simulated by a checkbox "Reviewed by lead researcher".

### 6.11 NCDMB view-only summary (`/ncdmb`, optional but valuable)

Read-only portfolio of the three samples: operator, sample label, counts by severity, open timers, last audit date. Click through to a read-only audit view. This is the regulator-side value the proposal claims (oversight data).

### 6.12 Settings and demo controls (`/settings`)

- Demo date (default 2026-11-16, matching `demo_today`). Changing it reruns the engine so timers move.
- Reset demo data. Switch active sample.
- Presenter mode toggle: hides the answer-key link and the dev routes.
- `/dev/verify` (hidden): runs the engine on A, B and C and compares with `answer_key.json`. Shows a pass or fail table. Not linked from the UI.

## 7. Data model

Load `public/samples/data/*.json` as the extraction result. These types match the files exactly:

```ts
type Sev = "defect" | "advisory" | "timer" | "info";
interface Extracted {
  sample_id: "A" | "B" | "C"; synthetic: true; label: string; demo_today: string;
  operator: string;
  filing: { nc_plan_submitted: string; rd_plan_filed: string; board_approved: string; plan_start: string; plan_end: string };
  schedule_I: Record<"a"|"b"|"c"|"d"|"e"|"f"|"g"|"h"|"i"|"j"|"k"|"l"|"m"|"n"|"o"|"p", { present: boolean; text: string | null }>;
  expected_outcome_text: string;
  planned_expenditure: { rows: { year: number; i1: number; i2: number }[]; stated_total: number };
  updates: { n: number; date: string }[];
  quarterly_reports: { quarter_start: string; filed: string }[];
  extension_requests: { applies_to: string; due_date: string; request_date: string; granted_until: string | null }[];
  board_notices: { type: "deviation" | "disapproval"; reg: string; notice_date: string; rectified_date: string | null; logged_by: string; description: string }[];
  prior_outstanding_obligations: boolean;
  project: {
    title: string; focus_area: string; keywords: string[]; goals_and_objectives: string; start: string; end: string;
    principal_investigator: { name: string; role: string } | null;
    team: { name: string; role: string }[];
    budget_items: { code: string; label: string; amount: number }[]; budget_stated_total: number;
    activities: string[]; kpis: { activity: string; indicator: string }[];
    steering_team: { ncdmb: boolean; company: boolean; research_center: boolean };
    plagiarism_statement_signed: boolean;
  };
}
interface Finding {
  id: string;            // stable per run, for example "B-01"
  rule: string;          // "R3", "T1", ...
  provision: string;     // "Reg 10"
  severity: Sev;
  message: string;       // raw engine message, used by tests
  field: string;         // JSON path of the main field, for the editor link
  facts: Record<string, string | number>; // computed values for the drawer
  correctable: boolean;  // see section 8
  status: "open" | "in_progress" | "resolved" | "acknowledged";
  assignee?: string; comments: { by: string; at: string; text: string }[];
}
```

The working copy of the extracted data lives in the store. Edits write to that copy, never to the files in `public/`.

## 8. Rule engine

Pure TypeScript functions, no UI imports. Signature: `check(extracted, today) => Finding[]`. It must reproduce `reference_checker.py` from the demo pack. Read that file and port it line by line.

Rules and exact logic (provisions verified against S.I. No. 34 of 2021 and the Template):

| Rule | Check | Provision |
|---|---|---|
| R1 | Schedule I particulars (a) to (p) all present | Reg 11; Schedule I |
| R2 | Plan period is 36 to 60 months. Months = whole months from start to end plus one day. | Schedule I(a) |
| R3 | `rd_plan_filed` is on or before `nc_plan_submitted` plus 6 months | Reg 10 |
| R4 | For k = 1, 2, ... while approval plus 6k months is on or before today: update k must exist and be dated on or before that due date | Reg 12 |
| R5 | Focus area is one of the four Regulation 13 areas. If not, **advisory**, not defect. If it is one of the Template's five, severity is info. | Reg 13; Template 1.2 |
| R6 | For each quarter start after the approval date whose first working day is on or before today: a report is filed on or before the due date (the extended date if a valid extension was granted) | Reg 21 |
| R7 | Each extension request is made at least 7 days before the due date. At most one per calendar year. | Reg 22(1), 22(4) |
| R8 / R9 | Notice date plus 14 days is the deadline. Corrected on or before it passes. Not corrected and today is on or before the deadline gives a **timer**. Past it gives a defect. | Reg 16 / Reg 17 |
| R10 | Expected outcome contains at least one digit. **Label this on screen as a heuristic** standing in for AI reading. | Schedule I(b); Template 5.1 |
| BUD | Sum of budget lines equals the stated project total | Schedule I(e); Template 4.1 |
| EXP | Sum of yearly expenditure equals the stated plan total | Schedule I(e) |
| T1 to T9 | Title at most 20 words (split on whitespace); goals at most 800 words; 5 to 8 keywords; start and end dates present; principal investigator named; budget items a to h present; each activity has an indicator; steering team has NCDMB, company and research centre; plagiarism statement signed | Template 1.3, 1.4, 1.5, 1.6, 3.1, 4.1, 5.1, 6.2, 7.0 |

Date helpers:
- `addMonths(date, n)` clamps to the last day of the target month (date-fns `addMonths` does this).
- `firstWorkingDay(quarterStart)`: move forward while the day is Saturday, Sunday or in `rules.json` `config.holidays_on_quarter_starts`.
- Quarter starts are 1 January, 1 April, 1 July and 1 October.
- Work in dates without a time zone. Parse `YYYY-MM-DD` as a local date, never `new Date("YYYY-MM-DD")` (it is UTC and shifts by a day in some zones).
- Messages use ISO dates and the exact templates in the reference checker, for example `Update 1 filed 2026-08-05; due 2026-05-03 (94 day(s) late)`. Keep `message` identical so tests can compare strings. Format dates for humans in the UI from `facts`.

**Expected results (the tests must pass):** A returns 0 findings, B returns 15, C returns 1. For every sample the list of (rule, severity, message) must equal `answer_key.json`.

### Which findings can be fixed in the workspace

Some defects are about the draft and can be corrected. Others are historical facts that cannot be undone. Do not let the demo pretend otherwise.

| Finding (Sample B) | Correctable? | How the demo fixes it |
|---|---|---|
| R1 missing (j), (o) | Yes | Add text for the missing particulars in the Schedule I editor |
| R2 24-month plan | Yes | Edit plan end date to give 36 to 60 months |
| R5 off-list focus area (advisory) | Yes | Change the focus area |
| R10 vague outcome | Yes | Edit the outcome so it contains a measurable target |
| BUD budget total | Yes | Correct a budget line or the stated total |
| T1 title too long | Yes | Shorten the title |
| T3 keywords | Yes | Add keywords up to at least five |
| T8 steering team | Yes | Tick NCDMB in the steering team |
| T9 plagiarism statement | Yes | Mark as signed, with date and name |
| R9 deviation timer | Yes | Record the correction date, on or before the deadline |
| R3 late filing | **No, historical** | Acknowledge with a comment |
| R4 update 1 late, update 2 overdue | **No, historical** | Acknowledge. Recording a late update does not make it on time. |
| R6 missing Q3 report | **No, historical** | Acknowledge. Filing now is still late. |
| R7 late extension request | **No, historical** | Acknowledge |

Historical findings get status **Acknowledged** (with a required comment) and stay in the report under "Historical items, acknowledged". Sample C's only finding is historical (an update one day late), which shows that the rules are exact.

After fixing everything correctable in B, the audit shows 5 acknowledged historical items and 0 open correctable ones. This is the honest end state, and it is what lets the phase gate in 6.2 open.

## 9. Scripted assistant content

Answers are drawn only from provisions that were read in the official text. Keep each answer to two or three sentences with a **Sources** tag. Wording below is a paraphrase to be shown as written.

| # | Question | Answer | Sources |
|---|---|---|---|
| 1 | How long do we have to file the R&D plan? | Within six months of submitting the Nigerian Content Plan for the project. | Reg 10 |
| 2 | How often must the approved plan be updated? | Every six months from the date the Board approves it. | Reg 12 |
| 3 | What must the plan contain? | A full description of sixteen particulars, (a) to (p), including a revolving 3 to 5 year plan, expected outcome, scope, planned expenditure, methodology, environmental impact analysis and a training plan for Nigerian personnel. | Reg 11; Schedule I |
| 4 | What happens if the Board disapproves the plan? | The operator submits a revised plan and performs any outstanding obligations within 14 days of notification. | Reg 16 |
| 5 | What if a deviation is not fixed in 14 days? | The Board may order suspension of the plan. The operator must then stop related activities, may submit a written representation within 14 days of the suspension, and the Board reverses the suspension once the deviation is fixed or the representation is accepted. | Reg 17 to 20 |
| 6 | When is the progress report due? | On the first working day of each quarter. | Reg 21 |
| 7 | Can we get more time? | Yes. Ask the Board at least seven days before the due date. The Board replies within seven days, and an extension for a plan or quarterly report will not be considered more than once a year. | Reg 22 |
| 8 | Which areas can the research cover? | Regulation 13 lists engineering studies, geological and geophysical studies, safety and environmental studies, and local materials substitution studies. It says the scope "shall include" these, so other areas are for the Board to judge. The NCDMB Template also lists technology development studies. | Reg 13; Template 1.2 |
| 9 | Who owns the intellectual property? | It is vested in the operator, subject to relevant laws such as the Trademarks Act and the Patents and Designs Act. | Reg 27 |
| 10 | What are the penalties? | Breach is liable to fines, sanctions or penalties under the Nigerian Oil and Gas Industry Enforcement and Compliance Regulation 2021 or as the Board determines, without prejudice to Section 68 of the Act. | Reg 36 |

Do **not** state a percentage for Section 68 in the assistant. That figure has not been checked against the Act's text.

**"Explain this finding" template.** Fill from `facts`. Example for R3: "The Nigerian Content Plan was submitted on {nc_date}. Regulation 10 gives six months, so the deadline was {deadline}. This plan was filed on {filed}, which is {days} days after the deadline." Write one template per rule.

## 10. Copy rules

- Plain sentences, sentence case, no exclamation marks, no marketing language.
- Use "finding", "provision", "deadline". Never "AI-powered magic", "smart", "instantly".
- Every provision tag shows the regulation number as in the table, for example "Reg 10", "Schedule I(b)", "Template 1.3".
- The instrument is cited as "S.I. No. 34 of 2021". Do not write "S.I. No. 52" anywhere.
- Never show a fake NCDMB seal, letterhead or Board letter. Board notices appear only as entries logged by the operator.

## 11. Stretch: make extraction real for the sample .docx files

If time remains, replace the simulated step for `.docx` uploads with a parser, so the upload is real for any plan that follows the sample structure.

- Use `mammoth` (docx to HTML) or read `word/document.xml` with `jszip`, then parse the DOM.
- The samples have fixed headings: `Filing particulars`, `Six-monthly updates`, `Quarterly progress reports`, `Extension requests`, `Board notices`, `(a)` to `(p)` headings, then `Annex 1` sections numbered 1.0 to 8.0, with tables for logs, budget, KPIs, team and milestones.
- Parse headings and tables only. No AI. Convert the long dates ("6 October 2025") back to ISO.
- **Acceptance test:** parsing each sample .docx produces JSON that deep-equals `data/*.json` after normalising whitespace. If it does not, show the diff on `/dev/verify`.
- If a heading is missing, set `present: false` for that Schedule I item. This is how a plan with missing sections is detected.
- Keep the label "Parsed from heading structure. Works for plans that follow the sample layout." Do not claim it reads arbitrary documents.

PDF parsing is out of scope for the demo.

## 12. Build order and acceptance

Estimate 2 to 3 working days for one developer. Do these in order. Do not start a screen before the previous milestone's tests pass.

| # | Milestone | Done when |
|---|---|---|
| 1 | Next.js scaffold (App Router, static export), tokens, layout shell, role switcher, banner | `next build` produces `out/` and the shell renders from a static server with sidebar, top bar and demo date. Role switch changes the label. No hydration warnings in the console. |
| 2 | Rule engine and unit tests | `A` returns 0, `B` returns 15, `C` returns 1, and all match `answer_key.json`. Boundary tests: filing on exactly 6 months passes; extension on exactly 7 days passes; 1 January and 1 October roll to the 2nd; correction on day 14 passes; update one day late fails. |
| 3 | Onboarding, dashboard, phase tracker | Five-step onboarding reaches the dashboard. Phase gate blocks Audit to Report while correctable findings are open. |
| 4 | Upload, simulated extraction, extraction review with editing | Sample file names are recognised. An unknown file shows the honest message. |
| 5 | Audit results, finding drawer, assign, comment, status, activity log | All 15 findings in B show provision, field and facts. Activity log records each action. |
| 6 | Fix and re-audit | Fixing the ten correctable findings in B clears them. Delta strip shows before and after. Historical items can only be acknowledged, with a comment. |
| 7 | Deadlines and notices | Compliance reviewer logs a notice dated 12 November 2026 on Sample A and sees 10 days remaining on the demo date. B's open timer shows 7 days. |
| 8 | Assistant (scripted) and "Explain this finding" | Ten suggested questions answer with sources. Unmatched text gets the fallback message. |
| 9 | Export (PDF report, JQS-style JSON) and NCDMB view-only summary | PDF opens and includes every section in 6.10. NCDMB role sees disabled controls everywhere. |
| 10 | Polish, offline check, `/dev/verify`, reset | The exported `out/` folder works with the network off when served locally. Reset restores the original state. A page refresh keeps the demo state without a hydration warning. |
| 11 | Stretch parser (section 11) | Acceptance test passes for all three .docx samples. |

### End-to-end test script (Playwright)

1. Complete onboarding as the compliance reviewer. Upload `Sample_A_Compliant.pdf`. Run the audit. Expect **0 findings** and a "No findings" state that says which rules ran.
2. Upload `Sample_B_Defective.pdf`. Expect **15 findings**: 13 defects, 1 advisory, 1 timer.
3. Open finding R3. The drawer shows deadline 3 August 2025, filed 6 October 2025. Acknowledge it with a comment.
4. Assign finding R1 to the co-researcher. Switch to the co-researcher. Add text for (j) and (o). Save and re-audit. R1 clears and the delta strip updates.
5. Fix the remaining correctable findings. Expect 5 acknowledged historical items and no open correctable ones after acknowledging R4 (x2), R6 and R7.
6. Advance the phase from Audit to Report. It is now allowed.
7. On Deadlines, record the deviation correction date as 2026-11-20. The timer closes as met.
8. Export the PDF and the JQS-style JSON. Check the PDF lists the acknowledged historical items and the before and after counts.
9. Switch to NCDMB view-only. Every action button is disabled. The portfolio shows A, B and C.
10. Upload `Sample_C_Edge_Case.pdf`. Expect exactly **1 finding**: update 1, filed one day late.
11. Ask the assistant question 7. The answer cites Reg 22.

### Demo script (about four minutes)

1. 30 seconds: the problem and the banner. 2. 45 seconds: Sample A passes. 3. 90 seconds: upload Sample B, walk the findings and provisions. 4. 60 seconds: assign one, fix it, re-audit, show the delta. 5. 30 seconds: export, then close on the Section 68 exposure from the proposal's illustrative project.

## 13. Out of scope

Real authentication, a backend (including Next.js API routes, server actions and server-side rendering at request time), real AI, extraction from arbitrary documents, expatriate-quota and procurement checks, the official NOGIC JQS schema, mobile layouts, multi-language.

## 14. Open items to confirm before the live demo

- The official JQS schema, if NCDMB shares it. Until then the export stays "illustrative".
- Whether quarterly reports run from the approval date (assumed) or from another start.
- Whether Regulation 12's six-month update is a fixed schedule from approval (assumed) or "at least every six months".
- The Section 68 percentage, from the Act's text, before the proposal or demo states it.
- The full list of Nigerian public holidays, if more than the three in `rules.json` are needed.
