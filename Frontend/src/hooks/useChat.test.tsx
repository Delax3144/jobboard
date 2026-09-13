import { beforeEach, describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import api from '../lib/api';
import { useChat } from './useChat';

vi.mock('../lib/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock('../context/useAuth', () => ({ useAuth: () => ({ user: { id: 'owner', role: 'employer' } }) }));
vi.mock('socket.io-client', () => ({ io: () => ({ on: vi.fn(), disconnect: vi.fn() }) }));
const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;

describe('Conversation list', () => {
  beforeEach(() => { vi.mocked(api.post).mockResolvedValue({ data: {} }); });
  it('keeps both applications from the same candidate accessible', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: ['job-a', 'job-b'].map((jobId, index) => ({
      id: `app-${index}`, createdAt: '2026-09-01', messages: [], status: 'new',
      candidate: { id: 'same-person', firstName: 'Alex' },
      job: { id: jobId, title: jobId, companyName: 'Demo' },
    })) });
    const { result } = renderHook(useChat, { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.filteredChats.map(app => app.id)).toEqual(['app-0', 'app-1']);
  });
  it('ends loading and shows an error when the API fails', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('offline'));
    const { result } = renderHook(useChat, { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toContain('Could not load');
  });
});
