"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import type {
  StudentProfile,
  EducationLevel,
  EnergyPeakTime,
  ExerciseFrequency,
  CoachPersonality,
  ProcrastinationLevel,
  StressLevel,
} from "@/lib/types";

const EDU: { value: EducationLevel; label: string }[] = [
  { value: "high_school", label: "High School" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "postgraduate", label: "Postgraduate" },
  { value: "self_learner", label: "Self-Learner" },
  { value: "professional", label: "Working Professional" },
];

const ENERGY: { value: EnergyPeakTime; label: string; emoji: string }[] = [
  { value: "morning", label: "Morning (5–11 AM)", emoji: "🌅" },
  { value: "afternoon", label: "Afternoon (12–5 PM)", emoji: "☀️" },
  { value: "evening", label: "Evening (6–9 PM)", emoji: "🌆" },
  { value: "night", label: "Night (10 PM+)", emoji: "🌙" },
];

const EXERCISE: { value: ExerciseFrequency; label: string }[] = [
  { value: "never", label: "Never" },
  { value: "rarely", label: "Rarely" },
  { value: "2-3x_week", label: "2–3× per week" },
  { value: "daily", label: "Every day" },
];

const COACH: { value: CoachPersonality; label: string; desc: string }[] = [
  { value: "strict", label: "Drill Sergeant", desc: "No excuses. Push me hard." },
  { value: "supportive", label: "Mentor", desc: "Encouraging and warm." },
  { value: "neutral", label: "Analyst", desc: "Just facts and plans." },
  { value: "adaptive", label: "Adaptive", desc: "Reads my mood and adjusts." },
];

const DISTRACTIONS = [
  "Instagram", "YouTube", "WhatsApp", "Twitter/X", "Netflix",
  "Gaming", "Overthinking", "Noisy environment", "Phone notifications", "Procrastination loops",
];

const SOCIAL = [
  "Instagram", "YouTube", "Twitter/X", "LinkedIn", "Reddit",
  "Snapchat", "TikTok", "Discord", "WhatsApp", "Telegram",
];

const inp: React.CSSProperties = {
  width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a",
  borderRadius: "10px", padding: "0.75rem 1rem", color: "#fff",
  fontSize: "0.9rem", outline: "none", boxSizing: "border-box" as const,
  fontFamily: "inherit",
};

const sec: React.CSSProperties = {
  background: "#111", border: "1px solid #1e1e1e",
  borderRadius: "16px", padding: "2rem", marginBottom: "1.5rem",
};

const lbl: React.CSSProperties = {
  display: "block", color: "#c0c0c0", fontSize: "0.82rem",
  fontWeight: 600, marginBottom: "0.5rem",
};

