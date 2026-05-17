# Personal Health Timeline Tracker

Android-first PWA for recording blood pressure readings, blood sugar readings, meals, medicine, and notes in a private local timeline.

The app is designed to be hosted on GitHub Pages and installed on Android as a Progressive Web App.

---

## Purpose

This app helps record daily health events such as:

- blood pressure readings
- blood sugar readings
- pulse
- meal times and food notes
- tablet / medication times
- general notes

It also provides configurable reports and charts for blood pressure and blood sugar trends.

---

## Current MVP Direction

This is a local-first app.

For the MVP:

- no accounts
- no backend
- no cloud sync
- no admin panel
- no remote database
- no analytics

All health timeline data is stored locally on the user's device/browser using IndexedDB.
Local UI preferences, such as enabled event types, are stored in browser local storage.

The initial React/Vite MVP scaffold is in place with:

- timeline-based event logging for BP readings, blood sugar readings, meals, tablets, and notes
- local IndexedDB storage through a repository layer
- Android-first forms behind a floating add menu
- today timeline, full timeline, reports, and charts
- configurable feature visibility for readings, meals, medicine, and notes
- JSON backup export/import with merge by default
- CSV export for BP readings
- smart text import with preview
- PWA manifest and service worker generation
- GitHub Pages workflow

---

## Example Logging Pattern

The app is based on this real manual logging style:

```text
2026-04-29
11:00 - Tablet
09:28 - 120/75 - 74 - After Breakfast
09:23 - Breakfast - egg with avocado sandwich

2026-04-28
21:44 - 127/87 - 74
14:10 - Lunch (Lamb burger)
13:47 - 137/92 - 68
13:43 - 136/92 - 64
12:47 - Tablet
09:23 - 138/83 - 76 Before breakfast - chappati with omelette
```

The app turns this style into a structured timeline.

---

## Features

MVP features:

- Add blood pressure reading
- Add blood sugar reading
- Add meal
- Add tablet
- Add note
- Daily timeline
- History view
- Floating add menu with settings-controlled options
- Timeline multi-filtering and 7/30/60 day range controls with older months collapsed
- Edit/delete events
- Reports and expandable charts
- JSON backup export
- JSON backup file/paste import
- CSV export for BP readings
- Smart text import from manual logs
- Offline support
- Android installable PWA
- GitHub Pages deployment

---

## Event Timeline

The app records multiple health events in one chronological timeline:

- Blood pressure readings
- Blood sugar readings
- Meals
- Tablet / medication events
- Notes

Reports and charts are generated from enabled reading types.

Meals and tablets are shown in timeline context.

---

## Recommended Tech Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- IndexedDB with Dexie
- Zod
- React Hook Form
- Recharts
- Vitest
- React Testing Library
- ESLint
- Prettier
- PWA support via vite-plugin-pwa or equivalent

Styling is Tailwind CSS v4 through the official Vite plugin. The current UI keeps semantic component class names, with the visual system defined in Tailwind layers in `src/app/App.css`.
`src/app/App.css` is intentionally limited to the Tailwind import and theme tokens. App styling is applied with Tailwind utility classes in React, centralized in `src/shared/lib/uiStyles.ts` where repeated utility groups are needed.

---

## Development

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

The app uses Vite. For local development the base path is `/`.

Run checks:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run format:check
```

---

## Quality Requirements

Every meaningful change should keep these passing:

- lint
- typecheck
- tests
- production build
- format check

Important logic should have tests.

---

## Data Storage

The app stores timeline records locally using IndexedDB.

The user does not choose a file path for normal storage. The browser/PWA manages storage internally for this app.

Feature visibility settings are local preferences stored in browser local storage.

Because browser/PWA data can still be lost if app/browser data is cleared or the device is lost, backup/export is required.

---

## Backup and Restore

The app should support:

- JSON export of all timeline data
- JSON file or pasted JSON import/restore with merge by default and explicit confirmation before replacement
- CSV export of BP readings
- smart text import for manual logs such as `09:28 - 120/75 - 74 - After Breakfast`

Backup and import controls live on a dedicated Backup & import page. Reports and Settings link to that page, while the Reports screen keeps only a compact export/import link.

Users should regularly export backups if they rely on the app for long-term history.

---

## Privacy

MVP privacy model:

- data stays on device
- no remote database
- no login
- no tracking
- no analytics

Nobody can view the user's data from GitHub Pages because GitHub Pages only hosts the static app files, not the user's local IndexedDB data.

---

## Medical Disclaimer

This app records health readings only and does not provide medical advice. Always consult a qualified healthcare professional for medical concerns.

---

## GitHub Pages Deployment

The app is deployable as a static site.

The included Vite config uses `/` locally and `/blood-pressure/` when `GITHUB_PAGES=true`.

Build locally for GitHub Pages:

```bash
GITHUB_PAGES=true npm run build
```

The included GitHub Actions workflow runs the quality gates and publishes `dist` to GitHub Pages.

---

## Documentation

Important project guidance files:

- `AGENTS.md` - instructions for AI coding assistants
- `CONSTRAINTS.md` - hard project constraints
- `DOMAIN_MODEL.md` - timeline event domain model
- `PLANS.md` - roadmap and implementation plan
- `CONTRIBUTING.md` - contribution rules
- `CODEX_PROMPT.md` - starter prompt for Codex
- `CLAUDE_PROMPT.md` - starter prompt for Claude
