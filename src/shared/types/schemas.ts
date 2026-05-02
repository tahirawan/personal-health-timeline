import { z } from 'zod';

import { isValidIsoDateTime } from '../lib/date';
import { mealRelations, mealTypes } from './domain';

const isoDateTimeSchema = z.string().refine(isValidIsoDateTime, {
  message: 'Timestamp must be a valid ISO datetime.',
});

const baseEventSchema = {
  id: z.string().min(1),
  timestamp: isoDateTimeSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
};

const optionalTrimmedString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

export const bloodPressureEventSchema = z.object({
  ...baseEventSchema,
  type: z.literal('bloodPressure'),
  data: z.object({
    systolic: z.number().int().min(40).max(300),
    diastolic: z.number().int().min(30).max(200),
    pulse: z.number().int().min(30).max(220).optional(),
    mealRelation: z.enum(mealRelations).optional(),
    notes: optionalTrimmedString,
  }),
});

export const bloodSugarEventSchema = z.object({
  ...baseEventSchema,
  type: z.literal('bloodSugar'),
  data: z.object({
    reading: z.number().int().min(20).max(600),
    unit: z.enum(['mg/dL', 'mmol/L']).optional(),
    mealRelation: z.enum(mealRelations).optional(),
    notes: optionalTrimmedString,
  }),
});

export const mealEventSchema = z.object({
  ...baseEventSchema,
  type: z.literal('meal'),
  data: z.object({
    mealType: z.enum(mealTypes),
    description: optionalTrimmedString,
  }),
});

export const tabletEventSchema = z.object({
  ...baseEventSchema,
  type: z.literal('tablet'),
  data: z.object({
    medicationName: optionalTrimmedString,
    dosage: optionalTrimmedString,
    notes: optionalTrimmedString,
  }),
});

export const noteEventSchema = z.object({
  ...baseEventSchema,
  type: z.literal('note'),
  data: z.object({
    text: z.string().trim().min(1),
  }),
});

export const timelineEventSchema = z.discriminatedUnion('type', [
  bloodPressureEventSchema,
  bloodSugarEventSchema,
  mealEventSchema,
  tabletEventSchema,
  noteEventSchema,
]);

export const backupFileSchema = z.object({
  version: z.literal(1),
  exportedAt: isoDateTimeSchema,
  events: z.array(timelineEventSchema),
});
