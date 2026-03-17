export type EducationLevel =
  | "high_school"
  | "undergraduate"
  | "postgraduate"
  | "self_learner"
  | "professional";

export type EnergyPeakTime = "morning" | "afternoon" | "evening" | "night";
export type ExerciseFrequency = "never" | "rarely" | "2-3x_week" | "daily";
export type CoachPersonality = "strict" | "supportive" | "neutral" | "adaptive";
export type ProcrastinationLevel = 1 | 2 | 3 | 4 | 5;
export type StressLevel = 1 | 2 | 3 | 4 | 5;

export interface StudentProfile {
  name: string;
  age: number;
  educationLevel: EducationLevel;
  fieldOfStudy: string;
  subjects: string[];
  examGoals: string;
  dailyStudyHoursAvailable: number;
  currentPerformance: string;
  wakeUpTime: string;
  sleepTime: string;
  currentStudyMethod: string;
  averageSessionLength: number;
  biggestDistractions: string[];
  procrastinationLevel: ProcrastinationLevel;
  energyPeakTime: EnergyPeakTime;
  stressLevel: StressLevel;
  burnoutSymptoms: boolean;
  exerciseFrequency: ExerciseFrequency;
  screenTimePerDay: number;
  socialMediaApps: string[];
  primaryGoal: string;
  coachPersonality: CoachPersonality;
  previousSystemsTried: string;
}

export type UrgencyLevel = "low" | "medium" | "high" | "critical";
export type SubjectPriority = "high" | "medium" | "low";
export type ActivityCategory = "study" | "deep_work" | "health" | "rest" | "admin" | "meal" | "social";
export type HabitCategory = "focus" | "health" | "study" | "mindset" | "lifestyle";
export type HabitFrequency = "daily" | "weekly";

export interface Diagnosis {
  primaryProblems: string[];
  rootCauses: string[];
  psychologicalProfile: string;
  urgencyLevel: UrgencyLevel;
  keyInsight: string;
  strengths: string[];
}

export interface SubjectStrategy {
  subject: string;
  priority: SubjectPriority;
  weeklyHours: number;
  reason: string;
  recommendedMethod: string;
}

export interface Strategy {
  primaryStudyMethod: string;
  primaryMethodDescription: string;
  secondaryMethod: string;
  subjects: SubjectStrategy[];
  weeklyStudyHours: number;
  sessionLength: number;
  breakDuration: number;
}

export interface RoutineBlock {
  id: string;
  timeBlock: string;
  activity: string;
  category: ActivityCategory;
  isFlexible: boolean;
  notes?: string;
}

export interface StudyBlock {
  id: string;
  time: string;
  subject: string;
  method: string;
  durationMinutes: number;
  notes?: string;
}

export interface DaySchedule {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  isRestDay: boolean;
  blocks: StudyBlock[];
}

export interface Habit {
  id: string;
  habit: string;
  frequency: HabitFrequency;
  category: HabitCategory;
  whyItMatters: string;
  streak: number;
  completedToday: boolean;
  completionHistory: string[];
}

export interface DistractionControl {
  topDistractions: string[];
  blockingRules: string[];
  environmentSetup: string[];
  emergencyProtocol: string;
  phonePolicy: string;
}

export interface Resource {
  title: string;
  author?: string;
  reason: string;
}

export interface Technique {
  name: string;
  description: string;
  howToUse: string;
}

export interface Tool {
  name: string;
  purpose: string;
  free: boolean;
}

export interface Resources {
  books: Resource[];
  podcasts: Resource[];
  techniques: Technique[];
  tools: Tool[];
}

export interface ProgressMetric {
  metric: string;
  target: number;
  current: number;
  unit: string;
}

export interface WeeklyReview {
  checklistItems: string[];
  progressMetrics: ProgressMetric[];
  reviewQuestions: string[];
}

export interface MasterPlan {
  diagnosis: Diagnosis;
  strategy: Strategy;
  dailyRoutine: RoutineBlock[];
  weeklySchedule: DaySchedule[];
  habitSystem: Habit[];
  distractionControl: DistractionControl;
  resources: Resources;
  weeklyReview: WeeklyReview;
  meta: {
    generatedAt: string;
    studentName: string;
    planVersion: number;
  };
}

export interface StudySession {
  id: string;
  date: string;
  subject: string;
  durationMinutes: number;
  method: string;
  notes?: string;
  quality: 1 | 2 | 3 | 4 | 5;
}

export interface HabitCompletion {
  habitId: string;
  date: string;
  completed: boolean;
}

export interface WeeklyLogEntry {
  weekStart: string;
  habitCompletions: HabitCompletion[];
  studySessions: StudySession[];
  totalStudyHours: number;
  weeklyReviewCompleted: boolean;
  aiFeedback?: string;
}

export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

export interface GenerationStep {
  id: string;
  label: string;
  status: "pending" | "active" | "complete" | "error";
}
