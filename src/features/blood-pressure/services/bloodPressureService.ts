import { fromDateTimeLocalValue } from '../../../shared/lib/date';
import { createId } from '../../../shared/lib/ids';
import type { BloodPressureEvent } from '../../../shared/types/domain';
import type { BloodPressureFormValues } from '../schemas/bloodPressureFormSchema';

export function buildBloodPressureEvent(
  values: BloodPressureFormValues,
  existing?: BloodPressureEvent,
): BloodPressureEvent {
  const now = new Date().toISOString();
  const timestamp = fromDateTimeLocalValue(values.timestampLocal);

  return {
    id: existing?.id ?? createId(),
    type: 'bloodPressure',
    timestamp,
    data: {
      systolic: values.systolic,
      diastolic: values.diastolic,
      pulse: values.pulse,
      mealRelation: values.mealRelation,
      notes: values.notes,
    },
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}
