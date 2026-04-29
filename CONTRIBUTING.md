# CONTRIBUTING.md

Thank you for contributing to this project.

This app handles personal health records, so changes must be careful, tested, and privacy-preserving.

---

## Before You Start

Read these files:

- AGENTS.md
- CONSTRAINTS.md
- DOMAIN_MODEL.md
- PLANS.md
- README.md

AI coding assistants must follow the same rules as human contributors.

---

## Development Setup

Install dependencies:

```bash
npm install
```

Run local development server:

```bash
npm run dev
```

---

## Required Checks

Before opening or completing a change, run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run format:check
```

All checks should pass.

If a script is missing, add it.

---

## Coding Standards

- Use TypeScript strict mode.
- Avoid `any`.
- Keep components small.
- Keep domain logic outside React components.
- Prefer pure functions for calculations.
- Use Zod for validation.
- Use repository functions for storage access.
- Do not access IndexedDB directly from UI components.
- Use clear, descriptive names.
- Keep changes focused.

---

## Timeline Architecture Rules

Preserve the timeline event architecture.

Do not convert the app into a BP-only schema.

A day can include:

- BP readings
- Meals
- Tablets
- Notes

Reports are calculated from BP readings only.

Timeline shows all event types.

New event types must be added in an extensible way.

---

## Privacy Rules

Do not add:

- analytics
- tracking scripts
- remote logging
- cloud storage
- authentication
- backend APIs

unless explicitly requested in a future phase.

Never send health data outside the device in the MVP.

---

## Storage Rules

Storage changes require extra care.

When modifying storage:

- preserve existing data
- write migration tests
- update backup/export logic
- update import validation
- update DOMAIN_MODEL.md

Never silently delete user records.

---

## Import/Export Rules

Import logic must validate data before saving.

Export logic must include all necessary fields to restore the timeline.

CSV export may include only BP readings.

JSON export must include all event types.

---

## Testing Guidance

Add tests when changing:

- validation
- calculations
- date grouping
- storage logic
- import/export
- smart text parsing
- forms
- reports

Critical tests:

- user can add BP reading
- user can add meal
- user can add tablet
- timeline sorts correctly
- reports include BP only
- backup import rejects invalid data

---

## UI Guidance

The app is Android-first.

Prefer:

- large buttons
- simple forms
- sensible defaults
- minimal typing
- readable charts
- clear backup actions

Most daily entries should be possible in under 10 seconds.

---

## Medical Disclaimer

Do not add medical advice.

Keep the app focused on recording and visualising readings.

Any health-related text should be neutral and include a disclaimer where appropriate.

---

## Pull Request Checklist

Before completing a change:

- [ ] Feature works locally
- [ ] Lint passes
- [ ] Typecheck passes
- [ ] Tests pass
- [ ] Build passes
- [ ] Format check passes
- [ ] Docs updated if behaviour changed
- [ ] No privacy regression
- [ ] No data-loss risk introduced
- [ ] Timeline architecture preserved
