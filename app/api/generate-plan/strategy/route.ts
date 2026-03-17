import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini-call";
import { buildStrategyPrompt } from "@/lib/prompts";
import type { StudentProfile, Diagnosis } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { profile, diagnosis } = (await request.json()) as {
      profile: StudentProfile;
      diagnosis: Diagnosis;
    };
    const strategy = await callGemini(buildStrategyPrompt(profile, diagnosis), "strategy");
    return NextResponse.json({ strategy });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Strategy failed";
    console.error("[strategy]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
