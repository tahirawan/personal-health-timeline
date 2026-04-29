# CONSTRAINTS.md

## Product Constraints

- The MVP is a local-first personal blood pressure tracker.
- The app must be usable on Android as a PWA.
- The app must be hostable on GitHub Pages.
- The MVP must not require login.
- The MVP must not require a backend.
- The MVP must not sync data to cloud storage.
- Users must be able to export and import their own backup files.
- The app must support extremely fast daily logging on mobile.
- Most entries should be completable in under 10 seconds.

## Data Constraints

Do not force BP readings to contain meal or tablet fields.

Meal and tablet should be standalone timeline events.

BP reading may optionally include:

- before breakfast
- after breakfast
- before lunch
- after lunch
- before dinner
- after dinner
- unrelated

## Privacy Constraints

- Health data remains on the user's device unless they explicitly export it.
- Do not transmit health data to any server.
- Do not use analytics, telemetry, crash reporting, or remote logging in the MVP.
- Do not include third-party tracking scripts.
- Do not put health data in URLs, query parameters, local logs, or GitHub issues.

## Storage Constraints

- Use IndexedDB for main entry storage.
- Do not use localStorage for main health records.
- Use localStorage only for harmless UI preferences, if needed.
- Request persistent storage where supported.
- Provide backup export/import because browser-managed storage can still be cleared.

## Platform Constraints

- Must work in current Android Chrome.
- Must be responsive on small screens.
- Must work offline after first successful load.
- Must remain compatible with future Capacitor wrapping.

## Technical Constraints

- Use React + Vite + TypeScript.
- Use strict TypeScript settings.
- Keep all domain logic testable outside React components.
- Use ESLint and Prettier.
- Use Vitest and React Testing Library.
- Use Playwright for key end-to-end flows.
- Maintain meaningful test coverage.

## Medical Constraints

- The app records and reports user-entered data only.
- The app must not diagnose conditions.
- The app must not provide treatment or medication advice.
- The app must not tell the user to start, stop, or change medicine.
- The app may show neutral trend charts and raw values.

## Accessibility Constraints

- All form fields require labels.
- Interactive controls must be keyboard accessible.
- Use sufficient contrast.
- Do not rely on colour alone to communicate meaning.
- Use clear validation messages.

## Dependency Constraints

Preferred dependencies:

- Dexie.js for IndexedDB.
- Recharts for charts.
- Zod for validation.
- React Hook Form for forms.
- date-fns for date operations.

Avoid:

- Heavy UI frameworks unless explicitly chosen.
- Dependencies that require a backend for MVP functionality.
- Dependencies that collect analytics or telemetry by default.
