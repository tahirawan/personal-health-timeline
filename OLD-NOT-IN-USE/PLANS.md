# PLANS.md

## Phase 0 - Project Setup

Goal: create a stable React PWA foundation.

Tasks:

- Create Vite React TypeScript app.
- Configure ESLint.
- Configure Prettier.
- Configure Vitest.
- Configure React Testing Library.
- Configure Playwright.
- Configure coverage reports.
- Configure PWA manifest and service worker.
- Configure GitHub Pages deployment.
- Add basic app shell and routing.
- Add quality scripts to `package.json`.

Exit criteria:

- `npm run format`, `lint`, `typecheck`, `test`, `coverage`, and `build` pass.
- App deploys to GitHub Pages.
- App can be installed as a PWA on Android.

## Phase 1 - Local Database and Domain Model

Goal: create safe local persistence.

Tasks:

- Define blood pressure entry types.
- Define meal relation types.
- Define medicine/tablet time fields.
- Create Zod validation schemas.
- Set up IndexedDB using Dexie.
- Create repository methods:
  - create entry
  - update entry
  - delete entry
  - get entry by id
  - list entries by date range
  - list all entries
- Add database migration/versioning strategy.
- Add tests for validation and repository behaviour.

Exit criteria:

- Entries persist after page refresh.
- Invalid entries are rejected.
- Repository tests pass.

## Phase 2 - Entry Form and Entry List

Goal: allow users to record and manage readings.

Tasks:

- Add entry form.
- Add systolic, diastolic, pulse fields.
- Add reading date/time field.
- Add meal relation selector.
- Add meal time field.
- Add tablet time field.
- Add notes field.
- Add entry list sorted by newest first.
- Add edit entry flow.
- Add delete confirmation.
- Add accessible validation messages.
- Add tests for form and list interactions.

Exit criteria:

- User can create, view, edit, and delete entries locally.
- Form is mobile-friendly.
- Tests pass.

## Phase 3 - Reports and Charts

Goal: show useful trends without medical advice.

Tasks:

- Add report range selector: day, week, month, year, all.
- Add line chart for systolic, diastolic, and pulse.
- Add summary statistics:
  - count
  - average systolic
  - average diastolic
  - average pulse
  - highest systolic/diastolic
  - lowest systolic/diastolic
- Add pure aggregation functions.
- Add tests for report grouping and date filtering.

Exit criteria:

- Reports are accurate and tested.
- Charts render on mobile.
- No diagnosis or medical recommendations are shown.

## Phase 4 - Backup and Restore

Goal: reduce risk of local data loss.

Tasks:

- Export JSON backup.
- Export CSV report/data file.
- Import JSON backup.
- Validate imported backup before writing.
- Show import preview and confirmation.
- Avoid duplicate entries using ids or timestamps.
- Add tests for export/import.

Exit criteria:

- User can backup and restore data.
- Invalid backup files are rejected safely.
- Existing data is not overwritten without confirmation.

## Phase 5 - Polish and PWA Hardening

Goal: improve reliability and install experience.

Tasks:

- Request persistent browser storage where supported.
- Add offline-ready UI.
- Add app icon set.
- Add install instructions.
- Add empty/error/loading states.
- Add responsive layout polish.
- Run Lighthouse checks.

Exit criteria:

- App works offline after first load.
- App install experience is clear.
- Data persistence limitations are clearly explained.

## Phase 6 - Future Capacitor Android App

Goal: package the existing React app as Android.

Tasks:

- Add Capacitor.
- Configure Android project.
- Evaluate native SQLite or Preferences for storage.
- Preserve backup/import compatibility.
- Test Android build.
- Prepare Play Store privacy disclosures if publishing.

Exit criteria:

- Android app uses same core React/domain code.
- Local data remains private.
- Backup/import still works.

## Phase 7 - Future iOS App

Goal: package the app for iOS after Android is stable.

Tasks:

- Configure Capacitor iOS.
- Test iOS local storage behaviour.
- Verify accessibility and layout on iPhone.
- Prepare App Store privacy disclosures if publishing.

Exit criteria:

- iOS app shares core code with PWA and Android.
