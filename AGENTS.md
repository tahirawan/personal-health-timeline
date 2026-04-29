# AGENTS.md

This file is the primary instruction file for AI coding assistants working on this repository, including Codex, Claude, Cursor, Copilot Workspace, and similar tools.

All AI assistants must read this file before making changes.

---

## Project Summary

This project is a **Personal Health Timeline Tracker with Blood Pressure Analytics**.

The app is Android-first, installable as a PWA, and hosted as a static frontend on GitHub Pages for the MVP.

The MVP stores all data locally on the user's device/browser using IndexedDB.

There is no backend, no login, no cloud sync, no admin view, and no remote database in the MVP.

---

## Reference App

Reference hosted app:

- https://lewisf2001uk.github.io/dlp-cost-estimator/

Reference repository:

- https://github.com/lewisf2001uk/dlp-cost-estimator

Use this only as inspiration for:

- simple GitHub Pages hosting
- static app deployment
- PWA-style installable web app
- simple and focused UI
- offline-friendly behaviour
- lightweight repository structure

Do not copy its business logic. This app is a new health timeline tracker.

---

## Real User Logging Pattern

The user's current manual recording style is the source of truth for the MVP experience.

Example:

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

2026-04-27
21:05 - 124/79 - 72
12:12 - 128/87

2026-04-24
14:51 - 135/90
```

The app must make this faster, safer, easier to view, and easier to report on.

The application must be modelled as a **timeline of events**, not only as a table of blood pressure rows.

---

## Core MVP Concept

The user records daily timeline events:

1. Blood pressure readings
2. Meals
3. Tablet / medication events
4. Notes

All events appear together in one chronological timeline.

Reports and charts are calculated from blood pressure readings only.

Meals and tablets provide context around readings but should remain separate event types.

---

## Non-Negotiable MVP Rules

- Do not add backend storage.
- Do not add user accounts.
- Do not add admin views.
- Do not add analytics or tracking.
- Do not store health data remotely.
- Do not silently delete or overwrite existing local data.
- Do not force every blood pressure reading to include meal or tablet details.
- Do not make medication or meal entry mandatory for a BP reading.
- Do not provide medical advice.
- Always include a medical disclaimer.

---

## Preferred Stack

Use the following stack unless an existing repository already has an approved alternative:

- React
- Vite
- TypeScript with strict mode
- IndexedDB via Dexie
- React Hook Form
- Zod
- Recharts
- Tailwind CSS
- Vitest
- React Testing Library
- ESLint
- Prettier
- vite-plugin-pwa or an equivalent PWA setup

---

## Architecture Principles

Use clean separation of concerns.

Business/domain logic should not be buried inside React components.

Prefer:

- typed domain models
- discriminated unions for event types
- repository pattern for storage
- pure functions for calculations
- reusable validation schemas
- small components
- clear folder ownership

Avoid:

- large components
- untyped data
- duplicated date logic
- direct IndexedDB calls inside UI components
- mixing timeline rendering logic with reporting calculations
- broad global state unless genuinely needed

---

## Recommended Folder Structure

```text
src/
  app/
    App.tsx
    main.tsx
    routes.tsx
    providers.tsx
  features/
    timeline/
      components/
      hooks/
      services/
    blood-pressure/
      components/
      schemas/
      services/
      tests/
    meals/
      components/
      schemas/
      services/
    tablets/
      components/
      schemas/
      services/
    reports/
      components/
      services/
      tests/
    backup/
      components/
      services/
      tests/
    settings/
      components/
  shared/
    components/
    hooks/
    lib/
      date.ts
      ids.ts
      numbers.ts
    storage/
      db.ts
      timelineRepository.ts
    types/
      domain.ts
      storage.ts
  test/
    setup.ts
