import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/generative-ai";
import type { StudentProfile, MasterPlan, Diagnosis, Strategy } from "@/lib/types";
import {
  JSON_SYSTEM_PROMPT,
  buildDiagnosisPrompt,
  buildStrategyPrompt,
  buildDailyRoutinePrompt,
  buildWeeklySchedulePrompt,
  buildSystemsPrompt,
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
        const send = (data: object) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
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

          // ── Step 3: Schedule (daily routine + weekly schedule in parallel) ─
          send({ step: "schedule", status: "active" });
          let schedule: { dailyRoutine: MasterPlan["dailyRoutine"]; weeklySchedule: MasterPlan["weeklySchedule"] };
          try {
            console.log("[generate-plan] Step 3/6 — schedule (parallel)");
            const [routineResult, weeklyResult] = await Promise.all([
              callGemini(buildDailyRoutinePrompt(profile, strategy), "dailyRoutine") as Promise<{ dailyRoutine: MasterPlan["dailyRoutine"] }>,
              callGemini(buildWeeklySchedulePrompt(profile, strategy), "weeklySchedule") as Promise<{ weeklySchedule: MasterPlan["weeklySchedule"] }>,
            ]);
            schedule = {
              dailyRoutine: (routineResult as { dailyRoutine: MasterPlan["dailyRoutine"] }).dailyRoutine,
              weeklySchedule: (weeklyResult as { weeklySchedule: MasterPlan["weeklySchedule"] }).weeklySchedule,
            };
            send({ step: "schedule", status: "complete" });
            console.log("[generate-plan] ✓ Step 3/6 schedule complete");
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`[generate-plan] ✗ Step 3/6 schedule FAILED: ${msg}`);
            throw new Error(`Schedule step failed: ${msg}`);
          }

          // ── Step 4: Systems ────────────────────────────────────────────────
          send({ step: "systems", status: "active" });
          let systems: { habitSystem: MasterPlan["habitSystem"]; distractionControl: MasterPlan["distractionControl"] };
          try {
            console.log("[generate-plan] Step 4/6 — systems");
            systems = await callGemini(buildSystemsPrompt(profile, diagnosis, strategy), "systems") as typeof systems;
            send({ step: "systems", status: "complete" });
            console.log("[generate-plan] ✓ Step 4/6 systems complete");
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`[generate-plan] ✗ Step 4/6 systems FAILED: ${msg}`);
            throw new Error(`Systems step failed: ${msg}`);
          }

          // ── Step 5: Resources ──────────────────────────────────────────────
          send({ step: "resources", status: "active" });
          let resources: MasterPlan["resources"];
          try {
            console.log("[generate-plan] Step 5/6 — resources");
            resources = await callGemini(buildResourcesPrompt(profile), "resources") as MasterPlan["resources"];
            send({ step: "resources", status: "complete" });
            console.log("[generate-plan] ✓ Step 5/6 resources complete");
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`[generate-plan] ✗ Step 5/6 resources FAILED: ${msg}`);
            throw new Error(`Resources step failed: ${msg}`);
          }

          // ── Step 6: Weekly Review ──────────────────────────────────────────
          send({ step: "review", status: "active" });
          let weeklyReview: MasterPlan["weeklyReview"];
          try {
            console.log("[generate-plan] Step 6/6 — weeklyReview");
            weeklyReview = await callGemini(buildWeeklyReviewPrompt(profile), "weeklyReview") as MasterPlan["weeklyReview"];
            send({ step: "review", status: "complete" });
            console.log("[generate-plan] ✓ Step 6/6 weeklyReview complete");
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`[generate-plan] ✗ Step 6/6 weeklyReview FAILED: ${msg}`);
            throw new Error(`Weekly review step failed: ${msg}`);
          }

          // ── Assemble ──────────────────────────────────────────────────────
          const masterPlan: MasterPlan = {
            diagnosis,
            strategy,
            dailyRoutine: schedule.dailyRoutine,
            weeklySchedule: schedule.weeklySchedule,
            habitSystem: systems.habitSystem,
            distractionControl: systems.distractionControl,
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
          controller.close();
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
