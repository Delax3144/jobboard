import { expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TopNav from './TopNav';
import userEvent from '@testing-library/user-event';

const nav = vi.hoisted(() => ({
  user: null, logout: vi.fn(), unreadCount: 0,
  isMobileMenuOpen: true, setIsMobileMenuOpen: vi.fn(), apiUrl: '',
}));
vi.mock('../hooks/useTopNav', () => ({ useTopNav: () => nav }));

it('uses English navigation despite a saved Russian preference and Russian browser language', async () => {
  localStorage.setItem('i18nextLng', 'ru');
  vi.spyOn(navigator, 'language', 'get').mockReturnValue('ru-RU');
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['ru-RU']);
  const { default: i18n } = await import('../i18n');
  await waitFor(() => expect(i18n.resolvedLanguage).toBe('en'));
  const { container } = render(<MemoryRouter><TopNav mode="candidate" setMode={vi.fn()} /></MemoryRouter>);
  expect(screen.getAllByRole('link', { name: 'Explore Jobs' })).toHaveLength(2);
  expect(screen.queryByRole('button', { name: /^(RU|EN|English \(EN\)|Русский \(RU\))$/ })).toBeNull();
  expect(container.textContent).not.toMatch(/[А-Яа-яЁё]/);
});

it('closes the mobile menu through its toggle and navigation links', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter><TopNav mode="candidate" setMode={vi.fn()} /></MemoryRouter>);
  await user.click(screen.getByRole('button', { name: 'Close menu' }));
  expect(nav.setIsMobileMenuOpen).toHaveBeenCalledWith(false);
  nav.setIsMobileMenuOpen.mockClear();
  await user.click(screen.getAllByRole('link', { name: 'Explore Jobs' })[1]);
  expect(nav.setIsMobileMenuOpen).toHaveBeenCalledWith(false);
});
