import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import ApplicantPreviewList from './ApplicantPreviewList';
import type { EmployerJob } from '../../hooks/useEmployerJobs';

const job: EmployerJob = {
  id: 'job-1', title: 'Developer', companyName: 'Demo', location: 'Remote',
  salaryFrom: 6000, salaryTo: 10000, level: 'Junior', tags: '', description: '',
  status: 'published', ownerId: 'owner', createdAt: '2026-10-01T12:00:00Z',
  totalApplicants: 12, newApplicants: 3,
  applicantPreviews: [{ id: 'app-1', status: 'invited', createdAt: '2026-10-01T12:00:00Z',
    candidate: { id: 'candidate-1', firstName: 'Alex', lastName: 'Demo', email: 'alex@example.test' } }],
};

it('shows candidate names, readable stages and a link to the full applicant list', () => {
  render(<MemoryRouter><ApplicantPreviewList job={job} /></MemoryRouter>);
  expect(screen.getByRole('link', { name: 'Alex Demo' }).getAttribute('href')).toBe('/candidate/candidate-1');
  expect(screen.getByText('Interview')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'View all 12' }).getAttribute('href')).toBe('/employer/job/job-1');
});

it('shows a clear empty state instead of placeholder candidates', () => {
  render(<MemoryRouter><ApplicantPreviewList job={{ ...job, totalApplicants: 0, applicantPreviews: [] }} /></MemoryRouter>);
  expect(screen.getByText('Applications will appear here when candidates apply.')).toBeTruthy();
  expect(screen.queryByRole('list')).toBeNull();
  expect(screen.queryByRole('link', { name: 'View all 0' })).toBeNull();
});
