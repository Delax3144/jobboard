import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import api from '../../lib/api';
import ForgotPassword from './ForgotPassword';

vi.mock('../../lib/api', () => ({ default: { post: vi.fn() } }));

it('allows retry after failure and disables sending while a request is pending', async () => {
  const user = userEvent.setup();
  let finish!: () => void;
  vi.mocked(api.post).mockRejectedValueOnce(new Error('offline')).mockImplementationOnce(() => new Promise(resolve => {
    finish = () => resolve({ data: {} });
  }));
  render(<MemoryRouter><ForgotPassword /></MemoryRouter>);
  await user.type(screen.getByLabelText('Email Address'), 'alex@example.com');
  await user.click(screen.getByRole('button', { name: 'Send Reset Link' }));
  expect(await screen.findByRole('alert')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Send Reset Link' }));
  expect((screen.getByRole('button', { name: 'Sending Link...' }) as HTMLButtonElement).disabled).toBe(true);
  expect(api.post).toHaveBeenLastCalledWith('/auth/request-password-reset', { email: 'alex@example.com' });
  await act(async () => { finish(); });
  expect(await screen.findByText('Check your email')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Try another email' }));
  expect(screen.getByLabelText('Email Address')).toBeTruthy();
});
