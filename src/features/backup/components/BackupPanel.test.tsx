import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { TimelineEvent } from '../../../shared/types/domain';
import { BackupPanel } from './BackupPanel';

describe('BackupPanel', () => {
  it('shows export controls and previews smart text import', async () => {
    const user = userEvent.setup();
    const onImportEvents = vi.fn().mockResolvedValue(true);
    const events: TimelineEvent[] = [];

    render(<BackupPanel events={events} onImportEvents={onImportEvents} />);

    expect(screen.getByRole('button', { name: /export json backup/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export bp csv/i })).toBeInTheDocument();

    await user.type(
      screen.getByLabelText(/paste manual log text/i),
      '2026-04-29\n09:28 - 120/75 - 74 - After Breakfast',
    );
    await user.click(screen.getByRole('button', { name: /preview text/i }));

    expect(screen.getByText(/preview: 1 parsed events/i)).toBeInTheDocument();
  });

  it('loads and previews a JSON backup file', async () => {
    const user = userEvent.setup();
    const onImportEvents = vi.fn().mockResolvedValue(true);
    const exportedAt = new Date('2026-04-29T10:00:00.000Z').toISOString();
    const backup = JSON.stringify({
      version: 1,
      exportedAt,
      events: [
        {
          id: 'bp-1',
          type: 'bloodPressure',
          timestamp: exportedAt,
          systolic: 120,
          diastolic: 75,
          pulse: 74,
          createdAt: exportedAt,
          updatedAt: exportedAt,
        },
      ],
    });

    render(<BackupPanel events={[]} onImportEvents={onImportEvents} />);

    await user.upload(
      screen.getByLabelText(/choose backup json file/i),
      new File([backup], 'health-timeline-backup.json', { type: 'application/json' }),
    );

    expect(screen.getByText(/selected file: health-timeline-backup\.json/i)).toBeInTheDocument();
    expect(screen.getByText(/preview: 1 events, 1 bp/i)).toBeInTheDocument();
  });
});
