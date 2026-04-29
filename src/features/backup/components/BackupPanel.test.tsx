import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { TimelineEvent } from '../../../shared/types/domain';
import { BackupPanel } from './BackupPanel';

describe('BackupPanel', () => {
  it('shows export controls and previews smart text import', async () => {
    const user = userEvent.setup();
    const onImportEvents = vi.fn();
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
});
