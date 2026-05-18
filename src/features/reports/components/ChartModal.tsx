import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

type ChartModalProps = {
  ariaLabel: string;
  children: ReactNode;
  closeLabel: string;
  onClose: () => void;
  title: string;
};

export function ChartModal({ ariaLabel, children, closeLabel, onClose, title }: ChartModalProps) {
  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] h-[100svh] w-[100svw] overflow-hidden overscroll-none bg-[rgb(6_21_28_/_62%)]"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="grid h-[100svh] w-[100svw] grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-[linear-gradient(145deg,rgb(255_255_255),rgb(235_248_244))]"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-4 border-b border-[rgb(19_139_131_/_14%)] px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 text-health-ink shadow-[0_1px_0_rgb(255_255_255_/_64%)]">
          <h2 className="m-0 text-[1.15rem] font-bold">{title}</h2>
          <button
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[rgb(19_139_131_/_14%)] bg-white/78 text-health-ink shadow-[0_10px_22px_rgb(6_21_28_/_8%)] transition-colors duration-150 hover:bg-white focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[rgb(19_139_131_/_30%)]"
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </header>

        <div className="min-h-0 overflow-hidden p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] max-[420px]:p-2 max-[420px]:pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
          <div className="grid h-full min-h-0">{children}</div>
        </div>
      </section>
    </div>
  );
}
