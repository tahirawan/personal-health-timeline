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
      className="fixed inset-0 z-[80] h-[100svh] w-[100svw] overflow-hidden overscroll-none bg-[rgb(6_21_28)]"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="absolute inset-0 h-[100svh] w-[100svw] overflow-hidden bg-[linear-gradient(135deg,rgb(9_41_50),rgb(24_63_75))]"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="absolute top-0 right-0 left-0 z-20 flex min-h-[calc(env(safe-area-inset-top)+4rem)] items-start justify-between gap-3 px-4 pt-[calc(env(safe-area-inset-top)+0.65rem)] text-white">
          <h2 className="m-0 text-base font-extrabold">{title}</h2>
          <button
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/24 bg-white/14 text-white shadow-[0_16px_36px_rgb(0_0_0_/_30%)] backdrop-blur-[12px] transition-colors duration-150 hover:bg-white/22 focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[rgb(255_255_255_/_45%)]"
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </header>

        <div className="absolute top-[calc(env(safe-area-inset-top)+4rem)] right-0 bottom-0 left-0 overflow-hidden p-2">
          <div className="relative h-full w-full min-h-0 overflow-hidden">
            <div className="grid h-full w-full min-h-0 landscape:h-full landscape:w-full portrait:absolute portrait:top-1/2 portrait:left-1/2 portrait:h-[calc(100svw-1rem)] portrait:w-[calc(100svh-env(safe-area-inset-top)-5rem)] portrait:min-w-0 portrait:-translate-x-1/2 portrait:-translate-y-1/2 portrait:rotate-90">
              {children}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
