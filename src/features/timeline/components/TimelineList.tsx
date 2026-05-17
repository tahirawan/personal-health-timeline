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

import { addLocalDays, formatDisplayTime, startOfLocalDay } from '../../../shared/lib/date';
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
  TimelineEventType,
} from '../../../shared/types/domain';
import { groupEventsByLocalDate } from '../services/timelineService';

const allFilterOption = {
  label: 'All',
  icon: LayoutGrid,
  activeCls:
    'bg-health-teal border-health-teal text-white shadow-[0_4px_12px_rgb(19_139_131_/_32%)]',
  inactiveCls: 'border-[rgb(19_139_131_/_22%)] bg-[rgb(19_139_131_/_7%)] text-health-muted',
  iconActiveCls: 'text-white',
  iconInactiveCls: 'text-health-teal',
};

const filterOptions: Array<{
  value: TimelineEventType;
  label: string;
  icon: typeof Activity;
  activeCls: string;
  inactiveCls: string;
  iconActiveCls: string;
  iconInactiveCls: string;
}> = [
  {
    value: 'bloodPressure',
    label: 'BP',
    icon: Activity,
    activeCls:
      'bg-health-teal border-health-teal text-white shadow-[0_4px_12px_rgb(19_139_131_/_32%)]',
    inactiveCls: 'border-[rgb(19_139_131_/_22%)] bg-[rgb(19_139_131_/_7%)] text-health-muted',
    iconActiveCls: 'text-white',
    iconInactiveCls: 'text-health-teal',
  },
  {
    value: 'bloodSugar',
    label: 'Sugar',
    icon: Droplets,
    activeCls: 'bg-[#d97706] border-[#d97706] text-white shadow-[0_4px_12px_rgb(217_119_6_/_32%)]',
    inactiveCls: 'border-[rgb(217_119_6_/_24%)] bg-[rgb(217_119_6_/_7%)] text-health-muted',
    iconActiveCls: 'text-white',
    iconInactiveCls: 'text-[#d97706]',
  },
  {
    value: 'meal',
    label: 'Meals',
    icon: Utensils,
    activeCls:
      'bg-health-accent border-health-accent text-white shadow-[0_4px_12px_rgb(211_111_60_/_30%)]',
    inactiveCls: 'border-[rgb(211_111_60_/_24%)] bg-[rgb(211_111_60_/_7%)] text-health-muted',
    iconActiveCls: 'text-white',
    iconInactiveCls: 'text-health-accent',
  },
  {
    value: 'tablet',
    label: 'Medicine',
    icon: Pill,
    activeCls: 'bg-[#2e6ecb] border-[#2e6ecb] text-white shadow-[0_4px_12px_rgb(46_110_203_/_32%)]',
    inactiveCls: 'border-[rgb(46_110_203_/_24%)] bg-[rgb(46_110_203_/_7%)] text-health-muted',
    iconActiveCls: 'text-white',
    iconInactiveCls: 'text-[#2e6ecb]',
  },
  {
    value: 'note',
    label: 'Notes',
    icon: StickyNote,
    activeCls:
      'bg-health-violet border-health-violet text-white shadow-[0_4px_12px_rgb(101_87_189_/_30%)]',
    inactiveCls: 'border-[rgb(101_87_189_/_24%)] bg-[rgb(101_87_189_/_7%)] text-health-muted',
    iconActiveCls: 'text-white',
    iconInactiveCls: 'text-health-violet',
  },
];

type TimelineRangeDays = 7 | 30 | 60;

const allFilterValues = filterOptions.map((option) => option.value);
const timelineRangeOptions: Array<{ value: TimelineRangeDays; label: string }> = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 60, label: 'Last 60 days' },
];

