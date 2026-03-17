"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
type DayName = typeof DAYS[number];

const CAT_COLOR: Record<string, string> = {
  study: "#7c3aed",
  deep_work: "#6d28d9",
  health: "#4ade80",
  rest: "#60a5fa",
  admin: "#a78bfa",
  meal: "#fb923c",
  social: "#f472b6",
};

function getTodayName(): DayName {
  const day = new Date().toLocaleDateString("en-US", { weekday: "long" });
  return (DAYS.includes(day as DayName) ? day : "Monday") as DayName;
}

export default function SchedulePage() {
  const router = useRouter();
  const store = useAppStore();
  const masterPlan = store.masterPlan;
  const studentProfile = store.studentProfile;
  const isOnboarded = store.isOnboarded;

  const todayName = getTodayName();
  const [selectedDay, setSelectedDay] = useState<DayName>(todayName);
  const [isMobile, setIsMobile] = useState(false);

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

  if (!masterPlan || !studentProfile) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid #1e1e1e", borderTop: "3px solid #7c3aed", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: "#555", fontSize: "0.875rem" }}>Loading your schedule…</p>
        </div>
      </div>
    );
  }

  const { weeklySchedule, dailyRoutine } = masterPlan;

  const selectedDayData = weeklySchedule.find((d) => d.day === selectedDay);
  const isRestDay = selectedDayData?.isRestDay ?? false;
  const todayBlocks = selectedDayData?.blocks ?? [];

  // Weekly summary — total study hours
  const totalWeeklyMinutes = weeklySchedule.reduce((acc, day) =>
    acc + (day.blocks ?? []).reduce((a, b) => a + b.durationMinutes, 0), 0
  );
  const totalWeeklyHours = (totalWeeklyMinutes / 60).toFixed(1);

  const card: React.CSSProperties = {
    background: "#111111", border: "1px solid #1e1e1e", borderRadius: "16px",
    padding: isMobile ? "1.25rem" : "1.5rem", marginBottom: "1.5rem",
  };
  const lbl: React.CSSProperties = {
    color: "#555", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.75rem",
  };

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
            { label: "Coach", path: "/coach" },
            { label: "Progress", path: "/progress" },
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
        <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "1.8rem" : "2.2rem", fontWeight: 900, color: "#fff", margin: "0 0 0.3rem" }}>Weekly Schedule</h1>
            <p style={{ color: "#555", fontSize: "0.85rem", margin: 0 }}>{studentProfile.name} · {totalWeeklyHours}h total study this week</p>
          </div>
          <div style={{ padding: "0.5rem 1rem", background: "#141414", border: "1px solid #1e1e1e", borderRadius: "10px", textAlign: "center" }}>
            <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: "1rem" }}>{totalWeeklyHours}h</div>
            <div style={{ color: "#555", fontSize: "0.7rem" }}>weekly total</div>
          </div>
        </div>

        {/* Day Tabs */}
        <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.5rem", overflowX: "auto", paddingBottom: "0.25rem" }}>
          {DAYS.map((day) => {
            const dayData = weeklySchedule.find((d) => d.day === day);
            const isRest = dayData?.isRestDay ?? false;
            const isToday = day === todayName;
            const isSelected = day === selectedDay;
            const shortDay = isMobile ? day.slice(0, 3) : day.slice(0, 3);
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                style={{
                  padding: isMobile ? "0.5rem 0.65rem" : "0.6rem 1rem",
                  borderRadius: "10px", border: `1px solid ${isSelected ? "#7c3aed" : "#2a2a2a"}`,
                  background: isSelected ? "rgba(124,58,237,0.15)" : "#111",
                  color: isSelected ? "#fff" : "#666",
                  fontSize: "0.82rem", fontWeight: isSelected ? 700 : 500,
                  cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
                  position: "relative",
                }}
              >
                {shortDay}
                {isToday && (
                  <span style={{ position: "absolute", top: "-4px", right: "-4px", width: "8px", height: "8px", background: "#7c3aed", borderRadius: "50%", border: "2px solid #0a0a0a" }} />
                )}
                {isRest && !isSelected && (
                  <span style={{ display: "block", fontSize: "0.6rem", color: "#555", marginTop: "1px" }}>rest</span>
                )}
                {isRest && isSelected && (
                  <span style={{ display: "block", fontSize: "0.6rem", color: "#a78bfa", marginTop: "1px" }}>rest</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day — Study Blocks */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: 0 }}>
              {selectedDay}
              {selectedDay === todayName && (
                <span style={{ marginLeft: "0.5rem", fontSize: "0.7rem", background: "rgba(124,58,237,0.2)", border: "1px solid #7c3aed44", color: "#a78bfa", borderRadius: "999px", padding: "0.15rem 0.5rem", verticalAlign: "middle" }}>Today</span>
              )}
            </h2>
            {!isRestDay && todayBlocks.length > 0 && (
              <span style={{ color: "#555", fontSize: "0.78rem" }}>
                {todayBlocks.reduce((a, b) => a + b.durationMinutes, 0)}min · {todayBlocks.length} blocks
              </span>
            )}
          </div>

          {isRestDay ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🛌</div>
              <p style={{ color: "#555", fontSize: "0.9rem", fontWeight: 500, margin: "0 0 0.3rem" }}>Rest Day</p>
              <p style={{ color: "#444", fontSize: "0.8rem", margin: 0 }}>No study blocks scheduled. Recover, reflect, and recharge.</p>
            </div>
          ) : todayBlocks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
              <p style={{ color: "#555", fontSize: "0.85rem" }}>No study blocks for this day.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {todayBlocks.map((block) => (
                <div key={block.id} style={{
                  display: "flex", alignItems: "flex-start", gap: "1rem",
                  padding: "1rem", background: "#141414", borderRadius: "12px",
                  border: "1px solid #1e1e1e", transition: "all 0.15s",
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#7c3aed33"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#1e1e1e"; }}
                >
                  {/* Time column */}
                  <div style={{ flexShrink: 0, minWidth: isMobile ? "70px" : "90px" }}>
                    <div style={{ color: "#a78bfa", fontSize: "0.78rem", fontWeight: 700 }}>{block.time.split(" - ")[0]}</div>
                    <div style={{ color: "#555", fontSize: "0.7rem" }}>→ {block.time.split(" - ")[1]}</div>
                  </div>
                  {/* Purple line */}
                  <div style={{ width: "3px", height: "100%", minHeight: "40px", background: "#7c3aed", borderRadius: "999px", flexShrink: 0 }} />
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#e0e0e0", marginBottom: "0.2rem" }}>{block.subject}</div>
                    <div style={{ fontSize: "0.78rem", color: "#888", marginBottom: "0.15rem" }}>{block.method}</div>
                    {block.notes && <div style={{ fontSize: "0.73rem", color: "#555", fontStyle: "italic" }}>{block.notes}</div>}
                  </div>
                  {/* Duration */}
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#e0e0e0" }}>{block.durationMinutes}m</div>
                    <div style={{ fontSize: "0.68rem", color: "#555" }}>{(block.durationMinutes / 60).toFixed(1)}h</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily Routine */}
        <div style={card}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: "0 0 1.25rem" }}>
            Daily Routine Template
          </h2>
          <p style={{ color: "#666", fontSize: "0.8rem", margin: "0 0 1.25rem" }}>
            Your fixed daily structure — applies every day regardless of study load.
          </p>

          {(dailyRoutine ?? []).length === 0 ? (
            <p style={{ color: "#555", fontSize: "0.85rem" }}>No routine blocks defined.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {dailyRoutine.map((block) => {
                const color = CAT_COLOR[block.category] ?? "#a78bfa";
                return (
                  <div key={block.id} style={{
                    display: "flex", alignItems: "center", gap: "0.85rem",
                    padding: "0.75rem 1rem", background: "#141414", borderRadius: "10px",
                    border: "1px solid #1e1e1e", transition: "all 0.15s",
                  }}>
                    <div style={{ width: "4px", height: "36px", background: color, borderRadius: "999px", flexShrink: 0 }} />
                    <div style={{ minWidth: isMobile ? "70px" : "90px", flexShrink: 0 }}>
                      <div style={{ color: "#888", fontSize: "0.75rem", fontWeight: 600 }}>{block.timeBlock}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: "0.85rem", color: "#d0d0d0", marginBottom: "0.1rem" }}>{block.activity}</div>
                      {block.notes && <div style={{ fontSize: "0.72rem", color: "#555" }}>{block.notes}</div>}
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <span style={{
                        padding: "0.18rem 0.55rem", borderRadius: "999px", fontSize: "0.68rem", fontWeight: 600,
                        background: `${color}15`, border: `1px solid ${color}30`, color,
                        textTransform: "capitalize",
                      }}>{block.category.replace("_", " ")}</span>
                    </div>
                    {block.isFlexible && (
                      <span style={{ fontSize: "0.65rem", color: "#555", flexShrink: 0 }}>flex</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Weekly Summary */}
        <div style={card}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: "0 0 1.25rem" }}>
            Weekly Summary
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(4,1fr)" : "repeat(7,1fr)", gap: "0.5rem" }}>
            {DAYS.map((day) => {
              const dayData = weeklySchedule.find((d) => d.day === day);
              const isRest = dayData?.isRestDay ?? false;
              const dayMinutes = (dayData?.blocks ?? []).reduce((a, b) => a + b.durationMinutes, 0);
              const dayHours = (dayMinutes / 60).toFixed(1);
              const isToday = day === todayName;
              const isSelected = day === selectedDay;
              const maxHours = 8;
              const barHeight = isRest ? 0 : Math.min(100, (dayMinutes / (maxHours * 60)) * 100);

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  style={{ textAlign: "center", cursor: "pointer", padding: "0.75rem 0.5rem", borderRadius: "10px", background: isSelected ? "rgba(124,58,237,0.08)" : "transparent", border: `1px solid ${isSelected ? "#7c3aed33" : "transparent"}`, transition: "all 0.15s" }}
                >
                  <div style={{ color: isToday ? "#a78bfa" : "#555", fontSize: "0.68rem", fontWeight: isToday ? 700 : 500, marginBottom: "0.5rem" }}>{day.slice(0, 3)}</div>
                  <div style={{ height: "60px", display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: "0.4rem" }}>
                    <div style={{
                      width: "24px", height: `${barHeight}%`, minHeight: isRest ? "0" : "4px",
                      background: isRest ? "transparent" : isSelected ? "#7c3aed" : "#2a2a2a",
                      borderRadius: "4px 4px 0 0", transition: "height 0.4s ease",
                    }} />
                  </div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 600, color: isRest ? "#333" : isSelected ? "#a78bfa" : "#666" }}>
                    {isRest ? "—" : `${dayHours}h`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
