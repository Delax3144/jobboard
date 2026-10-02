import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import api from '../lib/api';
import { useConversations } from './useConversations';

vi.mock('../lib/api', () => ({ default: { get: vi.fn() } }));
beforeEach(() => {
  vi.mocked(api.get).mockResolvedValue({ data: { conversations: [{ id: 'app-a' }], hasNextPage: true } });
});

it('requests pages and searches all conversations starting from page one', async () => {
  const { result } = renderHook(() => useConversations('owner', 'employer'));
  await waitFor(() => expect(result.current.loading).toBe(false));
  act(() => result.current.pagination.setPage(2));
  expect(result.current.chats).toEqual([]);
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(api.get).toHaveBeenLastCalledWith('/applications/conversations', { params: { page: 2, search: '' }, signal: expect.any(AbortSignal) });
  act(() => result.current.setSearchQuery('  Alex  '));
  expect(result.current.pagination.page).toBe(1);
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(api.get).toHaveBeenLastCalledWith('/applications/conversations', { params: { page: 1, search: 'Alex' }, signal: expect.any(AbortSignal) });
});

it('ignores old search responses even when an adapter does not honor cancellation', async () => {
  let finish!: (value: { data: { conversations: { id: string }[]; hasNextPage: boolean } }) => void;
  vi.mocked(api.get).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  const { result } = renderHook(() => useConversations('owner', 'employer'));
  await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));
  const signal = vi.mocked(api.get).mock.calls[0][1]?.signal;
  act(() => result.current.setSearchQuery('Other'));
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(async () => { finish({ data: { conversations: [{ id: 'old' }], hasNextPage: false } }); });
  expect(signal?.aborted).toBe(true);
  expect(result.current.chats.map(chat => chat.id)).toEqual(['app-a']);
});

it('retries a failed list without exposing another user data', async () => {
  const { result, rerender } = renderHook(({ userId }) => useConversations(userId, 'candidate'), { initialProps: { userId: 'candidate-a' } });
  await waitFor(() => expect(result.current.loading).toBe(false));
  vi.mocked(api.get).mockRejectedValueOnce(new Error('offline'));
  rerender({ userId: 'candidate-b' });
  expect(result.current.chats).toEqual([]);
  await waitFor(() => expect(result.current.error).toContain('Could not load'));
  await act(async () => { await result.current.refresh(); });
  expect(result.current.error).toBe('');
  expect(result.current.chats).toHaveLength(1);
});
