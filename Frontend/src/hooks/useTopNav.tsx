import NotificationToast from "../components/NotificationToast";
import type { NotificationEvent } from '../types/events';
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { io } from "socket.io-client";
import api from "../lib/api";
import type { Application } from '../types/job';
import { useAuth } from "../context/useAuth";
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



export function useTopNav(setMode: (m: UserMode) => void) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();

  const [unread, setUnread] = useState({ userId: '', count: 0 });
  const unreadCount = unread.userId === user?.id ? unread.count : 0;
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const isMobileMenuOpen = menuPath === location.key;
  const setIsMobileMenuOpen = (open: boolean) => setMenuPath(open ? location.key : null);

  const pathnameRef = useRef(location.pathname);

  const userRef = useRef(user);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  useEffect(() => {
    pathnameRef.current = location.pathname;

  }, [location.pathname]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    const currentUser = userRef.current;
    if (currentUser?.role) {
      setMode(currentUser.role === 'employer' ? 'employer' : 'candidate');
    }

    let active = true;
    let pendingRequest: AbortController | undefined;
    const checkUpdates = async () => {
      pendingRequest?.abort();
      const controller = new AbortController();
      pendingRequest = controller;
      try {
        const currentRole = userRef.current?.role;
        const endpoint = currentRole === 'employer' ? '/applications/owner' : '/applications/my';
        const res = await api.get<Application[]>(endpoint, { signal: controller.signal });
        if (active && !controller.signal.aborted) {
          setUnread({ userId, count: res.data.filter(app => app.hasUpdate).length });
        }
      } catch (err) {
        if (active && !controller.signal.aborted) {
          console.error("Error checking updates", err);
        }
      }
    };

    const token = localStorage.getItem("token");

    if (!token) return;

    checkUpdates();
    window.addEventListener("update_unread", checkUpdates);

    const socket = io(apiUrl, {
      auth: { token },
      withCredentials: true,
    });

    socket.on("connect", checkUpdates);
    socket.on("new_notification", (data: NotificationEvent) => {
      if (!active) return;
      if (data.applicationId && pathnameRef.current === `/messages/${data.applicationId}`) return;

      checkUpdates();

      const latestUser = userRef.current;
      if (latestUser?.soundEnabled !== false) {
        playNotificationSound(latestUser?.notificationVolume ?? 50);
      }

      if (latestUser?.toastsEnabled !== false) {
        const isMessage = data.type === 'new_message';
        let title = "Notification";
        let desc = "You have a new update";

        if (data.type === "new_application") { title = "New Application"; desc = data.message || 'New application'; }
        else if (data.type === "status_update") { title = "Status Update"; desc = `Action required for ${data.jobTitle}`; }
        else if (data.type === "new_message") { title = "New Message"; desc = "You received a new message"; }

        toast.custom((t) => (
          <NotificationToast visible={t.visible} isMessage={isMessage} title={title} description={desc}
          onClick={() => {
            toast.dismiss(t.id);
            if (data.applicationId) navigate(`/messages/${data.applicationId}`);
            else navigate(latestUser?.role === 'employer' ? '/employer' : '/applications');
          }}
 />
        ), { duration: 5000 });
      }
    });

    return () => {
      active = false;
      pendingRequest?.abort();
      socket.off("connect", checkUpdates);
      socket.disconnect();
      window.removeEventListener('update_unread', checkUpdates);
    };
  }, [userId, apiUrl, setMode, navigate]);

  useEffect(() => {
    if (!isLoading && user && user.role === "candidate" && location.pathname.startsWith("/employer")) {
      navigate("/", { replace: true });
    }
  }, [user, isLoading, location.pathname, navigate]);

  return {
    user, logout, unreadCount, isMobileMenuOpen, setIsMobileMenuOpen, apiUrl
  };
}
