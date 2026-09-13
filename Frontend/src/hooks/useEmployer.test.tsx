import { beforeEach, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import api from '../lib/api';
import { useEmployer } from './useEmployer';
import type { Job } from '../types/job';

vi.mock('../lib/api', () => ({ default: { get: vi.fn(), patch: vi.fn() } }));
vi.mock('../context/useAuth', () => {
  const user = { id: 'owner', role: 'employer' };
  return { useAuth: () => ({ user }) };
});

const firstJob: Job = {
  id: 'first-job', title: 'Frontend Developer', companyName: 'First Company',
  location: 'Remote', salaryFrom: 6000, salaryTo: 10000, level: 'Junior',
  tags: 'React', description: '', status: 'published', ownerId: 'owner',
  createdAt: '2026-09-14T00:00:00Z',
};
const secondJob: Job = { ...firstJob, id: 'second-job', companyName: 'Second Company' };

function Editor() {
  const { data, list, form } = useEmployer();
  if (data.isLoading) return <p>Loading</p>;
  return <>
    <input id="logoInput" aria-label="Company logo" type="file"
      onChange={event => form.setLogoFile(event.target.files?.[0] ?? null)} />
    <button onClick={() => list.fillForm(firstJob)}>Edit first</button>
    <button onClick={() => list.fillForm(secondJob)}>Edit second</button>
    <button onClick={form.handleSubmit}>Save</button>
  </>;
}

beforeEach(() => {
  vi.mocked(api.get).mockImplementation(async url => ({
    data: url === '/jobs/mine' ? { jobs: [firstJob, secondJob] } : [],
  }));
  vi.mocked(api.patch).mockResolvedValue({ data: secondJob });
});

it.each([false, true])('clears a previous vacancy logo and accepts a new selection: %s', async replaceLogo => {
  const user = userEvent.setup();
  render(<Editor />);
  await user.click(await screen.findByRole('button', { name: 'Edit first' }));
  const input = screen.getByLabelText<HTMLInputElement>('Company logo');
  await user.upload(input, new File(['first'], 'first.png', { type: 'image/png' }));
  expect(input.files).toHaveLength(1);
  await user.click(screen.getByRole('button', { name: 'Edit second' }));
  expect(input.files).toHaveLength(0);
  if (replaceLogo) {
    await user.upload(input, new File(['second'], 'second.png', { type: 'image/png' }));
  }
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(api.patch).toHaveBeenCalledTimes(1));
  const [url, payload] = vi.mocked(api.patch).mock.calls[0];
  expect(url).toBe('/jobs/second-job');
  const logo = (payload as FormData).get('logo');
  if (replaceLogo) expect((logo as File).name).toBe('second.png');
  else expect(logo).toBeNull();
});
