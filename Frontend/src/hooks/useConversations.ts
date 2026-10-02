import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../lib/api';
import type { Application } from '../types/job';
import type { UserRole } from '../types/user';

type ConversationPage = { conversations: Application[]; hasNextPage: boolean };

export function useConversations(userId: string | undefined, role: UserRole | undefined) {
  const [searchQuery, setSearchQuery] = useState('');
  const filterKey = JSON.stringify([userId, role, searchQuery.trim()]);
  const [pageState, setPageState] = useState({ filterKey, page: 1 });
  const page = pageState.filterKey === filterKey ? pageState.page : 1;
  const key = JSON.stringify([filterKey, page]);
  const [result, setResult] = useState<{ key: string; data: ConversationPage } | null>(null);
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const current = result?.key === key ? result.data : null;
  const error = failure?.key === key ? failure.message : '';

  const refresh = useCallback(async () => {
    requestRef.current?.abort();
    if (!userId) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setFailure(null);
    try {
      const response = await api.get<ConversationPage>('/applications/conversations', {
        params: { page, search: searchQuery.trim() }, signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setResult({ key, data: response.data });
      setFailure(null);
    } catch {
      if (!controller.signal.aborted) setFailure({ key, message: 'Could not load conversations. Please try again.' });
    }
  }, [key, page, searchQuery, userId]);

  useEffect(() => {
    const timer = setTimeout(() => { void refresh(); }, 250);
    return () => { clearTimeout(timer); requestRef.current?.abort(); };
  }, [refresh]);

  return {
    chats: current?.conversations ?? [], searchQuery, setSearchQuery,
    loading: Boolean(userId) && !current && !error, error, refresh,
    markRead: (id: string) => setResult(previous => previous?.key === key ? { ...previous,
      data: { ...previous.data, conversations: previous.data.conversations.map(app => app.id === id ? { ...app, hasUpdate: false } : app) },
    } : previous),
    pagination: {
      page, hasNextPage: current?.hasNextPage ?? false,
      setPage: (nextPage: number) => setPageState({ filterKey, page: Math.max(1, nextPage) }),
    },
  };
}
