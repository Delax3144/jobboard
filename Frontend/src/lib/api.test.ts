import { AxiosError, AxiosHeaders } from 'axios';
import { expect, it, vi } from 'vitest';
import api from './api';
import { apiErrorMessage } from './apiError';

it('limits browser requests and reports a timeout without expiring the session', async () => {
  localStorage.setItem('token', 'test-session');
  const expired = vi.fn();
  window.addEventListener('auth_expired', expired);
  let requestTimeout = 0;
  vi.spyOn(XMLHttpRequest.prototype, 'send').mockImplementation(function (this: XMLHttpRequest) {
    requestTimeout = this.timeout;
    this.dispatchEvent(new ProgressEvent('timeout'));
  });
  try {
    const error: unknown = await api.get('/jobs', { adapter: 'xhr' }).catch((reason: unknown) => reason);
    expect(requestTimeout).toBe(30_000);
    expect(error).toBeInstanceOf(AxiosError);
    expect(apiErrorMessage(error, 'Could not load jobs')).toBe(
      'The server took too long to respond. Please try again later.',
    );
    expect(localStorage.getItem('token')).toBe('test-session');
    expect(expired).not.toHaveBeenCalled();
  } finally {
    window.removeEventListener('auth_expired', expired);
  }
});

it('allows a request to override the default timeout', async () => {
  let requestTimeout = 0;
  vi.spyOn(XMLHttpRequest.prototype, 'send').mockImplementation(function (this: XMLHttpRequest) {
    requestTimeout = this.timeout;
    this.dispatchEvent(new ProgressEvent('timeout'));
  });
  await expect(api.get('/jobs', { adapter: 'xhr', timeout: 60_000 })).rejects.toBeInstanceOf(AxiosError);
  expect(requestTimeout).toBe(60_000);
});

it('preserves server validation messages and fallback messages', () => {
  const error = new AxiosError('Bad request', 'ERR_BAD_REQUEST');
  error.response = {
    data: { message: 'Invalid verification code' }, status: 400,
    statusText: 'Bad Request', headers: {}, config: { headers: new AxiosHeaders() },
  };
  expect(apiErrorMessage(error, 'Failed')).toBe('Invalid verification code');
  expect(apiErrorMessage(new Error('offline'), 'Failed')).toBe('Failed');
});
