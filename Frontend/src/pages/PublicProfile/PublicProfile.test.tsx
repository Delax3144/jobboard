import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import api from '../../lib/api';
import PublicProfile from './PublicProfile';

vi.mock('../../lib/api', () => ({ default: { get: vi.fn() } }));

const candidate = {
  id: 'candidate-1', firstName: 'Alex', lastName: 'Smith', username: 'alex',
  email: 'alex@example.com', isPublic: true, showEmail: true,
  bio: 'Frontend developer', skills: 'React, TypeScript',
  experience: [{ title: 'Developer', company: 'Demo', period: '2025', description: 'Built web apps' }],
};

function renderProfile() {
  render(<MemoryRouter initialEntries={['/candidate/candidate-1']}>
    <Routes><Route path="/candidate/:id" element={<PublicProfile />} /></Routes>
  </MemoryRouter>);
}

it('loads public details and links to the candidate conversation', async () => {
  vi.mocked(api.get).mockResolvedValue({ data: candidate });
  renderProfile();
  expect(screen.getByText('Loading Talent Profile...')).toBeTruthy();
  expect(await screen.findByRole('heading', { name: 'Alex Smith' })).toBeTruthy();
  expect(api.get).toHaveBeenCalledWith('/auth/users/candidate-1');
  expect(screen.getByText('alex@example.com')).toBeTruthy();
  expect(screen.getByText('React')).toBeTruthy();
  expect(screen.getByText('Built web apps')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Message' }).getAttribute('href')).toBe('/messages/candidate-1');
});

it.each([{ isPublic: false }, { status: 'Hidden' }])('hides private details for %j', async (privacy) => {
  vi.mocked(api.get).mockResolvedValue({ data: { ...candidate, ...privacy } });
  renderProfile();
  expect(await screen.findByText('This profile is private')).toBeTruthy();
  expect(screen.queryByText(candidate.email)).toBeNull();
  expect(screen.queryByText(candidate.bio)).toBeNull();
  expect(screen.queryByRole('link', { name: 'Message' })).toBeNull();
});

it('respects hidden email and shows fallbacks for an incomplete profile', async () => {
  vi.mocked(api.get).mockResolvedValue({ data: { ...candidate, showEmail: false, bio: '', skills: '', experience: [] } });
  renderProfile();
  expect(await screen.findByText('Hidden by candidate')).toBeTruthy();
  expect(screen.queryByText(candidate.email)).toBeNull();
  expect(screen.getByText("This candidate hasn't added a bio yet.")).toBeTruthy();
  expect(screen.getByText('No professional experience listed.')).toBeTruthy();
  expect(screen.getByText('No skills added.')).toBeTruthy();
});
