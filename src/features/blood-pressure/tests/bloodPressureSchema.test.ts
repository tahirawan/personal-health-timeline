import { describe, expect, it } from 'vitest';

import { bloodPressureFormSchema } from '../schemas/bloodPressureFormSchema';

describe('bloodPressureFormSchema', () => {
  it('validates a complete blood pressure reading', () => {
    const result = bloodPressureFormSchema.parse({
      timestampLocal: '2026-04-29T09:28',
      systolic: '120',
      diastolic: '75',
      pulse: '74',
      mealRelation: 'after_breakfast',
      notes: 'After breakfast',
    });

    expect(result).toMatchObject({
      systolic: 120,
      diastolic: 75,
      pulse: 74,
      mealRelation: 'after_breakfast',
    });
  });

  it('allows pulse to be omitted', () => {
    const result = bloodPressureFormSchema.parse({
      timestampLocal: '2026-04-29T14:51',
      systolic: '135',
      diastolic: '90',
      pulse: '',
      mealRelation: '',
      notes: '',
    });

    expect(result.pulse).toBeUndefined();
    expect(result.mealRelation).toBeUndefined();
  });

  it('rejects obvious input mistakes', () => {
    expect(() =>
      bloodPressureFormSchema.parse({
        timestampLocal: '2026-04-29T14:51',
        systolic: '12',
        diastolic: '90',
        pulse: '',
        mealRelation: '',
        notes: '',
      }),
    ).toThrow();
  });
});
