import type { ReactNode } from 'react';

import { ui } from '../lib/uiStyles';

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className={ui.modalBackdrop} role="presentation">
      <section
        className={ui.modalPanel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={ui.modalHeader}>
          <h2 className={ui.modalTitle} id="modal-title">
            {title}
          </h2>
          <button
            className={ui.iconButton}
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
