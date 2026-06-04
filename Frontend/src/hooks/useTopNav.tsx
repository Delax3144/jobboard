// src/hooks/useTopNav.ts
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { io } from "socket.io-client";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { type UserMode } from "../lib/userMode";

const notificationAudio = new Audio('/notify.mp3');

const playNotificationSound = (volumePercentage: number = 50) => {
  try {
    notificationAudio.volume = volumePercentage / 100;
    notificationAudio.currentTime = 0;
    notificationAudio.play().catch(e => console.log("Audio autoplay blocked", e));
  } catch (err) {
    console.error("Audio playback error:", err);
  }
};

const ToastIcons = {
  Message: () => <svg width="20" height="20" fill="none" stroke="#10b981" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  Briefcase: () => <svg width="20" height="20" fill="none" stroke="#3b82f6" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
};

export function useTopNav(setMode: (m: UserMode) => void) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const socketRef = useRef<any>(null);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      setMode(user.role === 'employer' ? 'employer' : 'candidate');

      const checkUpdates = async () => {
        try {
          const endpoint = user.role === 'employer' ? '/applications/owner' : '/applications/my';
          const res = await api.get(endpoint);
          let count = 0;

          res.data.forEach((app: any) => {
            const isEmployer = user.role === 'employer';
            const lastUpdate = app.messages?.[0]?.createdAt || app.createdAt;
            const lastViewed = isEmployer ? app.lastViewedByOwner : app.lastViewedByCandidate;
            
            if (lastUpdate > lastViewed || (!isEmployer && app.status === 'invited' && lastUpdate > lastViewed)) {
              count++;
            }
          });
          setUnreadCount(count);
        } catch (err) {
          console.error("Error checking updates", err);
        }
      };

      checkUpdates();
      window.addEventListener('update_unread', checkUpdates);

      socketRef.current = io(apiUrl, { withCredentials: true });
      socketRef.current.emit("join", user.id);

      socketRef.current.on("new_notification", (data: any) => {
        if (data.applicationId && location.pathname === `/messages/${data.applicationId}`) return;

        checkUpdates();

        if ((user as any).soundEnabled !== false) {
          playNotificationSound((user as any).notificationVolume ?? 50);
        }

        if ((user as any).toastsEnabled !== false) {
          const isMessage = data.type === 'new_message';
          let title = "Notification";
          let desc = "You have a new update";

          if (data.type === "new_application") { title = "New Application"; desc = data.message; }
          else if (data.type === "status_update") { title = "Status Update"; desc = `Action required for ${data.jobTitle}`; }
          else if (data.type === "new_message") { title = "New Message"; desc = "You received a new message"; }

          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full`} style={{ 
              background: 'rgba(15, 15, 15, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '24px', padding: '20px', display: 'flex', gap: '15px', alignItems: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
            onClick={() => { 
              toast.dismiss(t.id); 
              if (data.applicationId) navigate(`/messages/${data.applicationId}`); 
              else navigate(user.role === 'employer' ? '/employer' : '/applications');
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(25, 25, 25, 0.9)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(15, 15, 15, 0.8)'}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: isMessage ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {isMessage ? <ToastIcons.Message /> : <ToastIcons.Briefcase />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', color: isMessage ? '#10b981' : '#3b82f6', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                  {title}
                </div>
                <div style={{ color: '#fff', fontSize: '16px', fontWeight: 700 }}>
                  {desc}
                </div>
              </div>
            </div>
          ), { duration: 5000 });
        }
      });

      return () => {
        if (socketRef.current) socketRef.current.disconnect();
        window.removeEventListener('update_unread', checkUpdates);
      };
    }
  }, [user, setMode, location.pathname, navigate, apiUrl]);

  useEffect(() => {
    if (!isLoading && user && user.role === "candidate" && location.pathname.startsWith("/employer")) {
      navigate("/", { replace: true });
    }
  }, [user, isLoading, location.pathname, navigate]);

  return {
    user, logout, unreadCount, isMobileMenuOpen, setIsMobileMenuOpen, apiUrl
  };
}