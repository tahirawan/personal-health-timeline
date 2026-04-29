import { fromDateTimeLocalValue } from '../../../shared/lib/date';
import { createId } from '../../../shared/lib/ids';
import type { TabletEvent } from '../../../shared/types/domain';
import type { TabletFormValues } from '../schemas/tabletFormSchema';

export function buildTabletEvent(values: TabletFormValues, existing?: TabletEvent): TabletEvent {
  const now = new Date().toISOString();

  return {
    id: existing?.id ?? createId(),
    type: 'tablet',
    timestamp: fromDateTimeLocalValue(values.timestampLocal),
    medicationName: values.medicationName,
    dosage: values.dosage,
    notes: values.notes,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}
