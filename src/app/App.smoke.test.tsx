import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import type { TimelineRepository } from '../shared/storage/timelineRepository';
import type { TimelineEvent } from '../shared/types/domain';
import { App } from './App';

function createMemoryRepository(initialEvents: TimelineEvent[] = []): TimelineRepository {
  let events = [...initialEvents];

  return {
    addEvent(event) {
      events = [...events, event];
      return Promise.resolve();
    },
    addEvents(newEvents) {
      events = [...events, ...newEvents];
      return Promise.resolve();
    },
    putEvent(event) {
      events = events.map((storedEvent) => (storedEvent.id === event.id ? event : storedEvent));
      return Promise.resolve();
    },
    deleteEvent(id) {
      events = events.filter((event) => event.id !== id);
      return Promise.resolve();
    },
    listEvents() {
      return Promise.resolve([...events]);
    },
    listEventsInRange(startIso, endIso) {
      return Promise.resolve(
        events.filter((event) => event.timestamp >= startIso && event.timestamp < endIso),
      );
    },
    replaceAll(newEvents) {
      events = [...newEvents];
      return Promise.resolve();
    },
  };
}

describe('App smoke flow', () => {
  it('adds a BP reading, shows it in today timeline, and includes it in reports', async () => {
    const user = userEvent.setup();

    render(<App repository={createMemoryRepository()} />);

    await user.click(screen.getByRole('button', { name: /add reading/i }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /blood pressure/i }));
    await user.type(screen.getByLabelText(/systolic/i), '120');
    await user.type(screen.getByLabelText(/diastolic/i), '75');
    await user.type(screen.getByLabelText(/pulse optional/i), '74');
    await user.click(screen.getByRole('button', { name: /save reading/i }));

    expect(await screen.findByText('BP 120/75')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /reports/i }));

    await waitFor(() => {
      const summary = screen.getByLabelText(/blood pressure summary/i);
      expect(within(summary).getByText('Total readings')).toBeInTheDocument();
      expect(within(summary).getByText('1')).toBeInTheDocument();
    });
    expect(screen.getByTestId('report-chart')).toBeInTheDocument();
  });
});
