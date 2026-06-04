// src/components/FloatingChatButton.tsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function FloatingChatButton() {
  const { user } = useAuth();
  const location = useLocation();
  const [hasNewMsg, setHasNewMsg] = useState(false);

  useEffect(() => {
    if (!user || location.pathname.startsWith("/messages")) {
      setHasNewMsg(false);
      return;
    }

    const checkUpdates = () => {
      const endpoint = user.role === 'employer' ? '/applications/owner' : '/applications/my';
      api.get(endpoint).then((res) => {
        const unread = res.data.some((app: any) => {
          const lastUpdate = app.messages?.[0]?.createdAt || app.createdAt;
          const lastViewed = user.role === 'employer' ? app.lastViewedByOwner : app.lastViewedByCandidate;
          return lastUpdate > lastViewed || (user.role === 'candidate' && app.status === 'invited' && lastUpdate > lastViewed);
        });
        setHasNewMsg(unread);
      }).catch(() => {});
    };

    checkUpdates();
    const interval = setInterval(checkUpdates, 10000);
    return () => clearInterval(interval);
  }, [user, location.pathname]);

  if (!user || location.pathname.startsWith("/messages")) return null;

  return (
    <Link 
      to="/messages" 
      className={`floating-chat-btn ${hasNewMsg ? 'has-notification' : ''}`}
      style={{
        background: 'linear-gradient(135deg, #10b981, #059669)',
        boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <svg width="26" height="26" fill="none" stroke="#000" strokeWidth="2" viewBox="0 0 24 24" style={{ marginLeft: '-2px', marginTop: '2px' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      
      {hasNewMsg && (
        <div 
          className="chat-notification-badge" 
          style={{ 
            width: '14px', height: '14px', top: '2px', right: '2px', 
            fontSize: 0, border: '2px solid #050505' 
          }} 
        />
      )}
    </Link>
  );
}