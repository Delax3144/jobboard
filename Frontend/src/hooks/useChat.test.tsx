import { beforeEach, describe, it, expect, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
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

describe('Conversation drafts', () => {
  const chatWrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={['/messages/app-a']}>
      <Routes><Route path="/messages/:id" element={children} /></Routes>
    </MemoryRouter>
  );
  const renderChat = () => renderHook(() => ({ ...useChat(), navigate: useNavigate() }), { wrapper: chatWrapper });

  beforeEach(() => {
    vi.mocked(api.post).mockResolvedValue({ data: {} });
    vi.mocked(api.get).mockImplementation(async url => ({ data: url === '/applications/owner' ? [] : {
      id: String(url).split('/').pop(), messages: [], status: 'reviewed',
    } }));
  });

  it('keeps a separate draft for each conversation when switching back and forth', async () => {
    const { result } = renderChat();
    await waitFor(() => expect(result.current.currentApp?.id).toBe('app-a'));
    act(() => result.current.setMsg('Draft A'));
    act(() => result.current.navigate('/messages/app-b'));
    expect(result.current.msg).toBe('');
    act(() => result.current.setMsg('Draft B'));
    act(() => result.current.navigate('/messages/app-a'));
    expect(result.current.msg).toBe('Draft A');
    act(() => result.current.navigate('/messages/app-b'));
    expect(result.current.msg).toBe('Draft B');
    await waitFor(() => expect(result.current.currentApp?.id).toBe('app-b'));
  });

  it.each([false, true])('preserves text typed during a pending send, in another chat: %s', async switchChat => {
    const { result } = renderChat();
    await waitFor(() => expect(result.current.currentApp?.id).toBe('app-a'));
    let finishSending!: () => void;
    vi.mocked(api.post).mockImplementationOnce(() => new Promise(resolve => {
      finishSending = () => resolve({ data: {} });
    }));
    act(() => result.current.setMsg('First message'));
    let pending!: Promise<void>;
    act(() => { pending = result.current.sendMsg(); });
    if (switchChat) act(() => result.current.navigate('/messages/app-b'));
    act(() => result.current.setMsg('New draft'));
    await act(async () => { finishSending(); await pending; });
    expect(result.current.msg).toBe('New draft');
    expect(api.post).toHaveBeenCalledWith('/applications/app-a/messages', { text: 'First message' });
    if (switchChat) {
      act(() => result.current.navigate('/messages/app-a'));
      expect(result.current.msg).toBe('');
      await waitFor(() => expect(result.current.currentApp?.id).toBe('app-a'));
    }
  });

  it('retains a failed message for retry and clears it after a successful send', async () => {
    const { result } = renderChat();
    await waitFor(() => expect(result.current.currentApp?.id).toBe('app-a'));
    vi.mocked(api.post).mockRejectedValueOnce(new Error('offline'));
    act(() => result.current.setMsg('Retry this message'));
    await act(async () => { await result.current.sendMsg(); });
    expect(result.current.msg).toBe('Retry this message');
    expect(result.current.error).toContain('Could not send');
    await act(async () => { await result.current.sendMsg(); });
    expect(result.current.msg).toBe('');
    expect(result.current.error).toBe('');
  });

  it('blocks duplicate sends in one chat while allowing a send in another', async () => {
    const { result } = renderChat();
    await waitFor(() => expect(result.current.currentApp?.id).toBe('app-a'));
    let finishSending!: () => void;
    vi.mocked(api.post).mockImplementationOnce(() => new Promise(resolve => {
      finishSending = () => resolve({ data: {} });
    }));
    act(() => result.current.setMsg('Message A'));
    let pending!: Promise<void>;
    act(() => { pending = result.current.sendMsg(); });
    await act(async () => { await result.current.sendMsg(); });
    expect(vi.mocked(api.post).mock.calls.filter(([url]) => url === '/applications/app-a/messages')).toHaveLength(1);
    act(() => result.current.navigate('/messages/app-b'));
    act(() => result.current.setMsg('Message B'));
    await act(async () => { await result.current.sendMsg(); });
    expect(api.post).toHaveBeenCalledWith('/applications/app-b/messages', { text: 'Message B' });
    expect(result.current.msg).toBe('');
    await act(async () => { finishSending(); await pending; });
  });
});
