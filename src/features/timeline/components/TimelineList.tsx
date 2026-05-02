import {
  Activity,
  Droplets,
  LayoutGrid,
  Pill,
  StickyNote,
  Trash2,
  Utensils,
  Pencil,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { formatDisplayTime } from '../../../shared/lib/date';
import { cn } from '../../../shared/lib/classNames';
import { timelineIconClasses, ui } from '../../../shared/lib/uiStyles';
import type {
  BloodPressureEvent,
  BloodSugarEvent,
  MealEvent,
  MealRelation,
  NoteEvent,
  TabletEvent,
  TimelineEvent,
} from '../../../shared/types/domain';
import { groupEventsByLocalDate } from '../services/timelineService';

const filterOptions = [
  {
    value: 'all' as const,
    label: 'All',
    icon: LayoutGrid,
    activeCls:
      'bg-health-teal border-health-teal text-white shadow-[0_4px_12px_rgb(19_139_131_/_32%)]',
    inactiveCls: 'border-[rgb(19_139_131_/_22%)] bg-[rgb(19_139_131_/_7%)] text-health-muted',
    iconActiveCls: 'text-white',
    iconInactiveCls: 'text-health-teal',
  },
  {
    value: 'bloodPressure' as const,
    label: 'BP',
    icon: Activity,
    activeCls:
      'bg-health-teal border-health-teal text-white shadow-[0_4px_12px_rgb(19_139_131_/_32%)]',
    inactiveCls: 'border-[rgb(19_139_131_/_22%)] bg-[rgb(19_139_131_/_7%)] text-health-muted',
    iconActiveCls: 'text-white',
    iconInactiveCls: 'text-health-teal',
  },
  {
    value: 'bloodSugar' as const,
    label: 'Sugar',
    icon: Droplets,
    activeCls: 'bg-[#d97706] border-[#d97706] text-white shadow-[0_4px_12px_rgb(217_119_6_/_32%)]',
    inactiveCls: 'border-[rgb(217_119_6_/_24%)] bg-[rgb(217_119_6_/_7%)] text-health-muted',
    iconActiveCls: 'text-white',
    iconInactiveCls: 'text-[#d97706]',
  },
  {
    value: 'meal' as const,
    label: 'Meals',
    icon: Utensils,
    activeCls:
      'bg-health-accent border-health-accent text-white shadow-[0_4px_12px_rgb(211_111_60_/_30%)]',
    inactiveCls: 'border-[rgb(211_111_60_/_24%)] bg-[rgb(211_111_60_/_7%)] text-health-muted',
    iconActiveCls: 'text-white',
    iconInactiveCls: 'text-health-accent',
  },
  {
    value: 'tablet' as const,
    label: 'Medicine',
    icon: Pill,
    activeCls: 'bg-[#2e6ecb] border-[#2e6ecb] text-white shadow-[0_4px_12px_rgb(46_110_203_/_32%)]',
    inactiveCls: 'border-[rgb(46_110_203_/_24%)] bg-[rgb(46_110_203_/_7%)] text-health-muted',
    iconActiveCls: 'text-white',
    iconInactiveCls: 'text-[#2e6ecb]',
  },
  {
    value: 'note' as const,
    label: 'Notes',
    icon: StickyNote,
    activeCls:
      'bg-health-violet border-health-violet text-white shadow-[0_4px_12px_rgb(101_87_189_/_30%)]',
    inactiveCls: 'border-[rgb(101_87_189_/_24%)] bg-[rgb(101_87_189_/_7%)] text-health-muted',
    iconActiveCls: 'text-white',
    iconInactiveCls: 'text-health-violet',
  },
];

type FilterType = (typeof filterOptions)[number]['value'];

type TimelineListProps = {
  events: TimelineEvent[];
  title?: string;
  emptyMessage?: string;
  showFilters?: boolean;
  onEdit?: (event: TimelineEvent) => void;
  onDelete?: (event: TimelineEvent) => void;
};

const mealRelationLabels: Record<MealRelation, string> = {
  fasting: 'Fasting',
  before_breakfast: 'Before breakfast',
  after_breakfast: 'After breakfast',
  before_lunch: 'Before lunch',
  after_lunch: 'After lunch',
  before_dinner: 'Before dinner',
  after_dinner: 'After dinner',
  before_meal: 'Before meal',
  after_meal: 'After meal',
  unrelated: 'Unrelated',
};

export function TimelineList({
  events,
  title = 'Timeline',
  emptyMessage = 'No timeline events yet.',
  showFilters = false,
  onEdit,
  onDelete,
}: TimelineListProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredEvents = useMemo(
    () => (filter === 'all' ? events : events.filter((e) => e.type === filter)),
    [events, filter],
  );

  const activeFilterLabel = filterOptions.find((o) => o.value === filter)?.label ?? 'events';

  return (
    <section className={ui.section} aria-labelledby="timeline-heading">
      <h2 className={ui.h2} id="timeline-heading">
        {title}
      </h2>

      {showFilters && events.length > 0 && (
        <div
          className="mb-[18px] grid grid-cols-6 gap-2 max-[480px]:grid-cols-3"
          role="tablist"
          aria-label="Filter timeline by type"
        >
          {filterOptions.map((option) => {
            const Icon = option.icon;
            const isActive = filter === option.value;
            return (
              <button
                key={option.value}
                role="tab"
                type="button"
                aria-selected={isActive}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-[16px] border px-1.5 py-3 text-[0.7rem] font-bold transition-all duration-150',
                  isActive ? option.activeCls : option.inactiveCls,
                )}
                onClick={() => setFilter(option.value)}
              >
                <Icon
                  size={16}
                  aria-hidden="true"
                  className={cn(
                    'transition-colors duration-150',
                    isActive ? option.iconActiveCls : option.iconInactiveCls,
                  )}
                />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {events.length === 0 ? (
        <p className={ui.emptyState}>{emptyMessage}</p>
      ) : filteredEvents.length === 0 ? (
        <p className={ui.emptyState}>No {activeFilterLabel.toLowerCase()} in the timeline.</p>
      ) : (
        <div className={ui.timelineGroups}>
          {groupEventsByLocalDate(filteredEvents).map((group) => (
            <div key={group.dateKey}>
              <h3 className={cn(ui.h3, ui.timelineGroupTitle)}>{group.displayDate}</h3>
              <ol className={ui.timelineList}>
                {group.events.map((event) => (
                  <TimelineItem event={event} key={event.id} onEdit={onEdit} onDelete={onDelete} />
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function TimelineItem({
  event,
  onEdit,
  onDelete,
}: {
  event: TimelineEvent;
  onEdit?: (event: TimelineEvent) => void;
  onDelete?: (event: TimelineEvent) => void;
}) {
  const hasActions = Boolean(onEdit || onDelete);

  return (
    <li className={cn(ui.timelineItem, hasActions && ui.timelineItemWithActions)}>
      <div className={cn(ui.timelineTime, hasActions && ui.timelineTimeWithActions)}>
        {formatDisplayTime(event.timestamp)}
      </div>
      <div
        className={cn(
          ui.timelineIcon,
          timelineIconClasses[event.type],
          hasActions && ui.timelineIconWithActions,
        )}
        aria-hidden="true"
      >
        {getEventIcon(event)}
      </div>
      <div className={cn(ui.timelineContent, hasActions && ui.timelineContentWithActions)}>
        {getEventContent(event)}
      </div>
      {hasActions ? (
        <div className={ui.timelineActions}>
          {onEdit ? (
            <button
              className={ui.iconButton}
              type="button"
              onClick={() => onEdit(event)}
              aria-label={`Edit ${getEventLabel(event)}`}
              title={`Edit ${getEventLabel(event)}`}
            >
              <Pencil size={18} />
            </button>
          ) : null}
          {onDelete ? (
            <button
              className={cn(ui.iconButton, ui.dangerIconButton)}
              type="button"
              onClick={() => onDelete(event)}
              aria-label={`Delete ${getEventLabel(event)}`}
              title={`Delete ${getEventLabel(event)}`}
            >
              <Trash2 size={18} />
            </button>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function getEventIcon(event: TimelineEvent) {
  if (event.type === 'bloodPressure') {
    return <Activity size={18} />;
  }

  if (event.type === 'bloodSugar') {
    return <Droplets size={18} />;
  }

  if (event.type === 'meal') {
    return <Utensils size={18} />;
  }

  if (event.type === 'tablet') {
    return <Pill size={18} />;
  }

  return <StickyNote size={18} />;
}

function getEventLabel(event: TimelineEvent): string {
  if (event.type === 'bloodPressure') {
    return 'blood pressure reading';
  }

  if (event.type === 'bloodSugar') {
    return 'blood sugar reading';
  }

  if (event.type === 'meal') {
    return `${event.data.mealType} meal`;
  }

  if (event.type === 'tablet') {
    return 'medicine';
  }

  return 'note';
}

function getEventContent(event: TimelineEvent) {
  if (event.type === 'bloodPressure') {
    return <BloodPressureContent event={event} />;
  }

  if (event.type === 'bloodSugar') {
    return <BloodSugarContent event={event} />;
  }

  if (event.type === 'meal') {
    return <MealContent event={event} />;
  }

  if (event.type === 'tablet') {
    return <TabletContent event={event} />;
  }

  return <NoteContent event={event} />;
}

function BloodPressureContent({ event }: { event: BloodPressureEvent }) {
  return (
    <>
      <strong className={ui.timelineContentStrong}>
        BP {`${event.data.systolic}/${event.data.diastolic}`}
      </strong>
      <span className={ui.timelineContentText}>
        {event.data.pulse ? `Pulse ${event.data.pulse}` : null}
        {event.data.mealRelation ? ` ${mealRelationLabels[event.data.mealRelation]}` : null}
      </span>
      {event.data.notes ? <small className={ui.timelineMutedText}>{event.data.notes}</small> : null}
    </>
  );
}

function BloodSugarContent({ event }: { event: BloodSugarEvent }) {
  return (
    <>
      <strong className={ui.timelineContentStrong}>
        Sugar {event.data.reading} {event.data.unit ?? 'mg/dL'}
      </strong>
      <span className={ui.timelineContentText}>
        {event.data.mealRelation ? mealRelationLabels[event.data.mealRelation] : null}
      </span>
      {event.data.notes ? <small className={ui.timelineMutedText}>{event.data.notes}</small> : null}
    </>
  );
}

function MealContent({ event }: { event: MealEvent }) {
  return (
    <>
      <strong className={ui.timelineContentStrong}>
        {event.data.mealType[0]?.toUpperCase() + event.data.mealType.slice(1)}
      </strong>
      {event.data.description ? (
        <span className={ui.timelineContentText}>{event.data.description}</span>
      ) : null}
    </>
  );
}

function TabletContent({ event }: { event: TabletEvent }) {
  return (
    <>
      <strong className={ui.timelineContentStrong}>
        {event.data.medicationName || 'Medicine'}
      </strong>
      {event.data.dosage ? (
        <span className={ui.timelineContentText}>{event.data.dosage}</span>
      ) : null}
      {event.data.notes ? <small className={ui.timelineMutedText}>{event.data.notes}</small> : null}
    </>
  );
}

function NoteContent({ event }: { event: NoteEvent }) {
  return (
    <>
      <strong className={ui.timelineContentStrong}>Note</strong>
      <span className={ui.timelineContentText}>{event.data.text}</span>
    </>
  );
}
