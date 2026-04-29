# DATA_MODEL.md

## Blood Pressure Entry

Initial TypeScript shape:

```ts
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other' | 'none';

export type MealRelation = 'before' | 'after' | 'not_applicable' | 'unknown';

export interface BloodPressureEntry {
  id: string;
  checkedAt: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  mealType?: MealType;
  mealRelation?: MealRelation;
  mealTime?: string;
  tabletTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Field Rules

### `id`

- Unique string.
- Use `crypto.randomUUID()` where available.

### `checkedAt`

- Required.
- ISO 8601 datetime string.
- Represents when blood pressure was checked.

### `systolic`

- Required.
- Integer.
- Suggested validation range: 40 to 300.

### `diastolic`

- Required.
- Integer.
- Suggested validation range: 30 to 200.

### `pulse`

- Optional.
- Integer.
- Suggested validation range: 20 to 250.

### `mealType`

- Optional.
- Use known options first.
- Allow `other` for flexibility.

### `mealRelation`

- Optional.
- Indicates whether reading was before or after the selected meal.

### `mealTime`

- Optional ISO 8601 datetime string.

### `tabletTime`

- Optional ISO 8601 datetime string.

### `notes`

- Optional plain text.
- Should be stored locally only.

## IndexedDB Schema

Suggested Dexie schema:

```ts
db.version(1).stores({
  bloodPressureEntries:
    'id, checkedAt, createdAt, updatedAt, systolic, diastolic, pulse, mealType, mealRelation',
});
```

## Backup File Format

JSON backup shape:

```ts
export interface BackupFileV1 {
  schemaVersion: 1;
  exportedAt: string;
  appName: 'blood-pressure-tracker';
  entries: BloodPressureEntry[];
}
```

## CSV Export Columns

Suggested columns:

```text
id,checkedAt,systolic,diastolic,pulse,mealType,mealRelation,mealTime,tabletTime,notes,createdAt,updatedAt
```

## Migration Rules

- Never silently discard user data.
- Add new optional fields instead of changing existing meanings.
- Keep backup import compatible with old schema versions where practical.
- Add migration tests whenever database schema changes.
