import { describe, expect, it } from 'vitest';

import type { TimelineEvent } from '../../../shared/types/domain';
import {
  exportBackupJson,
  exportBloodPressureCsv,
  getMergeableEvents,
  parseBackupJson,
} from '../services/backupService';

const events: TimelineEvent[] = [
  {
    id: 'bp-1',
    type: 'bloodPressure',
    timestamp: '2026-04-29T09:28:00.000Z',
    data: {
      systolic: 120,
      diastolic: 75,
      pulse: 74,
      mealRelation: 'after_breakfast',
      notes: 'After breakfast, comma',
    },
    createdAt: '2026-04-29T09:28:00.000Z',
    updatedAt: '2026-04-29T09:28:00.000Z',
  },
  {
    id: 'meal-1',
    type: 'meal',
    timestamp: '2026-04-29T09:23:00.000Z',
    data: { mealType: 'breakfast', description: 'Egg sandwich' },
    createdAt: '2026-04-29T09:23:00.000Z',
    updatedAt: '2026-04-29T09:23:00.000Z',
  },
];

describe('backupService', () => {
  it('exports and validates JSON backup shape', () => {
    const json = exportBackupJson(events);
    const preview = parseBackupJson(json);

    expect(preview.totalEvents).toBe(2);
    expect(preview.bloodPressureCount).toBe(1);
    expect(preview.mealCount).toBe(1);
  });

  it('rejects invalid backup records', () => {
    expect(() =>
      parseBackupJson(
        JSON.stringify({
          version: 1,
          exportedAt: '2026-04-29T09:28:00.000Z',
          events: [{ id: 'bad', type: 'unknown' }],
        }),
      ),
    ).toThrow();
  });

  it('exports CSV for BP readings only and escapes notes', () => {
    expect(exportBloodPressureCsv(events)).toBe(
      'timestamp,systolic,diastolic,pulse,mealRelation,notes\n' +
        '2026-04-29T09:28:00.000Z,120,75,74,after_breakfast,"After breakfast, comma"',
    );
  });

  it('keeps existing events during merge import', () => {
    expect(getMergeableEvents(events, events)).toHaveLength(0);
    expect(getMergeableEvents([], events)).toHaveLength(2);
  });
});
