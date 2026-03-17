"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import type { Message } from "@/lib/types";

export default function CoachPage() {
  const router = useRouter();
  const store = useAppStore();
  const masterPlan = store.masterPlan;
  const studentProfile = store.studentProfile;
  const isOnboarded = store.isOnboarded;
  const habitCompletions = store.habitCompletions;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isOnboarded || !studentProfile) {
      router.push("/onboarding");
      return;
    }
    if (!masterPlan) {
      router.push("/generating");
      return;
    }
    if (!initialized) {
      setInitialized(true);
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hey ${studentProfile.name.split(" ")[0]} 👋 I'm your personal coach. I know your full plan, your habits, and your goals. What's on your mind today?`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [isOnboarded, studentProfile, masterPlan, router, initialized]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getHabitsSummary = () => {
    if (!masterPlan) return "";
    const daily = masterPlan.habitSystem.filter((h) => h.frequency === "daily");
    const done = daily.filter((h) => habitCompletions[h.id]);
    return `${done.length}/${daily.length} habits completed today`;
  };

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || isStreaming || !masterPlan || !studentProfile) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsStreaming(true);

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };
    setMessages([...updated, assistantMsg]);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated,
          profile: studentProfile,
          plan: masterPlan,
          habitsSummary: getHabitsSummary(),
        }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

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
                copy[copy.length - 1] = {
                  ...copy[copy.length - 1],
                  content: fullText,
                };
                return copy;
              });
            }
          } catch {
            /* skip malformed chunks */
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          ...copy[copy.length - 1],
          content: "Something went wrong. Please try again.",
        };
        return copy;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = [
    "How should I study today?",
    "I'm feeling unmotivated",
    "Help me beat procrastination",
    "Review my weak subjects",
  ];

  if (!masterPlan || !studentProfile) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Navbar */}
      <div
        style={{
          background: "rgba(10,10,10,0.95)",
          borderBottom: "1px solid #1a1a1a",
          padding: "0.9rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(12px)",
        }}
      >
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.1rem",
            fontWeight: 900,
            background: "linear-gradient(135deg,#a78bfa,#ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          PeakMind
        </span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Plan", path: "/plan" },
            { label: "Schedule", path: "/schedule" },
            { label: "Progress", path: "/progress" },
          ].map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => router.push(item.path)}
              style={{
                padding: "0.4rem 0.9rem",
                background: "transparent",
                border: "1px solid #2a2a2a",
                borderRadius: "8px",
                color: "#888",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#7c3aed";
                e.currentTarget.style.color = "#a78bfa";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#2a2a2a";
                e.currentTarget.style.color = "#888";
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div
        style={{
          flex: 1,
          maxWidth: "760px",
          width: "100%",
          margin: "0 auto",
          padding: "2rem 1.5rem 6rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "0.5rem" }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.6rem",
              fontWeight: 700,
              color: "#fff",
              margin: "0 0 0.25rem",
            }}
          >
            Your Coach
          </h1>
          <p style={{ color: "#555", fontSize: "0.82rem", margin: 0 }}>
            {studentProfile.coachPersonality} style ·{" "}
            {masterPlan.diagnosis.urgencyLevel} urgency
          </p>
        </div>

        {/* Messages */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {messages.map((msg, i) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent:
                  msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "75%",
                  padding: "0.85rem 1.1rem",
                  borderRadius:
                    msg.role === "user"
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                  background:
                    msg.role === "user"
                      ? "linear-gradient(135deg,#7c3aed,#6d28d9)"
                      : "#141414",
                  border:
                    msg.role === "user" ? "none" : "1px solid #1e1e1e",
                  color: "#fff",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.content ||
                  (isStreaming && i === messages.length - 1 ? (
                    <span style={{ color: "#555" }}>Thinking…</span>
                  ) : (
                    ""
                  ))}
                {isStreaming &&
                  i === messages.length - 1 &&
                  msg.content && (
                    <span
                      style={{
                        display: "inline-block",
                        width: "2px",
                        height: "1em",
                        background: "#a78bfa",
                        marginLeft: "2px",
                        animation: "blink 1s infinite",
                      }}
                    />
                  )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginTop: "0.5rem",
            }}
          >
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setInput(s)}
                style={{
                  padding: "0.4rem 0.9rem",
                  background: "#141414",
                  border: "1px solid #2a2a2a",
                  borderRadius: "999px",
                  color: "#888",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#7c3aed";
                  e.currentTarget.style.color = "#a78bfa";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#2a2a2a";
                  e.currentTarget.style.color = "#888";
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input bar - fixed at bottom */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(10,10,10,0.95)",
          borderTop: "1px solid #1a1a1a",
          padding: "1rem",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            display: "flex",
            gap: "0.75rem",
            alignItems: "flex-end",
            background: "#111",
            border: "1px solid #1e1e1e",
            borderRadius: "14px",
            padding: "0.75rem",
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your coach anything... (Enter to send)"
            rows={1}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: "0.9rem",
              resize: "none",
              fontFamily: "inherit",
              lineHeight: 1.5,
              maxHeight: "120px",
            }}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={isStreaming || !input.trim()}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              flexShrink: 0,
              background:
                isStreaming || !input.trim()
                  ? "#1e1e1e"
                  : "linear-gradient(135deg,#7c3aed,#a78bfa)",
              border: "none",
              cursor:
                isStreaming || !input.trim() ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "1.1rem",
              transition: "all 0.15s",
            }}
          >
            →
          </button>
        </div>
      </div>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}
