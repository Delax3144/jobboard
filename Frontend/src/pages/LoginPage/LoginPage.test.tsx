import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import api from '../../lib/api';
import LoginPage from './LoginPage';

vi.mock('../../lib/api', () => ({ default: { post: vi.fn() } }));
vi.mock('@react-oauth/google', () => ({ GoogleLogin: () => null }));
const auth = vi.hoisted(() => ({ googleLogin: vi.fn(), githubLogin: vi.fn() }));
vi.mock('../../context/useAuth', () => ({ useAuth: () => auth }));

it('keeps two-factor validation, pending state and return to login working', async () => {
  const user = userEvent.setup();
  const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
  let rejectVerification!: () => void;
  vi.mocked(api.post)
    .mockResolvedValueOnce({ data: { requires2FA: true, challengeToken: 'test-challenge' } })
    .mockImplementationOnce(() => new Promise((_, reject) => {
      rejectVerification = () => reject(new Error('invalid code'));
    }));
  render(<MemoryRouter><LoginPage /></MemoryRouter>);
  await user.type(screen.getByPlaceholderText('name@example.com'), 'demo@example.com');
  await user.type(screen.getByPlaceholderText('••••••••'), 'test-password');
  await user.click(screen.getByRole('checkbox', { name: 'Remember me' }));
  await user.click(screen.getByRole('button', { name: 'Login to Account' }));
  expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'demo@example.com', password: 'test-password' });
  await screen.findByText('Two-Factor Auth');
  const submit = screen.getByRole('button', { name: 'Confirm & Login' }) as HTMLButtonElement;
  expect(submit.disabled).toBe(true);
  await user.type(screen.getByPlaceholderText('000000'), 'ab12345');
  expect((screen.getByPlaceholderText('000000') as HTMLInputElement).value).toBe('12345');
  expect(submit.disabled).toBe(true);
  await user.type(screen.getByPlaceholderText('000000'), '6');
  expect(submit.disabled).toBe(false);
  await user.click(submit);
  expect((screen.getByRole('button', { name: 'Verifying...' }) as HTMLButtonElement).disabled).toBe(true);
  expect(api.post).toHaveBeenLastCalledWith('/auth/verify-2fa-login', { challengeToken: 'test-challenge', code: '123456' });
  await act(async () => { rejectVerification(); });
  expect(alert).toHaveBeenCalledWith('Invalid 2FA code');
  expect((screen.getByRole('button', { name: 'Confirm & Login' }) as HTMLButtonElement).disabled).toBe(false);
  await user.click(screen.getByRole('button', { name: 'Back to login' }));
  expect((screen.getByPlaceholderText('name@example.com') as HTMLInputElement).value).toBe('demo@example.com');
  expect((screen.getByRole('checkbox', { name: 'Remember me' }) as HTMLInputElement).checked).toBe(true);
});
