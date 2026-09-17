import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import Legal from './Legal';

it('switches policy content and marks the current navigation link', async () => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  const user = userEvent.setup();
  render(<MemoryRouter initialEntries={['/privacy']}><Legal /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: '1. Information We Collect' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Privacy Policy' }).getAttribute('aria-current')).toBe('page');
  await user.click(screen.getByRole('link', { name: 'Terms of Service' }));
  expect(screen.getByRole('heading', { name: '1. Acceptance of Terms' })).toBeTruthy();
  expect(screen.queryByRole('heading', { name: '1. Information We Collect' })).toBeNull();
  expect(screen.getByRole('link', { name: 'Terms of Service' }).getAttribute('aria-current')).toBe('page');
  await user.click(screen.getByRole('link', { name: 'Cookie Settings' }));
  expect(screen.getByRole('heading', { name: '1. What Are Cookies?' })).toBeTruthy();
  expect(screen.getByText('Setting unavailable')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Go Back' }));
  expect(screen.getByRole('heading', { name: '1. Acceptance of Terms' })).toBeTruthy();
});
