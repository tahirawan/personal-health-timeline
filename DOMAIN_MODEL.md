# DOMAIN_MODEL.md

This file defines the domain model for the Personal Health Timeline Tracker.

The app is a timeline-based health logger, not only a blood pressure table.

---

## Core Idea

A user records health-related events throughout the day.

All events have a timestamp and appear in a single timeline.

Blood pressure reports are calculated only from blood pressure events.

---

## Base Timeline Event

Every event must include:

```ts
type TimelineEventBase = {
  id: string;
  timestamp: string; // ISO datetime
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
};
```

---

## BloodPressureEvent

```ts
type BloodPressureEvent = TimelineEventBase & {
  type: 'bloodPressure';
  systolic: number;
  diastolic: number;
  pulse?: number;
  mealRelation?: MealRelation;
  notes?: string;
};
```

Rules:

- systolic is required
- diastolic is required
- pulse is optional
- mealRelation is optional
- notes are optional

Examples:

```text
09:28 - 120/75 - 74 - After Breakfast
21:44 - 127/87 - 74
14:51 - 135/90
```

---

## MealEvent

```ts
type MealEvent = TimelineEventBase & {
  type: 'meal';
  mealType: MealType;
  description?: string;
};
```

Examples:

```text
09:23 - Breakfast - egg with avocado sandwich
14:10 - Lunch (Lamb burger)
```

---

## TabletEvent

```ts
type TabletEvent = TimelineEventBase & {
  type: 'tablet';
  medicationName?: string;
  dosage?: string;
  notes?: string;
};
```

Examples:

```text
11:00 - Tablet
12:47 - Tablet
```

---

## NoteEvent

```ts
type NoteEvent = TimelineEventBase & {
  type: 'note';
  text: string;
};
```

Notes are future-ready and can be used for general observations.

---

## Union Type

```ts
type TimelineEvent = BloodPressureEvent | MealEvent | TabletEvent | NoteEvent;
```

Use this discriminated union throughout the app.

---

## MealType

```ts
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
```

---

## MealRelation

```ts
type MealRelation =
  | 'before_breakfast'
  | 'after_breakfast'
  | 'before_lunch'
  | 'after_lunch'
  | 'before_dinner'
  | 'after_dinner'
  | 'before_meal'
  | 'after_meal'
  | 'unrelated';
```

Meal relation belongs only to BP readings as optional context.

Do not use meal relation as a replacement for actual MealEvent records.

---

## Storage Shape

Recommended IndexedDB table:

```ts
timelineEvents;
```

Indexes:

- id
- type
- timestamp
- createdAt

Dexie example:

```ts
this.version(1).stores({
  timelineEvents: 'id, type, timestamp, createdAt',
});
```

---

## Reporting Model

Reports should filter:

```ts
events.filter((event) => event.type === 'bloodPressure');
```

Reports should not count meals, tablets, or notes as readings.

---

## Report Metrics

Supported metrics:

- average systolic
- average diastolic
- average pulse where present
- highest systolic
- highest diastolic
- lowest systolic
- lowest diastolic
- reading count

---

## Date Handling Rules

- Store timestamps as ISO datetime strings.
- Display using the user's local timezone.
- Group timeline events by local calendar date.
- Do not store only time without date.
- When parsing manual logs, combine the date header with each time line.

---

## Validation Rules

Use Zod schemas for imported/user-entered data.

Suggested BP validation:

- systolic: integer, reasonable positive range
- diastolic: integer, reasonable positive range
- pulse: optional integer, reasonable positive range
- timestamp: valid datetime

Avoid hardcoding overly strict medical ranges that reject legitimate unusual readings. Validate for data shape and obvious input mistakes only.

---

## Smart Text Import Model

Manual text import should parse daily sections:

```text
2026-04-29
11:00 - Tablet
09:28 - 120/75 - 74 - After Breakfast
09:23 - Breakfast - egg with avocado sandwich
```

Parsing should produce draft TimelineEvent records.

The user should preview parsed records before saving.

Parser should be tolerant but safe.

Invalid/unrecognised lines should be shown to the user instead of silently ignored.

---

## Data Migration Rules

When changing this model:

1. Add migration logic.
2. Add migration tests.
3. Preserve existing data.
4. Update backup import/export schema.
5. Update this file.
