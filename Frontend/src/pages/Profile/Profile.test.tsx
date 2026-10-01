import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import api from '../../lib/api';
import Profile from './Profile';

const auth = vi.hoisted(() => ({
  user: { id: 'demo', email: 'demo@example.com', firstName: 'Jane', lastName: 'Doe', role: 'candidate', isPublic: true },
  setUser: vi.fn(),
}));
vi.mock('../../context/useAuth', () => ({ useAuth: () => auth }));
vi.mock('../../lib/api', () => ({ default: { put: vi.fn(), post: vi.fn() } }));
vi.mock('../../components/profile/AvatarCropperModal', () => ({ default: () => null }));

it('supports editing, cancellation and pending profile saves', async () => {
  const user = userEvent.setup();
  let finishSave!: () => void;
  vi.mocked(api.put).mockImplementationOnce(() => new Promise(resolve => {
    finishSave = () => resolve({ data: { user: { ...auth.user, firstName: 'Janet' } } });
  }));
  render(<Profile />);
  const firstName = screen.getByDisplayValue('Jane') as HTMLInputElement;
  expect(firstName.disabled).toBe(true);
  await user.click(screen.getByRole('button', { name: 'Edit Profile' }));
  expect(firstName.disabled).toBe(false);
  await user.clear(firstName);
  await user.type(firstName, 'Changed');
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(firstName.value).toBe('Jane');
  expect(firstName.disabled).toBe(true);
  await user.click(screen.getByRole('button', { name: 'Edit Profile' }));
  await user.clear(firstName);
  await user.type(firstName, 'Janet');
  await user.click(screen.getByRole('button', { name: 'Save Changes' }));
  expect((screen.getByRole('button', { name: 'Saving...' }) as HTMLButtonElement).disabled).toBe(true);
  expect(api.put).toHaveBeenCalledWith('/auth/profile', expect.objectContaining({ firstName: 'Janet', lastName: 'Doe' }));
  await act(async () => { finishSave(); });
  expect(screen.getByText('Profile updated successfully.')).toBeTruthy();
  expect(firstName.disabled).toBe(true);
});

it('edits professional experience and toggles privacy using the keyboard', async () => {
  const user = userEvent.setup();
  vi.mocked(api.put).mockResolvedValue({ data: { user: { ...auth.user, isPublic: false } } });
  render(<Profile />);
  await user.click(screen.getByRole('button', { name: 'Professional Profile' }));
  await user.click(screen.getByRole('button', { name: 'Edit Profile' }));
  await user.click(screen.getByRole('button', { name: 'Add Role' }));
  await user.type(screen.getByPlaceholderText('Job Title'), 'Developer');
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.queryByPlaceholderText('Job Title')).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Privacy' }));
  const toggle = screen.getByRole('switch', { name: 'Public Profile' });
  expect(toggle.getAttribute('aria-checked')).toBe('true');
  toggle.focus();
  await user.keyboard(' ');
  expect(toggle.getAttribute('aria-checked')).toBe('false');
  expect(api.put).toHaveBeenCalledWith('/auth/profile', { isPublic: false });
});

it('rolls back a failed privacy save and allows a retry without overlapping requests', async () => {
  const user = userEvent.setup();
  let rejectSave!: () => void;
  vi.mocked(api.put).mockImplementationOnce(() => new Promise((_resolve, reject) => {
    rejectSave = () => reject(new Error('Offline'));
  }));
  render(<Profile />);
  await user.click(screen.getByRole('button', { name: 'Privacy' }));
  const toggle = screen.getByRole<HTMLButtonElement>('switch', { name: 'Public Profile' });
  await user.click(toggle);
  expect(toggle.getAttribute('aria-checked')).toBe('false');
  expect(toggle.disabled).toBe(true);
  await user.click(toggle);
  expect(api.put).toHaveBeenCalledTimes(1);
  await act(async () => { rejectSave(); });
  expect(toggle.getAttribute('aria-checked')).toBe('true');
  expect(toggle.disabled).toBe(false);
  expect(screen.getByRole('alert').textContent).toBe('Could not save settings. Please try again.');
  vi.mocked(api.put).mockResolvedValueOnce({ data: { user: { ...auth.user, isPublic: false } } });
  await user.click(toggle);
  expect(toggle.getAttribute('aria-checked')).toBe('false');
  expect(screen.queryByRole('alert')).toBeNull();
});

it('saves keyboard volume changes once and restores the last saved volume after failure', async () => {
  const user = userEvent.setup();
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.mocked(api.put).mockResolvedValueOnce({ data: { user: { ...auth.user, notificationVolume: 55 } } });
  render(<Profile />);
  await user.click(screen.getByRole('button', { name: 'Notifications' }));
  const slider = screen.getByRole<HTMLInputElement>('slider', { name: 'Alert Volume' });
  fireEvent.change(slider, { target: { value: '55' } });
  await act(async () => { fireEvent.keyUp(slider, { key: 'ArrowRight' }); });
  expect(api.put).toHaveBeenCalledWith('/auth/profile', { notificationVolume: 55 });
  fireEvent.blur(slider);
  expect(api.put).toHaveBeenCalledTimes(1);
  vi.mocked(api.put).mockRejectedValueOnce(new Error('Offline'));
  fireEvent.change(slider, { target: { value: '60' } });
  await act(async () => { fireEvent.keyUp(slider, { key: 'ArrowRight' }); });
  expect(slider.value).toBe('55');
  expect(screen.getByRole('alert')).toBeTruthy();
});

it('validates the 2FA code and prevents repeated verification while pending', async () => {
  const user = userEvent.setup();
  let finishVerification!: () => void;
  vi.mocked(api.post)
    .mockResolvedValueOnce({ data: { qrCodeUrl: 'data:image/png;base64,test' } })
    .mockImplementationOnce(() => new Promise(resolve => {
      finishVerification = () => resolve({ data: {} });
    }));
  render(<Profile />);
  await user.click(screen.getByRole('button', { name: 'Security & Password' }));
  await user.click(screen.getByRole('switch', { name: 'Two-Factor Authentication (2FA)' }));
  const verify = await screen.findByRole('button', { name: 'Verify & Enable' }) as HTMLButtonElement;
  expect(verify.disabled).toBe(true);
  await user.type(screen.getByPlaceholderText('000000'), 'a12345');
  expect((screen.getByPlaceholderText('000000') as HTMLInputElement).value).toBe('12345');
  expect(verify.disabled).toBe(true);
  await user.type(screen.getByPlaceholderText('000000'), '6');
  await user.click(verify);
  expect((screen.getByRole('button', { name: 'Verifying...' }) as HTMLButtonElement).disabled).toBe(true);
  expect(api.post).toHaveBeenLastCalledWith('/auth/2fa/enable', { code: '123456' });
  await act(async () => { finishVerification(); });
  expect(screen.queryByPlaceholderText('000000')).toBeNull();
  await user.click(screen.getByRole('switch', { name: 'Two-Factor Authentication (2FA)' }));
  expect((screen.getByRole('button', { name: 'Verify & Disable' }) as HTMLButtonElement).disabled).toBe(true);
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.queryByPlaceholderText('000000')).toBeNull();
});
