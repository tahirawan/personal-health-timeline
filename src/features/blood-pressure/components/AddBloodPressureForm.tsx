import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FieldError } from '../../../shared/components/FieldError';
import { toDateTimeLocalValue } from '../../../shared/lib/date';
import type { BloodPressureEvent, MealRelation } from '../../../shared/types/domain';
import {
  bloodPressureFormSchema,
  type BloodPressureFormInput,
  type BloodPressureFormValues,
} from '../schemas/bloodPressureFormSchema';

type AddBloodPressureFormProps = {
  initialEvent?: BloodPressureEvent;
  onSubmit: (values: BloodPressureFormValues) => Promise<void> | void;
  onCancel?: () => void;
};

const mealRelationOptions: Array<{ value: MealRelation | ''; label: string }> = [
  { value: '', label: 'None' },
  { value: 'before_breakfast', label: 'Before breakfast' },
  { value: 'after_breakfast', label: 'After breakfast' },
  { value: 'before_lunch', label: 'Before lunch' },
  { value: 'after_lunch', label: 'After lunch' },
  { value: 'before_dinner', label: 'Before dinner' },
  { value: 'after_dinner', label: 'After dinner' },
  { value: 'before_meal', label: 'Before meal' },
  { value: 'after_meal', label: 'After meal' },
];

export function AddBloodPressureForm({
  initialEvent,
  onSubmit,
  onCancel,
}: AddBloodPressureFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BloodPressureFormInput, unknown, BloodPressureFormValues>({
    resolver: zodResolver(bloodPressureFormSchema),
    defaultValues: {
      timestampLocal: initialEvent
        ? toDateTimeLocalValue(new Date(initialEvent.timestamp))
        : toDateTimeLocalValue(),
      systolic: initialEvent?.systolic,
      diastolic: initialEvent?.diastolic,
      pulse: initialEvent?.pulse,
      mealRelation: initialEvent?.mealRelation ?? '',
      notes: initialEvent?.notes ?? '',
    },
  });

  return (
    <form className="stacked-form" onSubmit={handleSubmit(onSubmit)}>
      <label>
        Time
        <input type="datetime-local" {...register('timestampLocal')} />
        <FieldError message={errors.timestampLocal?.message} />
      </label>

      <div className="form-grid two-column">
        <label>
          Systolic
          <input
            type="number"
            inputMode="numeric"
            min="40"
            max="300"
            placeholder="120"
            {...register('systolic', { valueAsNumber: true })}
          />
          <FieldError message={errors.systolic?.message} />
        </label>
        <label>
          Diastolic
          <input
            type="number"
            inputMode="numeric"
            min="30"
            max="200"
            placeholder="80"
            {...register('diastolic', { valueAsNumber: true })}
          />
          <FieldError message={errors.diastolic?.message} />
        </label>
      </div>

      <label>
        Pulse optional
        <input
          type="number"
          inputMode="numeric"
          min="30"
          max="220"
          placeholder="74"
          {...register('pulse', { valueAsNumber: true })}
        />
        <FieldError message={errors.pulse?.message} />
      </label>

      <label>
        Meal relation
        <select {...register('mealRelation')}>
          {mealRelationOptions.map((option) => (
            <option key={option.value || 'none'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError message={errors.mealRelation?.message} />
      </label>

      <label>
        Notes optional
        <textarea rows={2} placeholder="Context around the reading" {...register('notes')} />
        <FieldError message={errors.notes?.message} />
      </label>

      <div className="form-actions">
        {onCancel ? (
          <button className="secondary-button" type="button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          Save reading
        </button>
      </div>
    </form>
  );
}
