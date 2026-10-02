import { act, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import api from '../lib/api';
import { useTopNav } from './useTopNav';

const state = vi.hoisted(() => ({
  user: { id: 'candidate-a', role: 'candidate' },
  listeners: new Map<string, () => Promise<void>>(),
  socket: { on: vi.fn(), off: vi.fn(), disconnect: vi.fn() },
}));
vi.mock('../context/useAuth', () => ({ useAuth: () => ({ user: state.user, isLoading: false }) }));
vi.mock('../lib/api', () => ({ default: { get: vi.fn() } }));
vi.mock('socket.io-client', () => ({ io: () => state.socket }));
const setMode = vi.fn();
const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;
const renderNav = () => renderHook(() => useTopNav(setMode), { wrapper });

beforeEach(() => {
  state.user = { id: 'candidate-a', role: 'candidate' };
  state.listeners.clear();
  state.socket.on.mockImplementation((event, listener) => state.listeners.set(event, listener));
  localStorage.setItem('token', 'test-token');
  vi.mocked(api.get).mockResolvedValue({ data: { count: 0 } });
});

it('refreshes missed updates on connection and reconnection', async () => {
  const { result } = renderNav();
  await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));
  expect(api.get).toHaveBeenCalledWith('/applications/unread-count', { signal: expect.any(AbortSignal) });
  vi.mocked(api.get).mockResolvedValue({ data: { count: 1 } });
  await act(async () => { await state.listeners.get('connect')?.(); });
  expect(result.current.unreadCount).toBe(1);
  vi.mocked(api.get).mockResolvedValue({ data: { count: 2 } });
  await act(async () => { await state.listeners.get('connect')?.(); });
  expect(result.current.unreadCount).toBe(2);
});

it('ignores an older response when a reconnect starts a new lookup', async () => {
  let resolveOld!: (value: { data: { count: number } }) => void;
  vi.mocked(api.get).mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; }));
  const { result } = renderNav();
  const signal = vi.mocked(api.get).mock.calls[0][1]?.signal;
  await act(async () => { await state.listeners.get('connect')?.(); });
  expect(signal?.aborted).toBe(true);
  await act(async () => { resolveOld({ data: { count: 1 } }); });
  expect(result.current.unreadCount).toBe(0);
});

it('clears the previous user count immediately and ignores their pending request', async () => {
  vi.mocked(api.get).mockResolvedValueOnce({ data: { count: 1 } });
  const { result, rerender } = renderNav();
  await waitFor(() => expect(result.current.unreadCount).toBe(1));
  let resolveOld!: (value: { data: { count: number } }) => void;
  vi.mocked(api.get).mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; }));
  act(() => { void state.listeners.get('connect')?.(); });
  state.user = { id: 'candidate-b', role: 'candidate' };
  rerender();
  expect(result.current.unreadCount).toBe(0);
  await act(async () => { resolveOld({ data: { count: 2 } }); });
  expect(result.current.unreadCount).toBe(0);
  expect(state.socket.disconnect).toHaveBeenCalled();
});

it('aborts the pending lookup and removes the reconnect handler on unmount', () => {
  vi.mocked(api.get).mockImplementation(() => new Promise(() => {}));
  const { unmount } = renderNav();
  const signal = vi.mocked(api.get).mock.calls[0][1]?.signal;
  unmount();
  expect(signal?.aborted).toBe(true);
  expect(state.socket.off).toHaveBeenCalledWith('connect', expect.any(Function));
  expect(state.socket.disconnect).toHaveBeenCalled();
});
