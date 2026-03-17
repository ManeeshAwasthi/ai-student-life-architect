import { NextRequest, NextResponse } from "next/server";

// Allow up to 5 minutes on Vercel Pro / self-hosted — prevents ERR_CONNECTION_RESET
export const maxDuration = 300;
import { getGeminiModel } from "@/lib/generative-ai";
import type { StudentProfile, MasterPlan, Diagnosis, Strategy } from "@/lib/types";
import {
  JSON_SYSTEM_PROMPT,
  buildDiagnosisPrompt,
  buildStrategyPrompt,
  buildDailyRoutinePrompt,
  buildWeeklySchedulePrompt,
  buildHabitSystemPrompt,
  buildDistractionControlPrompt,
  buildResourcesPrompt,
  buildWeeklyReviewPrompt,
} from "@/lib/prompts";

// Aggressive JSON extraction: strip fences, then cut to first { ... last }
function safeParseJSON(text: string): unknown {
  try {
    let cleaned = text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    // Remove any preamble text before the first opening brace
    const firstBrace = cleaned.indexOf("{");
    if (firstBrace > 0) cleaned = cleaned.slice(firstBrace);

    // Remove any trailing text after the last closing brace
    const lastBrace = cleaned.lastIndexOf("}");
    if (lastBrace !== -1 && lastBrace < cleaned.length - 1) {
      cleaned = cleaned.slice(0, lastBrace + 1);
    }

    return JSON.parse(cleaned);
  } catch {
    throw new Error(
      `JSON parse failed. Raw response (first 500 chars): ${text.slice(0, 500)}`
    );
  }
}

// Promise.race-based timeout — 55 seconds per step
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error(`Timeout: "${label}" exceeded ${ms / 1000}s`)),
      ms
    )
  );
  return Promise.race([promise, timeout]);
}

// Gemini call: uses responseMimeType "application/json" to guarantee valid JSON output
async function callGemini(prompt: string, stepLabel: string): Promise<unknown> {
  console.log(`[generate-plan] ▶ START ${stepLabel}`);

  const model = getGeminiModel();

  const result = await withTimeout(
    model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction: JSON_SYSTEM_PROMPT,
      generationConfig: { responseMimeType: "application/json" },
    }),
    55_000,
    stepLabel
  );

  const text = result.response.text();
  console.log(`[generate-plan] ◀ END ${stepLabel} — ${text.length} chars received`);

  return safeParseJSON(text);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { profile: StudentProfile };
    const { profile } = body;

    if (!profile) {
      return NextResponse.json({ error: "Student profile is required" }, { status: 400 });
    }

    console.log(`[generate-plan] === Starting for: ${profile.name} ===`);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let closed = false;
        const send = (data: object) => {
          if (closed) return;
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          } catch {
            closed = true;
          }
        };

        try {
          // ── Step 1: Diagnosis ──────────────────────────────────────────────
          send({ step: "diagnosis", status: "active" });
          let diagnosis: Diagnosis;
          try {
            console.log("[generate-plan] Step 1/6 — diagnosis");
            diagnosis = await callGemini(buildDiagnosisPrompt(profile), "diagnosis") as Diagnosis;
            send({ step: "diagnosis", status: "complete" });
            console.log("[generate-plan] ✓ Step 1/6 diagnosis complete");
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`[generate-plan] ✗ Step 1/6 diagnosis FAILED: ${msg}`);
            throw new Error(`Diagnosis step failed: ${msg}`);
          }

          // ── Step 2: Strategy ───────────────────────────────────────────────
          send({ step: "strategy", status: "active" });
          let strategy: Strategy;
          try {
            console.log("[generate-plan] Step 2/6 — strategy");
            strategy = await callGemini(buildStrategyPrompt(profile, diagnosis), "strategy") as Strategy;
            send({ step: "strategy", status: "complete" });
            console.log("[generate-plan] ✓ Step 2/6 strategy complete");
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`[generate-plan] ✗ Step 2/6 strategy FAILED: ${msg}`);
            throw new Error(`Strategy step failed: ${msg}`);
          }

          // ── Steps 3-6: All parallel (schedule, systems, resources, review) ─
          send({ step: "schedule", status: "active" });
          send({ step: "systems", status: "active" });
          send({ step: "resources", status: "active" });
          send({ step: "review", status: "active" });

          let dailyRoutine: MasterPlan["dailyRoutine"];
          let weeklySchedule: MasterPlan["weeklySchedule"];
          let habitSystem: MasterPlan["habitSystem"];
          let distractionControl: MasterPlan["distractionControl"];
          let resources: MasterPlan["resources"];
          let weeklyReview: MasterPlan["weeklyReview"];

          try {
            console.log("[generate-plan] Steps 3-6 — running 6 calls in parallel");
            const [routineRes, weeklyRes, habitRes, distractionRes, resourcesRes, reviewRes] = await Promise.all([
              callGemini(buildDailyRoutinePrompt(profile, strategy), "dailyRoutine"),
              callGemini(buildWeeklySchedulePrompt(profile, strategy), "weeklySchedule"),
              callGemini(buildHabitSystemPrompt(profile, diagnosis, strategy), "habitSystem"),
              callGemini(buildDistractionControlPrompt(profile, diagnosis), "distractionControl"),
              callGemini(buildResourcesPrompt(profile), "resources"),
              callGemini(buildWeeklyReviewPrompt(profile), "weeklyReview"),
            ]);

            dailyRoutine = (routineRes as { dailyRoutine: MasterPlan["dailyRoutine"] }).dailyRoutine;
            weeklySchedule = (weeklyRes as { weeklySchedule: MasterPlan["weeklySchedule"] }).weeklySchedule;
            habitSystem = (habitRes as { habitSystem: MasterPlan["habitSystem"] }).habitSystem;
            distractionControl = (distractionRes as { distractionControl: MasterPlan["distractionControl"] }).distractionControl;
            resources = resourcesRes as MasterPlan["resources"];
            weeklyReview = reviewRes as MasterPlan["weeklyReview"];

            console.log("[generate-plan] ✓ Steps 3-6 complete");
            send({ step: "schedule", status: "complete" });
            send({ step: "systems", status: "complete" });
            send({ step: "resources", status: "complete" });
            send({ step: "review", status: "complete" });
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`[generate-plan] ✗ Steps 3-6 FAILED: ${msg}`);
            throw new Error(`Plan generation failed: ${msg}`);
          }

          // ── Assemble ──────────────────────────────────────────────────────
          const masterPlan: MasterPlan = {
            diagnosis,
            strategy,
            dailyRoutine,
            weeklySchedule,
            habitSystem,
            distractionControl,
            resources,
            weeklyReview,
            meta: {
              generatedAt: new Date().toISOString(),
              studentName: profile.name,
              planVersion: 1,
            },
          };

          send({ step: "complete", status: "complete", plan: masterPlan });
          console.log("[generate-plan] === Plan generation COMPLETE ===");

        } catch (error) {
          const msg = error instanceof Error ? error.message : "Generation failed";
          console.error(`[generate-plan] FATAL: ${msg}`);
          send({ step: "error", status: "error", message: msg });
        } finally {
          if (!closed) {
            try { controller.close(); } catch { /* already closed */ }
            closed = true;
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    console.error(`[generate-plan] Request-level error: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
