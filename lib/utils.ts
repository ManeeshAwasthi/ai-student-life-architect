  import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTodayString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

export function getDayOfWeek(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export function getFormattedDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function calculateStreak(completionHistory: string[]): number {
  if (!completionHistory.length) return 0;
  const sorted = [...completionHistory].sort().reverse();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < sorted.length; i++) {
    const date = new Date(sorted[i]);
    const diffDays = Math.floor(
      (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === i) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function getUrgencyColor(urgency: string): string {
  const map: Record<string, string> = {
    low: "text-emerald-400",
    medium: "text-amber-400",
    high: "text-orange-400",
    critical: "text-red-400",
  };
  return map[urgency] ?? "text-gray-400";
}

export function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    study: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    deep_work: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    health: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    rest: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    admin: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    meal: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    social: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    focus: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    mindset: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    lifestyle: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  };
  return map[category] ?? "bg-gray-500/20 text-gray-300 border-gray-500/30";
}

export function getCompletionPercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function buildProfileSummary(profile: {
  name: string;
  fieldOfStudy: string;
  subjects: string[];
  primaryGoal: string;
  energyPeakTime: string;
  procrastinationLevel: number;
  stressLevel: number;
}): string {
  return `Student: ${profile.name}, studying ${profile.fieldOfStudy}. Subjects: ${profile.subjects.join(", ")}. Goal: ${profile.primaryGoal}. Peak energy: ${profile.energyPeakTime}. Procrastination: ${profile.procrastinationLevel}/5. Stress: ${profile.stressLevel}/5.`;
}
