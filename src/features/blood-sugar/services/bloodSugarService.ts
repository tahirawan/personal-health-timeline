import { fromDateTimeLocalValue } from '../../../shared/lib/date';
import { createId } from '../../../shared/lib/ids';
import type { BloodSugarEvent } from '../../../shared/types/domain';
import type { BloodSugarFormValues } from '../schemas/bloodSugarFormSchema';

export function buildBloodSugarEvent(
  values: BloodSugarFormValues,
  existing?: BloodSugarEvent,
): BloodSugarEvent {
  const now = new Date().toISOString();

  return {
    id: existing?.id ?? createId(),
    type: 'bloodSugar',
    timestamp: fromDateTimeLocalValue(values.timestampLocal),
    data: {
      reading: values.reading,
      unit: 'mg/dL',
      mealRelation: values.mealRelation,
      notes: values.notes,
    },
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}
