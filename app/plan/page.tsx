"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

type SectionId = "diagnosis" | "strategy" | "habits" | "resources" | "review";

const SECTIONS: { id: SectionId; label: string; emoji: string }[] = [
  { id: "diagnosis", label: "Diagnosis",     emoji: "🔍" },
  { id: "strategy",  label: "Strategy",      emoji: "🎯" },
  { id: "habits",    label: "Habits",        emoji: "⚡" },
  { id: "resources", label: "Resources",     emoji: "📚" },
  { id: "review",    label: "Weekly Review", emoji: "📋" },
];

const PRIORITY_COLOR: Record<string, string> = {
  high: "#ff6b9d", medium: "#ffb347", low: "#00d4aa",
};

export default function PlanPage() {
  const router = useRouter();
  const store  = useAppStore();
  const masterPlan     = store.masterPlan;
  const studentProfile = store.studentProfile;
  const isOnboarded    = store.isOnboarded;

  const [activeSection, setActiveSection] = useState<SectionId>("diagnosis");
  const [isMobile, setIsMobile]           = useState(false);

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
      <div style={{ minHeight: "100vh", background: "#080810", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "36px", height: "36px", border: "3px solid #1e1e35", borderTop: "3px solid #6c63ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  const { diagnosis, strategy, distractionControl, resources, weeklyReview, meta } = masterPlan;

  return (
    <>
      <style>{`
        .plan-sidebar-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.18s ease;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          width: 100%;
          text-align: left;
          background: transparent;
          color: #8888aa;
        }
        .plan-sidebar-btn:hover {
          background: rgba(108,99,255,0.06);
          color: #c8c8ee;
          border-color: rgba(108,99,255,0.15);
        }
        .plan-sidebar-btn.active {
          background: rgba(108,99,255,0.12);
          color: #a594ff;
          border-color: rgba(108,99,255,0.28);
        }
        .plan-card {
          background: #12121e;
          border: 1px solid #1e1e35;
          border-radius: 16px;
          padding: 20px;
          transition: all 0.2s ease;
        }
        .plan-card:hover {
          border-color: rgba(108,99,255,0.2);
        }
        .plan-tab-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 9px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.18s ease;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          background: transparent;
          color: #8888aa;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .plan-tab-btn:hover { color: #c8c8ee; border-color: rgba(108,99,255,0.15); }
        .plan-tab-btn.active { background: rgba(108,99,255,0.12); color: #a594ff; border-color: rgba(108,99,255,0.28); }
      `}</style>

      {/* Ambient bg */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "10%", right: "15%", width: "360px", height: "360px", borderRadius: "50%", background: "radial-gradient(circle, rgba(108,99,255,0.06) 0%, transparent 70%)", animation: "float 16s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "20%", left: "5%", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,157,0.04) 0%, transparent 70%)", animation: "float 20s ease-in-out infinite reverse" }} />
      </div>

      <div style={{ minHeight: "100vh", background: "#080810", paddingBottom: "5rem", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: isMobile ? "28px 16px 0" : "40px 32px 0" }}>

          {/* ── Header ── */}
          <div className="stagger-1" style={{ marginBottom: "28px" }}>
            <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", marginBottom: "8px" }}>MASTER PLAN</p>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: isMobile ? "1.8rem" : "2.2rem", color: "#f0f0ff", letterSpacing: "-0.03em", margin: "0 0 6px" }}>
              {studentProfile.name.split(" ")[0]}&apos;s Blueprint
            </h1>
            <p style={{ color: "#44445a", fontSize: "12px", margin: 0, fontFamily: "'DM Mono', monospace" }}>
              Generated {new Date(meta.generatedAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })} · v{meta.planVersion}
            </p>
          </div>

          {/* ── Mobile tab row ── */}
          {isMobile && (
            <div className="stagger-2" style={{ display: "flex", gap: "4px", overflowX: "auto", marginBottom: "20px", paddingBottom: "4px" }}>
              {SECTIONS.map((s) => (
                <button key={s.id} type="button" className={`plan-tab-btn${activeSection === s.id ? " active" : ""}`} onClick={() => setActiveSection(s.id)}>
                  <span>{s.emoji}</span> {s.label}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>

            {/* ── Desktop sidebar ── */}
            {!isMobile && (
              <div className="stagger-2" style={{
                width: "200px", flexShrink: 0, position: "sticky", top: "80px",
                background: "#12121e", border: "1px solid #1e1e35", borderRadius: "16px", padding: "12px",
                display: "flex", flexDirection: "column", gap: "4px",
              }}>
                {SECTIONS.map((s) => (
                  <button key={s.id} type="button" className={`plan-sidebar-btn${activeSection === s.id ? " active" : ""}`} onClick={() => setActiveSection(s.id)}>
                    <span style={{ fontSize: "15px" }}>{s.emoji}</span>
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* ── Main content ── */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* ─────────── DIAGNOSIS ─────────── */}
              {activeSection === "diagnosis" && (
                <div className="stagger-3" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                  {/* Key insight */}
                  <div style={{ background: "rgba(108,99,255,0.04)", border: "1px solid #1e1e35", borderLeft: "3px solid #6c63ff", borderRadius: "16px", padding: "20px" }}>
                    <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "10px" }}>KEY INSIGHT</p>
                    <p style={{ color: "#c8c8ee", fontSize: "15px", fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>
                      &ldquo;{diagnosis.keyInsight}&rdquo;
                    </p>
                  </div>

                  {/* Psych profile */}
                  <div className="plan-card">
                    <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "10px" }}>PSYCHOLOGICAL PROFILE</p>
                    <p style={{ color: "#c8c8ee", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>{diagnosis.psychologicalProfile}</p>
                  </div>

                  {/* Problems + Strengths */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
                    <div className="plan-card" style={{ borderLeft: "2px solid #ff6b9d" }}>
                      <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "12px" }}>PRIMARY PROBLEMS</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {(diagnosis.primaryProblems ?? []).map((p, i) => (
                          <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                            <span style={{ color: "#ff6b9d", flexShrink: 0, fontSize: "12px", marginTop: "2px" }}>✕</span>
                            <span style={{ color: "#c8c8ee", fontSize: "13px", lineHeight: 1.5 }}>{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="plan-card" style={{ borderLeft: "2px solid #00d4aa" }}>
                      <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "12px" }}>STRENGTHS</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {(diagnosis.strengths ?? []).map((s, i) => (
                          <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                            <span style={{ color: "#00d4aa", flexShrink: 0, fontSize: "12px", marginTop: "2px" }}>✓</span>
                            <span style={{ color: "#c8c8ee", fontSize: "13px", lineHeight: 1.5 }}>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Root causes */}
                  <div className="plan-card" style={{ borderLeft: "2px solid #ffb347" }}>
                    <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "12px" }}>ROOT CAUSES</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {(diagnosis.rootCauses ?? []).map((c, i) => (
                        <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                          <span style={{ color: "#ffb347", flexShrink: 0, fontSize: "13px" }}>→</span>
                          <span style={{ color: "#c8c8ee", fontSize: "13px", lineHeight: 1.5 }}>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────── STRATEGY ─────────── */}
              {activeSection === "strategy" && (
                <div className="stagger-3" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                  {/* Primary + Secondary method */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
                    <div className="plan-card" style={{ background: "rgba(108,99,255,0.06)", borderColor: "rgba(108,99,255,0.2)" }}>
                      <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "10px" }}>PRIMARY METHOD</p>
                      <p style={{ color: "#f0f0ff", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "15px", margin: "0 0 8px" }}>{strategy.primaryStudyMethod}</p>
                      <p style={{ color: "#8888aa", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>{strategy.primaryMethodDescription}</p>
                    </div>
                    <div className="plan-card">
                      <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "10px" }}>SECONDARY METHOD</p>
                      <p style={{ color: "#f0f0ff", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "15px", margin: "0 0 12px" }}>{strategy.secondaryMethod}</p>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {[
                          { label: `${strategy.weeklyStudyHours}h/week`, color: "#a594ff" },
                          { label: `${strategy.sessionLength}min sessions`, color: "#00d4aa" },
                          { label: `${strategy.breakDuration}min breaks`, color: "#ffb347" },
                        ].map(({ label, color }) => (
                          <span key={label} style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "12px", background: `${color}15`, border: `1px solid ${color}30`, color, fontFamily: "'DM Mono', monospace" }}>{label}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Subject priority */}
                  <div className="plan-card">
                    <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "14px" }}>SUBJECT PRIORITY</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {(strategy.subjects ?? []).map((sub, i) => {
                        const pc = PRIORITY_COLOR[sub.priority] ?? "#a594ff";
                        return (
                          <div key={sub.subject} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: "#0f0f1a", border: "1px solid #1e1e35", borderRadius: "12px" }}>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px", fontWeight: 700, color: "#44445a", minWidth: "20px" }}>#{i + 1}</span>
                            <span style={{ padding: "2px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", background: `${pc}18`, color: pc, border: `1px solid ${pc}33`, flexShrink: 0 }}>{sub.priority}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: "14px", color: "#f0f0ff" }}>{sub.subject}</div>
                              <div style={{ fontSize: "12px", color: "#8888aa", marginTop: "2px" }}>{sub.reason}</div>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px", fontWeight: 700, color: "#a594ff" }}>{sub.weeklyHours}h/wk</div>
                              <div style={{ fontSize: "11px", color: "#44445a" }}>{sub.recommendedMethod}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────── HABITS ─────────── */}
              {activeSection === "habits" && (
                <div className="stagger-3" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                  <div className="plan-card">
                    <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "14px" }}>HABIT SYSTEM</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {(masterPlan.habitSystem ?? []).map((habit, i) => (
                        <div key={habit.id} style={{ padding: "14px 16px", background: "#0f0f1a", border: "1px solid #1e1e35", borderRadius: "12px", animationDelay: `${i * 0.05}s` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                            <div style={{ fontWeight: 600, fontSize: "14px", color: "#f0f0ff", lineHeight: 1.4 }}>{habit.habit}</div>
                            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                              <span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "10px", background: "rgba(108,99,255,0.12)", border: "1px solid rgba(108,99,255,0.2)", color: "#a594ff", fontFamily: "'DM Mono', monospace" }}>{habit.category}</span>
                              <span style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "10px", background: habit.frequency === "daily" ? "rgba(0,212,170,0.1)" : "rgba(255,179,71,0.1)", border: `1px solid ${habit.frequency === "daily" ? "rgba(0,212,170,0.2)" : "rgba(255,179,71,0.2)"}`, color: habit.frequency === "daily" ? "#00d4aa" : "#ffb347", fontFamily: "'DM Mono', monospace" }}>{habit.frequency}</span>
                            </div>
                          </div>
                          <p style={{ color: "#8888aa", fontSize: "12px", margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>{habit.whyItMatters}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Distraction control */}
                  {distractionControl && (
                    <div className="plan-card" style={{ borderLeft: "2px solid #ff6b9d" }}>
                      <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "14px" }}>DISTRACTION CONTROL</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {(distractionControl.blockingRules ?? []).map((r, i) => (
                          <div key={i} style={{ display: "flex", gap: "8px", padding: "8px 12px", background: "rgba(255,107,157,0.04)", border: "1px solid rgba(255,107,157,0.12)", borderRadius: "10px" }}>
                            <span style={{ color: "#ff6b9d", flexShrink: 0 }}>◈</span>
                            <span style={{ color: "#c8c8ee", fontSize: "13px", lineHeight: 1.5 }}>{r}</span>
                          </div>
                        ))}
                      </div>
                      {distractionControl.emergencyProtocol && (
                        <div style={{ marginTop: "14px", padding: "12px 14px", background: "rgba(255,107,157,0.06)", border: "1px solid rgba(255,107,157,0.18)", borderRadius: "10px" }}>
                          <p style={{ color: "#ff6b9d", fontSize: "11px", fontFamily: "'DM Mono', monospace", marginBottom: "6px" }}>EMERGENCY PROTOCOL</p>
                          <p style={{ color: "#c8c8ee", fontSize: "13px", margin: 0, lineHeight: 1.5 }}>{distractionControl.emergencyProtocol}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ─────────── RESOURCES ─────────── */}
              {activeSection === "resources" && (
                <div className="stagger-3" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                  {/* Books */}
                  {(resources?.books ?? []).length > 0 && (
                    <div className="plan-card">
                      <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "14px" }}>BOOKS</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {(resources?.books ?? []).map((b, i) => (
                          <div key={i} style={{ display: "flex", gap: "12px", padding: "12px 14px", background: "#0f0f1a", border: "1px solid #1e1e35", borderRadius: "12px", alignItems: "flex-start" }}>
                            <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "rgba(108,99,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>📚</div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: "14px", color: "#f0f0ff", marginBottom: "2px" }}>
                                {b.title}{b.author && <span style={{ color: "#44445a", fontWeight: 400 }}> — {b.author}</span>}
                              </div>
                              <div style={{ fontSize: "12px", color: "#8888aa", lineHeight: 1.5 }}>{b.reason}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Techniques */}
                  {(resources?.techniques ?? []).length > 0 && (
                    <div className="plan-card">
                      <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "14px" }}>TECHNIQUES</p>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px" }}>
                        {(resources?.techniques ?? []).map((t, i) => (
                          <div key={i} style={{ padding: "14px 16px", background: "#0f0f1a", border: "1px solid #1e1e35", borderRadius: "12px" }}>
                            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "14px", color: "#a594ff", marginBottom: "6px" }}>{t.name}</div>
                            <div style={{ fontSize: "13px", color: "#8888aa", lineHeight: 1.5, marginBottom: "8px" }}>{t.description}</div>
                            <div style={{ fontSize: "12px", color: "#c8c8ee", lineHeight: 1.5, borderTop: "1px solid #1e1e35", paddingTop: "8px" }}>
                              <span style={{ color: "#00d4aa", fontWeight: 600 }}>How: </span>{t.howToUse}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tools */}
                  {(resources?.tools ?? []).length > 0 && (
                    <div className="plan-card">
                      <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "14px" }}>TOOLS</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {(resources?.tools ?? []).map((t, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#0f0f1a", border: "1px solid #1e1e35", borderRadius: "12px" }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: "13px", color: "#f0f0ff", marginBottom: "2px" }}>🛠 {t.name}</div>
                              <div style={{ fontSize: "12px", color: "#8888aa" }}>{t.purpose}</div>
                            </div>
                            <span style={{
                              padding: "3px 10px", borderRadius: "999px", fontSize: "11px", flexShrink: 0,
                              background: t.free ? "rgba(0,212,170,0.1)" : "rgba(255,179,71,0.1)",
                              color: t.free ? "#00d4aa" : "#ffb347",
                              border: `1px solid ${t.free ? "rgba(0,212,170,0.2)" : "rgba(255,179,71,0.2)"}`,
                              fontFamily: "'DM Mono', monospace",
                            }}>{t.free ? "Free" : "Paid"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─────────── WEEKLY REVIEW ─────────── */}
              {activeSection === "review" && (
                <div className="stagger-3" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px" }}>
                    {/* Checklist */}
                    <div className="plan-card">
                      <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "14px" }}>WEEKLY CHECKLIST</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {(weeklyReview?.checklistItems ?? []).map((item, i) => (
                          <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                            <div style={{ width: "16px", height: "16px", borderRadius: "4px", border: "2px solid #2a2a45", flexShrink: 0, marginTop: "2px" }} />
                            <span style={{ color: "#c8c8ee", fontSize: "13px", lineHeight: 1.5 }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reflection questions */}
                    <div className="plan-card">
                      <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "14px" }}>REFLECTION QUESTIONS</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {(weeklyReview?.reviewQuestions ?? []).map((q, i) => (
                          <div key={i} style={{ padding: "10px 13px", background: "#0f0f1a", border: "1px solid #1e1e35", borderRadius: "10px" }}>
                            <span style={{ color: "#a594ff", fontSize: "10px", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>Q{i + 1}  </span>
                            <span style={{ color: "#c8c8ee", fontSize: "13px", lineHeight: 1.5 }}>{q}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Progress metrics */}
                  {(weeklyReview?.progressMetrics ?? []).length > 0 && (
                    <div className="plan-card">
                      <p style={{ color: "#44445a", fontSize: "11px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "14px" }}>PROGRESS METRICS</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {(weeklyReview?.progressMetrics ?? []).map((m) => {
                          const pct = m.target > 0 ? Math.min(100, (m.current / m.target) * 100) : 0;
                          return (
                            <div key={m.metric} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "10px 14px", background: "#0f0f1a", border: "1px solid #1e1e35", borderRadius: "12px" }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: "13px", fontWeight: 600, color: "#f0f0ff", marginBottom: "6px" }}>{m.metric}</div>
                                <div style={{ height: "4px", background: "#1e1e35", borderRadius: "999px", overflow: "hidden" }}>
                                  <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #6c63ff, #a594ff)", borderRadius: "999px", transition: "width 0.6s ease" }} />
                                </div>
                              </div>
                              <div style={{ textAlign: "right", flexShrink: 0 }}>
                                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#a594ff", fontWeight: 700 }}>{m.current}/{m.target}</span>
                                <div style={{ fontSize: "10px", color: "#44445a" }}>{m.unit}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
