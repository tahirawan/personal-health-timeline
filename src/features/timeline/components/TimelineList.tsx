import { Activity, Pill, StickyNote, Trash2, Utensils, Pencil } from 'lucide-react';

import { formatDisplayTime } from '../../../shared/lib/date';
import { cn } from '../../../shared/lib/classNames';
import { timelineIconClasses, ui } from '../../../shared/lib/uiStyles';
import type {
  BloodPressureEvent,
  MealEvent,
  MealRelation,
  NoteEvent,
  TabletEvent,
  TimelineEvent,
} from '../../../shared/types/domain';
import { groupEventsByLocalDate } from '../services/timelineService';

type TimelineListProps = {
  events: TimelineEvent[];
  title?: string;
  emptyMessage?: string;
  onEdit?: (event: TimelineEvent) => void;
  onDelete?: (event: TimelineEvent) => void;
};

const mealRelationLabels: Record<MealRelation, string> = {
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
  onEdit,
  onDelete,
}: TimelineListProps) {
  if (events.length === 0) {
    return (
      <section className={ui.section} aria-labelledby="timeline-heading">
        <h2 className={ui.h2} id="timeline-heading">
          {title}
        </h2>
        <p className={ui.emptyState}>{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className={ui.section} aria-labelledby="timeline-heading">
      <h2 className={ui.h2} id="timeline-heading">
        {title}
      </h2>
      <div className={ui.timelineGroups}>
        {groupEventsByLocalDate(events).map((group) => (
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
  return (
    <li className={ui.timelineItem}>
      <div className={ui.timelineTime}>{formatDisplayTime(event.timestamp)}</div>
      <div className={cn(ui.timelineIcon, timelineIconClasses[event.type])} aria-hidden="true">
        {getEventIcon(event)}
      </div>
      <div className={ui.timelineContent}>{getEventContent(event)}</div>
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
    </li>
  );
}

function getEventIcon(event: TimelineEvent) {
  if (event.type === 'bloodPressure') {
    return <Activity size={18} />;
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

  if (event.type === 'meal') {
    return `${event.mealType} meal`;
  }

  if (event.type === 'tablet') {
    return 'tablet event';
  }

  return 'note';
}

function getEventContent(event: TimelineEvent) {
  if (event.type === 'bloodPressure') {
    return <BloodPressureContent event={event} />;
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
        BP {`${event.systolic}/${event.diastolic}`}
      </strong>
      <span className={ui.timelineContentText}>
        {event.pulse ? `Pulse ${event.pulse}` : null}
        {event.mealRelation ? ` ${mealRelationLabels[event.mealRelation]}` : null}
      </span>
      {event.notes ? <small className={ui.timelineMutedText}>{event.notes}</small> : null}
    </>
  );
}

function MealContent({ event }: { event: MealEvent }) {
  return (
    <>
      <strong className={ui.timelineContentStrong}>
        {event.mealType[0]?.toUpperCase() + event.mealType.slice(1)}
      </strong>
      {event.description ? (
        <span className={ui.timelineContentText}>{event.description}</span>
      ) : null}
    </>
  );
}

function TabletContent({ event }: { event: TabletEvent }) {
  return (
    <>
      <strong className={ui.timelineContentStrong}>{event.medicationName || 'Tablet'}</strong>
      {event.dosage ? <span className={ui.timelineContentText}>{event.dosage}</span> : null}
      {event.notes ? <small className={ui.timelineMutedText}>{event.notes}</small> : null}
    </>
  );
}

function NoteContent({ event }: { event: NoteEvent }) {
  return (
    <>
      <strong className={ui.timelineContentStrong}>Note</strong>
      <span className={ui.timelineContentText}>{event.text}</span>
    </>
  );
}
