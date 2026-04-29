import { Activity, Pill, StickyNote, Trash2, Utensils, Pencil } from 'lucide-react';

import { formatDisplayTime } from '../../../shared/lib/date';
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
      <section className="section-block" aria-labelledby="timeline-heading">
        <h2 id="timeline-heading">{title}</h2>
        <p className="empty-state">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className="section-block" aria-labelledby="timeline-heading">
      <h2 id="timeline-heading">{title}</h2>
      <div className="timeline-groups">
        {groupEventsByLocalDate(events).map((group) => (
          <div className="timeline-group" key={group.dateKey}>
            <h3>{group.displayDate}</h3>
            <ol className="timeline-list">
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
    <li className={`timeline-item timeline-item-${event.type}`}>
      <div className="timeline-time">{formatDisplayTime(event.timestamp)}</div>
      <div className="timeline-icon" aria-hidden="true">
        {getEventIcon(event)}
      </div>
      <div className="timeline-content">{getEventContent(event)}</div>
      <div className="timeline-actions">
        {onEdit ? (
          <button
            className="icon-button"
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
            className="icon-button danger"
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
      <strong>BP {`${event.systolic}/${event.diastolic}`}</strong>
      <span>
        {event.pulse ? `Pulse ${event.pulse}` : null}
        {event.mealRelation ? ` ${mealRelationLabels[event.mealRelation]}` : null}
      </span>
      {event.notes ? <small>{event.notes}</small> : null}
    </>
  );
}

function MealContent({ event }: { event: MealEvent }) {
  return (
    <>
      <strong>{event.mealType[0]?.toUpperCase() + event.mealType.slice(1)}</strong>
      {event.description ? <span>{event.description}</span> : null}
    </>
  );
}

function TabletContent({ event }: { event: TabletEvent }) {
  return (
    <>
      <strong>{event.medicationName || 'Tablet'}</strong>
      {event.dosage ? <span>{event.dosage}</span> : null}
      {event.notes ? <small>{event.notes}</small> : null}
    </>
  );
}

function NoteContent({ event }: { event: NoteEvent }) {
  return (
    <>
      <strong>Note</strong>
      <span>{event.text}</span>
    </>
  );
}
