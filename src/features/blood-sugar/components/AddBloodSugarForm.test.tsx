import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AddBloodSugarForm } from './AddBloodSugarForm';

describe('AddBloodSugarForm', () => {
  it('submits reading with optional context and notes', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<AddBloodSugarForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/blood sugar/i), '95');
    await user.selectOptions(screen.getByLabelText(/context/i), 'fasting');
    await user.click(screen.getByRole('button', { name: /save reading/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        reading: 95,
        mealRelation: 'fasting',
      }),
      expect.anything(),
    );
  });

  it('shows validation error when reading is missing', async () => {
    const user = userEvent.setup();

    render(<AddBloodSugarForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /save reading/i }));

    expect(await screen.findByText(/reading is required/i)).toBeInTheDocument();
  });
});
