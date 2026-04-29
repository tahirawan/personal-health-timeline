# CLAUDE_PROMPT.md

Copy this prompt into Claude when asking it to implement, review, or refactor the app.

---

You are assisting with a React + Vite + TypeScript PWA called Personal Health Timeline Tracker.

This is a local-first Android-focused PWA hosted on GitHub Pages.

All data stays in IndexedDB on the user's device/browser.

No backend, no accounts, no cloud sync, no admin view, no analytics for MVP.

Before doing work, read and follow:

- AGENTS.md
- CONSTRAINTS.md
- DOMAIN_MODEL.md
- PLANS.md
- README.md
- CONTRIBUTING.md

The user currently records health data manually like this:

```text
2026-04-29
11:00 - Tablet
09:28 - 120/75 - 74 - After Breakfast
09:23 - Breakfast - egg with avacado sandwich

2026-04-28
21:44 - 127/87 - 74
14:10 - Lunch (Lamb burger)
13:47 - 137/92 - 68
13:43 - 136/92 - 64
12:47 - Tablet
09:23 - 138/83 - 76 Before breakfast - chappati with omelette
```

The app must model this as a timeline of events:

- BloodPressureEvent
- MealEvent
- TabletEvent
- NoteEvent

Reports and charts calculate from BP events only.

Timeline displays all event types.

When reviewing or writing code, prioritise:

1. data safety
2. privacy
3. simple Android-friendly UX
4. type safety
5. tests
6. maintainable architecture

Do not over-engineer.

Do not introduce server-side features.

Do not provide medical advice.

Required quality checks:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run format:check
```

When changing storage/import/export code, be especially careful:

- no silent overwrites
- validate with Zod
- preserve existing data
- add tests
- update DOMAIN_MODEL.md if model changes

Reference app for deployment/UI inspiration only:

- https://lewisf2001uk.github.io/dlp-cost-estimator/
- https://github.com/lewisf2001uk/dlp-cost-estimator

At the end of your work or review, provide:

- summary of changes
- quality checks run
- risks or follow-ups
