import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AddBloodPressureForm } from './AddBloodPressureForm';

describe('AddBloodPressureForm', () => {
  it('submits required BP fields and optional pulse', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<AddBloodPressureForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/systolic/i), '120');
    await user.type(screen.getByLabelText(/diastolic/i), '75');
    await user.type(screen.getByLabelText(/pulse optional/i), '74');
    await user.selectOptions(screen.getByLabelText(/meal relation/i), 'after_breakfast');
    await user.click(screen.getByRole('button', { name: /save reading/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        systolic: 120,
        diastolic: 75,
        pulse: 74,
        mealRelation: 'after_breakfast',
      }),
      expect.anything(),
    );
  });

  it('shows validation errors for missing BP numbers', async () => {
    const user = userEvent.setup();

    render(<AddBloodPressureForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /save reading/i }));

    expect(await screen.findByText(/systolic is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/diastolic is required/i)).toBeInTheDocument();
  });
});
