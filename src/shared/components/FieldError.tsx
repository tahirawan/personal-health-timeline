import { ui } from '../lib/uiStyles';

type FieldErrorProps = {
  message?: string;
};

export function FieldError({ message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return <p className={ui.fieldError}>{message}</p>;
}
