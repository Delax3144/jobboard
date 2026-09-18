import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import api from '../../lib/api';
import JobManagement from './JobManagement';

vi.mock('../../lib/api', () => ({ default: { get: vi.fn(), patch: vi.fn() } }));

describe('Employer application management', () => {
  it('reviews and invites an applicant through the supported API route', async () => {
    const app = {
      id: 'application-1', status: 'new', createdAt: '2026-09-01T12:00:00Z',
      candidate: { id: 'candidate-1', firstName: 'Alex', lastName: 'Demo', email: 'alex@example.test' },
    };
    vi.mocked(api.get).mockImplementation(async (url) => ({
      data: url === '/jobs/job-1' ? { title: 'Frontend Developer', companyName: 'Demo' } : [app],
    }));
    vi.mocked(api.patch).mockResolvedValue({ data: {} });
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/employer/job/job-1']}>
      <Routes><Route path='/employer/job/:id' element={<JobManagement />} /></Routes>
    </MemoryRouter>);

    await user.click(await screen.findByRole('button', { name: 'View CV' }));
    expect(screen.getByRole('button', { name: 'Hide Details' }).getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('No motivation letter provided.')).toBeTruthy();
    expect((screen.getByRole('button', { name: 'No CV Uploaded' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole('link', { name: 'Profile' }).getAttribute('href')).toBe('/candidate/candidate-1');
    await user.click(screen.getByRole('button', { name: 'Hide Details' }));
    expect(screen.queryByText('No motivation letter provided.')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Review' }));
    await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/applications/application-1', { status: 'reviewed' }));
    await user.click(await screen.findByRole('button', { name: 'Invite to Interview' }));
    await waitFor(() => expect(api.patch).toHaveBeenLastCalledWith('/applications/application-1', { status: 'invited' }));
    expect(screen.queryByRole('button', { name: 'Invite to Interview' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'rejected' }));
    expect(screen.getByRole('button', { name: 'rejected' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('No candidates found for this filter.')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'invited' }));
    expect(screen.getByText('Alex Demo')).toBeTruthy();
  });
});
