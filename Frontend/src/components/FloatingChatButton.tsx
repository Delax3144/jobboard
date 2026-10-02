import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/useAuth";
import styles from "./FloatingChatButton.module.css";

export default function FloatingChatButton() {
  const { user } = useAuth();
  const location = useLocation();
  const userId = user?.id;
  const [unread, setUnread] = useState({ userId: '', count: 0 });
  const hasNewMsg = unread.userId === userId && unread.count > 0;

  useEffect(() => {
    if (!userId || location.pathname.startsWith("/messages")) {
      return;
    }

    let active = true;
    let pendingRequest: AbortController | undefined;
    const checkUpdates = async () => {
      pendingRequest?.abort();
      const controller = new AbortController();
      pendingRequest = controller;
      try {
        const response = await api.get<{ count: number }>('/applications/unread-count', { signal: controller.signal });
        if (active && !controller.signal.aborted) setUnread({ userId, count: response.data.count });
      } catch { return; }
    };

    checkUpdates();
    const interval = setInterval(checkUpdates, 10000);
    window.addEventListener('update_unread', checkUpdates);
    return () => {
      active = false;
      pendingRequest?.abort();
      clearInterval(interval);
      window.removeEventListener('update_unread', checkUpdates);
    };
  }, [userId, location.pathname]);

  if (!user || location.pathname.startsWith("/messages")) return null;

  return (
    <Link 
      to="/messages" 
      aria-label={hasNewMsg ? 'Open messages — unread updates' : 'Open messages'}
      className={styles.button}
      data-unread={hasNewMsg || undefined}
    >
      <svg width="26" height="26" fill="none" stroke="#000" strokeWidth="2" viewBox="0 0 24 24" className={styles.icon}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      
      {hasNewMsg && (
        <span className={styles.badge} aria-hidden="true" />
      )}
    </Link>
  );
}
