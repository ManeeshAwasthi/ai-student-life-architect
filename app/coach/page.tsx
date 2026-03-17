"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import type { Message } from "@/lib/types";

export default function CoachPage() {
  const router = useRouter();
  const store = useAppStore();
  const masterPlan     = store.masterPlan;
  const studentProfile = store.studentProfile;
  const isOnboarded    = store.isOnboarded;
  const habitCompletions = store.habitCompletions;

  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [isMobile, setIsMobile]     = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
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
        content: `Hey ${first} 👋 — I've been waiting for you.\n\nI know your plan, your habits, where you're struggling, and what you're aiming for. This isn't a generic chatbot — think of me as the coach who actually knows your situation.\n\nWhat's on your mind today?`,
        timestamp: new Date().toISOString(),
      }]);
    }
  }, [isOnboarded, studentProfile, masterPlan, router, initialized]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
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
          } catch { /* skip malformed */ }
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
    "I've been feeling really unmotivated",
    "Help me beat procrastination",
    "Review my weak subjects",
  ];

  const userMessageCount = messages.filter((m) => m.role === "user").length;

  if (!masterPlan || !studentProfile) {
    return (
      <div style={{ minHeight: "100vh", background: "#080810", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "36px", height: "36px", border: "3px solid #1e1e35", borderTop: "3px solid #6c63ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  return (
    <>
      <style>{`
        .coach-msg-bubble { animation: message-up 0.3s ease both; }
        .coach-typing-dot { animation: typing-dot 1.2s ease-in-out infinite; }
        .coach-suggestion {
          padding: 8px 16px;
          background: #12121e;
          border: 1px solid #1e1e35;
          border-radius: 999px;
          color: #8888aa;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }
        .coach-suggestion:hover {
          border-color: rgba(255,107,157,0.35);
          color: #ff6b9d;
          background: rgba(255,107,157,0.06);
        }
        .coach-send-btn {
          width: 40px; height: 40px;
          border-radius: 11px;
          border: none;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .coach-send-btn:hover:not(:disabled) { transform: scale(1.05); }
        .coach-send-btn:active:not(:disabled) { transform: scale(0.95); }
        .coach-send-btn:disabled { cursor: not-allowed; opacity: 0.5; }
      `}</style>

      {/* Ambient bg */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "5%", right: "10%", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,157,0.06) 0%, transparent 70%)", animation: "float 14s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "15%", left: "5%", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(108,99,255,0.05) 0%, transparent 70%)", animation: "float 18s ease-in-out infinite reverse" }} />
      </div>

      <div style={{ minHeight: "100vh", background: "#080810", display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>

        {/* ── Coach header ── */}
        <div className="stagger-1" style={{
          maxWidth: "760px", width: "100%", margin: "0 auto",
          padding: isMobile ? "24px 16px 0" : "32px 24px 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
            {/* Avatar with pulse ring */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                width: "42px", height: "42px", borderRadius: "12px",
                background: "linear-gradient(135deg, #ff6b9d, #6c63ff)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px",
              }}>⚡</div>
              {/* Pulse ring */}
              <div style={{
                position: "absolute", inset: "-4px", borderRadius: "16px",
                border: "2px solid rgba(255,107,157,0.4)",
                animation: "pulse-ring 2.5s ease-out infinite",
                pointerEvents: "none",
              }} />
            </div>
            <div>
              <h1 style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 800,
                fontSize: "20px", color: "#f0f0ff", letterSpacing: "-0.03em", margin: 0,
              }}>Your Coach</h1>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#00d4aa", boxShadow: "0 0 6px rgba(0,212,170,0.6)" }} />
                <span style={{ color: "#8888aa", fontSize: "12px" }}>Online · knows your full plan</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Messages ── */}
        <div style={{
          flex: 1,
          maxWidth: "760px", width: "100%", margin: "0 auto",
          padding: isMobile ? "20px 16px 160px" : "20px 24px 160px",
          display: "flex", flexDirection: "column", gap: "14px",
        }}>
          {messages.map((msg, i) => (
            <div
              key={msg.id}
              className="coach-msg-bubble"
              style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}
            >
              {msg.role === "assistant" && (
                <div style={{
                  width: "28px", height: "28px", borderRadius: "8px",
                  background: "linear-gradient(135deg, #ff6b9d, #6c63ff)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", flexShrink: 0, marginRight: "10px", marginTop: "2px",
                }}>⚡</div>
              )}
              <div style={{
                maxWidth: "75%",
                padding: "12px 16px",
                borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: msg.role === "user"
                  ? "linear-gradient(135deg, #6c63ff, #8b5cf6)"
                  : "#12121e",
                border: msg.role === "user" ? "none" : "1px solid #1e1e35",
                color: "#f0f0ff",
                fontSize: "14px",
                lineHeight: 1.65,
                whiteSpace: "pre-wrap",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {msg.content || (isStreaming && i === messages.length - 1
                  ? <TypingIndicator />
                  : ""
                )}
                {isStreaming && i === messages.length - 1 && msg.content && (
                  <span style={{ display: "inline-block", width: "2px", height: "1em", background: "#a594ff", marginLeft: "2px", verticalAlign: "text-bottom", animation: "blink 1s infinite" }} />
                )}
              </div>
            </div>
          ))}

          {/* Suggestion pills — only before first user message */}
          {userMessageCount === 0 && (
            <div className="stagger-2" style={{ display: "flex", flexWrap: "wrap", gap: "8px", paddingLeft: "38px" }}>
              {suggestions.map((s) => (
                <button key={s} type="button" className="coach-suggestion" onClick={() => setInput(s)}>{s}</button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Input bar (fixed bottom) ── */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "rgba(8,8,16,0.95)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTop: "1px solid #1e1e35",
          padding: "12px 16px 16px",
          zIndex: 20,
        }}>
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            <div style={{
              display: "flex", gap: "10px", alignItems: "flex-end",
              background: "#0f0f1a",
              border: "1px solid #1e1e35",
              borderRadius: "16px",
              padding: "10px 12px",
              transition: "border-color 0.2s",
            }}
              onFocus={() => {}}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your coach anything…"
                rows={1}
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  color: "#f0f0ff", fontSize: "14px", resize: "none",
                  fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5,
                  maxHeight: "140px", overflowY: "auto",
                  paddingTop: "2px",
                }}
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={isStreaming || !input.trim()}
                className="coach-send-btn"
                style={{
                  background: isStreaming || !input.trim()
                    ? "#1e1e35"
                    : "linear-gradient(135deg, #6c63ff, #a594ff)",
                  color: "#fff",
                }}
              >
                →
              </button>
            </div>
            <p style={{ color: "#44445a", fontSize: "11px", textAlign: "center", margin: "8px 0 0", fontFamily: "'DM Mono', monospace" }}>
              Your coach knows your full plan · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: "5px", alignItems: "center", padding: "4px 0" }}>
      {[0, 0.15, 0.3].map((delay, i) => (
        <span key={i} style={{
          display: "inline-block", width: "7px", height: "7px",
          borderRadius: "50%", background: "#8888aa",
          animation: `typing-dot 1.2s ${delay}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}
