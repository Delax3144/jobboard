import { expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import api from '../lib/api';
import VerifyEmail from './VerifyEmail';

vi.mock('../lib/api', () => ({ default: { post: vi.fn() } }));

function renderPage(path = '/verify-email?token=expired-token') {
  return render(<MemoryRouter initialEntries={[path]}><VerifyEmail /></MemoryRouter>);
}

it('requests a replacement for an expired link and prevents duplicate submissions while sending', async () => {
  const user = userEvent.setup();
  let finishSending!: () => void;
  vi.mocked(api.post)
    .mockRejectedValueOnce(new Error('Expired token'))
    .mockImplementationOnce(() => new Promise(resolve => {
      finishSending = () => resolve({ data: {} });
    }));
  renderPage();
  await user.type(await screen.findByLabelText('Email address'), 'Candidate@Example.com');
  await user.click(screen.getByRole('button', { name: 'Send verification link' }));
  const sendingButton = screen.getByRole<HTMLButtonElement>('button', { name: 'Sending link...' });
  expect(sendingButton.disabled).toBe(true);
  await user.click(sendingButton);
  expect(api.post).toHaveBeenCalledTimes(2);
  expect(api.post).toHaveBeenLastCalledWith('/auth/resend-verification', { email: 'candidate@example.com' });
  await act(async () => finishSending());
  expect((await screen.findByRole('status')).textContent).toContain('If an unverified account');
  expect(screen.getByRole('link', { name: 'Back to Login' }).getAttribute('href')).toBe('/login');
  await user.click(screen.getByRole('button', { name: 'Try another email' }));
  expect(screen.getByLabelText('Email address')).toBeTruthy();
});

it.each([
  [{ isAxiosError: true, response: { data: { message: 'Too many requests. Please try again later.' } } }, 'Too many requests. Please try again later.'],
  [new Error('Network error'), 'Could not send a verification link. Please try again.'],
])('shows a resend failure and allows another attempt: %s', async (error, message) => {
  const user = userEvent.setup();
  vi.mocked(api.post).mockRejectedValueOnce(error).mockResolvedValueOnce({ data: {} });
  renderPage('/verify-email');
  await user.type(screen.getByLabelText('Email address'), 'candidate@example.com');
  await user.click(screen.getByRole('button', { name: 'Send verification link' }));
  expect((await screen.findByRole('alert')).textContent).toBe(message);
  await user.click(screen.getByRole('button', { name: 'Send verification link' }));
  expect(await screen.findByRole('status')).toBeTruthy();
  expect(api.post).toHaveBeenCalledTimes(2);
});

it('requires a valid email before requesting another link', async () => {
  const user = userEvent.setup();
  renderPage('/verify-email');
  await user.click(screen.getByRole('button', { name: 'Send verification link' }));
  await user.type(screen.getByLabelText('Email address'), 'invalid-email');
  await user.click(screen.getByRole('button', { name: 'Send verification link' }));
  expect(api.post).not.toHaveBeenCalled();
});

it('keeps the successful verification flow without showing the resend form', async () => {
  vi.mocked(api.post).mockResolvedValue({ data: {} });
  renderPage('/verify-email?token=valid-token');
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Email Verified!' })).toBeTruthy());
  expect(screen.queryByLabelText('Email address')).toBeNull();
  expect(api.post).toHaveBeenCalledExactlyOnceWith('/auth/verify-email', { token: 'valid-token' });
});
