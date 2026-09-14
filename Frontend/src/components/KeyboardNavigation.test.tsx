import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import ChatSidebar from './chat/ChatSidebar';
import JobsFilters from './jobs/JobsFilters';
import { useJobs } from '../hooks/useJobs';
import type { Application } from '../types/job';
import type { UserRole } from '../types/user';

vi.mock('../lib/api', () => ({ default: { get: vi.fn().mockResolvedValue({ data: [] }) } }));
vi.mock('../context/useAuth', () => ({ useAuth: () => ({ user: null }) }));
const chats: Application[] = ['Frontend', 'Backend'].map((title, index) => ({
  id: `app-${index}`, jobId: `job-${index}`, candidateId: 'candidate',
  candidate: { id: 'candidate', email: 'alex@example.com', firstName: 'Alex' },
  createdAt: '2026-09-14', lastViewedByCandidate: '2026-09-14', lastViewedByOwner: '2026-09-14',
  status: 'invited', messages: [], hasUpdate: index === 1,
  job: { id: `job-${index}`, title, companyName: 'Demo', location: 'Remote',
    salaryFrom: 6000, salaryTo: 10000, level: 'Junior', tags: 'React', description: '',
    status: 'published', ownerId: 'owner', createdAt: '2026-09-14' },
}));

function Conversations({ role }: { role: UserRole }) {
  const { id } = useParams();
  return <ChatSidebar filteredChats={chats} searchQuery="" setSearchQuery={vi.fn()}
    activeId={id} user={{ id: 'user', role, email: 'user@example.com' }} checkIsOnline={() => false} apiUrl="" />;
}

it.each(['employer', 'candidate'] as const)('opens the correct conversation by keyboard for a %s', async role => {
  const user = userEvent.setup();
  render(<MemoryRouter initialEntries={['/messages/app-0']}>
    <Routes><Route path="/messages/:id" element={<Conversations role={role} />} /></Routes>
  </MemoryRouter>);
  const partner = role === 'employer' ? 'Alex' : 'Demo';
  const first = screen.getByRole('link', { name: `${partner} — Frontend` });
  const second = screen.getByRole('link', { name: `${partner} — Backend — unread updates` });
  expect(first.getAttribute('aria-current')).toBe('page');
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Search conversations' }));
  await user.tab();
  expect(document.activeElement).toBe(first);
  await user.tab();
  expect(document.activeElement).toBe(second);
  await user.keyboard('{Enter}');
  expect(second.getAttribute('aria-current')).toBe('page');
  expect(first.getAttribute('aria-current')).toBeNull();
});

function Filters() {
  const { filters } = useJobs();
  return <JobsFilters filters={filters} />;
}

it('selects and clears filters using the keyboard', async () => {
  const user = userEvent.setup();
  render(<Filters />);
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Clear All' }));
  await user.tab();
  const remote = screen.getByRole<HTMLInputElement>('checkbox', { name: 'Remote' });
  expect(document.activeElement).toBe(remote);
  await user.keyboard(' ');
  expect(remote.checked).toBe(true);
  const junior = screen.getByRole('button', { name: 'Junior' });
  act(() => junior.focus());
  await user.keyboard(' ');
  expect(junior.getAttribute('aria-pressed')).toBe('true');
  act(() => screen.getByRole('button', { name: 'Clear All' }).focus());
  await user.keyboard('{Enter}');
  expect(remote.checked).toBe(false);
  expect(junior.getAttribute('aria-pressed')).toBe('false');
});
