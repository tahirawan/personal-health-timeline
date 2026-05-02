import { describe, expect, it } from 'vitest';

import type { TimelineEvent } from '../../../shared/types/domain';
import { groupEventsByLocalDate, sortTimelineEvents } from './timelineService';

const events: TimelineEvent[] = [
  {
    id: 'older',
    type: 'tablet',
    timestamp: '2026-04-28T12:47:00.000Z',
    data: { medicationName: undefined, dosage: undefined, notes: undefined },
    createdAt: '2026-04-28T12:47:00.000Z',
    updatedAt: '2026-04-28T12:47:00.000Z',
  },
  {
    id: 'newer',
    type: 'bloodPressure',
    timestamp: '2026-04-29T09:28:00.000Z',
    data: { systolic: 120, diastolic: 75, pulse: 74 },
    createdAt: '2026-04-29T09:28:00.000Z',
    updatedAt: '2026-04-29T09:28:00.000Z',
  },
];

describe('timelineService', () => {
  it('sorts timeline events newest first by default', () => {
    expect(sortTimelineEvents(events).map((event) => event.id)).toEqual(['newer', 'older']);
  });

  it('groups events by local day', () => {
    const groups = groupEventsByLocalDate(events);

    expect(groups).toHaveLength(2);
    expect(groups[0]?.events[0]?.id).toBe('newer');
  });
});
