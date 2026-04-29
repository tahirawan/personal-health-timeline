# TESTING.md

Testing guidance for the Personal Health Timeline Tracker.

---

## Test Philosophy

This app stores personal health records locally. Tests should protect against:

- data loss
- incorrect report calculations
- broken import/export
- invalid data entering storage
- timeline sorting bugs
- broken mobile-first forms

---

## Required Test Commands

```bash
npm run test
npm run typecheck
npm run lint
npm run build
npm run format:check
```

---

## Unit Tests

Required unit tests:

- blood pressure validation
- meal validation
- tablet validation
- timeline event validation
- timeline sorting
- grouping events by local day
- report date filtering
- average calculations
- highest/lowest calculations
- pulse calculations when pulse is optional
- JSON export shape
- JSON import validation
- CSV export formatting
- smart text parsing if implemented

---

## Component Tests

Recommended component tests:

- Add BP form renders required fields
- Add BP form validates systolic/diastolic
- Add BP form allows optional pulse
- Add Meal form saves meal type and description
- Add Tablet form saves tablet event
- Timeline displays mixed event types
- Reports filter changes visible data
- Backup/export button is visible
- Import rejects invalid file data

---

## Smoke Tests

At least one smoke test should cover:

1. add blood pressure reading
2. confirm it appears in timeline
3. confirm it appears in report data

Additional useful smoke test:

1. add meal
2. add tablet
3. confirm both appear in timeline
4. confirm they are not counted as BP readings

---

## Storage Tests

Storage tests should verify:

- create event
- update event
- delete event
- list events by date range
- preserve event type fields
- no accidental deletion during import merge

---

## Import/Export Tests

JSON export/import:

- exports all event types
- imports valid backup
- rejects invalid backup
- handles unknown event type safely
- handles duplicate ids according to chosen policy

CSV export:

- includes BP readings only
- includes timestamp, systolic, diastolic, pulse, relation, notes
- escapes notes safely

---

## Smart Text Parser Tests

If smart text import is implemented, test:

- `09:28 - 120/75 - 74 - After Breakfast`
- `09:23 - Breakfast - egg with avocado sandwich`
- `11:00 - Tablet`
- date headers
- multiple days
- invalid lines
- missing pulse
- BP line with notes
