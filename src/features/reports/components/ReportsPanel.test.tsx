import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { TimelineEvent } from '../../../shared/types/domain';
import { ReportsPanel } from './ReportsPanel';

function makeEvent(partial: TimelineEvent): TimelineEvent {
  return partial;
}

const today = new Date();
const twoDaysAgo = new Date();
twoDaysAgo.setDate(today.getDate() - 2);

const events: TimelineEvent[] = [
  makeEvent({
    id: 'bp-1',
    type: 'bloodPressure',
    timestamp: today.toISOString(),
    systolic: 120,
    diastolic: 75,
    pulse: 74,
    createdAt: today.toISOString(),
    updatedAt: today.toISOString(),
  }),
  makeEvent({
    id: 'meal-1',
    type: 'meal',
    timestamp: twoDaysAgo.toISOString(),
    mealType: 'lunch',
    description: 'Lamb burger',
    createdAt: twoDaysAgo.toISOString(),
    updatedAt: twoDaysAgo.toISOString(),
  }),
];

describe('ReportsPanel', () => {
  it('renders report filters, BP stats, and context counts', async () => {
    const user = userEvent.setup();

    render(<ReportsPanel events={events} onOpenBackup={vi.fn()} />);

    expect(screen.getByRole('combobox', { name: /report period/i })).toHaveValue('7days');
    expect(
      within(screen.getByLabelText(/blood pressure summary/i)).getAllByText('120'),
    ).toHaveLength(3);
    expect(screen.getByText('Meals logged')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open backup page/i })).toBeInTheDocument();

    await user.selectOptions(screen.getByRole('combobox', { name: /report period/i }), 'custom');

    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
  });
});
