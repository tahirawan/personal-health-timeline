export const timelineEventTypes = [
  'bloodPressure',
  'bloodSugar',
  'meal',
  'tablet',
  'note',
] as const;

export const mealRelations = [
  'fasting',
  'before_breakfast',
  'after_breakfast',
  'before_lunch',
  'after_lunch',
  'before_dinner',
  'after_dinner',
  'before_meal',
  'after_meal',
  'unrelated',
] as const;

export const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'other'] as const;

export type TimelineEventType = (typeof timelineEventTypes)[number];
export type MealRelation = (typeof mealRelations)[number];
export type MealType = (typeof mealTypes)[number];

export type TimelineEventBase = {
  id: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
};

// ── Named payload types ─────────────────────────────────────────────────────

export type BloodPressureData = {
  systolic: number;
  diastolic: number;
  pulse?: number;
  mealRelation?: MealRelation;
  notes?: string;
};

export type BloodSugarData = {
  reading: number;
  unit?: 'mg/dL' | 'mmol/L';
  mealRelation?: MealRelation;
  notes?: string;
};

export type MealData = {
  mealType: MealType;
  description?: string;
};

export type TabletData = {
  medicationName?: string;
  dosage?: string;
  notes?: string;
};

export type NoteData = {
  text: string;
};

// ── Event types ─────────────────────────────────────────────────────────────

export type BloodPressureEvent = TimelineEventBase & {
  type: 'bloodPressure';
  data: BloodPressureData;
};

export type BloodSugarEvent = TimelineEventBase & {
  type: 'bloodSugar';
  data: BloodSugarData;
};

export type MealEvent = TimelineEventBase & {
  type: 'meal';
  data: MealData;
};

export type TabletEvent = TimelineEventBase & {
  type: 'tablet';
  data: TabletData;
};

export type NoteEvent = TimelineEventBase & {
  type: 'note';
  data: NoteData;
};

export type TimelineEvent =
  | BloodPressureEvent
  | BloodSugarEvent
  | MealEvent
  | TabletEvent
  | NoteEvent;
