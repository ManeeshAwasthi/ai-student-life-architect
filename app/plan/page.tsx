"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

const URGENCY_COLOR: Record<string, string> = {
  low: "#4ade80", medium: "#facc15", high: "#fb923c", critical: "#f87171",
};
const PRIORITY_COLOR: Record<string, string> = {
  high: "#f87171", medium: "#facc15", low: "#4ade80",
};

export default function PlanPage() {
  const router = useRouter();
  const store = useAppStore();
  const masterPlan = store.masterPlan;
  const studentProfile = store.studentProfile;
  const isOnboarded = store.isOnboarded;

  const [isMobile, setIsMobile] = useState(false);

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
      <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid #1e1e1e", borderTop: "3px solid #7c3aed", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: "#555", fontSize: "0.875rem" }}>Loading your plan…</p>
        </div>
      </div>
    );
  }

  const { diagnosis, strategy, distractionControl, resources, weeklyReview, meta } = masterPlan;
  const urgencyColor = URGENCY_COLOR[diagnosis.urgencyLevel] ?? "#a78bfa";
  const col2 = isMobile ? "1fr" : "1fr 1fr";

  const card: React.CSSProperties = {
    background: "#111111", border: "1px solid #1e1e1e", borderRadius: "16px",
    padding: isMobile ? "1.25rem" : "1.75rem", marginBottom: "1.5rem",
  };
  const lbl: React.CSSProperties = {
    color: "#555", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.5rem",
  };
  const sectionTitle: React.CSSProperties = {
    fontFamily: "'Playfair Display', serif", fontSize: isMobile ? "1.05rem" : "1.2rem",
    fontWeight: 700, color: "#fff", margin: "0 0 1.25rem",
  };
  const pill = (text: string, color: string) => (
    <span key={text} style={{
      display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "999px",
      background: `${color}18`, border: `1px solid ${color}33`, color,
      fontSize: "0.78rem", fontWeight: 500, marginRight: "0.4rem", marginBottom: "0.4rem",
    }}>{text}</span>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Inter', sans-serif", paddingBottom: "4rem" }}>

      {/* Navbar */}
      <div style={{
        background: "rgba(10,10,10,0.95)", borderBottom: "1px solid #1a1a1a",
        padding: "0.9rem 1.5rem", display: "flex", justifyContent: "space-between",
        alignItems: "center", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)",
      }}>
        <span style={{
          fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 900,
          background: "linear-gradient(135deg,#a78bfa,#ec4899)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>PeakMind</span>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Schedule", path: "/schedule" },
            { label: "Coach", path: "/coach" },
            { label: "Progress", path: "/progress" },
          ].map((item) => (
            <button key={item.path} type="button" onClick={() => router.push(item.path)} style={{
              padding: "0.4rem 0.85rem", background: "transparent", border: "1px solid #2a2a2a",
              borderRadius: "8px", color: "#888", fontSize: "0.8rem", cursor: "pointer", transition: "all 0.15s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.color = "#a78bfa"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#888"; }}
            >{item.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: isMobile ? "2rem 1rem 0" : "2.5rem 1.5rem 0" }}>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: isMobile ? "clamp(1.6rem,6vw,2rem)" : "clamp(1.8rem,3vw,2.4rem)",
            fontWeight: 900, color: "#fff", margin: "0 0 0.5rem",
          }}>
            {studentProfile.name.split(" ")[0]}&apos;s Master Plan
          </h1>
          <p style={{ color: "#555", fontSize: "0.85rem", margin: 0 }}>
            Generated {new Date(meta.generatedAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })} · v{meta.planVersion}
          </p>
        </div>

        {/* ── 1. DIAGNOSIS ── */}
        <div style={{ ...card, borderLeft: `3px solid ${urgencyColor}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <h2 style={{ ...sectionTitle, margin: 0 }}>Diagnosis</h2>
            <span style={{
              padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.06em",
              background: `${urgencyColor}18`, color: urgencyColor, border: `1px solid ${urgencyColor}33`,
            }}>{diagnosis.urgencyLevel} urgency</span>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <p style={lbl}>Psychological Profile</p>
            <p style={{ color: "#d0d0d0", fontSize: "0.9rem", lineHeight: 1.7, margin: 0 }}>{diagnosis.psychologicalProfile}</p>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <p style={lbl}>Key Insight</p>
            <p style={{ color: "#d0d0d0", fontSize: "0.9rem", lineHeight: 1.7, margin: 0, borderLeft: "2px solid #7c3aed", paddingLeft: "1rem" }}>
              {diagnosis.keyInsight}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: col2, gap: "1.25rem", marginBottom: "1.25rem" }}>
            <div>
              <p style={lbl}>Primary Problems</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {(diagnosis.primaryProblems ?? []).map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                    <span style={{ color: "#f87171", flexShrink: 0, fontSize: "0.8rem", marginTop: "0.1rem" }}>✕</span>
                    <span style={{ color: "#c0c0c0", fontSize: "0.83rem", lineHeight: 1.5 }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p style={lbl}>Root Causes</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {(diagnosis.rootCauses ?? []).map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                    <span style={{ color: "#facc15", flexShrink: 0, fontSize: "0.8rem", marginTop: "0.1rem" }}>→</span>
                    <span style={{ color: "#c0c0c0", fontSize: "0.83rem", lineHeight: 1.5 }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p style={lbl}>Strengths</p>
            <div>{(diagnosis.strengths ?? []).map((s) => pill(s, "#4ade80"))}</div>
          </div>
        </div>

        {/* ── 2. STRATEGY ── */}
        <div style={card}>
          <h2 style={sectionTitle}>Study Strategy</h2>

          <div style={{ display: "grid", gridTemplateColumns: col2, gap: "1.25rem", marginBottom: "1.25rem" }}>
            <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "1.1rem" }}>
              <p style={lbl}>Primary Method</p>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", margin: "0 0 0.35rem" }}>{strategy.primaryStudyMethod}</p>
              <p style={{ color: "#888", fontSize: "0.8rem", margin: 0, lineHeight: 1.5 }}>{strategy.primaryMethodDescription}</p>
            </div>
            <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "1.1rem" }}>
              <p style={lbl}>Secondary Method</p>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", margin: "0 0 0.5rem" }}>{strategy.secondaryMethod}</p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <span style={{ color: "#a78bfa", fontSize: "0.8rem" }}>{strategy.weeklyStudyHours}h/week</span>
                <span style={{ color: "#60a5fa", fontSize: "0.8rem" }}>{strategy.sessionLength}min sessions</span>
                <span style={{ color: "#4ade80", fontSize: "0.8rem" }}>{strategy.breakDuration}min breaks</span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(3,1fr)" : "repeat(3,1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {[
              { label: "Weekly Hours", value: strategy.weeklyStudyHours, unit: "hrs/week", color: "#a78bfa" },
              { label: "Session Length", value: strategy.sessionLength, unit: "minutes", color: "#60a5fa" },
              { label: "Break Duration", value: strategy.breakDuration, unit: "minutes", color: "#4ade80" },
            ].map((s) => (
              <div key={s.label} style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "0.85rem", textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ color: "#555", fontSize: "0.68rem", marginTop: "0.1rem" }}>{s.unit}</div>
                <div style={{ color: "#888", fontSize: "0.72rem", marginTop: "0.1rem" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <p style={lbl}>Subject Breakdown</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {(strategy.subjects ?? []).map((sub) => {
              const pc = PRIORITY_COLOR[sub.priority] ?? "#a78bfa";
              return (
                <div key={sub.subject} style={{
                  display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: isMobile ? "wrap" : "nowrap",
                  padding: "0.85rem 1rem", background: "#141414", border: "1px solid #1e1e1e", borderRadius: "10px",
                  transition: "all 0.15s",
                }}>
                  <span style={{ padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", background: `${pc}18`, color: pc, border: `1px solid ${pc}33`, flexShrink: 0 }}>{sub.priority}</span>
                  <div style={{ flex: 1, minWidth: "100px" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#e0e0e0", marginBottom: "0.1rem" }}>{sub.subject}</div>
                    {!isMobile && <div style={{ fontSize: "0.73rem", color: "#666" }}>{sub.reason}</div>}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#a78bfa" }}>{sub.weeklyHours}h/wk</div>
                    <div style={{ fontSize: "0.68rem", color: "#555" }}>{sub.recommendedMethod}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 3. DISTRACTION CONTROL ── */}
        <div style={card}>
          <h2 style={sectionTitle}>Distraction Control</h2>

          <div style={{ display: "grid", gridTemplateColumns: col2, gap: "1.25rem", marginBottom: "1.25rem" }}>
            <div>
              <p style={lbl}>Blocking Rules</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {(distractionControl?.blockingRules ?? []).map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                    <span style={{ color: "#7c3aed", flexShrink: 0, fontSize: "0.85rem" }}>◈</span>
                    <span style={{ color: "#c0c0c0", fontSize: "0.83rem", lineHeight: 1.5 }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p style={lbl}>Environment Setup</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {(distractionControl?.environmentSetup ?? []).map((e, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                    <span style={{ color: "#4ade80", flexShrink: 0, fontSize: "0.85rem" }}>✓</span>
                    <span style={{ color: "#c0c0c0", fontSize: "0.83rem", lineHeight: 1.5 }}>{e}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: col2, gap: "1rem", marginBottom: "1.25rem" }}>
            <div style={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "1rem" }}>
              <p style={{ ...lbl, color: "#fb923c" }}>Phone Policy</p>
              <p style={{ color: "#d0d0d0", fontSize: "0.82rem", margin: 0, lineHeight: 1.6 }}>{distractionControl?.phonePolicy}</p>
            </div>
            <div style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: "12px", padding: "1rem" }}>
              <p style={{ ...lbl, color: "#f87171" }}>Emergency Protocol</p>
              <p style={{ color: "#d0d0d0", fontSize: "0.82rem", margin: 0, lineHeight: 1.6 }}>{distractionControl?.emergencyProtocol}</p>
            </div>
          </div>

          <p style={lbl}>Top Distractions to Beat</p>
          <div>{(distractionControl?.topDistractions ?? []).map((d) => pill(d, "#f87171"))}</div>
        </div>

        {/* ── 4. RESOURCES ── */}
        <div style={card}>
          <h2 style={sectionTitle}>Curated Resources</h2>

          <p style={lbl}>Books</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.5rem" }}>
            {(resources?.books ?? []).map((b, i) => (
              <div key={i} style={{ display: "flex", gap: "0.85rem", padding: "0.85rem", background: "#141414", border: "1px solid #1e1e1e", borderRadius: "10px", alignItems: "flex-start", transition: "all 0.15s" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", flexShrink: 0 }}>📚</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#e0e0e0" }}>{b.title}{b.author && <span style={{ color: "#555", fontWeight: 400 }}> — {b.author}</span>}</div>
                  <div style={{ fontSize: "0.78rem", color: "#666", marginTop: "0.2rem", lineHeight: 1.5 }}>{b.reason}</div>
                </div>
              </div>
            ))}
          </div>

          <p style={lbl}>Techniques</p>
          <div style={{ display: "grid", gridTemplateColumns: col2, gap: "0.75rem", marginBottom: "1.5rem" }}>
            {(resources?.techniques ?? []).map((t, i) => (
              <div key={i} style={{ padding: "1rem", background: "#141414", border: "1px solid #1e1e1e", borderRadius: "12px", transition: "all 0.15s" }}>
                <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#a78bfa", marginBottom: "0.3rem" }}>{t.name}</div>
                <div style={{ fontSize: "0.78rem", color: "#888", marginBottom: "0.5rem", lineHeight: 1.5 }}>{t.description}</div>
                <div style={{ fontSize: "0.73rem", color: "#555", lineHeight: 1.5, borderTop: "1px solid #1e1e1e", paddingTop: "0.5rem" }}>
                  <span style={{ color: "#4ade80", fontWeight: 600 }}>How: </span>{t.howToUse}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: col2, gap: "1.25rem" }}>
            <div>
              <p style={lbl}>Podcasts</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {(resources?.podcasts ?? []).map((p, i) => (
                  <div key={i} style={{ padding: "0.65rem 0.85rem", background: "#141414", border: "1px solid #1e1e1e", borderRadius: "10px" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "#e0e0e0", marginBottom: "0.15rem" }}>🎙 {p.title}</div>
                    <div style={{ fontSize: "0.73rem", color: "#666" }}>{p.reason}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p style={lbl}>Tools</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {(resources?.tools ?? []).map((t, i) => (
                  <div key={i} style={{ padding: "0.65rem 0.85rem", background: "#141414", border: "1px solid #1e1e1e", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "#e0e0e0", marginBottom: "0.1rem" }}>🛠 {t.name}</div>
                      <div style={{ fontSize: "0.73rem", color: "#666" }}>{t.purpose}</div>
                    </div>
                    <span style={{ fontSize: "0.65rem", padding: "0.15rem 0.45rem", borderRadius: "999px", background: t.free ? "rgba(74,222,128,0.1)" : "rgba(251,146,60,0.1)", color: t.free ? "#4ade80" : "#fb923c", border: `1px solid ${t.free ? "#4ade8033" : "#fb923c33"}`, flexShrink: 0 }}>{t.free ? "Free" : "Paid"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── 5. WEEKLY REVIEW ── */}
        <div style={card}>
          <h2 style={sectionTitle}>Weekly Review System</h2>

          <div style={{ display: "grid", gridTemplateColumns: col2, gap: "1.5rem", marginBottom: "1.5rem" }}>
            <div>
              <p style={lbl}>Weekly Checklist</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {(weeklyReview?.checklistItems ?? []).map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.65rem", alignItems: "flex-start" }}>
                    <div style={{ width: "16px", height: "16px", borderRadius: "4px", border: "2px solid #333", flexShrink: 0, marginTop: "2px" }} />
                    <span style={{ color: "#c0c0c0", fontSize: "0.83rem", lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p style={lbl}>Reflection Questions</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {(weeklyReview?.reviewQuestions ?? []).map((q, i) => (
                  <div key={i} style={{ padding: "0.65rem 0.85rem", background: "#141414", border: "1px solid #1e1e1e", borderRadius: "8px" }}>
                    <span style={{ color: "#a78bfa", fontSize: "0.7rem", fontWeight: 700 }}>Q{i + 1}  </span>
                    <span style={{ color: "#c0c0c0", fontSize: "0.8rem", lineHeight: 1.5 }}>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p style={lbl}>Progress Metrics</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {(weeklyReview?.progressMetrics ?? []).map((m) => (
              <div key={m.metric} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.7rem 1rem", background: "#141414", border: "1px solid #1e1e1e", borderRadius: "10px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#e0e0e0", marginBottom: "0.3rem" }}>{m.metric}</div>
                  <div style={{ height: "4px", background: "#1e1e1e", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(100, m.target > 0 ? (m.current / m.target) * 100 : 0)}%`, background: "linear-gradient(90deg,#7c3aed,#a78bfa)", borderRadius: "999px", transition: "width 0.6s ease" }} />
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
  );
}
