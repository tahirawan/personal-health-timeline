import { cn } from '../lib/classNames';

export type SummaryGroupItem = {
  label: string;
  value: string;
};

export function SummaryGroupCard({
  title,
  items,
  tone = 'teal',
}: {
  title: string;
  items: SummaryGroupItem[];
  tone?: 'teal' | 'orange' | 'violet';
}) {
  return (
    <div
      className={cn(
        'grid gap-4 rounded-[20px] border px-4 py-4 shadow-[inset_0_1px_0_rgb(255_255_255_/_54%)]',
        'bg-[linear-gradient(145deg,rgb(255_255_255_/_82%),rgb(235_248_244_/_62%))]',
        tone === 'teal' && 'border-[rgb(19_139_131_/_18%)]',
        tone === 'orange' && 'border-[rgb(217_119_6_/_20%)]',
        tone === 'violet' && 'border-[rgb(101_87_189_/_20%)]',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="m-0 text-sm font-black tracking-[0.12em] text-health-muted uppercase">
          {title}
        </h3>
        <span
          className={cn(
            'h-2.5 w-2.5 rounded-full',
            tone === 'teal' && 'bg-health-teal',
            tone === 'orange' && 'bg-[#d97706]',
            tone === 'violet' && 'bg-health-violet',
          )}
          aria-hidden="true"
        />
      </div>
      <dl className="m-0 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(86px,1fr))]">
        {items.map((item) => (
          <div key={item.label} className="grid gap-1">
            <dt className="text-xs font-extrabold text-health-muted">{item.label}</dt>
            <dd className="m-0 break-words text-[1.35rem] leading-none font-black text-health-ink">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
