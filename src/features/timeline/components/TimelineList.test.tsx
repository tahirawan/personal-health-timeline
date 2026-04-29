import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { TimelineEvent } from '../../../shared/types/domain';
import { TimelineList } from './TimelineList';

const events: TimelineEvent[] = [
  {
    id: 'bp-1',
    type: 'bloodPressure',
    timestamp: new Date().toISOString(),
    systolic: 120,
    diastolic: 75,
    pulse: 74,
    mealRelation: 'after_breakfast',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'meal-1',
    type: 'meal',
    timestamp: new Date(Date.now() - 60_000).toISOString(),
    mealType: 'breakfast',
    description: 'Egg with avocado sandwich',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('TimelineList', () => {
  it('renders mixed timeline event types', () => {
    render(<TimelineList events={events} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('BP 120/75')).toBeInTheDocument();
    expect(screen.getByText(/pulse 74 after breakfast/i)).toBeInTheDocument();
    expect(screen.getByText('Breakfast')).toBeInTheDocument();
    expect(screen.getByText('Egg with avocado sandwich')).toBeInTheDocument();
  });
});
