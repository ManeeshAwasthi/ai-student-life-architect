"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import type { StudySession } from "@/lib/types";

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

function getLast30Days(): string[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });
}

function formatShortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ProgressPage() {
  const router = useRouter();
  const store = useAppStore();
  const masterPlan = store.masterPlan;
  const studentProfile = store.studentProfile;
  const isOnboarded = store.isOnboarded;
  const studySessions = store.studySessions;
  const habitCompletions = store.habitCompletions;
  const currentStreak = store.currentStreak;
  const studyHoursToday = store.studyHoursToday;
  const logStudySession = store.logStudySession;

  const [isMobile, setIsMobile] = useState(false);

  // Form state
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState(45);
  const [method, setMethod] = useState("");
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [notes, setNotes] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!isOnboarded || !studentProfile) { router.push("/onboarding"); return; }
    if (!masterPlan) { router.push("/generating"); }
  }, [isOnboarded, studentProfile, masterPlan, router]);

  useEffect(() => {
    if (masterPlan && !subject) {
      const firstSubject = masterPlan.strategy.subjects[0]?.subject ?? "";
      setSubject(firstSubject);
      setMethod(masterPlan.strategy.primaryStudyMethod);
    }
  }, [masterPlan, subject]);

  if (!masterPlan || !studentProfile) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid #1e1e1e", borderTop: "3px solid #7c3aed", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: "#555", fontSize: "0.875rem" }}>Loading progress…</p>
        </div>
      </div>
    );
  }

  const today = getTodayString();
  const last7 = getLast7Days();
  const last30 = getLast30Days();

  const todaySessions = studySessions.filter((s) => s.date === today);
  const totalSessionsAll = studySessions.length;
  const totalHoursAll = (studySessions.reduce((a, s) => a + s.durationMinutes, 0) / 60).toFixed(1);

  // Hours per day for bar chart
  const hoursPerDay = last7.map((date) => {
    const mins = studySessions.filter((s) => s.date === date).reduce((a, s) => a + s.durationMinutes, 0);
    return { date, hours: mins / 60 };
  });
  const maxDayHours = Math.max(...hoursPerDay.map((d) => d.hours), 1);

  // Habit completion history (from masterPlan habitSystem completionHistory)
  const habitDaysSet = new Set<string>();
  (masterPlan.habitSystem ?? []).forEach((habit) => {
    (habit.completionHistory ?? []).forEach((d) => habitDaysSet.add(d));
  });

  const subjectOptions = (masterPlan.strategy.subjects ?? []).map((s) => s.subject);

  const handleSubmit = () => {
    if (!subject || !method) return;
    const session: Omit<StudySession, "id" | "date"> = {
      subject, durationMinutes: duration, method, quality, notes: notes.trim() || undefined,
    };
    logStudySession(session);
    setNotes("");
    setQuality(3);
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 2500);
  };

  const card: React.CSSProperties = {
    background: "#111111", border: "1px solid #1e1e1e", borderRadius: "16px",
    padding: isMobile ? "1.25rem" : "1.5rem", marginBottom: "1.5rem",
  };
  const lbl: React.CSSProperties = {
    color: "#555", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.5rem", display: "block",
  };
  const inp: React.CSSProperties = {
    width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "10px",
    padding: "0.7rem 1rem", color: "#fff", fontSize: "0.875rem", outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
  };

  const qualityLabel = ["", "Poor", "Below avg", "Average", "Good", "Excellent"];
  const qualityColor = ["", "#f87171", "#fb923c", "#facc15", "#4ade80", "#a78bfa"];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Inter', sans-serif", paddingBottom: "4rem" }}>

      {/* Navbar */}
      <div style={{
        background: "rgba(10,10,10,0.95)", borderBottom: "1px solid #1a1a1a",
        padding: "0.9rem 1.5rem", display: "flex", justifyContent: "space-between",
        alignItems: "center", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)",
      }}>
        <span style={{
          fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 900,
          background: "linear-gradient(135deg,#a78bfa,#ec4899)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>PeakMind</span>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Plan", path: "/plan" },
            { label: "Schedule", path: "/schedule" },
            { label: "Coach", path: "/coach" },
          ].map((item) => (
            <button key={item.path} type="button" onClick={() => router.push(item.path)} style={{
              padding: "0.4rem 0.85rem", background: "transparent", border: "1px solid #2a2a2a",
              borderRadius: "8px", color: "#888", fontSize: "0.8rem", cursor: "pointer", transition: "all 0.15s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.color = "#a78bfa"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#888"; }}
            >{item.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: isMobile ? "2rem 1rem 0" : "2.5rem 1.5rem 0" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "1.8rem" : "2.2rem", fontWeight: 900, color: "#fff", margin: "0 0 0.3rem" }}>
            Progress Tracker
          </h1>
          <p style={{ color: "#555", fontSize: "0.85rem", margin: 0 }}>{studentProfile.name} · Track every session, build every habit</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
          {[
            { label: "Study Streak", value: `${currentStreak}`, unit: "days", icon: "🔥", color: "#a78bfa" },
            { label: "Hours Today", value: studyHoursToday.toFixed(1), unit: "hrs", icon: "⏱️", color: "#60a5fa" },
            { label: "Total Sessions", value: `${totalSessionsAll}`, unit: "logged", icon: "📚", color: "#4ade80" },
            { label: "Total Hours", value: totalHoursAll, unit: "hrs ever", icon: "🏆", color: "#fb923c" },
          ].map((stat) => (
            <div key={stat.label} style={{ background: "#111111", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "1.1rem", textAlign: "center" }}>
              <div style={{ fontSize: "1.3rem", marginBottom: "0.3rem" }}>{stat.icon}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ color: "#555", fontSize: "0.68rem", marginTop: "0.15rem" }}>{stat.unit}</div>
              <div style={{ color: "#444", fontSize: "0.72rem", marginTop: "0.1rem" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Log Study Session */}
        <div style={card}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: "0 0 1.25rem" }}>
            Log Study Session
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={lbl}>Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{ ...inp, cursor: "pointer" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#7c3aed"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; }}
              >
                {subjectOptions.map((s) => (
                  <option key={s} value={s} style={{ background: "#1a1a1a" }}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>Study Method</label>
              <input
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                placeholder="e.g. Pomodoro, Active Recall"
                style={inp}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#7c3aed"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={lbl}>Duration: {duration} minutes ({(duration / 60).toFixed(1)}h)</label>
            <input
              type="range" min={15} max={180} step={5} value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#7c3aed", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.25rem" }}>
              <span style={{ color: "#444", fontSize: "0.7rem" }}>15 min</span>
              <span style={{ color: "#444", fontSize: "0.7rem" }}>180 min</span>
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={lbl}>Session Quality</label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {([1, 2, 3, 4, 5] as const).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuality(q)}
                  style={{
                    padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", transition: "all 0.15s",
                    border: `1px solid ${quality === q ? qualityColor[q] : "#2a2a2a"}`,
                    background: quality === q ? `${qualityColor[q]}15` : "#141414",
                    color: quality === q ? qualityColor[q] : "#666",
                    fontSize: "0.82rem", fontWeight: quality === q ? 700 : 400,
                  }}
                >
                  {"★".repeat(q)} {qualityLabel[q]}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={lbl}>Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="What did you cover? Any blockers?"
              style={{ ...inp, resize: "vertical" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#7c3aed"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; }}
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            style={{
              padding: "0.75rem 2rem", background: formSuccess ? "#4ade80" : "#7c3aed",
              color: formSuccess ? "#000" : "#fff", border: "none", borderRadius: "10px",
              fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", transition: "all 0.2s",
            }}
          >
            {formSuccess ? "✓ Session Logged!" : "Log Session"}
          </button>
        </div>

        {/* Today's Sessions */}
        <div style={card}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: "0 0 1.25rem" }}>
            Today&apos;s Sessions
          </h2>

          {todaySessions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>📖</div>
              <p style={{ color: "#555", fontSize: "0.85rem", margin: 0 }}>No sessions logged today yet. Start your first one above!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {todaySessions.map((session) => (
                <div key={session.id} style={{
                  display: "flex", alignItems: "center", gap: "1rem", flexWrap: isMobile ? "wrap" : "nowrap",
                  padding: "0.85rem 1rem", background: "#141414", border: "1px solid #1e1e1e",
                  borderRadius: "10px",
                }}>
                  <div style={{ flex: 1, minWidth: "120px" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#e0e0e0", marginBottom: "0.15rem" }}>{session.subject}</div>
                    <div style={{ fontSize: "0.75rem", color: "#666" }}>{session.method}</div>
                    {session.notes && <div style={{ fontSize: "0.72rem", color: "#555", marginTop: "0.15rem", fontStyle: "italic" }}>{session.notes}</div>}
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexShrink: 0 }}>
                    <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: "0.85rem" }}>{session.durationMinutes}m</span>
                    <span style={{ color: qualityColor[session.quality], fontSize: "0.78rem" }}>{"★".repeat(session.quality)}</span>
                  </div>
                </div>
              ))}
              <div style={{ paddingTop: "0.5rem", borderTop: "1px solid #1e1e1e", display: "flex", justifyContent: "flex-end" }}>
                <span style={{ color: "#a78bfa", fontSize: "0.82rem", fontWeight: 600 }}>
                  Total: {(todaySessions.reduce((a, s) => a + s.durationMinutes, 0) / 60).toFixed(1)}h today
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Weekly Hours Bar Chart */}
        <div style={card}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: "0 0 1.5rem" }}>
            Last 7 Days
          </h2>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", height: "120px" }}>
            {hoursPerDay.map((day) => {
              const barH = maxDayHours > 0 ? (day.hours / maxDayHours) * 100 : 0;
              const isToday = day.date === today;
              return (
                <div key={day.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", gap: "0.35rem" }}>
                  <div style={{ fontSize: "0.65rem", color: "#666", fontWeight: 600 }}>{day.hours > 0 ? `${day.hours.toFixed(1)}h` : ""}</div>
                  <div style={{
                    width: "100%", height: `${Math.max(barH, day.hours > 0 ? 4 : 0)}%`,
                    background: isToday ? "#7c3aed" : "#2a2a2a",
                    borderRadius: "4px 4px 0 0", transition: "height 0.4s ease",
                    minHeight: day.hours > 0 ? "4px" : "0",
                  }} />
                  <div style={{ color: isToday ? "#a78bfa" : "#444", fontSize: "0.65rem", fontWeight: isToday ? 700 : 400 }}>
                    {formatShortDate(day.date).split(" ")[0]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Habit Calendar — last 30 days */}
        <div style={card}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: "0 0 0.5rem" }}>
            Habit Activity — Last 30 Days
          </h2>
          <p style={{ color: "#555", fontSize: "0.78rem", margin: "0 0 1.25rem" }}>Green = at least one habit completed that day</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "0.3rem" }}>
            {last30.map((date) => {
              const hasActivity = habitDaysSet.has(date);
              const isToday = date === today;
              return (
                <div
                  key={date}
                  title={`${formatShortDate(date)}${hasActivity ? " — habits done" : ""}`}
                  style={{
                    aspectRatio: "1", borderRadius: "4px",
                    background: hasActivity ? "rgba(74,222,128,0.6)" : "#1a1a1a",
                    border: isToday ? "1px solid #7c3aed" : "1px solid transparent",
                    transition: "all 0.15s",
                  }}
                />
              );
            })}
          </div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#1a1a1a" }} />
              <span style={{ color: "#555", fontSize: "0.7rem" }}>No activity</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "rgba(74,222,128,0.6)" }} />
              <span style={{ color: "#555", fontSize: "0.7rem" }}>Habits done</span>
            </div>
          </div>
        </div>

        {/* Progress Metrics */}
        <div style={card}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: "0 0 1.25rem" }}>
            Progress Metrics
          </h2>
          {(masterPlan.weeklyReview?.progressMetrics ?? []).length === 0 ? (
            <p style={{ color: "#555", fontSize: "0.85rem" }}>No metrics defined in your plan.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {(masterPlan.weeklyReview?.progressMetrics ?? []).map((m) => {
                const pct = m.target > 0 ? Math.min(100, (m.current / m.target) * 100) : 0;
                return (
                  <div key={m.metric} style={{ padding: "1rem", background: "#141414", border: "1px solid #1e1e1e", borderRadius: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span style={{ color: "#e0e0e0", fontWeight: 600, fontSize: "0.875rem" }}>{m.metric}</span>
                      <span style={{ color: "#a78bfa", fontSize: "0.82rem", fontWeight: 700 }}>
                        {m.current} / {m.target} {m.unit}
                      </span>
                    </div>
                    <div style={{ height: "6px", background: "#1e1e1e", borderRadius: "999px", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${pct}%`,
                        background: pct >= 80 ? "linear-gradient(90deg,#4ade80,#22c55e)" : pct >= 50 ? "linear-gradient(90deg,#facc15,#fb923c)" : "linear-gradient(90deg,#7c3aed,#a78bfa)",
                        borderRadius: "999px", transition: "width 0.6s ease",
                      }} />
                    </div>
                    <div style={{ color: "#555", fontSize: "0.7rem", marginTop: "0.3rem" }}>{pct.toFixed(0)}% complete</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
