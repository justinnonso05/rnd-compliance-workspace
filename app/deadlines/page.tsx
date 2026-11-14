"use client";

import { useState } from "react";
import { useComplianceStore } from "@/store/useComplianceStore";
import { RoleGuard } from "@/components/RoleGuard";
import { parseISODate, formatISODate, addDays, diffInDays, compareDates } from "@/engine/dates";
import {
  CalendarClock,
  Timer,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
  FileText,
  AlertTriangle,
} from "lucide-react";

export default function DeadlinesPage() {
  const {
    workingPlan,
    demoDate,
    activePersonaId,
    logBoardNotice,
    rectifyBoardNotice,
  } = useComplianceStore();

  const [showLogModal, setShowLogModal] = useState(false);
  const [noticeType, setNoticeType] = useState<"deviation" | "disapproval">("deviation");
  const [noticeDate, setNoticeDate] = useState("2026-11-12");
  const [noticeDesc, setNoticeDesc] = useState("Discrepancy noted in subsea welding inspection logs");
  const [noticeRef, setNoticeRef] = useState("NCDMB/RD/2026/DEV-042");

  const [rectifyIndex, setRectifyIndex] = useState<number | null>(null);
  const [rectifyDateInput, setRectifyDateInput] = useState(demoDate);

  const isComplianceReviewer = activePersonaId === "compliance";

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    logBoardNotice({
      type: noticeType,
      reg: noticeType === "disapproval" ? "Reg 16" : "Reg 17",
      notice_date: noticeDate,
      rectified_date: null,
      description: `${noticeDesc} (Ref: ${noticeRef})`,
    });
    setShowLogModal(false);
  };

  const handleSaveRectification = (index: number) => {
    rectifyBoardNotice(index, rectifyDateInput);
    setRectifyIndex(null);
  };

  const demoTodayObj = parseISODate(demoDate);

  return (
    <div>
      {/* Title */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className="page-title">Statutory Deadlines & Board Notices</h1>
            <p className="text-muted" style={{ marginTop: 2, fontSize: 13 }}>
              Statutory 6-month updates, quarterly reporting schedules, and real 14-day Board notice rectification countdowns.
            </p>
          </div>

          <RoleGuard
            allowedRoles={["compliance"]}
            fallback={
              <span className="badge badge-info" title="Only Compliance Reviewer (Ms. Chioma Eze) can log Board notices">
                Compliance Reviewer Required to Log Notice
              </span>
            }
          >
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowLogModal(true)}
              disabled={!isComplianceReviewer}
              title={
                isComplianceReviewer
                  ? "Log official Board notice"
                  : "Only Compliance Reviewer (Ms. Chioma Eze) can log Board notices"
              }
            >
              <PlusCircle size={14} /> Log Board Notice (Compliance Only)
            </button>
          </RoleGuard>
        </div>

        <p className="text-muted" style={{ fontSize: 12, marginTop: 8, marginBottom: 0, fontStyle: "italic" }}>
          Note: The workspace does not contact NCDMB. Enter the date shown on the official notice.
        </p>
      </div>

      {/* Log Modal */}
      {showLogModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
          }}
        >
          <div
            className="panel"
            style={{ width: 480, maxWidth: "90vw", background: "var(--surface)" }}
          >
            <h2 className="section-heading" style={{ marginBottom: 12 }}>
              Log Official Board Notice
            </h2>
            <form onSubmit={handleCreateNotice}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    Notice Type
                  </label>
                  <select
                    value={noticeType}
                    onChange={(e) => setNoticeType(e.target.value as any)}
                    className="role-select"
                    style={{ width: "100%", padding: "6px 8px" }}
                  >
                    <option value="deviation">Deviation Notice (Regulation 17: 14-day timer)</option>
                    <option value="disapproval">Disapproval Notice (Regulation 16: 14-day timer)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    Official Notice Date
                  </label>
                  <input
                    type="date"
                    value={noticeDate}
                    onChange={(e) => setNoticeDate(e.target.value)}
                    className="mono"
                    style={{ width: "100%", padding: "6px 8px", fontSize: 12 }}
                  />
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    Countdown will start from this date (+14 days deadline).
                  </span>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    Official Letter Reference
                  </label>
                  <input
                    type="text"
                    value={noticeRef}
                    onChange={(e) => setNoticeRef(e.target.value)}
                    style={{ width: "100%", padding: "6px 8px", fontSize: 12 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    Description of Findings / Notice Summary
                  </label>
                  <textarea
                    rows={3}
                    value={noticeDesc}
                    onChange={(e) => setNoticeDesc(e.target.value)}
                    style={{ width: "100%", padding: "6px 8px", fontSize: 12 }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowLogModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Notice & Start Countdown
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 14-Day Board Notices Countdown Panel */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Timer size={18} color="var(--timer)" />
          <h2 className="section-heading" style={{ margin: 0 }}>
            Active Board Notices & 14-Day Remediation Timers
          </h2>
        </div>

        {workingPlan.board_notices.length === 0 ? (
          <div className="empty-state">No Board notices logged for this project.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Notice Date</th>
                <th>14-Day Statutory Deadline</th>
                <th>Timer Status</th>
                <th>Description / Reference</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {workingPlan.board_notices.map((n, idx) => {
                const noticeD = parseISODate(n.notice_date);
                const deadlineD = addDays(noticeD, 14);
                const deadlineStr = formatISODate(deadlineD);

                let statusBadge = <span className="badge badge-timer">Timer Active</span>;
                let daysText = "";

                if (n.rectified_date) {
                  const rectD = parseISODate(n.rectified_date);
                  const met = compareDates(rectD, deadlineD) <= 0;
                  statusBadge = met ? (
                    <span className="badge badge-pass">
                      <CheckCircle2 size={12} /> Resolved ({n.rectified_date})
                    </span>
                  ) : (
                    <span className="badge badge-defect">
                      Rectified Late ({n.rectified_date})
                    </span>
                  );
                } else {
                  const cmp = compareDates(demoTodayObj, deadlineD);
                  if (cmp > 0) {
                    statusBadge = (
                      <span className="badge badge-defect">
                        Overdue ({diffInDays(demoTodayObj, deadlineD)} days late)
                      </span>
                    );
                  } else if (cmp === 0) {
                    statusBadge = <span className="badge badge-defect">Due Today</span>;
                  } else {
                    const daysRemaining = diffInDays(deadlineD, demoTodayObj);
                    statusBadge = (
                      <span className="badge badge-timer">
                        <Timer size={12} /> {daysRemaining} day(s) remaining
                      </span>
                    );
                  }
                }

                return (
                  <tr key={idx}>
                    <td>
                      <span className="badge badge-info" style={{ textTransform: "capitalize" }}>
                        {n.type} ({n.reg})
                      </span>
                    </td>
                    <td className="mono">{n.notice_date}</td>
                    <td className="mono" style={{ fontWeight: 600 }}>
                      {deadlineStr}
                    </td>
                    <td>{statusBadge}</td>
                    <td style={{ fontSize: 12 }}>
                      <div>{n.description}</div>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                        Logged by: {n.logged_by}
                      </span>
                    </td>
                    <td>
                      {!n.rectified_date ? (
                        rectifyIndex === idx ? (
                          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                            <input
                              type="date"
                              value={rectifyDateInput}
                              onChange={(e) => setRectifyDateInput(e.target.value)}
                              className="mono"
                              style={{ padding: "2px 4px", fontSize: 11 }}
                            />
                            <button
                              onClick={() => handleSaveRectification(idx)}
                              className="btn btn-primary btn-sm"
                              style={{ height: 24, padding: "0 6px", fontSize: 11 }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setRectifyIndex(null)}
                              className="btn btn-secondary btn-sm"
                              style={{ height: 24, padding: "0 6px", fontSize: 11 }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <RoleGuard>
                            <button
                              onClick={() => {
                                setRectifyIndex(idx);
                                setRectifyDateInput(demoDate);
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: 11, height: 26 }}
                            >
                              Record Correction
                            </button>
                          </RoleGuard>
                        )
                      ) : (
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Closed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Statutory Recurring Obligations Calendar */}
      <div className="panel">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <CalendarClock size={18} color="var(--green-700)" />
          <h2 className="section-heading" style={{ margin: 0 }}>
            Statutory Recurring Obligations Timeline
          </h2>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Obligation Description</th>
              <th>Statutory Provision</th>
              <th>Cadence</th>
              <th>Next Computed Deadline</th>
              <th>Current Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 600 }}>Approved Plan Six-Monthly Update (Update 1)</td>
              <td>Regulation 12</td>
              <td>Approval date + 6 months</td>
              <td className="mono">2026-05-03</td>
              <td>
                <span className="badge badge-defect">Filed 2026-08-05 (94 days late)</span>
              </td>
            </tr>

            <tr>
              <td style={{ fontWeight: 600 }}>Approved Plan Six-Monthly Update (Update 2)</td>
              <td>Regulation 12</td>
              <td>Approval date + 12 months</td>
              <td className="mono">2026-11-03</td>
              <td>
                <span className="badge badge-defect">Overdue (Not Filed)</span>
              </td>
            </tr>

            <tr>
              <td style={{ fontWeight: 600 }}>Quarterly Progress Report (Q3 2026)</td>
              <td>Regulation 21</td>
              <td>1st working day of Q3</td>
              <td className="mono">2026-07-01</td>
              <td>
                <span className="badge badge-defect">Missing / Not Filed</span>
              </td>
            </tr>

            <tr>
              <td style={{ fontWeight: 600 }}>Quarterly Progress Report (Q4 2026)</td>
              <td>Regulation 21</td>
              <td>1st working day of Q4 (Holiday roll: 2 Oct)</td>
              <td className="mono">2026-10-02</td>
              <td>
                <span className="badge badge-pass">Filed on time (2026-10-02)</span>
              </td>
            </tr>

            <tr>
              <td style={{ fontWeight: 600 }}>Quarterly Progress Report (Q1 2027)</td>
              <td>Regulation 21</td>
              <td>1st working day of Q1 (Holiday roll: 4 Jan)</td>
              <td className="mono">2027-01-04</td>
              <td>
                <span className="badge badge-info">Upcoming</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
