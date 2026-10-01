import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import api from '../lib/api';
import { useApplications } from './useApplications';

vi.mock('../lib/api', () => ({ default: { get: vi.fn() } }));
const auth = vi.hoisted(() => ({ user: { id: 'candidate-a' } }));
vi.mock('../context/useAuth', () => ({ useAuth: () => auth }));
const page = { applications: [{ id: 'app-a' }], stats: { total: 50, invited: 5, pending: 40 }, hasNextPage: true };

beforeEach(() => {
  auth.user.id = 'candidate-a';
  vi.mocked(api.get).mockResolvedValue({ data: page });
});

it('requests another page and uses statistics for the entire application list', async () => {
  const { result } = renderHook(useApplications);
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.apps).toHaveLength(1);
  expect(result.current.stats.total).toBe(50);
  act(() => result.current.pagination.setPage(2));
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(api.get).toHaveBeenLastCalledWith('/applications/my', { params: { page: 2 }, signal: expect.any(AbortSignal) });
  expect(result.current.pagination.hasNextPage).toBe(true);
});

it('clears data and resets the page when the user changes, ignoring their pending response', async () => {
  const { result, rerender } = renderHook(useApplications);
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  let finishOld!: (value: { data: typeof page }) => void;
  vi.mocked(api.get).mockImplementationOnce(() => new Promise(resolve => { finishOld = resolve; }));
  act(() => result.current.pagination.setPage(2));
  const signal = vi.mocked(api.get).mock.lastCall?.[1]?.signal;
  auth.user.id = 'candidate-b';
  vi.mocked(api.get).mockResolvedValue({ data: { ...page, applications: [], hasNextPage: false } });
  rerender();
  expect(result.current.apps).toEqual([]);
  expect(result.current.pagination.page).toBe(1);
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  await act(async () => { finishOld({ data: page }); });
  expect(signal?.aborted).toBe(true);
  expect(result.current.apps).toEqual([]);
});
