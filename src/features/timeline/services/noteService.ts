import { fromDateTimeLocalValue } from '../../../shared/lib/date';
import { createId } from '../../../shared/lib/ids';
import type { NoteEvent } from '../../../shared/types/domain';
import type { NoteFormValues } from '../schemas/noteFormSchema';

export function buildNoteEvent(values: NoteFormValues, existing?: NoteEvent): NoteEvent {
  const now = new Date().toISOString();

  return {
    id: existing?.id ?? createId(),
    type: 'note',
    timestamp: fromDateTimeLocalValue(values.timestampLocal),
    data: {
      text: values.text,
    },
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}
