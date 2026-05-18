type EventRecord = Record<string, unknown>;

export function normalizeTimelineEventCandidate(candidate: unknown): unknown {
  if (!isEventRecord(candidate) || typeof candidate.type !== 'string') {
    return candidate;
  }

  const data = isEventRecord(candidate.data) ? candidate.data : {};
  const base = {
    id: candidate.id,
    timestamp: candidate.timestamp,
    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt,
  };

  if (candidate.type === 'bloodPressure') {
    return {
      ...base,
      type: candidate.type,
      data: withoutUndefined({
        systolic: data.systolic ?? candidate.systolic,
        diastolic: data.diastolic ?? candidate.diastolic,
        pulse: data.pulse ?? candidate.pulse,
        mealRelation: data.mealRelation ?? candidate.mealRelation,
        notes: data.notes ?? candidate.notes,
      }),
    };
  }

  if (candidate.type === 'bloodSugar') {
    return {
      ...base,
      type: candidate.type,
      data: withoutUndefined({
        reading: data.reading ?? candidate.reading,
        unit: data.unit ?? candidate.unit ?? 'mg/dL',
        mealRelation: data.mealRelation ?? candidate.mealRelation,
        notes: data.notes ?? candidate.notes,
      }),
    };
  }

  if (candidate.type === 'meal') {
    return {
      ...base,
      type: candidate.type,
      data: withoutUndefined({
        mealType: data.mealType ?? candidate.mealType,
        description: data.description ?? candidate.description,
      }),
    };
  }

  if (candidate.type === 'tablet') {
    return {
      ...base,
      type: candidate.type,
      data: withoutUndefined({
        medicationName: data.medicationName ?? candidate.medicationName,
        dosage: data.dosage ?? candidate.dosage,
        notes: data.notes ?? candidate.notes,
      }),
    };
  }

  if (candidate.type === 'note') {
    return {
      ...base,
      type: candidate.type,
      data: withoutUndefined({
        text: data.text ?? candidate.text,
      }),
    };
  }

  return candidate;
}

function isEventRecord(value: unknown): value is EventRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function withoutUndefined(record: EventRecord): EventRecord {
  return Object.fromEntries(
    Object.entries(record).filter((entry): entry is [string, Exclude<unknown, undefined>] => {
      const [, value] = entry;
      return value !== undefined;
    }),
  );
}
