import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FieldError } from '../../../shared/components/FieldError';
import { toDateTimeLocalValue } from '../../../shared/lib/date';
import type { TabletEvent } from '../../../shared/types/domain';
import {
  tabletFormSchema,
  type TabletFormInput,
  type TabletFormValues,
} from '../schemas/tabletFormSchema';

type AddTabletFormProps = {
  initialEvent?: TabletEvent;
  onSubmit: (values: TabletFormValues) => Promise<void> | void;
  onCancel?: () => void;
};

export function AddTabletForm({ initialEvent, onSubmit, onCancel }: AddTabletFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TabletFormInput, unknown, TabletFormValues>({
    resolver: zodResolver(tabletFormSchema),
    defaultValues: {
      timestampLocal: initialEvent
        ? toDateTimeLocalValue(new Date(initialEvent.timestamp))
        : toDateTimeLocalValue(),
      medicationName: initialEvent?.medicationName ?? '',
      dosage: initialEvent?.dosage ?? '',
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

      <label>
        Medicine name optional
        <input type="text" placeholder="Tablet" {...register('medicationName')} />
        <FieldError message={errors.medicationName?.message} />
      </label>

      <label>
        Dosage optional
        <input type="text" placeholder="e.g. 5 mg" {...register('dosage')} />
        <FieldError message={errors.dosage?.message} />
      </label>

      <label>
        Notes optional
        <textarea rows={2} placeholder="Taken after food" {...register('notes')} />
        <FieldError message={errors.notes?.message} />
      </label>

      <div className="form-actions">
        {onCancel ? (
          <button className="secondary-button" type="button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          Save tablet
        </button>
      </div>
    </form>
  );
}
