"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import type { Habit, StudentProfile, MasterPlan } from "@/lib/types";
import { Flame, CheckCircle2, Timer, Zap, Brain } from "lucide-react";

// ─── DEV BYPASS ───────────────────────────────────────────────────────────────
const MOCK_PROFILE: StudentProfile = {
  name: "Maneesh Awasthi",
  age: 20,
  educationLevel: "high_school",
  fieldOfStudy: "Engineering",
  subjects: ["Mathematics", "Physics", "Chemistry"],
  examGoals: "JEE Advanced 2025",
  dailyStudyHoursAvailable: 8,
  currentPerformance: "Average, scoring around 60%",
  wakeUpTime: "06:00",
  sleepTime: "23:00",
  currentStudyMethod: "Reading textbooks and solving some problems",
  averageSessionLength: 60,
  biggestDistractions: ["Phone", "YouTube", "Instagram"],
  procrastinationLevel: 4,
  energyPeakTime: "morning",
  stressLevel: 4,
  burnoutSymptoms: false,
  exerciseFrequency: "rarely",
  screenTimePerDay: 5,
  socialMediaApps: ["Instagram", "YouTube"],
  primaryGoal: "Get into IIT",
  coachPersonality: "strict",
  previousSystemsTried: "Pomodoro, various apps, nothing stuck",
};

