import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import api from '../lib/api';
import { useEmployerJobs } from './useEmployerJobs';

vi.mock('../lib/api', () => ({ default: { get: vi.fn() } }));
const stats = { active: 17, newApps: 31, totalApps: 80 };
const dashboard = { jobs: [], total: 17, totalPages: 4, stats };
beforeEach(() => vi.mocked(api.get).mockResolvedValue({ data: dashboard }));

it('loads pages on the server and resets the page for a search while keeping global statistics', async () => {
  const { result } = renderHook(() => useEmployerJobs('owner'));
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  act(() => result.current.setCurrentPage(3));
  await waitFor(() => expect(api.get).toHaveBeenLastCalledWith('/jobs/mine', {
    params: { page: 3, search: '' }, signal: expect.any(AbortSignal),
  }));
  act(() => result.current.setSearchQuery('  Designer  '));
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.currentPage).toBe(1);
  expect(api.get).toHaveBeenLastCalledWith('/jobs/mine', {
    params: { page: 1, search: 'Designer' }, signal: expect.any(AbortSignal),
  });
  expect(result.current.dashboardStats).toEqual(stats);
});

it('cancels old account requests and ignores their late responses', async () => {
  let finishOld!: (response: { data: typeof dashboard }) => void;
  vi.mocked(api.get).mockImplementationOnce(() => new Promise(resolve => { finishOld = resolve; }));
  const { result, rerender } = renderHook(({ id }) => useEmployerJobs(id), { initialProps: { id: 'old-owner' } });
  const oldSignal = vi.mocked(api.get).mock.calls[0][1]?.signal;
  rerender({ id: 'new-owner' });
  expect(oldSignal?.aborted).toBe(true);
  await waitFor(() => expect(result.current.dashboardStats).toEqual(stats));
  await act(async () => finishOld({ data: { ...dashboard, stats: { active: 999, newApps: 999, totalApps: 999 } } }));
  expect(result.current.dashboardStats).toEqual(stats);
});
