import { cn } from '../lib/classNames';
import { ui } from '../lib/uiStyles';

export type ConfirmDialogState = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type ConfirmDialogProps = ConfirmDialogState & {
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <div className={ui.modalBackdrop} role="presentation">
      <section
        className={ui.confirmPanel}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-description"
      >
        <div>
          <h2 className={ui.confirmTitle} id="confirm-title">
            {title}
          </h2>
          <p className={ui.confirmText} id="confirm-description">
            {description}
          </p>
        </div>
        <div className={ui.formActions}>
          <button className={ui.secondaryButton} type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={cn(destructive ? ui.dangerButton : ui.primaryButton)}
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
