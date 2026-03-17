"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StudentProfile, MasterPlan, Message, StudySession, WeeklyLogEntry } from "./types";
import { generateId, getTodayString } from "./utils";

interface AppState {
  studentProfile: StudentProfile | null;
  isOnboarded: boolean;
  masterPlan: MasterPlan | null;
  isPlanGenerating: boolean;
  habitCompletions: Record<string, boolean>;
  lastHabitResetDate: string;
  studyHoursToday: number;
  currentStreak: number;
  longestStreak: number;
  studySessions: StudySession[];
  coachMessages: Message[];
  weeklyLog: WeeklyLogEntry[];

  setStudentProfile: (profile: StudentProfile) => void;
  setIsOnboarded: (value: boolean) => void;
  setMasterPlan: (plan: MasterPlan) => void;
  setIsPlanGenerating: (value: boolean) => void;
  resetPlan: () => void;
  toggleHabit: (habitId: string) => void;
  resetDailyHabits: () => void;
  logStudySession: (session: Omit<StudySession, "id" | "date">) => void;
  addCoachMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  clearCoachHistory: () => void;
  saveWeeklyReview: (feedback: string) => void;
  resetAll: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      studentProfile: null,
      isOnboarded: false,
      masterPlan: null,
      isPlanGenerating: false,
      habitCompletions: {},
      lastHabitResetDate: getTodayString(),
      studyHoursToday: 0,
      currentStreak: 0,
      longestStreak: 0,
      studySessions: [],
      coachMessages: [],
      weeklyLog: [],

      setStudentProfile: (profile) => set({ studentProfile: profile }),
      setIsOnboarded: (value) => set({ isOnboarded: value }),
      setMasterPlan: (plan) => set({ masterPlan: plan }),
      setIsPlanGenerating: (value) => set({ isPlanGenerating: value }),
      resetPlan: () => set({ masterPlan: null, habitCompletions: {}, studyHoursToday: 0 }),

      toggleHabit: (habitId) => {
        const { habitCompletions, masterPlan, currentStreak, longestStreak } = get();
        const newCompletions = { ...habitCompletions, [habitId]: !habitCompletions[habitId] };
        set({ habitCompletions: newCompletions });

        if (masterPlan) {
          const today = getTodayString();
          const updatedHabits = masterPlan.habitSystem.map((habit) => {
            if (habit.id !== habitId) return habit;
            const isNowComplete = newCompletions[habitId];
            const history = isNowComplete
              ? [...new Set([...habit.completionHistory, today])]
              : habit.completionHistory.filter((d) => d !== today);
            return { ...habit, completedToday: isNowComplete, completionHistory: history };
          });
          const allDone = updatedHabits
            .filter((h) => h.frequency === "daily")
            .every((h) => newCompletions[h.id]);
          const newStreak = allDone ? currentStreak + 1 : currentStreak;
          const newLongest = Math.max(newStreak, longestStreak);
          set({ masterPlan: { ...masterPlan, habitSystem: updatedHabits }, currentStreak: newStreak, longestStreak: newLongest });
        }
      },

      resetDailyHabits: () => {
        const today = getTodayString();
        const { lastHabitResetDate, masterPlan } = get();
        if (lastHabitResetDate === today) return;
        const resetCompletions: Record<string, boolean> = {};
        if (masterPlan) {
          masterPlan.habitSystem.forEach((h) => { resetCompletions[h.id] = false; });
        }
        set({ habitCompletions: resetCompletions, lastHabitResetDate: today, studyHoursToday: 0 });
      },

      logStudySession: (session) => {
        const newSession: StudySession = { ...session, id: generateId(), date: getTodayString() };
        set((state) => ({
          studySessions: [...state.studySessions, newSession],
          studyHoursToday: state.studyHoursToday + session.durationMinutes / 60,
        }));
      },

      addCoachMessage: (message) => {
        const newMessage: Message = { ...message, id: generateId(), timestamp: new Date().toISOString() };
        set((state) => ({ coachMessages: [...state.coachMessages, newMessage] }));
      },

      clearCoachHistory: () => set({ coachMessages: [] }),

      saveWeeklyReview: (feedback) => {
        const { weeklyLog, studySessions, habitCompletions } = get();
        const today = getTodayString();
        const entry: WeeklyLogEntry = {
          weekStart: today,
          habitCompletions: Object.entries(habitCompletions).map(([habitId, completed]) => ({ habitId, date: today, completed })),
          studySessions: studySessions.filter((s) => s.date >= today),
          totalStudyHours: studySessions.reduce((acc, s) => acc + s.durationMinutes / 60, 0),
          weeklyReviewCompleted: true,
          aiFeedback: feedback,
        };
        set({ weeklyLog: [...weeklyLog, entry] });
      },

      resetAll: () => set({
        studentProfile: null, isOnboarded: false, masterPlan: null,
        isPlanGenerating: false, habitCompletions: {}, lastHabitResetDate: getTodayString(),
        studyHoursToday: 0, currentStreak: 0, longestStreak: 0,
        studySessions: [], coachMessages: [], weeklyLog: [],
      }),
    }),
    {
      name: "ai-student-architect",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        studentProfile: state.studentProfile,
        isOnboarded: state.isOnboarded,
        masterPlan: state.masterPlan,
        habitCompletions: state.habitCompletions,
        lastHabitResetDate: state.lastHabitResetDate,
        studyHoursToday: state.studyHoursToday,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        studySessions: state.studySessions,
        coachMessages: state.coachMessages,
        weeklyLog: state.weeklyLog,
      }),
    }
  )
);
