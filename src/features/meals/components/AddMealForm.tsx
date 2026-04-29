import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FieldError } from '../../../shared/components/FieldError';
import { toDateTimeLocalValue } from '../../../shared/lib/date';
import type { MealEvent } from '../../../shared/types/domain';
import { mealFormSchema, type MealFormInput, type MealFormValues } from '../schemas/mealFormSchema';

type AddMealFormProps = {
  initialEvent?: MealEvent;
  onSubmit: (values: MealFormValues) => Promise<void> | void;
  onCancel?: () => void;
};

export function AddMealForm({ initialEvent, onSubmit, onCancel }: AddMealFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MealFormInput, unknown, MealFormValues>({
    resolver: zodResolver(mealFormSchema),
    defaultValues: {
      timestampLocal: initialEvent
        ? toDateTimeLocalValue(new Date(initialEvent.timestamp))
        : toDateTimeLocalValue(),
      mealType: initialEvent?.mealType ?? 'breakfast',
      description: initialEvent?.description ?? '',
    },
  });

  return (
    <form className="stacked-form" onSubmit={handleSubmit(onSubmit)}>
      <label>
        Time
        <input type="datetime-local" {...register('timestampLocal')} />
        <FieldError message={errors.timestampLocal?.message} />
      </label>

      <label>
        Meal type
        <select {...register('mealType')}>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
          <option value="other">Other</option>
        </select>
        <FieldError message={errors.mealType?.message} />
      </label>

      <label>
        Food notes optional
        <textarea rows={3} placeholder="Egg with avocado sandwich" {...register('description')} />
        <FieldError message={errors.description?.message} />
      </label>

      <div className="form-actions">
        {onCancel ? (
          <button className="secondary-button" type="button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          Save meal
        </button>
      </div>
    </form>
  );
}
