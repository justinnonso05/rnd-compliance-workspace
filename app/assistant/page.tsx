"use client";

import { useState } from "react";
import {
  SCRIPTED_QUESTIONS,
  findAnswerByQuery,
  generateFindingExplanation,
  ScriptedQA,
} from "@/data/assistant";
import { useComplianceStore } from "@/store/useComplianceStore";
import {
  MessageSquareText,
  Search,
  BookOpen,
  Send,
  HelpCircle,
  FileText,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  sources?: string;
  timestamp: string;
}

export default function AssistantPage() {
  const { findings, demoDate } = useComplianceStore();

  const [inputQuery, setInputQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init",
      sender: "assistant",
      text: "Welcome to the R&D Regulatory Assistant. I can answer statutory questions regarding the Nigerian Oil and Gas Research and Development Regulations 2021 (S.I. No. 34 of 2021) and the NCDMB Template.",
      sources: "S.I. No. 34 of 2021",
      timestamp: "09:00",
    },
  ]);

  const [selectedFindingId, setSelectedFindingId] = useState<string>("");

  const handleSendQuestion = (questionText: string) => {
    if (!questionText.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: questionText,
      timestamp: new Date().toTimeString().slice(0, 5),
    };

    const result = findAnswerByQuery(questionText);

    const botMsg: ChatMessage = {
      id: `bot-${Date.now() + 1}`,
      sender: "assistant",
      text: result.answer,
      sources: result.sources,
      timestamp: new Date().toTimeString().slice(0, 5),
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInputQuery("");
  };

  const handleExplainFinding = (findingId: string) => {
    setSelectedFindingId(findingId);
    const target = findings.find((f) => f.id === findingId);
    if (!target) return;

    const exp = generateFindingExplanation(
      target.rule,
      target.facts,
      target.message
    );

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: `Explain finding ${target.id} (${target.rule}: ${target.message})`,
      timestamp: new Date().toTimeString().slice(0, 5),
    };

    const botMsg: ChatMessage = {
      id: `bot-${Date.now() + 1}`,
      sender: "assistant",
      text: exp.explanation,
      sources: exp.provision,
      timestamp: new Date().toTimeString().slice(0, 5),
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  return (
    <div>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MessageSquareText size={22} color="var(--green-600)" />
          <div>
            <h1 className="page-title">Regulatory Legal Assistant</h1>
            <p className="text-muted" style={{ marginTop: 2, fontSize: 13 }}>
              Scripted demo responses. The full platform uses retrieval-augmented AI over the loaded legal texts.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        {/* Chat Conversation Column */}
        <div className="panel" style={{ display: "flex", flexDirection: "column", height: 600 }}>
          {/* Messages list */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              paddingRight: 6,
            }}
          >
            {messages.map((m) => {
              const isUser = m.sender === "user";
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: isUser ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    background: isUser ? "var(--green-700)" : "var(--bg)",
                    color: isUser ? "#fff" : "var(--text)",
                    border: isUser ? "none" : "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: "10px 14px",
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  <div>{m.text}</div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      marginTop: 6,
                      fontSize: 11,
                      opacity: 0.85,
                    }}
                  >
                    {m.sources && (
                      <span
                        className="chip"
                        style={{
                          fontSize: 10,
                          padding: "1px 6px",
                          background: isUser ? "rgba(255,255,255,0.2)" : "var(--surface)",
                          color: isUser ? "#fff" : "var(--text-muted)",
                          border: isUser ? "none" : "1px solid var(--border)",
                        }}
                      >
                        Source: {m.sources}
                      </span>
                    )}
                    <span className="mono" style={{ marginLeft: "auto" }}>
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuestion(inputQuery);
            }}
            style={{
              display: "flex",
              gap: 8,
              marginTop: 12,
              paddingTop: 12,
              borderTop: "1px solid var(--border)",
            }}
          >
            <input
              type="text"
              placeholder="Ask a question about S.I. No. 34 of 2021 or the R&D template..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              style={{
                flex: 1,
                padding: "8px 12px",
                fontSize: 13,
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius)",
              }}
            />
            <button type="submit" className="btn btn-primary">
              <Send size={14} /> Send
            </button>
          </form>
        </div>

        {/* Right Column: Suggested Questions & Explain Finding Shortcut */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Explain Active Finding Tool */}
          <div className="panel">
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <HelpCircle size={16} color="var(--green-700)" />
              <h2 className="section-heading" style={{ margin: 0, fontSize: 14 }}>
                Explain Active Audit Finding
              </h2>
            </div>
            <p className="text-muted" style={{ fontSize: 12, marginBottom: 10 }}>
              Select any finding from the loaded plan to generate an instant legal analysis with cited provisions and computed dates.
            </p>

            <select
              value={selectedFindingId}
              onChange={(e) => handleExplainFinding(e.target.value)}
              className="role-select"
              style={{ width: "100%", padding: "6px 8px", fontSize: 12 }}
            >
              <option value="">Select a finding to explain...</option>
              {findings.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.id}: {f.rule} ({f.provision}) — {f.message.slice(0, 36)}...
                </option>
              ))}
            </select>
          </div>

          {/* 10 Suggested Question Chips */}
          <div className="panel" style={{ flex: 1, overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <BookOpen size={16} color="var(--green-700)" />
              <h2 className="section-heading" style={{ margin: 0, fontSize: 14 }}>
                Suggested Regulatory Inquiries
              </h2>
            </div>
            <p className="text-muted" style={{ fontSize: 12, marginBottom: 10 }}>
              Verified official answers from S.I. No. 34 of 2021:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {SCRIPTED_QUESTIONS.map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleSendQuestion(q.question)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    textAlign: "left",
                    justifyContent: "flex-start",
                    height: "auto",
                    padding: "8px 10px",
                    lineHeight: 1.4,
                    whiteSpace: "normal",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>{q.question}</div>
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                      Cites: {q.sources}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
