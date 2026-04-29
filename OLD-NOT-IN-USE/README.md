# Blood Pressure Tracker PWA - AI Development Guide

This folder contains the project rules, plans, constraints, and AI-agent instructions for building a blood pressure tracking app as a React PWA first, with a future path to Android and iOS through Capacitor.

## Product Goal

Build a privacy-first personal blood pressure tracker that runs on Android as an installable PWA from GitHub Pages.

Initial storage is local-only using IndexedDB. No cloud account, backend, admin dashboard, or shared user data is included in the MVP.

## MVP Features

- Add blood pressure readings: systolic, diastolic, pulse.
- Record date and time of reading.
- Record relation to meal: before/after breakfast, lunch, dinner, snack, other.
- Record meal time.
- Record tablet/medicine time.
- Optional notes.
- View entries in list/table form.
- Edit and delete local entries with confirmation.
- View reports by daily, weekly, monthly, yearly, and all-time ranges.
- Reports and charts are generated from blood pressure readings only.
- Meals and tablets are shown in timeline context.
- Display systolic, diastolic, and pulse trends using line charts.
- Export backup as JSON and CSV.
- Import/restore backup from JSON.
- Work offline after first load.
- Be installable on Android as a PWA.

## Event Timeline

The app records multiple health events:

- Blood pressure readings
- Meals
- Tablet / medication times
- Notes

All events appear in one chronological timeline.

## Suggested Stack

- React
- Vite
- TypeScript
- PWA support via `vite-plugin-pwa`
- IndexedDB via Dexie.js
- Charts via Recharts
- Forms via React Hook Form + Zod
- Tests via Vitest + React Testing Library
- End-to-end tests via Playwright
- Formatting via Prettier
- Linting via ESLint
- Type checking via TypeScript
- Future native app wrapper via Capacitor

## Documentation Files

- `AGENTS.md` - shared rules for all AI coding agents.
- `CLAUDE.md` - Claude-specific guidance.
- `CODEX.md` - Codex-specific guidance.
- `PLANS.md` - phased build plan.
- `CONSTRAINTS.md` - non-negotiable product and technical constraints.
- `CONTRIBUTING.md` - contribution workflow and quality gates.
- `ARCHITECTURE.md` - proposed application architecture.
- `DATA_MODEL.md` - local database schema and domain model.
- `TESTING.md` - testing strategy and coverage expectations.
- `SECURITY_PRIVACY.md` - privacy, security, and local-data rules.
- `RELEASE_CHECKLIST.md` - release and deployment checklist.

## Golden Rule

Every change must keep the app working. Do not break existing features. Run linting, formatting, type checking, tests, and coverage checks before considering work complete.
