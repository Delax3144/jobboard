import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider } from './AuthContext';
import { useAuth } from './useAuth';
import api from '../lib/api';

vi.mock('../lib/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));

describe('Authentication contracts', () => {
  it('registration waits for email verification without creating a session', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { message: 'Check your email' } });
    const { result } = renderHook(useAuth, { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(() => result.current.register({ email: 'demo@example.test', password: 'Example123!',
      firstName: 'Demo', lastName: 'User', username: 'demo', role: 'candidate' }));
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
  it('a 2FA challenge does not create a session', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { requires2FA: true, challengeToken: 'challenge' } });
    const { result } = renderHook(useAuth, { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(() => result.current.login('demo@example.test', 'password'));
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
  it('removes invalid tokens left by older registrations', async () => {
    localStorage.setItem('token', 'undefined');
    const { result } = renderHook(useAuth, { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(localStorage.getItem('token')).toBeNull();
    expect(result.current.user).toBeNull();
  });
});
