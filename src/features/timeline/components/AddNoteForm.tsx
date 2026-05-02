import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FieldError } from '../../../shared/components/FieldError';
import { toDateTimeLocalValue } from '../../../shared/lib/date';
import { ui } from '../../../shared/lib/uiStyles';
import type { NoteEvent } from '../../../shared/types/domain';
import { noteFormSchema, type NoteFormValues } from '../schemas/noteFormSchema';

type AddNoteFormProps = {
  initialEvent?: NoteEvent;
  onSubmit: (values: NoteFormValues) => Promise<void> | void;
  onCancel?: () => void;
};

export function AddNoteForm({ initialEvent, onSubmit, onCancel }: AddNoteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      timestampLocal: initialEvent
        ? toDateTimeLocalValue(new Date(initialEvent.timestamp))
        : toDateTimeLocalValue(),
      text: initialEvent?.data.text ?? '',
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
        Note
        <textarea
          className={ui.textarea}
          rows={4}
          placeholder="General health note"
          {...register('text')}
        />
        <FieldError message={errors.text?.message} />
      </label>

      <div className={ui.formActions}>
        {onCancel ? (
          <button className={ui.secondaryButton} type="button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        <button className={ui.primaryButton} type="submit" disabled={isSubmitting}>
          Save note
        </button>
      </div>
    </form>
  );
}
