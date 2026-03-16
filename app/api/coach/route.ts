import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { Message, StudentProfile, MasterPlan } from "@/lib/types";
import { buildCoachSystemPrompt } from "@/lib/prompts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function buildPlanSummary(plan: MasterPlan): string {
  const subjects = plan.strategy.subjects
    .map((s) => `${s.subject} (${s.priority} priority, ${s.weeklyHours}h/week)`)
    .join(", ");
  const habits = plan.habitSystem
    .filter((h) => h.frequency === "daily")
    .map((h) => h.habit)
    .slice(0, 5)
    .join(", ");
  return `Profile: ${plan.diagnosis.psychologicalProfile}
Problems: ${plan.diagnosis.primaryProblems.join(", ")}
Study Method: ${plan.strategy.primaryStudyMethod}
Subjects: ${subjects}
Weekly Target: ${plan.strategy.weeklyStudyHours} hours
Key Habits: ${habits}
Urgency: ${plan.diagnosis.urgencyLevel}`;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, profile, plan, habitsSummary }: {
      messages: Message[];
      profile: StudentProfile;
      plan: MasterPlan;
      habitsSummary?: string;
    } = await request.json();

    if (!messages || !profile || !plan) {
      return NextResponse.json({ error: "Messages, profile, and plan are required" }, { status: 400 });
    }

    const planSummary = buildPlanSummary(plan);
    const systemPrompt = buildCoachSystemPrompt(
      profile,
      planSummary + (habitsSummary ? `\n\nTODAY: ${habitsSummary}` : ""),
      profile.coachPersonality
    );

    const anthropicMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-5",
      max_tokens: 500,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
            );
          }
        }
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Coach unavailable" },
      { status: 500 }
    );
  }
}