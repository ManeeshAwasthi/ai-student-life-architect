"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import type { StudySession } from "@/lib/types";

function getTodayString() { return new Date().toISOString().split("T")[0]; }

function getLast84Days(): string[] {
  return Array.from({ length: 84 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (83 - i));
    return d.toISOString().split("T")[0];
  });
}

function formatShortDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const HABIT_ICONS: Record<string, string> = {
  lifestyle: "🌅", study: "📚", focus: "🎯", mindset: "🧠", health: "💪",
};

export default function ProgressPage() {
  const router = useRouter();
  const store  = useAppStore();
  const masterPlan      = store.masterPlan;
  const studentProfile  = store.studentProfile;
  const isOnboarded     = store.isOnboarded;
  const studySessions   = store.studySessions;
  const habitCompletions = store.habitCompletions;
  const currentStreak   = store.currentStreak;
  const longestStreak   = store.longestStreak;
  const logStudySession = store.logStudySession;

  const [isMobile, setIsMobile]     = useState(false);
  const [subject, setSubject]       = useState("");
  const [duration, setDuration]     = useState(45);
  const [method, setMethod]         = useState("");
  const [quality, setQuality]       = useState<1|2|3|4|5>(3);
  const [notes, setNotes]           = useState("");
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
      setSubject(masterPlan.strategy.subjects[0]?.subject ?? "");
      setMethod(masterPlan.strategy.primaryStudyMethod);
    }
  }, [masterPlan, subject]);

  if (!masterPlan || !studentProfile) {
    return (
      <div style={{ minHeight: "100vh", background: "#080810", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "36px", height: "36px", border: "3px solid #1e1e35", borderTop: "3px solid #6c63ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  const today      = getTodayString();
  const last84     = getLast84Days();
  const totalHoursAll = (studySessions.reduce((a, s) => a + s.durationMinutes, 0) / 60).toFixed(1);

  // Habit activity set
  const habitDaysSet = new Set<string>();
  (masterPlan.habitSystem ?? []).forEach((h) => {
    (h.completionHistory ?? []).forEach((d) => habitDaysSet.add(d));
  });

  // Hours per day for last 7
  const subjectOptions = (masterPlan.strategy.subjects ?? []).map((s) => s.subject);
  const todaySessions  = studySessions.filter((s) => s.date === today);
  const dailyHabits    = masterPlan.habitSystem.filter((h) => h.frequency === "daily");
  const doneToday      = dailyHabits.filter((h) => habitCompletions[h.id]).length;

  const handleSubmit = () => {
    if (!subject || !method) return;
    const session: Omit<StudySession, "id" | "date"> = { subject, durationMinutes: duration, method, quality, notes: notes.trim() || undefined };
    logStudySession(session);
    setNotes(""); setQuality(3); setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 2500);
  };

  const inp: React.CSSProperties = {
    width: "100%", background: "#0f0f1a", border: "1px solid #1e1e35", borderRadius: "10px",
    padding: "10px 14px", color: "#f0f0ff", fontSize: "14px", outline: "none",
    boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s",
  };
  const qualityColors = ["", "#f87171", "#fb923c", "#facc15", "#00d4aa", "#a594ff"];
  const qualityLabels = ["", "Poor", "Below avg", "Average", "Good", "Excellent"];

  return (
    <>
      <style>{`
        .prog-card {
          background: #12121e;
          border: 1px solid #1e1e35;
          border-radius: 20px;
          padding: 24px;
          transition: all 0.25s ease;
        }
        .prog-card:hover {
          border-color: rgba(108,99,255,0.2);
          box-shadow: 0 6px 24px rgba(108,99,255,0.06);
        }
        .prog-stat-card {
          background: #12121e;
          border: 1px solid #1e1e35;
          border-radius: 18px;
          padding: 20px;
          text-align: center;
          transition: all 0.25s ease;
          cursor: default;
        }
        .prog-stat-card:hover {
          transform: translateY(-2px);
          border-color: rgba(108,99,255,0.25);
          box-shadow: 0 8px 24px rgba(108,99,255,0.07);
        }
        .heatmap-cell {
          border-radius: 4px;
          transition: transform 0.15s ease;
          cursor: default;
        }
        .heatmap-cell:hover { transform: scale(1.3); }
        .prog-inp:focus { border-color: #6c63ff !important; }
      `}</style>

      {/* Ambient bg */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "10%", left: "10%", width: "360px", height: "360px", borderRadius: "50%", background: "radial-gradient(circle, rgba(108,99,255,0.06) 0%, transparent 70%)", animation: "float 15s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "8%", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,170,0.05) 0%, transparent 70%)", animation: "float 19s ease-in-out infinite reverse" }} />
      </div>

      <div style={{ minHeight: "100vh", background: "#080810", paddingBottom: "5rem", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: isMobile ? "32px 16px 0" : "40px 32px 0" }}>

          {/* ── Header ── */}
          <div className="stagger-1" style={{ marginBottom: "32px" }}>
            <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", marginBottom: "8px" }}>PROGRESS TRACKER</p>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: isMobile ? "1.8rem" : "2.2rem", color: "#f0f0ff", letterSpacing: "-0.03em", margin: "0 0 8px" }}>
              Your Growth
            </h1>
            <p style={{ color: "#8888aa", fontSize: "14px", margin: 0 }}>Every session logged. Every habit tracked.</p>
          </div>

          {/* ── Stats tiles ── */}
          <div className="stagger-2" style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: "12px", marginBottom: "24px" }}>
            {[
              { label: "Current Streak",  value: currentStreak,             unit: "days",  emoji: "🔥", color: "#ffb347", bg: "rgba(255,179,71,0.08)",   border: "rgba(255,179,71,0.2)"   },
              { label: "Longest Streak",  value: longestStreak,             unit: "days",  emoji: "🏆", color: "#a594ff", bg: "rgba(108,99,255,0.08)",   border: "rgba(108,99,255,0.2)"   },
              { label: "Total Hours",     value: totalHoursAll,             unit: "hrs",   emoji: "⏱",  color: "#00d4aa", bg: "rgba(0,212,170,0.07)",    border: "rgba(0,212,170,0.2)"    },
              { label: "Today's Habits",  value: `${doneToday}/${dailyHabits.length}`, unit: "done", emoji: "✅", color: "#ff6b9d", bg: "rgba(255,107,157,0.07)", border: "rgba(255,107,157,0.2)" },
            ].map((s, i) => (
              <div key={s.label} className="prog-stat-card" style={{ background: s.bg, borderColor: s.border, animationDelay: `${i * 0.06}s` }}>
                <div style={{ fontSize: "20px", marginBottom: "10px" }}>{s.emoji}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: "1.9rem", color: s.color, lineHeight: 1, marginBottom: "4px" }}>{s.value}</div>
                <div style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace" }}>{s.unit}</div>
                <div style={{ color: "#8888aa", fontSize: "12px", marginTop: "4px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Activity Heatmap ── */}
          <div className="stagger-3 prog-card" style={{ marginBottom: "20px" }}>
            <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "16px" }}>
              12-WEEK ACTIVITY
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "4px" }}>
              {/* 84 days = 12 weeks × 7 days, grouped by week columns */}
              {Array.from({ length: 12 }, (_, week) =>
                Array.from({ length: 7 }, (_, day) => {
                  const idx  = week * 7 + day;
                  const date = last84[idx];
                  if (!date) return null;
                  const hasActivity = habitDaysSet.has(date) || studySessions.some((s) => s.date === date);
                  const isToday     = date === today;
                  return (
                    <div
                      key={date}
                      title={`${formatShortDate(date)}${hasActivity ? " — active" : ""}`}
                      className="heatmap-cell"
                      style={{
                        aspectRatio: "1",
                        background: isToday ? "#6c63ff"
                          : hasActivity ? "rgba(108,99,255,0.55)"
                          : "#1a1a2e",
                        border: isToday ? "1px solid rgba(108,99,255,0.8)" : "1px solid transparent",
                        boxShadow: isToday ? "0 0 8px rgba(108,99,255,0.5)" : "none",
                      }}
                    />
                  );
                })
              )}
            </div>
            {/* Legend */}
            <div style={{ display: "flex", gap: "16px", marginTop: "12px", alignItems: "center" }}>
              {[
                { color: "#1a1a2e", label: "No activity" },
                { color: "rgba(108,99,255,0.55)", label: "Active" },
                { color: "#6c63ff", label: "Today" },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "11px", height: "11px", borderRadius: "3px", background: color }} />
                  <span style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Habit streaks + Progress metrics ── */}
          <div className="stagger-4" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px", marginBottom: "20px" }}>

            {/* Habit Streaks */}
            <div className="prog-card">
              <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "16px" }}>
                HABIT STREAKS
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {dailyHabits.map((habit) => {
                  const done   = habitCompletions[habit.id];
                  const streak = habit.streak ?? 0;
                  const icon   = HABIT_ICONS[habit.category] ?? "📌";
                  return (
                    <div key={habit.id} style={{ padding: "12px 14px", background: "#0f0f1a", border: "1px solid #1e1e35", borderRadius: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "14px" }}>{icon}</span>
                          <span style={{ fontSize: "13px", color: "#c8c8ee", fontWeight: 500, lineHeight: 1.3 }}>{habit.habit}</span>
                        </div>
                        {streak > 0 && (
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px", fontWeight: 700, color: "#ffb347", flexShrink: 0, marginLeft: "8px" }}>🔥{streak}</span>
                        )}
                      </div>
                      {/* Thin bar */}
                      <div style={{ height: "3px", background: "#1e1e35", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: done ? "100%" : "0%",
                          background: "#00d4aa",
                          borderRadius: "999px", transition: "width 0.6s ease",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Progress Metrics */}
            <div className="prog-card">
              <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "16px" }}>
                PROGRESS METRICS
              </p>
              {(masterPlan.weeklyReview?.progressMetrics ?? []).length === 0 ? (
                <p style={{ color: "#44445a", fontSize: "14px" }}>No metrics defined yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {(masterPlan.weeklyReview?.progressMetrics ?? []).map((m) => {
                    const pct   = m.target > 0 ? Math.min(100, (m.current / m.target) * 100) : 0;
                    const color = pct >= 80 ? "#00d4aa" : pct >= 50 ? "#ffb347" : "#ff6b9d";
                    return (
                      <div key={m.metric} style={{ padding: "12px 14px", background: "#0f0f1a", border: "1px solid #1e1e35", borderRadius: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "13px", color: "#c8c8ee", fontWeight: 500 }}>{m.metric}</span>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color, fontWeight: 700 }}>
                            {m.current}/{m.target} {m.unit}
                          </span>
                        </div>
                        <div style={{ height: "6px", background: "#1e1e35", borderRadius: "999px", overflow: "hidden" }}>
                          <div className="progress-animated" style={{
                            height: "100%", width: `${pct}%`,
                            background: color, borderRadius: "999px",
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Strengths ── */}
          {(masterPlan.diagnosis.strengths ?? []).length > 0 && (
            <div className="stagger-5 prog-card" style={{ marginBottom: "20px" }}>
              <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "16px" }}>
                YOUR STRENGTHS
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {masterPlan.diagnosis.strengths.map((s) => (
                  <span key={s} style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "6px 14px", borderRadius: "999px",
                    background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.2)",
                    color: "#00d4aa", fontSize: "13px",
                  }}>
                    <span style={{ fontSize: "10px" }}>✓</span> {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Log Study Session ── */}
          <div className="stagger-6 prog-card" style={{ marginBottom: "20px" }}>
            <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "16px" }}>
              LOG STUDY SESSION
            </p>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", color: "#8888aa", fontSize: "11px", fontFamily: "'DM Mono', monospace", marginBottom: "6px" }}>SUBJECT</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{ ...inp, cursor: "pointer" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#6c63ff"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#1e1e35"; }}>
                  {subjectOptions.map((s) => <option key={s} value={s} style={{ background: "#12121e" }}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", color: "#8888aa", fontSize: "11px", fontFamily: "'DM Mono', monospace", marginBottom: "6px" }}>METHOD</label>
                <input value={method} onChange={(e) => setMethod(e.target.value)} placeholder="e.g. Active Recall" style={inp}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#6c63ff"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#1e1e35"; }} />
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", color: "#8888aa", fontSize: "11px", fontFamily: "'DM Mono', monospace", marginBottom: "6px" }}>
                DURATION — <span style={{ color: "#a594ff", fontWeight: 700 }}>{duration} min</span>
              </label>
              <input type="range" min={15} max={180} step={5} value={duration} onChange={(e) => setDuration(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#6c63ff", cursor: "pointer" }} />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", color: "#8888aa", fontSize: "11px", fontFamily: "'DM Mono', monospace", marginBottom: "8px" }}>QUALITY</label>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {([1,2,3,4,5] as const).map((q) => (
                  <button key={q} type="button" onClick={() => setQuality(q)} style={{
                    padding: "6px 14px", borderRadius: "8px", cursor: "pointer", transition: "all 0.15s",
                    border: `1px solid ${quality === q ? qualityColors[q] : "#1e1e35"}`,
                    background: quality === q ? `${qualityColors[q]}18` : "#0f0f1a",
                    color: quality === q ? qualityColors[q] : "#44445a",
                    fontSize: "13px", fontWeight: quality === q ? 700 : 400,
                    fontFamily: "'DM Sans', sans-serif",
                  }}>{"★".repeat(q)} {qualityLabels[q]}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", color: "#8888aa", fontSize: "11px", fontFamily: "'DM Mono', monospace", marginBottom: "6px" }}>NOTES (optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                placeholder="What did you cover?" style={{ ...inp, resize: "vertical" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#6c63ff"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#1e1e35"; }} />
            </div>

            <button type="button" onClick={handleSubmit} style={{
              padding: "11px 28px",
              background: formSuccess ? "#00d4aa" : "linear-gradient(135deg, #6c63ff, #a594ff)",
              color: formSuccess ? "#080810" : "#fff",
              border: "none", borderRadius: "11px",
              fontWeight: 700, fontSize: "14px", cursor: "pointer", transition: "all 0.2s",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {formSuccess ? "✓ Session Logged!" : "Log Session"}
            </button>
          </div>

          {/* ── Today's sessions ── */}
          <div className="prog-card" style={{ marginBottom: "20px" }}>
            <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "16px" }}>
              TODAY&apos;S SESSIONS
            </p>
            {todaySessions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "28px 0" }}>
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>📖</div>
                <p style={{ color: "#44445a", fontSize: "14px", margin: 0 }}>No sessions logged yet. Start your first one above!</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {todaySessions.map((session) => (
                  <div key={session.id} style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px 14px", background: "#0f0f1a",
                    border: "1px solid #1e1e35", borderRadius: "12px",
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "14px", color: "#f0f0ff", marginBottom: "2px" }}>{session.subject}</div>
                      <div style={{ fontSize: "12px", color: "#8888aa" }}>{session.method}</div>
                    </div>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center", flexShrink: 0 }}>
                      <span style={{ color: "#a594ff", fontWeight: 700, fontSize: "13px", fontFamily: "'DM Mono', monospace" }}>{session.durationMinutes}m</span>
                      <span style={{ color: qualityColors[session.quality], fontSize: "12px" }}>{"★".repeat(session.quality)}</span>
                    </div>
                  </div>
                ))}
                <div style={{ paddingTop: "10px", borderTop: "1px solid #1e1e35", textAlign: "right" }}>
                  <span style={{ color: "#a594ff", fontSize: "13px", fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
                    {(todaySessions.reduce((a, s) => a + s.durationMinutes, 0) / 60).toFixed(1)}h today
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
