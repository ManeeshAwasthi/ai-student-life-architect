"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

interface Step {
  id: string;
  label: string;
  sublabel: string;
  status: "pending" | "active" | "complete" | "error";
}

const STEPS: Step[] = [
  { id: "diagnosis", label: "Diagnosing your situation", sublabel: "Identifying root causes and patterns", status: "pending" },
  { id: "strategy", label: "Building your strategy", sublabel: "Choosing the right study methods for you", status: "pending" },
  { id: "schedule", label: "Designing your schedule", sublabel: "Creating your daily and weekly timetable", status: "pending" },
  { id: "systems", label: "Building habit systems", sublabel: "Designing distraction controls and routines", status: "pending" },
  { id: "resources", label: "Curating resources", sublabel: "Selecting books, tools and techniques", status: "pending" },
  { id: "review", label: "Setting up weekly reviews", sublabel: "Building your progress tracking system", status: "pending" },
];

const MSG_MAP: Record<string, string> = {
  diagnosis: "Analysing your study patterns and psychology…",
  strategy: "Designing your personalised study strategy…",
  schedule: "Building your daily and weekly schedule…",
  systems: "Creating your habit and distraction systems…",
  resources: "Curating books, tools and techniques…",
  review: "Setting up your weekly review system…",
  complete: "Your system is ready!",
};

export default function GeneratingPage() {
  const router = useRouter();
  const store = useAppStore();
  const studentProfile = store.studentProfile;
  const setMasterPlan = store.setMasterPlan;
  const setIsOnboarded = store.setIsOnboarded;

  const [steps, setSteps] = useState<Step[]>(STEPS);
  const [currentMessage, setCurrentMessage] = useState("Preparing your personalized system…");
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dots, setDots] = useState("");
  const hasFetched = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!studentProfile) {
      router.push("/onboarding");
    }
  }, [studentProfile, router]);

  const updateStep = (id: string, status: Step["status"]) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!studentProfile || hasFetched.current) return;
    hasFetched.current = true;

    const generate = async () => {
      try {
        const response = await fetch("/api/generate-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: studentProfile }),
        });

        if (!response.ok || !response.body) throw new Error("Failed to connect");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;
            try {
              const data = JSON.parse(raw);
              if (data.status === "active") {
                updateStep(data.step, "active");
                setCurrentMessage(MSG_MAP[data.step] ?? "Working…");
              } else if (data.status === "complete" && data.step !== "complete") {
                updateStep(data.step, "complete");
              } else if (data.step === "complete" && data.plan) {
                setSteps((prev) => prev.map((s) => ({ ...s, status: "complete" })));
                setCurrentMessage(MSG_MAP.complete);
                setMasterPlan(data.plan);
                setIsOnboarded(true);
                setTimeout(() => router.push("/dashboard"), 1500);
              } else if (data.status === "error") {
                throw new Error(data.message ?? "Generation failed");
              }
            } catch { /* skip malformed */ }
          }
        }
      } catch (err) {
        setHasError(true);
        setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
        setSteps((prev) => prev.map((s) => s.status === "active" ? { ...s, status: "error" } : s));
      }
    };

    generate();
  }, [studentProfile, router, setMasterPlan, setIsOnboarded]);

  const completedCount = steps.filter((s) => s.status === "complete").length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a", fontFamily: "'Inter', sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem",
    }}>
      <div style={{
        fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 900,
        background: "linear-gradient(135deg,#a78bfa,#ec4899)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "3rem",
      }}>PeakMind</div>

      <div style={{ width: "100%", maxWidth: "560px", background: "#111", border: "1px solid #1e1e1e", borderRadius: "20px", padding: "2.5rem" }}>

        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          {!hasError ? (
            <>
              <div style={{
                width: "56px", height: "56px", borderRadius: "50%",
                border: "3px solid #1e1e1e", borderTop: "3px solid #7c3aed", borderRight: "3px solid #a78bfa",
                margin: "0 auto 1.5rem", animation: "spin 1s linear infinite",
              }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 700, color: "#fff", margin: "0 0 0.5rem" }}>
                Building Your System{dots}
              </h1>
              <p style={{ color: "#666", fontSize: "0.875rem", margin: 0 }}>{currentMessage}</p>
            </>
          ) : (
            <>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚠️</div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 700, color: "#f87171", margin: "0 0 0.5rem" }}>Generation Failed</h1>
              <p style={{ color: "#888", fontSize: "0.875rem", margin: 0 }}>{errorMessage}</p>
            </>
          )}
        </div>

        {!hasError && (
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ color: "#555", fontSize: "0.75rem" }}>Progress</span>
              <span style={{ color: "#a78bfa", fontSize: "0.75rem", fontWeight: 600 }}>{progressPercent}%</span>
            </div>
            <div style={{ height: "4px", background: "#1e1e1e", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progressPercent}%`, background: "linear-gradient(90deg,#7c3aed,#a78bfa)", borderRadius: "999px", transition: "width 0.6s ease" }} />
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {steps.map((step) => {
            const isActive = step.status === "active";
            const isComplete = step.status === "complete";
            const isError = step.status === "error";
            return (
              <div key={step.id} style={{
                display: "flex", alignItems: "center", gap: "1rem", padding: "0.85rem 1rem",
                borderRadius: "12px",
                background: isActive ? "rgba(124,58,237,0.08)" : "transparent",
                border: `1px solid ${isActive ? "#7c3aed33" : "transparent"}`,
                transition: "all 0.3s ease",
              }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.8rem", fontWeight: 700,
                  background: isComplete ? "rgba(74,222,128,0.15)" : isError ? "rgba(248,113,113,0.15)" : isActive ? "rgba(124,58,237,0.2)" : "#1a1a1a",
                  border: `1px solid ${isComplete ? "#4ade8044" : isError ? "#f8717144" : isActive ? "#7c3aed66" : "#2a2a2a"}`,
                  color: isComplete ? "#4ade80" : isError ? "#f87171" : isActive ? "#a78bfa" : "#444",
                }}>
                  {isComplete ? "✓" : isError ? "✕" : isActive ? "●" : "○"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.875rem", fontWeight: isActive ? 600 : 500, color: isComplete ? "#fff" : isError ? "#f87171" : isActive ? "#fff" : "#555", marginBottom: "0.1rem" }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: isActive ? "#888" : "#444" }}>{step.sublabel}</div>
                </div>
                {isComplete && <span style={{ fontSize: "0.7rem", color: "#4ade80", fontWeight: 600 }}>Done</span>}
                {isActive && <span style={{ fontSize: "0.7rem", color: "#a78bfa", fontWeight: 600 }}>Working…</span>}
              </div>
            );
          })}
        </div>

        {hasError && (
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <button type="button" onClick={() => router.push("/onboarding")} style={{
              padding: "0.75rem 2rem", background: "#7c3aed", color: "#fff",
              border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem", marginRight: "0.75rem",
            }}>Try Again</button>
            <button type="button" onClick={() => { setHasError(false); setErrorMessage(""); setSteps(STEPS); hasFetched.current = false; }} style={{
              padding: "0.75rem 2rem", background: "transparent", color: "#888",
              border: "1px solid #2a2a2a", borderRadius: "10px", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem",
            }}>Retry</button>
          </div>
        )}

        {!hasError && (
          <p style={{ textAlign: "center", color: "#333", fontSize: "0.72rem", marginTop: "2rem", marginBottom: 0 }}>
            Making 6 separate analyses to build your complete system. Please keep this tab open.
          </p>
        )}
      </div>
    </div>
  );
}
