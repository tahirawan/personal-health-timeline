# AGENTS.md

This file defines global rules for all AI assistants, including Codex, Claude, and any future coding agents working on this repository.

## Project Summary

This is a privacy-first blood pressure tracking app.

The first version is a React + Vite + TypeScript PWA hosted on GitHub Pages. It stores user data locally on the device using IndexedDB. It must work well on Android browsers and as an installed PWA.

Future versions may wrap the same React codebase using Capacitor for Android and iOS.

## Real User Logging Pattern (Source of Truth)

The user currently records data as a chronological daily timeline.

Examples:

2026-04-29
11:00 - Tablet
09:28 - 120/75 - 74 - After Breakfast
09:23 - Breakfast - egg with avocado sandwich

2026-04-28
21:44 - 127/87 - 74
14:10 - Lunch (Lamb burger)
12:47 - Tablet

The application must model data as timeline events, not only blood pressure rows.

## Non-Negotiable Rules

1. Never add a backend, cloud sync, analytics, telemetry, or remote data transmission unless explicitly requested.
2. Never store personal health data in GitHub, URLs, logs, analytics, error reporting services, or remote APIs.
3. Never make a change that knowingly breaks existing functionality.
4. Every meaningful change must include or update tests.
5. Every change must pass formatting, linting, type checking, tests, and coverage checks.
6. Prefer simple, maintainable code over clever abstractions.
7. Use TypeScript strictly. Avoid `any` unless justified in a code comment.
8. Keep business rules out of UI components where practical.
9. Keep data access isolated behind repository/service modules.
10. Do not introduce large dependencies without documenting why they are needed.

## Required Quality Commands

Agents must run or update these commands whenever applicable:

```bash
npm run format
npm run lint
npm run typecheck
npm run test
npm run coverage
npm run build
```

If a command does not exist yet, add it to `package.json` as part of the setup.

## Code Structure Rules

Use a feature-oriented structure:

```text
src/
  app/
  components/
  features/
    entries/
    reports/
    backup/
    settings/
  db/
  domain/
  hooks/
  lib/
  routes/
  styles/
  test/
```

Keep files focused and small. Prefer folders with clear ownership over large generic files.

## Object-Oriented and Domain Design Rules

Use OOP concepts where they improve clarity, but do not force unnecessary classes.

Required principles:

- Encapsulation: hide IndexedDB details behind database/repository modules.
- Single Responsibility: each module should have one clear reason to change.
- Dependency Inversion: UI should depend on interfaces or service functions, not raw database implementation.
- Clear domain types: use explicit types for readings, meals, medicine events, report ranges, and backup files.
- Validation: validate all user input at the boundary using schemas.

Acceptable patterns:

- Domain models as TypeScript types/interfaces.
- Repository classes or repository objects for persistence.
- Service functions for report aggregation and backup import/export.
- Pure functions for calculations.

Avoid:

- God components.
- Business logic buried in JSX.
- Direct IndexedDB calls inside UI components.
- Global mutable state unless clearly justified.

## Data Safety Rules

Blood pressure entries are personal health data. Treat all data as sensitive.

- Store entries only in IndexedDB for the MVP.
- Do not send entries to any network endpoint.
- Do not print entries to console logs except in explicit local debugging that is removed before commit.
- Provide export/import backup features.
- Deleting entries must require user confirmation.
- Importing backup data must validate schema before writing to the database.

## UI/UX Rules

- Mobile-first design.
- Forms must be easy to use on Android.
- Use semantic HTML and accessible labels.
- Validate input clearly and politely.
- Avoid medical interpretation or diagnosis.
- Reports should show trends, not medical advice.
- Use clear empty states and error states.

## Medical Safety Rules

This app records data only. It must not diagnose, prescribe, or recommend treatment.

Include a suitable disclaimer in the app, such as:

> This app is for personal tracking only and does not provide medical advice. Contact a healthcare professional for diagnosis, medication, or treatment decisions.

## Timeline Event Types

Use discriminated unions or equivalent typed models.

- BloodPressureEvent
- MealEvent
- TabletEvent
- NoteEvent

Reports must calculate from BloodPressureEvent only.
Timeline UI must show all event types together.

## Git and Change Rules

Before modifying code:

1. Understand the current architecture.
2. Make the smallest safe change.
3. Add or update tests.
4. Run quality commands.
5. Update docs if behaviour, setup, or architecture changes.

## Commit Style

Use conventional commits where possible:

```text
feat: add blood pressure entry form
fix: correct weekly report date grouping
test: add import validation tests
docs: update backup instructions
refactor: isolate report aggregation logic
```

## Definition of Done

A task is done only when:

- The requested behaviour works.
- Existing behaviour is not broken.
- Tests cover new or changed logic.
- Lint, format, typecheck, tests, coverage, and build pass.
- Relevant docs are updated.
- No sensitive data is logged or transmitted.
