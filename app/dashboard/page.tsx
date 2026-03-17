"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import type { Habit } from "@/lib/types";

function getTodayName() {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", day: "numeric", month: "long",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const store = useAppStore();

  const studentProfile = store.studentProfile;
  const masterPlan = store.masterPlan;
  const isOnboarded = store.isOnboarded;
  const habitCompletions = store.habitCompletions;
  const currentStreak = store.currentStreak;
  const studyHoursToday = store.studyHoursToday;
  const toggleHabit = store.toggleHabit;

  const [todayHabits, setTodayHabits] = useState<Habit[]>([]);

  useEffect(() => {
    if (!isOnboarded || !studentProfile) {
      router.push("/onboarding");
      return;
    }
    if (!masterPlan) {
      router.push("/generating");
      return;
    }
    setTodayHabits(masterPlan.habitSystem.filter((h) => h.frequency === "daily"));
  }, [isOnboarded, studentProfile, masterPlan, router]);

  if (!masterPlan || !studentProfile) return null;

  const todayName = getTodayName();
  const todayDay = masterPlan.weeklySchedule.find((d) => d.day === todayName);
  const isRestDay = todayDay?.isRestDay ?? false;
  const todaySchedule = todayDay?.blocks ?? [];

  const completedHabits = todayHabits.filter((h) => habitCompletions[h.id]).length;
  const habitPercent = todayHabits.length > 0 ? Math.round((completedHabits / todayHabits.length) * 100) : 0;

  const urgencyColors: Record<string, string> = {
    low: "#4ade80", medium: "#facc15", high: "#fb923c", critical: "#f87171",
  };

  const card: React.CSSProperties = {
    background: "#111111", border: "1px solid #1e1e1e", borderRadius: "16px", padding: "1.5rem",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Inter', sans-serif", paddingBottom: "4rem" }}>

      {/* Navbar */}
      <div style={{
        background: "rgba(10,10,10,0.9)", borderBottom: "1px solid #1a1a1a",
        padding: "0.9rem 2rem", display: "flex", justifyContent: "space-between",
        alignItems: "center", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)",
      }}>
        <span style={{
          fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 900,
          background: "linear-gradient(135deg, #a78bfa, #ec4899)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>PeakMind</span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {[
            { label: "Plan", path: "/plan" },
            { label: "Schedule", path: "/schedule" },
            { label: "Coach", path: "/coach" },
            { label: "Progress", path: "/progress" },
          ].map((item) => (
            <button key={item.path} type="button" onClick={() => router.push(item.path)} style={{
              padding: "0.4rem 0.9rem", background: "transparent",
              border: "1px solid #2a2a2a", borderRadius: "8px",
              color: "#888", fontSize: "0.8rem", cursor: "pointer",
            }}
              onMouseEnter={(e) => { (e.currentTarget).style.borderColor = "#7c3aed"; (e.currentTarget).style.color = "#a78bfa"; }}
              onMouseLeave={(e) => { (e.currentTarget).style.borderColor = "#2a2a2a"; (e.currentTarget).style.color = "#888"; }}
            >{item.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2.5rem 1.5rem 0" }}>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <p style={{ color: "#555", fontSize: "0.82rem", margin: "0 0 0.25rem" }}>{formatDate()}</p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
            fontWeight: 900, color: "#fff", margin: "0 0 0.5rem",
          }}>
            {getGreeting()}, {studentProfile.name.split(" ")[0]} 👋
          </h1>
          <p style={{ color: "#666", fontSize: "0.9rem", margin: 0 }}>
            {isRestDay
              ? "Today is a rest day. Recover well."
              : `${todaySchedule.length} study blocks · ${todayHabits.length} habits to complete`}
          </p>
        </div>

        {/* Key insight banner */}
        <div style={{
          ...card, marginBottom: "1.5rem",
          borderLeft: `3px solid ${urgencyColors[masterPlan.diagnosis.urgencyLevel]}`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
            <div>
              <p style={{ color: "#555", fontSize: "0.72rem", margin: "0 0 0.4rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Your Key Insight
              </p>
              <p style={{ color: "#e0e0e0", fontSize: "0.92rem", margin: 0, lineHeight: 1.6 }}>
                {masterPlan.diagnosis.keyInsight}
              </p>
            </div>
            <span style={{
              flexShrink: 0, padding: "0.25rem 0.65rem", borderRadius: "999px",
              fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
              background: `${urgencyColors[masterPlan.diagnosis.urgencyLevel]}18`,
              color: urgencyColors[masterPlan.diagnosis.urgencyLevel],
              border: `1px solid ${urgencyColors[masterPlan.diagnosis.urgencyLevel]}33`,
            }}>
              {masterPlan.diagnosis.urgencyLevel}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
          {[
            { label: "Study Streak", value: `${currentStreak}`, unit: "days", color: "#a78bfa", icon: "🔥" },
            { label: "Hours Today", value: studyHoursToday.toFixed(1), unit: "hrs", color: "#60a5fa", icon: "⏱️" },
            { label: "Habits Done", value: `${completedHabits}/${todayHabits.length}`, unit: `${habitPercent}%`, color: "#4ade80", icon: "✅" },
          ].map((stat) => (
            <div key={stat.label} style={{ ...card, textAlign: "center" }}>
              <div style={{ fontSize: "1.4rem", marginBottom: "0.4rem" }}>{stat.icon}</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: "0.7rem", color: "#555", marginTop: "0.25rem" }}>{stat.unit}</div>
              <div style={{ fontSize: "0.75rem", color: "#444", marginTop: "0.2rem" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Schedule + Habits */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>

          {/* Today's schedule */}
          <div style={card}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontWeight: 700, color: "#fff", margin: "0 0 1.25rem" }}>
              Today&apos;s Schedule
            </h2>
            {isRestDay ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🛌</div>
                <p style={{ color: "#555", fontSize: "0.85rem", margin: 0 }}>Rest day — no study blocks</p>
              </div>
            ) : todaySchedule.length === 0 ? (
              <p style={{ color: "#555", fontSize: "0.85rem", margin: 0 }}>No blocks scheduled</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {todaySchedule.map((block) => (
                  <div key={block.id} style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.65rem 0.85rem", background: "#141414",
                    borderRadius: "10px", border: "1px solid #1e1e1e",
                  }}>
                    <div style={{ width: "3px", height: "2.2rem", borderRadius: "999px", background: "#7c3aed", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#e0e0e0", marginBottom: "0.1rem" }}>{block.subject}</div>
                      <div style={{ fontSize: "0.72rem", color: "#555" }}>{block.time} · {block.durationMinutes}min</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Habit checklist */}
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontWeight: 700, color: "#fff", margin: 0 }}>
                Daily Habits
              </h2>
              <span style={{ color: "#a78bfa", fontSize: "0.8rem", fontWeight: 600 }}>{completedHabits}/{todayHabits.length}</span>
            </div>

            <div style={{ height: "3px", background: "#1e1e1e", borderRadius: "999px", marginBottom: "1rem", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${habitPercent}%`,
                background: "linear-gradient(90deg, #7c3aed, #4ade80)",
                borderRadius: "999px", transition: "width 0.4s ease",
              }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {todayHabits.map((habit) => {
                const done = !!habitCompletions[habit.id];
                return (
                  <div key={habit.id} onClick={() => toggleHabit(habit.id)} style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.6rem 0.75rem",
                    background: done ? "rgba(74,222,128,0.06)" : "#141414",
                    borderRadius: "10px",
                    border: `1px solid ${done ? "#4ade8022" : "#1e1e1e"}`,
                    cursor: "pointer", transition: "all 0.15s",
                  }}>
                    <div style={{
                      width: "18px", height: "18px", borderRadius: "50%",
                      border: `2px solid ${done ? "#4ade80" : "#333"}`,
                      background: done ? "#4ade80" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "all 0.15s",
                    }}>
                      {done && <span style={{ color: "#000", fontSize: "0.65rem", fontWeight: 800 }}>✓</span>}
                    </div>
                    <span style={{
                      fontSize: "0.82rem", fontWeight: 500,
                      color: done ? "#4ade80" : "#c0c0c0",
                      textDecoration: done ? "line-through" : "none",
                      opacity: done ? 0.7 : 1,
                    }}>{habit.habit}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Nav cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
          {[
            { label: "Full Plan", desc: "Diagnosis & strategy", icon: "📋", path: "/plan" },
            { label: "Schedule", desc: "Weekly timetable", icon: "📅", path: "/schedule" },
            { label: "Coach", desc: "Chat with your coach", icon: "💬", path: "/coach" },
            { label: "Progress", desc: "Track your growth", icon: "📈", path: "/progress" },
          ].map((item) => (
            <div key={item.path} onClick={() => router.push(item.path)} style={{
              background: "#111111", border: "1px solid #1e1e1e", borderRadius: "14px",
              padding: "1.25rem", cursor: "pointer", transition: "all 0.15s",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#7c3aed44"; (e.currentTarget as HTMLDivElement).style.background = "#141414"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#1e1e1e"; (e.currentTarget as HTMLDivElement).style.background = "#111111"; }}
            >
              <div style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>{item.icon}</div>
              <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#e0e0e0", marginBottom: "0.2rem" }}>{item.label}</div>
              <div style={{ fontSize: "0.75rem", color: "#555" }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Study method */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "rgba(124,58,237,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1rem", flexShrink: 0,
            }}>📚</div>
            <div>
              <p style={{ color: "#555", fontSize: "0.72rem", margin: "0 0 0.3rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Your Primary Study Method
              </p>
              <p style={{ color: "#e0e0e0", fontSize: "0.9rem", fontWeight: 600, margin: "0 0 0.25rem" }}>
                {masterPlan.strategy.primaryStudyMethod}
              </p>
              <p style={{ color: "#666", fontSize: "0.8rem", margin: 0 }}>
                {masterPlan.strategy.primaryMethodDescription}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

