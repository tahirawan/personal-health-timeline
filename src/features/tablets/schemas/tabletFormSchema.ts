import { z } from 'zod';

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

export const tabletFormSchema = z.object({
  timestampLocal: z.string().min(1, 'Time is required.'),
  medicationName: optionalText,
  dosage: optionalText,
  notes: optionalText,
});

export type TabletFormInput = z.input<typeof tabletFormSchema>;
export type TabletFormValues = z.output<typeof tabletFormSchema>;
