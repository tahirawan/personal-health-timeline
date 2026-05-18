import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { cn } from '../../../shared/lib/classNames';
import { useRotatedMobileChart } from './useChartHeight';

type ChartModalProps = {
  ariaLabel: string;
  children: ReactNode;
  closeLabel: string;
  onClose: () => void;
  title: string;
};

export function ChartModal({ ariaLabel, children, closeLabel, onClose, title }: ChartModalProps) {
  const rotateMobileChart = useRotatedMobileChart(true);

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
      className={cn(
        'fixed inset-0 z-[80] grid h-[100dvh] w-[100dvw] max-w-[100dvw] place-items-center overflow-hidden overscroll-none bg-[rgb(6_21_28_/_62%)] p-3',
        rotateMobileChart && 'p-0',
      )}
      role="presentation"
      onClick={onClose}
    >
      <section
        className={cn(
          'relative grid h-[min(760px,calc(100dvh-1.5rem))] w-[min(1180px,calc(100dvw-1.5rem))] max-w-full min-w-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-[24px] bg-[linear-gradient(145deg,rgb(255_255_255),rgb(235_248_244))] shadow-health-panel',
          rotateMobileChart && 'h-[100dvh] w-[100dvw] rounded-none shadow-none',
        )}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sticky top-0 z-20 min-w-0 border-b border-[rgb(19_139_131_/_14%)] bg-[linear-gradient(145deg,rgb(255_255_255),rgb(235_248_244))] px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pr-[calc(env(safe-area-inset-right)+4.5rem)] pb-3 text-health-ink shadow-[0_1px_0_rgb(255_255_255_/_64%)]">
          <h2 className="m-0 truncate text-[1.15rem] font-bold">{title}</h2>
          <button
            className="absolute top-[calc(env(safe-area-inset-top)+0.65rem)] right-[calc(env(safe-area-inset-right)+0.75rem)] z-30 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[rgb(19_139_131_/_14%)] bg-white/90 text-health-ink shadow-[0_10px_22px_rgb(6_21_28_/_14%)] transition-colors duration-150 hover:bg-white focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[rgb(19_139_131_/_30%)]"
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </header>

        <div
          className={cn(
            'min-h-0 min-w-0 overflow-y-auto overflow-x-hidden p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] max-[420px]:p-2 max-[420px]:pb-[calc(env(safe-area-inset-bottom)+0.5rem)]',
            rotateMobileChart && 'relative overflow-hidden p-0',
          )}
        >
          <div
            className={cn(
              'grid min-h-full min-w-0 max-w-full',
              rotateMobileChart &&
                'absolute top-1/2 left-1/2 h-[100dvw] w-[calc(100dvh-4.75rem)] max-w-none origin-center -translate-x-1/2 -translate-y-1/2 rotate-90',
            )}
          >
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}
