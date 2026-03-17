import type { StudentProfile, Diagnosis, Strategy } from "./types";

export const JSON_SYSTEM_PROMPT = `You are an expert AI productivity coach and educational psychologist.
You MUST respond with ONLY valid JSON. No explanations, no markdown, no code fences.
Your JSON must be complete, well-structured, and directly usable by the application.`;

export function buildDiagnosisPrompt(profile: StudentProfile): string {
  return `Analyze this student and produce a psychological productivity diagnosis.

Name: ${profile.name}, Age: ${profile.age}, Education: ${profile.educationLevel}
Field: ${profile.fieldOfStudy}, Subjects: ${profile.subjects.join(", ")}
Goal: ${profile.examGoals}, Performance: ${profile.currentPerformance}
Wake: ${profile.wakeUpTime}, Sleep: ${profile.sleepTime}
Study method: ${profile.currentStudyMethod}
Distractions: ${profile.biggestDistractions.join(", ")}
Procrastination: ${profile.procrastinationLevel}/5, Stress: ${profile.stressLevel}/5
Energy peak: ${profile.energyPeakTime}, Burnout: ${profile.burnoutSymptoms}
Exercise: ${profile.exerciseFrequency}, Screen time: ${profile.screenTimePerDay}h
Social media: ${profile.socialMediaApps.join(", ")}
Primary goal: ${profile.primaryGoal}
Previous systems: ${profile.previousSystemsTried}

Return ONLY this JSON:
{
  "primaryProblems": ["problem1", "problem2", "problem3"],
  "rootCauses": ["cause1", "cause2"],
  "psychologicalProfile": "2-3 sentence profile specific to this student",
  "urgencyLevel": "low|medium|high|critical",
  "keyInsight": "2-3 sentence personalized insight",
  "strengths": ["strength1", "strength2", "strength3"]
}`;
}

export function buildStrategyPrompt(profile: StudentProfile, diagnosis: Diagnosis): string {
  return `Create a personalized study strategy for this student.

Name: ${profile.name}, Field: ${profile.fieldOfStudy}
Subjects: ${profile.subjects.join(", ")}
Daily hours available: ${profile.dailyStudyHoursAvailable}
Energy peak: ${profile.energyPeakTime}
Problems: ${diagnosis.primaryProblems.join(", ")}
Profile: ${diagnosis.psychologicalProfile}

Return ONLY this JSON:
{
  "primaryStudyMethod": "Method name",
  "primaryMethodDescription": "Why this suits this student specifically",
  "secondaryMethod": "Second method name",
  "subjects": [
    {
      "subject": "name",
      "priority": "high|medium|low",
      "weeklyHours": 4,
      "reason": "why this priority",
      "recommendedMethod": "best method for this subject"
    }
  ],
  "weeklyStudyHours": 20,
  "sessionLength": 45,
  "breakDuration": 15
}`;
}

export function buildDailyRoutinePrompt(profile: StudentProfile, strategy: Strategy): string {
  return `Create a daily routine for this student.

Wake: ${profile.wakeUpTime}, Sleep: ${profile.sleepTime}
Energy peak: ${profile.energyPeakTime}
Exercise: ${profile.exerciseFrequency}
Daily hours: ${profile.dailyStudyHoursAvailable}
Session length: ${strategy.sessionLength} min, Break: ${strategy.breakDuration} min

Return ONLY this JSON:
{
  "dailyRoutine": [
    {
      "id": "routine-1",
      "timeBlock": "06:00 - 06:30",
      "activity": "Activity description",
      "category": "health|study|deep_work|rest|admin|meal|social",
      "isFlexible": false,
      "notes": "optional tip"
    }
  ]
}
Include 8-12 blocks covering the full waking day. Schedule deep work at energy peak time.`;
}

export function buildWeeklySchedulePrompt(profile: StudentProfile, strategy: Strategy): string {
  return `Create a 7-day weekly study schedule for this student.

Wake: ${profile.wakeUpTime}, Sleep: ${profile.sleepTime}
Energy peak: ${profile.energyPeakTime}
Daily hours: ${profile.dailyStudyHoursAvailable}
Session length: ${strategy.sessionLength} min, Break: ${strategy.breakDuration} min
Subjects: ${strategy.subjects.map((s) => `${s.subject}: ${s.priority}, ${s.weeklyHours}h/week`).join(", ")}

Return ONLY this JSON:
{
  "weeklySchedule": [
    {
      "day": "Monday",
      "isRestDay": false,
      "blocks": [
        {
          "id": "block-mon-1",
          "time": "09:00 - 10:30",
          "subject": "Subject name",
          "method": "Study method",
          "durationMinutes": 90,
          "notes": "tip"
        }
      ]
    }
  ]
}
Rules: all 7 days (Monday–Sunday). Max 3 study blocks per day. At least 1 full rest day (isRestDay: true, blocks: []). Schedule deep work at energy peak time. Keep notes under 10 words.`;
}

