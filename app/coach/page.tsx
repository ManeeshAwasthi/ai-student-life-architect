import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Message, StudentProfile, MasterPlan } from "@/lib/types";
import { buildCoachSystemPrompt } from "@/lib/prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

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

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt,
    });

    // Build chat history (all messages except the last one)
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1];

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const result = await chat.sendMessageStream(lastMessage.content);
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        } catch (error) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`)
          );
        } finally {
          controller.close();
        }
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
