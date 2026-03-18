"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import type { StudySession } from "@/lib/types";
import { Flame, Trophy, Timer, CheckCircle2 } from "lucide-react";

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

function getMonthLabels(days: string[]): Array<{ label: string; weekIndex: number }> {
  const seen = new Set<string>();
  const result: Array<{ label: string; weekIndex: number }> = [];
  days.forEach((day, idx) => {
    const weekIndex = Math.floor(idx / 7);
    const month = new Date(day + "T00:00:00").toLocaleDateString("en-US", { month: "short" });
    if (!seen.has(month)) {
      seen.add(month);
      result.push({ label: month, weekIndex });
    }
  });
  return result;
}

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export default function ProgressPage() {
  const router = useRouter();
  const store  = useAppStore();
  const masterPlan       = store.masterPlan;
  const studentProfile   = store.studentProfile;
  const isOnboarded      = store.isOnboarded;
  const studySessions    = store.studySessions;
  const habitCompletions = store.habitCompletions;
  const currentStreak    = store.currentStreak;
  const longestStreak    = store.longestStreak;
  const logStudySession  = store.logStudySession;

  const [subject, setSubject]       = useState("");
  const [duration, setDuration]     = useState(45);
  const [method, setMethod]         = useState("");
  const [quality, setQuality]       = useState<1|2|3|4|5>(3);
  const [notes, setNotes]           = useState("");
  const [formSuccess, setFormSuccess] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

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
      <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, border: "3px solid var(--bg-overlay)", borderTop: "3px solid var(--brand-primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  const today          = getTodayString();
  const last84         = getLast84Days();
  const totalHoursAll  = (studySessions.reduce((a, s) => a + s.durationMinutes, 0) / 60).toFixed(1);

  const habitDaysSet = new Set<string>();
  (masterPlan.habitSystem ?? []).forEach((h) => {
    (h.completionHistory ?? []).forEach((d) => habitDaysSet.add(d));
  });

  // Hours per day map
  const hoursPerDay: Record<string, number> = {};
  studySessions.forEach((s) => {
    hoursPerDay[s.date] = (hoursPerDay[s.date] ?? 0) + s.durationMinutes / 60;
  });

  const subjectOptions = (masterPlan.strategy.subjects ?? []).map((s) => s.subject);
  const todaySessions  = studySessions.filter((s) => s.date === today);
  const dailyHabits    = masterPlan.habitSystem.filter((h) => h.frequency === "daily");
  const doneToday      = dailyHabits.filter((h) => habitCompletions[h.id]).length;

  // 7-day bar chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
  const maxHours = Math.max(...last7Days.map((d) => hoursPerDay[d] ?? 0), 1);

  // Heatmap: intensity per cell
  const getCellIntensity = (date: string) => {
    const hrs = hoursPerDay[date] ?? 0;
    const hasHabit = habitDaysSet.has(date);
    if (hrs === 0 && !hasHabit) return 0;
    if (hrs < 1) return 0.2;
    if (hrs < 2) return 0.4;
    if (hrs < 4) return 0.65;
    return 1;
  };

  const accentColor = "var(--brand-primary)";
  const accentHex   = "#7C5CFC";

  const getCellColor = (intensity: number, isToday: boolean) => {
    if (isToday) return accentHex;
    if (intensity === 0) return "var(--bg-overlay)";
    if (intensity < 0.25) return `${accentHex}30`;
    if (intensity < 0.5)  return `${accentHex}60`;
    if (intensity < 0.75) return `${accentHex}90`;
    return accentHex;
  };

  const monthLabels = getMonthLabels(last84);

  const handleSubmit = () => {
    if (!subject || !method) return;
    const session: Omit<StudySession, "id" | "date"> = { subject, durationMinutes: duration, method, quality, notes: notes.trim() || undefined };
    logStudySession(session);
    setNotes(""); setQuality(3); setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 2500);
  };

  const inp: React.CSSProperties = {
    width: "100%",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-md)",
    padding: "10px 14px",
    color: "var(--text-primary)",
    fontSize: "0.875rem",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "var(--font-body)",
    transition: "border-color 0.2s",
  };

  const qualityColors = ["", "#f87171", "#fb923c", "#facc15", "#22C55E", "#A855F7"];
  const qualityLabels = ["", "Poor", "Below avg", "Average", "Good", "Excellent"];

  const metrics = [
    { label: "Current Streak", value: currentStreak, unit: "days",  icon: Flame,         color: "#FF6B35", progress: Math.min(100, (currentStreak / 30) * 100) },
    { label: "Longest Streak", value: longestStreak, unit: "days",  icon: Trophy,        color: "#A855F7", progress: Math.min(100, (longestStreak / 60) * 100) },
    { label: "Total Hours",    value: totalHoursAll, unit: "hrs",   icon: Timer,         color: "#3B82F6", progress: Math.min(100, (parseFloat(totalHoursAll) / 100) * 100) },
    { label: "Today's Habits", value: `${doneToday}/${dailyHabits.length}`, unit: "done", icon: CheckCircle2, color: "#22C55E", progress: dailyHabits.length > 0 ? (doneToday / dailyHabits.length) * 100 : 0 },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", paddingBottom: "var(--space-16)", position: "relative" }}>
      {/* Ambient orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "8%", left: "15%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,92,252,0.06) 0%, transparent 70%)", animation: "float 15s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "8%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)", animation: "float 19s ease-in-out infinite reverse" }} />
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "var(--space-10) var(--space-8) 0", position: "relative", zIndex: 1 }}>

        {/* ── Header ── */}
        <div className="stagger-1" style={{ marginBottom: "var(--space-10)" }}>
          <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: "var(--space-2)" }}>Progress Tracker</div>
          <h1 className="text-display" style={{ color: "var(--text-primary)", margin: "0 0 var(--space-2)" }}>Your Growth</h1>
          <p className="text-body" style={{ color: "var(--text-secondary)", margin: 0 }}>Every session logged. Every habit tracked.</p>
        </div>

        {/* ── Metric cards ── */}
        <div className="stagger-2 grid-4" style={{ marginBottom: "var(--space-6)" }}>
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="card-metric">
                <div style={{
                  width: 36, height: 36, borderRadius: "var(--radius-md)",
                  background: `${m.color}18`, border: `1px solid ${m.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={18} color={m.color} />
                </div>
                <div>
                  <div className="text-metric" style={{ color: m.color }}>{m.value}</div>
                  <div className="text-label" style={{ color: "var(--text-tertiary)", marginTop: 4 }}>{m.unit} · {m.label}</div>
                </div>
                <div style={{ height: 3, background: "var(--border-subtle)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${m.progress}%`, background: m.color, borderRadius: "inherit", transition: "width 1s cubic-bezier(0.16,1,0.3,1)" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Activity Heatmap ── */}
        <div className="stagger-3 card" style={{ marginBottom: "var(--space-6)" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
            <div>
              <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: 4 }}>Activity</div>
              <div className="text-h2" style={{ color: "var(--text-primary)" }}>12-Week Heatmap</div>
            </div>
          </div>

          {/* Month labels */}
          <div style={{ display: "grid", gridTemplateColumns: "20px repeat(12, 1fr)", gap: 4, marginBottom: 4 }}>
            <div />
            {Array.from({ length: 12 }, (_, week) => {
              const dayIdx = week * 7;
              const date   = last84[dayIdx];
              if (!date) return <div key={week} />;
              const month = new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "short" });
              const prevDate = week > 0 ? last84[(week - 1) * 7] : null;
              const prevMonth = prevDate ? new Date(prevDate + "T00:00:00").toLocaleDateString("en-US", { month: "short" }) : null;
              return (
                <div key={week} style={{ fontSize: 10, color: month !== prevMonth ? "var(--text-tertiary)" : "transparent", fontFamily: "var(--font-body)", textAlign: "center" }}>
                  {month !== prevMonth ? month : ""}
                </div>
              );
            })}
          </div>

          {/* Grid with day labels */}
          <div style={{ display: "flex", gap: 4 }}>
            {/* Day labels */}
            <div style={{ display: "grid", gridTemplateRows: "repeat(7, 1fr)", gap: 4, width: 20 }}>
              {DAY_LABELS.map((label, i) => (
                <div key={i} style={{ fontSize: 9, color: "var(--text-tertiary)", display: "flex", alignItems: "center", height: 20, fontFamily: "var(--font-body)" }}>
                  {label}
                </div>
              ))}
            </div>

            {/* Heatmap cells — 12 columns × 7 rows */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 4, flex: 1 }}>
              {Array.from({ length: 12 }, (_, week) =>
                <div key={week} style={{ display: "grid", gridTemplateRows: "repeat(7, 1fr)", gap: 4 }}>
                  {Array.from({ length: 7 }, (_, day) => {
                    const idx      = week * 7 + day;
                    const date     = last84[idx];
                    if (!date) return <div key={day} style={{ height: 20 }} />;
                    const isToday  = date === today;
                    const intensity = getCellIntensity(date);
                    const cellColor = getCellColor(intensity, isToday);
                    const hrs = hoursPerDay[date] ?? 0;
                    return (
                      <div
                        key={day}
                        onMouseEnter={() => setHoveredCell(date)}
                        onMouseLeave={() => setHoveredCell(null)}
                        title={`${formatShortDate(date)}${hrs > 0 ? ` — ${hrs.toFixed(1)}h` : habitDaysSet.has(date) ? " — active" : ""}`}
                        style={{
                          height: 20, width: "100%",
                          borderRadius: 4,
                          background: cellColor,
                          border: isToday ? "1px solid rgba(124,92,252,0.8)" : "1px solid transparent",
                          transition: "transform 0.15s ease",
                          cursor: "default",
                          transform: hoveredCell === date ? "scale(1.3)" : "scale(1)",
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginTop: "var(--space-4)" }}>
            <span className="text-label" style={{ color: "var(--text-tertiary)" }}>Less</span>
            {[0, 0.2, 0.5, 0.75, 1].map((v, i) => (
              <div key={i} style={{ width: 14, height: 14, borderRadius: 3, background: getCellColor(v, false) }} />
            ))}
            <span className="text-label" style={{ color: "var(--text-tertiary)" }}>More</span>
          </div>
        </div>

        {/* ── 7-day bar chart ── */}
        <div className="stagger-4 card" style={{ marginBottom: "var(--space-6)" }}>
          <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: 4 }}>Weekly</div>
          <div className="text-h2" style={{ color: "var(--text-primary)", marginBottom: "var(--space-5)" }}>7-Day Study Hours</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-2)", height: 80 }}>
            {last7Days.map((date) => {
              const hrs   = hoursPerDay[date] ?? 0;
              const pct   = maxHours > 0 ? (hrs / maxHours) * 100 : 0;
              const isToday = date === today;
              const dayLabel = new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });
              return (
                <div key={date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                    <div style={{
                      width: "100%",
                      height: `${Math.max(pct, hrs > 0 ? 8 : 0)}%`,
                      minHeight: hrs > 0 ? 4 : 0,
                      background: isToday
                        ? "var(--brand-primary)"
                        : "linear-gradient(180deg, var(--brand-primary) 0%, var(--brand-primary-dim) 100%)",
                      opacity: isToday ? 1 : 0.5,
                      borderRadius: "3px 3px 0 0",
                      transition: "height 0.6s cubic-bezier(0.16,1,0.3,1)",
                    }} />
                  </div>
                  <div style={{ fontSize: 10, color: isToday ? "var(--brand-primary)" : "var(--text-tertiary)", fontFamily: "var(--font-body)", fontWeight: isToday ? 600 : 400 }}>
                    {dayLabel}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Habit Streaks + Progress Metrics ── */}
        <div className="stagger-4 grid-2" style={{ marginBottom: "var(--space-6)" }}>

          {/* Habit streaks */}
          <div className="card">
            <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: 4 }}>Habits</div>
            <div className="text-h2" style={{ color: "var(--text-primary)", marginBottom: "var(--space-5)" }}>Habit Streaks</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {dailyHabits.map((habit) => {
                const done   = habitCompletions[habit.id];
                const streak = habit.streak ?? 0;
                return (
                  <div key={habit.id} style={{
                    padding: "var(--space-3) var(--space-4)",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                      <span className="text-sm" style={{ color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.3, flex: 1, paddingRight: "var(--space-3)" }}>{habit.habit}</span>
                      {streak > 0 && (
                        <span style={{ fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 700, color: "#FF6B35", flexShrink: 0 }}>
                          🔥{streak}
                        </span>
                      )}
                    </div>
                    <div style={{ height: 3, background: "var(--border-subtle)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: done ? "100%" : "0%",
                        background: "#22C55E", borderRadius: "inherit",
                        transition: "width 0.6s ease",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress metrics */}
          <div className="card">
            <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: 4 }}>Goals</div>
            <div className="text-h2" style={{ color: "var(--text-primary)", marginBottom: "var(--space-5)" }}>Progress Metrics</div>
            {(masterPlan.weeklyReview?.progressMetrics ?? []).length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>No metrics defined yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {(masterPlan.weeklyReview?.progressMetrics ?? []).map((m) => {
                  const pct   = m.target > 0 ? Math.min(100, (m.current / m.target) * 100) : 0;
                  const color = pct >= 80 ? "#22C55E" : pct >= 50 ? "#FF6B35" : "var(--brand-primary)";
                  return (
                    <div key={m.metric} style={{
                      padding: "var(--space-3) var(--space-4)",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                        <span className="text-sm" style={{ color: "var(--text-primary)", fontWeight: 500 }}>{m.metric}</span>
                        <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color, fontWeight: 700 }}>
                          {m.current}/{m.target} {m.unit}
                        </span>
                      </div>
                      <div style={{ height: 6, background: "var(--border-subtle)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                        <div className="progress-animated" style={{
                          height: "100%", width: `${pct}%`,
                          background: `linear-gradient(90deg, ${color}, var(--brand-primary))`,
                          borderRadius: "inherit",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Log Study Session ── */}
        <div className="stagger-5 card" style={{ marginBottom: "var(--space-6)" }}>
          <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: 4 }}>Log</div>
          <div className="text-h2" style={{ color: "var(--text-primary)", marginBottom: "var(--space-5)" }}>Study Session</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)", marginBottom: "var(--space-4)" }}>
            <div>
              <label className="text-label" style={{ display: "block", color: "var(--text-tertiary)", marginBottom: "var(--space-2)" }}>Subject</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{ ...inp, cursor: "pointer" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand-primary)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; }}>
                {subjectOptions.map((s) => <option key={s} value={s} style={{ background: "var(--bg-elevated)" }}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-label" style={{ display: "block", color: "var(--text-tertiary)", marginBottom: "var(--space-2)" }}>Method</label>
              <input value={method} onChange={(e) => setMethod(e.target.value)} placeholder="e.g. Active Recall" style={inp}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand-primary)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; }} />
            </div>
          </div>

          <div style={{ marginBottom: "var(--space-4)" }}>
            <label className="text-label" style={{ display: "block", color: "var(--text-tertiary)", marginBottom: "var(--space-2)" }}>
              Duration — <span style={{ color: "var(--brand-primary)", fontWeight: 700 }}>{duration} min</span>
            </label>
            <input type="range" min={15} max={180} step={5} value={duration} onChange={(e) => setDuration(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--brand-primary)", cursor: "pointer" }} />
          </div>

          <div style={{ marginBottom: "var(--space-4)" }}>
            <label className="text-label" style={{ display: "block", color: "var(--text-tertiary)", marginBottom: "var(--space-3)" }}>Quality</label>
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              {([1,2,3,4,5] as const).map((q) => (
                <button key={q} type="button" onClick={() => setQuality(q)} style={{
                  padding: "6px 14px", borderRadius: "var(--radius-md)", cursor: "pointer", transition: "all 0.15s",
                  border: `1px solid ${quality === q ? qualityColors[q] : "var(--border-subtle)"}`,
                  background: quality === q ? `${qualityColors[q]}18` : "var(--bg-elevated)",
                  color: quality === q ? qualityColors[q] : "var(--text-tertiary)",
                  fontSize: 13, fontWeight: quality === q ? 700 : 400,
                  fontFamily: "var(--font-body)",
                }}>{"★".repeat(q)} {qualityLabels[q]}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "var(--space-5)" }}>
            <label className="text-label" style={{ display: "block", color: "var(--text-tertiary)", marginBottom: "var(--space-2)" }}>Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              placeholder="What did you cover?" style={{ ...inp, resize: "vertical" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand-primary)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; }} />
          </div>

          <button type="button" onClick={handleSubmit} style={{
            padding: "11px 28px",
            background: formSuccess ? "#22C55E" : "linear-gradient(135deg, var(--brand-primary), var(--accent-focus))",
            color: formSuccess ? "#080B14" : "#fff",
            border: "none", borderRadius: "var(--radius-md)",
            fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s",
            fontFamily: "var(--font-body)",
          }}>
            {formSuccess ? "✓ Session Logged!" : "Log Session"}
          </button>
        </div>

        {/* ── Today's sessions ── */}
        <div className="card">
          <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: 4 }}>Today</div>
          <div className="text-h2" style={{ color: "var(--text-primary)", marginBottom: "var(--space-5)" }}>Sessions Logged</div>
          {todaySessions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "var(--space-8) 0" }}>
              <div style={{ fontSize: 28, marginBottom: "var(--space-2)" }}>📖</div>
              <p className="text-sm" style={{ color: "var(--text-tertiary)", margin: 0 }}>No sessions logged yet. Start your first one above!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {todaySessions.map((session) => (
                <div key={session.id} style={{
                  display: "flex", alignItems: "center", gap: "var(--space-3)",
                  padding: "var(--space-3) var(--space-4)",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="text-sm" style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{session.subject}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>{session.method}</div>
                  </div>
                  <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", flexShrink: 0 }}>
                    <span style={{ color: "var(--brand-primary)", fontWeight: 700, fontSize: 13, fontFamily: "var(--font-body)" }}>{session.durationMinutes}m</span>
                    <span style={{ color: qualityColors[session.quality], fontSize: 12 }}>{"★".repeat(session.quality)}</span>
                  </div>
                </div>
              ))}
              <div style={{ paddingTop: "var(--space-3)", borderTop: "1px solid var(--border-subtle)", textAlign: "right" }}>
                <span style={{ color: "var(--brand-primary)", fontSize: 13, fontWeight: 700, fontFamily: "var(--font-body)" }}>
                  {(todaySessions.reduce((a, s) => a + s.durationMinutes, 0) / 60).toFixed(1)}h today
                </span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
