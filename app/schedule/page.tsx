"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
type DayName = typeof DAYS[number];

const DAY_SHORT: Record<DayName, string> = {
  Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu",
  Friday: "Fri", Saturday: "Sat", Sunday: "Sun",
};

const CAT_COLOR: Record<string, string> = {
  study:    "#6c63ff",
  deep_work:"#a594ff",
  health:   "#00d4aa",
  rest:     "#8888aa",
  admin:    "#6c63ff",
  meal:     "#ffb347",
  social:   "#ff6b9d",
};

const SUBJECT_COLOR: Record<string, string> = {
  Mathematics: "#6c63ff",
  Physics:     "#00d4aa",
  Chemistry:   "#ff6b9d",
  Revision:    "#ffb347",
  default:     "#6c63ff",
};

function getTodayName(): DayName {
  const day = new Date().toLocaleDateString("en-US", { weekday: "long" });
  return (DAYS.includes(day as DayName) ? day : "Monday") as DayName;
}

export default function SchedulePage() {
  const router = useRouter();
  const store  = useAppStore();
  const masterPlan     = store.masterPlan;
  const studentProfile = store.studentProfile;
  const isOnboarded    = store.isOnboarded;

  const todayName = getTodayName();
  const [selectedDay, setSelectedDay] = useState<DayName>(todayName);
  const [isMobile, setIsMobile]       = useState(false);

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
      <div style={{ minHeight: "100vh", background: "#080810", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "36px", height: "36px", border: "3px solid #1e1e35", borderTop: "3px solid #6c63ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  const { weeklySchedule, dailyRoutine } = masterPlan;

  const selectedDayData = weeklySchedule.find((d) => d.day === selectedDay);
  const isRestDay       = selectedDayData?.isRestDay ?? false;
  const todayBlocks     = selectedDayData?.blocks ?? [];

  const totalWeeklyMinutes = weeklySchedule.reduce(
    (acc, day) => acc + (day.blocks ?? []).reduce((a, b) => a + b.durationMinutes, 0), 0
  );
  const totalWeeklyHours = (totalWeeklyMinutes / 60).toFixed(1);

  const selectedDayMinutes = todayBlocks.reduce((a, b) => a + b.durationMinutes, 0);
  const selectedDayHours   = (selectedDayMinutes / 60).toFixed(1);

  return (
    <>
      <style>{`
        .sched-day-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
          background: transparent;
          font-family: 'DM Sans', sans-serif;
        }
        .sched-day-tab:hover {
          background: rgba(108,99,255,0.06);
          border-color: rgba(108,99,255,0.2);
        }
        .sched-day-tab.active {
          background: rgba(108,99,255,0.12);
          border-color: rgba(108,99,255,0.3);
        }
        .sched-block {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px 16px;
          background: #0f0f1a;
          border: 1px solid #1e1e35;
          border-radius: 16px;
          transition: all 0.2s ease;
        }
        .sched-block:hover {
          transform: translateX(4px);
          border-color: rgba(108,99,255,0.25);
          background: rgba(108,99,255,0.03);
        }
        .sched-routine-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          background: #0f0f1a;
          border: 1px solid #1e1e35;
          border-radius: 12px;
          transition: all 0.18s ease;
        }
        .sched-routine-row:hover {
          border-color: rgba(108,99,255,0.18);
        }
      `}</style>

      {/* Ambient bg */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "8%", right: "12%", width: "360px", height: "360px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,170,0.05) 0%, transparent 70%)", animation: "float 16s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "18%", left: "8%", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(108,99,255,0.05) 0%, transparent 70%)", animation: "float 20s ease-in-out infinite reverse" }} />
      </div>

      <div style={{ minHeight: "100vh", background: "#080810", paddingBottom: "5rem", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: isMobile ? "32px 16px 0" : "40px 32px 0" }}>

          {/* ── Header ── */}
          <div className="stagger-1" style={{ marginBottom: "32px" }}>
            <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", marginBottom: "8px" }}>WEEKLY SCHEDULE</p>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: isMobile ? "1.8rem" : "2.2rem", color: "#f0f0ff", letterSpacing: "-0.03em", margin: "0 0 8px" }}>
              {studentProfile.name.split(" ")[0]}&apos;s Week
            </h1>
            <p style={{ color: "#8888aa", fontSize: "14px", margin: 0 }}>
              <span style={{ fontFamily: "'DM Mono', monospace", color: "#a594ff" }}>{totalWeeklyHours}h</span> total study this week
            </p>
          </div>

          {/* ── Day switcher ── */}
          <div className="stagger-2" style={{ marginBottom: "20px" }}>
            <div style={{
              background: "#0f0f1a",
              border: "1px solid #1e1e35",
              borderRadius: "16px",
              padding: "6px",
              display: "flex",
              gap: "4px",
              overflowX: "auto",
            }}>
              {DAYS.map((day) => {
                const dayData   = weeklySchedule.find((d) => d.day === day);
                const isRest    = dayData?.isRestDay ?? false;
                const blockCount = dayData?.blocks?.length ?? 0;
                const isToday   = day === todayName;
                const isSelected = day === selectedDay;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`sched-day-tab${isSelected ? " active" : ""}`}
                  >
                    <span style={{
                      fontSize: "12px",
                      fontWeight: isToday ? 700 : 500,
                      color: isSelected ? "#a594ff" : isToday ? "#f0f0ff" : "#8888aa",
                    }}>
                      {DAY_SHORT[day]}
                    </span>
                    {/* Dot indicator */}
                    <div style={{
                      width: "5px", height: "5px", borderRadius: "50%",
                      background: isRest ? "transparent"
                        : isSelected ? "#6c63ff"
                        : blockCount > 0 ? "#44445a"
                        : "transparent",
                      boxShadow: isSelected && !isRest ? "0 0 6px rgba(108,99,255,0.7)" : "none",
                      border: isRest ? "1px solid #44445a" : "none",
                    }} />
                  </button>
                );
              })}
            </div>

            {/* Day summary chips */}
            <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap", alignItems: "center" }}>
              {selectedDay === todayName && (
                <span style={{ padding: "4px 10px", borderRadius: "999px", background: "rgba(108,99,255,0.12)", border: "1px solid rgba(108,99,255,0.25)", color: "#a594ff", fontSize: "11px", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>TODAY</span>
              )}
              {!isRestDay && todayBlocks.length > 0 && (
                <>
                  <span style={{ padding: "4px 10px", borderRadius: "999px", background: "#12121e", border: "1px solid #1e1e35", color: "#8888aa", fontSize: "11px", fontFamily: "'DM Mono', monospace" }}>{todayBlocks.length} blocks</span>
                  <span style={{ padding: "4px 10px", borderRadius: "999px", background: "#12121e", border: "1px solid #1e1e35", color: "#8888aa", fontSize: "11px", fontFamily: "'DM Mono', monospace" }}>{selectedDayHours}h study</span>
                </>
              )}
              {isRestDay && (
                <span style={{ padding: "4px 10px", borderRadius: "999px", background: "rgba(0,212,170,0.08)", border: "1px solid rgba(0,212,170,0.2)", color: "#00d4aa", fontSize: "11px", fontFamily: "'DM Mono', monospace" }}>Rest day</span>
              )}
            </div>
          </div>

          {/* ── Study blocks ── */}
          <div className="stagger-3" style={{
            background: "#12121e", border: "1px solid #1e1e35", borderRadius: "20px",
            padding: "24px", marginBottom: "20px",
          }}>
            <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "18px" }}>
              STUDY BLOCKS — {selectedDay.toUpperCase()}
            </p>

            {isRestDay ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0", gap: "14px" }}>
                <span style={{ fontSize: "44px", animation: "float 4s ease-in-out infinite" }}>🌿</span>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "20px", color: "#f0f0ff", margin: 0 }}>Rest & Recharge</h3>
                <p style={{ color: "#8888aa", fontSize: "14px", textAlign: "center", margin: 0, maxWidth: "300px", lineHeight: 1.6 }}>No study blocks scheduled. Recover, reflect, and come back stronger.</p>
              </div>
            ) : todayBlocks.length === 0 ? (
              <p style={{ color: "#44445a", fontSize: "14px", textAlign: "center", padding: "32px 0" }}>No study blocks for this day.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {todayBlocks.map((block, i) => {
                  const color = SUBJECT_COLOR[block.subject] ?? SUBJECT_COLOR.default;
                  return (
                    <div key={block.id} className="sched-block" style={{ animationDelay: `${i * 0.06}s` }}>
                      {/* Time */}
                      <div style={{ minWidth: isMobile ? "52px" : "64px", flexShrink: 0 }}>
                        <div style={{ color: "#6c63ff", fontSize: "13px", fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>{block.time}</div>
                        <div style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", marginTop: "2px" }}>{block.durationMinutes}m</div>
                      </div>
                      {/* Accent bar */}
                      <div style={{ width: "3px", minHeight: "44px", background: color, borderRadius: "999px", flexShrink: 0 }} />
                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "14px", color: "#f0f0ff", marginBottom: "3px" }}>{block.subject}</div>
                        <span style={{
                          display: "inline-block", padding: "2px 8px", borderRadius: "6px", fontSize: "11px",
                          background: `${color}18`, border: `1px solid ${color}33`, color, marginBottom: "4px",
                        }}>{block.method}</span>
                        {block.notes && <div style={{ fontSize: "12px", color: "#8888aa", fontStyle: "italic", marginTop: "2px" }}>{block.notes}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Daily Routine ── */}
          {(dailyRoutine ?? []).length > 0 && (
            <div className="stagger-4" style={{
              background: "#12121e", border: "1px solid #1e1e35", borderRadius: "20px",
              padding: "24px", marginBottom: "20px",
            }}>
              <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "6px" }}>
                DAILY ROUTINE
              </p>
              <p style={{ color: "#8888aa", fontSize: "13px", margin: "0 0 18px", lineHeight: 1.5 }}>
                Your fixed daily structure — applies every day.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {dailyRoutine.map((block, i) => {
                  const color = CAT_COLOR[block.category] ?? "#6c63ff";
                  return (
                    <div key={block.id} className="sched-routine-row" style={{ animationDelay: `${i * 0.04}s` }}>
                      <div style={{ width: "3px", height: "32px", background: color, borderRadius: "999px", flexShrink: 0 }} />
                      <div style={{ minWidth: isMobile ? "72px" : "90px", flexShrink: 0 }}>
                        <div style={{ color: "#8888aa", fontSize: "11px", fontFamily: "'DM Mono', monospace" }}>{block.timeBlock}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", color: "#d8d8ee", fontWeight: 500 }}>{block.activity}</div>
                      </div>
                      <div style={{ flexShrink: 0, display: "flex", gap: "6px", alignItems: "center" }}>
                        <span style={{
                          padding: "2px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 600,
                          background: `${color}15`, border: `1px solid ${color}30`, color,
                          textTransform: "capitalize",
                        }}>{block.category.replace("_", " ")}</span>
                        {block.isFlexible && (
                          <span style={{ fontSize: "10px", color: "#44445a" }}>flex</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Weekly bar summary ── */}
          <div className="stagger-5" style={{
            background: "#12121e", border: "1px solid #1e1e35", borderRadius: "20px",
            padding: "24px",
          }}>
            <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "20px" }}>
              WEEK AT A GLANCE
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "8px" }}>
              {DAYS.map((day) => {
                const dayData  = weeklySchedule.find((d) => d.day === day);
                const isRest   = dayData?.isRestDay ?? false;
                const mins     = (dayData?.blocks ?? []).reduce((a, b) => a + b.durationMinutes, 0);
                const hrs      = (mins / 60).toFixed(1);
                const isToday  = day === todayName;
                const isSel    = day === selectedDay;
                const maxH     = 8;
                const barH     = isRest ? 0 : Math.min(100, (mins / (maxH * 60)) * 100);
                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    style={{
                      textAlign: "center", cursor: "pointer",
                      padding: "10px 6px", borderRadius: "12px",
                      background: isSel ? "rgba(108,99,255,0.08)" : "transparent",
                      border: `1px solid ${isSel ? "rgba(108,99,255,0.25)" : "transparent"}`,
                      transition: "all 0.18s",
                    }}
                  >
                    <div style={{ color: isToday ? "#a594ff" : "#44445a", fontSize: "10px", fontWeight: isToday ? 700 : 500, marginBottom: "8px", fontFamily: "'DM Mono', monospace" }}>
                      {DAY_SHORT[day]}
                    </div>
                    <div style={{ height: "52px", display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: "6px" }}>
                      <div style={{
                        width: "20px",
                        height: isRest ? "2px" : `${Math.max(barH, mins > 0 ? 8 : 0)}%`,
                        minHeight: mins > 0 ? "4px" : "0",
                        background: isRest ? "#1e1e35" : isSel ? "#6c63ff" : "#2a2a45",
                        borderRadius: "4px 4px 0 0",
                        transition: "height 0.4s ease",
                      }} />
                    </div>
                    <div style={{ fontSize: "10px", fontFamily: "'DM Mono', monospace", color: isRest ? "#2a2a45" : isSel ? "#a594ff" : "#44445a" }}>
                      {isRest ? "—" : `${hrs}h`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
