import { combineDateAndTimeToIso, toLocalDateKey } from '../../../shared/lib/date';
import { createId } from '../../../shared/lib/ids';
import type { MealRelation, MealType, TimelineEvent } from '../../../shared/types/domain';

export type SmartTextInvalidLine = {
  lineNumber: number;
  text: string;
  reason: string;
};

export type SmartTextImportResult = {
  events: TimelineEvent[];
  invalidLines: SmartTextInvalidLine[];
};

const dateHeaderPattern = /^\d{4}-\d{2}-\d{2}$/;
const timedLinePattern = /^(\d{1,2}:\d{2})\s*-\s*(.+)$/;
const bpPattern = /^(\d{2,3})\s*\/\s*(\d{2,3})(?:\s*-\s*(\d{2,3})(?:\s*(?:-\s*)?(.*))?)?$/i;

const mealLabels: Record<string, MealType> = {
  breakfast: 'breakfast',
  lunch: 'lunch',
  dinner: 'dinner',
  snack: 'snack',
};

const relationLabels: Array<[RegExp, MealRelation]> = [
  [/^before\s+breakfast/i, 'before_breakfast'],
  [/^after\s+breakfast/i, 'after_breakfast'],
  [/^before\s+lunch/i, 'before_lunch'],
  [/^after\s+lunch/i, 'after_lunch'],
  [/^before\s+dinner/i, 'before_dinner'],
  [/^after\s+dinner/i, 'after_dinner'],
  [/^before\s+meal/i, 'before_meal'],
  [/^after\s+meal/i, 'after_meal'],
];

export function parseManualTimelineText(
  input: string,
  defaultDate = toLocalDateKey(new Date()),
): SmartTextImportResult {
  const events: TimelineEvent[] = [];
  const invalidLines: SmartTextInvalidLine[] = [];
  let currentDate = defaultDate;

  input.split(/\r?\n/).forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const line = rawLine.trim();

    if (!line) {
      return;
    }

    if (dateHeaderPattern.test(line)) {
      currentDate = line;
      return;
    }

    const timedLine = line.match(timedLinePattern);
    if (!timedLine) {
      invalidLines.push({
        lineNumber,
        text: line,
        reason: 'Line is not a date header or timed event.',
      });
      return;
    }

    const [, timeOnly, detail] = timedLine;
    const timestamp = combineDateAndTimeToIso(currentDate, normalizeTime(timeOnly));
    const now = new Date().toISOString();
    const parsedEvent = parseTimedDetail(detail, timestamp, now);

    if (parsedEvent) {
      events.push(parsedEvent);
    } else {
      invalidLines.push({
        lineNumber,
        text: line,
        reason: 'Timed event type was not recognised.',
      });
    }
  });

  return { events, invalidLines };
}

function normalizeTime(timeOnly: string): string {
  const [hours, minutes] = timeOnly.split(':');
  return `${hours.padStart(2, '0')}:${minutes}`;
}

function parseTimedDetail(
  detail: string,
  timestamp: string,
  now: string,
): TimelineEvent | undefined {
  const trimmedDetail = detail.trim();
  const lower = trimmedDetail.toLowerCase();

  if (lower.startsWith('tablet')) {
    const notes = trimmedDetail.replace(/^tablet\s*-?\s*/i, '').trim();
    return {
      id: createId(),
      type: 'tablet',
      timestamp,
      notes: notes || undefined,
      createdAt: now,
      updatedAt: now,
    };
  }

  const meal = parseMealDetail(trimmedDetail, timestamp, now);
  if (meal) {
    return meal;
  }

  const bpMatch = trimmedDetail.match(bpPattern);
  if (bpMatch) {
    const [, systolic, diastolic, pulse, remainingText] = bpMatch;
    const relation = parseMealRelation(remainingText?.trim());

    return {
      id: createId(),
      type: 'bloodPressure',
      timestamp,
      systolic: Number(systolic),
      diastolic: Number(diastolic),
      pulse: pulse ? Number(pulse) : undefined,
      mealRelation: relation.mealRelation,
      notes: relation.notes,
      createdAt: now,
      updatedAt: now,
    };
  }

  return undefined;
}

function parseMealDetail(
  detail: string,
  timestamp: string,
  now: string,
): TimelineEvent | undefined {
  const mealMatch = detail.match(/^([a-z]+)(?:\s*-\s*(.+)|\s*\((.+)\))?$/i);

  if (!mealMatch) {
    return undefined;
  }

  const [, label, hyphenDescription, parentheticalDescription] = mealMatch;
  const mealType = mealLabels[label.toLowerCase()];

  if (!mealType) {
    return undefined;
  }

  return {
    id: createId(),
    type: 'meal',
    timestamp,
    mealType,
    description: hyphenDescription?.trim() || parentheticalDescription?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };
}

function parseMealRelation(text: string | undefined): {
  mealRelation?: MealRelation;
  notes?: string;
} {
  if (!text) {
    return {};
  }

  for (const [pattern, mealRelation] of relationLabels) {
    if (pattern.test(text)) {
      const notes = text
        .replace(pattern, '')
        .replace(/^\s*-\s*/, '')
        .trim();
      return {
        mealRelation,
        notes: notes || undefined,
      };
    }
  }

  return { notes: text };
}
