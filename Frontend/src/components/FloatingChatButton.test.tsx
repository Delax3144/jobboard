import { it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import api from '../lib/api';
import FloatingChatButton from './FloatingChatButton';

vi.mock('../lib/api', () => ({ default: { get: vi.fn() } }));
const auth = vi.hoisted(() => ({ user: { id: 'candidate', role: 'candidate' } }));
vi.mock('../context/useAuth', () => ({ useAuth: () => auth }));
it('shows unread status changes using the API flag even without messages', async () => {
  vi.mocked(api.get).mockResolvedValue({ data: [{ hasUpdate: true, messages: [], status: 'invited' }] });
  render(<MemoryRouter><FloatingChatButton /></MemoryRouter>);
  expect((await screen.findByRole('link', { name: 'Open messages — unread updates' })).getAttribute('href')).toBe('/messages');
});

it('hides the shortcut and does not poll while viewing messages', () => {
  render(<MemoryRouter initialEntries={['/messages/conversation-1']}><FloatingChatButton /></MemoryRouter>);
  expect(screen.queryByRole('link')).toBeNull();
  expect(api.get).not.toHaveBeenCalled();
});
