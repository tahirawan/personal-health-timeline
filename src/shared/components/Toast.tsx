import { cn } from '../lib/classNames';
import { toastPositionClasses, toastToneClasses, ui } from '../lib/uiStyles';

export type ToastTone = 'success' | 'error' | 'info';
export type ToastPosition = 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';

export type ToastMessage = {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
};

type ToastViewportProps = {
  messages: ToastMessage[];
  position: ToastPosition;
  onDismiss: (id: string) => void;
};

export function ToastViewport({ messages, position, onDismiss }: ToastViewportProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(ui.toastViewport, toastPositionClasses[position])}
      role="status"
      aria-live="polite"
    >
      {messages.map((message) => (
        <div className={cn(ui.toastCard, toastToneClasses[message.tone])} key={message.id}>
          <div>
            <strong className={ui.toastTitle}>{message.title}</strong>
            {message.description ? <p className={ui.toastText}>{message.description}</p> : null}
          </div>
          <button
            className={ui.toastDismiss}
            type="button"
            onClick={() => onDismiss(message.id)}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
