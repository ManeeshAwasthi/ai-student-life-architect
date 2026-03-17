import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { StudentProfile, MasterPlan, Diagnosis, Strategy } from "@/lib/types";
import {
  JSON_SYSTEM_PROMPT,
  buildDiagnosisPrompt,
  buildStrategyPrompt,
  buildSchedulePrompt,
  buildSystemsPrompt,
  buildResourcesPrompt,
  buildWeeklyReviewPrompt,
} from "@/lib/prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

// Strip all markdown fences and surrounding whitespace before JSON.parse
function safeParseJSON(text: string): unknown {
  try {
    const cleaned = text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .replace(/^\s+|\s+$/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error(
      `JSON parse failed. Raw response (first 400 chars): ${text.slice(0, 400)}`
    );
  }
}

// Rejects after `ms` milliseconds with a clear label in the error message
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Timeout: "${label}" exceeded ${ms / 1000}s`)),
      ms
    );
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

async function callGemini(prompt: string, stepLabel: string): Promise<unknown> {
  console.log(`[generate-plan] ▶ starting: ${stepLabel}`);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
    systemInstruction: JSON_SYSTEM_PROMPT,
  });
  const result = await withTimeout(
    model.generateContent(prompt),
    60_000,
    stepLabel
  );
  const text = result.response.text();
  console.log(`[generate-plan] ◀ received: ${stepLabel} (${text.length} chars)`);
  return safeParseJSON(text);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { profile: StudentProfile };
    const { profile } = body;

    if (!profile) {
      return NextResponse.json({ error: "Student profile is required" }, { status: 400 });
    }

    console.log(`[generate-plan] Starting plan generation for: ${profile.name}`);
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
            diagnosis = await callGemini(buildDiagnosisPrompt(profile), "diagnosis") as Diagnosis;
            send({ step: "diagnosis", status: "complete" });
            console.log("[generate-plan] ✓ diagnosis complete");
          } catch (err) {
            console.error("[generate-plan] ✗ diagnosis failed:", err instanceof Error ? err.message : err);
            throw err;
          }

          // ── Step 2: Strategy ───────────────────────────────────────────────
          send({ step: "strategy", status: "active" });
          let strategy: Strategy;
          try {
            strategy = await callGemini(buildStrategyPrompt(profile, diagnosis), "strategy") as Strategy;
            send({ step: "strategy", status: "complete" });
            console.log("[generate-plan] ✓ strategy complete");
          } catch (err) {
            console.error("[generate-plan] ✗ strategy failed:", err instanceof Error ? err.message : err);
            throw err;
          }

          // ── Step 3: Schedule ───────────────────────────────────────────────
          send({ step: "schedule", status: "active" });
          let schedule: { dailyRoutine: MasterPlan["dailyRoutine"]; weeklySchedule: MasterPlan["weeklySchedule"] };
          try {
            schedule = await callGemini(buildSchedulePrompt(profile, strategy), "schedule") as typeof schedule;
            send({ step: "schedule", status: "complete" });
            console.log("[generate-plan] ✓ schedule complete");
          } catch (err) {
            console.error("[generate-plan] ✗ schedule failed:", err instanceof Error ? err.message : err);
            throw err;
          }

          // ── Step 4: Systems ────────────────────────────────────────────────
          send({ step: "systems", status: "active" });
          let systems: { habitSystem: MasterPlan["habitSystem"]; distractionControl: MasterPlan["distractionControl"] };
          try {
            systems = await callGemini(buildSystemsPrompt(profile, diagnosis, strategy), "systems") as typeof systems;
            send({ step: "systems", status: "complete" });
            console.log("[generate-plan] ✓ systems complete");
          } catch (err) {
            console.error("[generate-plan] ✗ systems failed:", err instanceof Error ? err.message : err);
            throw err;
          }

          // ── Step 5: Resources ──────────────────────────────────────────────
          send({ step: "resources", status: "active" });
          let resources: MasterPlan["resources"];
          try {
            resources = await callGemini(buildResourcesPrompt(profile), "resources") as MasterPlan["resources"];
            send({ step: "resources", status: "complete" });
            console.log("[generate-plan] ✓ resources complete");
          } catch (err) {
            console.error("[generate-plan] ✗ resources failed:", err instanceof Error ? err.message : err);
            throw err;
          }

          // ── Step 6: Weekly Review ──────────────────────────────────────────
          send({ step: "review", status: "active" });
          let weeklyReview: MasterPlan["weeklyReview"];
          try {
            weeklyReview = await callGemini(buildWeeklyReviewPrompt(profile), "weeklyReview") as MasterPlan["weeklyReview"];
            send({ step: "review", status: "complete" });
            console.log("[generate-plan] ✓ weeklyReview complete");
          } catch (err) {
            console.error("[generate-plan] ✗ weeklyReview failed:", err instanceof Error ? err.message : err);
            throw err;
          }

          // ── Assemble final plan ────────────────────────────────────────────
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
          console.log("[generate-plan] ✓ Plan generation complete");

        } catch (error) {
          console.error("[generate-plan] Fatal error:", error instanceof Error ? error.message : error);
          send({
            step: "error",
            status: "error",
            message: error instanceof Error ? error.message : "Generation failed",
          });
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
    console.error("[generate-plan] Request-level error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
