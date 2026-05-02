import { z } from 'zod';

import { mealRelations } from '../../../shared/types/domain';

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

export const bloodSugarFormSchema = z.object({
  timestampLocal: z.string().min(1, 'Time is required.'),
  reading: z.preprocess(
    (value) => (value === '' || Number.isNaN(value) ? undefined : Number(value)),
    z
      .number({ message: 'Reading is required.' })
      .int('Reading must be a whole number.')
      .min(20, 'Reading looks too low.')
      .max(600, 'Reading looks too high.'),
  ),
  mealRelation: z
    .union([z.enum(mealRelations), z.literal('')])
    .optional()
    .transform((value) => (value === '' ? undefined : value)),
  notes: optionalText,
});

export type BloodSugarFormInput = z.input<typeof bloodSugarFormSchema>;
export type BloodSugarFormValues = z.output<typeof bloodSugarFormSchema>;
