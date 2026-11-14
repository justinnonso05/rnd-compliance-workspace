import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Extracted, Finding, FindingStatus, BoardNoticeItem } from "@/engine/types";
import { check } from "@/engine/index";
import sampleAData from "@/public/samples/data/Sample_A_Compliant.json";
import sampleBData from "@/public/samples/data/Sample_B_Defective.json";
import sampleCData from "@/public/samples/data/Sample_C_Edge_Case.json";

export type ProjectPhase = "Formulate" | "Plan" | "Conduct" | "Audit" | "Report";

export interface ActivityEvent {
  id: string;
  timestamp: string; // e.g. "2026-11-16 14:32:00"
  by: string;
  action: string;
  details: string;
}

export interface PersonaInfo {
  id: string;
  name: string;
  role: string;
  initials: string;
}

export const PERSONAS: PersonaInfo[] = [
  {
    id: "lead",
    name: "Dr. Ada Okeke-Sample",
    role: "Lead researcher",
    initials: "AO",
  },
  {
    id: "co_researcher",
    name: "Engr. Musa Bello-Sample",
    role: "Co-researcher",
    initials: "MB",
  },
  {
    id: "compliance",
    name: "Ms. Chioma Eze-Sample",
    role: "Compliance reviewer",
    initials: "CE",
  },
  {
    id: "ncdmb",
    name: "NCDMB Analyst",
    role: "NCDMB view-only",
    initials: "NA",
  },
];

export const ROLE_ALLOWED_ROUTES: Record<string, string[]> = {
  ncdmb: ["/ncdmb", "/audit", "/deadlines", "/assistant"],
  lead: [
    "/",
    "/documents",
    "/documents/extract",
    "/audit",
    "/fix",
    "/assistant",
    "/team",
    "/deadlines",
    "/export",
    "/settings",
    "/dev/verify",
  ],
  co_researcher: [
    "/",
    "/documents",
    "/documents/extract",
    "/audit",
    "/fix",
    "/assistant",
    "/team",
    "/deadlines",
  ],
  compliance: [
    "/",
    "/documents",
    "/documents/extract",
    "/audit",
    "/fix",
    "/assistant",
    "/team",
    "/deadlines",
    "/export",
    "/settings",
    "/dev/verify",
  ],
};

const INITIAL_SAMPLES: Record<"A" | "B" | "C", Extracted> = {
  A: sampleAData as unknown as Extracted,
  B: sampleBData as unknown as Extracted,
  C: sampleCData as unknown as Extracted,
};

let activitySeq = 0;
export function generateActivityId(): string {
  activitySeq++;
  return `act-${Date.now()}-${activitySeq}-${Math.random().toString(36).slice(2, 8)}`;
}

function getDemoTimestamp(demoDate: string): string {
  const now = new Date();
  const timeStr = now.toTimeString().split(" ")[0]; // HH:mm:ss
  return `${demoDate} ${timeStr}`;
}

export interface ComplianceState {
  activeSampleId: "A" | "B" | "C";
  demoDate: string;
  activePersonaId: string;
  workingPlan: Extracted;
  findings: Finding[];
  baselineCount: number | null; // For "Before: X, After: Y" delta
  currentPhase: ProjectPhase;
  activityLog: ActivityEvent[];
  isHydrated: boolean;

  // Actions
  setHydrated: () => void;
  setActiveSample: (id: "A" | "B" | "C") => void;
  setActivePersona: (id: string) => void;
  setDemoDate: (date: string) => void;
  updateField: (path: string, value: any) => void;
  runAudit: () => void;
  updateFindingStatus: (id: string, status: FindingStatus) => void;
  assignFinding: (id: string, assignee: string) => void;
  addFindingComment: (id: string, text: string) => void;
  logBoardNotice: (notice: Omit<BoardNoticeItem, "logged_by">) => void;
  rectifyBoardNotice: (index: number, rectifiedDate: string) => void;
  advancePhase: () => { success: boolean; reason?: string };
  resetDemo: () => void;
}

