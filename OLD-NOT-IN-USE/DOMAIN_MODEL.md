# Domain Model

## TimelineEvent

Base:

- id
- type
- timestamp

## BloodPressureEvent

- systolic
- diastolic
- pulse?

## MealEvent

- mealType
- description?

## TabletEvent

- medicineName?
- dosage?

## NoteEvent

- text

## Rules

- All events sorted by timestamp.
- Reports only use BloodPressureEvent.
