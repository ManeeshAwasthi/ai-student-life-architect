"use client";

import { useState, useCallback, useRef } from "react";
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

const DRAFT_KEY = "peakmind_onboarding_draft";

const defaultProfile: StudentProfile = {
  name: "",
  age: 18,
  educationLevel: "undergraduate",
  fieldOfStudy: "",
  subjects: [],
  examGoals: "",
  dailyStudyHoursAvailable: 4,
  currentPerformance: "",
  wakeUpTime: "07:00",
  sleepTime: "23:00",
  currentStudyMethod: "",
  averageSessionLength: 45,
  biggestDistractions: [],
  procrastinationLevel: 3,
  energyPeakTime: "morning",
  stressLevel: 3,
  burnoutSymptoms: false,
  exerciseFrequency: "rarely",
  screenTimePerDay: 4,
  socialMediaApps: [],
  primaryGoal: "",
  coachPersonality: "supportive",
  previousSystemsTried: "",
};

const educationOptions: { value: EducationLevel; label: string }[] = [
  { value: "high_school", label: "High School" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "postgraduate", label: "Postgraduate" },
  { value: "self_learner", label: "Self-Learner" },
  { value: "professional", label: "Working Professional" },
];

const energyOptions: { value: EnergyPeakTime; label: string; emoji: string }[] = [
  { value: "morning", label: "Morning (5–11 AM)", emoji: "🌅" },
  { value: "afternoon", label: "Afternoon (12–5 PM)", emoji: "☀️" },
  { value: "evening", label: "Evening (6–9 PM)", emoji: "🌆" },
  { value: "night", label: "Night (10 PM+)", emoji: "🌙" },
];

const exerciseOptions: { value: ExerciseFrequency; label: string }[] = [
  { value: "never", label: "Never" },
  { value: "rarely", label: "Rarely" },
  { value: "2-3x_week", label: "2–3× per week" },
  { value: "daily", label: "Every day" },
];

const coachOptions: { value: CoachPersonality; label: string; desc: string }[] = [
  { value: "strict", label: "Drill Sergeant", desc: "No excuses. Push me hard." },
  { value: "supportive", label: "Mentor", desc: "Encouraging and warm." },
  { value: "neutral", label: "Analyst", desc: "Just facts and plans." },
  { value: "adaptive", label: "Adaptive", desc: "Reads my mood and adjusts." },
];

const distractionOptions = [
  "Instagram", "YouTube", "WhatsApp", "Twitter/X", "Netflix",
  "Gaming", "Overthinking", "Noisy environment", "Phone notifications", "Procrastination loops",
];

const socialMediaOptions = [
  "Instagram", "YouTube", "Twitter/X", "LinkedIn", "Reddit",
  "Snapchat", "TikTok", "Discord", "WhatsApp", "Telegram",
];

