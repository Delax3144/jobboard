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

beforeEach(() => { vi.mocked(api.get).mockResolvedValue({ data: { jobs } }); });

it('finds jobs by title, company or skill regardless of case and surrounding spaces', async () => {
  const { result } = renderHook(useJobs);
  await waitFor(() => expect(result.current.data.loading).toBe(false));
  for (const [query, ids] of [
    ['frontend', ['frontend']], ['ACME', ['backend']],
    ['  tYpEsCrIpT  ', ['frontend', 'backend']], ['Rust', []],
    ['   ', ['frontend', 'backend', 'designer']],
  ] as const) {
    act(() => result.current.filters.setSearchTerm(query));
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
  expect(result.current.list.filteredJobs.map(job => job.id)).toEqual(['frontend']);
});
