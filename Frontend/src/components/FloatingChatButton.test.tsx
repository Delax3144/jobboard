import { it, expect, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import api from '../lib/api';
import FloatingChatButton from './FloatingChatButton';

vi.mock('../lib/api', () => ({ default: { get: vi.fn() } }));
const auth = vi.hoisted(() => ({ user: { id: 'candidate', role: 'candidate' } }));
vi.mock('../context/useAuth', () => ({ useAuth: () => auth }));
it.each(['candidate', 'employer'])('loads only the unread count for a %s', async role => {
  auth.user = { id: role, role };
  vi.mocked(api.get).mockResolvedValue({ data: { count: 1 } });
  render(<MemoryRouter><FloatingChatButton /></MemoryRouter>);
  expect((await screen.findByRole('link', { name: 'Open messages — unread updates' })).getAttribute('href')).toBe('/messages');
  expect(api.get).toHaveBeenCalledWith('/applications/unread-count', { signal: expect.any(AbortSignal) });
});

it('ignores late responses from the previous account and cancels requests on unmount', async () => {
  let finish!: (response: { data: { count: number } }) => void;
  auth.user = { id: 'old-user', role: 'candidate' };
  vi.mocked(api.get).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  vi.mocked(api.get).mockResolvedValue({ data: { count: 0 } });
  const { rerender, unmount } = render(<MemoryRouter><FloatingChatButton /></MemoryRouter>);
  const oldSignal = vi.mocked(api.get).mock.calls[0][1]?.signal;
  auth.user = { id: 'new-user', role: 'candidate' };
  rerender(<MemoryRouter><FloatingChatButton /></MemoryRouter>);
  expect(oldSignal?.aborted).toBe(true);
  await act(async () => { finish({ data: { count: 3 } }); });
  expect(screen.getByRole('link', { name: 'Open messages' })).toBeTruthy();
  const newSignal = vi.mocked(api.get).mock.calls[1][1]?.signal;
  unmount();
  expect(newSignal?.aborted).toBe(true);
});

it('refreshes on read updates and prevents an older request from restoring the badge', async () => {
  let finish!: (response: { data: { count: number } }) => void;
  vi.mocked(api.get).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  vi.mocked(api.get).mockResolvedValue({ data: { count: 0 } });
  render(<MemoryRouter><FloatingChatButton /></MemoryRouter>);
  const firstSignal = vi.mocked(api.get).mock.calls[0][1]?.signal;
  await act(async () => { window.dispatchEvent(new Event('update_unread')); });
  expect(firstSignal?.aborted).toBe(true);
  await act(async () => { finish({ data: { count: 5 } }); });
  expect(screen.getByRole('link', { name: 'Open messages' })).toBeTruthy();
  expect(api.get).toHaveBeenCalledTimes(2);
});

it('hides the shortcut and does not poll while viewing messages', () => {
  render(<MemoryRouter initialEntries={['/messages/conversation-1']}><FloatingChatButton /></MemoryRouter>);
  expect(screen.queryByRole('link')).toBeNull();
  expect(api.get).not.toHaveBeenCalled();
});
