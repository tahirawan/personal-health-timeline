import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FieldError } from '../../../shared/components/FieldError';
import { toDateTimeLocalValue } from '../../../shared/lib/date';
import { ui } from '../../../shared/lib/uiStyles';
import type { BloodSugarEvent, MealRelation } from '../../../shared/types/domain';
import {
  bloodSugarFormSchema,
  type BloodSugarFormInput,
  type BloodSugarFormValues,
} from '../schemas/bloodSugarFormSchema';

type AddBloodSugarFormProps = {
  initialEvent?: BloodSugarEvent;
  onSubmit: (values: BloodSugarFormValues) => Promise<void> | void;
  onCancel?: () => void;
};

const mealRelationOptions: Array<{ value: MealRelation | ''; label: string }> = [
  { value: '', label: 'None' },
  { value: 'fasting', label: 'Fasting' },
  { value: 'before_breakfast', label: 'Before breakfast' },
  { value: 'after_breakfast', label: 'After breakfast' },
  { value: 'before_lunch', label: 'Before lunch' },
  { value: 'after_lunch', label: 'After lunch' },
  { value: 'before_dinner', label: 'Before dinner' },
  { value: 'after_dinner', label: 'After dinner' },
  { value: 'before_meal', label: 'Before meal' },
  { value: 'after_meal', label: 'After meal' },
];

export function AddBloodSugarForm({ initialEvent, onSubmit, onCancel }: AddBloodSugarFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BloodSugarFormInput, unknown, BloodSugarFormValues>({
    resolver: zodResolver(bloodSugarFormSchema),
    defaultValues: {
      timestampLocal: initialEvent
        ? toDateTimeLocalValue(new Date(initialEvent.timestamp))
        : toDateTimeLocalValue(),
      reading: initialEvent?.data.reading,
      mealRelation: initialEvent?.data.mealRelation ?? '',
      notes: initialEvent?.data.notes ?? '',
    },
  });

  return (
    <form className={ui.stackedForm} onSubmit={handleSubmit(onSubmit)}>
      <label className={ui.label}>
        Time
        <input className={ui.input} type="datetime-local" {...register('timestampLocal')} />
        <FieldError message={errors.timestampLocal?.message} />
      </label>

      <label className={ui.label}>
        Blood sugar (mg/dL)
        <input
          className={ui.input}
          type="number"
          inputMode="numeric"
          min="20"
          max="600"
          placeholder="95"
          {...register('reading', { valueAsNumber: true })}
        />
        <FieldError message={errors.reading?.message} />
      </label>

      <label className={ui.label}>
        Context
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
          placeholder="Any relevant context"
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