type TimelineListProps = {
  events: TimelineEvent[];
  title?: string;
  emptyMessage?: string;
  showFilters?: boolean;
  showRangeControls?: boolean;
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
  showRangeControls = false,
  onEdit,
  onDelete,
}: TimelineListProps) {
  const [selectedFilters, setSelectedFilters] = useState<TimelineEventType[]>(allFilterValues);
  const [rangeDays, setRangeDays] = useState<TimelineRangeDays>(7);
  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);

  const filteredEvents = useMemo(() => {
    if (selectedFilters.length === allFilterValues.length) {
      return events;
    }

    return events.filter((event) => selectedFilters.includes(event.type));
  }, [events, selectedFilters]);

  const timelineSections = useMemo(
    () => getTimelineSections(filteredEvents, showRangeControls ? rangeDays : undefined),
    [filteredEvents, rangeDays, showRangeControls],
  );

  const allFiltersSelected = selectedFilters.length === allFilterValues.length;

  const toggleFilter = (value: TimelineEventType) => {
    setSelectedFilters((currentFilters) =>
      currentFilters.includes(value)
        ? currentFilters.filter((currentFilter) => currentFilter !== value)
        : [...currentFilters, value],
    );
  };

  const showAllFilters = () => {
    setSelectedFilters(allFilterValues);
  };

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths((currentMonths) =>
      currentMonths.includes(monthKey)
        ? currentMonths.filter((currentMonth) => currentMonth !== monthKey)
        : [...currentMonths, monthKey],
    );
  };

  return (
    <section className={ui.section} aria-labelledby="timeline-heading">
      <h2 className={ui.h2} id="timeline-heading">
        {title}
      </h2>

      {showFilters && events.length > 0 && (
        <div
          className="mb-[18px] grid grid-cols-6 gap-2 max-[480px]:grid-cols-3"
          role="group"
          aria-label="Filter timeline by type"
        >
          <FilterButton
            icon={allFilterOption.icon}
            label={allFilterOption.label}
            isActive={allFiltersSelected}
            activeCls={allFilterOption.activeCls}
            inactiveCls={allFilterOption.inactiveCls}
            iconActiveCls={allFilterOption.iconActiveCls}
            iconInactiveCls={allFilterOption.iconInactiveCls}
            onClick={showAllFilters}
          />
          {filterOptions.map((option) => {
            const isActive = selectedFilters.includes(option.value);
            return (
              <FilterButton
                key={option.value}
                icon={option.icon}
                label={option.label}
                isActive={isActive}
                activeCls={option.activeCls}
                inactiveCls={option.inactiveCls}
                iconActiveCls={option.iconActiveCls}
                iconInactiveCls={option.iconInactiveCls}
                onClick={() => toggleFilter(option.value)}
              />
            );
          })}
        </div>
      )}

      {showRangeControls && events.length > 0 ? (
        <label className="mb-[18px] grid max-w-[220px] gap-2.5 font-extrabold text-health-ink">
          Timeline range
          <select
            className={ui.input}
            value={rangeDays}
            onChange={(event) => {
              setRangeDays(Number(event.target.value) as TimelineRangeDays);
              setExpandedMonths([]);
            }}
          >
            {timelineRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {events.length === 0 ? (
        <p className={ui.emptyState}>{emptyMessage}</p>
      ) : filteredEvents.length === 0 ? (
        <p className={ui.emptyState}>No selected event types in the timeline.</p>
      ) : (
        <div className={ui.timelineGroups}>
          {groupEventsByLocalDate(timelineSections.recentEvents).map((group) => (
            <div key={group.dateKey}>
              <h3 className={cn(ui.h3, ui.timelineGroupTitle)}>{group.displayDate}</h3>
              <ol className={ui.timelineList}>
                {group.events.map((event) => (
                  <TimelineItem event={event} key={event.id} onEdit={onEdit} onDelete={onDelete} />
                ))}
              </ol>
            </div>
          ))}
          {timelineSections.monthGroups.map((monthGroup) => {
            const isExpanded = expandedMonths.includes(monthGroup.monthKey);
            return (
              <div key={monthGroup.monthKey}>
                <button
                  className="flex w-full items-center justify-between gap-3 rounded-[18px] border border-[rgb(19_139_131_/_16%)] bg-[rgb(19_139_131_/_8%)] px-4 py-3 text-left font-extrabold text-health-ink"
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() => toggleMonth(monthGroup.monthKey)}
                >
                  <span>{monthGroup.displayMonth}</span>
                  <span className="text-sm text-health-muted">
                    {monthGroup.events.length} events
                  </span>
                </button>
                {isExpanded ? (
                  <div className="mt-3">
                    {groupEventsByLocalDate(monthGroup.events).map((group) => (
                      <div key={group.dateKey}>
                        <h3 className={cn(ui.h3, ui.timelineGroupTitle)}>{group.displayDate}</h3>
                        <ol className={ui.timelineList}>
                          {group.events.map((event) => (
                            <TimelineItem
                              event={event}
                              key={event.id}
                              onEdit={onEdit}
                              onDelete={onDelete}
                            />
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function FilterButton({
  icon: Icon,
  label,
  isActive,
  activeCls,
  inactiveCls,
  iconActiveCls,
  iconInactiveCls,
  onClick,
}: {
  icon: typeof Activity;
  label: string;
  isActive: boolean;
  activeCls: string;
  inactiveCls: string;
  iconActiveCls: string;
  iconInactiveCls: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      className={cn(
        'flex flex-col items-center gap-1.5 rounded-[16px] border px-1.5 py-3 text-[0.7rem] font-bold transition-all duration-150',
        isActive ? activeCls : inactiveCls,
      )}
      onClick={onClick}
    >
      <Icon
        size={16}
        aria-hidden="true"
        className={cn('transition-colors duration-150', isActive ? iconActiveCls : iconInactiveCls)}
      />
      <span>{label}</span>
    </button>
  );
}

type TimelineSections = {
  recentEvents: TimelineEvent[];
  monthGroups: TimelineMonthGroup[];
};

type TimelineMonthGroup = {
  monthKey: string;
  displayMonth: string;
  events: TimelineEvent[];
};

const monthFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  year: 'numeric',
});

function getTimelineSections(
  events: TimelineEvent[],
  rangeDays?: TimelineRangeDays,
): TimelineSections {
  if (!rangeDays) {
    return { recentEvents: events, monthGroups: [] };
  }

  const rangeStart = addLocalDays(startOfLocalDay(new Date()), -(rangeDays - 1)).getTime();
  const recentEvents: TimelineEvent[] = [];
  const monthGroups = new Map<string, TimelineEvent[]>();

  for (const event of events) {
    const eventDate = new Date(event.timestamp);

    if (eventDate.getTime() >= rangeStart) {
      recentEvents.push(event);
      continue;
    }

    const monthKey = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}`;
    monthGroups.set(monthKey, [...(monthGroups.get(monthKey) ?? []), event]);
  }

  return {
    recentEvents,
    monthGroups: Array.from(monthGroups.entries())
      .sort(([left], [right]) => right.localeCompare(left))
      .map(([monthKey, monthEvents]) => ({
        monthKey,
        displayMonth: monthFormatter.format(new Date(`${monthKey}-01T00:00:00`)),
        events: monthEvents,
      })),
  };
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
