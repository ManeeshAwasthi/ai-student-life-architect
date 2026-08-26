# PeakMind

PeakMind is an AI-assisted personal-development planner designed for students who want a realistic plan built around their actual goals, schedule, constraints, and habits.

Rather than producing another generic productivity checklist, the product uses structured onboarding to create a personalised development plan and coaching experience.

## The problem

Students usually know what they want to improve, but struggle to convert broad ambitions into a sequence they can consistently execute. Generic plans ignore college schedules, energy, current ability, competing priorities, and the reasons previous attempts failed.

PeakMind was designed to make the plan fit the person.

## Product flow

1. The student completes a structured onboarding assessment.
2. PeakMind maps goals, constraints, routines, and current capability.
3. A generative-AI workflow produces a personalised multi-part plan.
4. The interface organises priorities, milestones, and recommended actions.
5. Coaching and progress views help the student revisit the plan over time.

## Technology

- Next.js 14
- TypeScript and React
- Anthropic and Google Generative AI SDKs
- Zustand for client-side state
- Framer Motion and Tailwind CSS

## Run locally

```bash
npm install
npm run dev
```

Add the required model-provider credentials to your local environment before using AI-dependent features.

## Current status

PeakMind is an early product prototype focused on validating the onboarding-to-plan experience. Future work includes stronger progress tracking, evaluation of plan quality, safety guardrails, and user testing with students.

## Responsible use

PeakMind is a planning and reflection tool. It is not a substitute for qualified medical, psychological, or academic support.
