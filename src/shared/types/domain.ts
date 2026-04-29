export const timelineEventTypes = ['bloodPressure', 'meal', 'tablet', 'note'] as const;

export const mealRelations = [
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

export type BloodPressureEvent = TimelineEventBase & {
  type: 'bloodPressure';
  systolic: number;
  diastolic: number;
  pulse?: number;
  mealRelation?: MealRelation;
  notes?: string;
};

export type MealEvent = TimelineEventBase & {
  type: 'meal';
  mealType: MealType;
  description?: string;
};

export type TabletEvent = TimelineEventBase & {
  type: 'tablet';
  medicationName?: string;
  dosage?: string;
  notes?: string;
};

export type NoteEvent = TimelineEventBase & {
  type: 'note';
  text: string;
};

export type TimelineEvent = BloodPressureEvent | MealEvent | TabletEvent | NoteEvent;

export type TimelineEventDraft =
  | Omit<BloodPressureEvent, keyof TimelineEventBase>
  | Omit<MealEvent, keyof TimelineEventBase>
  | Omit<TabletEvent, keyof TimelineEventBase>
  | Omit<NoteEvent, keyof TimelineEventBase>;
