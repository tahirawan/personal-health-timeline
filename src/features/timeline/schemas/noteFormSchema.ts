import { z } from 'zod';

export const noteFormSchema = z.object({
  timestampLocal: z.string().min(1, 'Time is required.'),
  text: z.string().trim().min(1, 'Note text is required.'),
});

export type NoteFormValues = z.infer<typeof noteFormSchema>;