```

If a different structure already exists, preserve it only if it maintains the same separation of concerns.

---

## Domain Model Requirement

Use a timeline event model.

At minimum, support:

- `BloodPressureEvent`
- `MealEvent`
- `TabletEvent`
- `NoteEvent`

All events must share:

- `id`
- `type`
- `timestamp`
- `createdAt`
- `updatedAt`

Blood pressure event fields:

- `systolic`
- `diastolic`
- `pulse?`
- `mealRelation?`
- `notes?`

Meal event fields:

- `mealType`
- `description?`

Tablet event fields:

- `medicationName?`
- `dosage?`
- `notes?`

Note event fields:

- `text`

See `DOMAIN_MODEL.md` for the complete domain model.

---

## UX Priorities

The app is for daily use on an Android phone.

Prioritise:

- fast data entry
- large touch targets
- minimal typing
- clear timeline view
- clear backup/export controls
- offline reliability
- readable charts

Most common entries should be possible in under 10 seconds.

Primary quick actions:

- Add BP Reading
- Add Meal
- Add Tablet
- Add Note

---

## Reporting Rules

Reports must use only `BloodPressureEvent` records.

Reports should support:

- Today
- 7 days
- 30 days
- Monthly
- Yearly
- Overall
- Custom range if practical

Charts should include:

- systolic line
- diastolic line
- pulse line where pulse exists

Summary cards should include:

- average systolic
- average diastolic
- average pulse where available
- highest systolic
- highest diastolic
- lowest systolic
- lowest diastolic
- total readings

Meals and tablets should be visible in timeline context but not used as BP readings.

---

## Local Storage Rules

Use IndexedDB as the primary local database.

Use Dexie unless there is a strong project-specific reason not to.

The app should request persistent storage where supported:

```ts
await navigator.storage?.persist?.();
```

This request must be best-effort and must not break unsupported browsers.

Never assume browser storage is permanent. The app must provide backup/export/import.

---

## Backup and Import Rules

The MVP must support:

- JSON export of all data
- JSON import/restore
- CSV export for blood pressure readings

Import rules:

- validate input with Zod
- show summary before applying where practical
- do not silently overwrite existing data
- preserve existing data unless user explicitly confirms replacement
- support merge import where practical
- reject invalid records safely

---

## Smart Text Import

The user has existing text logs. Add or preserve a smart text import path if practical.

It should parse lines such as:

```text
09:28 - 120/75 - 74 - After Breakfast
09:23 - Breakfast - egg with avocado sandwich
11:00 - Tablet
```

Smart import should be treated as helpful but must not compromise data safety.

Parsed results should be previewed before saving.

---

## PWA Requirements

The app must be:

- installable on Android
- usable offline
- deployable on GitHub Pages
- responsive on mobile screens
- safe to refresh without losing data

Include:

- manifest
- service worker
- app icons
- offline shell caching
- GitHub Pages build/deploy instructions

---

## Accessibility and Usability

- Use semantic HTML.
- Forms must have labels.
- Buttons must be keyboard accessible.
- Inputs must have sensible mobile input modes.
- Numeric BP fields should use numeric keyboards on mobile.
- Do not rely on colour alone to communicate meaning.
- Keep text readable on small screens.

---

## Medical Disclaimer

The app must display a clear disclaimer, for example:

> This app records health readings only and does not provide medical advice. Always consult a qualified healthcare professional for medical concerns.

Do not implement diagnosis, treatment advice, or emergency guidance beyond a neutral disclaimer.

---

## Quality Gates

After every meaningful change, run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run format:check
```

If scripts are missing, add them.

Do not mark work complete while these fail, unless documenting an existing failure that could not be fixed in the current change.

---

## Testing Requirements

Add tests for important logic.

Required unit tests:

- BP validation
- timeline sorting
- report aggregation
- date range filtering
- JSON import validation
- CSV export formatting
- smart text parsing where implemented

Required component tests where practical:

- add BP form
- add meal form
- add tablet form
- timeline rendering
- report period filter
- backup/export controls

At least one smoke test should cover:

1. add BP reading
2. view reading in timeline
3. see reading included in reports

---

## Code Style Rules

- TypeScript strict mode is required.
- No `any` unless justified with a comment.
- Prefer named exports.
- Prefer pure functions for transformations.
- Avoid duplicated logic.
- Use clear names.
- Keep files focused.
- Keep components small.
- Do not commit commented-out code.
- Do not commit console debugging.
- Keep dependencies minimal.

---

## OOP / Design Rules

Use OOP only where it genuinely improves clarity.

Prefer TypeScript types, interfaces, discriminated unions, pure functions, and repository abstractions.

Good candidates for classes:

- storage/database wrapper if needed
- repository implementation if it improves testability

Avoid unnecessary class hierarchies.

---

## Dependency Rules

Before adding a dependency, consider:

- Is it actively maintained?
- Is it necessary?
- Does it increase bundle size significantly?
- Can this be done safely with existing tools?

Do not add backend, auth, analytics, or cloud dependencies in the MVP.

---

## GitHub Pages Rules

Ensure app routing and asset paths work on GitHub Pages.

If using Vite, configure `base` correctly for the repository name when deploying.

Document deployment steps in `README.md`.

---

## Instructions for Codex

When using Codex:

1. Inspect repository structure first.
2. Read `AGENTS.md`, `CONSTRAINTS.md`, `DOMAIN_MODEL.md`, `PLANS.md`, `README.md`, and `CONTRIBUTING.md`.
3. Make the smallest useful change.
4. Add or update tests with the change.
5. Run all quality gates.
6. Summarise exactly what changed and what commands passed.
7. Do not introduce backend or account features unless explicitly requested.

---

## Instructions for Claude

When using Claude:

1. Treat this file as system-level project guidance.
2. Preserve the timeline event architecture.
3. Think through data-loss risks before changing storage/import logic.
4. Prefer explicit types and simple designs.
5. Update docs when behaviour changes.
6. Do not over-engineer cloud/account features into the MVP.
7. If uncertain, choose the safer local-only option.

---

## Completion Checklist

Before saying a task is complete, verify:

- app builds
- lint passes
- typecheck passes
- tests pass
- format check passes
- data model remains timeline-based
- local-only privacy model remains intact
- backup/import still works or has not been broken
- README/docs updated if needed
