"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function PlanPage() {
  const router = useRouter();
  const store = useAppStore();
  const masterPlan = store.masterPlan;
  const studentProfile = store.studentProfile;
  const isOnboarded = store.isOnboarded;

  useEffect(() => {
    if (!isOnboarded || !studentProfile) {
      router.push("/onboarding");
    } else if (!masterPlan) {
      router.push("/generating");
    }
  }, [isOnboarded, studentProfile, masterPlan, router]);

  if (!masterPlan || !studentProfile) return null;

  const urgencyColor: Record<string, string> = {
    low: "#4ade80",
    medium: "#facc15",
    high: "#fb923c",
    critical: "#f87171",
  };

  const priorityColor: Record<string, string> = {
    high: "#f87171",
    medium: "#facc15",
    low: "#4ade80",
  };

  const card: React.CSSProperties = {
    background: "#111",
    border: "1px solid #1e1e1e",
    borderRadius: "16px",
    padding: "1.75rem",
    marginBottom: "1.5rem",
  };

  const sectionTitle: React.CSSProperties = {
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.15rem",
    fontWeight: 700,
    color: "#fff",
    margin: "0 0 1.25rem",
  };

  const label: React.CSSProperties = {
    color: "#555",
    fontSize: "0.72rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    marginBottom: "0.35rem",
  };

  const pill = (text: string, color = "#a78bfa", bg = "rgba(124,58,237,0.12)"): React.ReactNode => (
    <span key={text} style={{
      display: "inline-block",
      padding: "0.25rem 0.75rem",
      background: bg,
      color,
      borderRadius: "999px",
      fontSize: "0.78rem",
      fontWeight: 500,
      border: `1px solid ${color}33`,
      marginRight: "0.4rem",
      marginBottom: "0.4rem",
    }}>{text}</span>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Inter', sans-serif", paddingBottom: "4rem" }}>

      {/* Navbar */}
      <div style={{
        background: "rgba(10,10,10,0.95)", borderBottom: "1px solid #1a1a1a",
        padding: "0.9rem 2rem", display: "flex", justifyContent: "space-between",
        alignItems: "center", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)",
      }}>
        <span style={{
          fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 900,
          background: "linear-gradient(135deg,#a78bfa,#ec4899)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>PeakMind</span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Coach", path: "/coach" },
            { label: "Schedule", path: "/schedule" },
          ].map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => router.push(item.path)}
              style={{ padding: "0.4rem 0.9rem", background: "transparent", border: "1px solid #2a2a2a", borderRadius: "8px", color: "#888", fontSize: "0.8rem", cursor: "pointer" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.color = "#a78bfa"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#888"; }}
            >{item.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "2.5rem 1.5rem 0" }}>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem,3vw,2.4rem)", fontWeight: 900, color: "#fff", margin: "0 0 0.5rem" }}>
            {studentProfile.name.split(" ")[0]}&apos;s Master Plan
          </h1>
          <p style={{ color: "#555", fontSize: "0.85rem", margin: 0 }}>
            Generated {new Date(masterPlan.meta.generatedAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })} · Version {masterPlan.meta.planVersion}
          </p>
        </div>

        {/* ── 1. DIAGNOSIS ── */}
        <div style={{ ...card, borderLeft: `3px solid ${urgencyColor[masterPlan.diagnosis.urgencyLevel]}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={sectionTitle}>Diagnosis</h2>
            <span style={{
              padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.06em",
              background: `${urgencyColor[masterPlan.diagnosis.urgencyLevel]}18`,
              color: urgencyColor[masterPlan.diagnosis.urgencyLevel],
              border: `1px solid ${urgencyColor[masterPlan.diagnosis.urgencyLevel]}33`,
            }}>{masterPlan.diagnosis.urgencyLevel} urgency</span>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <p style={label}>Psychological Profile</p>
            <p style={{ color: "#d0d0d0", fontSize: "0.9rem", lineHeight: 1.7, margin: 0 }}>
              {masterPlan.diagnosis.psychologicalProfile}
            </p>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <p style={label}>Key Insight</p>
            <p style={{ color: "#d0d0d0", fontSize: "0.9rem", lineHeight: 1.7, margin: 0, borderLeft: "2px solid #7c3aed", paddingLeft: "1rem" }}>
              {masterPlan.diagnosis.keyInsight}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div>
              <p style={label}>Primary Problems</p>
              <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                {masterPlan.diagnosis.primaryProblems.map((p) => (
                  <li key={p} style={{ color: "#f87171", fontSize: "0.85rem", marginBottom: "0.3rem" }}>{p}</li>
                ))}
              </ul>
            </div>
            <div>
              <p style={label}>Root Causes</p>
              <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                {masterPlan.diagnosis.rootCauses.map((c) => (
                  <li key={c} style={{ color: "#facc15", fontSize: "0.85rem", marginBottom: "0.3rem" }}>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ marginTop: "1.25rem" }}>
            <p style={label}>Strengths</p>
            <div>{masterPlan.diagnosis.strengths.map((s) => pill(s, "#4ade80", "rgba(74,222,128,0.1)"))}</div>
          </div>
        </div>

        {/* ── 2. STRATEGY ── */}
        <div style={card}>
          <h2 style={sectionTitle}>Study Strategy</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
            <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "1.1rem" }}>
              <p style={label}>Primary Method</p>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", margin: "0 0 0.35rem" }}>{masterPlan.strategy.primaryStudyMethod}</p>
              <p style={{ color: "#888", fontSize: "0.8rem", margin: 0, lineHeight: 1.5 }}>{masterPlan.strategy.primaryMethodDescription}</p>
            </div>
            <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "1.1rem" }}>
              <p style={label}>Secondary Method</p>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", margin: "0 0 0.5rem" }}>{masterPlan.strategy.secondaryMethod}</p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <span style={{ color: "#a78bfa", fontSize: "0.8rem" }}>{masterPlan.strategy.weeklyStudyHours}h / week</span>
                <span style={{ color: "#60a5fa", fontSize: "0.8rem" }}>{masterPlan.strategy.sessionLength}min sessions</span>
                <span style={{ color: "#4ade80", fontSize: "0.8rem" }}>{masterPlan.strategy.breakDuration}min breaks</span>
              </div>
            </div>
          </div>

          <p style={label}>Subject Breakdown</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {masterPlan.strategy.subjects.map((sub) => (
              <div key={sub.subject} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.85rem 1rem", background: "#141414", border: "1px solid #1e1e1e", borderRadius: "10px" }}>
                <span style={{ padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", background: `${priorityColor[sub.priority]}18`, color: priorityColor[sub.priority], border: `1px solid ${priorityColor[sub.priority]}33`, flexShrink: 0 }}>{sub.priority}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#e0e0e0", marginBottom: "0.15rem" }}>{sub.subject}</div>
                  <div style={{ fontSize: "0.75rem", color: "#666" }}>{sub.reason}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#a78bfa" }}>{sub.weeklyHours}h/wk</div>
                  <div style={{ fontSize: "0.7rem", color: "#555" }}>{sub.recommendedMethod}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. DISTRACTION CONTROL ── */}
        <div style={card}>
          <h2 style={sectionTitle}>Distraction Control</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
            <div>
              <p style={label}>Blocking Rules</p>
              <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                {masterPlan.distractionControl.blockingRules.map((r) => (
                  <li key={r} style={{ color: "#c0c0c0", fontSize: "0.82rem", marginBottom: "0.4rem", lineHeight: 1.5 }}>{r}</li>
                ))}
              </ul>
            </div>
            <div>
              <p style={label}>Environment Setup</p>
              <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                {masterPlan.distractionControl.environmentSetup.map((e) => (
                  <li key={e} style={{ color: "#c0c0c0", fontSize: "0.82rem", marginBottom: "0.4rem", lineHeight: 1.5 }}>{e}</li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "1rem" }}>
              <p style={{ ...label, marginBottom: "0.5rem" }}>Phone Policy</p>
              <p style={{ color: "#d0d0d0", fontSize: "0.82rem", margin: 0, lineHeight: 1.6 }}>{masterPlan.distractionControl.phonePolicy}</p>
            </div>
            <div style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: "12px", padding: "1rem" }}>
              <p style={{ ...label, marginBottom: "0.5rem", color: "#f87171" }}>Emergency Protocol</p>
              <p style={{ color: "#d0d0d0", fontSize: "0.82rem", margin: 0, lineHeight: 1.6 }}>{masterPlan.distractionControl.emergencyProtocol}</p>
            </div>
          </div>

          <div style={{ marginTop: "1.25rem" }}>
            <p style={label}>Top Distractions to Beat</p>
            <div>{masterPlan.distractionControl.topDistractions.map((d) => pill(d, "#f87171", "rgba(248,113,113,0.08)"))}</div>
          </div>
        </div>

        {/* ── 4. RESOURCES ── */}
        <div style={card}>
          <h2 style={sectionTitle}>Curated Resources</h2>

          {/* Books */}
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={label}>Books</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {masterPlan.resources.books.map((b) => (
                <div key={b.title} style={{ display: "flex", gap: "0.85rem", padding: "0.85rem", background: "#141414", border: "1px solid #1e1e1e", borderRadius: "10px", alignItems: "flex-start" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", flexShrink: 0 }}>📚</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#e0e0e0" }}>{b.title}{b.author && <span style={{ color: "#555", fontWeight: 400 }}> — {b.author}</span>}</div>
                    <div style={{ fontSize: "0.78rem", color: "#666", marginTop: "0.2rem", lineHeight: 1.5 }}>{b.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Techniques */}
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={label}>Techniques</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {masterPlan.resources.techniques.map((t) => (
                <div key={t.name} style={{ padding: "1rem", background: "#141414", border: "1px solid #1e1e1e", borderRadius: "12px" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#a78bfa", marginBottom: "0.3rem" }}>{t.name}</div>
                  <div style={{ fontSize: "0.78rem", color: "#888", marginBottom: "0.4rem", lineHeight: 1.5 }}>{t.description}</div>
                  <div style={{ fontSize: "0.75rem", color: "#555", lineHeight: 1.5 }}>{t.howToUse}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Podcasts */}
          <div style={{ marginBottom: "1.5rem" }}>
            <p style={label}>Podcasts</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {masterPlan.resources.podcasts.map((p) => (
                <div key={p.title} style={{ padding: "0.6rem 1rem", background: "#141414", border: "1px solid #1e1e1e", borderRadius: "10px", flex: "1 1 200px" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "#e0e0e0", marginBottom: "0.15rem" }}>🎙 {p.title}</div>
                  <div style={{ fontSize: "0.75rem", color: "#666" }}>{p.reason}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div>
            <p style={label}>Tools</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {masterPlan.resources.tools.map((t) => (
                <div key={t.name} style={{ padding: "0.6rem 1rem", background: "#141414", border: "1px solid #1e1e1e", borderRadius: "10px", flex: "1 1 180px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.15rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.82rem", color: "#e0e0e0" }}>🛠 {t.name}</span>
                    <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: "999px", background: t.free ? "rgba(74,222,128,0.1)" : "rgba(251,146,60,0.1)", color: t.free ? "#4ade80" : "#fb923c", border: `1px solid ${t.free ? "#4ade8033" : "#fb923c33"}` }}>{t.free ? "Free" : "Paid"}</span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#666" }}>{t.purpose}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 5. WEEKLY REVIEW ── */}
        <div style={card}>
          <h2 style={sectionTitle}>Weekly Review System</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div>
              <p style={label}>Weekly Checklist</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {masterPlan.weeklyReview.checklistItems.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.65rem", alignItems: "flex-start" }}>
                    <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid #333", flexShrink: 0, marginTop: "1px" }} />
                    <span style={{ color: "#c0c0c0", fontSize: "0.82rem", lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p style={label}>Review Questions</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {masterPlan.weeklyReview.reviewQuestions.map((q, i) => (
                  <div key={i} style={{ padding: "0.65rem 0.85rem", background: "#141414", border: "1px solid #1e1e1e", borderRadius: "8px" }}>
                    <span style={{ color: "#a78bfa", fontSize: "0.7rem", fontWeight: 700 }}>Q{i + 1}  </span>
                    <span style={{ color: "#c0c0c0", fontSize: "0.8rem" }}>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <p style={label}>Progress Metrics to Track</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {masterPlan.weeklyReview.progressMetrics.map((m) => (
                <div key={m.metric} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.7rem 1rem", background: "#141414", border: "1px solid #1e1e1e", borderRadius: "10px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#e0e0e0", marginBottom: "0.15rem" }}>{m.metric}</div>
                    <div style={{ height: "4px", background: "#1e1e1e", borderRadius: "999px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min(100, m.current > 0 ? (m.current / m.target) * 100 : 0)}%`, background: "linear-gradient(90deg,#7c3aed,#a78bfa)", borderRadius: "999px" }} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ fontSize: "0.75rem", color: "#a78bfa", fontWeight: 600 }}>{m.current} / {m.target}</span>
                    <div style={{ fontSize: "0.65rem", color: "#555" }}>{m.unit}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
