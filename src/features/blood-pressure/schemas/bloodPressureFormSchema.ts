import { z } from 'zod';

import { mealRelations } from '../../../shared/types/domain';

const requiredInteger = (label: string, min: number, max: number) =>
  z.preprocess(
    (value) => (value === '' ? undefined : Number(value)),
    z
      .number({ error: `${label} is required.` })
      .int(`${label} must be a whole number.`)
      .min(min, `${label} looks too low.`)
      .max(max, `${label} looks too high.`),
  );

const optionalInteger = (label: string, min: number, max: number) =>
  z.preprocess(
    (value) => (value === '' || Number.isNaN(value) ? undefined : Number(value)),
    z
      .number()
      .int(`${label} must be a whole number.`)
      .min(min, `${label} looks too low.`)
      .max(max, `${label} looks too high.`)
      .optional(),
  );

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

export const bloodPressureFormSchema = z.object({
  timestampLocal: z.string().min(1, 'Time is required.'),
  systolic: requiredInteger('Systolic', 40, 300),
  diastolic: requiredInteger('Diastolic', 30, 200),
  pulse: optionalInteger('Pulse', 30, 220),
  mealRelation: z
    .union([z.enum(mealRelations), z.literal('')])
    .optional()
    .transform((value) => (value === '' ? undefined : value)),
  notes: optionalText,
});

export type BloodPressureFormInput = z.input<typeof bloodPressureFormSchema>;
export type BloodPressureFormValues = z.output<typeof bloodPressureFormSchema>;
