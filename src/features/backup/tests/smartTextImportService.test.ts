import { describe, expect, it } from 'vitest';

import { parseManualTimelineText } from '../services/smartTextImportService';

describe('smartTextImportService', () => {
  it('parses manual BP, meal, and tablet lines', () => {
    const result = parseManualTimelineText(`
2026-04-29
11:00 - Tablet
09:28 - 120/75 - 74 - After Breakfast
09:23 - Breakfast - egg with avocado sandwich
`);

    expect(result.invalidLines).toHaveLength(0);
    expect(result.events.map((event) => event.type)).toEqual(['tablet', 'bloodPressure', 'meal']);
    expect(result.events[1]).toMatchObject({
      type: 'bloodPressure',
      data: { systolic: 120, diastolic: 75, pulse: 74, mealRelation: 'after_breakfast' },
    });
  });

  it('parses BP lines without pulse and reports invalid lines', () => {
    const result = parseManualTimelineText(`
2026-04-27
12:12 - 128/87
not a valid line
`);

    expect(result.events[0]).toMatchObject({
      type: 'bloodPressure',
      data: { systolic: 128, diastolic: 87 },
    });
    expect(result.invalidLines).toHaveLength(1);
  });

  it('extracts relation and notes from compact BP text', () => {
    const result = parseManualTimelineText(`
2026-04-28
09:23 - 138/83 - 76 Before breakfast - chappati with omelette
`);

    expect(result.events[0]).toMatchObject({
      type: 'bloodPressure',
      data: { mealRelation: 'before_breakfast', notes: 'chappati with omelette' },
    });
  });
});
