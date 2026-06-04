// src/hooks/useChat.ts
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";

export function useChat() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [chats, setChats] = useState<any[]>([]); 
  const [currentApp, setCurrentApp] = useState<any>(null); 
  const [msg, setMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);
  const activeChatIdRef = useRef(id);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const checkIsOnline = (lastActiveDate?: string) => {
    if (!lastActiveDate) return false;
    return (Date.now() - new Date(lastActiveDate).getTime()) < 60000; 
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  };

  const fetchChats = async () => {
    try {
      const endpoint = user?.role === 'employer' ? '/applications/owner' : '/applications/my';
      const res = await api.get(endpoint);
      let fetchedData = res.data;

      if (user?.role === 'employer') {
        const grouped = new Map();
        fetchedData.forEach((app: any) => {
          const cid = app.candidate.id;
          if (!grouped.has(cid)) {
            grouped.set(cid, { ...app, allJobs: [app.job] });
          } else {
            const existing = grouped.get(cid);
            existing.allJobs.push(app.job);
            const existingDate = new Date(existing.messages?.[0]?.createdAt || existing.updatedAt || existing.createdAt).getTime();
            const newDate = new Date(app.messages?.[0]?.createdAt || app.updatedAt || app.createdAt).getTime();
            if (newDate > existingDate) {
              grouped.set(cid, { ...app, allJobs: existing.allJobs });
            }
          }
        });
        fetchedData = Array.from(grouped.values());
      } else {
        fetchedData = fetchedData.map((app: any) => ({ ...app, allJobs: [app.job] }));
      }

      fetchedData.sort((a: any, b: any) => {
        const dateA = new Date(a.messages?.[0]?.createdAt || a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.messages?.[0]?.createdAt || b.updatedAt || b.createdAt).getTime();
        return dateB - dateA;
      });

      setChats(fetchedData);
      setLoading(false);

      if (id) {
        const chatExists = fetchedData.find((c: any) => c.id === id);
        if (!chatExists) {
          const chatWithUser = fetchedData.find((c: any) => c.candidate?.id === id || c.job?.ownerId === id);
          if (chatWithUser) navigate(`/messages/${chatWithUser.id}`, { replace: true });
        }
      }
    } catch (err) { console.error(err); }
  };

  const fetchCurrentChat = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/applications/${id}`);
      setAppWithScroll(res.data);
      window.dispatchEvent(new Event('update_unread')); 
    } catch (err) { console.error(err); }
  };

  const setAppWithScroll = (data: any) => {
    const isNewMessage = currentApp?.messages?.length !== data.messages?.length;
    setCurrentApp(data);
    if (isNewMessage) setTimeout(scrollToBottom, 50);
  };

  useEffect(() => {
    if (!user) return;
    const ping = () => api.post('/auth/ping').catch(() => {});
    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    activeChatIdRef.current = id;
    fetchChats();
    fetchCurrentChat();
  }, [id, user]);

  useEffect(() => {
    if (!user) return;
    socketRef.current = io(apiUrl, { withCredentials: true });
    socketRef.current.emit("join", user.id);

    socketRef.current.on("new_message", (data: any) => {
      fetchChats(); 
      if (activeChatIdRef.current === data.applicationId) {
        api.get(`/applications/${data.applicationId}`).then(res => setAppWithScroll(res.data));
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user]);

  const sendMsg = async () => {
    if (!msg.trim() || !id) return;
    try {
      await api.post(`/applications/${id}/messages`, { text: msg });
      setMsg("");
      fetchCurrentChat();
      setTimeout(scrollToBottom, 50);
    } catch (err) { alert("Error sending message"); }
  };

  const filteredChats = chats.filter(chat => {
    const name = user?.role === 'employer' ? `${chat.candidate?.firstName} ${chat.candidate?.lastName}` : chat.job?.companyName;
    const matchesSearch = name?.toLowerCase().includes(searchQuery.toLowerCase()) || chat.job?.title.toLowerCase().includes(searchQuery.toLowerCase());
    const isCandidate = user?.role === 'candidate';
    const hasMessages = chat.messages && chat.messages.length > 0;
    if (isCandidate && chat.status === 'new' && !hasMessages) return false;
    return matchesSearch;
  });

  const isCurrentLockedForCandidate = user?.role === 'candidate' && currentApp?.status === 'new' && (!currentApp.messages || currentApp.messages.length === 0);

  return {
    id, user, apiUrl, loading, msg, setMsg, searchQuery, setSearchQuery,
    filteredChats, currentApp, isCurrentLockedForCandidate, scrollContainerRef,
    sendMsg, checkIsOnline
  };
}