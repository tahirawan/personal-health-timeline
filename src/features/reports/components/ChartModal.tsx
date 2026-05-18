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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-[rgb(6_21_28_/_68%)] p-3 backdrop-blur-[16px] max-[680px]:p-0"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="relative h-[min(92svh,760px)] w-[min(100%,1120px)] overflow-hidden rounded-[28px] border border-white/30 bg-[linear-gradient(135deg,rgb(9_41_50_/_98%),rgb(24_63_75_/_96%))] shadow-[0_28px_80px_rgb(0_0_0_/_34%)] max-[680px]:h-[100svh] max-[680px]:w-[100svw] max-[680px]:rounded-none"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="absolute top-0 right-0 left-0 z-20 flex items-center justify-between gap-3 px-4 py-3 text-white max-[680px]:px-3 max-[680px]:pt-[calc(env(safe-area-inset-top)+0.65rem)]">
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

        <div className="absolute inset-0 p-3 pt-[4.5rem] max-[680px]:p-2 max-[680px]:pt-[calc(env(safe-area-inset-top)+4rem)]">
          <div className="relative h-full min-h-0 overflow-hidden">
            <div className="grid h-full min-h-0 landscape:h-full landscape:w-full portrait:absolute portrait:top-1/2 portrait:left-1/2 portrait:h-[100svw] portrait:w-[calc(100svh-4rem)] portrait:min-w-[620px] portrait:-translate-x-1/2 portrait:-translate-y-1/2 portrait:rotate-90">
              {children}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
