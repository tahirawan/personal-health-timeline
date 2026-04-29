# PLANS.md

This file defines the implementation plan and roadmap.

---

## Product Name

Working name: Personal Health Timeline Tracker

The app may later be renamed.

---

## Vision

Create a simple Android-first PWA that helps the user record blood pressure readings, meals, tablets, and notes in a daily timeline, then view blood pressure trends over time.

The MVP must be private, local-first, offline-capable, and deployable to GitHub Pages.

---

## MVP Scope

Phase 1 must include:

- React + Vite + TypeScript app scaffold
- PWA setup
- GitHub Pages deployment readiness
- IndexedDB storage
- timeline event domain model
- add blood pressure reading
- add meal
- add tablet
- add note if practical
- daily timeline view
- edit events
- delete events with confirmation
- reports based on BP readings
- line chart for systolic, diastolic, and pulse
- JSON export
- JSON import
- CSV export for BP readings
- privacy/disclaimer settings page
- tests for critical logic

Implemented in the initial scaffold:

- React + Vite + TypeScript app scaffold
- PWA setup
- GitHub Pages deployment readiness
- IndexedDB storage
- timeline event domain model
- add blood pressure reading
- add meal
- add tablet
- add note
- daily timeline view
- edit events
- delete events with confirmation
- reports based on BP readings
- line chart for systolic, diastolic, and pulse
- JSON export
- JSON import with merge by default
- CSV export for BP readings
- privacy/disclaimer settings page
- smart text import from manual logs
- import preview for JSON and smart text
- tests for critical logic and smoke flow

---

## Phase 2

Add convenience and polish:

- smart text import from manual logs
- import preview and correction UI
- medication name history
- meal description history
- custom date range reports
- better chart interactions
- install prompt/help screen
- backup reminders
- dark mode if not already present
- Tailwind CSS migration after the current plain-CSS visual system stabilises

Smart text import and basic import preview are present. Phase 2 should focus on correction/editing of parsed imports, history suggestions, and polish.

---

## Phase 3

Possible future native app path:

- wrap the React app with Capacitor
- Android app build
- native local database/storage where appropriate
- local notification reminders if needed
- optional iOS support later

---

## Phase 4

Possible future cloud/account path:

- user accounts
- secure cloud sync
- multi-device backup
- role-based admin only if explicitly required

This is not part of the MVP.

---

## Suggested Implementation Order

1. Scaffold or verify React + Vite + TypeScript setup.
2. Add lint, format, typecheck, test, and build scripts.
3. Add core folder structure.
4. Define domain types and Zod schemas.
5. Add Dexie database and repository layer.
6. Build Add BP form.
7. Build Add Meal form.
8. Build Add Tablet form.
9. Build timeline view.
10. Add edit/delete flows.
11. Add report aggregation functions.
12. Add chart UI.
13. Add JSON export/import.
14. Add CSV export.
15. Add PWA manifest/service worker.
16. Add GitHub Pages deployment docs/workflow.
17. Add smart text import if time allows.
18. Improve tests and accessibility.

---

## MVP Screens

Recommended screens:

- Home / Today
- Add BP Reading
- Add Meal
- Add Tablet
- Timeline / History
- Reports
- Backup & Restore
- Settings / Privacy

---

## Home Screen Requirements

Home should show:

- quick action buttons
- today's timeline
- today summary
- recent trend preview if practical

---

## Timeline Requirements

Timeline must:

- group by date
- show all event types
- sort by timestamp, newest first by default
- allow edit/delete
- use clear icons or labels

Example display:

```text
2026-04-29
11:00  Tablet
09:28  BP 120/75 pulse 74 After Breakfast
09:23  Breakfast - egg with avocado sandwich
```

---

## Reports Requirements

Reports must support:

- Today
- 7 days
- 30 days
- Monthly
- Yearly
- Overall

Reports must include:

- line chart
- summary cards
- reading count

Reports calculate from blood pressure readings only.

---

## Backup Requirements

Backup and restore must be available before the app is considered complete.

This is important because local browser/PWA storage can be lost if the browser/app data is cleared or the device is lost.

---

## Success Criteria

The MVP is successful when the user can:

1. install/open the app on Android
2. record BP, meal, and tablet events quickly
3. view daily timeline
4. view trend chart/report
5. export backup
6. import backup
7. use the app offline

---

## Out of Scope for MVP

- accounts
- cloud sync
- admin access
- sharing data with doctors
- push notifications
- Apple App Store release
- Google Play Store release
- AI medical interpretation
- diagnosis or treatment advice
