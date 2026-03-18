"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import type { Message } from "@/lib/types";
import { Send, Mic, Brain, Zap, Target, BookOpen } from "lucide-react";

export default function CoachPage() {
  const router = useRouter();
  const store  = useAppStore();
  const masterPlan       = store.masterPlan;
  const studentProfile   = store.studentProfile;
  const isOnboarded      = store.isOnboarded;
  const habitCompletions = store.habitCompletions;

  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [isMobile, setIsMobile]       = useState(false);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isOnboarded || !studentProfile) { router.push("/onboarding"); return; }
    if (!masterPlan) { router.push("/generating"); return; }
    if (!initialized) {
      setInitialized(true);
      const first = studentProfile.name.split(" ")[0];
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: `Hey ${first} — I've been waiting for you.\n\nI know your plan, your habits, where you're struggling, and what you're aiming for. This isn't a generic chatbot — think of me as the coach who actually knows your situation.\n\nWhat's on your mind today?`,
        timestamp: new Date().toISOString(),
      }]);
    }
  }, [isOnboarded, studentProfile, masterPlan, router, initialized]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`;
  }, [input]);

  const getHabitsSummary = () => {
    if (!masterPlan) return "";
    const daily = masterPlan.habitSystem.filter((h) => h.frequency === "daily");
    const done  = daily.filter((h) => habitCompletions[h.id]);
    return `${done.length}/${daily.length} habits completed today`;
  };

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || isStreaming || !masterPlan || !studentProfile) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content, timestamp: new Date().toISOString() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsStreaming(true);

    const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: "", timestamp: new Date().toISOString() };
    setMessages([...updated, assistantMsg]);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated, profile: studentProfile, plan: masterPlan, habitsSummary: getHabitsSummary() }),
      });

      if (!res.body) throw new Error("No response body");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = "";
      let fullText  = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") break;
          try {
            const data = JSON.parse(raw);
            if (data.text) {
              fullText += data.text;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { ...copy[copy.length - 1], content: fullText };
                return copy;
              });
            }
          } catch { /* skip */ }
        }
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { ...copy[copy.length - 1], content: "Something went wrong. Please try again." };
        return copy;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const suggestions = [
    "How should I study today?",
    "I've been feeling unmotivated",
    "Help me beat procrastination",
    "Review my weak subjects",
  ];

  const userMessageCount = messages.filter((m) => m.role === "user").length;

  if (!masterPlan || !studentProfile) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, border: "3px solid var(--bg-overlay)", borderTop: "3px solid var(--brand-primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  const insightChips = [
    { icon: BookOpen, label: "Learning Style", value: masterPlan.strategy.primaryStudyMethod, color: "var(--brand-primary)" },
    { icon: Target,   label: "Goal",            value: studentProfile.primaryGoal,             color: "#FF6B35" },
    { icon: Zap,      label: "Technique",        value: masterPlan.strategy.secondaryMethod,    color: "#A855F7" },
  ];

  return (
    <>
      <style>{`
        .coach-msg-bubble { animation: message-up 0.3s ease both; }
        .coach-typing-dot { animation: typing-dot 1.2s ease-in-out infinite; }
        .coach-suggestion {
          padding: 8px 16px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          color: var(--text-secondary);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: var(--font-body);
          white-space: nowrap;
        }
        .coach-suggestion:hover {
          border-color: var(--border-emphasis);
          color: var(--brand-primary);
          background: var(--brand-glow);
        }
        .coach-orb {
          width: 48px; height: 48px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, var(--brand-primary), var(--accent-focus), var(--brand-primary));
          animation: spin 6s linear infinite;
          position: relative;
        }
        .coach-orb::after {
          content: '';
          position: absolute;
          inset: 4px;
          border-radius: 50%;
          background: var(--bg-elevated);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .coach-pulse {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px solid rgba(124,92,252,0.3);
          animation: pulse-ring 2.5s ease-out infinite;
        }
      `}</style>

      {/* Ambient bg */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "5%", right: "10%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,92,252,0.06) 0%, transparent 70%)", animation: "float 14s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "15%", left: "5%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 70%)", animation: "float 18s ease-in-out infinite reverse" }} />
      </div>

      <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", flexDirection: isMobile ? "column" : "row", position: "relative", zIndex: 1 }}>

        {/* ── LEFT: Chat pane ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

          {/* Header */}
          <div className="stagger-1" style={{ padding: isMobile ? "var(--space-6) var(--space-4) 0" : "var(--space-8) var(--space-8) 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", marginBottom: "var(--space-2)" }}>
              {/* Animated orb avatar */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "var(--radius-md)",
                  background: "linear-gradient(135deg, var(--brand-primary), var(--accent-focus))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Brain size={22} color="#fff" />
                </div>
                <div style={{
                  position: "absolute", inset: -4, borderRadius: "var(--radius-lg)",
                  border: "2px solid rgba(124,92,252,0.4)",
                  animation: "pulse-ring 2.5s ease-out infinite",
                  pointerEvents: "none",
                }} />
              </div>
              <div>
                <h1 className="text-h1" style={{ color: "var(--text-primary)", margin: 0 }}>Your Coach</h1>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 6px rgba(34,197,94,0.6)" }} />
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Online · knows your full plan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            padding: isMobile ? "var(--space-5) var(--space-4) 180px" : "var(--space-6) var(--space-8) 180px",
            display: "flex", flexDirection: "column", gap: "var(--space-4)", overflowY: "auto",
          }}>
            {messages.map((msg, i) => (
              <div
                key={msg.id}
                className="coach-msg-bubble"
                style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}
              >
                {msg.role === "assistant" && (
                  <div style={{
                    width: 28, height: 28, borderRadius: "var(--radius-md)",
                    background: "linear-gradient(135deg, var(--brand-primary), var(--accent-focus))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginRight: "var(--space-2)", marginTop: 2,
                  }}>
                    <Brain size={14} color="#fff" />
                  </div>
                )}
                <div style={{
                  maxWidth: "75%",
                  padding: "var(--space-3) var(--space-4)",
                  borderRadius: msg.role === "user" ? "var(--radius-xl) var(--radius-xl) var(--radius-sm) var(--radius-xl)" : "var(--radius-xl) var(--radius-xl) var(--radius-xl) var(--radius-sm)",
                  background: msg.role === "user"
                    ? "var(--brand-primary)"
                    : "var(--bg-elevated)",
                  border: msg.role === "user" ? "none" : "1px solid var(--border-default)",
                  color: "var(--text-primary)",
                  fontSize: "0.9375rem",
                  lineHeight: 1.65,
                  whiteSpace: "pre-wrap",
                  fontFamily: "var(--font-body)",
                }}>
                  {msg.content || (isStreaming && i === messages.length - 1
                    ? <TypingIndicator />
                    : ""
                  )}
                  {isStreaming && i === messages.length - 1 && msg.content && (
                    <span style={{ display: "inline-block", width: 2, height: "1em", background: "var(--brand-primary)", marginLeft: 2, verticalAlign: "text-bottom", animation: "blink 1s infinite" }} />
                  )}
                </div>
              </div>
            ))}

            {/* Suggestion pills */}
            {userMessageCount === 0 && (
              <div className="stagger-2" style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", paddingLeft: isMobile ? 0 : 36 }}>
                {suggestions.map((s) => (
                  <button key={s} type="button" className="coach-suggestion" onClick={() => setInput(s)}>{s}</button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Fixed input bar */}
          <div style={{
            position: "fixed",
            bottom: 0,
            left: isMobile ? 0 : 240,
            right: isMobile ? 0 : 320,
            background: "rgba(8,11,20,0.95)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderTop: "1px solid var(--border-subtle)",
            padding: "var(--space-3) var(--space-5) var(--space-5)",
            zIndex: 20,
          }}>
            <div style={{
              display: "flex", gap: "var(--space-2)", alignItems: "flex-end",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-xl)",
              padding: "var(--space-3) var(--space-4)",
              transition: "border-color 0.2s",
            }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your coach anything…"
                rows={1}
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  color: "var(--text-primary)", fontSize: "0.9375rem", resize: "none",
                  fontFamily: "var(--font-body)", lineHeight: 1.5,
                  maxHeight: 140, overflowY: "auto", paddingTop: 2,
                }}
              />
              <div style={{ display: "flex", gap: "var(--space-2)", flexShrink: 0 }}>
                <button type="button" style={{
                  width: 36, height: 36, borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-overlay)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "var(--text-tertiary)",
                }}>
                  <Mic size={16} />
                </button>
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={isStreaming || !input.trim()}
                  style={{
                    width: 36, height: 36, borderRadius: "var(--radius-md)",
                    border: "none",
                    background: isStreaming || !input.trim()
                      ? "var(--bg-overlay)"
                      : "var(--brand-primary)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: isStreaming || !input.trim() ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    opacity: isStreaming || !input.trim() ? 0.5 : 1,
                  }}
                >
                  <Send size={15} color="#fff" />
                </button>
              </div>
            </div>
            <p className="text-label" style={{ color: "var(--text-tertiary)", textAlign: "center", margin: "var(--space-2) 0 0" }}>
              Your coach knows your full plan · Shift+Enter for new line
            </p>
          </div>
        </div>

        {/* ── RIGHT: Coach profile pane ── */}
        {!isMobile && (
          <div style={{
            width: 320, flexShrink: 0,
            background: "var(--bg-surface)",
            borderLeft: "1px solid var(--border-subtle)",
            padding: "var(--space-8) var(--space-6)",
            overflowY: "auto",
            position: "sticky", top: 0, height: "100vh",
          }}>

            {/* Animated orb */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--space-6)" }}>
              <div style={{ position: "relative", width: 80, height: 80 }}>
                <div style={{
                  width: "100%", height: "100%", borderRadius: "50%",
                  background: "conic-gradient(from 0deg, var(--brand-primary) 0%, var(--accent-focus) 40%, var(--brand-primary) 100%)",
                  animation: "spin 8s linear infinite",
                }} />
                <div style={{
                  position: "absolute", inset: 6, borderRadius: "50%",
                  background: "var(--bg-surface)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Brain size={28} color="var(--brand-primary)" />
                </div>
                <div style={{
                  position: "absolute", inset: -8, borderRadius: "50%",
                  border: "2px solid rgba(124,92,252,0.2)",
                  animation: "pulse-ring 3s ease-out infinite",
                  pointerEvents: "none",
                }} />
              </div>
            </div>

            <h2 className="text-h1" style={{ color: "var(--text-primary)", textAlign: "center", marginBottom: "var(--space-3)" }}>
              Your AI Study Coach
            </h2>
            <p className="text-body" style={{ color: "var(--text-secondary)", textAlign: "center", marginBottom: "var(--space-8)" }}>
              I&apos;ve analysed your goals, schedule, habits, and blockers. Every response is personalised to your exact situation.
            </p>

            {/* Insight chips */}
            <div>
              <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: "var(--space-3)" }}>Insights</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {insightChips.map((chip) => {
                  const Icon = chip.icon;
                  return (
                    <div key={chip.label} className="card-metric">
                      <div style={{
                        width: 32, height: 32, borderRadius: "var(--radius-sm)",
                        background: `${chip.color}18`, border: `1px solid ${chip.color}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Icon size={15} color={chip.color} />
                      </div>
                      <div>
                        <div className="text-label" style={{ color: "var(--text-tertiary)" }}>{chip.label}</div>
                        <div className="text-sm" style={{ color: "var(--text-primary)", fontWeight: 500, marginTop: 2 }}>{chip.value}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Key insight */}
            {masterPlan.diagnosis.keyInsight && (
              <div style={{ marginTop: "var(--space-8)" }}>
                <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: "var(--space-3)" }}>Key Insight</div>
                <div className="card-elevated" style={{ padding: "var(--space-5)" }}>
                  <p className="text-sm" style={{ color: "var(--text-primary)", margin: 0, lineHeight: 1.7, fontStyle: "italic" }}>
                    &ldquo;{masterPlan.diagnosis.keyInsight}&rdquo;
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "4px 0" }}>
      {[0, 0.15, 0.3].map((delay, i) => (
        <span key={i} style={{
          display: "inline-block", width: 7, height: 7,
          borderRadius: "50%", background: "var(--text-tertiary)",
          animation: `typing-dot 1.2s ${delay}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}
