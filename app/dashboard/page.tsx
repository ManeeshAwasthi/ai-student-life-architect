"use client";

import { useEffect, useState } from "react";
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
      "Close the book after reading each section and write down everything you remember. Review using flashcards at increasing intervals (1 day, 3 days, 7 days). This forces your brain to retrieve information rather than passively re-read it.",
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
        { id: "b4", time: "19:00", subject: "Revision", method: "Spaced Repetition", durationMinutes: 90 },
      ],
    },
    {
      day: "Tuesday", isRestDay: false,
      blocks: [
        { id: "b5", time: "06:30", subject: "Physics", method: "Problem Solving", durationMinutes: 90 },
        { id: "b6", time: "08:30", subject: "Mathematics", method: "Problem Sets", durationMinutes: 90 },
        { id: "b7", time: "13:00", subject: "Chemistry", method: "Active Recall", durationMinutes: 90 },
        { id: "b8", time: "19:00", subject: "Mathematics", method: "Revision", durationMinutes: 90 },
      ],
    },
    {
      day: "Wednesday", isRestDay: false,
      blocks: [
        { id: "b9", time: "06:30", subject: "Mathematics", method: "Active Recall", durationMinutes: 90 },
        { id: "b10", time: "08:30", subject: "Chemistry", method: "Problem Solving", durationMinutes: 90 },
        { id: "b11", time: "13:00", subject: "Physics", method: "Feynman Technique", durationMinutes: 90 },
        { id: "b12", time: "19:00", subject: "Revision", method: "Spaced Repetition", durationMinutes: 90 },
      ],
    },
    {
      day: "Thursday", isRestDay: false,
      blocks: [
        { id: "b13", time: "06:30", subject: "Physics", method: "Active Recall", durationMinutes: 90 },
        { id: "b14", time: "08:30", subject: "Mathematics", method: "Problem Sets", durationMinutes: 90 },
        { id: "b15", time: "13:00", subject: "Chemistry", method: "Flashcards", durationMinutes: 90 },
        { id: "b16", time: "19:00", subject: "Mathematics", method: "Revision", durationMinutes: 90 },
      ],
    },
    {
      day: "Friday", isRestDay: false,
      blocks: [
        { id: "b17", time: "06:30", subject: "Mathematics", method: "Mock Test", durationMinutes: 90 },
        { id: "b18", time: "08:30", subject: "Physics", method: "Mock Test", durationMinutes: 90 },
        { id: "b19", time: "13:00", subject: "Chemistry", method: "Mock Test", durationMinutes: 90 },
        { id: "b20", time: "19:00", subject: "Revision", method: "Full Review", durationMinutes: 90 },
      ],
    },
    {
      day: "Saturday", isRestDay: false,
      blocks: [
        { id: "b21", time: "09:00", subject: "Mathematics", method: "Problem Solving", durationMinutes: 120 },
        { id: "b22", time: "13:00", subject: "Physics", method: "Problem Solving", durationMinutes: 120 },
        { id: "b23", time: "19:00", subject: "Weekly Review", method: "Spaced Repetition", durationMinutes: 90 },
      ],
    },
    { day: "Sunday", isRestDay: true, blocks: [] },
  ],
  habitSystem: [
    { id: "h1", habit: "No phone for first 30 minutes after waking", frequency: "daily", category: "lifestyle", whyItMatters: "Sets a focused tone; breaks the dopamine-first-thing cycle", streak: 0, completedToday: false, completionHistory: [] },
    { id: "h2", habit: "Complete at least 3 study blocks", frequency: "daily", category: "study", whyItMatters: "Non-negotiable daily minimum to stay on track for JEE", streak: 0, completedToday: false, completionHistory: [] },
    { id: "h3", habit: "Active recall on one topic before moving on", frequency: "daily", category: "study", whyItMatters: "Prevents passive reading trap; forces real understanding", streak: 0, completedToday: false, completionHistory: [] },
    { id: "h4", habit: "Phone in another room during study blocks", frequency: "daily", category: "focus", whyItMatters: "Even phone presence reduces cognitive capacity by 10%", streak: 0, completedToday: false, completionHistory: [] },
    { id: "h5", habit: "Write daily review (3 things learned today)", frequency: "daily", category: "mindset", whyItMatters: "Reinforces memory and builds metacognitive awareness", streak: 0, completedToday: false, completionHistory: [] },
    { id: "h6", habit: "30-minute exercise or walk", frequency: "daily", category: "health", whyItMatters: "Increases BDNF — directly improves memory and focus", streak: 0, completedToday: false, completionHistory: [] },
    { id: "h7", habit: "Weekly mock test (1 subject)", frequency: "weekly", category: "study", whyItMatters: "Simulates exam pressure and reveals actual gaps", streak: 0, completedToday: false, completionHistory: [] },
  ],
  distractionControl: {
    topDistractions: ["Phone", "YouTube", "Instagram"],
    blockingRules: [
      "Phone stays in a separate room during all study blocks",
      "Use app blockers (Cold Turkey / BlockSite) for YouTube and Instagram from 6am–5pm",
      "Only 1 hour of screen time allowed after 8pm — set a hard timer",
    ],
    environmentSetup: [
      "Study at a desk only — no studying on bed or sofa",
      "Clear desk of everything except study material",
      "Use noise-cancelling headphones or brown noise during sessions",
      "Notify family of study hours to prevent interruptions",
    ],
    emergencyProtocol: "If you pick up your phone mid-session, restart the entire session from scratch — no exceptions.",
    phonePolicy: "Phone is locked away during all study blocks. Checked only during scheduled breaks. Social media deleted from phone; accessed only via desktop with time limits.",
  },
  resources: {
    books: [
      { title: "Mathematics for JEE — NCERT + DC Pandey", reason: "Builds concepts rigorously before advanced problem solving" },
      { title: "HC Verma — Concepts of Physics", reason: "Best conceptual foundation for JEE Physics" },
      { title: "Physical Chemistry — OP Tandon", reason: "Clear explanations with graded problems" },
      { title: "Atomic Habits", author: "James Clear", reason: "Understand how to build the study habits that will actually stick" },
    ],
    podcasts: [
      { title: "The Knowledge Project", reason: "Mental models and decision-making for peak performance" },
    ],
    techniques: [
      { name: "Active Recall", description: "Close the book and retrieve information from memory", howToUse: "After each section, write or say everything you remember before checking" },
      { name: "Spaced Repetition", description: "Review material at increasing time intervals", howToUse: "Use Anki or a physical card system — review at 1 day, 3 days, 7 days, 14 days" },
      { name: "Feynman Technique", description: "Explain the concept as if teaching a 12-year-old", howToUse: "Write the concept name, explain it simply, identify gaps, go back to source" },
      { name: "Pomodoro (modified)", description: "90-minute deep work blocks with 15-minute breaks", howToUse: "Work for 90 minutes uninterrupted, then take a real break — no phone" },
    ],
    tools: [
      { name: "Anki", purpose: "Spaced repetition flashcards for Chemistry and Physics formulas", free: true },
      { name: "Cold Turkey", purpose: "Block distracting websites and apps during study hours", free: false },
      { name: "Notion", purpose: "Organise notes, track weekly reviews, plan sessions", free: true },
      { name: "Forest App", purpose: "Phone lock timer to stay off phone during sessions", free: false },
    ],
  },
  weeklyReview: {
    checklistItems: [
      "Did I complete all planned study blocks this week?",
      "Which topics did I actively recall vs passively re-read?",
      "What are the 3 biggest gaps I discovered this week?",
      "Did I stick to my phone and distraction rules?",
      "Are my habit streaks on track?",
      "What will I do differently next week?",
    ],
    progressMetrics: [
      { metric: "Study blocks completed", target: 28, current: 0, unit: "blocks" },
      { metric: "Weekly study hours", target: 36, current: 0, unit: "hours" },
      { metric: "Habits completed daily", target: 6, current: 0, unit: "habits/day" },
      { metric: "Mock test score", target: 75, current: 60, unit: "%" },
    ],
    reviewQuestions: [
      "Where did I lose focus this week, and why?",
      "Which study method gave me the best retention?",
      "Am I on track for JEE Advanced 2025?",
    ],
  },
  meta: {
    generatedAt: new Date().toISOString(),
    studentName: "Maneesh Awasthi",
    planVersion: 1,
  },
};
// ──────────────────────────────────────────────────────────────────────────────

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
    if (!masterPlan || !studentProfile || !isOnboarded) return;
    setTodayHabits(masterPlan.habitSystem.filter((h) => h.frequency === "daily"));
  }, [isOnboarded, studentProfile, masterPlan]);

  function loadTestData() {
    store.setStudentProfile(MOCK_PROFILE);
    store.setMasterPlan(MOCK_PLAN);
    store.setIsOnboarded(true);
  }

  if (!masterPlan || !studentProfile) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0a0a0a",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <button type="button" onClick={loadTestData} style={{
          padding: "0.5rem 1rem", fontSize: "0.75rem", color: "#aaa",
          background: "#161616", border: "1px solid #333", borderRadius: "8px",
          cursor: "pointer", fontFamily: "monospace", letterSpacing: "0.03em",
        }}>
          [dev] load test data
        </button>
      </div>
    );
  }

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

      {/* DEV: reload test data — fixed bottom-right corner */}
      <button type="button" onClick={loadTestData} style={{
        position: "fixed", bottom: "1rem", right: "1rem",
        padding: "0.3rem 0.65rem", fontSize: "0.68rem", color: "#666",
        background: "#111", border: "1px solid #2a2a2a", borderRadius: "6px",
        cursor: "pointer", fontFamily: "monospace", opacity: 0.6,
        zIndex: 9999, transition: "opacity 0.15s",
      }}
        onMouseEnter={(e) => { (e.currentTarget).style.opacity = "1"; (e.currentTarget).style.color = "#aaa"; }}
        onMouseLeave={(e) => { (e.currentTarget).style.opacity = "0.6"; (e.currentTarget).style.color = "#666"; }}
      >
        [dev] load test data
      </button>
    </div>
  );
}

