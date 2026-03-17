import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini-call";
import { buildDiagnosisPrompt } from "@/lib/prompts";
import type { StudentProfile } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { profile } = (await request.json()) as { profile: StudentProfile };
    const diagnosis = await callGemini(buildDiagnosisPrompt(profile), "diagnosis");
    return NextResponse.json({ diagnosis });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Diagnosis failed";
    console.error("[diagnosis]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
