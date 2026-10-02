import { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/useAuth';
import { useConversations } from './useConversations';
import { io } from 'socket.io-client';
import type { Application, Message } from '../types/job';

type Conversation = Application & { hasEarlierMessages?: boolean };
type MessagePage = { messages: Message[]; hasEarlierMessages: boolean };
function mergeMessages(first: Message[], second: Message[]) {
  return [...new Map([...first, ...second].map(message => [message.id, message])).values()]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
}

export function useChat() {
  const { id } = useParams();
  const { user } = useAuth();
  const [loadedApp, setLoadedApp] = useState<Conversation | null>(null);
  const [historyState, setHistoryState] = useState({ id: '', loading: false, error: '' });
  const historyRequestRef = useRef<AbortController | null>(null);
  const conversationRequestRef = useRef<AbortController | null>(null);
  const prependScrollRef = useRef<{ height: number; top: number } | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { text: string }>>({});
  const msg = id ? drafts[id]?.text ?? '' : '';
  const setMsg = (text: string) => {
    if (id) setDrafts(items => ({ ...items, [id]: { text } }));
  };
  const [error, setError] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeChatIdRef = useRef(id);
  const sendingRef = useRef(new Set<string>());
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const role = user?.role;
  const userId = user?.id;
  const currentApp = loadedApp?.id === id ? loadedApp : null;

  const conversationList = useConversations(userId, role);
  const { chats, searchQuery, setSearchQuery, loading } = conversationList;
  const refreshListRef = useRef(conversationList.refresh);
  const markReadRef = useRef(conversationList.markRead);
  useEffect(() => {
    refreshListRef.current = conversationList.refresh;
    markReadRef.current = conversationList.markRead;
  }, [conversationList.refresh, conversationList.markRead]);
  const fetchChats = useCallback(() => refreshListRef.current(), []);

  const fetchCurrentChat = useCallback(async (applicationId: string) => {
    conversationRequestRef.current?.abort();
    historyRequestRef.current?.abort();
    historyRequestRef.current = null;
    setHistoryState({ id: applicationId, loading: false, error: '' });
    const controller = new AbortController();
    conversationRequestRef.current = controller;
    try {
      const res = await api.get<Conversation>(`/applications/${applicationId}`, { params: { history: 'recent' }, signal: controller.signal });
      if (controller.signal.aborted || activeChatIdRef.current !== applicationId) return;
      setLoadedApp(previous => {
        const overlaps = previous?.id === applicationId && previous.messages.some(message => res.data.messages.some(latest => latest.id === message.id));
        return overlaps && previous ? { ...res.data,
          messages: mergeMessages(previous.messages, res.data.messages),
          hasEarlierMessages: previous.hasEarlierMessages,
        } : res.data;
      });
      markReadRef.current(applicationId);
      window.dispatchEvent(new Event('update_unread'));
    } catch {
      if (!controller.signal.aborted) setError('Could not load this conversation. Please try again.');
    } finally {
      if (conversationRequestRef.current === controller) conversationRequestRef.current = null;
    }
  }, []);

  useEffect(() => {
    activeChatIdRef.current = id;
    void fetchChats();
    if (id) void fetchCurrentChat(id);
    return () => {
      conversationRequestRef.current?.abort();
      historyRequestRef.current?.abort();
      prependScrollRef.current = null;
    };
  }, [id, fetchChats, fetchCurrentChat]);

  useLayoutEffect(() => {
    const anchor = prependScrollRef.current;
    if (anchor && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = anchor.top + scrollContainerRef.current.scrollHeight - anchor.height;
      prependScrollRef.current = null;
      return;
    }
    scrollContainerRef.current?.scrollTo?.({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });
  }, [currentApp?.messages.length, id]);

  const loadEarlierMessages = async () => {
    const before = currentApp?.messages[0]?.id;
    if (!id || !before || !currentApp?.hasEarlierMessages || historyRequestRef.current || conversationRequestRef.current) return;
    const controller = new AbortController();
    historyRequestRef.current = controller;
    setHistoryState({ id, loading: true, error: '' });
    try {
      const response = await api.get<MessagePage>(`/applications/${id}/messages`, { params: { before }, signal: controller.signal });
      if (controller.signal.aborted || activeChatIdRef.current !== id) return;
      const container = scrollContainerRef.current;
      if (container && response.data.messages.some(message => !currentApp.messages.some(existing => existing.id === message.id))) {
        prependScrollRef.current = { height: container.scrollHeight, top: container.scrollTop };
      }
      setLoadedApp(previous => previous?.id === id ? { ...previous,
        messages: mergeMessages(response.data.messages, previous.messages),
        hasEarlierMessages: response.data.hasEarlierMessages,
      } : previous);
      setHistoryState({ id, loading: false, error: '' });
    } catch {
      if (!controller.signal.aborted) setHistoryState({ id, loading: false, error: 'Could not load earlier messages. Please try again.' });
    } finally {
      if (historyRequestRef.current === controller) historyRequestRef.current = null;
    }
  };

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
    const refreshConversation = async (data: { applicationId?: string }) => {
      await fetchChats();
      if (data.applicationId && activeChatIdRef.current === data.applicationId) await fetchCurrentChat(data.applicationId);
    };
    socket.on('new_message', refreshConversation);
    socket.on('new_notification', async (data: { type: string; applicationId?: string }) => {
      if (data.type === 'status_update' || data.type === 'new_application') await refreshConversation(data);
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

  const filteredChats = chats;
  const isCurrentLockedForCandidate = role === 'candidate' && currentApp?.status === 'new' && !currentApp.messages.length;
  const checkIsOnline = (lastActiveDate?: string) => Boolean(lastActiveDate && Date.now() - new Date(lastActiveDate).getTime() < 60000);

  return { id, user, apiUrl, loading, error: error || conversationList.error, msg, setMsg, searchQuery, setSearchQuery,
    filteredChats, currentApp, isCurrentLockedForCandidate, scrollContainerRef, sendMsg, checkIsOnline,
    loadEarlierMessages,
    conversationPagination: conversationList.pagination,
    retryConversations: fetchChats,
    historyLoading: historyState.id === id && historyState.loading,
    historyError: historyState.id === id ? historyState.error : '',
  };
}