function validate(p: StudentProfile): string[] {
  const errors: string[] = [];
  if (!p.name.trim()) errors.push("Name is required");
  if (!p.age || p.age < 10 || p.age > 80) errors.push("Enter a valid age (10–80)");
  if (!p.fieldOfStudy.trim()) errors.push("Field of study is required");
  if (p.subjects.length === 0) errors.push("Add at least one subject");
  if (!p.examGoals.trim()) errors.push("Exam goals are required");
  if (!p.currentPerformance.trim()) errors.push("Current performance is required");
  if (!p.currentStudyMethod.trim()) errors.push("Current study method is required");
  if (p.biggestDistractions.length === 0) errors.push("Select at least one distraction");
  if (!p.primaryGoal.trim()) errors.push("Primary goal is required");
  if (!p.previousSystemsTried.trim()) errors.push("Previous systems field is required");
  return errors;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { setStudentProfile } = useAppStore();

  // ── Profile state (source of truth) ─────────────────────────────────────────
  const [profile, setProfile] = useState<StudentProfile>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) return { ...defaultProfile, ...JSON.parse(saved) };
      } catch { /* ignore */ }
    }
    return defaultProfile;
  });

  // ── Local text states — these are what the inputs show ──────────────────────
  // They update freely on every keystroke WITHOUT touching profile/localStorage
  const [localName, setLocalName] = useState(profile.name);
  const [localAge, setLocalAge] = useState(String(profile.age));
  const [localFieldOfStudy, setLocalFieldOfStudy] = useState(profile.fieldOfStudy);
  const [localExamGoals, setLocalExamGoals] = useState(profile.examGoals);
  const [localPerformance, setLocalPerformance] = useState(profile.currentPerformance);
  const [localStudyMethod, setLocalStudyMethod] = useState(profile.currentStudyMethod);
  const [localPrimaryGoal, setLocalPrimaryGoal] = useState(profile.primaryGoal);
  const [localPreviousSystems, setLocalPreviousSystems] = useState(profile.previousSystemsTried);
  const [subjectInput, setSubjectInput] = useState("");

  const [errors, setErrors] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // ── Save to localStorage (called only on blur / slider change / chip toggle) ─
  const save = useCallback((updated: StudentProfile) => {
    setSaveStatus("saving");
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
      setTimeout(() => setSaveStatus("saved"), 300);
    } catch { /* ignore */ }
  }, []);

  // Commit a field patch to profile + save
  const commit = useCallback((patch: Partial<StudentProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      save(next);
      return next;
    });
  }, [save]);

  // ── Chips & cards (instant commit — no typing involved) ──────────────────────
  const toggleArray = (field: "subjects" | "biggestDistractions" | "socialMediaApps", value: string) => {
    const arr = profile[field] as string[];
    const next = arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
    commit({ [field]: next } as Partial<StudentProfile>);
  };

  const addSubject = () => {
    const trimmed = subjectInput.trim();
    if (trimmed && !profile.subjects.includes(trimmed)) {
      commit({ subjects: [...profile.subjects, trimmed] });
      setSubjectInput("");
    }
  };

  const handleSubmit = () => {
    // Commit any text that might not have been blurred yet
    const finalProfile: StudentProfile = {
      ...profile,
      name: localName.trim(),
      age: Number(localAge) || profile.age,
      fieldOfStudy: localFieldOfStudy.trim(),
      examGoals: localExamGoals.trim(),
      currentPerformance: localPerformance.trim(),
      currentStudyMethod: localStudyMethod.trim(),
      primaryGoal: localPrimaryGoal.trim(),
      previousSystemsTried: localPreviousSystems.trim(),
    };
    setSubmitAttempted(true);
    const errs = validate(finalProfile);
    setErrors(errs);
    if (errs.length > 0) {
      document.getElementById("error-box")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setStudentProfile(finalProfile);
    localStorage.removeItem(DRAFT_KEY);
    router.push("/generating");
  };

  // ── Styles ───────────────────────────────────────────────────────────────────
  const inputBase: React.CSSProperties = {
    width: "100%",
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: "10px",
    padding: "0.75rem 1rem",
    color: "#ffffff",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  };

  const sectionCard: React.CSSProperties = {
    background: "#111111",
    border: "1px solid #1e1e1e",
    borderRadius: "16px",
    padding: "2rem",
    marginBottom: "1.5rem",
  };

  // ── Inner components ─────────────────────────────────────────────────────────

  const SectionHeader = ({ number, title, subtitle }: { number: string; title: string; subtitle: string }) => (
    <div style={{ marginBottom: "1.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
        <span style={{
          width: "1.8rem", height: "1.8rem", borderRadius: "50%",
          background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.75rem", fontWeight: 700, color: "#fff", flexShrink: 0,
        }}>{number}</span>
        <h2 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "1.25rem",
          fontWeight: 700, color: "#ffffff", margin: 0,
        }}>{title}</h2>
      </div>
      <p style={{ color: "#666", fontSize: "0.82rem", margin: 0, paddingLeft: "2.55rem" }}>{subtitle}</p>
    </div>
  );

  const Field = ({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) => (
    <div style={{ marginBottom: "1.25rem" }}>
      <label style={{
        display: "block", color: "#c0c0c0", fontSize: "0.82rem",
        fontWeight: 600, marginBottom: "0.5rem", letterSpacing: "0.02em",
      }}>
        {label} {!optional && <span style={{ color: "#ec4899" }}>*</span>}
      </label>
      {children}
    </div>
  );

  // Text input: local state updates freely, commits on blur
  const BlurInput = ({
    value, onChange, onCommit, placeholder, type = "text",
  }: {
    value: string;
    onChange: (v: string) => void;
    onCommit: (v: string) => void;
    placeholder?: string;
    type?: string;
  }) => (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => {
        onCommit(e.target.value);
        e.currentTarget.style.borderColor = "#2a2a2a";
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = "#7c3aed")}
      placeholder={placeholder}
      style={inputBase}
    />
  );

  const BlurTextArea = ({
    value, onChange, onCommit, placeholder, rows = 3,
  }: {
    value: string;
    onChange: (v: string) => void;
    onCommit: (v: string) => void;
    placeholder?: string;
    rows?: number;
  }) => (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => {
        onCommit(e.target.value);
        e.currentTarget.style.borderColor = "#2a2a2a";
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = "#7c3aed")}
      placeholder={placeholder}
      rows={rows}
      style={{ ...inputBase, resize: "vertical" }}
    />
  );

  const SelectInput = <T extends string>({ value, onChange, options }: {
    value: T; onChange: (v: T) => void; options: { value: T; label: string }[];
  }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      style={{
        ...inputBase, cursor: "pointer",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a0a0a0' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center",
        backgroundSize: "12px", paddingRight: "2.5rem",
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = "#7c3aed")}
      onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} style={{ background: "#1a1a1a" }}>{o.label}</option>
      ))}
    </select>
  );

  const Slider = ({ value, onChange, min, max, label }: {
    value: number; onChange: (v: number) => void; min: number; max: number; label: (v: number) => string;
  }) => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
        <span style={{ color: "#555", fontSize: "0.75rem" }}>{min}</span>
        <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: "0.9rem" }}>{label(value)}</span>
        <span style={{ color: "#555", fontSize: "0.75rem" }}>{max}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#7c3aed", cursor: "pointer" }}
      />
    </div>
  );

  const Chips = ({ options, selected, onToggle }: {
    options: string[]; selected: string[]; onToggle: (v: string) => void;
  }) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      {options.map((opt) => {
        const sel = selected.includes(opt);
        return (
          <button key={opt} type="button" onClick={() => onToggle(opt)} style={{
            padding: "0.35rem 0.85rem", borderRadius: "999px",
            border: `1px solid ${sel ? "#7c3aed" : "#2a2a2a"}`,
            background: sel ? "rgba(124,58,237,0.2)" : "#1a1a1a",
            color: sel ? "#a78bfa" : "#777",
            fontSize: "0.8rem", cursor: "pointer",
            fontWeight: sel ? 600 : 400, transition: "all 0.15s",
          }}>{opt}</button>
        );
      })}
    </div>
  );

  const Cards = <T extends string>({ options, value, onChange }: {
    options: { value: T; label: string; desc?: string; emoji?: string }[];
    value: T; onChange: (v: T) => void;
  }) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.65rem" }}>
      {options.map((opt) => {
        const sel = value === opt.value;
        return (
          <button key={opt.value} type="button" onClick={() => onChange(opt.value)} style={{
            padding: "0.9rem 1rem", borderRadius: "12px",
            border: `1px solid ${sel ? "#7c3aed" : "#2a2a2a"}`,
            background: sel ? "rgba(124,58,237,0.15)" : "#141414",
            color: sel ? "#fff" : "#888", cursor: "pointer",
            textAlign: "left", transition: "all 0.15s",
          }}>
            {opt.emoji && <div style={{ fontSize: "1.2rem", marginBottom: "0.3rem" }}>{opt.emoji}</div>}
            <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: opt.desc ? "0.2rem" : 0 }}>{opt.label}</div>
            {opt.desc && <div style={{ fontSize: "0.75rem", color: "#666", lineHeight: 1.4 }}>{opt.desc}</div>}
          </button>
        );
      })}
    </div>
  );

  const Toggle = ({ value, onChange, label }: {
    value: boolean; onChange: (v: boolean) => void; label: string;
  }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <button type="button" onClick={() => onChange(!value)} style={{
        width: "44px", height: "24px", borderRadius: "999px",
        background: value ? "#7c3aed" : "#2a2a2a",
        border: "none", cursor: "pointer", position: "relative",
        transition: "background 0.2s", flexShrink: 0,
      }}>
        <span style={{
          position: "absolute", top: "3px", left: value ? "23px" : "3px",
          width: "18px", height: "18px", borderRadius: "50%",
          background: "#fff", transition: "left 0.2s", display: "block",
        }} />
      </button>
      <span style={{ color: "#c0c0c0", fontSize: "0.88rem" }}>{label}</span>
    </div>
  );

  const Row = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>{children}</div>
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Inter', sans-serif", paddingBottom: "6rem" }}>

      {/* Sticky header */}
      <div style={{
        background: "rgba(10,10,10,0.9)", borderBottom: "1px solid #1a1a1a",
        padding: "0.9rem 2rem", position: "sticky", top: 0, zIndex: 100,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        backdropFilter: "blur(12px)",
      }}>
        <span style={{
          fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 900,
          background: "linear-gradient(135deg, #a78bfa, #ec4899)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>PeakMind</span>
        <span style={{ fontSize: "0.75rem", color: saveStatus === "saved" ? "#4ade80" : "#444" }}>
          {saveStatus === "saved" ? "✓ Draft saved" : saveStatus === "saving" ? "Saving…" : "Saves when you leave each field"}
        </span>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "3rem 1.5rem 0" }}>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 900, color: "#fff", margin: "0 0 0.75rem", lineHeight: 1.2,
          }}>
            Build Your{" "}
            <span style={{
              background: "linear-gradient(135deg, #a78bfa, #ec4899)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Personal System</span>
          </h1>
          <p style={{ color: "#666", fontSize: "0.95rem", maxWidth: "440px", margin: "0 auto", lineHeight: 1.7 }}>
            Be brutally honest. The better your answers, the more powerful your plan. Takes about 5 minutes.
          </p>
        </div>

        {/* Error box */}
        {submitAttempted && errors.length > 0 && (
          <div id="error-box" style={{
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "12px", padding: "1.25rem 1.5rem", marginBottom: "2rem",
          }}>
            <p style={{ color: "#f87171", fontWeight: 600, margin: "0 0 0.5rem", fontSize: "0.875rem" }}>
              Fix these before continuing:
            </p>
            <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
              {errors.map((e) => (
                <li key={e} style={{ color: "#fca5a5", fontSize: "0.82rem", marginBottom: "0.2rem" }}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Section 1: About You ── */}
        <div style={sectionCard}>
          <SectionHeader number="1" title="About You" subtitle="Basic identity — who you are and where you are in life." />
          <Row>
            <Field label="Your name">
              <BlurInput
                value={localName}
                onChange={setLocalName}
                onCommit={(v) => commit({ name: v.trim() })}
                placeholder="e.g. Arjun"
              />
            </Field>
            <Field label="Age">
              <BlurInput
                type="number"
                value={localAge}
                onChange={setLocalAge}
                onCommit={(v) => commit({ age: Number(v) })}
                placeholder="18"
              />
            </Field>
          </Row>
          <Field label="Education level">
            <Cards
              options={educationOptions}
              value={profile.educationLevel}
              onChange={(v) => commit({ educationLevel: v })}
            />
          </Field>
          <Field label="Field of study / work">
            <BlurInput
              value={localFieldOfStudy}
              onChange={setLocalFieldOfStudy}
              onCommit={(v) => commit({ fieldOfStudy: v.trim() })}
              placeholder="e.g. Computer Science, CA Foundation, UPSC"
            />
          </Field>
        </div>

        {/* ── Section 2: Academic Profile ── */}
        <div style={sectionCard}>
          <SectionHeader number="2" title="Academic Profile" subtitle="What you're studying and where you stand right now." />

          <Field label="Subjects you study">
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.65rem" }}>
              <input
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubject(); } }}
                placeholder="Type a subject and press Enter or Add"
                style={inputBase}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#7c3aed")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
              />
              <button type="button" onClick={addSubject} style={{
                padding: "0.75rem 1.1rem", background: "#7c3aed", color: "#fff",
                border: "none", borderRadius: "10px", cursor: "pointer",
                fontWeight: 600, fontSize: "0.85rem", whiteSpace: "nowrap",
              }}>Add</button>
            </div>
            {profile.subjects.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {profile.subjects.map((s) => (
                  <span key={s} style={{
                    background: "rgba(124,58,237,0.2)", border: "1px solid #7c3aed44",
                    color: "#a78bfa", borderRadius: "999px", padding: "0.25rem 0.75rem",
                    fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.35rem",
                  }}>
                    {s}
                    <button type="button"
                      onClick={() => commit({ subjects: profile.subjects.filter((x) => x !== s) })}
                      style={{ background: "none", border: "none", color: "#ec4899", cursor: "pointer", padding: 0, fontSize: "1rem", lineHeight: 1 }}
                    >×</button>
                  </span>
                ))}
              </div>
            )}
          </Field>

          <Field label="Exam goals / targets">
            <BlurTextArea
              value={localExamGoals}
              onChange={setLocalExamGoals}
              onCommit={(v) => commit({ examGoals: v.trim() })}
              placeholder="e.g. Score 90%+ in boards, crack JEE Mains, pass CA Inter in May 2025"
            />
          </Field>

          <Field label="Current performance">
            <BlurTextArea
              value={localPerformance}
              onChange={setLocalPerformance}
              onCommit={(v) => commit({ currentPerformance: v.trim() })}
              placeholder="e.g. Scoring 65–70%, weak in Maths, decent in Chemistry"
              rows={2}
            />
          </Field>

          <Row>
            <Field label="Hours available daily">
              <Slider
                value={profile.dailyStudyHoursAvailable}
                onChange={(v) => commit({ dailyStudyHoursAvailable: v })}
                min={1} max={14} label={(v) => `${v} hrs/day`}
              />
            </Field>
            <Field label="Avg session length">
              <Slider
                value={profile.averageSessionLength}
                onChange={(v) => commit({ averageSessionLength: v })}
                min={15} max={180} label={(v) => `${v} min`}
              />
            </Field>
          </Row>
        </div>

        {/* ── Section 3: Study Habits ── */}
        <div style={sectionCard}>
          <SectionHeader number="3" title="Study Habits" subtitle="How you currently study — be brutally honest." />

          <Field label="Current study method">
            <BlurTextArea
              value={localStudyMethod}
              onChange={setLocalStudyMethod}
              onCommit={(v) => commit({ currentStudyMethod: v.trim() })}
              placeholder="e.g. Read NCERT + watch YouTube, make notes sometimes, revise day before exams"
              rows={2}
            />
          </Field>

          <Field label="Biggest distractions">
            <Chips
              options={distractionOptions}
              selected={profile.biggestDistractions}
              onToggle={(v) => toggleArray("biggestDistractions", v)}
            />
          </Field>

          <Row>
            <Field label="Procrastination level">
              <Slider
                value={profile.procrastinationLevel}
                onChange={(v) => commit({ procrastinationLevel: v as ProcrastinationLevel })}
                min={1} max={5}
                label={(v) => ["Never", "Rarely", "Sometimes", "Often", "Always"][v - 1]}
              />
            </Field>
            <Field label="Peak energy time">
              <Cards
                options={energyOptions}
                value={profile.energyPeakTime}
                onChange={(v) => commit({ energyPeakTime: v })}
              />
            </Field>
          </Row>
        </div>

        {/* ── Section 4: Daily Schedule ── */}
        <div style={sectionCard}>
          <SectionHeader number="4" title="Daily Schedule" subtitle="Your current daily rhythm so we can design around it." />
          <Row>
            <Field label="Wake-up time">
              <input
                type="time"
                value={profile.wakeUpTime}
                onChange={(e) => commit({ wakeUpTime: e.target.value })}
                style={inputBase}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#7c3aed")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
              />
            </Field>
            <Field label="Sleep time">
              <input
                type="time"
                value={profile.sleepTime}
                onChange={(e) => commit({ sleepTime: e.target.value })}
                style={inputBase}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#7c3aed")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a2a")}
              />
            </Field>
          </Row>
        </div>

        {/* ── Section 5: Wellbeing ── */}
        <div style={sectionCard}>
          <SectionHeader number="5" title="Wellbeing" subtitle="Physical and mental health directly impacts how well you learn." />

          <Row>
            <Field label="Stress level">
              <Slider
                value={profile.stressLevel}
                onChange={(v) => commit({ stressLevel: v as StressLevel })}
                min={1} max={5}
                label={(v) => ["Very relaxed", "Low", "Moderate", "High", "Extreme"][v - 1]}
              />
            </Field>
            <Field label="Exercise frequency">
              <SelectInput
                value={profile.exerciseFrequency}
                onChange={(v) => commit({ exerciseFrequency: v })}
                options={exerciseOptions}
              />
            </Field>
          </Row>

          <Row>
            <Field label="Screen time per day (non-study)">
              <Slider
                value={profile.screenTimePerDay}
                onChange={(v) => commit({ screenTimePerDay: v })}
                min={0} max={16} label={(v) => `${v} hrs`}
              />
            </Field>
            <Field label="Burnout symptoms">
              <div style={{ paddingTop: "0.5rem" }}>
                <Toggle
                  value={profile.burnoutSymptoms}
                  onChange={(v) => commit({ burnoutSymptoms: v })}
                  label={profile.burnoutSymptoms ? "Yes, feeling burnt out" : "No, I'm okay"}
                />
              </div>
            </Field>
          </Row>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", color: "#c0c0c0", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              Social media apps you use
            </label>
            <Chips
              options={socialMediaOptions}
              selected={profile.socialMediaApps}
              onToggle={(v) => toggleArray("socialMediaApps", v)}
            />
          </div>
        </div>

        {/* ── Section 6: Goals & Coaching ── */}
        <div style={sectionCard}>
          <SectionHeader number="6" title="Goals & Coaching" subtitle="What you want and how you want to be coached." />

          <Field label="Primary goal (in your own words)">
            <BlurTextArea
              value={localPrimaryGoal}
              onChange={setLocalPrimaryGoal}
              onCommit={(v) => commit({ primaryGoal: v.trim() })}
              placeholder="e.g. I want to stop wasting time and study consistently so I can crack NEET this year"
              rows={2}
            />
          </Field>

          <Field label="Coach personality">
            <Cards
              options={coachOptions}
              value={profile.coachPersonality}
              onChange={(v) => commit({ coachPersonality: v })}
            />
          </Field>

          <Field label="Previous systems you've tried">
            <BlurTextArea
              value={localPreviousSystems}
              onChange={setLocalPreviousSystems}
              onCommit={(v) => commit({ previousSystemsTried: v.trim() })}
              placeholder="e.g. Tried Pomodoro but kept skipping. Made timetables but never followed them."
              rows={2}
            />
          </Field>
        </div>

        {/* ── Submit ── */}
        <div style={{ textAlign: "center", paddingTop: "1rem" }}>
          <button
            type="button"
            onClick={handleSubmit}
            style={{
              padding: "1rem 3rem",
              background: "linear-gradient(135deg, #7c3aed, #ec4899)",
              color: "#ffffff", border: "none", borderRadius: "12px",
              fontSize: "1rem", fontWeight: 700, cursor: "pointer",
              letterSpacing: "0.04em", boxShadow: "0 0 40px rgba(124,58,237,0.4)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 60px rgba(124,58,237,0.6)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 40px rgba(124,58,237,0.4)";
            }}
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