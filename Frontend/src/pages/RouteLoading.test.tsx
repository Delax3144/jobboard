import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import api from '../lib/api';
import PublicProfile from './PublicProfile/PublicProfile';
import ApplicationDetails from './ApplicationDetails/ApplicationDetails';
import JobManagement from './JobManagement/JobManagement';

vi.mock('../lib/api', () => ({ default: { get: vi.fn() } }));

const job = { id: 'job', title: 'First record', companyName: 'Demo', salaryFrom: 6000, salaryTo: 9000 };
const pages = [
  {
    name: 'candidate profile', prefix: '/candidate/', Page: PublicProfile,
    first: { id: 'first', firstName: 'First', lastName: 'record', email: 'first@example.test', isPublic: true },
    second: { id: 'second', firstName: 'Second', lastName: 'record', email: 'second@example.test', isPublic: true },
    unavailable: 'Could not load the candidate profile. Please try again.',
    notFound: 'Candidate not found.', forbidden: 'You do not have access to this profile.',
  },
  {
    name: 'application details', prefix: '/applications/', Page: ApplicationDetails,
    first: { id: 'first', status: 'reviewed', createdAt: '2026-10-01', job },
    second: { id: 'second', status: 'reviewed', createdAt: '2026-10-01', job: { ...job, title: 'Second record' } },
    unavailable: 'Could not load the application. Please try again.',
    notFound: 'Application not found.', forbidden: 'You do not have access to this application.',
  },
  {
    name: 'vacancy management', prefix: '/employer/job/', Page: JobManagement,
    first: job, second: { ...job, title: 'Second record' },
    unavailable: 'Could not load the vacancy and applicants. Please try again.',
    notFound: 'Job not found.', forbidden: 'You do not have access to manage this vacancy.',
  },
];

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((finish, fail) => { resolve = finish; reject = fail; });
  return { promise, resolve, reject };
}

function NextRecord({ prefix }: { prefix: string }) {
  const navigate = useNavigate();
  return <button onClick={() => navigate(prefix + 'second')}>Next record</button>;
}

function renderPage({ prefix, Page }: typeof pages[number]) {
  render(<MemoryRouter initialEntries={[prefix + 'first']}>
    <NextRecord prefix={prefix} />
    <Routes><Route path={prefix + ':id'} element={<Page />} /></Routes>
  </MemoryRouter>);
}

it.each(pages)('ignores a cancelled response when navigating between $name records', async page => {
  const user = userEvent.setup();
  const first = deferred<{ data: unknown }>();
  const second = deferred<{ data: unknown }>();
  vi.mocked(api.get).mockImplementation(url => {
    if (url.startsWith('/applications/job/')) return Promise.resolve({ data: [] });
    return url.endsWith('/first') ? first.promise : second.promise;
  });
  renderPage(page);
  await user.click(screen.getByRole('button', { name: 'Next record' }));
  const firstRequest = vi.mocked(api.get).mock.calls.find(([url]) => url.endsWith('/first'));
  expect(firstRequest?.[1]?.signal?.aborted).toBe(true);
  await act(async () => { second.resolve({ data: page.second }); });
  expect(screen.getByRole('heading', { name: 'Second record' })).toBeTruthy();
  await act(async () => { first.resolve({ data: page.first }); });
  expect(screen.queryByRole('heading', { name: 'First record' })).toBeNull();
  expect(screen.getByRole('heading', { name: 'Second record' })).toBeTruthy();
});

it.each(pages)('clears old $name data and retries a failed request', async page => {
  const user = userEvent.setup();
  const next = deferred<{ data: unknown }>();
  vi.mocked(api.get).mockImplementation(url => {
    if (url.startsWith('/applications/job/')) return Promise.resolve({ data: [] });
    return url.endsWith('/first') ? Promise.resolve({ data: page.first }) : next.promise;
  });
  renderPage(page);
  expect(await screen.findByRole('heading', { name: 'First record' })).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Next record' }));
  expect(screen.queryByRole('heading', { name: 'First record' })).toBeNull();
  expect(screen.queryByRole('alert')).toBeNull();
  await act(async () => { next.reject(new Error('Offline')); });
  expect(screen.getByRole('alert').textContent).toBe(page.unavailable);
  expect(screen.queryByText(page.notFound)).toBeNull();
  vi.mocked(api.get).mockImplementation(async url => ({ data: url.startsWith('/applications/job/') ? [] : page.second }));
  await user.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByRole('heading', { name: 'Second record' })).toBeTruthy();
  expect(screen.queryByRole('alert')).toBeNull();
});

for (const status of [403, 404]) {
  it.each(pages)(`shows HTTP ${status} for $name without a network retry`, async page => {
    vi.mocked(api.get).mockRejectedValue({ isAxiosError: true, response: { status } });
    renderPage(page);
    expect((await screen.findByRole('alert')).textContent).toBe(status === 403 ? page.forbidden : page.notFound);
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
  });
}
