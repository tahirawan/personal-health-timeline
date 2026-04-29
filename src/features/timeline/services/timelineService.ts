import { formatDisplayDate, toLocalDateKey } from '../../../shared/lib/date';
import type { TimelineEvent } from '../../../shared/types/domain';

export type TimelineGroup = {
  dateKey: string;
  displayDate: string;
  events: TimelineEvent[];
};

export function sortTimelineEvents(
  events: TimelineEvent[],
  direction: 'asc' | 'desc' = 'desc',
): TimelineEvent[] {
  return [...events].sort((left, right) => {
    const comparison = new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime();
    return direction === 'asc' ? comparison : -comparison;
  });
}

export function groupEventsByLocalDate(events: TimelineEvent[]): TimelineGroup[] {
  const sorted = sortTimelineEvents(events, 'desc');
  const groups = new Map<string, TimelineEvent[]>();

  for (const event of sorted) {
    const dateKey = toLocalDateKey(event.timestamp);
    groups.set(dateKey, [...(groups.get(dateKey) ?? []), event]);
  }

  return Array.from(groups.entries()).map(([dateKey, groupEvents]) => ({
    dateKey,
    displayDate: formatDisplayDate(groupEvents[0]?.timestamp ?? `${dateKey}T00:00:00.000Z`),
    events: groupEvents,
  }));
}

export function filterEventsForLocalDate(
  events: TimelineEvent[],
  dateKey: string,
): TimelineEvent[] {
  return sortTimelineEvents(
    events.filter((event) => toLocalDateKey(event.timestamp) === dateKey),
    'desc',
  );
}
