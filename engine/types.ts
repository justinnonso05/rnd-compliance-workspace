export type Severity = "defect" | "advisory" | "timer" | "info";
export type FindingStatus = "open" | "in_progress" | "resolved" | "acknowledged";

export type ScheduleIKey =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p";

export interface BudgetItem {
  code: string;
  label: string;
  amount: number;
}

export interface KPIItem {
  activity: string;
  indicator: string;
}

export interface TeamMember {
  name: string;
  role: string;
}

export interface SteeringTeam {
  ncdmb: boolean;
  company: boolean;
  research_center: boolean;
}

export interface ProjectData {
  title: string;
  focus_area: string;
  keywords: string[];
  goals_and_objectives: string;
  start: string;
  end: string;
  principal_investigator: TeamMember | null;
  team: TeamMember[];
  budget_items: BudgetItem[];
  budget_stated_total: number;
  activities: string[];
  kpis: KPIItem[];
  steering_team: SteeringTeam;
  plagiarism_statement_signed: boolean;
}

export interface ExpenditureRow {
  year: number;
  i1: number;
  i2: number;
}

export interface PlannedExpenditure {
  rows: ExpenditureRow[];
  stated_total: number;
}

export interface FilingData {
  nc_plan_submitted: string;
  rd_plan_filed: string;
  board_approved: string;
  plan_start: string;
  plan_end: string;
}

export interface UpdateItem {
  n: number;
  date: string;
}

export interface QuarterlyReportItem {
  quarter_start: string;
  filed: string;
}

export interface ExtensionRequestItem {
  applies_to: string;
  due_date: string;
  request_date: string;
  granted_until: string | null;
}

export interface BoardNoticeItem {
  type: "deviation" | "disapproval";
  reg: string;
  notice_date: string;
  rectified_date: string | null;
  logged_by: string;
  description: string;
}

export interface Extracted {
  sample_id: "A" | "B" | "C";
  synthetic: true;
  label: string;
  demo_today: string;
  operator: string;
  filing: FilingData;
  schedule_I: Record<ScheduleIKey, { present: boolean; text: string | null }>;
  expected_outcome_text: string;
  planned_expenditure: PlannedExpenditure;
  updates: UpdateItem[];
  quarterly_reports: QuarterlyReportItem[];
  extension_requests: ExtensionRequestItem[];
  board_notices: BoardNoticeItem[];
  prior_outstanding_obligations: boolean;
  project: ProjectData;
}

export interface Comment {
  by: string;
  at: string;
  text: string;
}

export interface Finding {
  id: string; // e.g. "B-01"
  rule: string; // "R1", "T1", "BUD", etc.
  provision: string; // "Reg 10", "Schedule I(a)"
  severity: Severity;
  message: string; // raw engine message, exact string match for tests
  field: string; // JSON path of the main field for editor link
  where?: string;
  must_show?: boolean;
  facts: Record<string, string | number | boolean>;
  correctable: boolean;
  status: FindingStatus;
  assignee?: string;
  comments: Comment[];
}
