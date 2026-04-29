# CONSTRAINTS.md

This file defines hard constraints for the Personal Health Timeline Tracker project.

AI assistants and human contributors must follow these constraints.

---

## Product Constraints

The MVP is a local-first PWA for personal health logging.

The MVP must not include:

- backend database
- user accounts
- login/signup
- admin dashboard
- cloud sync
- remote health-data storage
- analytics/tracking
- advertising

All health data must remain on the user's device/browser unless the user manually exports a backup file.

---

## Privacy Constraints

- Do not send health data to any server.
- Do not add analytics SDKs.
- Do not add error reporting tools that upload user data.
- Do not add third-party health integrations.
- Do not log health data to the console.
- Do not include sample real user data in production builds except generic demo/test data.

---

## Data Model Constraints

The app must be timeline-based.

Do not model the app as only a blood pressure table.

A timeline can contain:

- BloodPressureEvent
- MealEvent
- TabletEvent
- NoteEvent

Reports must use BloodPressureEvent records only.

Timeline UI must show all event types together.

Do not force BP readings to contain meal or tablet fields.

Meal and tablet should be standalone timeline events.

A BP reading may optionally include meal context:

- before breakfast
- after breakfast
- before lunch
- after lunch
- before dinner
- after dinner
- before meal
- after meal
- unrelated

---

## Storage Constraints

Use IndexedDB for MVP local storage.

Do not use localStorage as the primary database for health records.

Do not silently wipe IndexedDB data.

Do not introduce destructive migrations without:

- migration tests
- backup guidance
- clear user confirmation if data may be affected

Request persistent storage where supported, but treat it as best effort.

---

## Backup Constraints

The app must support data backup.

Required:

- export all data as JSON
- import JSON backup
- export BP readings as CSV

Import must validate data before saving.

Import must not silently overwrite existing data.

---

## UX Constraints

The app must work well on Android phones.

- touch-friendly controls
- simple daily logging
- readable timeline
- readable charts
- clear backup/export actions

Most daily entries should be possible in under 10 seconds.

The app must be usable offline after installation/loading.

---

## Medical Safety Constraints

The app records readings only.

Do not provide diagnosis.

Do not provide treatment recommendations.

Do not interpret readings as medical advice.

Do not generate emergency guidance beyond a neutral disclaimer to contact medical professionals or emergency services when concerned.

Include disclaimer:

> This app records health readings only and does not provide medical advice. Always consult a qualified healthcare professional for medical concerns.

---

## Code Quality Constraints

Every meaningful change must keep these passing:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run format:check
```

If scripts do not exist, add them.

No change should knowingly break existing tests unless the tests are being intentionally updated for a documented requirement change.

---

## TypeScript Constraints

- strict mode must be enabled
- avoid `any`
- no unchecked imported data
- validate external/imported data with Zod
- domain models must be explicit

---

## Architecture Constraints

Keep domain logic outside React components.

Use a repository abstraction for IndexedDB operations.

Reports should use pure functions where practical.

Timeline rendering and report aggregation must remain separate.

Smart text parsing must be isolated from storage writes.

---

## Dependency Constraints

Allowed core dependencies:

- React
- Vite
- TypeScript
- Dexie
- Zod
- React Hook Form
- Recharts
- Vitest
- React Testing Library
- Tailwind CSS
- ESLint
- Prettier
- vite-plugin-pwa or equivalent

Do not add heavy dependencies without justification.

Do not add cloud/auth/backend dependencies for MVP.

---

## Deployment Constraints

The app must remain deployable to GitHub Pages as a static app.

Do not introduce server-only features.

Routing and asset paths must work with GitHub Pages.

---

## Documentation Constraints

When changing behaviour, update relevant docs:

- README.md
- DOMAIN_MODEL.md
- PLANS.md
- CONTRIBUTING.md
- AGENTS.md when AI guidance changes
