import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FieldError } from '../../../shared/components/FieldError';
import { toDateTimeLocalValue } from '../../../shared/lib/date';
import { ui } from '../../../shared/lib/uiStyles';
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
    <form className={ui.stackedForm} onSubmit={handleSubmit(onSubmit)}>
      <label className={ui.label}>
        Time
        <input className={ui.input} type="datetime-local" {...register('timestampLocal')} />
        <FieldError message={errors.timestampLocal?.message} />
      </label>

      <div className={ui.formGridTwoColumn}>
        <label className={ui.label}>
          Systolic
          <input
            className={ui.input}
            type="number"
            inputMode="numeric"
            min="40"
            max="300"
            placeholder="120"
            {...register('systolic', { valueAsNumber: true })}
          />
          <FieldError message={errors.systolic?.message} />
        </label>
        <label className={ui.label}>
          Diastolic
          <input
            className={ui.input}
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

      <label className={ui.label}>
        Pulse optional
        <input
          className={ui.input}
          type="number"
          inputMode="numeric"
          min="30"
          max="220"
          placeholder="74"
          {...register('pulse', { valueAsNumber: true })}
        />
        <FieldError message={errors.pulse?.message} />
      </label>

      <label className={ui.label}>
        Meal relation
        <select className={ui.input} {...register('mealRelation')}>
          {mealRelationOptions.map((option) => (
            <option key={option.value || 'none'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError message={errors.mealRelation?.message} />
      </label>

      <label className={ui.label}>
        Notes optional
        <textarea
          className={ui.textarea}
          rows={2}
          placeholder="Context around the reading"
          {...register('notes')}
        />
        <FieldError message={errors.notes?.message} />
      </label>

      <div className={ui.formActions}>
        {onCancel ? (
          <button className={ui.secondaryButton} type="button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        <button className={ui.primaryButton} type="submit" disabled={isSubmitting}>
          Save reading
        </button>
      </div>
    </form>
  );
}
