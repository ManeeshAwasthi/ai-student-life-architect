"use client";

import { useRef, useState } from "react";
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

const EDU_OPTIONS: { value: EducationLevel; label: string }[] = [
  { value: "high_school", label: "High School" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "postgraduate", label: "Postgraduate" },
  { value: "self_learner", label: "Self-Learner" },
  { value: "professional", label: "Working Professional" },
];

const ENERGY_OPTIONS: { value: EnergyPeakTime; label: string; emoji: string }[] = [
  { value: "morning", label: "Morning (5–11 AM)", emoji: "🌅" },
  { value: "afternoon", label: "Afternoon (12–5 PM)", emoji: "☀️" },
  { value: "evening", label: "Evening (6–9 PM)", emoji: "🌆" },
  { value: "night", label: "Night (10 PM+)", emoji: "🌙" },
];

const EXERCISE_OPTIONS: { value: ExerciseFrequency; label: string }[] = [
  { value: "never", label: "Never" },
  { value: "rarely", label: "Rarely" },
  { value: "2-3x_week", label: "2–3× per week" },
  { value: "daily", label: "Every day" },
];

const COACH_OPTIONS: { value: CoachPersonality; label: string; desc: string }[] = [
  { value: "strict", label: "Drill Sergeant", desc: "No excuses. Push me hard." },
  { value: "supportive", label: "Mentor", desc: "Encouraging and warm." },
  { value: "neutral", label: "Analyst", desc: "Just facts and plans." },
  { value: "adaptive", label: "Adaptive", desc: "Reads my mood and adjusts." },
];

const DISTRACTIONS = [
  "Instagram", "YouTube", "WhatsApp", "Twitter/X", "Netflix",
  "Gaming", "Overthinking", "Noisy environment", "Phone notifications", "Procrastination loops",
];

const SOCIAL_MEDIA = [
  "Instagram", "YouTube", "Twitter/X", "LinkedIn", "Reddit",
  "Snapchat", "TikTok", "Discord", "WhatsApp", "Telegram",
];

function validate(p: Partial<StudentProfile>): string[] {
  const e: string[] = [];
  if (!p.name?.trim()) e.push("Name is required");
  if (!p.age || p.age < 10 || p.age > 80) e.push("Enter a valid age (10–80)");
  if (!p.fieldOfStudy?.trim()) e.push("Field of study is required");
  if (!p.subjects?.length) e.push("Add at least one subject");
  if (!p.examGoals?.trim()) e.push("Exam goals are required");
  if (!p.currentPerformance?.trim()) e.push("Current performance is required");
  if (!p.currentStudyMethod?.trim()) e.push("Current study method is required");
  if (!p.biggestDistractions?.length) e.push("Select at least one distraction");
  if (!p.primaryGoal?.trim()) e.push("Primary goal is required");
  if (!p.previousSystemsTried?.trim()) e.push("Previous systems tried is required");
  return e;
}

const inp: React.CSSProperties = {
  width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a",
  borderRadius: "10px", padding: "0.75rem 1rem", color: "#fff",
  fontSize: "0.9rem", outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};

const sec: React.CSSProperties = {
  background: "#111", border: "1px solid #1e1e1e",
  borderRadius: "16px", padding: "2rem", marginBottom: "1.5rem",
};

