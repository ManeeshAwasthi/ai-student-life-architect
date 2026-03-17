"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
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

function getGreetingData() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { text: "Good morning", icon: "🌅" };
  if (h >= 12 && h < 17) return { text: "Good afternoon", icon: "☀️" };
  if (h >= 17 && h < 21) return { text: "Good evening", icon: "🌆" };
  return { text: "Good night", icon: "🌙" };
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", day: "numeric", month: "long",
  });
}

function useCountUp(target: number, duration = 1200) {
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

const subjectColors: Record<string, { bg: string; accent: string }> = {
  Mathematics: { bg: "rgba(139,92,246,0.15)", accent: "#8b5cf6" },
  Physics: { bg: "rgba(59,130,246,0.15)", accent: "#3b82f6" },
  Chemistry: { bg: "rgba(16,185,129,0.15)", accent: "#10b981" },
  Revision: { bg: "rgba(245,158,11,0.15)", accent: "#f59e0b" },
  default: { bg: "rgba(124,58,237,0.12)", accent: "#7c3aed" },
};

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const store = useAppStore();

  const studentProfile = store.studentProfile;
  const masterPlan = store.masterPlan;
  const isOnboarded = store.isOnboarded;
  const habitCompletions = store.habitCompletions;
  const currentStreak = store.currentStreak;
  const studyHoursToday = store.studyHoursToday;
  const toggleHabit = store.toggleHabit;

  const [todayHabits, setTodayHabits] = useState<Habit[]>([]);
  const [greeting, setGreeting] = useState({ text: "Welcome", icon: "👋" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setGreeting(getGreetingData());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!masterPlan || !studentProfile || !isOnboarded) return;
    setTodayHabits(masterPlan.habitSystem.filter((h) => h.frequency === "daily"));
  }, [isOnboarded, studentProfile, masterPlan]);

  function loadTestData() {
    store.setStudentProfile(MOCK_PROFILE);
    store.setMasterPlan(MOCK_PLAN);
    store.setIsOnboarded(true);
  }

  const streakCount = useCountUp(currentStreak, 800);

  if (!masterPlan || !studentProfile) {
    return (
      <div style={{ minHeight: "100vh", background: "#050508", display: "flex", alignItems: "center", justifyContent: "center" }}>
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

  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayDay = masterPlan.weeklySchedule.find((d) => d.day === todayName);
  const isRestDay = todayDay?.isRestDay ?? false;
  const todaySchedule = todayDay?.blocks ?? [];

  const completedHabits = todayHabits.filter((h) => habitCompletions[h.id]).length;
  const habitPercent = todayHabits.length > 0 ? Math.round((completedHabits / todayHabits.length) * 100) : 0;

  const urgencyColors: Record<string, string> = {
    low: "#4ade80", medium: "#facc15", high: "#fb923c", critical: "#f87171",
  };
  const urgencyGlow: Record<string, string> = {
    low: "rgba(74,222,128,0.15)", medium: "rgba(250,204,21,0.15)",
    high: "rgba(251,146,60,0.15)", critical: "rgba(248,113,113,0.15)",
  };

  const navItems = [
    { label: "Plan", path: "/plan", icon: "📋" },
    { label: "Schedule", path: "/schedule", icon: "📅" },
    { label: "Coach", path: "/coach", icon: "💬" },
    { label: "Progress", path: "/progress", icon: "📈" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap');

        * { box-sizing: border-box; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(167,139,250,0); }
          50% { box-shadow: 0 0 16px 4px rgba(167,139,250,0.18); }
        }
        @keyframes orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(60px, -40px) scale(1.1); }
          66% { transform: translate(-30px, 50px) scale(0.95); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-50px, 60px) scale(1.05); }
          66% { transform: translate(40px, -30px) scale(1.12); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes streak-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes progress-fill {
          from { width: 0%; }
        }
        @keyframes check-pop {
          0% { transform: scale(0); }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        .pm-nav-btn {
          padding: 0.45rem 1rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #888;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
          font-family: 'Inter', sans-serif;
          letter-spacing: 0.01em;
          position: relative;
          overflow: hidden;
        }
        .pm-nav-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(167,139,250,0.1), rgba(236,72,153,0.06));
          opacity: 0;
          transition: opacity 0.2s;
        }
        .pm-nav-btn:hover {
          border-color: rgba(167,139,250,0.45);
          color: #c4b5fd;
          background: rgba(124,58,237,0.12);
          box-shadow: 0 0 12px rgba(124,58,237,0.2), 0 2px 8px rgba(0,0,0,0.3);
          transform: translateY(-1px);
        }
        .pm-nav-btn:hover::before { opacity: 1; }
        .pm-nav-btn:active { transform: translateY(0px) scale(0.97); }
        .pm-nav-btn.active {
          border-color: rgba(167,139,250,0.5);
          color: #c4b5fd;
          background: rgba(124,58,237,0.15);
          box-shadow: 0 0 14px rgba(124,58,237,0.22);
        }
        .pm-nav-btn.active::before { opacity: 1; }

        .pm-stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          cursor: default;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(8px);
        }
        .pm-stat-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(167,139,250,0.06), transparent 70%);
          pointer-events: none;
        }
        .pm-stat-card:hover {
          border-color: rgba(167,139,250,0.25);
          background: rgba(255,255,255,0.05);
          transform: translateY(-3px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(167,139,250,0.1);
        }

        .pm-glass-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 1.5rem;
          transition: border-color 0.3s, box-shadow 0.3s;
          backdrop-filter: blur(12px);
        }
        .pm-glass-card:hover {
          border-color: rgba(167,139,250,0.18);
          box-shadow: 0 4px 24px rgba(0,0,0,0.3);
        }

        .pm-schedule-block {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 0.9rem;
          background: rgba(255,255,255,0.03);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.2s;
        }
        .pm-schedule-block:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(167,139,250,0.2);
          transform: translateX(3px);
        }

        .pm-habit-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 0.85rem;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
          user-select: none;
        }
        .pm-habit-row:hover {
          background: rgba(255,255,255,0.04) !important;
          border-color: rgba(167,139,250,0.2) !important;
          transform: translateX(2px);
        }
        .pm-habit-row:active { transform: scale(0.99); }

        .pm-nav-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 1.25rem;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
          position: relative;
          overflow: hidden;
        }
        .pm-nav-card::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, #7c3aed, #ec4899);
          transform: scaleX(0);
          transition: transform 0.3s;
          transform-origin: left;
        }
        .pm-nav-card:hover {
          border-color: rgba(167,139,250,0.3);
          background: rgba(124,58,237,0.08);
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(167,139,250,0.15);
        }
        .pm-nav-card:hover::after { transform: scaleX(1); }
        .pm-nav-card:active { transform: translateY(-1px); }

        .pm-insight-card {
          background: rgba(255,255,255,0.025);
          border-radius: 20px;
          padding: 1.5rem;
          transition: box-shadow 0.3s;
          backdrop-filter: blur(12px);
        }

        .pm-streak-num {
          animation: streak-pulse 2s ease-in-out infinite;
          display: inline-block;
        }

        .stagger-1 { animation: fadeInUp 0.6s ease both; animation-delay: 0.05s; }
        .stagger-2 { animation: fadeInUp 0.6s ease both; animation-delay: 0.12s; }
        .stagger-3 { animation: fadeInUp 0.6s ease both; animation-delay: 0.19s; }
        .stagger-4 { animation: fadeInUp 0.6s ease both; animation-delay: 0.26s; }
        .stagger-5 { animation: fadeInUp 0.6s ease both; animation-delay: 0.33s; }
        .stagger-6 { animation: fadeInUp 0.6s ease both; animation-delay: 0.40s; }
        .stagger-7 { animation: fadeInUp 0.6s ease both; animation-delay: 0.47s; }

        .nav-slide { animation: slideDown 0.4s ease both; }

        .pm-progress-bar {
          animation: progress-fill 1.2s ease both;
          animation-delay: 0.5s;
        }

        .check-icon { animation: check-pop 0.25s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#050508",
        fontFamily: "'Inter', sans-serif",
        paddingBottom: "5rem",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Animated background orbs */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{
            position: "absolute", top: "10%", left: "15%",
            width: "500px", height: "500px",
            background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
            animation: "orb1 18s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", top: "50%", right: "10%",
            width: "400px", height: "400px",
            background: "radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)",
            borderRadius: "50%",
            animation: "orb2 22s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", bottom: "15%", left: "40%",
            width: "300px", height: "300px",
            background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)",
            borderRadius: "50%",
            animation: "orb1 26s ease-in-out infinite reverse",
          }} />
        </div>

        {/* Navbar */}
        <div className="nav-slide" style={{
          background: "rgba(5,5,8,0.85)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0.85rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{
              width: "28px", height: "28px",
              background: "linear-gradient(135deg, #7c3aed, #ec4899)",
              borderRadius: "8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.85rem",
            }}>⚡</div>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.1rem",
              fontWeight: 900,
              background: "linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>PeakMind</span>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {navItems.map((item) => (
              <button
                key={item.path}
                type="button"
                className={`pm-nav-btn${pathname === item.path ? " active" : ""}`}
                onClick={() => router.push(item.path)}

              >
                <span style={{ marginRight: "0.35rem", fontSize: "0.75rem" }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: "920px", margin: "0 auto", padding: "2.5rem 1.5rem 0", position: "relative", zIndex: 1 }}>

          {/* Header */}
          <div className="stagger-1" style={{ marginBottom: "2.5rem" }}>
            <p style={{ color: "#4a4a5a", fontSize: "0.8rem", margin: "0 0 0.3rem", letterSpacing: "0.04em" }}>
              {mounted ? formatDate() : ""}
            </p>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)",
              fontWeight: 900,
              margin: "0 0 0.5rem",
              background: "linear-gradient(135deg, #ffffff 0%, #c4b5fd 60%, #f9a8d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1.2,
            }}>
              {mounted ? greeting.text : "Welcome"}, {studentProfile.name.split(" ")[0]}{" "}
              <span style={{ WebkitTextFillColor: "initial", WebkitBackgroundClip: "initial" }}>
                {mounted ? greeting.icon : "👋"}
              </span>
            </h1>
            <p style={{ color: "#4a4a5a", fontSize: "0.88rem", margin: 0 }}>
              {isRestDay
                ? "Today is a rest day. Recover well."
                : `${todaySchedule.length} study blocks · ${todayHabits.length} habits to complete`}
            </p>
          </div>

          {/* Key insight banner */}
          <div className="pm-insight-card stagger-2" style={{
            marginBottom: "1.5rem",
            border: `1px solid ${urgencyColors[masterPlan.diagnosis.urgencyLevel]}28`,
            borderLeft: `3px solid ${urgencyColors[masterPlan.diagnosis.urgencyLevel]}`,
            boxShadow: `0 0 30px ${urgencyGlow[masterPlan.diagnosis.urgencyLevel]}, inset 0 0 30px ${urgencyGlow[masterPlan.diagnosis.urgencyLevel]}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
              <div>
                <p style={{ color: "#4a4a5a", fontSize: "0.68rem", margin: "0 0 0.5rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
                  Your Key Insight
                </p>
                <p style={{ color: "#d4d4d8", fontSize: "0.9rem", margin: 0, lineHeight: 1.65 }}>
                  {masterPlan.diagnosis.keyInsight}
                </p>
              </div>
              <span style={{
                flexShrink: 0,
                padding: "0.3rem 0.75rem",
                borderRadius: "999px",
                fontSize: "0.65rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                background: `${urgencyColors[masterPlan.diagnosis.urgencyLevel]}18`,
                color: urgencyColors[masterPlan.diagnosis.urgencyLevel],
                border: `1px solid ${urgencyColors[masterPlan.diagnosis.urgencyLevel]}40`,
                boxShadow: `0 0 10px ${urgencyColors[masterPlan.diagnosis.urgencyLevel]}25`,
              }}>
                {masterPlan.diagnosis.urgencyLevel}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="stagger-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
            {/* Streak */}
            <div className="pm-stat-card" style={{ borderColor: "rgba(167,139,250,0.15)" }}>
              <div style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>🔥</div>
              <div className="pm-streak-num" style={{ fontSize: "2rem", fontWeight: 900, color: "#a78bfa", lineHeight: 1 }}>
                {streakCount}
              </div>
              <div style={{ fontSize: "0.65rem", color: "#4a4a5a", marginTop: "0.3rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>days</div>
              <div style={{ fontSize: "0.75rem", color: "#6b6b7b", marginTop: "0.2rem", fontWeight: 500 }}>Study Streak</div>
            </div>

            {/* Hours */}
            <div className="pm-stat-card" style={{ borderColor: "rgba(59,130,246,0.15)" }}>
              <div style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>⏱️</div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#60a5fa", lineHeight: 1 }}>
                {studyHoursToday.toFixed(1)}
              </div>
              <div style={{ fontSize: "0.65rem", color: "#4a4a5a", marginTop: "0.3rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>hrs</div>
              <div style={{ fontSize: "0.75rem", color: "#6b6b7b", marginTop: "0.2rem", fontWeight: 500 }}>Hours Today</div>
            </div>

            {/* Habits */}
            <div className="pm-stat-card" style={{ borderColor: "rgba(74,222,128,0.15)" }}>
              <div style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>✅</div>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#4ade80", lineHeight: 1 }}>
                {completedHabits}
                <span style={{ fontSize: "1.1rem", color: "#4a4a5a", fontWeight: 500 }}>/{todayHabits.length}</span>
              </div>
              <div style={{ fontSize: "0.65rem", color: "#4a4a5a", marginTop: "0.3rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{habitPercent}% done</div>
              <div style={{ fontSize: "0.75rem", color: "#6b6b7b", marginTop: "0.2rem", fontWeight: 500 }}>Habits Done</div>
            </div>
          </div>

          {/* Schedule + Habits */}
          <div className="stagger-4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>

            {/* Today's schedule */}
            <div className="pm-glass-card">
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1rem", fontWeight: 700, color: "#e4e4f0", margin: "0 0 1.25rem",
                display: "flex", alignItems: "center", gap: "0.5rem",
              }}>
                <span style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                  display: "inline-block",
                }} />
                Today&apos;s Schedule
              </h2>
              {isRestDay ? (
                <div style={{ textAlign: "center", padding: "2.5rem 0" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🛌</div>
                  <p style={{ color: "#4a4a5a", fontSize: "0.85rem", margin: 0 }}>Rest day — no study blocks</p>
                </div>
              ) : todaySchedule.length === 0 ? (
                <p style={{ color: "#4a4a5a", fontSize: "0.85rem", margin: 0 }}>No blocks scheduled</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {todaySchedule.map((block, i) => {
                    const colors = subjectColors[block.subject] ?? subjectColors.default;
                    return (
                      <div key={block.id} className="pm-schedule-block" style={{ animationDelay: `${0.05 * i}s` }}>
                        <div style={{
                          width: "3px", height: "2.4rem", borderRadius: "999px",
                          background: colors.accent, flexShrink: 0,
                          boxShadow: `0 0 8px ${colors.accent}60`,
                        }} />
                        <div style={{
                          width: "32px", height: "32px", borderRadius: "8px",
                          background: colors.bg, flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.7rem", fontWeight: 700, color: colors.accent,
                        }}>
                          {block.subject.slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#e0e0e8", marginBottom: "0.1rem" }}>{block.subject}</div>
                          <div style={{ fontSize: "0.7rem", color: "#4a4a5a" }}>{block.time} · {block.durationMinutes}min · {block.method}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Habit checklist */}
            <div className="pm-glass-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1rem", fontWeight: 700, color: "#e4e4f0", margin: 0,
                  display: "flex", alignItems: "center", gap: "0.5rem",
                }}>
                  <span style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #4ade80, #22d3ee)",
                    display: "inline-block",
                  }} />
                  Daily Habits
                </h2>
                <span style={{
                  color: "#a78bfa", fontSize: "0.78rem", fontWeight: 700,
                  background: "rgba(167,139,250,0.1)", padding: "0.2rem 0.6rem",
                  borderRadius: "999px", border: "1px solid rgba(167,139,250,0.2)",
                }}>
                  {completedHabits}/{todayHabits.length}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", marginBottom: "1rem", overflow: "hidden" }}>
                <div className="pm-progress-bar" style={{
                  height: "100%",
                  width: `${habitPercent}%`,
                  background: "linear-gradient(90deg, #7c3aed, #4ade80)",
                  borderRadius: "999px",
                  boxShadow: "0 0 8px rgba(124,58,237,0.5)",
                  transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
                }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                {todayHabits.map((habit) => {
                  const done = !!habitCompletions[habit.id];
                  return (
                    <div
                      key={habit.id}
                      className="pm-habit-row"
                      onClick={() => toggleHabit(habit.id)}
                      style={{
                        background: done ? "rgba(74,222,128,0.07)" : "rgba(255,255,255,0.02)",
                        borderColor: done ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.06)",
                      }}
                    >
                      <div style={{
                        width: "20px", height: "20px", borderRadius: "50%",
                        border: `2px solid ${done ? "#4ade80" : "rgba(255,255,255,0.15)"}`,
                        background: done ? "linear-gradient(135deg, #4ade80, #22d3ee)" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                        boxShadow: done ? "0 0 10px rgba(74,222,128,0.4)" : "none",
                      }}>
                        {done && (
                          <span className="check-icon" style={{ color: "#000", fontSize: "0.6rem", fontWeight: 900, lineHeight: 1 }}>✓</span>
                        )}
                      </div>
                      <span style={{
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        color: done ? "#4ade80" : "#a0a0b0",
                        textDecoration: done ? "line-through" : "none",
                        opacity: done ? 0.75 : 1,
                        transition: "all 0.25s",
                        flex: 1,
                      }}>{habit.habit}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Nav cards */}
          <div className="stagger-5" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
            {[
              { label: "Full Plan", desc: "Diagnosis & strategy", icon: "📋", path: "/plan", color: "#8b5cf6" },
              { label: "Schedule", desc: "Weekly timetable", icon: "📅", path: "/schedule", color: "#3b82f6" },
              { label: "AI Coach", desc: "Chat with your coach", icon: "💬", path: "/coach", color: "#ec4899" },
              { label: "Progress", desc: "Track your growth", icon: "📈", path: "/progress", color: "#10b981" },
            ].map((item) => (
              <div
                key={item.path}
                className="pm-nav-card"
                onClick={() => router.push(item.path)}
              >
                <div style={{
                  width: "40px", height: "40px", borderRadius: "12px",
                  background: `${item.color}18`,
                  border: `1px solid ${item.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.2rem", marginBottom: "0.75rem",
                  transition: "all 0.2s",
                }}>{item.icon}</div>
                <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#e4e4f0", marginBottom: "0.25rem" }}>{item.label}</div>
                <div style={{ fontSize: "0.73rem", color: "#4a4a5a", lineHeight: 1.4 }}>{item.desc}</div>
                <div style={{
                  marginTop: "0.85rem",
                  fontSize: "0.7rem",
                  color: item.color,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  opacity: 0.8,
                  fontWeight: 500,
                }}>
                  Open →
                </div>
              </div>
            ))}
          </div>

          {/* Study method */}
          <div className="pm-glass-card stagger-6" style={{
            background: "rgba(124,58,237,0.06)",
            borderColor: "rgba(124,58,237,0.2)",
            boxShadow: "0 0 30px rgba(124,58,237,0.08)",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: "rgba(124,58,237,0.2)",
                border: "1px solid rgba(124,58,237,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.2rem", flexShrink: 0,
                boxShadow: "0 0 16px rgba(124,58,237,0.25)",
              }}>📚</div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#4a4a5a", fontSize: "0.67rem", margin: "0 0 0.35rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
                  Your Primary Study Method
                </p>
                <p style={{ color: "#e4e4f0", fontSize: "0.92rem", fontWeight: 700, margin: "0 0 0.35rem" }}>
                  {masterPlan.strategy.primaryStudyMethod}
                </p>
                <p style={{ color: "#5a5a6a", fontSize: "0.8rem", margin: 0, lineHeight: 1.6 }}>
                  {masterPlan.strategy.primaryMethodDescription}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* DEV: reload test data */}
        <button type="button" onClick={loadTestData} style={{
          position: "fixed", bottom: "1rem", right: "1rem",
          padding: "0.3rem 0.65rem", fontSize: "0.68rem", color: "#444",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px",
          cursor: "pointer", fontFamily: "monospace", opacity: 0.5,
          zIndex: 9999, transition: "opacity 0.15s",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = "#aaa"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.5"; e.currentTarget.style.color = "#444"; }}
        >
          [dev] load test data
        </button>
      </div>
    </>
  );
}
