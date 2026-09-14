import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import api from '../../lib/api';
import Contact from './Contact';

vi.mock('../../lib/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
const auth = vi.hoisted(() => ({ user: { id: 'candidate', firstName: 'Demo', email: 'demo@example.com' } }));
vi.mock('../../context/useAuth', () => ({
  useAuth: () => auth,
}));

beforeEach(() => {
  vi.mocked(api.get).mockResolvedValue({ data: [] });
});

it('preserves the form through an error and disables submission while retrying', async () => {
  const user = userEvent.setup();
  let finish!: () => void;
  vi.mocked(api.post)
    .mockRejectedValueOnce(new Error('offline'))
    .mockImplementationOnce(() => new Promise(resolve => { finish = () => resolve({ data: {} }); }));
  render(<Contact />);
  await user.type(screen.getByPlaceholderText('How can we help?'), 'Account help');
  await user.type(screen.getByPlaceholderText('Please describe your issue in detail...'), 'Please help with my account.');
  await user.click(screen.getByRole('button', { name: 'Submit Request' }));
  await screen.findByText('Something went wrong. Please try again.');
  expect((screen.getByPlaceholderText('How can we help?') as HTMLInputElement).value).toBe('Account help');
  await user.click(screen.getByRole('button', { name: 'Submit Request' }));
  const sending = screen.getByRole('button', { name: 'Sending Request...' }) as HTMLButtonElement;
  expect(sending.disabled).toBe(true);
  expect(api.post).toHaveBeenLastCalledWith('/auth/contact', {
    userId: 'candidate', name: 'Demo', email: 'demo@example.com',
    subject: 'Account help', message: 'Please help with my account.',
  });
  await act(async () => { finish(); });
  await screen.findByText('Message Sent!');
});

it('keeps ticket navigation and status styling connected to the displayed state', async () => {
  const user = userEvent.setup();
  vi.mocked(api.get).mockResolvedValue({ data: [
    { id: 'open-ticket', subject: 'Open question', message: 'Waiting', status: 'Open', createdAt: '2026-09-14' },
    { id: 'closed-ticket', subject: 'Solved question', message: 'Answered', status: 'Resolved', createdAt: '2026-09-14' },
  ] });
  render(<Contact />);
  await user.click(screen.getByRole('button', { name: 'View My Tickets' }));
  await screen.findByText('Solved question');
  expect(screen.getByText('Resolved').getAttribute('data-resolved')).toBe('true');
  expect(screen.getByText('Open', { exact: true }).getAttribute('data-resolved')).toBe('false');
  const back = screen.getByRole('button', { name: 'Back to Form' });
  expect(back.getAttribute('data-tickets')).toBe('true');
  await user.click(back);
  expect(screen.getByRole('button', { name: 'View My Tickets' }).getAttribute('data-tickets')).toBe('false');
  expect(screen.getByRole('button', { name: 'Submit Request' })).toBeDefined();
});
