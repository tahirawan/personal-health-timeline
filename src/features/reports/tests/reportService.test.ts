import { describe, expect, it } from 'vitest';

import type { TimelineEvent } from '../../../shared/types/domain';
import {
  calculateBloodPressureSummary,
  countTimelineEvents,
  filterBloodPressureEvents,
  filterEventsByRange,
  getReportDateRange,
} from '../services/reportService';

const mixedEvents: TimelineEvent[] = [
  {
    id: 'bp-1',
    type: 'bloodPressure',
    timestamp: '2026-04-29T09:28:00.000Z',
    systolic: 120,
    diastolic: 75,
    pulse: 74,
    createdAt: '2026-04-29T09:28:00.000Z',
    updatedAt: '2026-04-29T09:28:00.000Z',
  },
  {
    id: 'bp-2',
    type: 'bloodPressure',
    timestamp: '2026-04-29T21:44:00.000Z',
    systolic: 130,
    diastolic: 85,
    createdAt: '2026-04-29T21:44:00.000Z',
    updatedAt: '2026-04-29T21:44:00.000Z',
  },
  {
    id: 'meal-1',
    type: 'meal',
    timestamp: '2026-04-29T09:23:00.000Z',
    mealType: 'breakfast',
    description: 'Egg sandwich',
    createdAt: '2026-04-29T09:23:00.000Z',
    updatedAt: '2026-04-29T09:23:00.000Z',
  },
];

describe('reportService', () => {
  it('calculates BP metrics from readings only', () => {
    const readings = filterBloodPressureEvents(mixedEvents);
    const summary = calculateBloodPressureSummary(readings);

    expect(summary).toEqual({
      averageSystolic: 125,
      averageDiastolic: 80,
      averagePulse: 74,
      highestSystolic: 130,
      highestDiastolic: 85,
      lowestSystolic: 120,
      lowestDiastolic: 75,
      totalReadings: 2,
    });
  });

  it('filters events by date range', () => {
    const range = getReportDateRange('today', new Date('2026-04-29T12:00:00'));
    const filtered = filterEventsByRange(mixedEvents, range);

    expect(filtered).toHaveLength(3);
  });

  it('counts timeline context separately from BP readings', () => {
    expect(countTimelineEvents(mixedEvents)).toMatchObject({
      readings: 2,
      meals: 1,
      tablets: 0,
      notes: 0,
    });
  });
});
