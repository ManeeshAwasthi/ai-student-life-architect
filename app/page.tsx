"use client";

import Link from "next/link";
import {
  Brain, Calendar, Flame, MessageSquare,
  TrendingUp, ArrowRight, Target, Clock,
  Zap, CheckCircle2, BookOpen
} from "lucide-react";
import { useEffect, useState } from "react";

function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const step = Math.ceil(end / 60);
    const timer = setInterval(() => {
      setCount((c) => {
        if (c + step >= end) { clearInterval(timer); return end; }
        return c + step;
      });
    }, 20);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{count}{suffix}</span>;
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const S = {
    page: {
      minHeight: "100vh",
      backgroundColor: "#0a0a0a",
      color: "#ffffff",
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: "hidden"
    } as React.CSSProperties,
    section: {
      position: "relative" as const,
      zIndex: 10,
      padding: "80px 48px",
      maxWidth: "1280px",
      margin: "0 auto"
    },
    label: {
      color: "#7c3aed",
      fontSize: "12px",
      fontWeight: 600,
      textTransform: "uppercase" as const,
      letterSpacing: "0.12em",
      marginBottom: "16px"
    },
    h1: {
      fontFamily: "Playfair Display, Georgia, serif",
      fontSize: "clamp(48px, 7vw, 88px)",
      fontWeight: 900,
      lineHeight: 1.05,
      letterSpacing: "-0.03em",
      marginBottom: "24px"
    } as React.CSSProperties,
    h2: {
      fontFamily: "Playfair Display, Georgia, serif",
      fontSize: "clamp(32px, 4vw, 52px)",
      fontWeight: 700,
      lineHeight: 1.15,
      letterSpacing: "-0.02em"
    } as React.CSSProperties,
    body: {
      fontSize: "16px",
      color: "#a0a0a0",
      lineHeight: 1.7
    },
    card: {
      padding: "28px",
      borderRadius: "16px",
      border: "1px solid #222",
      background: "#111"
    } as React.CSSProperties,
    gradientText: {
      background: "linear-gradient(135deg, #a78bfa, #ec4899)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text"
    } as React.CSSProperties,
    divider: {
      height: "1px",
      background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)",
      margin: "0 0 80px"
    },
  };

  return (
    <main style={S.page}>

      {/* Background */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% -10%, rgba(124,58,237,0.15), transparent)", pointerEvents: "none" }} />

      {/* ── NAVBAR ── */}
      <nav style={{ position: "relative", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 48px", maxWidth: "1280px", margin: "0 auto" }}>
        <span style={{ fontFamily: "Playfair Display, Georgia, serif", fontWeight: 700, fontSize: "22px", color: "#ffffff", letterSpacing: "-0.02em" }}>
          PeakMind
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <a href="#how" style={{ color: "#a0a0a0", fontSize: "14px", textDecoration: "none", fontWeight: 500 }}>How it works</a>
          <a href="#features" style={{ color: "#a0a0a0", fontSize: "14px", textDecoration: "none", fontWeight: 500 }}>Features</a>
          <a href="#plan" style={{ color: "#a0a0a0", fontSize: "14px", textDecoration: "none", fontWeight: 500 }}>Get your plan</a>
        </div>
        <Link href="/onboarding" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 22px", borderRadius: "8px", background: "#7c3aed", color: "#ffffff", fontWeight: 600, fontSize: "14px", textDecoration: "none" }}>
          Get started free
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section style={{ ...S.section, textAlign: "center", paddingTop: "80px", paddingBottom: "100px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "999px", border: "1px solid #333", background: "#111", color: "#a0a0a0", fontSize: "12px", fontWeight: 500, marginBottom: "40px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#7c3aed", display: "inline-block" }} />
          Personalized Coaching System
        </div>

        <h1 style={S.h1}>
          Your personal coach.<br />
          <span style={S.gradientText}>Built for students</span><br />
          <span style={S.gradientText}>who mean it.</span>
        </h1>

        <p style={{ ...S.body, maxWidth: "520px", margin: "0 auto 48px", fontSize: "18px" }}>
          Answer questions about your life. Get a brutally honest,
          science-backed plan that actually fits your schedule.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "80px" }}>
          <Link href="/onboarding" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "16px 36px", borderRadius: "8px", background: "#7c3aed", color: "#ffffff", fontWeight: 700, fontSize: "16px", textDecoration: "none" }}>
            Build my plan <ArrowRight size={18} />
          </Link>
          <a href="#how" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "16px 36px", borderRadius: "8px", border: "1px solid #333", color: "#ffffff", fontWeight: 600, fontSize: "16px", textDecoration: "none" }}>
            See how it works
          </a>
        </div>

        {/* Stats */}
        {mounted && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0", maxWidth: "700px", margin: "0 auto", borderRadius: "16px", border: "1px solid #222", overflow: "hidden" }}>
            {[
              { value: 11, suffix: "", label: "PLAN SECTIONS" },
              { value: 60, suffix: "s", label: "TIME TO GENERATE" },
              { value: 100, suffix: "%", label: "PERSONALIZED" },
              { value: 0, suffix: "", label: "COST — ALWAYS FREE" },
            ].map(({ value, suffix, label }, i) => (
              <div key={label} style={{ padding: "28px 16px", textAlign: "center", borderRight: i < 3 ? "1px solid #222" : "none", background: "#111" }}>
                <div style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "36px", fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>
                  {value === 0 ? "Free" : <Counter end={value} suffix={suffix} />}
                </div>
                <div style={{ color: "#555", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em" }}>{label}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={S.section}>
        <div style={S.divider} />
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <p style={S.label}>How it works</p>
          <h2 style={S.h2}>Three steps to your personal system.</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          {[
            { n: "01", title: "Answer the assessment", desc: "25 targeted questions about your habits, subjects, distractions, energy levels, and goals. Takes 5 minutes." },
            { n: "02", title: "Your system gets built", desc: "Six reasoning steps analyze your profile and produce your complete personal architecture — diagnosis, schedule, habits, and more." },
            { n: "03", title: "Live the system daily", desc: "Open the dashboard each morning, check habits, log sessions, and talk to your personal coach anytime." },
          ].map(({ n, title, desc }) => (
            <div key={n} style={{ ...S.card, position: "relative" as const }}>
              <div style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "48px", fontWeight: 900, color: "#1a1a1a", marginBottom: "16px", lineHeight: 1 }}>{n}</div>
              <h3 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "20px", fontWeight: 700, marginBottom: "12px", color: "#ffffff" }}>{title}</h3>
              <p style={{ ...S.body, fontSize: "14px", margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={S.section}>
        <div style={S.divider} />
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <p style={S.label}>What you get</p>
          <h2 style={S.h2}>A complete system.<br />Not generic advice.</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          {[
            { icon: Brain, title: "Psychological Diagnosis", desc: "Identifies your exact productivity patterns and builds around your psychology, not against it." },
            { icon: Calendar, title: "Optimized Daily Routine", desc: "Time-blocked schedule designed around your energy peaks, sleep patterns, and available hours." },
            { icon: Flame, title: "Habit Tracking System", desc: "High-impact habits selected for your specific problems. Track streaks and build real momentum." },
            { icon: MessageSquare, title: "Personal Coach", desc: "Ask anything, anytime. The coach knows your full plan and adapts to how you need guidance." },
            { icon: TrendingUp, title: "Progress Tracking", desc: "Weekly reviews with performance metrics and personalized feedback on your progress." },
            { icon: BookOpen, title: "Curated Resources", desc: "Books, podcasts, and techniques hand-picked for your specific field, goals, and challenges." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ ...S.card, transition: "border-color 0.2s, background 0.2s" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(124,58,237,0.4)";
                (e.currentTarget as HTMLDivElement).style.background = "#1a1a1a";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#222";
                (e.currentTarget as HTMLDivElement).style.background = "#111";
              }}
            >
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <Icon size={20} color="#a78bfa" />
              </div>
              <h3 style={{ fontFamily: "Playfair Display, Georgia, serif", fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "#ffffff" }}>{title}</h3>
              <p style={{ ...S.body, fontSize: "14px", margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section style={S.section}>
        <div style={S.divider} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }}>
          <div>
            <p style={S.label}>Your daily command center</p>
            <h2 style={{ ...S.h2, marginBottom: "24px" }}>Everything you need,<br />first thing in the morning.</h2>
            <p style={{ ...S.body, marginBottom: "32px" }}>
              Wake up and open your dashboard. Your schedule is set, your habits are waiting,
              your coach is ready. No thinking required — just execute.
            </p>
            <Link href="/onboarding" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 28px", borderRadius: "8px", background: "#7c3aed", color: "#ffffff", fontWeight: 600, fontSize: "15px", textDecoration: "none" }}>
              Get my dashboard <ArrowRight size={16} />
            </Link>
          </div>

          {/* Preview Card */}
          <div style={{ ...S.card, padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <p style={{ color: "#555", fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.1em", margin: "0 0 4px" }}>Monday — Today</p>
                <p style={{ color: "#ffffff", fontSize: "14px", fontWeight: 600, margin: 0 }}>Good morning, Maneesh.</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "999px", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}>
                <span>🔥</span>
                <span style={{ color: "#a78bfa", fontSize: "13px", fontWeight: 600 }}>12 days</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
              {[
                { time: "07:00", activity: "Deep Work — Mathematics", done: true },
                { time: "09:00", activity: "Break + Walk", done: true },
                { time: "09:30", activity: "Physics Problem Sets", done: false },
                { time: "11:30", activity: "Lunch", done: false },
              ].map(({ time, activity, done }) => (
                <div key={time} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", borderRadius: "8px", background: done ? "rgba(124,58,237,0.1)" : "#1a1a1a", border: done ? "1px solid rgba(124,58,237,0.25)" : "1px solid #222" }}>
                  <span style={{ color: "#555", fontSize: "11px", fontFamily: "monospace", width: "40px" }}>{time}</span>
                  <span style={{ fontSize: "13px", flex: 1, color: done ? "#a78bfa" : "#ffffff" }}>{activity}</span>
                  {done && <CheckCircle2 size={15} color="#7c3aed" />}
                </div>
              ))}
            </div>
            <div style={{ height: "1px", background: "#1a1a1a", marginBottom: "16px" }} />
            <p style={{ color: "#555", fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "10px" }}>Today&apos;s habits</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                { label: "No phone 30 min", done: true },
                { label: "3 deep sessions", done: true },
                { label: "Review notes", done: false },
                { label: "Sleep by 23:00", done: false },
              ].map(({ label, done }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "6px", background: done ? "rgba(124,58,237,0.1)" : "#1a1a1a", border: done ? "1px solid rgba(124,58,237,0.2)" : "1px solid #222", fontSize: "12px", color: done ? "#a78bfa" : "#a0a0a0" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: done ? "#7c3aed" : "transparent", border: done ? "1px solid #7c3aed" : "1px solid #333", flexShrink: 0 }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT IT GENERATES ── */}
      <section id="plan" style={S.section}>
        <div style={S.divider} />
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <p style={S.label}>Your output</p>
          <h2 style={S.h2}>Everything that gets built for you.</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {[
            { icon: Brain, label: "Psychological diagnosis & root cause analysis" },
            { icon: Target, label: "Personalized study method recommendations" },
            { icon: Clock, label: "Optimized daily routine time-blocks" },
            { icon: Calendar, label: "Full 7-day study schedule by subject" },
            { icon: Flame, label: "Custom habit system with tracking" },
            { icon: Zap, label: "Distraction control protocol" },
            { icon: TrendingUp, label: "Weekly progress review system" },
            { icon: BookOpen, label: "Curated books, tools & techniques" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "18px", borderRadius: "12px", background: "#111", border: "1px solid #222" }}>
              <Icon size={16} color="#7c3aed" style={{ flexShrink: 0, marginTop: "2px" }} />
              <p style={{ color: "#a0a0a0", fontSize: "13px", margin: 0, lineHeight: 1.5 }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ ...S.section, textAlign: "center", paddingBottom: "120px" }}>
        <div style={S.divider} />
        <div style={{ maxWidth: "700px", margin: "0 auto", padding: "80px 48px", borderRadius: "20px", border: "1px solid #222", background: "#111", position: "relative" as const, overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(124,58,237,0.12), transparent)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ ...S.h2, marginBottom: "16px" }}>Ready to stop winging it?</h2>
            <p style={{ ...S.body, maxWidth: "420px", margin: "0 auto 40px", fontSize: "17px" }}>
              Answer the assessment. Get your complete personal system in under 2 minutes.
            </p>
            <Link href="/onboarding" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "16px 40px", borderRadius: "8px", background: "#7c3aed", color: "#ffffff", fontWeight: 700, fontSize: "16px", textDecoration: "none" }}>
              Build my plan — free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ position: "relative" as const, zIndex: 10, borderTop: "1px solid #1a1a1a", padding: "32px 48px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "#a0a0a0", fontSize: "14px", margin: 0, fontFamily: "Playfair Display, Georgia, serif", textAlign: "center" }}>
            <span style={{ color: "#ffffff", fontWeight: 700 }}>PeakMind</span>
            {" "}— Academic Performance Coach · Built for students who refuse to settle · 2026
          </p>
        </div>
      </footer>

    </main>
  );
}