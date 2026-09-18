import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import api from '../../lib/api';
import type { Job } from '../../types/job';
import ApplyModal from './ApplyModal';

vi.mock('../../lib/api', () => ({ default: { post: vi.fn() } }));
const job: Job = {
  id: 'job-1', title: 'Developer', companyName: 'Demo', location: 'Remote',
  salaryFrom: 1000, salaryTo: 2000, level: 'Junior', tags: '', description: '',
  status: 'published', ownerId: 'owner', createdAt: '2026-09-01',
};

it('shows confirmation after submitting and closes it', async () => {
  const user = userEvent.setup();
  vi.mocked(api.post).mockResolvedValue({ data: {} });
  function Example() {
    const [sent, setSent] = useState(false);
    const [open, setOpen] = useState(true);
    return <ApplyModal job={job} isOpen={open} onClose={() => setOpen(false)} isSent={sent} setIsSent={setSent} />;
  }
  render(<Example />);
  await user.click(screen.getByRole('button', { name: 'Send Application' }));
  expect(await screen.findByRole('heading', { name: 'Application Sent!' })).toBeTruthy();
  const body = vi.mocked(api.post).mock.calls[0][1] as FormData;
  expect(body.get('jobId')).toBe('job-1');
  await user.click(screen.getByRole('button', { name: 'Awesome, thanks!' }));
  expect(screen.queryByRole('heading', { name: 'Application Sent!' })).toBeNull();
});

it('closes without sending an application', async () => {
  const close = vi.fn();
  render(<ApplyModal job={job} isOpen onClose={close} isSent={false} setIsSent={vi.fn()} />);
  await userEvent.setup().click(screen.getByRole('button', { name: 'Close application' }));
  expect(close).toHaveBeenCalledTimes(1);
  expect(api.post).not.toHaveBeenCalled();
});