const MOCK_PLAN: MasterPlan = {
  diagnosis: {
    primaryProblems: [
      "Passive study methods with no active recall",
      "Chronic phone-driven distraction breaking focus cycles",
      "No structured revision system causing rapid forgetting",
    ],
    rootCauses: [
      "Lack of accountability and external structure",
      "Dopamine dependency on short-form content",
    ],
    psychologicalProfile: "High-potential underperformer with strong ability but weak systems",
    urgencyLevel: "high",
    keyInsight: "You're not short on intelligence — you're short on structure. Fix the system, and the marks will follow.",
    strengths: [
      "High intrinsic motivation (IIT goal)",
      "Self-aware about weaknesses",
      "8 hours of available daily study time",
    ],
  },
  strategy: {
    primaryStudyMethod: "Active Recall + Spaced Repetition",
    primaryMethodDescription: "Close the book after reading each section and write down everything you remember.",
    secondaryMethod: "Feynman Technique",
    subjects: [
      { subject: "Mathematics", priority: "high", weeklyHours: 14, reason: "Highest scoring potential", recommendedMethod: "Problem sets with active recall" },
      { subject: "Physics", priority: "high", weeklyHours: 12, reason: "Concept-heavy", recommendedMethod: "Concept mapping + problem practice" },
      { subject: "Chemistry", priority: "medium", weeklyHours: 10, reason: "Memorisation-heavy", recommendedMethod: "Flashcards + practice problems" },
    ],
    weeklyStudyHours: 36,
    sessionLength: 90,
    breakDuration: 15,
  },
  dailyRoutine: [
    { id: "dr1", timeBlock: "06:00–06:30", activity: "Wake up, hydrate, no phone", category: "health", isFlexible: false },
    { id: "dr2", timeBlock: "06:30–08:00", activity: "Mathematics — deep work block 1", category: "deep_work", isFlexible: false },
    { id: "dr3", timeBlock: "08:00–08:30", activity: "Breakfast + short walk", category: "meal", isFlexible: true },
    { id: "dr4", timeBlock: "08:30–10:00", activity: "Physics — concept + problems", category: "study", isFlexible: false },
    { id: "dr5", timeBlock: "10:00–10:15", activity: "Break — no screens", category: "rest", isFlexible: false },
  ],
  weeklySchedule: [
    { day: "Monday", isRestDay: false, blocks: [
      { id: "b1", time: "06:30", subject: "Mathematics", method: "Active Recall", durationMinutes: 90 },
      { id: "b2", time: "08:30", subject: "Physics", method: "Concept Mapping", durationMinutes: 90 },
      { id: "b3", time: "13:00", subject: "Chemistry", method: "Flashcards", durationMinutes: 90 },
    ]},
    { day: "Tuesday", isRestDay: false, blocks: [
      { id: "b5", time: "06:30", subject: "Physics", method: "Problem Solving", durationMinutes: 90 },
      { id: "b6", time: "08:30", subject: "Mathematics", method: "Problem Sets", durationMinutes: 90 },
      { id: "b7", time: "13:00", subject: "Chemistry", method: "Active Recall", durationMinutes: 90 },
    ]},
    { day: "Wednesday", isRestDay: false, blocks: [
      { id: "b9", time: "06:30", subject: "Mathematics", method: "Active Recall", durationMinutes: 90 },
      { id: "b10", time: "08:30", subject: "Chemistry", method: "Problem Solving", durationMinutes: 90 },
      { id: "b11", time: "13:00", subject: "Physics", method: "Feynman Technique", durationMinutes: 90 },
    ]},
    { day: "Thursday", isRestDay: false, blocks: [
      { id: "b13", time: "06:30", subject: "Physics", method: "Active Recall", durationMinutes: 90 },
      { id: "b14", time: "08:30", subject: "Mathematics", method: "Problem Sets", durationMinutes: 90 },
      { id: "b15", time: "13:00", subject: "Chemistry", method: "Flashcards", durationMinutes: 90 },
    ]},
    { day: "Friday", isRestDay: false, blocks: [
      { id: "b17", time: "06:30", subject: "Mathematics", method: "Mock Test", durationMinutes: 90 },
      { id: "b18", time: "08:30", subject: "Physics", method: "Mock Test", durationMinutes: 90 },
      { id: "b19", time: "13:00", subject: "Chemistry", method: "Mock Test", durationMinutes: 90 },
    ]},
    { day: "Saturday", isRestDay: false, blocks: [
      { id: "b21", time: "09:00", subject: "Mathematics", method: "Problem Solving", durationMinutes: 120 },
      { id: "b22", time: "13:00", subject: "Physics", method: "Problem Solving", durationMinutes: 120 },
    ]},
    { day: "Sunday", isRestDay: true, blocks: [] },
  ],
  habitSystem: [
    { id: "h1", habit: "No phone for first 30 mins after waking", frequency: "daily", category: "lifestyle", whyItMatters: "Breaks the dopamine-first-thing cycle", streak: 0, completedToday: false, completionHistory: [] },
    { id: "h2", habit: "Complete at least 3 study blocks", frequency: "daily", category: "study", whyItMatters: "Non-negotiable daily minimum for JEE", streak: 0, completedToday: false, completionHistory: [] },
    { id: "h3", habit: "Active recall on one topic before moving on", frequency: "daily", category: "study", whyItMatters: "Prevents passive reading trap", streak: 0, completedToday: false, completionHistory: [] },
    { id: "h4", habit: "Phone in another room during study blocks", frequency: "daily", category: "focus", whyItMatters: "Even phone presence reduces focus by 10%", streak: 0, completedToday: false, completionHistory: [] },
    { id: "h5", habit: "Write daily review (3 things learned)", frequency: "daily", category: "mindset", whyItMatters: "Reinforces memory and builds metacognition", streak: 0, completedToday: false, completionHistory: [] },
    { id: "h6", habit: "30-minute exercise or walk", frequency: "daily", category: "health", whyItMatters: "BDNF directly improves memory and focus", streak: 0, completedToday: false, completionHistory: [] },
    { id: "h7", habit: "Weekly mock test (1 subject)", frequency: "weekly", category: "study", whyItMatters: "Simulates exam pressure, reveals actual gaps", streak: 0, completedToday: false, completionHistory: [] },
  ],
  distractionControl: {
    topDistractions: ["Phone", "YouTube", "Instagram"],
    blockingRules: ["Phone stays in a separate room during all study blocks"],
    environmentSetup: ["Study at a desk only"],
    emergencyProtocol: "If you pick up your phone mid-session, restart the entire session from scratch.",
    phonePolicy: "Phone is locked away during all study blocks.",
  },
  resources: {
    books: [{ title: "HC Verma — Concepts of Physics", reason: "Best conceptual foundation for JEE Physics" }],
    podcasts: [],
    techniques: [{ name: "Active Recall", description: "Close the book and retrieve information", howToUse: "After each section, write everything you remember" }],
    tools: [{ name: "Anki", purpose: "Spaced repetition flashcards", free: true }],
  },
  weeklyReview: {
    checklistItems: ["Did I complete all planned study blocks this week?"],
    progressMetrics: [
      { metric: "Study blocks completed", target: 28, current: 0, unit: "blocks" },
      { metric: "Weekly study hours", target: 36, current: 0, unit: "hours" },
    ],
    reviewQuestions: ["Where did I lose focus this week, and why?"],
  },
  meta: {
    generatedAt: new Date().toISOString(),
    studentName: "Maneesh Awasthi",
    planVersion: 1,
  },
};
// ──────────────────────────────────────────────────────────────────────────────

