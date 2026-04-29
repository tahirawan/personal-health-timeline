import {
  addLocalDays,
  dateOnlyToExclusiveEndIso,
  dateOnlyToStartIso,
  endOfLocalDay,
  startOfLocalDay,
} from '../../../shared/lib/date';
import { average, maxValue, minValue } from '../../../shared/lib/numbers';
import type { BloodPressureEvent, TimelineEvent } from '../../../shared/types/domain';

export const reportPeriods = [
  'today',
  '7days',
  '30days',
  'monthly',
  'yearly',
  'overall',
  'custom',
] as const;

export type ReportPeriod = (typeof reportPeriods)[number];

export type CustomDateRange = {
  startDate?: string;
  endDate?: string;
};

export type BloodPressureSummary = {
  averageSystolic?: number;
  averageDiastolic?: number;
  averagePulse?: number;
  highestSystolic?: number;
  highestDiastolic?: number;
  lowestSystolic?: number;
  lowestDiastolic?: number;
  totalReadings: number;
};

export type TimelineCounts = {
  readings: number;
  meals: number;
  tablets: number;
  notes: number;
};

export type ChartPoint = {
  timestamp: string;
  label: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
};

export function getReportDateRange(
  period: ReportPeriod,
  now = new Date(),
  customRange: CustomDateRange = {},
): { start?: string; end?: string } {
  if (period === 'overall') {
    return {};
  }

  if (period === 'custom') {
    return {
      start: customRange.startDate ? dateOnlyToStartIso(customRange.startDate) : undefined,
      end: customRange.endDate ? dateOnlyToExclusiveEndIso(customRange.endDate) : undefined,
    };
  }

  if (period === 'today') {
    return {
      start: startOfLocalDay(now).toISOString(),
      end: endOfLocalDay(now).toISOString(),
    };
  }

  if (period === '7days') {
    return {
      start: addLocalDays(startOfLocalDay(now), -6).toISOString(),
      end: endOfLocalDay(now).toISOString(),
    };
  }

  if (period === '30days') {
    return {
      start: addLocalDays(startOfLocalDay(now), -29).toISOString(),
      end: endOfLocalDay(now).toISOString(),
    };
  }

  if (period === 'monthly') {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
    };
  }

  return {
    start: new Date(now.getFullYear(), 0, 1).toISOString(),
    end: new Date(now.getFullYear() + 1, 0, 1).toISOString(),
  };
}

export function filterEventsByRange(
  events: TimelineEvent[],
  range: { start?: string; end?: string },
): TimelineEvent[] {
  return events.filter((event) => {
    const timestamp = new Date(event.timestamp).getTime();
    const afterStart = range.start ? timestamp >= new Date(range.start).getTime() : true;
    const beforeEnd = range.end ? timestamp < new Date(range.end).getTime() : true;
    return afterStart && beforeEnd;
  });
}

export function filterBloodPressureEvents(events: TimelineEvent[]): BloodPressureEvent[] {
  return events.filter((event): event is BloodPressureEvent => event.type === 'bloodPressure');
}

export function calculateBloodPressureSummary(events: BloodPressureEvent[]): BloodPressureSummary {
  const systolic = events.map((event) => event.systolic);
  const diastolic = events.map((event) => event.diastolic);
  const pulse = events.flatMap((event) => (event.pulse === undefined ? [] : [event.pulse]));

  return {
    averageSystolic: average(systolic),
    averageDiastolic: average(diastolic),
    averagePulse: average(pulse),
    highestSystolic: maxValue(systolic),
    highestDiastolic: maxValue(diastolic),
    lowestSystolic: minValue(systolic),
    lowestDiastolic: minValue(diastolic),
    totalReadings: events.length,
  };
}

export function countTimelineEvents(events: TimelineEvent[]): TimelineCounts {
  return {
    readings: events.filter((event) => event.type === 'bloodPressure').length,
    meals: events.filter((event) => event.type === 'meal').length,
    tablets: events.filter((event) => event.type === 'tablet').length,
    notes: events.filter((event) => event.type === 'note').length,
  };
}

export function createChartPoints(events: BloodPressureEvent[]): ChartPoint[] {
  return [...events]
    .sort((left, right) => new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime())
    .map((event) => ({
      timestamp: event.timestamp,
      label: new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(event.timestamp)),
      systolic: event.systolic,
      diastolic: event.diastolic,
      pulse: event.pulse,
    }));
}
