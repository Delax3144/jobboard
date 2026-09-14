import { beforeEach, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import api from '../lib/api';
import { useJobDetails } from './useJobDetails';

vi.mock('../lib/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
const auth = vi.hoisted(() => ({ user: { id: 'candidate-a', role: 'candidate' } }));
vi.mock('../context/useAuth', () => ({ useAuth: () => auth }));
const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter initialEntries={['/jobs/job-a']}>
    <Routes><Route path="/jobs/:id" element={children} /></Routes>
  </MemoryRouter>
);
const renderDetails = () => renderHook(() => ({ ...useJobDetails(), navigate: useNavigate() }), { wrapper });
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}
beforeEach(() => {
  auth.user.id = 'candidate-a';
  vi.mocked(api.get).mockImplementation(async url => ({ data: url === '/bookmarks' ? [] : { id: String(url).split('/').pop() } }));
  vi.mocked(api.post).mockResolvedValue({ data: { saved: true } });
});

it('resets the application dialog on navigation and ignores an old success callback, even after returning', async () => {
  const { result } = renderDetails();
  await waitFor(() => expect(result.current.job?.id).toBe('job-a'));
  const finishOldApplication = result.current.modal.setIsSent;
  act(() => { result.current.modal.setIsModalOpen(true); result.current.modal.setIsSent(true); });
  act(() => result.current.navigate('/jobs/job-b'));
  expect(result.current.job).toBeNull();
  expect(result.current.modal.isModalOpen).toBe(false);
  expect(result.current.modal.isSent).toBe(false);
  await waitFor(() => expect(result.current.job?.id).toBe('job-b'));
  act(() => finishOldApplication(true));
  expect(result.current.modal.isSent).toBe(false);
  act(() => result.current.navigate('/jobs/job-a'));
  await waitFor(() => expect(result.current.job?.id).toBe('job-a'));
  act(() => finishOldApplication(true));
  expect(result.current.modal.isSent).toBe(false);
});

it('ignores bookmarks fetched for a previously opened vacancy', async () => {
  const oldBookmarks = deferred<{ data: { id: string }[] }>();
  vi.mocked(api.get).mockImplementationOnce(async () => ({ data: { id: 'job-a' } }))
    .mockImplementationOnce(() => oldBookmarks.promise);
  const { result } = renderDetails();
  await waitFor(() => expect(result.current.job?.id).toBe('job-a'));
  act(() => result.current.navigate('/jobs/job-b'));
  await waitFor(() => expect(result.current.job?.id).toBe('job-b'));
  await act(async () => { oldBookmarks.resolve({ data: [{ id: 'job-a' }] }); });
  expect(result.current.bookmarks.isBookmarked).toBe(false);
});

it('does not apply a pending bookmark toggle to another vacancy and prevents duplicate toggles', async () => {
  const saved = deferred<{ data: { saved: boolean } }>();
  vi.mocked(api.post).mockImplementationOnce(() => saved.promise);
  const { result } = renderDetails();
  await waitFor(() => expect(result.current.job?.id).toBe('job-a'));
  let pending!: Promise<void>;
  act(() => { pending = result.current.bookmarks.toggleBookmark(); });
  expect(result.current.bookmarks.isSaving).toBe(true);
  await act(async () => { await result.current.bookmarks.toggleBookmark(); });
  expect(api.post).toHaveBeenCalledTimes(1);
  act(() => result.current.navigate('/jobs/job-b'));
  await waitFor(() => expect(result.current.job?.id).toBe('job-b'));
  await act(async () => { saved.resolve({ data: { saved: true } }); await pending; });
  expect(result.current.bookmarks.isBookmarked).toBe(false);
  expect(result.current.bookmarks.isSaving).toBe(false);
});

it('uses the saved state returned by the server instead of inverting local state', async () => {
  vi.mocked(api.post).mockResolvedValue({ data: { saved: false } });
  const { result } = renderDetails();
  await waitFor(() => expect(result.current.job?.id).toBe('job-a'));
  await act(async () => { await result.current.bookmarks.toggleBookmark(); });
  expect(result.current.bookmarks.isBookmarked).toBe(false);
});

it('does not let an older bookmark lookup overwrite a completed toggle', async () => {
  const oldBookmarks = deferred<{ data: { id: string }[] }>();
  vi.mocked(api.get).mockImplementationOnce(async () => ({ data: { id: 'job-a' } }))
    .mockImplementationOnce(() => oldBookmarks.promise);
  const { result } = renderDetails();
  await waitFor(() => expect(result.current.job?.id).toBe('job-a'));
  await act(async () => { await result.current.bookmarks.toggleBookmark(); });
  expect(result.current.bookmarks.isBookmarked).toBe(true);
  await act(async () => { oldBookmarks.resolve({ data: [] }); });
  expect(result.current.bookmarks.isBookmarked).toBe(true);
});

it('clears application and bookmark state when the signed-in user changes', async () => {
  const { result, rerender } = renderDetails();
  await waitFor(() => expect(result.current.job?.id).toBe('job-a'));
  act(() => { result.current.modal.setIsModalOpen(true); result.current.modal.setIsSent(true); });
  await act(async () => { await result.current.bookmarks.toggleBookmark(); });
  auth.user.id = 'candidate-b';
  rerender();
  expect(result.current.modal.isModalOpen).toBe(false);
  expect(result.current.modal.isSent).toBe(false);
  expect(result.current.bookmarks.isBookmarked).toBe(false);
  await act(async () => {});
});
