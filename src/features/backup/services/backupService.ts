import { z } from 'zod';

import { backupFileSchema } from '../../../shared/types/schemas';
import type { BackupFile, ImportResult } from '../../../shared/types/storage';
import type { BloodPressureEvent, TimelineEvent } from '../../../shared/types/domain';

export type ImportPreview = {
  backup: BackupFile;
  totalEvents: number;
  bloodPressureCount: number;
  mealCount: number;
  tabletCount: number;
  noteCount: number;
};

export function createBackup(
  events: TimelineEvent[],
  exportedAt = new Date().toISOString(),
): BackupFile {
  return {
    version: 1,
    exportedAt,
    events,
  };
}

export function exportBackupJson(events: TimelineEvent[]): string {
  return JSON.stringify(createBackup(events), null, 2);
}

export function parseBackupJson(input: string): ImportPreview {
  let parsed: unknown;

  try {
    parsed = JSON.parse(input);
  } catch {
    throw new Error('Backup file is not valid JSON.');
  }

  const backup = backupFileSchema.parse(parsed);
  return summarizeBackup(backup);
}

export function summarizeBackup(backup: BackupFile): ImportPreview {
  return {
    backup,
    totalEvents: backup.events.length,
    bloodPressureCount: backup.events.filter((event) => event.type === 'bloodPressure').length,
    mealCount: backup.events.filter((event) => event.type === 'meal').length,
    tabletCount: backup.events.filter((event) => event.type === 'tablet').length,
    noteCount: backup.events.filter((event) => event.type === 'note').length,
  };
}

export function toReadableImportError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues.map((issue) => issue.message).join(' ');
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Backup file could not be read.';
}

export function getMergeableEvents(
  existingEvents: TimelineEvent[],
  importedEvents: TimelineEvent[],
): TimelineEvent[] {
  const existingIds = new Set(existingEvents.map((event) => event.id));
  return importedEvents.filter((event) => !existingIds.has(event.id));
}

export function describeImportResult(
  mode: 'merge' | 'replace',
  existingEvents: TimelineEvent[],
  importedEvents: TimelineEvent[],
): ImportResult {
  if (mode === 'replace') {
    return {
      mode,
      imported: importedEvents.length,
      skippedDuplicates: 0,
    };
  }

  const mergeableEvents = getMergeableEvents(existingEvents, importedEvents);
  return {
    mode,
    imported: mergeableEvents.length,
    skippedDuplicates: importedEvents.length - mergeableEvents.length,
  };
}

function escapeCsvCell(value: string | number | undefined): string {
  if (value === undefined) {
    return '';
  }

  const text = String(value);
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function isBloodPressureEvent(event: TimelineEvent): event is BloodPressureEvent {
  return event.type === 'bloodPressure';
}

export function exportBloodPressureCsv(events: TimelineEvent[]): string {
  const header = ['timestamp', 'systolic', 'diastolic', 'pulse', 'mealRelation', 'notes'];
  const rows = events
    .filter(isBloodPressureEvent)
    .sort((left, right) => new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime())
    .map((event) =>
      [
        event.timestamp,
        event.data.systolic,
        event.data.diastolic,
        event.data.pulse,
        event.data.mealRelation,
        event.data.notes,
      ]
        .map(escapeCsvCell)
        .join(','),
    );

  return [header.join(','), ...rows].join('\n');
}
