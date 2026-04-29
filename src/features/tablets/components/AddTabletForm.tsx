import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FieldError } from '../../../shared/components/FieldError';
import { toDateTimeLocalValue } from '../../../shared/lib/date';
import { ui } from '../../../shared/lib/uiStyles';
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
    <form className={ui.stackedForm} onSubmit={handleSubmit(onSubmit)}>
      <label className={ui.label}>
        Time
        <input className={ui.input} type="datetime-local" {...register('timestampLocal')} />
        <FieldError message={errors.timestampLocal?.message} />
      </label>

      <label className={ui.label}>
        Medicine name optional
        <input
          className={ui.input}
          type="text"
          placeholder="Tablet"
          {...register('medicationName')}
        />
        <FieldError message={errors.medicationName?.message} />
      </label>

      <label className={ui.label}>
        Dosage optional
        <input className={ui.input} type="text" placeholder="e.g. 5 mg" {...register('dosage')} />
        <FieldError message={errors.dosage?.message} />
      </label>

      <label className={ui.label}>
        Notes optional
        <textarea
          className={ui.textarea}
          rows={2}
          placeholder="Taken after food"
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
          Save tablet
        </button>
      </div>
    </form>
  );
}
