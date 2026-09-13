import { it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import api from '../lib/api';
import FloatingChatButton from './FloatingChatButton';

vi.mock('../lib/api', () => ({ default: { get: vi.fn() } }));
vi.mock('../context/useAuth', () => ({ useAuth: () => ({ user: { id: 'candidate', role: 'candidate' } }) }));
it('shows unread status changes using the API flag even without messages', async () => {
  vi.mocked(api.get).mockResolvedValue({ data: [{ hasUpdate: true, messages: [], status: 'invited' }] });
  const { container } = render(<MemoryRouter><FloatingChatButton /></MemoryRouter>);
  await waitFor(() => expect(container.querySelector('.chat-notification-badge')).not.toBeNull());
});
