"use client";

import { useState } from "react";
import Link from "next/link";
import { useComplianceStore } from "@/store/useComplianceStore";
import {
  Settings,
  RotateCcw,
  Calendar,
  Layers,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export default function SettingsPage() {
  const {
    demoDate,
    setDemoDate,
    activeSampleId,
    setActiveSample,
    resetDemo,
  } = useComplianceStore();

  const [dateInput, setDateInput] = useState(demoDate);
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  const handleUpdateDate = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoDate(dateInput);
    setResetNotice(`Demo clock updated to ${dateInput}. Engine timers recalculated.`);
    setTimeout(() => setResetNotice(null), 3000);
  };

  const handleResetData = () => {
    if (confirm("Reset demo data to original baseline state? All custom edits will be reverted.")) {
      resetDemo();
      setDateInput("2026-11-16");
      setResetNotice("Demo workspace restored to pristine Sample B baseline state.");
      setTimeout(() => setResetNotice(null), 3000);
    }
  };

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <h1 className="page-title">Settings & Demo Controls</h1>
        <p className="text-muted" style={{ marginTop: 2, fontSize: 13 }}>
          Configure fixed simulation parameters, demo clocks, active synthetic datasets, and data resets.
        </p>
      </div>

      {resetNotice && (
        <div
          style={{
            background: "var(--green-100)",
            border: "1px solid var(--green-200)",
            color: "var(--green-950)",
            padding: "10px 16px",
            borderRadius: "var(--radius)",
            marginBottom: 16,
            fontWeight: 600,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CheckCircle2 size={16} color="var(--green-600)" />
          <span>{resetNotice}</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Simulation Date Controls */}
        <div className="panel">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Calendar size={18} color="var(--timer)" />
            <h2 className="section-heading" style={{ margin: 0 }}>
              Fixed Demo Date & Countdown Timers
            </h2>
          </div>
          <p className="text-muted" style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 14 }}>
            The prototype calculates statutory 6-month updates, quarterly reporting deadlines, and 14-day
            rectification countdowns relative to this simulated date (default: <strong>2026-11-16</strong>).
          </p>

          <form onSubmit={handleUpdateDate} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="mono"
              style={{
                padding: "6px 10px",
                fontSize: 13,
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius)",
              }}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Apply Date
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setDateInput("2026-11-16");
                setDemoDate("2026-11-16");
              }}
            >
              Reset to 2026-11-16
            </button>
          </form>
        </div>

        {/* Dataset Switcher & Reset */}
        <div className="panel">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Layers size={18} color="var(--green-700)" />
            <h2 className="section-heading" style={{ margin: 0 }}>
              Active Synthetic Dataset
            </h2>
          </div>
          <p className="text-muted" style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 14 }}>
            Switch the active R&D plan loaded in memory:
          </p>

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {(["A", "B", "C"] as const).map((id) => (
              <button
                key={id}
                onClick={() => setActiveSample(id)}
                className={`btn btn-sm ${activeSampleId === id ? "btn-primary" : "btn-secondary"}`}
              >
                Sample {id} {id === "A" ? "(Compliant)" : id === "B" ? "(Defective)" : "(Edge Case)"}
              </button>
            ))}
          </div>

          <div style={{ paddingTop: 14, borderTop: "1px solid var(--border)" }}>
            <button
              onClick={handleResetData}
              className="btn btn-secondary btn-sm"
              style={{ color: "var(--defect)", borderColor: "var(--defect)" }}
            >
              <RotateCcw size={14} /> Reset Demo Data (Revert to pristine Sample B)
            </button>
          </div>
        </div>
      </div>

      {/* Developer Test Harness Link */}
      <div className="panel" style={{ marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Developer Verification Suite</div>
            <p className="text-muted" style={{ fontSize: 12, margin: "2px 0 0" }}>
              Internal automated harness checking the live rule engine against the answer key for Samples A, B, and C.
            </p>
          </div>
          <Link href="/dev/verify" className="btn btn-secondary btn-sm">
            <ExternalLink size={14} /> Open /dev/verify
          </Link>
        </div>
      </div>
    </div>
  );
}
