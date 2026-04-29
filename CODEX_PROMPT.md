# CODEX_PROMPT.md

Copy this prompt into Codex when starting or continuing implementation.

---

You are working on a new React + Vite + TypeScript PWA called Personal Health Timeline Tracker.

Before making changes, read these files:

- AGENTS.md
- CONSTRAINTS.md
- DOMAIN_MODEL.md
- PLANS.md
- README.md
- CONTRIBUTING.md

Reference app:

- Hosted: https://lewisf2001uk.github.io/dlp-cost-estimator/
- Repo: https://github.com/lewisf2001uk/dlp-cost-estimator

Use the reference app only for inspiration around GitHub Pages hosting, installable PWA behaviour, simple UI, offline-first static frontend, and lightweight app structure. Do not copy its business logic.

Project goal:

Build an Android-first PWA for recording a local private health timeline.

MVP has no backend, no accounts, no cloud sync, no admin view, and no analytics.

All user data must remain local in IndexedDB.

Real user recording pattern:

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

Core architecture:

- timeline event model
- BloodPressureEvent
- MealEvent
- TabletEvent
- NoteEvent
- reports calculate from BloodPressureEvent only
- timeline shows all event types

Implement incrementally.

Required stack:

- React
- Vite
- TypeScript strict
- Dexie
- Zod
- React Hook Form
- Recharts
- Vitest
- React Testing Library
- ESLint
- Prettier
- PWA support

Required features:

1. Add BP reading
2. Add Meal
3. Add Tablet
4. Timeline view
5. Reports/charts
6. JSON export/import
7. CSV export
8. Offline installable PWA
9. GitHub Pages deployment readiness
10. Tests for important logic

Quality gates after every meaningful change:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run format:check
```

If scripts are missing, add them.

Do not complete work while checks fail unless clearly documenting an existing unrelated failure.

Important rules:

- Do not add backend/auth/cloud sync.
- Do not add analytics/tracking.
- Do not send health data anywhere.
- Do not silently delete or overwrite local data.
- Validate imports with Zod.
- Keep domain logic out of UI components.
- Use repository pattern for storage.
- Keep reports separate from timeline rendering.
- Include medical disclaimer.

Start by inspecting the repo, then make the smallest useful next change.

At the end, summarise:

- files changed
- features added
- tests added/updated
- quality commands run and results
- any known limitations