export default function OnboardingPage() {
  const router = useRouter();
  const { setStudentProfile } = useAppStore();

  // ── Refs for all text inputs (no re-render on keystroke) ──────────────────
  const nameRef = useRef<HTMLInputElement>(null);
  const ageRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLInputElement>(null);
  const examGoalsRef = useRef<HTMLTextAreaElement>(null);
  const performanceRef = useRef<HTMLTextAreaElement>(null);
  const studyMethodRef = useRef<HTMLTextAreaElement>(null);
  const primaryGoalRef = useRef<HTMLTextAreaElement>(null);
  const prevSystemsRef = useRef<HTMLTextAreaElement>(null);
  const subjectInputRef = useRef<HTMLInputElement>(null);

  // ── State only for interactive non-text fields ────────────────────────────
  const [eduLevel, setEduLevel] = useState<EducationLevel>("undergraduate");
  const [subjects, setSubjects] = useState<string[]>([]);
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
  const [submitted, setSubmitted] = useState(false);

  const toggleChip = (list: string[], setList: (v: string[]) => void, val: string) => {
    setList(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  };

  const addSubject = () => {
    const val = subjectInputRef.current?.value.trim();
    if (val && !subjects.includes(val)) {
      setSubjects([...subjects, val]);
      if (subjectInputRef.current) subjectInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    const profile: Partial<StudentProfile> = {
      name: nameRef.current?.value.trim() ?? "",
      age: Number(ageRef.current?.value) || 0,
      educationLevel: eduLevel,
      fieldOfStudy: fieldRef.current?.value.trim() ?? "",
      subjects,
      examGoals: examGoalsRef.current?.value.trim() ?? "",
      dailyStudyHoursAvailable: dailyHours,
      currentPerformance: performanceRef.current?.value.trim() ?? "",
      wakeUpTime: wakeTime,
      sleepTime,
      currentStudyMethod: studyMethodRef.current?.value.trim() ?? "",
      averageSessionLength: sessionLen,
      biggestDistractions: distractions,
      procrastinationLevel: procrastination as ProcrastinationLevel,
      energyPeakTime: energyPeak,
      stressLevel: stress as StressLevel,
      burnoutSymptoms: burnout,
      exerciseFrequency: exercise,
      screenTimePerDay: screenTime,
      socialMediaApps: socialMedia,
      primaryGoal: primaryGoalRef.current?.value.trim() ?? "",
      coachPersonality,
      previousSystemsTried: prevSystemsRef.current?.value.trim() ?? "",
    };

    setSubmitted(true);
    const errs = validate(profile);
    setErrors(errs);
    if (errs.length > 0) {
      document.getElementById("error-box")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setStudentProfile(profile as StudentProfile);
    router.push("/generating");
  };

  // ── Tiny inner components (no hooks, safe here) ───────────────────────────

  const Hdr = ({ n, title, sub }: { n: string; title: string; sub: string }) => (
    <div style={{ marginBottom: "1.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
        <span style={{
          width: "1.8rem", height: "1.8rem", borderRadius: "50%",
          background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.75rem", fontWeight: 700, color: "#fff", flexShrink: 0,
        }}>{n}</span>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", fontWeight: 700, color: "#fff", margin: 0 }}>{title}</h2>
      </div>
      <p style={{ color: "#666", fontSize: "0.82rem", margin: 0, paddingLeft: "2.55rem" }}>{sub}</p>
    </div>
  );

  const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: "1.25rem" }}>
      <label style={{ display: "block", color: "#c0c0c0", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.5rem" }}>
        {label} <span style={{ color: "#ec4899" }}>*</span>
      </label>
      {children}
    </div>
  );

  const Row = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>{children}</div>
  );

  const Cards = <T extends string>({ opts, val, set }: {
    opts: { value: T; label: string; desc?: string; emoji?: string }[]; val: T; set: (v: T) => void;
  }) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: "0.65rem" }}>
      {opts.map((o) => (
        <button key={o.value} type="button" onClick={() => set(o.value)} style={{
          padding: "0.9rem 1rem", borderRadius: "12px", textAlign: "left", cursor: "pointer",
          border: `1px solid ${val === o.value ? "#7c3aed" : "#2a2a2a"}`,
          background: val === o.value ? "rgba(124,58,237,0.15)" : "#141414",
          color: val === o.value ? "#fff" : "#888", transition: "all 0.15s",
        }}>
          {o.emoji && <div style={{ fontSize: "1.2rem", marginBottom: "0.3rem" }}>{o.emoji}</div>}
          <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: o.desc ? "0.2rem" : 0 }}>{o.label}</div>
          {o.desc && <div style={{ fontSize: "0.75rem", color: "#666", lineHeight: 1.4 }}>{o.desc}</div>}
        </button>
      ))}
    </div>
  );

  const Chips = ({ opts, sel, toggle }: { opts: string[]; sel: string[]; toggle: (v: string) => void }) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      {opts.map((o) => (
        <button key={o} type="button" onClick={() => toggle(o)} style={{
          padding: "0.35rem 0.85rem", borderRadius: "999px", cursor: "pointer", fontSize: "0.8rem",
          border: `1px solid ${sel.includes(o) ? "#7c3aed" : "#2a2a2a"}`,
          background: sel.includes(o) ? "rgba(124,58,237,0.2)" : "#1a1a1a",
          color: sel.includes(o) ? "#a78bfa" : "#777",
          fontWeight: sel.includes(o) ? 600 : 400, transition: "all 0.15s",
        }}>{o}</button>
      ))}
    </div>
  );

  const Slider = ({ val, set, min, max, fmt }: {
    val: number; set: (v: number) => void; min: number; max: number; fmt: (v: number) => string;
  }) => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
        <span style={{ color: "#555", fontSize: "0.75rem" }}>{min}</span>
        <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: "0.9rem" }}>{fmt(val)}</span>
        <span style={{ color: "#555", fontSize: "0.75rem" }}>{max}</span>
      </div>
      <input type="range" min={min} max={max} value={val} onChange={(e) => set(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#7c3aed", cursor: "pointer" }} />
    </div>
  );

  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = "#7c3aed");
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = "#2a2a2a");

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Inter', sans-serif", paddingBottom: "6rem" }}>

      {/* Header */}
      <div style={{
        background: "rgba(10,10,10,0.9)", borderBottom: "1px solid #1a1a1a", padding: "0.9rem 2rem",
        position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)",
      }}>
        <span style={{
          fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 900,
          background: "linear-gradient(135deg, #a78bfa, #ec4899)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>PeakMind</span>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "3rem 1.5rem 0" }}>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 900, color: "#fff", margin: "0 0 0.75rem", lineHeight: 1.2,
          }}>
            Build Your{" "}
            <span style={{ background: "linear-gradient(135deg, #a78bfa, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Personal System
            </span>
          </h1>
          <p style={{ color: "#666", fontSize: "0.95rem", maxWidth: "440px", margin: "0 auto", lineHeight: 1.7 }}>
            Be brutally honest. The better your answers, the more powerful your plan. Takes about 5 minutes.
          </p>
        </div>

        {/* Errors */}
        {submitted && errors.length > 0 && (
          <div id="error-box" style={{
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
          <Hdr n="1" title="About You" sub="Basic identity — who you are and where you are in life." />
          <Row>
            <F label="Your name">
              <input ref={nameRef} placeholder="e.g. Arjun" style={inp} onFocus={focus} onBlur={blur} />
            </F>
            <F label="Age">
              <input ref={ageRef} type="number" placeholder="18" style={inp} onFocus={focus} onBlur={blur} />
            </F>
          </Row>
          <F label="Education level">
            <Cards opts={EDU_OPTIONS} val={eduLevel} set={setEduLevel} />
          </F>
          <F label="Field of study / work">
            <input ref={fieldRef} placeholder="e.g. Computer Science, CA Foundation, UPSC" style={inp} onFocus={focus} onBlur={blur} />
          </F>
        </div>

        {/* Section 2 */}
        <div style={sec}>
          <Hdr n="2" title="Academic Profile" sub="What you're studying and where you stand right now." />

          <F label="Subjects you study">
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.65rem" }}>
              <input ref={subjectInputRef} placeholder="Type a subject and press Enter or Add"
                style={{ ...inp, flex: 1 }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubject(); } }}
                onFocus={focus} onBlur={blur} />
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
          </F>

          <F label="Exam goals / targets">
            <textarea ref={examGoalsRef} rows={3} placeholder="e.g. Score 90%+ in boards, crack JEE Mains, pass CA Inter in May 2025"
              style={{ ...inp, resize: "vertical" }} onFocus={focus} onBlur={blur} />
          </F>

          <F label="Current performance">
            <textarea ref={performanceRef} rows={2} placeholder="e.g. Scoring 65–70%, weak in Maths, decent in Chemistry"
              style={{ ...inp, resize: "vertical" }} onFocus={focus} onBlur={blur} />
          </F>

          <Row>
            <F label="Hours available daily">
              <Slider val={dailyHours} set={setDailyHours} min={1} max={14} fmt={(v) => `${v} hrs/day`} />
            </F>
            <F label="Avg session length">
              <Slider val={sessionLen} set={setSessionLen} min={15} max={180} fmt={(v) => `${v} min`} />
            </F>
          </Row>
        </div>

        {/* Section 3 */}
        <div style={sec}>
          <Hdr n="3" title="Study Habits" sub="How you currently study — be brutally honest." />

          <F label="Current study method">
            <textarea ref={studyMethodRef} rows={2} placeholder="e.g. Read NCERT + watch YouTube, make notes sometimes, revise day before exams"
              style={{ ...inp, resize: "vertical" }} onFocus={focus} onBlur={blur} />
          </F>

          <F label="Biggest distractions">
            <Chips opts={DISTRACTIONS} sel={distractions} toggle={(v) => toggleChip(distractions, setDistractions, v)} />
          </F>

          <Row>
            <F label="Procrastination level">
              <Slider val={procrastination} set={setProcrastination} min={1} max={5}
                fmt={(v) => ["Never", "Rarely", "Sometimes", "Often", "Always"][v - 1]} />
            </F>
            <F label="Peak energy time">
              <Cards opts={ENERGY_OPTIONS} val={energyPeak} set={setEnergyPeak} />
            </F>
          </Row>
        </div>

        {/* Section 4 */}
        <div style={sec}>
          <Hdr n="4" title="Daily Schedule" sub="Your current daily rhythm so we can design around it." />
          <Row>
            <F label="Wake-up time">
              <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)}
                style={inp} onFocus={focus} onBlur={blur} />
            </F>
            <F label="Sleep time">
              <input type="time" value={sleepTime} onChange={(e) => setSleepTime(e.target.value)}
                style={inp} onFocus={focus} onBlur={blur} />
            </F>
          </Row>
        </div>

        {/* Section 5 */}
        <div style={sec}>
          <Hdr n="5" title="Wellbeing" sub="Physical and mental health directly impacts how well you learn." />
          <Row>
            <F label="Stress level">
              <Slider val={stress} set={setStress} min={1} max={5}
                fmt={(v) => ["Very relaxed", "Low", "Moderate", "High", "Extreme"][v - 1]} />
            </F>
            <F label="Exercise frequency">
              <select value={exercise} onChange={(e) => setExercise(e.target.value as ExerciseFrequency)}
                style={{
                  ...inp, cursor: "pointer",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a0a0a0' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center",
                  backgroundSize: "12px", paddingRight: "2.5rem",
                }}>
                {EXERCISE_OPTIONS.map((o) => <option key={o.value} value={o.value} style={{ background: "#1a1a1a" }}>{o.label}</option>)}
              </select>
            </F>
          </Row>

          <Row>
            <F label="Screen time per day (non-study)">
              <Slider val={screenTime} set={setScreenTime} min={0} max={16} fmt={(v) => `${v} hrs`} />
            </F>
            <F label="Burnout symptoms">
              <div style={{ paddingTop: "0.5rem" }}>
                <button type="button" onClick={() => setBurnout(!burnout)}
                  style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  <span style={{
                    width: "44px", height: "24px", borderRadius: "999px",
                    background: burnout ? "#7c3aed" : "#2a2a2a",
                    position: "relative", display: "block", transition: "background 0.2s", flexShrink: 0,
                  }}>
                    <span style={{
                      position: "absolute", top: "3px", left: burnout ? "23px" : "3px",
                      width: "18px", height: "18px", borderRadius: "50%", background: "#fff",
                      transition: "left 0.2s", display: "block",
                    }} />
                  </span>
                  <span style={{ color: "#c0c0c0", fontSize: "0.88rem" }}>{burnout ? "Yes, feeling burnt out" : "No, I'm okay"}</span>
                </button>
              </div>
            </F>
          </Row>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", color: "#c0c0c0", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              Social media apps you use
            </label>
            <Chips opts={SOCIAL_MEDIA} sel={socialMedia} toggle={(v) => toggleChip(socialMedia, setSocialMedia, v)} />
          </div>
        </div>

        {/* Section 6 */}
        <div style={sec}>
          <Hdr n="6" title="Goals & Coaching" sub="What you want and how you want to be coached." />

          <F label="Primary goal (in your own words)">
            <textarea ref={primaryGoalRef} rows={2} placeholder="e.g. I want to stop wasting time and study consistently so I can crack NEET this year"
              style={{ ...inp, resize: "vertical" }} onFocus={focus} onBlur={blur} />
          </F>

          <F label="Coach personality">
            <Cards opts={COACH_OPTIONS} val={coachPersonality} set={setCoachPersonality} />
          </F>

          <F label="Previous systems you've tried">
            <textarea ref={prevSystemsRef} rows={2} placeholder="e.g. Tried Pomodoro but kept skipping. Made timetables but never followed them."
              style={{ ...inp, resize: "vertical" }} onFocus={focus} onBlur={blur} />
          </F>
        </div>

        {/* Submit */}
        <div style={{ textAlign: "center", paddingTop: "1rem" }}>
          <button type="button" onClick={handleSubmit} style={{
            padding: "1rem 3rem", background: "linear-gradient(135deg, #7c3aed, #ec4899)",
            color: "#fff", border: "none", borderRadius: "12px", fontSize: "1rem",
            fontWeight: 700, cursor: "pointer", letterSpacing: "0.04em",
            boxShadow: "0 0 40px rgba(124,58,237,0.4)", transition: "transform 0.15s, box-shadow 0.15s",
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