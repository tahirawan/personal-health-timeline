import { z } from 'zod';

import { mealTypes } from '../../../shared/types/domain';

export const mealFormSchema = z.object({
  timestampLocal: z.string().min(1, 'Time is required.'),
  mealType: z.enum(mealTypes),
  description: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export type MealFormInput = z.input<typeof mealFormSchema>;
export type MealFormValues = z.output<typeof mealFormSchema>;
