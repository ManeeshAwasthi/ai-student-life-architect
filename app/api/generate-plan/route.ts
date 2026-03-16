import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
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

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function safeParseJSON(text: string): unknown {
  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error(`Failed to parse AI response: ${text.slice(0, 200)}`);
  }
}

async function callClaude(prompt: string): Promise<unknown> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2000,
    system: JSON_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });
  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => (block as { type: "text"; text: string }).text)
    .join("");
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
          // Step 1 — Diagnosis
          send({ step: "diagnosis", status: "active" });
          const diagnosis = await callClaude(buildDiagnosisPrompt(profile)) as Diagnosis;
          send({ step: "diagnosis", status: "complete" });

          // Step 2 — Strategy
          send({ step: "strategy", status: "active" });
          const strategy = await callClaude(buildStrategyPrompt(profile, diagnosis)) as Strategy;
          send({ step: "strategy", status: "complete" });

          // Step 3 — Schedule
          send({ step: "schedule", status: "active" });
          const schedule = await callClaude(buildSchedulePrompt(profile, strategy)) as {
            dailyRoutine: MasterPlan["dailyRoutine"];
            weeklySchedule: MasterPlan["weeklySchedule"];
          };
          send({ step: "schedule", status: "complete" });

          // Step 4 — Systems
          send({ step: "systems", status: "active" });
          const systems = await callClaude(buildSystemsPrompt(profile, diagnosis, strategy)) as {
            habitSystem: MasterPlan["habitSystem"];
            distractionControl: MasterPlan["distractionControl"];
          };
          send({ step: "systems", status: "complete" });

          // Step 5 — Resources
          send({ step: "resources", status: "active" });
          const resources = await callClaude(buildResourcesPrompt(profile)) as MasterPlan["resources"];
          send({ step: "resources", status: "complete" });

          // Step 6 — Weekly Review
          send({ step: "review", status: "active" });
          const weeklyReview = await callClaude(buildWeeklyReviewPrompt(profile)) as MasterPlan["weeklyReview"];
          send({ step: "review", status: "complete" });

          // Assemble master plan
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