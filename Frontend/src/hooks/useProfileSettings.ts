import { useRef, useState } from 'react';
import { useAuth } from '../context/useAuth';
import api from '../lib/api';
import { apiErrorMessage } from '../lib/apiError';
import type { User } from '../types/user';

type ProfileSettings = Required<Pick<User,
  'isPublic' | 'showEmail' | 'soundEnabled' | 'toastsEnabled' | 'notificationVolume'
>>;
type ToggleSetting = Exclude<keyof ProfileSettings, 'notificationVolume'>;

export function useProfileSettings() {
  const { user, setUser } = useAuth();
  const [settings, setSettings] = useState<ProfileSettings>(() => ({
    isPublic: user?.isPublic ?? true,
    showEmail: user?.showEmail ?? false,
    soundEnabled: user?.soundEnabled ?? true,
    toastsEnabled: user?.toastsEnabled ?? true,
    notificationVolume: user?.notificationVolume ?? 50,
  }));
  const savedSettings = useRef(settings);
  const savingRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function saveSettings(changes: Partial<ProfileSettings>) {
    if (savingRef.current) return false;
    savingRef.current = true;
    setIsSaving(true);
    setError('');
    setMessage('');
    setSettings(current => ({ ...current, ...changes }));

    try {
      const { data } = await api.put<{ user: User }>('/auth/profile', changes);
      const confirmed: Partial<ProfileSettings> = {};
      for (const field of Object.keys(changes) as (keyof ProfileSettings)[]) {
        if (field === 'notificationVolume') {
          confirmed.notificationVolume = data.user.notificationVolume ?? changes.notificationVolume;
        } else {
          confirmed[field] = data.user[field] ?? changes[field];
        }
      }
      savedSettings.current = { ...savedSettings.current, ...confirmed };
      setSettings(current => ({ ...current, ...confirmed }));
      setUser(current => current ? { ...current, ...confirmed } : null);
      setMessage('Settings saved.');
      return true;
    } catch (failure) {
      setSettings(savedSettings.current);
      setError(apiErrorMessage(failure, 'Could not save settings. Please try again.'));
      return false;
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }

  function toggleSetting(field: ToggleSetting) {
    void saveSettings({ [field]: !settings[field] });
  }

  function setNotificationVolume(volume: number) {
    if (savingRef.current) return;
    setSettings(current => ({ ...current, notificationVolume: volume }));
    setError('');
    setMessage('');
  }

  async function commitVolume(volume: number) {
    if (volume === savedSettings.current.notificationVolume) return;
    if (await saveSettings({ notificationVolume: volume })) {
      const preview = new Audio('/notify.mp3');
      preview.volume = volume / 100;
      void preview.play().catch(() => {});
    }
  }

  return { ...settings, isSaving, error, message, toggleSetting, setNotificationVolume, commitVolume };
}
