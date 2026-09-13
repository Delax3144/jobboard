import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/useAuth';
import { io } from 'socket.io-client';
import type { Application } from '../types/job';

export function useChat() {
  const { id } = useParams();
  const { user } = useAuth();
  const [chats, setChats] = useState<Application[]>([]);
  const [loadedApp, setLoadedApp] = useState<Application | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { text: string }>>({});
  const msg = id ? drafts[id]?.text ?? '' : '';
  const setMsg = (text: string) => {
    if (id) setDrafts(items => ({ ...items, [id]: { text } }));
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeChatIdRef = useRef(id);
  const sendingRef = useRef(new Set<string>());
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const role = user?.role;
  const userId = user?.id;
  const currentApp = loadedApp?.id === id ? loadedApp : null;

  const fetchChats = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await api.get<Application[]>(role === 'employer' ? '/applications/owner' : '/applications/my');
      setChats(res.data.sort((a, b) =>
        new Date(b.messages?.[0]?.createdAt || b.createdAt).getTime() -
        new Date(a.messages?.[0]?.createdAt || a.createdAt).getTime()));
      setError('');
    } catch { setError('Could not load conversations. Please try again.'); }
    finally { setLoading(false); }
  }, [role, userId]);

  const fetchCurrentChat = useCallback(async (applicationId: string) => {
    try {
      const res = await api.get<Application>(`/applications/${applicationId}`);
      if (activeChatIdRef.current !== applicationId) return;
      setLoadedApp(res.data);
      setChats(items => items.map(app => app.id === applicationId ? { ...app, hasUpdate: false } : app));
      window.dispatchEvent(new Event('update_unread'));
    } catch { setError('Could not load this conversation. Please try again.'); }
  }, []);

  useEffect(() => {
    activeChatIdRef.current = id;
    void fetchChats();
    if (id) void fetchCurrentChat(id);
  }, [id, fetchChats, fetchCurrentChat]);

  useEffect(() => {
    scrollContainerRef.current?.scrollTo?.({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });
  }, [currentApp?.messages.length, id]);

  useEffect(() => {
    if (!userId) return;
    const ping = () => { void api.post('/auth/ping').catch(() => {}); };
    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!userId || !token) return;
    const socket = io(apiUrl, { auth: { token }, withCredentials: true });
    socket.on('new_message', async (data: { applicationId: string }) => {
      await fetchChats();
      if (activeChatIdRef.current === data.applicationId) await fetchCurrentChat(data.applicationId);
    });
    socket.on('connect', () => {
      void fetchChats();
      if (activeChatIdRef.current) void fetchCurrentChat(activeChatIdRef.current);
    });
    return () => { socket.disconnect(); };
  }, [userId, apiUrl, fetchChats, fetchCurrentChat]);

  const sendMsg = async () => {
    if (!msg.trim() || !id || sendingRef.current.has(id)) return;
    const sentDraft = drafts[id];
    sendingRef.current.add(id);
    setError('');
    try {
      await api.post(`/applications/${id}/messages`, { text: msg });
      setDrafts(items => {
        // Each edit creates a new object, even if the user types the same text again.
        if (items[id] !== sentDraft) return items;
        const next = { ...items };
        delete next[id];
        return next;
      });
      if (activeChatIdRef.current === id) await fetchCurrentChat(id);
    } catch {
      if (activeChatIdRef.current === id) setError('Could not send your message. Please try again.');
    }
    finally { sendingRef.current.delete(id); }
  };

  const filteredChats = chats.filter(chat => {
    const name = role === 'employer' ? `${chat.candidate?.firstName} ${chat.candidate?.lastName}` : chat.job.companyName;
    const matches = `${name} ${chat.job.title}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matches && !(role === 'candidate' && chat.status === 'new' && !chat.messages?.length);
  });
  const isCurrentLockedForCandidate = role === 'candidate' && currentApp?.status === 'new' && !currentApp.messages.length;
  const checkIsOnline = (lastActiveDate?: string) => Boolean(lastActiveDate && Date.now() - new Date(lastActiveDate).getTime() < 60000);

  return { id, user, apiUrl, loading, error, msg, setMsg, searchQuery, setSearchQuery,
    filteredChats, currentApp, isCurrentLockedForCandidate, scrollContainerRef, sendMsg, checkIsOnline };
}
