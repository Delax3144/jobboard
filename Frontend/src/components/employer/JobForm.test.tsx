import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import api from '../../lib/api';
import { useEmployer } from '../../hooks/useEmployer';
import JobForm from './JobForm';

vi.mock('../../lib/api', () => ({ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() } }));
vi.mock('../../context/useAuth', () => ({ useAuth: () => ({ user: { id: 'owner', role: 'employer' } }) }));
vi.mock('react-quill-new', () => ({ default: () => <div>Rich text editor</div> }));

function Editor() {
  const { form } = useEmployer();
  return <JobForm form={form} />;
}

beforeEach(() => {
  vi.mocked(api.get).mockImplementation(async url => ({ data: url === '/jobs/mine' ? { jobs: [] } : [] }));
});

it('submits with Enter and prevents duplicate vacancy creation while saving', async () => {
  const user = userEvent.setup();
  let finishSave!: () => void;
  vi.mocked(api.post).mockImplementationOnce(() => new Promise(resolve => {
    finishSave = () => resolve({ data: { id: 'created' } });
  }));
  render(<Editor />);
  const title = screen.getByRole<HTMLInputElement>('textbox', { name: 'Job Title' });
  await user.type(title, 'Frontend Developer');
  await user.keyboard('{Enter}');
  expect(api.post).toHaveBeenCalledTimes(1);
  expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Saving Vacancy...' }).disabled).toBe(true);
  expect(title.matches(':disabled')).toBe(true);
  fireEvent.submit(screen.getByRole('form', { name: 'Vacancy details' }));
  expect(api.post).toHaveBeenCalledTimes(1);
  await act(async () => { finishSave(); });
  expect(title.value).toBe('');
  expect(title.matches(':disabled')).toBe(false);
});

it('shows server validation next to its field, preserves the draft and supports retry', async () => {
  const user = userEvent.setup();
  vi.mocked(api.post).mockRejectedValueOnce({
    isAxiosError: true,
    response: { data: { message: 'Invalid job data', errors: { title: ['Title is too short'] } } },
  });
  render(<Editor />);
  const title = screen.getByRole<HTMLInputElement>('textbox', { name: 'Job Title' });
  await user.type(title, 'X');
  await user.click(screen.getByRole('button', { name: 'Launch Vacancy' }));
  expect(screen.getByRole('alert').textContent).toBe('Please correct the highlighted fields.');
  expect(title.value).toBe('X');
  expect(title.getAttribute('aria-invalid')).toBe('true');
  expect(document.getElementById(title.getAttribute('aria-describedby') ?? '')?.textContent).toBe('Title is too short');
  vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 'created' } });
  await user.clear(title);
  await user.type(title, 'Frontend Developer');
  await user.click(screen.getByRole('button', { name: 'Launch Vacancy' }));
  await waitFor(() => expect(title.value).toBe(''));
  expect(api.post).toHaveBeenCalledTimes(2);
  expect(screen.queryByRole('alert')).toBeNull();
  expect(title.getAttribute('aria-invalid')).toBe('false');
});
