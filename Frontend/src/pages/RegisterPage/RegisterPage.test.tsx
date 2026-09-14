import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import RegisterPage from './RegisterPage';

const auth = vi.hoisted(() => ({ register: vi.fn(), googleLogin: vi.fn() }));
vi.mock('../../context/useAuth', () => ({ useAuth: () => auth }));
vi.mock('@react-oauth/google', () => ({ GoogleLogin: () => null }));

it('validates passwords and preserves the selected role through pending registration and success', async () => {
  const user = userEvent.setup();
  let finishRegistration!: () => void;
  auth.register.mockImplementationOnce(() => new Promise<void>(resolve => {
    finishRegistration = resolve;
  }));
  render(<MemoryRouter><RegisterPage /></MemoryRouter>);
  expect(screen.getByRole('button', { name: 'Candidate' }).getAttribute('aria-pressed')).toBe('true');
  await user.click(screen.getByRole('button', { name: 'Employer' }));
  expect(screen.getByRole('button', { name: 'Employer' }).getAttribute('aria-pressed')).toBe('true');
  await user.type(screen.getByPlaceholderText('John'), 'John');
  await user.type(screen.getByPlaceholderText('Doe'), 'Doe');
  await user.type(screen.getByPlaceholderText('johndoe77'), 'johndoe77');
  await user.type(screen.getByPlaceholderText('name@example.com'), 'demo@example.com');
  const [password, confirmation] = screen.getAllByPlaceholderText('••••••••') as HTMLInputElement[];
  await user.type(password, 'test-password');
  await user.type(confirmation, 'different-password');
  await user.click(screen.getByRole('button', { name: 'Create Account' }));
  expect(screen.getByText('Passwords do not match!')).toBeTruthy();
  expect(auth.register).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Show password' }));
  expect(password.type).toBe('text');
  expect(confirmation.type).toBe('text');
  await user.click(screen.getByRole('button', { name: 'Hide password' }));
  expect(password.type).toBe('password');
  await user.clear(confirmation);
  await user.type(confirmation, 'test-password');
  await user.click(screen.getByRole('button', { name: 'Create Account' }));
  expect((screen.getByRole('button', { name: 'Creating Account...' }) as HTMLButtonElement).disabled).toBe(true);
  expect(auth.register).toHaveBeenCalledExactlyOnceWith({
    firstName: 'John', lastName: 'Doe', username: 'johndoe77', email: 'demo@example.com',
    phone: '', password: 'test-password', confirmPassword: 'test-password', role: 'employer',
  });
  await act(async () => { finishRegistration(); });
  expect(screen.getByText('Check your inbox!')).toBeTruthy();
  expect(screen.getByText('demo@example.com')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Go to Login' }).getAttribute('href')).toBe('/login');
});
