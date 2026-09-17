import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import api from '../../lib/api';
import ResetPassword from './ResetPassword';

vi.mock('../../lib/api', () => ({ default: { post: vi.fn() } }));

it('offers a replacement link when the token is missing', () => {
  render(<MemoryRouter><ResetPassword /></MemoryRouter>);
  expect(screen.getByText('Invalid Link')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Request a new link' }).getAttribute('href')).toBe('/forgot-password');
  expect(api.post).not.toHaveBeenCalled();
});

it('checks confirmation, toggles visibility and handles retry and pending submission', async () => {
  const user = userEvent.setup();
  let finish!: () => void;
  vi.mocked(api.post).mockRejectedValueOnce(new Error('expired')).mockImplementationOnce(() => new Promise(resolve => {
    finish = () => resolve({ data: {} });
  }));
  render(<MemoryRouter initialEntries={['/reset-password?token=demo-token']}><ResetPassword /></MemoryRouter>);
  const password = screen.getByLabelText('New Password') as HTMLInputElement;
  await user.type(password, 'NewPassword123!');
  expect((screen.getByRole('button', { name: 'Reset Password' }) as HTMLButtonElement).disabled).toBe(true);
  await user.click(screen.getByRole('button', { name: 'Show passwords' }));
  expect(password.type).toBe('text');
  await user.click(screen.getByRole('button', { name: 'Hide passwords' }));
  expect(password.type).toBe('password');
  await user.type(screen.getByLabelText('Confirm New Password'), 'NewPassword123!');
  await user.click(screen.getByRole('button', { name: 'Reset Password' }));
  expect(await screen.findByRole('alert')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Reset Password' }));
  expect((screen.getByRole('button', { name: 'Resetting...' }) as HTMLButtonElement).disabled).toBe(true);
  expect(api.post).toHaveBeenLastCalledWith('/auth/reset-password', { token: 'demo-token', newPassword: 'NewPassword123!' });
  await act(async () => { finish(); });
  expect(await screen.findByText('Password Updated!')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Back to Login' }).getAttribute('href')).toBe('/login');
});