export const useComplianceStore = create<ComplianceState>()(
  persist(
    (set, get) => {
      const initialSample = INITIAL_SAMPLES.B;
      const initialFindings = check(initialSample, initialSample.demo_today);

      return {
        activeSampleId: "B",
        demoDate: "2026-11-16",
        activePersonaId: "lead",
        workingPlan: JSON.parse(JSON.stringify(initialSample)),
        findings: initialFindings,
        baselineCount: initialFindings.length,
        currentPhase: "Audit",
        activityLog: [
          {
            id: "act-init-1",
            timestamp: "2026-11-16 09:00:00",
            by: "Dr. Ada Okeke-Sample",
            action: "Initialized Workspace",
            details: "Loaded sample plan Sample_B_Defective.pdf",
          },
          {
            id: "act-init-2",
            timestamp: "2026-11-16 09:05:00",
            by: "System",
            action: "Initial Pre-Audit Run",
            details: `Automated rule engine detected ${initialFindings.length} findings`,
          },
        ],
        isHydrated: false,

        setHydrated: () => {
          const log = get().activityLog || [];
          const seen = new Set<string>();
          const dedupedLog = log.map((item, idx) => {
            if (!item.id || seen.has(item.id)) {
              const uniqueId = `act-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`;
              seen.add(uniqueId);
              return { ...item, id: uniqueId };
            }
            seen.add(item.id);
            return item;
          });
          set({ activityLog: dedupedLog, isHydrated: true });
        },

        setActiveSample: (id: "A" | "B" | "C") => {
          const sample = INITIAL_SAMPLES[id];
          const newFindings = check(sample, get().demoDate);
          const persona = PERSONAS.find((p) => p.id === get().activePersonaId);
          const userName = persona ? persona.name : "Operator";

          set({
            activeSampleId: id,
            workingPlan: JSON.parse(JSON.stringify(sample)),
            findings: newFindings,
            baselineCount: newFindings.length,
            currentPhase: "Audit",
            activityLog: [
              ...get().activityLog,
              {
                id: generateActivityId(),
                timestamp: getDemoTimestamp(get().demoDate),
                by: userName,
                action: "Switched Sample",
                details: `Switched active plan to Sample ${id} (${sample.label})`,
              },
            ],
          });
        },

        setActivePersona: (id: string) => {
          set({ activePersonaId: id });
        },

        setDemoDate: (date: string) => {
          const updatedFindings = check(get().workingPlan, date);
          set({
            demoDate: date,
            findings: updatedFindings,
          });
        },

        updateField: (path: string, value: any) => {
          const plan = JSON.parse(JSON.stringify(get().workingPlan)) as Extracted;
          const parts = path.split(".");

          let current: any = plan;
          for (let i = 0; i < parts.length - 1; i++) {
            if (current[parts[i]] === undefined) {
              current[parts[i]] = {};
            }
            current = current[parts[i]];
          }
          current[parts[parts.length - 1]] = value;

          const persona = PERSONAS.find((p) => p.id === get().activePersonaId);
          const userName = persona ? persona.name : "Operator";

          set({
            workingPlan: plan,
            activityLog: [
              ...get().activityLog,
              {
                id: generateActivityId(),
                timestamp: getDemoTimestamp(get().demoDate),
                by: userName,
                action: "Edited Field",
                details: `Updated field ${path}`,
              },
            ],
          });
        },

        runAudit: () => {
          const prevCount = get().findings.filter((f) => f.status === "open").length;
          const newFindings = check(get().workingPlan, get().demoDate);

          // Preserve statuses, assignees, and comments of existing findings by rule/field
          const existingMap = new Map(get().findings.map((f) => [f.rule + "_" + f.field, f]));
          const mergedFindings = newFindings.map((nf) => {
            const key = nf.rule + "_" + nf.field;
            const existing = existingMap.get(key);
            if (existing) {
              return {
                ...nf,
                status: existing.status,
                assignee: existing.assignee,
                comments: existing.comments,
              };
            }
            return nf;
          });

          const persona = PERSONAS.find((p) => p.id === get().activePersonaId);
          const userName = persona ? persona.name : "Operator";

          set({
            findings: mergedFindings,
            baselineCount: get().baselineCount === null ? prevCount : get().baselineCount,
            activityLog: [
              ...get().activityLog,
              {
                id: generateActivityId(),
                timestamp: getDemoTimestamp(get().demoDate),
                by: userName,
                action: "Ran Compliance Audit",
                details: `Rule engine ran. Active findings: ${mergedFindings.length}`,
              },
            ],
          });
        },

        updateFindingStatus: (id: string, status: FindingStatus) => {
          const updated = get().findings.map((f) =>
            f.id === id ? { ...f, status } : f
          );
          const persona = PERSONAS.find((p) => p.id === get().activePersonaId);
          const userName = persona ? persona.name : "Operator";

          set({
            findings: updated,
            activityLog: [
              ...get().activityLog,
              {
                id: generateActivityId(),
                timestamp: getDemoTimestamp(get().demoDate),
                by: userName,
                action: "Status Changed",
                details: `Finding ${id} marked as ${status}`,
              },
            ],
          });
        },

        assignFinding: (id: string, assignee: string) => {
          const updated = get().findings.map((f) =>
            f.id === id ? { ...f, assignee } : f
          );
          const persona = PERSONAS.find((p) => p.id === get().activePersonaId);
          const userName = persona ? persona.name : "Operator";

          set({
            findings: updated,
            activityLog: [
              ...get().activityLog,
              {
                id: generateActivityId(),
                timestamp: getDemoTimestamp(get().demoDate),
                by: userName,
                action: "Assigned Finding",
                details: `Assigned finding ${id} to ${assignee}`,
              },
            ],
          });
        },

        addFindingComment: (id: string, text: string) => {
          const persona = PERSONAS.find((p) => p.id === get().activePersonaId);
          const userName = persona ? persona.name : "Operator";
          const timestamp = getDemoTimestamp(get().demoDate);

          const updated = get().findings.map((f) => {
            if (f.id === id) {
              return {
                ...f,
                comments: [...f.comments, { by: userName, at: timestamp, text }],
              };
            }
            return f;
          });

          set({
            findings: updated,
            activityLog: [
              ...get().activityLog,
              {
                id: generateActivityId(),
                timestamp,
                by: userName,
                action: "Comment Added",
                details: `Commented on finding ${id}: "${text.slice(0, 40)}${text.length > 40 ? "..." : ""}"`,
              },
            ],
          });
        },

        logBoardNotice: (notice: Omit<BoardNoticeItem, "logged_by">) => {
          const persona = PERSONAS.find((p) => p.id === get().activePersonaId);
          const userName = persona ? persona.name : "Ms. Chioma Eze-Sample";

          const newNotice: BoardNoticeItem = {
            ...notice,
            logged_by: userName,
          };

          const plan = JSON.parse(JSON.stringify(get().workingPlan)) as Extracted;
          plan.board_notices.push(newNotice);

          const newFindings = check(plan, get().demoDate);

          set({
            workingPlan: plan,
            findings: newFindings,
            activityLog: [
              ...get().activityLog,
              {
                id: generateActivityId(),
                timestamp: getDemoTimestamp(get().demoDate),
                by: userName,
                action: "Logged Board Notice",
                details: `${notice.type === "disapproval" ? "Disapproval (Reg 16)" : "Deviation (Reg 17)"} dated ${notice.notice_date}`,
              },
            ],
          });
        },

        rectifyBoardNotice: (index: number, rectifiedDate: string) => {
          const plan = JSON.parse(JSON.stringify(get().workingPlan)) as Extracted;
          if (plan.board_notices[index]) {
            plan.board_notices[index].rectified_date = rectifiedDate;
          }

          const persona = PERSONAS.find((p) => p.id === get().activePersonaId);
          const userName = persona ? persona.name : "Operator";
          const newFindings = check(plan, get().demoDate);

          set({
            workingPlan: plan,
            findings: newFindings,
            activityLog: [
              ...get().activityLog,
              {
                id: generateActivityId(),
                timestamp: getDemoTimestamp(get().demoDate),
                by: userName,
                action: "Notice Rectified",
                details: `Notice #${index + 1} rectified on ${rectifiedDate}`,
              },
            ],
          });
        },

        advancePhase: () => {
          const persona = PERSONAS.find((p) => p.id === get().activePersonaId);
          if (get().activePersonaId !== "lead") {
            return {
              success: false,
              reason: `Permission denied: Advancing project phases is restricted to the Lead Researcher (${PERSONAS[0].name}).`,
            };
          }

          const phases: ProjectPhase[] = ["Formulate", "Plan", "Conduct", "Audit", "Report"];
          const currentIdx = phases.indexOf(get().currentPhase);

          if (currentIdx === phases.length - 1) {
            return { success: false, reason: "Already at the final phase (Report)." };
          }

          const nextPhase = phases[currentIdx + 1];

          // Phase Gate check: Advancing from Audit to Report requires zero open correctable findings!
          if (get().currentPhase === "Audit" && nextPhase === "Report") {
            const openCorrectable = get().findings.filter(
              (f) => f.correctable && f.status !== "resolved"
            );
            if (openCorrectable.length > 0) {
              return {
                success: false,
                reason: `Cannot advance to Report: ${openCorrectable.length} correctable finding(s) are still open. Resolve or fix them first.`,
              };
            }
          }

          const userName = persona ? persona.name : "Dr. Ada Okeke-Sample";

          set({
            currentPhase: nextPhase,
            activityLog: [
              ...get().activityLog,
              {
                id: generateActivityId(),
                timestamp: getDemoTimestamp(get().demoDate),
                by: userName,
                action: "Advanced Phase",
                details: `Project phase advanced to ${nextPhase}`,
              },
            ],
          });

          return { success: true };
        },

        resetDemo: () => {
          const sample = INITIAL_SAMPLES.B;
          const initialFindings = check(sample, "2026-11-16");
          set({
            activeSampleId: "B",
            demoDate: "2026-11-16",
            activePersonaId: "lead",
            workingPlan: JSON.parse(JSON.stringify(sample)),
            findings: initialFindings,
            baselineCount: initialFindings.length,
            currentPhase: "Audit",
            activityLog: [
              {
                id: generateActivityId(),
                timestamp: "2026-11-16 09:00:00",
                by: "Dr. Ada Okeke-Sample",
                action: "Reset Demo Data",
                details: "Restored Sample B to pristine baseline state",
              },
            ],
          });
        },
      };
    },
    {
      name: "rdw-demo-v2",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
