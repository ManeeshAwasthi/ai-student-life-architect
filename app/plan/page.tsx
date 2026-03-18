"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Search, Lightbulb, Zap, BookOpen, ClipboardList, GripVertical } from "lucide-react";

type SectionId = "diagnosis" | "strategy" | "habits" | "resources" | "review";

const SECTIONS: { id: SectionId; label: string; icon: React.ElementType }[] = [
  { id: "diagnosis", label: "Diagnosis",     icon: Search },
  { id: "strategy",  label: "Strategy",      icon: Zap },
  { id: "habits",    label: "Habits",        icon: Lightbulb },
  { id: "resources", label: "Resources",     icon: BookOpen },
  { id: "review",    label: "Weekly Review", icon: ClipboardList },
];

const PRIORITY_COLOR: Record<string, string> = {
  high: "#FF6B35", medium: "#F59E0B", low: "#22C55E",
};

// Pill component
function Pill({ children, color = "var(--brand-primary)" }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px",
      borderRadius: "var(--radius-full)",
      background: `${color}18`,
      border: `1px solid ${color}30`,
      color,
      fontSize: 11, fontWeight: 500, letterSpacing: "0.04em",
      fontFamily: "var(--font-body)",
    }}>
      {children}
    </span>
  );
}

export default function PlanPage() {
  const router = useRouter();
  const store  = useAppStore();
  const masterPlan     = store.masterPlan;
  const studentProfile = store.studentProfile;
  const isOnboarded    = store.isOnboarded;

  const [activeSection, setActiveSection] = useState<SectionId>("diagnosis");
  const [isMobile, setIsMobile]           = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
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
      <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, border: "3px solid var(--bg-overlay)", borderTop: "3px solid var(--brand-primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  const { diagnosis, strategy, distractionControl, resources, weeklyReview, meta } = masterPlan;

  return (
    <>
      <style>{`
        .plan-sidebar-btn {
          display: flex; align-items: center; gap: 10px;
          height: 44px; padding: 0 var(--space-3);
          border-radius: var(--radius-md);
          border: 1px solid transparent;
          cursor: pointer; transition: all 0.18s ease;
          font-family: var(--font-body); font-size: 0.875rem; font-weight: 500;
          width: 100%; text-align: left; background: transparent;
          color: var(--text-secondary);
        }
        .plan-sidebar-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
        .plan-sidebar-btn.active { background: var(--brand-glow); color: var(--brand-primary); border-color: rgba(124,92,252,0.15); }
        .plan-sidebar-btn.active svg { color: var(--brand-primary); }
        .task-card { cursor: grab; }
        .task-card:active { cursor: grabbing; }
      `}</style>

      {/* Ambient bg */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "10%", right: "15%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,92,252,0.05) 0%, transparent 70%)", animation: "float 16s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "20%", left: "5%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,53,0.04) 0%, transparent 70%)", animation: "float 20s ease-in-out infinite reverse" }} />
      </div>

      <div style={{ minHeight: "100vh", background: "var(--bg-base)", paddingBottom: "var(--space-16)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "var(--space-10) var(--space-8) 0" }}>

          {/* ── Header ── */}
          <div className="stagger-1" style={{ marginBottom: "var(--space-8)" }}>
            <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: "var(--space-2)" }}>Master Plan</div>
            <h1 className="text-display" style={{ color: "var(--text-primary)", margin: "0 0 var(--space-2)" }}>
              {studentProfile.name.split(" ")[0]}&apos;s Blueprint
            </h1>
            <p className="text-label" style={{ color: "var(--text-tertiary)" }}>
              Generated {new Date(meta.generatedAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })} · v{meta.planVersion}
            </p>
          </div>

          {/* ── Mobile tabs ── */}
          {isMobile && (
            <div className="stagger-2" style={{ display: "flex", gap: "var(--space-1)", overflowX: "auto", marginBottom: "var(--space-5)", paddingBottom: "var(--space-1)" }}>
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                return (
                  <button key={s.id} type="button"
                    className={`plan-sidebar-btn${activeSection === s.id ? " active" : ""}`}
                    style={{ height: 36, flexShrink: 0, width: "auto", padding: "0 var(--space-3)" }}
                    onClick={() => setActiveSection(s.id)}>
                    <Icon size={14} />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ display: "flex", gap: "var(--space-6)", alignItems: "flex-start" }}>

            {/* ── Desktop sidebar ── */}
            {!isMobile && (
              <div className="stagger-2" style={{
                width: 200, flexShrink: 0,
                position: "sticky", top: "var(--space-6)",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-xl)",
                padding: "var(--space-3)",
                display: "flex", flexDirection: "column", gap: "var(--space-1)",
              }}>
                {SECTIONS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button key={s.id} type="button"
                      className={`plan-sidebar-btn${activeSection === s.id ? " active" : ""}`}
                      onClick={() => setActiveSection(s.id)}>
                      <Icon size={16} />
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Main content ── */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* ── DIAGNOSIS ── */}
              {activeSection === "diagnosis" && (
                <div className="stagger-3" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>

                  <div className="card-elevated" style={{
                    background: `radial-gradient(ellipse at 0% 0%, var(--brand-glow) 0%, var(--bg-elevated) 60%)`,
                  }}>
                    <div className="text-label" style={{ color: "var(--brand-primary)", marginBottom: "var(--space-3)" }}>Key Insight</div>
                    <p style={{ color: "var(--text-primary)", fontSize: "1.0625rem", lineHeight: 1.75, margin: 0, fontStyle: "italic", fontFamily: "var(--font-body)" }}>
                      &ldquo;{diagnosis.keyInsight}&rdquo;
                    </p>
                  </div>

                  <div className="card">
                    <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: "var(--space-3)" }}>Psychological Profile</div>
                    <p className="text-body" style={{ color: "var(--text-primary)", margin: 0 }}>{diagnosis.psychologicalProfile}</p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "var(--space-4)" }}>
                    <div className="card" style={{ borderLeft: "3px solid #FF6B35" }}>
                      <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: "var(--space-3)" }}>Primary Problems</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                        {(diagnosis.primaryProblems ?? []).map((p, i) => (
                          <div key={i} style={{ display: "flex", gap: "var(--space-2)", alignItems: "flex-start" }}>
                            <span style={{ color: "#FF6B35", flexShrink: 0, fontSize: 12, marginTop: 2 }}>✕</span>
                            <span className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="card" style={{ borderLeft: "3px solid #22C55E" }}>
                      <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: "var(--space-3)" }}>Strengths</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                        {(diagnosis.strengths ?? []).map((s, i) => (
                          <div key={i} style={{ display: "flex", gap: "var(--space-2)", alignItems: "flex-start" }}>
                            <span style={{ color: "#22C55E", flexShrink: 0, fontSize: 12, marginTop: 2 }}>✓</span>
                            <span className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ borderLeft: "3px solid #F59E0B" }}>
                    <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: "var(--space-3)" }}>Root Causes</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                      {(diagnosis.rootCauses ?? []).map((c, i) => (
                        <div key={i} style={{ display: "flex", gap: "var(--space-2)", alignItems: "flex-start" }}>
                          <span style={{ color: "#F59E0B", flexShrink: 0, fontSize: 13 }}>→</span>
                          <span className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── STRATEGY ── */}
              {activeSection === "strategy" && (
                <div className="stagger-3" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "var(--space-4)" }}>
                    <div className="card-elevated">
                      <div className="text-label" style={{ color: "var(--brand-primary)", marginBottom: "var(--space-3)" }}>Primary Method</div>
                      <div className="text-h2" style={{ color: "var(--text-primary)", margin: "0 0 var(--space-3)" }}>{strategy.primaryStudyMethod}</div>
                      <p className="text-sm" style={{ color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>{strategy.primaryMethodDescription}</p>
                    </div>
                    <div className="card">
                      <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: "var(--space-3)" }}>Secondary Method</div>
                      <div className="text-h2" style={{ color: "var(--text-primary)", margin: "0 0 var(--space-4)" }}>{strategy.secondaryMethod}</div>
                      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                        <Pill color="var(--brand-primary)">{strategy.weeklyStudyHours}h/week</Pill>
                        <Pill color="#22C55E">{strategy.sessionLength}min sessions</Pill>
                        <Pill color="#FF6B35">{strategy.breakDuration}min breaks</Pill>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: "var(--space-4)" }}>Subject Priority</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                      {(strategy.subjects ?? []).map((sub, i) => {
                        const pc = PRIORITY_COLOR[sub.priority] ?? "var(--brand-primary)";
                        return (
                          <div key={sub.subject} style={{
                            display: "flex", alignItems: "center", gap: "var(--space-3)",
                            padding: "var(--space-3) var(--space-4)",
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "var(--radius-md)",
                          }}>
                            <span className="text-label" style={{ color: "var(--text-tertiary)", minWidth: 20 }}>#{i + 1}</span>
                            <Pill color={pc}>{sub.priority}</Pill>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="text-sm" style={{ fontWeight: 600, color: "var(--text-primary)" }}>{sub.subject}</div>
                              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2, fontFamily: "var(--font-body)" }}>{sub.reason}</div>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                              <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 700, color: "var(--brand-primary)" }}>{sub.weeklyHours}h/wk</div>
                              <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "var(--font-body)" }}>{sub.recommendedMethod}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── HABITS (Kanban-style) ── */}
              {activeSection === "habits" && (
                <div className="stagger-3" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>

                  {/* Kanban header */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: "var(--space-4)" }}>
                    {[
                      { title: "Daily Habits", habits: masterPlan.habitSystem.filter(h => h.frequency === "daily"), color: "var(--brand-primary)" },
                      { title: "Weekly Habits", habits: masterPlan.habitSystem.filter(h => h.frequency === "weekly"), color: "#F59E0B" },
                      { title: "All Habits", habits: masterPlan.habitSystem, color: "#22C55E" },
                    ].slice(0, isMobile ? 1 : 3).map((col) => (
                      <div key={col.title}>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
                          <div className="text-h2" style={{ color: "var(--text-primary)" }}>{col.title}</div>
                          <span style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 20, height: 20, borderRadius: "var(--radius-full)",
                            background: `${col.color}18`, border: `1px solid ${col.color}30`,
                            color: col.color, fontSize: 11, fontWeight: 700,
                            fontFamily: "var(--font-body)",
                          }}>{col.habits.length}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                          {col.habits.map((habit) => (
                            <div key={habit.id} className="card task-card">
                              {/* Priority dot */}
                              <div style={{
                                width: 8, height: 8, borderRadius: "50%",
                                background: habit.frequency === "daily" ? "var(--brand-primary)" : "#F59E0B",
                                marginBottom: "var(--space-2)",
                              }} />
                              <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
                                <GripVertical size={14} color="var(--text-disabled)" style={{ flexShrink: 0, marginTop: 2 }} />
                                <div className="text-sm" style={{ fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.4 }}>{habit.habit}</div>
                              </div>
                              <div className="text-sm" style={{ color: "var(--text-secondary)", marginTop: "var(--space-1)" }}>
                                {habit.whyItMatters}
                              </div>
                              <div style={{ marginTop: "var(--space-3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div className="text-label" style={{ color: "var(--text-tertiary)" }}>{habit.category}</div>
                                <Pill color={habit.frequency === "daily" ? "var(--brand-primary)" : "#F59E0B"}>{habit.frequency}</Pill>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Distraction control */}
                  {distractionControl && (
                    <div className="card" style={{ borderLeft: "3px solid #FF6B35" }}>
                      <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: "var(--space-4)" }}>Distraction Control</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                        {(distractionControl.blockingRules ?? []).map((r, i) => (
                          <div key={i} style={{ display: "flex", gap: "var(--space-2)", padding: "var(--space-2) var(--space-3)", background: "rgba(255,107,53,0.04)", border: "1px solid rgba(255,107,53,0.12)", borderRadius: "var(--radius-md)" }}>
                            <span style={{ color: "#FF6B35", flexShrink: 0 }}>◈</span>
                            <span className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>{r}</span>
                          </div>
                        ))}
                      </div>
                      {distractionControl.emergencyProtocol && (
                        <div style={{ marginTop: "var(--space-4)", padding: "var(--space-3) var(--space-4)", background: "rgba(255,107,53,0.06)", border: "1px solid rgba(255,107,53,0.18)", borderRadius: "var(--radius-md)" }}>
                          <div className="text-label" style={{ color: "#FF6B35", marginBottom: "var(--space-2)" }}>Emergency Protocol</div>
                          <p className="text-sm" style={{ color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>{distractionControl.emergencyProtocol}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── RESOURCES ── */}
              {activeSection === "resources" && (
                <div className="stagger-3" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                  {(resources?.books ?? []).length > 0 && (
                    <div className="card">
                      <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: "var(--space-4)" }}>Books</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                        {(resources?.books ?? []).map((b, i) => (
                          <div key={i} style={{ display: "flex", gap: "var(--space-3)", padding: "var(--space-3) var(--space-4)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", alignItems: "flex-start" }}>
                            <div style={{ width: 34, height: 34, borderRadius: "var(--radius-md)", background: "var(--brand-glow)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>📚</div>
                            <div>
                              <div className="text-sm" style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>
                                {b.title}{b.author && <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}> — {b.author}</span>}
                              </div>
                              <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, fontFamily: "var(--font-body)" }}>{b.reason}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(resources?.techniques ?? []).length > 0 && (
                    <div className="card">
                      <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: "var(--space-4)" }}>Techniques</div>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "var(--space-3)" }}>
                        {(resources?.techniques ?? []).map((t, i) => (
                          <div key={i} style={{ padding: "var(--space-4)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
                            <div className="text-h2" style={{ color: "var(--brand-primary)", marginBottom: "var(--space-2)" }}>{t.name}</div>
                            <div className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "var(--space-3)" }}>{t.description}</div>
                            <div style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.5, borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-3)", fontFamily: "var(--font-body)" }}>
                              <span style={{ color: "#22C55E", fontWeight: 600 }}>How: </span>{t.howToUse}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(resources?.tools ?? []).length > 0 && (
                    <div className="card">
                      <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: "var(--space-4)" }}>Tools</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                        {(resources?.tools ?? []).map((t, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--space-3) var(--space-4)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
                            <div>
                              <div className="text-sm" style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>🛠 {t.name}</div>
                              <div style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>{t.purpose}</div>
                            </div>
                            <Pill color={t.free ? "#22C55E" : "#F59E0B"}>{t.free ? "Free" : "Paid"}</Pill>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── WEEKLY REVIEW ── */}
              {activeSection === "review" && (
                <div className="stagger-3" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "var(--space-4)" }}>
                    <div className="card">
                      <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: "var(--space-4)" }}>Weekly Checklist</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                        {(weeklyReview?.checklistItems ?? []).map((item, i) => (
                          <div key={i} style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
                            <div style={{ width: 16, height: 16, borderRadius: 4, border: "2px solid var(--text-disabled)", flexShrink: 0, marginTop: 2 }} />
                            <span className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="card">
                      <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: "var(--space-4)" }}>Reflection Questions</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                        {(weeklyReview?.reviewQuestions ?? []).map((q, i) => (
                          <div key={i} style={{ padding: "var(--space-3) var(--space-4)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
                            <span className="text-label" style={{ color: "var(--brand-primary)" }}>Q{i + 1}  </span>
                            <span className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>{q}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {(weeklyReview?.progressMetrics ?? []).length > 0 && (
                    <div className="card">
                      <div className="text-label" style={{ color: "var(--text-tertiary)", marginBottom: "var(--space-4)" }}>Progress Metrics</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                        {(weeklyReview?.progressMetrics ?? []).map((m) => {
                          const pct = m.target > 0 ? Math.min(100, (m.current / m.target) * 100) : 0;
                          return (
                            <div key={m.metric} style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-3) var(--space-4)", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="text-sm" style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-2)" }}>{m.metric}</div>
                                <div style={{ height: 4, background: "var(--border-subtle)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                                  <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, var(--brand-primary), var(--accent-focus))", borderRadius: "inherit", transition: "width 0.6s ease" }} />
                                </div>
                              </div>
                              <div style={{ textAlign: "right", flexShrink: 0 }}>
                                <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--brand-primary)", fontWeight: 700 }}>{m.current}/{m.target}</span>
                                <div style={{ fontSize: 10, color: "var(--text-tertiary)", fontFamily: "var(--font-body)" }}>{m.unit}</div>
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
