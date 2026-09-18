import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import api from '../lib/api';
import ApplyForm from './ApplyForm';

vi.mock('../lib/api', () => ({ default: { post: vi.fn() } }));

it('keeps the selected CV and pitch after failure and retries without duplicate submissions', async () => {
  const user = userEvent.setup();
  const success = vi.fn();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  let finish!: () => void;
  vi.mocked(api.post).mockRejectedValueOnce(new Error('offline')).mockImplementationOnce(() => new Promise(resolve => {
    finish = () => resolve({ data: {} });
  }));
  render(<ApplyForm jobId="job-1" jobTitle="Developer" onSuccess={success} />);
  const pitch = screen.getByRole('textbox', { name: /Motivation Pitch/ });
  await user.type(pitch, 'I build web apps.');
  const input = screen.getByLabelText('Resume / CV') as HTMLInputElement;
  const cv = new File(['resume'], 'resume.pdf', { type: 'application/pdf' });
  await user.upload(input, cv);
  expect(screen.getByText('resume.pdf')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Send Application' }));
  expect(await screen.findByRole('alert')).toBeTruthy();
  expect((pitch as HTMLTextAreaElement).value).toBe('I build web apps.');
  expect(screen.getByText('resume.pdf')).toBeTruthy();
  expect(success).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Send Application' }));
  const sending = screen.getByRole('button', { name: 'Sending Application...' }) as HTMLButtonElement;
  expect(sending.disabled).toBe(true);
  await user.click(sending);
  expect(api.post).toHaveBeenCalledTimes(2);
  const body = vi.mocked(api.post).mock.calls[1][1] as FormData;
  expect(body.get('jobId')).toBe('job-1');
  expect(body.get('coverLetter')).toBe('I build web apps.');
  expect((body.get('cv') as File).name).toBe('resume.pdf');
  await act(async () => { finish(); });
  expect(success).toHaveBeenCalledTimes(1);
});

it('opens file selection by keyboard and allows removing and selecting the same CV again', async () => {
  const user = userEvent.setup();
  render(<ApplyForm jobId="job-1" jobTitle="Developer" onSuccess={vi.fn()} />);
  const input = screen.getByLabelText('Resume / CV') as HTMLInputElement;
  const click = vi.spyOn(input, 'click');
  screen.getByRole('button', { name: /Click to upload your CV/ }).focus();
  await user.keyboard('{Enter}');
  expect(click).toHaveBeenCalledTimes(1);
  const cv = new File(['resume'], 'resume.pdf', { type: 'application/pdf' });
  await user.upload(input, cv);
  await user.click(screen.getByRole('button', { name: 'Remove CV' }));
  expect(input.value).toBe('');
  expect(screen.queryByText('resume.pdf')).toBeNull();
  expect(api.post).not.toHaveBeenCalled();
  await user.upload(input, cv);
  expect(screen.getByText('resume.pdf')).toBeTruthy();
});
