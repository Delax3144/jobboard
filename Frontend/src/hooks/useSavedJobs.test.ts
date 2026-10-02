import { act, renderHook, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import api from '../lib/api';
import { useSavedJobs } from './useSavedJobs';

vi.mock('../lib/api', () => ({ default: { get: vi.fn(), delete: vi.fn() } }));
const auth = vi.hoisted(() => ({ user: { id: 'candidate', role: 'candidate' } }));
vi.mock('../context/useAuth', () => ({ useAuth: () => auth }));

it('loads server pages and returns to the previous page after removing its last saved job', async () => {
  vi.mocked(api.get).mockImplementation(async (_url, config) => ({ data: {
    jobs: [{ id: (config?.params as { page: number }).page === 1 ? 'first' : 'last' }], total: 21, hasNextPage: true,
  } }));
  vi.mocked(api.delete).mockResolvedValue({ data: null });
  const { result } = renderHook(useSavedJobs);
  await waitFor(() => expect(result.current.loading).toBe(false));
  act(() => result.current.pagination.setPage(2));
  await waitFor(() => expect(result.current.savedJobs[0]?.id).toBe('last'));
  expect(result.current.total).toBe(21);
  await act(async () => result.current.removeBookmark('last'));
  await waitFor(() => expect(result.current.savedJobs[0]?.id).toBe('first'));
  expect(result.current.pagination.page).toBe(1);
});

it('ignores an old account response and aborts its pending removal', async () => {
  let finish!: (response: { data: { jobs: Array<{ id: string }>; total: number; hasNextPage: boolean } }) => void;
  auth.user.id = 'old-candidate';
  vi.mocked(api.get).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  vi.mocked(api.get).mockResolvedValue({ data: { jobs: [], total: 0, hasNextPage: false } });
  let finishDelete!: () => void;
  vi.mocked(api.delete).mockImplementationOnce(() => new Promise(resolve => { finishDelete = () => resolve({ data: null }); }));
  const { result, rerender } = renderHook(useSavedJobs);
  const oldSignal = vi.mocked(api.get).mock.calls[0][1]?.signal;
  let removal!: Promise<void>;
  act(() => { removal = result.current.removeBookmark('old-job'); });
  const deleteSignal = vi.mocked(api.delete).mock.calls[0][1]?.signal;
  auth.user.id = 'new-candidate';
  rerender();
  expect(oldSignal?.aborted).toBe(true);
  expect(deleteSignal?.aborted).toBe(true);
  await act(async () => {
    finish({ data: { jobs: [{ id: 'old-job' }], total: 1, hasNextPage: false } });
    finishDelete(); await removal;
  });
  expect(result.current.savedJobs).toEqual([]);
  expect(result.current.removingIds.size).toBe(0);
});
