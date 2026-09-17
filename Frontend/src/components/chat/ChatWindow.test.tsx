import { createRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import type { Application } from '../../types/job';
import ChatWindow from './ChatWindow';

const application: Application = {
  id: 'app-1', jobId: 'job-1', candidateId: 'candidate', status: 'invited',
  createdAt: '2026-09-17', lastViewedByCandidate: '2026-09-17', lastViewedByOwner: '2026-09-17',
  candidate: { id: 'candidate', email: 'candidate@example.com' },
  job: {
    id: 'job-1', title: 'Frontend Developer', companyName: 'Demo', location: 'Remote',
    salaryFrom: 6000, salaryTo: 9000, level: 'Junior', tags: 'React', description: '',
    status: 'published', ownerId: 'owner', createdAt: '2026-09-17',
  },
  messages: [],
};
const send = vi.fn();

function Conversation({ locked = false, empty = false }) {
  const [msg, setMsg] = useState('');
  return <MemoryRouter><ChatWindow currentApp={empty ? null : application}
    isCurrentLockedForCandidate={locked} user={{ id: 'candidate', role: 'candidate', email: 'candidate@example.com' }}
    apiUrl="" msg={msg} setMsg={setMsg} sendMsg={send}
    scrollContainerRef={createRef<HTMLDivElement>()} checkIsOnline={() => false} /></MemoryRouter>;
}

it('keeps empty and locked conversations without a message composer', () => {
  const { rerender } = render(<Conversation empty />);
  expect(screen.getByText('Your Messages')).toBeTruthy();
  expect(screen.queryByRole('textbox', { name: 'Message' })).toBeNull();
  rerender(<Conversation locked />);
  expect(screen.getByText('Chat is Locked')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Send message' })).toBeNull();
});

it('keeps blank-message disabling and Enter/Shift+Enter behavior', async () => {
  const user = userEvent.setup();
  render(<Conversation />);
  const input = screen.getByRole('textbox', { name: 'Message' });
  const button = screen.getByRole('button', { name: 'Send message' }) as HTMLButtonElement;
  expect(button.disabled).toBe(true);
  await user.type(input, '   ');
  expect(button.disabled).toBe(true);
  await user.clear(input);
  await user.type(input, 'Hello');
  expect(button.disabled).toBe(false);
  await user.keyboard('{Shift>}{Enter}{/Shift}');
  expect((input as HTMLTextAreaElement).value).toBe('Hello\n');
  expect(send).not.toHaveBeenCalled();
  await user.keyboard('{Enter}');
  expect(send).toHaveBeenCalledTimes(1);
  await user.click(button);
  expect(send).toHaveBeenCalledTimes(2);
  expect(screen.getByRole('link', { name: 'Demo' }).getAttribute('href')).toBe('/jobs/job-1');
});
