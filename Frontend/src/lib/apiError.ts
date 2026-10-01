import axios from 'axios';

export function apiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error) && ['ECONNABORTED', 'ETIMEDOUT'].includes(error.code ?? '')) {
    return 'The server took too long to respond. Please try again later.';
  }
  return axios.isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message || fallback
    : fallback;
}
