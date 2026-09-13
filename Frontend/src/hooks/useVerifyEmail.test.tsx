import { it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { StrictMode, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import api from '../lib/api';
import { useVerifyEmail } from './useVerifyEmail';
vi.mock('../lib/api', () => ({ default: { post: vi.fn() } }));

it('consumes an email verification token once in StrictMode', async () => {
  vi.mocked(api.post).mockResolvedValue({ data: {} });
  const wrapper = ({ children }: { children: ReactNode }) => <StrictMode>
    <MemoryRouter initialEntries={['/verify-email?token=test-token']}>{children}</MemoryRouter>
  </StrictMode>;
  const { result } = renderHook(useVerifyEmail, { wrapper });
  await waitFor(() => expect(result.current.status).toBe('success'));
  expect(api.post).toHaveBeenCalledTimes(1);
});
