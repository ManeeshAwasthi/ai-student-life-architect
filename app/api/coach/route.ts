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
    const body = await request.json() as {
      messages: Message[];
      profile: StudentProfile;
      plan: MasterPlan;
      habitsSummary?: string;
    };

    const { messages, profile, plan, habitsSummary } = body;

    if (!messages || !profile || !plan) {
      return NextResponse.json(
        { error: "Messages, profile, and plan are required" },
        { status: 400 }
      );
    }

    console.log(`[coach] Received message from ${profile.name}, history length: ${messages.length}`);

    const planSummary = buildPlanSummary(plan);
    const systemPrompt = buildCoachSystemPrompt(
      profile,
      planSummary + (habitsSummary ? `\n\nTODAY: ${habitsSummary}` : ""),
      profile.coachPersonality
    );

    // No systemInstruction param — inject system context as the first turn in history
    // This ensures compatibility across all SDK versions
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const userHistory = messages.slice(0, -1).map((m) => ({
      role: m.role === "user" ? "user" as const : "model" as const,
      parts: [{ text: m.content }],
    }));

    // Prepend system context as a user→model exchange before the real history
    const history = [
      {
        role: "user" as const,
        parts: [{ text: `[SYSTEM CONTEXT — follow these instructions for the entire conversation]\n${systemPrompt}` }],
      },
      {
        role: "model" as const,
        parts: [{ text: "Understood. I will follow these instructions precisely throughout our conversation." }],
      },
      ...userHistory,
    ];

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1];
    const encoder = new TextEncoder();

    console.log(`[coach] Sending to Gemini: "${lastMessage.content.slice(0, 80)}..."`);

    const readable = new ReadableStream({
      async start(controller) {
        try {
          const result = await chat.sendMessageStream(lastMessage.content);
          let totalChars = 0;
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              totalChars += text.length;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          }
          console.log(`[coach] Stream complete — ${totalChars} chars sent`);
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        } catch (error) {
          const msg = error instanceof Error ? error.message : "Stream failed";
          console.error(`[coach] Stream error: ${msg}`);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
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
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : "Coach unavailable";
    console.error(`[coach] Request-level error: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
