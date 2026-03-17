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

function safeParseJSON(text: string): unknown {
  try {
    const cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error(`Failed to parse response: ${text.slice(0, 300)}`);
  }
}

async function callGemini(prompt: string): Promise<unknown> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: JSON_SYSTEM_PROMPT,
  });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return safeParseJSON(text);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { profile: StudentProfile };
    const { profile } = body;

    if (!profile) {
      return NextResponse.json({ error: "Student profile is required" }, { status: 400 });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: object) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // Step 1 - Diagnosis
          send({ step: "diagnosis", status: "active" });
          const diagnosis = await callGemini(buildDiagnosisPrompt(profile)) as Diagnosis;
          send({ step: "diagnosis", status: "complete" });

          // Step 2 - Strategy
          send({ step: "strategy", status: "active" });
          const strategy = await callGemini(buildStrategyPrompt(profile, diagnosis)) as Strategy;
          send({ step: "strategy", status: "complete" });

          // Step 3 - Schedule
          send({ step: "schedule", status: "active" });
          const schedule = await callGemini(buildSchedulePrompt(profile, strategy)) as {
            dailyRoutine: MasterPlan["dailyRoutine"];
            weeklySchedule: MasterPlan["weeklySchedule"];
          };
          send({ step: "schedule", status: "complete" });

          // Step 4 - Systems
          send({ step: "systems", status: "active" });
          const systems = await callGemini(buildSystemsPrompt(profile, diagnosis, strategy)) as {
            habitSystem: MasterPlan["habitSystem"];
            distractionControl: MasterPlan["distractionControl"];
          };
          send({ step: "systems", status: "complete" });

          // Step 5 - Resources
          send({ step: "resources", status: "active" });
          const resources = await callGemini(buildResourcesPrompt(profile)) as MasterPlan["resources"];
          send({ step: "resources", status: "complete" });

          // Step 6 - Weekly Review
          send({ step: "review", status: "active" });
          const weeklyReview = await callGemini(buildWeeklyReviewPrompt(profile)) as MasterPlan["weeklyReview"];
          send({ step: "review", status: "complete" });

          // Assemble final plan
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

        } catch (error) {
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
        Connection: "keep-alive",
      },
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
