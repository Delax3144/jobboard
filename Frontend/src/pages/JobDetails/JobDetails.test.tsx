import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { it, expect, vi } from 'vitest';
import JobDetails from './JobDetails';

vi.mock('../../hooks/useJobDetails', () => ({
  useJobDetails: () => ({
    job: {
      title: 'Developer', companyName: 'Example', createdAt: '2026-10-01',
      salaryFrom: 1000, salaryTo: 2000, status: 'published',
      description: '<p><strong>Required skills</strong></p><ul><li>TypeScript</li></ul>' +
        '<script>alert(1)</script><iframe src="https://example.test"></iframe>' +
        '<p onclick="alert(1)">Details</p><a href="javascript:alert(1)">Unsafe link</a>' +
        '<a href="https://example.test/jobs">Company website</a>',
    },
    isLoading: false, user: null, apiUrl: '', bookmarks: {},
    modal: { isModalOpen: false, isSent: false },
  }),
}));
vi.mock('../../components/jobs/ApplyModal', () => ({ default: () => null }));

it('preserves description formatting while removing executable HTML', () => {
  const { container } = render(<MemoryRouter><JobDetails /></MemoryRouter>);
  expect(screen.getByText('Required skills').tagName).toBe('STRONG');
  expect(screen.getByText('TypeScript').tagName).toBe('LI');
  expect(container.querySelector('script, iframe, [onclick]')).toBeNull();
  expect(screen.getByText('Unsafe link').getAttribute('href')).toBeNull();
  expect(screen.getByText('Company website').getAttribute('href')).toBe('https://example.test/jobs');
});
