import { fromDateTimeLocalValue } from '../../../shared/lib/date';
import { createId } from '../../../shared/lib/ids';
import type { MealEvent } from '../../../shared/types/domain';
import type { MealFormValues } from '../schemas/mealFormSchema';

export function buildMealEvent(values: MealFormValues, existing?: MealEvent): MealEvent {
  const now = new Date().toISOString();

  return {
    id: existing?.id ?? createId(),
    type: 'meal',
    timestamp: fromDateTimeLocalValue(values.timestampLocal),
    mealType: values.mealType,
    description: values.description,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}
