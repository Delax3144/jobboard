import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import Modal from './Modal';

it('closes by button, Escape and backdrop, but keeps content clicks inside', async () => {
  const close = vi.fn();
  const user = userEvent.setup();
  const { container, rerender } = render(<Modal open title="Example" onClose={close}><button>Inside</button></Modal>);
  await user.click(screen.getByRole('button', { name: 'Inside' }));
  expect(close).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Close' }));
  expect(close).toHaveBeenCalledTimes(1);
  await user.keyboard('{Escape}');
  expect(close).toHaveBeenCalledTimes(2);
  fireEvent.mouseDown(container.firstElementChild!);
  expect(close).toHaveBeenCalledTimes(3);
  rerender(<Modal open={false} title="Example" onClose={close}><button>Inside</button></Modal>);
  expect(screen.queryByRole('heading', { name: 'Example' })).toBeNull();
  await user.keyboard('{Escape}');
  expect(close).toHaveBeenCalledTimes(3);
});

it('does not submit a surrounding form when closing', async () => {
  const submit = vi.fn(event => event.preventDefault());
  render(<form onSubmit={submit}><Modal open onClose={vi.fn()}>Content</Modal></form>);
  await userEvent.setup().click(screen.getByRole('button', { name: 'Close' }));
  expect(submit).not.toHaveBeenCalled();
});
