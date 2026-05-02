import Dexie, { type Table } from 'dexie';

import type { TimelineEvent } from '../types/domain';

export class HealthTimelineDatabase extends Dexie {
  timelineEvents!: Table<TimelineEvent, string>;

  constructor() {
    super('healthTimeline');

    this.version(1).stores({
      timelineEvents: 'id, type, timestamp, createdAt',
    });

    this.version(2)
      .stores({
        timelineEvents: 'id, type, timestamp, createdAt',
      });

    // Version 3: removes any leftover flat fields from records that were
    // partially migrated in v2 (data added but old keys not deleted).
    this.version(3)
      .stores({
        timelineEvents: 'id, type, timestamp, createdAt',
      })
      .upgrade((tx) => {
        return tx
          .table('timelineEvents')
          .toCollection()
          .modify((event: Record<string, unknown>) => {
            const { type } = event;

            const existing = (event['data'] ?? {}) as Record<string, unknown>;

            if (type === 'bloodPressure') {
              event['data'] = {
                systolic: existing['systolic'] ?? event['systolic'],
                diastolic: existing['diastolic'] ?? event['diastolic'],
                pulse: existing['pulse'] ?? event['pulse'],
                mealRelation: existing['mealRelation'] ?? event['mealRelation'],
                notes: existing['notes'] ?? event['notes'],
              };
              delete event['systolic'];
              delete event['diastolic'];
              delete event['pulse'];
              delete event['mealRelation'];
              delete event['notes'];
            } else if (type === 'bloodSugar') {
              event['data'] = {
                reading: existing['reading'] ?? event['reading'],
                unit: existing['unit'] ?? event['unit'] ?? 'mg/dL',
                mealRelation: existing['mealRelation'] ?? event['mealRelation'],
                notes: existing['notes'] ?? event['notes'],
              };
              delete event['reading'];
              delete event['unit'];
              delete event['mealRelation'];
              delete event['notes'];
            } else if (type === 'meal') {
              event['data'] = {
                mealType: existing['mealType'] ?? event['mealType'],
                description: existing['description'] ?? event['description'],
              };
              delete event['mealType'];
              delete event['description'];
            } else if (type === 'tablet') {
              event['data'] = {
                medicationName: existing['medicationName'] ?? event['medicationName'],
                dosage: existing['dosage'] ?? event['dosage'],
                notes: existing['notes'] ?? event['notes'],
              };
              delete event['medicationName'];
              delete event['dosage'];
              delete event['notes'];
            } else if (type === 'note') {
              event['data'] = { text: existing['text'] ?? event['text'] };
              delete event['text'];
            }
          });
      });
  }
}

export const db = new HealthTimelineDatabase();

export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) {
    return false;
  }

  try {
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
