import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import NotificationToast from './NotificationToast';

it.each([true, false])('displays notification content and forwards clicks (message: %s)', async isMessage => {
  const click = vi.fn();
  render(<NotificationToast visible isMessage={isMessage} title="Update" description="Your application has an update" onClick={click} />);
  expect(screen.getByText('Update')).toBeTruthy();
  await userEvent.setup().click(screen.getByText('Your application has an update'));
  expect(click).toHaveBeenCalledTimes(1);
});
