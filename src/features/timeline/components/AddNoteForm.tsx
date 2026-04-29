import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FieldError } from '../../../shared/components/FieldError';
import { toDateTimeLocalValue } from '../../../shared/lib/date';
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
      text: initialEvent?.text ?? '',
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
        Note
        <textarea rows={4} placeholder="General health note" {...register('text')} />
        <FieldError message={errors.text?.message} />
      </label>

      <div className="form-actions">
        {onCancel ? (
          <button className="secondary-button" type="button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          Save note
        </button>
      </div>
    </form>
  );
}
