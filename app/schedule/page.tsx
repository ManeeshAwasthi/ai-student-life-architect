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
  study:     "#7C5CFC",
  deep_work: "#A855F7",
  health:    "#22C55E",
  rest:      "#8B91B5",
  admin:     "#3B82F6",
  meal:      "#FF6B35",
  social:    "#F59E0B",
};

const SUBJECT_COLOR: Record<string, string> = {
  Mathematics: "#7C5CFC",
  Physics:     "#3B82F6",
  Chemistry:   "#22C55E",
  Revision:    "#FF6B35",
  default:     "#7C5CFC",
};

function getSubjectColor(name: string): string {
  return SUBJECT_COLOR[name] ?? SUBJECT_COLOR.default;
}

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
    const check = () => setIsMobile(window.innerWidth < 768);
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
      <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, border: "3px solid var(--bg-overlay)", borderTop: "3px solid var(--brand-primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  const { weeklySchedule, dailyRoutine } = masterPlan;

  const selectedDayData    = weeklySchedule.find((d) => d.day === selectedDay);
  const isRestDay          = selectedDayData?.isRestDay ?? false;
  const todayBlocks        = selectedDayData?.blocks ?? [];

  const totalWeeklyMinutes = weeklySchedule.reduce(
    (acc, day) => acc + (day.blocks ?? []).reduce((a, b) => a + b.durationMinutes, 0), 0
  );
  const totalWeeklyHours   = (totalWeeklyMinutes / 60).toFixed(1);
  const selectedDayMinutes = todayBlocks.reduce((a, b) => a + b.durationMinutes, 0);
  const selectedDayHours   = (selectedDayMinutes / 60).toFixed(1);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", paddingBottom: "var(--space-16)", position: "relative" }}>
      {/* Ambient orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "8%", right: "12%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)", animation: "float 16s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "18%", left: "8%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,92,252,0.05) 0%, transparent 70%)", animation: "float 20s ease-in-out infinite reverse" }} />
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "var(--space-10) var(--space-8) 0", position: "relative", zIndex: 1 }}>

        {/* ── Header ── */}
        <div className="stagger-1" style={{ marginBottom: "var(--space-10)" }}>
          <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: "var(--space-2)" }}>Planner</div>
          <h1 className="text-display" style={{ color: "var(--text-primary)", margin: "0 0 var(--space-2)" }}>
            {studentProfile.name.split(" ")[0]}&apos;s Week
          </h1>
          <p className="text-body" style={{ color: "var(--text-secondary)", margin: 0 }}>
            <span style={{ color: "var(--brand-primary)", fontWeight: 600 }}>{totalWeeklyHours}h</span> planned this week
          </p>
        </div>

        {/* ── Calendar strip ── */}
        <div className="stagger-2" style={{ marginBottom: "var(--space-6)" }}>
          <div style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-2)",
            display: "flex",
            gap: "var(--space-1)",
            overflowX: "auto",
          }}>
            {DAYS.map((day) => {
              const dayData    = weeklySchedule.find((d) => d.day === day);
              const isRest     = dayData?.isRestDay ?? false;
              const blockCount = dayData?.blocks?.length ?? 0;
              const isToday    = day === todayName;
              const isSelected = day === selectedDay;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  style={{
                    flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    padding: "var(--space-3) var(--space-2)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    background: isSelected
                      ? "var(--brand-primary)"
                      : isToday
                      ? "var(--brand-glow)"
                      : "transparent",
                    borderColor: isSelected
                      ? "transparent"
                      : isToday
                      ? "var(--border-emphasis)"
                      : "transparent",
                    fontFamily: "var(--font-body)",
                    minWidth: isMobile ? 44 : 60,
                    flexShrink: 0,
                  }}
                >
                  <span className="text-label" style={{
                    color: isSelected ? "#fff" : isToday ? "var(--brand-primary)" : "var(--text-secondary)",
                  }}>
                    {DAY_SHORT[day]}
                  </span>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: isRest
                      ? "transparent"
                      : isSelected
                      ? "rgba(255,255,255,0.6)"
                      : blockCount > 0
                      ? "var(--brand-primary)"
                      : "transparent",
                    border: isRest ? "1px solid var(--text-disabled)" : "none",
                  }} />
                  <span style={{
                    fontSize: 10, color: isSelected ? "rgba(255,255,255,0.7)" : "var(--text-tertiary)",
                    fontFamily: "var(--font-body)",
                  }}>
                    {isRest ? "rest" : `${blockCount}blk`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Day summary pills */}
          <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-3)", flexWrap: "wrap" }}>
            {selectedDay === todayName && (
              <span style={{ padding: "4px 10px", borderRadius: "var(--radius-full)", background: "var(--brand-glow)", border: "1px solid var(--border-emphasis)", color: "var(--brand-primary)", fontSize: 11, fontFamily: "var(--font-body)", fontWeight: 700 }}>TODAY</span>
            )}
            {!isRestDay && todayBlocks.length > 0 && (
              <>
                <span style={{ padding: "4px 10px", borderRadius: "var(--radius-full)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", fontSize: 11, fontFamily: "var(--font-body)" }}>{todayBlocks.length} blocks</span>
                <span style={{ padding: "4px 10px", borderRadius: "var(--radius-full)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", fontSize: 11, fontFamily: "var(--font-body)" }}>{selectedDayHours}h study</span>
              </>
            )}
            {isRestDay && (
              <span style={{ padding: "4px 10px", borderRadius: "var(--radius-full)", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#22C55E", fontSize: 11, fontFamily: "var(--font-body)" }}>Rest day</span>
            )}
          </div>
        </div>

        {/* ── Study blocks ── */}
        <div className="stagger-3 card" style={{ marginBottom: "var(--space-6)" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "var(--space-5)" }}>
            <div>
              <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: 4 }}>Schedule</div>
              <div className="text-h1" style={{ color: "var(--text-primary)" }}>Study Blocks — {selectedDay}</div>
            </div>
          </div>

          {isRestDay ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "var(--space-10) 0", gap: "var(--space-3)" }}>
              <span style={{ fontSize: 44, animation: "float 4s ease-in-out infinite" }}>🌿</span>
              <h3 className="text-h2" style={{ color: "var(--text-primary)", margin: 0 }}>Rest & Recharge</h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)", textAlign: "center", margin: 0, maxWidth: 300 }}>No study blocks scheduled. Recover, reflect, and come back stronger.</p>
            </div>
          ) : todayBlocks.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-tertiary)", textAlign: "center", padding: "var(--space-8) 0" }}>No study blocks for this day.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {todayBlocks.map((block) => {
                const color = getSubjectColor(block.subject);
                return (
                  <div key={block.id} className="card" style={{ borderLeft: `3px solid ${color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div className="text-label" style={{ color, marginBottom: 4 }}>{block.method}</div>
                        <div className="text-h2" style={{ color: "var(--text-primary)" }}>{block.subject}</div>
                      </div>
                      <div className="text-sm" style={{ color: "var(--text-tertiary)" }}>{block.durationMinutes}m</div>
                    </div>
                    <div style={{ marginTop: "var(--space-3)", display: "flex", gap: "var(--space-2)" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center",
                        padding: "3px 10px", borderRadius: "var(--radius-full)",
                        background: `${color}18`, border: `1px solid ${color}30`,
                        color, fontSize: 11, fontWeight: 500, fontFamily: "var(--font-body)",
                      }}>{block.method}</span>
                    </div>
                    <div style={{ marginTop: "var(--space-4)" }}>
                      <span className="text-sm" style={{ color: "var(--text-tertiary)", fontFamily: "monospace" }}>
                        {block.time} — {(() => {
                          const [h, m] = block.time.split(":").map(Number);
                          const end = new Date();
                          end.setHours(h, m + block.durationMinutes, 0);
                          return end.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
                        })()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Daily Routine ── */}
        {(dailyRoutine ?? []).length > 0 && (
          <div className="stagger-4 card" style={{ marginBottom: "var(--space-6)" }}>
            <div style={{ marginBottom: "var(--space-5)" }}>
              <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: 4 }}>Daily</div>
              <div className="text-h1" style={{ color: "var(--text-primary)" }}>Fixed Routine</div>
              <p className="text-sm" style={{ color: "var(--text-secondary)", margin: "var(--space-2) 0 0" }}>Your fixed daily structure — applies every day.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {dailyRoutine.map((block) => {
                const color = CAT_COLOR[block.category] ?? "var(--brand-primary)";
                return (
                  <div key={block.id} style={{
                    display: "flex", alignItems: "center", gap: "var(--space-3)",
                    padding: "var(--space-3) var(--space-4)",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    transition: "border-color 0.18s ease",
                  }}>
                    <div style={{ width: 3, height: 32, background: color, borderRadius: "var(--radius-full)", flexShrink: 0 }} />
                    <div style={{ minWidth: isMobile ? 72 : 90, flexShrink: 0 }}>
                      <span className="text-sm" style={{ color: "var(--text-secondary)", fontFamily: "monospace" }}>{block.timeBlock}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span className="text-sm" style={{ color: "var(--text-primary)", fontWeight: 500 }}>{block.activity}</span>
                    </div>
                    <div style={{ flexShrink: 0, display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                      <span style={{
                        padding: "2px 8px", borderRadius: "var(--radius-full)", fontSize: 10, fontWeight: 600,
                        background: `${color}15`, border: `1px solid ${color}30`, color,
                        textTransform: "capitalize", fontFamily: "var(--font-body)",
                      }}>{block.category.replace("_", " ")}</span>
                      {block.isFlexible && (
                        <span className="text-label" style={{ color: "var(--text-tertiary)" }}>flex</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Week at a glance ── */}
        <div className="stagger-5 card">
          <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: 4 }}>Overview</div>
          <div className="text-h1" style={{ color: "var(--text-primary)", marginBottom: "var(--space-6)" }}>Week at a Glance</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "var(--space-2)" }}>
            {DAYS.map((day) => {
              const dayData  = weeklySchedule.find((d) => d.day === day);
              const isRest   = dayData?.isRestDay ?? false;
              const mins     = (dayData?.blocks ?? []).reduce((a, b) => a + b.durationMinutes, 0);
              const hrs      = (mins / 60).toFixed(1);
              const isToday  = day === todayName;
              const isSel    = day === selectedDay;
              const maxH     = 8;
              const barPct   = isRest ? 0 : Math.min(100, (mins / (maxH * 60)) * 100);
              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    textAlign: "center", cursor: "pointer",
                    padding: "var(--space-3) var(--space-2)",
                    borderRadius: "var(--radius-md)",
                    background: isSel ? "var(--brand-glow)" : "transparent",
                    border: `1px solid ${isSel ? "var(--border-emphasis)" : "transparent"}`,
                    transition: "all 0.18s",
                  }}
                >
                  <div className="text-label" style={{ color: isToday ? "var(--brand-primary)" : "var(--text-tertiary)", marginBottom: "var(--space-2)" }}>
                    {DAY_SHORT[day]}
                  </div>
                  <div style={{ height: 52, display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: "var(--space-2)" }}>
                    <div style={{
                      width: 20,
                      height: isRest ? 2 : `${Math.max(barPct, mins > 0 ? 8 : 0)}%`,
                      minHeight: mins > 0 ? 4 : 0,
                      background: isRest ? "var(--border-subtle)" : isSel ? "var(--brand-primary)" : "var(--bg-overlay)",
                      borderRadius: "3px 3px 0 0",
                      transition: "height 0.4s ease",
                    }} />
                  </div>
                  <div className="text-label" style={{ color: isRest ? "var(--text-disabled)" : isSel ? "var(--brand-primary)" : "var(--text-tertiary)" }}>
                    {isRest ? "—" : `${hrs}h`}
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
