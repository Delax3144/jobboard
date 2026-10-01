import { beforeEach, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import api from '../lib/api';
import { useJobs } from './useJobs';
import type { Job } from '../types/job';

vi.mock('../lib/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock('../context/useAuth', () => ({ useAuth: () => ({ user: null }) }));

const base: Job = {
  id: 'frontend', title: 'Frontend Developer', companyName: 'Demo Engineering',
  location: 'Remote', salaryFrom: 6000, salaryTo: 10000, level: 'Junior',
  tags: 'React, TypeScript', description: '', status: 'published',
  ownerId: 'owner', createdAt: '2026-09-14T00:00:00Z',
};
const jobs: Job[] = [base, {
  ...base, id: 'backend', title: 'Backend Developer', companyName: 'Acme',
  location: 'Poland', level: 'Senior', salaryFrom: 14000, salaryTo: 20000,
  tags: 'Node.js, TypeScript',
}, { ...base, id: 'designer', title: 'Designer', tags: '' }];

beforeEach(() => {
  vi.mocked(api.get).mockImplementation(async (_url, config) => {
    const params = config?.params as URLSearchParams;
    const query = params.get('search')?.toLowerCase() ?? '';
    const filtered = jobs.filter(job =>
      (!query || [job.title, job.companyName, job.tags].some(value => value?.toLowerCase().includes(query))) &&
      (!params.has('locations') || params.getAll('locations').includes(job.location ?? '')) &&
      (!params.has('levels') || params.getAll('levels').includes(job.level ?? '')) &&
      job.salaryTo >= Number(params.get('minSalary')) && job.salaryFrom <= Number(params.get('maxSalary')),
    );
    return { data: { jobs: filtered, hasNextPage: false } };
  });
});

it('finds jobs by title, company or skill regardless of case and surrounding spaces', async () => {
  const { result } = renderHook(useJobs);
  await waitFor(() => expect(result.current.data.loading).toBe(false));
  for (const [query, ids] of [
    ['frontend', ['frontend']], ['ACME', ['backend']],
    ['  tYpEsCrIpT  ', ['frontend', 'backend']], ['Rust', []],
    ['   ', ['frontend', 'backend', 'designer']],
  ] as const) {
    act(() => result.current.filters.setSearchTerm(query));
    await waitFor(() => expect(result.current.data.loading).toBe(false));
    expect(result.current.list.filteredJobs.map(job => job.id)).toEqual(ids);
  }
});

it('combines skill search with location, level and salary filters', async () => {
  const { result } = renderHook(useJobs);
  await waitFor(() => expect(result.current.data.loading).toBe(false));
  act(() => {
    result.current.filters.setSearchTerm('TypeScript');
    result.current.filters.setSelectedLocations(['Remote']);
    result.current.filters.setSelectedLevels(['Junior']);
    result.current.filters.setMaxSalary(12000);
  });
  await waitFor(() => expect(result.current.data.loading).toBe(false));
  expect(result.current.list.filteredJobs.map(job => job.id)).toEqual(['frontend']);
});

it('requests the next page and resets pagination when filters change', async () => {
  vi.mocked(api.get).mockResolvedValue({ data: { jobs: [base], hasNextPage: true } });
  const { result } = renderHook(useJobs);
  await waitFor(() => expect(result.current.data.loading).toBe(false));
  act(() => result.current.pagination.setPage(2));
  expect(result.current.list.filteredJobs).toEqual([]);
  await waitFor(() => expect(result.current.data.loading).toBe(false));
  const pageParams = vi.mocked(api.get).mock.lastCall?.[1]?.params as URLSearchParams;
  expect(pageParams.get('page')).toBe('2');
  act(() => result.current.filters.setSearchTerm('React'));
  expect(result.current.pagination.page).toBe(1);
  await waitFor(() => expect(result.current.data.loading).toBe(false));
  const params = vi.mocked(api.get).mock.lastCall?.[1]?.params as URLSearchParams;
  expect(params.get('page')).toBe('1');
  expect(params.get('search')).toBe('React');
});

it('ignores an old page response after a new search completes', async () => {
  let finishOld!: (value: { data: { jobs: Job[]; hasNextPage: boolean } }) => void;
  vi.mocked(api.get).mockImplementationOnce(() => new Promise(resolve => { finishOld = resolve; }));
  const { result } = renderHook(useJobs);
  await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));
  const signal = vi.mocked(api.get).mock.calls[0][1]?.signal;
  act(() => result.current.filters.setSearchTerm('Rust'));
  await waitFor(() => expect(result.current.data.loading).toBe(false));
  expect(signal?.aborted).toBe(true);
  await act(async () => { finishOld({ data: { jobs: [base], hasNextPage: true } }); });
  expect(result.current.list.filteredJobs).toEqual([]);
  expect(result.current.pagination.hasNextPage).toBe(false);
});
