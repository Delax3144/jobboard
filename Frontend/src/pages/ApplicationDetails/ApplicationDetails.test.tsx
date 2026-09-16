import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import api from '../../lib/api';
import ApplicationDetails from './ApplicationDetails';

vi.mock('../../lib/api', () => ({ default: { get: vi.fn() } }));

it.each([
  ['new', 'Under Review', false],
  ['invited', 'Interview / Invited', true],
  ['rejected', 'Application Declined', true],
] as const)('shows the %s status and preserves chat access', async (status, label, canChat) => {
  vi.mocked(api.get).mockResolvedValue({ data: {
    id: 'app-1', status, createdAt: '2026-09-16', coverLetter: '', cvUrl: null,
    job: { id: 'job-1', title: 'Frontend Developer', companyName: 'Demo', salaryFrom: 6000, salaryTo: 9000 },
  } });
  const user = userEvent.setup();
  render(<MemoryRouter initialEntries={['/applications/app-1']}>
    <Routes>
      <Route path="/applications/:id" element={<ApplicationDetails />} />
      <Route path="/messages/:id" element={<p>Messages opened</p>} />
      <Route path="/applications" element={<p>Dashboard opened</p>} />
    </Routes>
  </MemoryRouter>);
  expect(await screen.findByText(label)).toBeTruthy();
  expect(screen.getByText('No pitch provided. You applied using your profile only.')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'View Original Job Post' }).getAttribute('href')).toBe('/jobs/job-1');
  if (canChat) {
    await user.click(screen.getByRole('button', { name: 'Open Messages' }));
    expect(screen.getByText('Messages opened')).toBeTruthy();
  } else {
    expect(screen.getByText('Chat is Locked')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Open Messages' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Back to Dashboard' }));
    expect(screen.getByText('Dashboard opened')).toBeTruthy();
  }
});
