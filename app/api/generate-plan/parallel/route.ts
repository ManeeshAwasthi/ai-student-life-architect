import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini-call";
import {
  buildDailyRoutinePrompt,
  buildWeeklySchedulePrompt,
  buildHabitSystemPrompt,
  buildDistractionControlPrompt,
  buildResourcesPrompt,
  buildWeeklyReviewPrompt,
} from "@/lib/prompts";
import type { StudentProfile, Diagnosis, Strategy, MasterPlan } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { profile, diagnosis, strategy } = (await request.json()) as {
      profile: StudentProfile;
      diagnosis: Diagnosis;
      strategy: Strategy;
    };

    const [routineRes, weeklyRes, habitRes, distractionRes, resourcesRes, reviewRes] =
      await Promise.all([
        callGemini(buildDailyRoutinePrompt(profile, strategy), "dailyRoutine"),
        callGemini(buildWeeklySchedulePrompt(profile, strategy), "weeklySchedule"),
        callGemini(buildHabitSystemPrompt(profile, diagnosis, strategy), "habitSystem"),
        callGemini(buildDistractionControlPrompt(profile, diagnosis), "distractionControl"),
        callGemini(buildResourcesPrompt(profile), "resources"),
        callGemini(buildWeeklyReviewPrompt(profile), "weeklyReview"),
      ]);

    return NextResponse.json({
      dailyRoutine: (routineRes as { dailyRoutine: MasterPlan["dailyRoutine"] }).dailyRoutine,
      weeklySchedule: (weeklyRes as { weeklySchedule: MasterPlan["weeklySchedule"] }).weeklySchedule,
      habitSystem: (habitRes as { habitSystem: MasterPlan["habitSystem"] }).habitSystem,
      distractionControl: (distractionRes as { distractionControl: MasterPlan["distractionControl"] }).distractionControl,
      resources: resourcesRes as MasterPlan["resources"],
      weeklyReview: reviewRes as MasterPlan["weeklyReview"],
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Parallel generation failed";
    console.error("[parallel]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
