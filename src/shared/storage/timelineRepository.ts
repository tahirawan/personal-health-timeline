import type { TimelineEvent } from '../types/domain';
import { db } from './db';

export type TimelineRepository = {
  addEvent(event: TimelineEvent): Promise<void>;
  addEvents(events: TimelineEvent[]): Promise<void>;
  putEvent(event: TimelineEvent): Promise<void>;
  deleteEvent(id: string): Promise<void>;
  listEvents(): Promise<TimelineEvent[]>;
  listEventsInRange(startIso: string, endIso: string): Promise<TimelineEvent[]>;
  replaceAll(events: TimelineEvent[]): Promise<void>;
};

export class DexieTimelineRepository implements TimelineRepository {
  async addEvent(event: TimelineEvent): Promise<void> {
    await db.timelineEvents.add(event);
  }

  async addEvents(events: TimelineEvent[]): Promise<void> {
    await db.timelineEvents.bulkAdd(events);
  }

  async putEvent(event: TimelineEvent): Promise<void> {
    await db.timelineEvents.put(event);
  }

  async deleteEvent(id: string): Promise<void> {
    await db.timelineEvents.delete(id);
  }

  async listEvents(): Promise<TimelineEvent[]> {
    return db.timelineEvents.orderBy('timestamp').toArray();
  }

  async listEventsInRange(startIso: string, endIso: string): Promise<TimelineEvent[]> {
    return db.timelineEvents.where('timestamp').between(startIso, endIso, true, false).toArray();
  }

  async replaceAll(events: TimelineEvent[]): Promise<void> {
    await db.transaction('rw', db.timelineEvents, async () => {
      await db.timelineEvents.clear();
      await db.timelineEvents.bulkAdd(events);
    });
  }
}

export const timelineRepository = new DexieTimelineRepository();
