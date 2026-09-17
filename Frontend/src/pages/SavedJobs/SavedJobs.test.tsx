import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import api from '../../lib/api';
import SavedJobs from './SavedJobs';

vi.mock('../../lib/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
const auth = vi.hoisted(() => ({ user: { id: 'candidate', role: 'candidate' } }));
vi.mock('../../context/useAuth', () => ({ useAuth: () => auth }));
const job = { id: 'job-1', title: 'Developer', companyName: 'Demo', location: 'Remote', salaryFrom: 6000, salaryTo: 9000 };

it('retries failed loading without presenting a false empty state', async () => {
  const user = userEvent.setup();
  vi.mocked(api.get).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ data: [job] });
  render(<MemoryRouter><SavedJobs /></MemoryRouter>);
  expect(await screen.findByRole('alert')).toBeTruthy();
  expect(screen.queryByText('No saved jobs yet')).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByText('Developer')).toBeTruthy();
  expect(screen.queryByRole('alert')).toBeNull();
});

it('blocks duplicate removal, keeps the job on failure and removes it after a successful retry', async () => {
  const user = userEvent.setup();
  let failRemoval!: () => void;
  vi.mocked(api.get).mockResolvedValue({ data: [job] });
  vi.mocked(api.post).mockImplementationOnce(() => new Promise((_, reject) => {
    failRemoval = () => reject(new Error('offline'));
  })).mockResolvedValueOnce({ data: { saved: false } });
  render(<MemoryRouter><SavedJobs /></MemoryRouter>);
  const remove = await screen.findByRole('button', { name: 'Remove Developer from Saved' }) as HTMLButtonElement;
  await user.click(remove);
  expect(remove.disabled).toBe(true);
  await user.click(remove);
  expect(api.post).toHaveBeenCalledTimes(1);
  expect(api.post).toHaveBeenCalledWith('/bookmarks/job-1');
  await act(async () => { failRemoval(); });
  expect(screen.getByRole('alert')).toBeTruthy();
  expect(screen.getByText('Developer')).toBeTruthy();
  expect(remove.disabled).toBe(false);
  await user.click(remove);
  expect(await screen.findByText('No saved jobs yet')).toBeTruthy();
  expect(screen.queryByText('Developer')).toBeNull();
  expect(screen.queryByRole('alert')).toBeNull();
});
