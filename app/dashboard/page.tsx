"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import type { Habit, StudentProfile, MasterPlan } from "@/lib/types";

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
      "No feedback loop to know what is actually understood",
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
    primaryMethodDescription:
      "Close the book after reading each section and write down everything you remember. Review using flashcards at increasing intervals.",
    secondaryMethod: "Feynman Technique",
    subjects: [
      { subject: "Mathematics", priority: "high", weeklyHours: 14, reason: "Highest scoring potential, needs daily practice", recommendedMethod: "Problem sets with active recall" },
      { subject: "Physics", priority: "high", weeklyHours: 12, reason: "Concept-heavy; requires understanding before solving", recommendedMethod: "Concept mapping + problem practice" },
      { subject: "Chemistry", priority: "medium", weeklyHours: 10, reason: "Memorisation-heavy; spaced repetition is key", recommendedMethod: "Flashcards + practice problems" },
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
    { id: "dr6", timeBlock: "10:15–11:45", activity: "Mathematics — deep work block 2", category: "deep_work", isFlexible: false },
    { id: "dr7", timeBlock: "12:00–13:00", activity: "Lunch + rest", category: "meal", isFlexible: true },
    { id: "dr8", timeBlock: "13:00–14:30", activity: "Chemistry — flashcards + problems", category: "study", isFlexible: false },
    { id: "dr9", timeBlock: "14:30–14:45", activity: "Break", category: "rest", isFlexible: false },
    { id: "dr10", timeBlock: "14:45–16:15", activity: "Physics — problem solving", category: "study", isFlexible: false },
    { id: "dr11", timeBlock: "17:00–17:30", activity: "Exercise / walk", category: "health", isFlexible: true },
    { id: "dr12", timeBlock: "19:00–20:30", activity: "Revision — spaced repetition session", category: "study", isFlexible: false },
    { id: "dr13", timeBlock: "20:30–21:00", activity: "Daily review — what did I learn?", category: "admin", isFlexible: false },
    { id: "dr14", timeBlock: "23:00", activity: "Sleep — phone in another room", category: "rest", isFlexible: false },
  ],
  weeklySchedule: [
    {
      day: "Monday", isRestDay: false,
      blocks: [
        { id: "b1", time: "06:30", subject: "Mathematics", method: "Active Recall", durationMinutes: 90 },
        { id: "b2", time: "08:30", subject: "Physics", method: "Concept Mapping", durationMinutes: 90 },
        { id: "b3", time: "13:00", subject: "Chemistry", method: "Flashcards", durationMinutes: 90 },
      ],
    },
    {
      day: "Tuesday", isRestDay: false,
      blocks: [
        { id: "b5", time: "06:30", subject: "Physics", method: "Problem Solving", durationMinutes: 90 },
        { id: "b6", time: "08:30", subject: "Mathematics", method: "Problem Sets", durationMinutes: 90 },
        { id: "b7", time: "13:00", subject: "Chemistry", method: "Active Recall", durationMinutes: 90 },
      ],
    },
    {
      day: "Wednesday", isRestDay: false,
      blocks: [
        { id: "b9", time: "06:30", subject: "Mathematics", method: "Active Recall", durationMinutes: 90 },
        { id: "b10", time: "08:30", subject: "Chemistry", method: "Problem Solving", durationMinutes: 90 },
        { id: "b11", time: "13:00", subject: "Physics", method: "Feynman Technique", durationMinutes: 90 },
      ],
    },
    {
      day: "Thursday", isRestDay: false,
      blocks: [
        { id: "b13", time: "06:30", subject: "Physics", method: "Active Recall", durationMinutes: 90 },
        { id: "b14", time: "08:30", subject: "Mathematics", method: "Problem Sets", durationMinutes: 90 },
        { id: "b15", time: "13:00", subject: "Chemistry", method: "Flashcards", durationMinutes: 90 },
      ],
    },
    {
      day: "Friday", isRestDay: false,
      blocks: [
        { id: "b17", time: "06:30", subject: "Mathematics", method: "Mock Test", durationMinutes: 90 },
        { id: "b18", time: "08:30", subject: "Physics", method: "Mock Test", durationMinutes: 90 },
        { id: "b19", time: "13:00", subject: "Chemistry", method: "Mock Test", durationMinutes: 90 },
      ],
    },
    {
      day: "Saturday", isRestDay: false,
      blocks: [
        { id: "b21", time: "09:00", subject: "Mathematics", method: "Problem Solving", durationMinutes: 120 },
        { id: "b22", time: "13:00", subject: "Physics", method: "Problem Solving", durationMinutes: 120 },
      ],
    },
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
    blockingRules: [
      "Phone stays in a separate room during all study blocks",
      "Use app blockers for YouTube and Instagram from 6am–5pm",
      "Only 1 hour of screen time allowed after 8pm",
    ],
    environmentSetup: [
      "Study at a desk only — no studying on bed or sofa",
      "Clear desk of everything except study material",
      "Use noise-cancelling headphones or brown noise",
    ],
    emergencyProtocol: "If you pick up your phone mid-session, restart the entire session from scratch.",
    phonePolicy: "Phone is locked away during all study blocks. Checked only during scheduled breaks.",
  },
  resources: {
    books: [
      { title: "Mathematics for JEE — NCERT + DC Pandey", reason: "Builds concepts rigorously before advanced problem solving" },
      { title: "HC Verma — Concepts of Physics", reason: "Best conceptual foundation for JEE Physics" },
      { title: "Atomic Habits", author: "James Clear", reason: "Understand how to build the study habits that actually stick" },
    ],
    podcasts: [
      { title: "The Knowledge Project", reason: "Mental models and decision-making for peak performance" },
    ],
    techniques: [
      { name: "Active Recall", description: "Close the book and retrieve information from memory", howToUse: "After each section, write everything you remember before checking" },
      { name: "Spaced Repetition", description: "Review material at increasing time intervals", howToUse: "Use Anki — review at 1 day, 3 days, 7 days, 14 days" },
    ],
    tools: [
      { name: "Anki", purpose: "Spaced repetition flashcards for Chemistry and Physics", free: true },
      { name: "Cold Turkey", purpose: "Block distracting websites during study hours", free: false },
    ],
  },
  weeklyReview: {
    checklistItems: [
      "Did I complete all planned study blocks this week?",
      "Which topics did I actively recall vs passively re-read?",
      "Did I stick to my phone and distraction rules?",
    ],
    progressMetrics: [
      { metric: "Study blocks completed", target: 28, current: 0, unit: "blocks" },
      { metric: "Weekly study hours", target: 36, current: 0, unit: "hours" },
      { metric: "Mock test score", target: 75, current: 60, unit: "%" },
    ],
    reviewQuestions: [
      "Where did I lose focus this week, and why?",
      "Which study method gave me the best retention?",
    ],
  },
  meta: {
    generatedAt: new Date().toISOString(),
    studentName: "Maneesh Awasthi",
    planVersion: 1,
  },
};
// ──────────────────────────────────────────────────────────────────────────────

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const first = name.split(" ")[0];
  if (hour < 12) return `Good morning, ${first} ☀️`;
  if (hour < 17) return `Good afternoon, ${first} 👋`;
  return `Good evening, ${first} 🌙`;
}

function getDateLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", day: "numeric", month: "long",
  }).toUpperCase();
}

function useCountUp(target: number, duration = 1000) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    startTime.current = null;
    const step = (ts: number) => {
      if (!startTime.current) startTime.current = ts;
      const progress = Math.min((ts - startTime.current) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
}

const HABIT_ICONS: Record<string, string> = {
  lifestyle: "🌅", study: "📚", focus: "🎯", mindset: "🧠", health: "💪",
};

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: "#6c63ff",
  Physics: "#00d4aa",
  Chemistry: "#ff6b9d",
  Revision: "#ffb347",
  default: "#6c63ff",
};

const QUICK_NAV = [
  { label: "My Plan", emoji: "📋", path: "/plan",     color: "#6c63ff", desc: "Full blueprint" },
  { label: "Schedule", emoji: "📅", path: "/schedule", color: "#00d4aa", desc: "This week" },
  { label: "Coach",    emoji: "💬", path: "/coach",    color: "#ff6b9d", desc: "Ask anything" },
  { label: "Progress", emoji: "📈", path: "/progress", color: "#ffb347", desc: "Track it" },
];

export default function DashboardPage() {
  const router = useRouter();
  const store = useAppStore();

  const studentProfile = store.studentProfile;
  const masterPlan     = store.masterPlan;
  const habitCompletions = store.habitCompletions;
  const currentStreak  = store.currentStreak;
  const studyHoursToday = store.studyHoursToday;
  const toggleHabit    = store.toggleHabit;

  const [todayHabits, setTodayHabits] = useState<Habit[]>([]);
  const [greeting, setGreeting]       = useState("");
  const [dateLabel, setDateLabel]     = useState("");
  const [mounted, setMounted]         = useState(false);
  const [isMobile, setIsMobile]       = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setMounted(true);
    setDateLabel(getDateLabel());
  }, []);

  useEffect(() => {
    if (studentProfile) setGreeting(getGreeting(studentProfile.name));
  }, [studentProfile]);

  useEffect(() => {
    if (!masterPlan) return;
    setTodayHabits(masterPlan.habitSystem.filter((h) => h.frequency === "daily"));
  }, [masterPlan]);

  function loadTestData() {
    store.setStudentProfile(MOCK_PROFILE);
    store.setMasterPlan(MOCK_PLAN);
    store.setIsOnboarded(true);
  }

  const streakCount = useCountUp(currentStreak, 900);

  if (!masterPlan || !studentProfile) {
    return (
      <div style={{ minHeight: "100vh", background: "#080810", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "36px", height: "36px", border: "3px solid #1e1e35", borderTop: "3px solid #6c63ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <button type="button" onClick={loadTestData} style={{
          padding: "8px 18px", fontSize: "12px", color: "#8888aa",
          background: "#12121e", border: "1px solid #1e1e35", borderRadius: "8px",
          cursor: "pointer", fontFamily: "'DM Mono', monospace", letterSpacing: "0.03em",
          marginTop: "8px",
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

  const subline = `${todaySchedule.length} study blocks planned · ${habitPercent}% habits done`;

  return (
    <>
      <style>{`
        .db-stat-card {
          background: #12121e;
          border: 1px solid #1e1e35;
          border-radius: 18px;
          padding: 20px;
          transition: all 0.25s ease;
          cursor: default;
        }
        .db-stat-card:hover {
          border-color: rgba(108,99,255,0.3);
          box-shadow: 0 8px 28px rgba(108,99,255,0.08);
          transform: translateY(-2px);
        }
        .db-card {
          background: #12121e;
          border: 1px solid #1e1e35;
          border-radius: 20px;
          padding: 24px;
          transition: all 0.25s ease;
        }
        .db-card:hover {
          border-color: rgba(108,99,255,0.22);
          box-shadow: 0 6px 24px rgba(108,99,255,0.07);
        }
        .db-habit-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid #1e1e35;
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
        }
        .db-habit-row:hover {
          background: rgba(108,99,255,0.05);
          border-color: rgba(108,99,255,0.2);
          transform: translateX(2px);
        }
        .db-habit-row:active { transform: scale(0.99); }
        .db-sched-block {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 14px;
          background: #0f0f1a;
          border: 1px solid #1e1e35;
          border-radius: 14px;
          transition: all 0.2s ease;
        }
        .db-sched-block:hover {
          border-color: rgba(108,99,255,0.25);
          transform: translateX(3px);
          background: rgba(108,99,255,0.04);
        }
        .db-quick-card {
          background: #12121e;
          border: 1px solid #1e1e35;
          border-radius: 18px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.25s ease;
          text-align: left;
        }
        .db-quick-card:hover {
          transform: translateY(-3px);
        }
        .db-problem-card {
          background: #12121e;
          border: 1px solid #1e1e35;
          border-left: 3px solid #ff6b9d;
          border-radius: 14px;
          padding: 16px 18px;
          transition: all 0.2s ease;
        }
        .db-problem-card:hover {
          border-color: rgba(255,107,157,0.4);
          border-left-color: #ff6b9d;
          background: rgba(255,107,157,0.03);
        }
      `}</style>

      {/* Ambient background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "10%", left: "15%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(108,99,255,0.07) 0%, transparent 70%)", animation: "orb-drift 14s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "10%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,157,0.05) 0%, transparent 70%)", animation: "orb-drift 18s ease-in-out infinite reverse" }} />
      </div>

      <div style={{ minHeight: "100vh", background: "#080810", paddingBottom: "5rem", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: isMobile ? "32px 16px 0" : "40px 32px 0" }}>

          {/* ── Header ── */}
          <div className="stagger-1" style={{ marginBottom: "36px" }}>
            <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", marginBottom: "8px" }}>
              {mounted ? dateLabel : ""}
            </p>
            <h1 style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: isMobile ? "clamp(1.6rem,6vw,2rem)" : "2.4rem",
              color: "#f0f0ff", letterSpacing: "-0.03em", margin: "0 0 8px",
            }}>
              {mounted && greeting ? greeting : `Welcome back`}
            </h1>
            <p style={{ color: "#8888aa", fontSize: "14px", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
              {subline}
            </p>
          </div>

          {/* ── Stats row ── */}
          <div className="stagger-2" style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
            gap: "12px", marginBottom: "24px",
          }}>
            {[
              { label: "Day Streak",   value: streakCount,              unit: "days",   emoji: "🔥", color: "#ffb347", bg: "rgba(255,179,71,0.08)",  border: "rgba(255,179,71,0.18)"  },
              { label: "Habits Done",  value: `${completedHabits}/${todayHabits.length}`, unit: "today",  emoji: "✅", color: "#00d4aa", bg: "rgba(0,212,170,0.07)", border: "rgba(0,212,170,0.18)"  },
              { label: "Study Hours",  value: studyHoursToday.toFixed(1), unit: "hrs",   emoji: "⏱",  color: "#a594ff", bg: "rgba(108,99,255,0.08)", border: "rgba(108,99,255,0.2)"  },
              { label: "Focus Score",  value: `${focusScore}%`,          unit: "today",  emoji: "⚡", color: "#ff6b9d", bg: "rgba(255,107,157,0.07)", border: "rgba(255,107,157,0.18)" },
            ].map((s, i) => (
              <div key={s.label} className="db-stat-card" style={{ background: s.bg, borderColor: s.border, animationDelay: `${i * 0.06}s` }}>
                <div style={{ fontSize: "20px", marginBottom: "10px" }}>{s.emoji}</div>
                <div style={{
                  fontFamily: "'DM Mono', monospace", fontWeight: 700,
                  fontSize: isMobile ? "1.8rem" : "2rem", color: s.color, lineHeight: 1,
                  marginBottom: "4px",
                }}>
                  {typeof s.value === "number" ? s.value : s.value}
                </div>
                <div style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace" }}>{s.unit}</div>
                <div style={{ color: "#8888aa", fontSize: "12px", marginTop: "4px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Key Insight ── */}
          <div className="stagger-3 db-card" style={{ marginBottom: "24px", borderLeft: "3px solid #6c63ff", background: "rgba(108,99,255,0.04)" }}>
            <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "10px" }}>
              YOUR COACH SAYS
            </p>
            <p style={{
              color: "#c8c8ee", fontSize: "15px", lineHeight: 1.7,
              fontStyle: "italic", margin: 0, fontFamily: "'DM Sans', sans-serif",
            }}>
              &ldquo;{masterPlan.diagnosis.keyInsight}&rdquo;
            </p>
          </div>

          {/* ── Main 2-col grid ── */}
          <div className="stagger-4" style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "20px", marginBottom: "24px",
          }}>
            {/* Habit Tracker */}
            <div className="db-card">
              <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "14px" }}>
                DAILY HABITS
              </p>

              {/* Progress bar */}
              <div style={{ marginBottom: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ color: "#8888aa", fontSize: "12px" }}>{completedHabits} of {todayHabits.length} done</span>
                  <span style={{ color: "#00d4aa", fontSize: "12px", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{habitPercent}%</span>
                </div>
                <div style={{ height: "5px", background: "#1e1e35", borderRadius: "999px", overflow: "hidden" }}>
                  <div className="progress-animated" style={{
                    height: "100%",
                    width: `${habitPercent}%`,
                    background: "linear-gradient(90deg, #6c63ff, #ff6b9d)",
                    borderRadius: "999px",
                  }} />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {todayHabits.map((habit, i) => {
                  const done = habitCompletions[habit.id];
                  const icon = HABIT_ICONS[habit.category] ?? "📌";
                  return (
                    <div
                      key={habit.id}
                      className="db-habit-row"
                      onClick={() => toggleHabit(habit.id)}
                      style={{
                        background: done ? "rgba(0,212,170,0.05)" : "transparent",
                        borderColor: done ? "rgba(0,212,170,0.2)" : "#1e1e35",
                        animationDelay: `${i * 0.05}s`,
                      }}
                    >
                      {/* Checkbox */}
                      <div style={{
                        width: "18px", height: "18px", borderRadius: "5px", flexShrink: 0,
                        border: done ? "none" : "2px solid #2a2a45",
                        background: done ? "#00d4aa" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        animation: done ? "check-pop 0.25s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
                        transition: "all 0.2s",
                      }}>
                        {done && <span style={{ color: "#080810", fontSize: "11px", fontWeight: 900 }}>✓</span>}
                      </div>
                      <span style={{ fontSize: "15px", flexShrink: 0 }}>{icon}</span>
                      <span style={{
                        flex: 1, fontSize: "13px", lineHeight: 1.4,
                        color: done ? "#44445a" : "#c8c8ee",
                        textDecoration: done ? "line-through" : "none",
                        transition: "all 0.2s",
                      }}>{habit.habit}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="db-card">
              <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "14px" }}>
                TODAY&apos;S SCHEDULE
              </p>

              {isRestDay ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 0", gap: "12px" }}>
                  <span style={{ fontSize: "36px", animation: "float 4s ease-in-out infinite" }}>🌿</span>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "18px", color: "#f0f0ff", margin: 0 }}>Rest & Recharge</h3>
                  <p style={{ color: "#8888aa", fontSize: "13px", textAlign: "center", margin: 0, lineHeight: 1.6 }}>No study blocks today. Recover, reflect, and come back stronger tomorrow.</p>
                </div>
              ) : todaySchedule.length === 0 ? (
                <p style={{ color: "#44445a", fontSize: "14px", textAlign: "center", padding: "32px 0" }}>No blocks scheduled today.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {todaySchedule.map((block, i) => {
                    const color = SUBJECT_COLORS[block.subject] ?? SUBJECT_COLORS.default;
                    return (
                      <div key={block.id} className="db-sched-block" style={{ animationDelay: `${i * 0.06}s` }}>
                        {/* Time */}
                        <div style={{ minWidth: "48px", flexShrink: 0 }}>
                          <div style={{ color: "#6c63ff", fontSize: "12px", fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>{block.time}</div>
                          <div style={{ color: "#44445a", fontSize: "10px", fontFamily: "'DM Mono', monospace", marginTop: "2px" }}>{block.durationMinutes}m</div>
                        </div>
                        {/* Accent bar */}
                        <div style={{ width: "3px", minHeight: "36px", background: color, borderRadius: "999px", flexShrink: 0 }} />
                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: "13px", color: "#f0f0ff", marginBottom: "2px" }}>{block.subject}</div>
                          <div style={{ fontSize: "11px", color: "#8888aa" }}>{block.method}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Quick nav cards ── */}
          <div className="stagger-5" style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
            gap: "12px", marginBottom: "28px",
          }}>
            {QUICK_NAV.map(({ label, emoji, path, color, desc }) => (
              <button
                key={path}
                type="button"
                onClick={() => router.push(path)}
                className="db-quick-card"
                style={{
                  borderColor: "#1e1e35",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = `${color}44`;
                  el.style.boxShadow = `0 8px 28px ${color}14`;
                  el.style.background = `${color}08`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.borderColor = "#1e1e35";
                  el.style.boxShadow = "none";
                  el.style.background = "#12121e";
                }}
              >
                <div style={{ fontSize: "22px", marginBottom: "10px" }}>{emoji}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "14px", color: "#f0f0ff", marginBottom: "3px" }}>{label}</div>
                <div style={{ color: "#44445a", fontSize: "12px" }}>{desc}</div>
              </button>
            ))}
          </div>

          {/* ── Problems section ── */}
          {masterPlan.diagnosis.primaryProblems.length > 0 && (
            <div className="stagger-6" style={{ marginBottom: "40px" }}>
              <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "14px" }}>
                WHAT WE&apos;RE FIXING
              </p>
              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
                gap: "10px",
              }}>
                {masterPlan.diagnosis.primaryProblems.map((problem, i) => (
                  <div key={i} className="db-problem-card" style={{ animationDelay: `${i * 0.07}s` }}>
                    <div style={{ fontSize: "16px", marginBottom: "8px" }}>
                      {["⚠️", "📵", "🔄"][i] ?? "⚠️"}
                    </div>
                    <p style={{ color: "#c8c8ee", fontSize: "13px", margin: 0, lineHeight: 1.6 }}>{problem}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
