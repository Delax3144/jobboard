import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import api from '../../lib/api';
import AvatarCropperModal from './AvatarCropperModal';

vi.mock('../../lib/api', () => ({ default: { post: vi.fn() } }));
vi.mock('react-easy-crop', async () => {
  const { useEffect } = await import('react');
  return { default: function Cropper({ onCropComplete, zoom }: {
    onCropComplete: (area: { x: number; y: number; width: number; height: number }, pixels: { x: number; y: number; width: number; height: number }) => void;
    zoom: number;
  }) {
    useEffect(() => {
      const area = { x: 0, y: 0, width: 100, height: 100 };
      onCropComplete(area, area);
    }, [onCropComplete]);
    return <output aria-label="Current zoom">{zoom}</output>;
  } };
});

it('changes zoom and saves the cropped image while blocking repeated clicks', async () => {
  const user = userEvent.setup();
  const close = vi.fn(), setUser = vi.fn(), setMessage = vi.fn();
  vi.spyOn(window, 'Image').mockImplementation(function () {
    const image = document.createElement('img');
    queueMicrotask(() => image.dispatchEvent(new Event('load')));
    return image;
  });
  const drawImage = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(callback => callback(new Blob(['avatar'], { type: 'image/jpeg' })));
  let finish!: () => void;
  const updatedUser = { id: 'candidate', avatarUrl: '/avatar.jpg' };
  vi.mocked(api.post).mockImplementation(() => new Promise(resolve => {
    finish = () => resolve({ data: { user: updatedUser } });
  }));
  render(<AvatarCropperModal open imageSrc="data:image/png;base64,example" onClose={close} setUser={setUser} setMessage={setMessage} />);
  fireEvent.change(screen.getByRole('slider', { name: 'Avatar zoom' }), { target: { value: '2' } });
  expect(screen.getByLabelText('Current zoom').textContent).toBe('2');
  await user.click(screen.getByRole('button', { name: 'Set as Profile Picture' }));
  const saving = await screen.findByRole('button', { name: 'Saving...' }) as HTMLButtonElement;
  expect(saving.disabled).toBe(true);
  await user.click(saving);
  expect(api.post).toHaveBeenCalledTimes(1);
  expect(api.post).toHaveBeenCalledWith('/auth/avatar', expect.any(FormData), expect.any(Object));
  expect(drawImage).toHaveBeenCalled();
  await act(async () => { finish(); });
  expect(setUser).toHaveBeenCalledWith(updatedUser);
  expect(close).toHaveBeenCalledTimes(1);
  expect(setMessage).toHaveBeenCalledWith('Avatar updated successfully! 📸');
});

it('cancels without uploading an avatar', async () => {
  const close = vi.fn();
  render(<AvatarCropperModal open imageSrc={null} onClose={close} setUser={vi.fn()} setMessage={vi.fn()} />);
  await userEvent.setup().click(screen.getByRole('button', { name: 'Cancel' }));
  expect(close).toHaveBeenCalledTimes(1);
  expect(api.post).not.toHaveBeenCalled();
});
