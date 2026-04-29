import Dexie, { type Table } from 'dexie';

import type { TimelineEvent } from '../types/domain';

export class HealthTimelineDatabase extends Dexie {
  timelineEvents!: Table<TimelineEvent, string>;

  constructor() {
    super('healthTimeline');

    this.version(1).stores({
      timelineEvents: 'id, type, timestamp, createdAt',
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
