import { beforeEach, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import api from '../lib/api';
import Jobs from './Jobs/Jobs';
import Applications from './Applications/Applications';
import Employer from './Employer/Employer';

vi.mock('../lib/api', () => ({ default: { get: vi.fn() } }));
const auth = vi.hoisted(() => ({ user: { id: 'user', role: 'employer' } }));
vi.mock('../context/useAuth', () => ({ useAuth: () => auth }));
vi.mock('react-quill-new', () => ({ default: () => <div /> }));

const job = {
  id: 'job-1', title: 'Frontend Developer', companyName: 'Demo',
  location: 'Remote', level: 'Junior', salaryFrom: 6000, salaryTo: 10000,
  tags: 'React', status: 'published',
};
const application = {
  id: 'app-1', jobId: job.id, job, status: 'new', createdAt: '2026-09-14',
  candidate: { email: 'candidate@example.com' },
};
const cases = [
  { Page: Jobs, endpoint: '/jobs', empty: 'No matching roles found' },
  { Page: Applications, endpoint: '/applications/my', empty: 'No applications yet' },
  { Page: Employer, endpoint: '/jobs/mine', empty: 'No vacancies posted yet' },
];
const response = (url: string, empty = false) => ({ data:
  url === '/jobs/mine' ? { jobs: empty ? [] : [job] } :
  url.startsWith('/applications/') ? (empty ? [] : [application]) : (empty ? [] : [job]),
});

beforeEach(() => { auth.user.role = 'employer'; });

it('keeps a job card usable when its company logo fails to load', async () => {
  vi.mocked(api.get).mockResolvedValue({ data: [{ ...job, companyLogo: '/missing-logo.png' }] });
  render(<MemoryRouter><Jobs /></MemoryRouter>);
  fireEvent.error(await screen.findByRole('img', { name: 'Demo' }));
  expect(screen.queryByRole('img', { name: 'Demo' })).toBeNull();
  expect(screen.getByText('D')).toBeTruthy();
  expect(screen.getByRole('link', { name: /Frontend Developer/ }).getAttribute('href')).toBe('/jobs/job-1');
});

it.each([
  ...cases,
  { ...cases[2], endpoint: '/applications/owner' },
  { ...cases[0], endpoint: '/bookmarks' },
])('recovers $endpoint after failures without claiming the list is empty', async ({ Page, endpoint, empty }) => {
  if (endpoint === '/bookmarks') auth.user.role = 'candidate';
  const user = userEvent.setup();
  let attempt = 0;
  let finishRetry!: () => void;
  vi.mocked(api.get).mockImplementation(async url => {
    if (url === endpoint) {
      attempt += 1;
      if (attempt <= 2) throw new Error('offline');
      await new Promise<void>(resolve => { finishRetry = resolve; });
    }
    return response(String(url));
  });
  render(<MemoryRouter><Page /></MemoryRouter>);
  expect(await screen.findByRole('alert')).toBeTruthy();
  expect(screen.queryByText(empty)).toBeNull();
  expect(screen.queryByText(/Showing.*opportunities/)).toBeNull();

  const field = Page === Jobs
    ? screen.getByPlaceholderText('Search job title, skills, or company...')
    : Page === Employer ? screen.getByPlaceholderText('e.g. Senior React Engineer') : null;
  if (field) await user.type(field, Page === Jobs ? 'React' : 'My unsaved role');

  await user.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByRole('button', { name: 'Try again' })).toBeTruthy();
  expect(screen.getByRole('alert')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Try again' }));
  const retryButton = await screen.findByRole<HTMLButtonElement>('button', { name: 'Retrying...' });
  expect(retryButton.disabled).toBe(true);
  await user.click(retryButton);
  expect(attempt).toBe(3);
  expect(screen.queryByText(empty)).toBeNull();
  await act(async () => { finishRetry(); });
  expect(await screen.findByText(job.title)).toBeTruthy();
  expect(screen.queryByRole('alert')).toBeNull();
  if (field) {
    const currentField = screen.getByPlaceholderText<HTMLInputElement>(Page === Jobs
      ? 'Search job title, skills, or company...' : 'e.g. Senior React Engineer');
    expect(currentField.value).toBe(Page === Jobs ? 'React' : 'My unsaved role');
  }
});

it.each(cases)('shows a genuine empty state for $endpoint only after a successful retry', async ({ Page, endpoint, empty }) => {
  const user = userEvent.setup();
  let offline = true;
  vi.mocked(api.get).mockImplementation(async url => {
    if (offline && url === endpoint) throw new Error('offline');
    return response(String(url), true);
  });
  render(<MemoryRouter><Page /></MemoryRouter>);
  expect(await screen.findByRole('alert')).toBeTruthy();
  expect(screen.queryByText(empty)).toBeNull();
  offline = false;
  await user.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByText(empty)).toBeTruthy();
  expect(screen.queryByRole('alert')).toBeNull();
});
