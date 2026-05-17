import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import type { SettingsRepository } from '../shared/storage/settingsRepository';
import type { TimelineRepository } from '../shared/storage/timelineRepository';
import type { TimelineEvent } from '../shared/types/domain';
import { defaultAppSettings, type AppSettings } from '../shared/types/settings';
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

function createMemorySettingsRepository(
  initialSettings: AppSettings = defaultAppSettings,
): SettingsRepository {
  let settings = initialSettings;

  return {
    getSettings() {
      return Promise.resolve(settings);
    },
    saveSettings(nextSettings) {
      settings = nextSettings;
      return Promise.resolve();
    },
  };
}

describe('App smoke flow', () => {
  it('closes the floating add menu when the backdrop is pressed', async () => {
    const user = userEvent.setup();

    render(
      <App
        repository={createMemoryRepository()}
        settingsStore={createMemorySettingsRepository()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /open add menu/i }));
    expect(await screen.findByRole('menu', { name: /add event options/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /dismiss add menu/i }));

    await waitFor(() => {
      expect(screen.queryByRole('menu', { name: /add event options/i })).not.toBeInTheDocument();
    });
  });

  it('adds a BP reading, shows it in today timeline, and includes it in reports', async () => {
    const user = userEvent.setup();

    render(
      <App
        repository={createMemoryRepository()}
        settingsStore={createMemorySettingsRepository()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /open add menu/i }));
    const addMenu = await screen.findByRole('menu', { name: /add event options/i });
    await user.click(within(addMenu).getByRole('menuitem', { name: /blood pressure/i }));
    await user.type(screen.getByLabelText(/systolic/i), '120');
    await user.type(screen.getByLabelText(/diastolic/i), '75');
    await user.type(screen.getByLabelText(/pulse optional/i), '74');
    await user.click(screen.getByRole('button', { name: /save reading/i }));

    expect(await screen.findByText('BP 120/75')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /reports/i }));

    await waitFor(() => {
      const summary = screen.getByLabelText(/blood pressure summary/i);
      expect(within(summary).getByText('Readings')).toBeInTheDocument();
      expect(within(summary).getByText('1')).toBeInTheDocument();
    });
    expect(screen.getByTestId('report-chart')).toBeInTheDocument();
  });
});