function getGreeting(name: string): string {
  const hour  = new Date().getHours();
  const first = name.split(" ")[0];
  if (hour < 12) return `Good morning, ${first}`;
  if (hour < 17) return `Good afternoon, ${first}`;
  return `Good evening, ${first}`;
}

function getDateLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", day: "numeric", month: "long",
  });
}

function useCountUp(target: number, duration = 900) {
  const [count, setCount] = useState(0);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    startRef.current = null;
    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min((ts - startRef.current) / duration, 1);
      setCount(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
}

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: "#7C5CFC",
  Physics:     "#3B82F6",
  Chemistry:   "#22C55E",
  Revision:    "#FF6B35",
  default:     "#7C5CFC",
};

function subjectColor(name: string): string {
  return SUBJECT_COLORS[name] ?? SUBJECT_COLORS.default;
}

const HABIT_CATEGORY_ICON: Record<string, string> = {
  lifestyle: "🌅", study: "📚", focus: "🎯", mindset: "🧠", health: "💪",
};

export default function DashboardPage() {
  const router            = useRouter();
  const store             = useAppStore();
  const studentProfile    = store.studentProfile;
  const masterPlan        = store.masterPlan;
  const habitCompletions  = store.habitCompletions;
  const currentStreak     = store.currentStreak;
  const studyHoursToday   = store.studyHoursToday;
  const toggleHabit       = store.toggleHabit;

  const [todayHabits, setTodayHabits] = useState<Habit[]>([]);
  const [greeting, setGreeting]       = useState("");
  const [dateLabel, setDateLabel]     = useState("");
  const [mounted, setMounted]         = useState(false);

  useEffect(() => { setMounted(true); setDateLabel(getDateLabel()); }, []);
  useEffect(() => { if (studentProfile) setGreeting(getGreeting(studentProfile.name)); }, [studentProfile]);
  useEffect(() => {
    if (masterPlan) setTodayHabits(masterPlan.habitSystem.filter((h) => h.frequency === "daily"));
  }, [masterPlan]);

  function loadTestData() {
    store.setStudentProfile(MOCK_PROFILE);
    store.setMasterPlan(MOCK_PLAN);
    store.setIsOnboarded(true);
  }

  const streakCount = useCountUp(currentStreak, 900);

  if (!masterPlan || !studentProfile) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 36, height: 36, border: "3px solid var(--bg-overlay)", borderTop: "3px solid var(--brand-primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <button type="button" onClick={loadTestData} style={{
          padding: "8px 18px", fontSize: "12px", color: "var(--text-tertiary)",
          background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)",
          cursor: "pointer", fontFamily: "var(--font-body)", letterSpacing: "0.03em", marginTop: 8,
        }}>[dev] load test data</button>
      </div>
    );
  }

  const todayName     = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayDay      = masterPlan.weeklySchedule.find((d) => d.day === todayName);
  const isRestDay     = todayDay?.isRestDay ?? false;
  const todaySchedule = todayDay?.blocks ?? [];

  const completedHabits = todayHabits.filter((h) => habitCompletions[h.id]).length;
  const habitPercent    = todayHabits.length > 0 ? Math.round((completedHabits / todayHabits.length) * 100) : 0;

  const focusScore = Math.min(100, Math.round(
    (completedHabits / Math.max(todayHabits.length, 1)) * 60 +
    Math.min(studyHoursToday / 6, 1) * 40
  ));

  const metrics = [
    {
      label: "Day Streak",
      value: streakCount,
      unit: "days",
      icon: Flame,
      color: "#FF6B35",
      progress: Math.min(100, (currentStreak / 30) * 100),
    },
    {
      label: "Habits Done",
      value: `${completedHabits}/${todayHabits.length}`,
      unit: "today",
      icon: CheckCircle2,
      color: "#22C55E",
      progress: habitPercent,
    },
    {
      label: "Study Hours",
      value: studyHoursToday.toFixed(1),
      unit: "hrs",
      icon: Timer,
      color: "#3B82F6",
      progress: Math.min(100, (studyHoursToday / 8) * 100),
    },
    {
      label: "Focus Score",
      value: `${focusScore}%`,
      unit: "today",
      icon: Zap,
      color: "#A855F7",
      progress: focusScore,
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", paddingBottom: "var(--space-16)", position: "relative" }}>
      {/* Ambient orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "10%", left: "20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,92,252,0.07) 0%, transparent 70%)", animation: "orb-drift 14s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)", animation: "orb-drift 18s ease-in-out infinite reverse" }} />
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "var(--space-10) var(--space-8) 0", position: "relative", zIndex: 1 }}>

        {/* ── Header ── */}
        <div className="stagger-1" style={{ marginBottom: "var(--space-10)" }}>
          <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: "var(--space-2)" }}>
            {mounted ? dateLabel : ""}
          </div>
          <h1 className="text-display" style={{ color: "var(--text-primary)", margin: "0 0 var(--space-2)" }}>
            {mounted && greeting ? greeting : "Welcome back"}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)", margin: 0 }}>
            {todaySchedule.length} study blocks planned · {habitPercent}% habits done
          </p>
        </div>

        {/* ── Metric cards ── */}
        <div className="stagger-2 grid-4" style={{ marginBottom: "var(--space-6)" }}>
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="card-metric">
                <div style={{
                  width: 36, height: 36,
                  borderRadius: "var(--radius-md)",
                  background: `${m.color}18`,
                  border: `1px solid ${m.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Icon size={18} color={m.color} />
                </div>
                <div>
                  <div className="text-metric" style={{ color: m.color }}>
                    {m.value}
                  </div>
                  <div className="text-label" style={{ color: "var(--text-tertiary)", marginTop: 4 }}>
                    {m.unit} · {m.label}
                  </div>
                </div>
                <div style={{ height: 3, background: "var(--border-subtle)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${m.progress}%`, background: m.color, borderRadius: "inherit", transition: "width 1s cubic-bezier(0.16,1,0.3,1)" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Coach block ── */}
        <div className="stagger-3 card-elevated" style={{
          marginBottom: "var(--space-6)",
          background: `radial-gradient(ellipse at 0% 0%, var(--brand-glow) 0%, var(--bg-elevated) 60%)`,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-5)" }}>
            {/* Avatar */}
            <div style={{
              width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, var(--brand-primary), var(--accent-focus))",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Brain size={20} color="#fff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="text-label" style={{ color: "var(--brand-primary)", marginBottom: "var(--space-2)" }}>
                Your Coach Says
              </div>
              <p style={{
                fontSize: "1.125rem", fontWeight: 400,
                color: "var(--text-primary)", lineHeight: 1.7, margin: 0,
                fontFamily: "var(--font-body)",
              }}>
                &ldquo;{masterPlan.diagnosis.keyInsight}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* ── Habits + Schedule ── */}
        <div className="stagger-4 grid-2" style={{ marginBottom: "var(--space-6)" }}>

          {/* Daily Habits */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
              <div className="text-h2" style={{ color: "var(--text-primary)" }}>Daily Habits</div>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "3px 10px", borderRadius: "var(--radius-full)",
                background: completedHabits === todayHabits.length ? "rgba(34,197,94,0.12)" : "var(--bg-overlay)",
                border: `1px solid ${completedHabits === todayHabits.length ? "rgba(34,197,94,0.3)" : "var(--border-subtle)"}`,
                color: completedHabits === todayHabits.length ? "#22C55E" : "var(--text-tertiary)",
                fontSize: 11, fontWeight: 600,
                fontFamily: "var(--font-body)",
              }}>
                {completedHabits}/{todayHabits.length} {completedHabits === todayHabits.length ? "✓" : ""}
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: "var(--space-5)" }}>
              <div style={{ height: 6, background: "var(--border-subtle)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                <div className="progress-animated" style={{
                  height: "100%",
                  width: `${habitPercent}%`,
                  background: "linear-gradient(90deg, #22C55E, var(--brand-primary))",
                  borderRadius: "inherit",
                }} />
              </div>
            </div>

            {/* Habit list */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {todayHabits.map((habit) => {
                const done = habitCompletions[habit.id];
                const icon = HABIT_CATEGORY_ICON[habit.category] ?? "📌";
                return (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: "var(--space-3)",
                      minHeight: 48, padding: "var(--space-2) 0",
                      borderBottom: "1px solid var(--border-subtle)",
                      cursor: "pointer", userSelect: "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {/* Styled checkbox */}
                    <div style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                      border: done ? "none" : "2px solid var(--text-disabled)",
                      background: done ? "#22C55E" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      animation: done ? "check-pop 0.25s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
                      transition: "all 0.2s",
                    }}>
                      {done && <span style={{ color: "#080B14", fontSize: 10, fontWeight: 900 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
                    <span style={{
                      flex: 1, fontSize: "0.8125rem",
                      fontFamily: "var(--font-body)",
                      color: done ? "var(--text-tertiary)" : "var(--text-primary)",
                      opacity: done ? 0.4 : 1,
                      transition: "all 0.2s",
                    }}>{habit.habit}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="card">
            <div className="text-h2" style={{ color: "var(--text-primary)", marginBottom: "var(--space-4)" }}>
              Today&apos;s Schedule
            </div>

            {isRestDay ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "var(--space-8) 0", gap: "var(--space-3)" }}>
                <span style={{ fontSize: 36, animation: "float 4s ease-in-out infinite" }}>🌿</span>
                <h3 className="text-h2" style={{ color: "var(--text-primary)", margin: 0 }}>Rest & Recharge</h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)", textAlign: "center", margin: 0 }}>No study blocks today. Recover and come back stronger.</p>
              </div>
            ) : todaySchedule.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-tertiary)", textAlign: "center", padding: "var(--space-8) 0" }}>No blocks scheduled today.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                {todaySchedule.map((block, i) => {
                  const color = subjectColor(block.subject);
                  const isCurrentHour = (() => {
                    const [h] = block.time.split(":").map(Number);
                    const now = new Date().getHours();
                    return now >= h && now < h + Math.ceil(block.durationMinutes / 60);
                  })();
                  return (
                    <div key={block.id} style={{
                      display: "flex", alignItems: "flex-start", gap: "var(--space-3)",
                      padding: "var(--space-3) var(--space-4)",
                      background: isCurrentHour ? "var(--bg-overlay)" : "var(--bg-elevated)",
                      borderRadius: "var(--radius-md)",
                      border: `1px solid ${isCurrentHour ? "var(--border-emphasis)" : "var(--border-subtle)"}`,
                      transition: "all 0.2s ease",
                    }}>
                      {/* Time */}
                      <div style={{ minWidth: 52, flexShrink: 0 }}>
                        <div className="text-sm" style={{ color: "var(--brand-primary)", fontFamily: "monospace", fontWeight: 500 }}>{block.time}</div>
                        <div style={{ color: "var(--text-tertiary)", fontSize: 10, fontFamily: "monospace", marginTop: 2 }}>{block.durationMinutes}m</div>
                      </div>
                      {/* Accent bar */}
                      <div style={{ width: 3, minHeight: 36, background: color, borderRadius: "var(--radius-full)", flexShrink: 0 }} />
                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="text-h2" style={{ color: "var(--text-primary)", marginBottom: 2 }}>{block.subject}</div>
                        <span style={{
                          display: "inline-block", padding: "2px 8px", borderRadius: "var(--radius-sm)",
                          fontSize: 11, background: `${color}18`, border: `1px solid ${color}33`, color,
                          fontFamily: "var(--font-body)",
                        }}>{block.method}</span>
                      </div>
                      {/* Duration badge */}
                      <div style={{
                        padding: "2px 8px", borderRadius: "var(--radius-full)",
                        background: "var(--bg-overlay)",
                        fontSize: 11, color: "var(--text-tertiary)",
                        fontFamily: "var(--font-body)",
                        flexShrink: 0,
                      }}>{block.durationMinutes}m</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Problems section ── */}
        {masterPlan.diagnosis.primaryProblems.length > 0 && (
          <div className="stagger-5" style={{ marginBottom: "var(--space-10)" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "var(--space-6)" }}>
              <div>
                <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: 4 }}>Diagnosis</div>
                <div className="text-h1" style={{ color: "var(--text-primary)" }}>What We&apos;re Fixing</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-4)" }}>
              {masterPlan.diagnosis.primaryProblems.map((problem, i) => (
                <div key={i} className="card" style={{ borderLeft: `3px solid var(--brand-primary)` }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "var(--radius-sm)",
                    background: "var(--bg-overlay)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, marginBottom: "var(--space-3)",
                  }}>
                    {["⚠", "📵", "🔄"][i] ?? "⚠"}
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>{problem}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
