import { describe, expect, it } from 'vitest';

import { bloodSugarFormSchema } from '../schemas/bloodSugarFormSchema';

describe('bloodSugarFormSchema', () => {
  it('validates a complete blood sugar reading', () => {
    const result = bloodSugarFormSchema.parse({
      timestampLocal: '2026-04-29T09:28',
      reading: 95,
      mealRelation: 'fasting',
      notes: 'Morning fasting',
    });

    expect(result).toMatchObject({
      reading: 95,
      mealRelation: 'fasting',
      notes: 'Morning fasting',
    });
  });

  it('allows mealRelation and notes to be omitted', () => {
    const result = bloodSugarFormSchema.parse({
      timestampLocal: '2026-04-29T14:51',
      reading: 110,
      mealRelation: '',
      notes: '',
    });

    expect(result.mealRelation).toBeUndefined();
    expect(result.notes).toBeUndefined();
  });

  it('rejects readings below the valid range', () => {
    expect(() =>
      bloodSugarFormSchema.parse({
        timestampLocal: '2026-04-29T14:51',
        reading: 10,
        mealRelation: '',
        notes: '',
      }),
    ).toThrow();
  });

  it('rejects readings above the valid range', () => {
    expect(() =>
      bloodSugarFormSchema.parse({
        timestampLocal: '2026-04-29T14:51',
        reading: 700,
        mealRelation: '',
        notes: '',
      }),
    ).toThrow();
  });

  it('rejects missing reading', () => {
    expect(() =>
      bloodSugarFormSchema.parse({
        timestampLocal: '2026-04-29T14:51',
        mealRelation: '',
        notes: '',
      }),
    ).toThrow();
  });
});