export default function OnboardingPage() {
  const router = useRouter();
  const { setStudentProfile } = useAppStore();

  // Only state for interactive non-text fields
  const [eduLevel, setEduLevel] = useState<EducationLevel>("undergraduate");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [dailyHours, setDailyHours] = useState(4);
  const [sessionLen, setSessionLen] = useState(45);
  const [distractions, setDistractions] = useState<string[]>([]);
  const [procrastination, setProcrastination] = useState(3);
  const [energyPeak, setEnergyPeak] = useState<EnergyPeakTime>("morning");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [sleepTime, setSleepTime] = useState("23:00");
  const [stress, setStress] = useState(3);
  const [exercise, setExercise] = useState<ExerciseFrequency>("rarely");
  const [screenTime, setScreenTime] = useState(4);
  const [burnout, setBurnout] = useState(false);
  const [socialMedia, setSocialMedia] = useState<string[]>([]);
  const [coachPersonality, setCoachPersonality] = useState<CoachPersonality>("supportive");
  const [errors, setErrors] = useState<string[]>([]);

  const toggle = (list: string[], setList: (v: string[]) => void, val: string) =>
    setList(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);

  const addSubject = () => {
    const v = subjectInput.trim();
    if (v && !subjects.includes(v)) {
      setSubjects([...subjects, v]);
      setSubjectInput("");
    }
  };

  // Read text values directly from DOM by name — bypasses React entirely
  const getField = (name: string): string => {
    if (typeof document === "undefined") return "";
    const el = document.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLTextAreaElement | null;
    return el?.value.trim() ?? "";
  };

  const handleSubmit = () => {
    // Read from DOM — React state changes cannot affect these
    const name = getField("name");
    const age = Number(getField("age")) || 0;
    const fieldOfStudy = getField("fieldOfStudy");
    const examGoals = getField("examGoals");
    const currentPerformance = getField("currentPerformance");
    const currentStudyMethod = getField("currentStudyMethod");
    const primaryGoal = getField("primaryGoal");
    const previousSystemsTried = getField("previousSystemsTried");

    const errs: string[] = [];
    if (!name) errs.push("Name is required");
    if (!age || age < 10 || age > 80) errs.push("Enter a valid age (10–80)");
    if (!fieldOfStudy) errs.push("Field of study is required");
    if (subjects.length === 0) errs.push("Add at least one subject");
    if (!examGoals) errs.push("Exam goals are required");
    if (!currentPerformance) errs.push("Current performance is required");
    if (!currentStudyMethod) errs.push("Current study method is required");
    if (distractions.length === 0) errs.push("Select at least one distraction");
    if (!primaryGoal) errs.push("Primary goal is required");
    if (!previousSystemsTried) errs.push("Previous systems tried is required");

    if (errs.length > 0) {
      setErrors(errs);
      setTimeout(() => {
        document.getElementById("err")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }

    setErrors([]);

    const profile: StudentProfile = {
      name, age, fieldOfStudy, examGoals, currentPerformance,
      currentStudyMethod, primaryGoal, previousSystemsTried,
      educationLevel: eduLevel, subjects,
      dailyStudyHoursAvailable: dailyHours,
      wakeUpTime: wakeTime, sleepTime,
      averageSessionLength: sessionLen,
      biggestDistractions: distractions,
      procrastinationLevel: procrastination as ProcrastinationLevel,
      energyPeakTime: energyPeak,
      stressLevel: stress as StressLevel,
      burnoutSymptoms: burnout,
      exerciseFrequency: exercise,
      screenTimePerDay: screenTime,
      socialMediaApps: socialMedia,
      coachPersonality,
    };

    setStudentProfile(profile);
    router.push("/generating");
  };

  const fo = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = "#7c3aed");
  const bl = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = "#2a2a2a");

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Inter', sans-serif", paddingBottom: "6rem" }}>

      <div style={{
        background: "rgba(10,10,10,0.95)", borderBottom: "1px solid #1a1a1a",
        padding: "0.9rem 2rem", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)",
      }}>
        <span style={{
          fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 900,
          background: "linear-gradient(135deg,#a78bfa,#ec4899)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>PeakMind</span>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "3rem 1.5rem 0" }}>

        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem,4vw,2.8rem)",
            fontWeight: 900, color: "#fff", margin: "0 0 0.75rem", lineHeight: 1.2,
          }}>
            Build Your{" "}
            <span style={{ background: "linear-gradient(135deg,#a78bfa,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Personal System
            </span>
          </h1>
          <p style={{ color: "#666", fontSize: "0.95rem", maxWidth: "440px", margin: "0 auto", lineHeight: 1.7 }}>
            Be brutally honest. The better your answers, the more powerful your plan. Takes about 5 minutes.
          </p>
        </div>

        {errors.length > 0 && (
          <div id="err" style={{
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "12px", padding: "1.25rem 1.5rem", marginBottom: "2rem",
          }}>
            <p style={{ color: "#f87171", fontWeight: 600, margin: "0 0 0.5rem", fontSize: "0.875rem" }}>Fix these before continuing:</p>
            <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
              {errors.map((e) => <li key={e} style={{ color: "#fca5a5", fontSize: "0.82rem", marginBottom: "0.2rem" }}>{e}</li>)}
            </ul>
          </div>
        )}

        {/* Section 1 */}
        <div style={sec}>
          <div style={{ marginBottom: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
              <span style={{ width: "1.8rem", height: "1.8rem", borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>1</span>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", fontWeight: 700, color: "#fff", margin: 0 }}>About You</h2>
            </div>
            <p style={{ color: "#666", fontSize: "0.82rem", margin: 0, paddingLeft: "2.55rem" }}>Basic identity — who you are and where you are in life.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
            <div>
              <label style={lbl}>Your name <span style={{ color: "#ec4899" }}>*</span></label>
              <input name="name" placeholder="e.g. Arjun" style={inp} onFocus={fo} onBlur={bl} />
            </div>
            <div>
              <label style={lbl}>Age <span style={{ color: "#ec4899" }}>*</span></label>
              <input name="age" type="number" placeholder="20" style={inp} onFocus={fo} onBlur={bl} />
            </div>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={lbl}>Education level <span style={{ color: "#ec4899" }}>*</span></label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: "0.65rem" }}>
              {EDU.map((o) => (
                <button key={o.value} type="button" onClick={() => setEduLevel(o.value)} style={{
                  padding: "0.9rem 1rem", borderRadius: "12px", textAlign: "left", cursor: "pointer",
                  border: `1px solid ${eduLevel === o.value ? "#7c3aed" : "#2a2a2a"}`,
                  background: eduLevel === o.value ? "rgba(124,58,237,0.15)" : "#141414",
                  color: eduLevel === o.value ? "#fff" : "#888", fontWeight: 600, fontSize: "0.85rem",
                }}>{o.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={lbl}>Field of study / work <span style={{ color: "#ec4899" }}>*</span></label>
            <input name="fieldOfStudy" placeholder="e.g. Computer Science, CA Foundation, UPSC" style={inp} onFocus={fo} onBlur={bl} />
          </div>
        </div>

        {/* Section 2 */}
        <div style={sec}>
          <div style={{ marginBottom: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
              <span style={{ width: "1.8rem", height: "1.8rem", borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>2</span>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", fontWeight: 700, color: "#fff", margin: 0 }}>Academic Profile</h2>
            </div>
            <p style={{ color: "#666", fontSize: "0.82rem", margin: 0, paddingLeft: "2.55rem" }}>What you&apos;re studying and where you stand right now.</p>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={lbl}>Subjects you study <span style={{ color: "#ec4899" }}>*</span></label>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.65rem" }}>
              <input
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubject(); } }}
                placeholder="Type a subject and press Enter or Add"
                style={{ ...inp, flex: 1 }}
                onFocus={fo} onBlur={bl}
              />
              <button type="button" onClick={addSubject} style={{
                padding: "0.75rem 1.1rem", background: "#7c3aed", color: "#fff",
                border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", whiteSpace: "nowrap",
              }}>Add</button>
            </div>
            {subjects.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {subjects.map((s) => (
                  <span key={s} style={{
                    background: "rgba(124,58,237,0.2)", border: "1px solid #7c3aed44", color: "#a78bfa",
                    borderRadius: "999px", padding: "0.25rem 0.75rem", fontSize: "0.8rem",
                    display: "flex", alignItems: "center", gap: "0.35rem",
                  }}>
                    {s}
                    <button type="button" onClick={() => setSubjects(subjects.filter((x) => x !== s))}
                      style={{ background: "none", border: "none", color: "#ec4899", cursor: "pointer", padding: 0, fontSize: "1rem", lineHeight: 1 }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={lbl}>Exam goals / targets <span style={{ color: "#ec4899" }}>*</span></label>
            <textarea name="examGoals" rows={3}
              placeholder="e.g. Score 90%+ in boards, crack JEE Mains, pass CA Inter in May 2025"
              style={{ ...inp, resize: "vertical" }} onFocus={fo} onBlur={bl} />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={lbl}>Current performance <span style={{ color: "#ec4899" }}>*</span></label>
            <textarea name="currentPerformance" rows={2}
              placeholder="e.g. Scoring 65–70%, weak in Maths, decent in Chemistry"
              style={{ ...inp, resize: "vertical" }} onFocus={fo} onBlur={bl} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={lbl}>Hours available daily <span style={{ color: "#ec4899" }}>*</span></label>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span style={{ color: "#555", fontSize: "0.75rem" }}>1</span>
                <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: "0.9rem" }}>{dailyHours} hrs/day</span>
                <span style={{ color: "#555", fontSize: "0.75rem" }}>14</span>
              </div>
              <input type="range" min={1} max={14} value={dailyHours} onChange={(e) => setDailyHours(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#7c3aed", cursor: "pointer" }} />
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={lbl}>Avg session length <span style={{ color: "#ec4899" }}>*</span></label>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span style={{ color: "#555", fontSize: "0.75rem" }}>15</span>
                <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: "0.9rem" }}>{sessionLen} min</span>
                <span style={{ color: "#555", fontSize: "0.75rem" }}>180</span>
              </div>
              <input type="range" min={15} max={180} value={sessionLen} onChange={(e) => setSessionLen(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#7c3aed", cursor: "pointer" }} />
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div style={sec}>
          <div style={{ marginBottom: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
              <span style={{ width: "1.8rem", height: "1.8rem", borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>3</span>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", fontWeight: 700, color: "#fff", margin: 0 }}>Study Habits</h2>
            </div>
            <p style={{ color: "#666", fontSize: "0.82rem", margin: 0, paddingLeft: "2.55rem" }}>How you currently study — be brutally honest.</p>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={lbl}>Current study method <span style={{ color: "#ec4899" }}>*</span></label>
            <textarea name="currentStudyMethod" rows={2}
              placeholder="e.g. Read NCERT + watch YouTube, make notes sometimes, revise day before exams"
              style={{ ...inp, resize: "vertical" }} onFocus={fo} onBlur={bl} />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={lbl}>Biggest distractions <span style={{ color: "#ec4899" }}>*</span></label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {DISTRACTIONS.map((o) => (
                <button key={o} type="button" onClick={() => toggle(distractions, setDistractions, o)} style={{
                  padding: "0.35rem 0.85rem", borderRadius: "999px", cursor: "pointer", fontSize: "0.8rem",
                  border: `1px solid ${distractions.includes(o) ? "#7c3aed" : "#2a2a2a"}`,
                  background: distractions.includes(o) ? "rgba(124,58,237,0.2)" : "#1a1a1a",
                  color: distractions.includes(o) ? "#a78bfa" : "#777",
                  fontWeight: distractions.includes(o) ? 600 : 400,
                }}>{o}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={lbl}>Procrastination level <span style={{ color: "#ec4899" }}>*</span></label>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span style={{ color: "#555", fontSize: "0.75rem" }}>1</span>
                <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: "0.9rem" }}>{["Never", "Rarely", "Sometimes", "Often", "Always"][procrastination - 1]}</span>
                <span style={{ color: "#555", fontSize: "0.75rem" }}>5</span>
              </div>
              <input type="range" min={1} max={5} value={procrastination} onChange={(e) => setProcrastination(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#7c3aed", cursor: "pointer" }} />
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={lbl}>Peak energy time <span style={{ color: "#ec4899" }}>*</span></label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {ENERGY.map((o) => (
                  <button key={o.value} type="button" onClick={() => setEnergyPeak(o.value)} style={{
                    padding: "0.6rem 0.5rem", borderRadius: "10px", cursor: "pointer",
                    border: `1px solid ${energyPeak === o.value ? "#7c3aed" : "#2a2a2a"}`,
                    background: energyPeak === o.value ? "rgba(124,58,237,0.15)" : "#141414",
                    color: energyPeak === o.value ? "#fff" : "#888",
                    fontSize: "0.72rem", textAlign: "left",
                  }}>{o.emoji} {o.label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4 */}
        <div style={sec}>
          <div style={{ marginBottom: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
              <span style={{ width: "1.8rem", height: "1.8rem", borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>4</span>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", fontWeight: 700, color: "#fff", margin: 0 }}>Daily Schedule</h2>
            </div>
            <p style={{ color: "#666", fontSize: "0.82rem", margin: 0, paddingLeft: "2.55rem" }}>Your current daily rhythm so we can design around it.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div>
              <label style={lbl}>Wake-up time <span style={{ color: "#ec4899" }}>*</span></label>
              <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} style={inp} onFocus={fo} onBlur={bl} />
            </div>
            <div>
              <label style={lbl}>Sleep time <span style={{ color: "#ec4899" }}>*</span></label>
              <input type="time" value={sleepTime} onChange={(e) => setSleepTime(e.target.value)} style={inp} onFocus={fo} onBlur={bl} />
            </div>
          </div>
        </div>

        {/* Section 5 */}
        <div style={sec}>
          <div style={{ marginBottom: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
              <span style={{ width: "1.8rem", height: "1.8rem", borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>5</span>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", fontWeight: 700, color: "#fff", margin: 0 }}>Wellbeing</h2>
            </div>
            <p style={{ color: "#666", fontSize: "0.82rem", margin: 0, paddingLeft: "2.55rem" }}>Physical and mental health directly impacts how well you learn.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={lbl}>Stress level <span style={{ color: "#ec4899" }}>*</span></label>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span style={{ color: "#555", fontSize: "0.75rem" }}>1</span>
                <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: "0.9rem" }}>{["Very relaxed", "Low", "Moderate", "High", "Extreme"][stress - 1]}</span>
                <span style={{ color: "#555", fontSize: "0.75rem" }}>5</span>
              </div>
              <input type="range" min={1} max={5} value={stress} onChange={(e) => setStress(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#7c3aed", cursor: "pointer" }} />
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={lbl}>Exercise frequency <span style={{ color: "#ec4899" }}>*</span></label>
              <select value={exercise} onChange={(e) => setExercise(e.target.value as ExerciseFrequency)} style={{
                ...inp, cursor: "pointer",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a0a0a0' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center", backgroundSize: "12px", paddingRight: "2.5rem",
              }} onFocus={fo} onBlur={bl}>
                {EXERCISE.map((o) => <option key={o.value} value={o.value} style={{ background: "#1a1a1a" }}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={lbl}>Screen time/day (non-study)</label>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <span style={{ color: "#555", fontSize: "0.75rem" }}>0</span>
                <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: "0.9rem" }}>{screenTime} hrs</span>
                <span style={{ color: "#555", fontSize: "0.75rem" }}>16</span>
              </div>
              <input type="range" min={0} max={16} value={screenTime} onChange={(e) => setScreenTime(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#7c3aed", cursor: "pointer" }} />
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={lbl}>Burnout symptoms</label>
              <div style={{ paddingTop: "0.5rem" }}>
                <button type="button" onClick={() => setBurnout(!burnout)}
                  style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  <span style={{ width: "44px", height: "24px", borderRadius: "999px", background: burnout ? "#7c3aed" : "#2a2a2a", position: "relative", display: "block", transition: "background 0.2s", flexShrink: 0 }}>
                    <span style={{ position: "absolute", top: "3px", left: burnout ? "23px" : "3px", width: "18px", height: "18px", borderRadius: "50%", background: "#fff", transition: "left 0.2s", display: "block" }} />
                  </span>
                  <span style={{ color: "#c0c0c0", fontSize: "0.88rem" }}>{burnout ? "Yes, burnt out" : "No, I'm okay"}</span>
                </button>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={lbl}>Social media apps you use</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {SOCIAL.map((o) => (
                <button key={o} type="button" onClick={() => toggle(socialMedia, setSocialMedia, o)} style={{
                  padding: "0.35rem 0.85rem", borderRadius: "999px", cursor: "pointer", fontSize: "0.8rem",
                  border: `1px solid ${socialMedia.includes(o) ? "#7c3aed" : "#2a2a2a"}`,
                  background: socialMedia.includes(o) ? "rgba(124,58,237,0.2)" : "#1a1a1a",
                  color: socialMedia.includes(o) ? "#a78bfa" : "#777",
                  fontWeight: socialMedia.includes(o) ? 600 : 400,
                }}>{o}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 6 */}
        <div style={sec}>
          <div style={{ marginBottom: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
              <span style={{ width: "1.8rem", height: "1.8rem", borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>6</span>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", fontWeight: 700, color: "#fff", margin: 0 }}>Goals & Coaching</h2>
            </div>
            <p style={{ color: "#666", fontSize: "0.82rem", margin: 0, paddingLeft: "2.55rem" }}>What you want and how you want to be coached.</p>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={lbl}>Primary goal (in your own words) <span style={{ color: "#ec4899" }}>*</span></label>
            <textarea name="primaryGoal" rows={2}
              placeholder="e.g. I want to stop wasting time and study consistently so I can crack NEET this year"
              style={{ ...inp, resize: "vertical" }} onFocus={fo} onBlur={bl} />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={lbl}>Coach personality <span style={{ color: "#ec4899" }}>*</span></label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: "0.65rem" }}>
              {COACH.map((o) => (
                <button key={o.value} type="button" onClick={() => setCoachPersonality(o.value)} style={{
                  padding: "0.9rem 1rem", borderRadius: "12px", textAlign: "left", cursor: "pointer",
                  border: `1px solid ${coachPersonality === o.value ? "#7c3aed" : "#2a2a2a"}`,
                  background: coachPersonality === o.value ? "rgba(124,58,237,0.15)" : "#141414",
                  color: coachPersonality === o.value ? "#fff" : "#888",
                }}>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.2rem" }}>{o.label}</div>
                  <div style={{ fontSize: "0.75rem", color: "#666", lineHeight: 1.4 }}>{o.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={lbl}>Previous systems you&apos;ve tried <span style={{ color: "#ec4899" }}>*</span></label>
            <textarea name="previousSystemsTried" rows={2}
              placeholder="e.g. Tried Pomodoro but kept skipping. Made timetables but never followed them."
              style={{ ...inp, resize: "vertical" }} onFocus={fo} onBlur={bl} />
          </div>
        </div>

        {/* Submit */}
        <div style={{ textAlign: "center", paddingTop: "1rem" }}>
          <button type="button" onClick={handleSubmit} style={{
            padding: "1rem 3rem", background: "linear-gradient(135deg,#7c3aed,#ec4899)",
            color: "#fff", border: "none", borderRadius: "12px", fontSize: "1rem",
            fontWeight: 700, cursor: "pointer", letterSpacing: "0.04em",
            boxShadow: "0 0 40px rgba(124,58,237,0.4)",
          }}
            onMouseEnter={(e) => { (e.currentTarget).style.transform = "translateY(-2px)"; (e.currentTarget).style.boxShadow = "0 0 60px rgba(124,58,237,0.6)"; }}
            onMouseLeave={(e) => { (e.currentTarget).style.transform = "translateY(0)"; (e.currentTarget).style.boxShadow = "0 0 40px rgba(124,58,237,0.4)"; }}
          >
            Generate My System →
          </button>
          <p style={{ color: "#444", fontSize: "0.75rem", marginTop: "0.75rem" }}>
            Takes 30–60 seconds to build your complete plan
          </p>
        </div>

      </div>
    </div>
  );
}