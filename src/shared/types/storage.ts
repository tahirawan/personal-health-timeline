import type { TimelineEvent } from './domain';

export type BackupFile = {
  version: 1;
  exportedAt: string;
  events: TimelineEvent[];
};

export type ImportMode = 'merge' | 'replace';

export type ImportResult = {
  mode: ImportMode;
  imported: number;
  skippedDuplicates: number;
};