export function buildHabitSystemPrompt(
  profile: StudentProfile,
  diagnosis: Diagnosis,
  strategy: Strategy
): string {
  return `Design a habit system for this student.

Distractions: ${profile.biggestDistractions.join(", ")}
Procrastination: ${profile.procrastinationLevel}/5
Problems: ${diagnosis.primaryProblems.join(", ")}
Study method: ${strategy.primaryStudyMethod}

Return ONLY this JSON:
{
  "habitSystem": [
    {
      "id": "habit-1",
      "habit": "Specific habit",
      "frequency": "daily|weekly",
      "category": "focus|health|study|mindset|lifestyle",
      "whyItMatters": "connection to this student problems",
      "streak": 0,
      "completedToday": false,
      "completionHistory": []
    }
  ]
}
Create 8-10 habits. Make them specific, not generic.`;
}

export function buildDistractionControlPrompt(
  profile: StudentProfile,
  diagnosis: Diagnosis
): string {
  return `Design a distraction control plan for this student.

Distractions: ${profile.biggestDistractions.join(", ")}
Social media: ${profile.socialMediaApps.join(", ")}
Screen time: ${profile.screenTimePerDay}h/day
Procrastination: ${profile.procrastinationLevel}/5
Problems: ${diagnosis.primaryProblems.join(", ")}

Return ONLY this JSON:
{
  "distractionControl": {
    "topDistractions": ["distraction1"],
    "blockingRules": ["rule1", "rule2"],
    "environmentSetup": ["tip1", "tip2"],
    "emergencyProtocol": "What to do when urge hits",
    "phonePolicy": "Specific phone policy"
  }
}`;
}

export function buildResourcesPrompt(profile: StudentProfile): string {
  return `Curate learning resources for this student.

Field: ${profile.fieldOfStudy}, Goal: ${profile.primaryGoal}
Procrastination: ${profile.procrastinationLevel}/5, Stress: ${profile.stressLevel}/5

Return ONLY this JSON:
{
  "books": [{"title": "title", "author": "author", "reason": "why relevant"}],
  "podcasts": [{"title": "title", "reason": "why relevant"}],
  "techniques": [{"name": "name", "description": "what it is", "howToUse": "practical steps"}],
  "tools": [{"name": "name", "purpose": "what it does", "free": true}]
}
Include 4 books, 3 podcasts, 4 techniques, 4 tools. All must be real resources.`;
}

export function buildWeeklyReviewPrompt(profile: StudentProfile): string {
  return `Create a weekly review system for this student.

Goal: ${profile.primaryGoal}, Subjects: ${profile.subjects.join(", ")}
Daily target: ${profile.dailyStudyHoursAvailable} hours

Return ONLY this JSON:
{
  "checklistItems": ["item1", "item2"],
  "progressMetrics": [
    {"metric": "name", "target": 100, "current": 0, "unit": "hours|sessions|%|days"}
  ],
  "reviewQuestions": ["question1", "question2"]
}
Create 8 checklist items, 5 metrics, 5 questions.`;
}

export function buildCoachSystemPrompt(
  profile: StudentProfile,
  planSummary: string,
  personality: string
): string {
  const styles: Record<string, string> = {
    strict: "Be direct and demanding. Hold the student accountable. Don't accept excuses.",
    supportive: "Be warm and encouraging. Acknowledge struggles before giving advice.",
    neutral: "Be professional and analytical. Focus on facts and practical solutions.",
    adaptive: "Read the student's emotional state and adapt. Be strict when they make excuses, supportive when genuinely struggling.",
  };

  return `You are an expert AI study coach for ${profile.name}, a ${profile.educationLevel} student studying ${profile.fieldOfStudy}.

PERSONALITY: ${personality}
${styles[personality] || styles.adaptive}

STUDENT CONTEXT:
${planSummary}

RULES:
- Give specific, actionable advice, never generic platitudes
- Reference the student's actual plan and subjects when relevant
- Keep responses concise (3-5 sentences) unless a detailed plan is requested
- Today is ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`;
}