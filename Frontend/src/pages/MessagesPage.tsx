/* MessagesPage.tsx */
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";

const Icons = {
  Send: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>,
  Search: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>,
  Info: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
  ChevronLeft: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
};

export default function MessagesPage() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [chats, setChats] = useState<any[]>([]); 
  const [currentApp, setCurrentApp] = useState<any>(null); 
  const [msg, setMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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
      const fetchedChats = res.data;
      setChats(fetchedChats);
      setLoading(false);

      if (id) {
        const chatExists = fetchedChats.find((c: any) => c.id === id);
        if (!chatExists) {
          const chatWithUser = fetchedChats.find((c: any) => c.candidate?.id === id || c.job?.ownerId === id);
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
      
      // === ВОТ ЭТА МАГИЧЕСКАЯ СТРОКА ===
      // Сообщаем всей системе, что мы прочитали чат!
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

  // === НОВАЯ ЛОГИКА ЧАТА ЧЕРЕЗ WEBSOCKETS ===
  
  const socketRef = useRef<any>(null);
  const activeChatIdRef = useRef(id); // Храним актуальный ID чата для сокета

  // 1. При переключении чатов: обновляем реф и подтягиваем данные
  useEffect(() => {
    activeChatIdRef.current = id;
    fetchChats();
    fetchCurrentChat();
  }, [id, user]);

  // 2. Подключение к сокету и прослушивание новых сообщений
  useEffect(() => {
    if (!user) return;

    // Мы берем чистый домен сайта, отрезая хвосты вроде /api
    socketRef.current = io(apiUrl, { 
      withCredentials: true 
    });
    socketRef.current.emit("join", user.id);

    // Как только сервер присылает сообщение:
    socketRef.current.on("new_message", (data: any) => {
      // 1. Обновляем левое меню (чтобы загорелась зеленая точка)
      fetchChats(); 

      // 2. Если мы сейчас находимся именно в этом чате - мгновенно подгружаем новые сообщения!
      if (activeChatIdRef.current === data.applicationId) {
        api.get(`/applications/${data.applicationId}`).then(res => {
          setAppWithScroll(res.data);
        });
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

  if (loading) return <div style={{ color: '#fff', padding: '100px', textAlign: 'center' }}>Loading Messenger...</div>;

  const filteredChats = chats.filter(chat => {
    const name = user?.role === 'employer' 
      ? `${chat.candidate?.firstName} ${chat.candidate?.lastName}`
      : chat.job?.companyName;
    return name?.toLowerCase().includes(searchQuery.toLowerCase()) || chat.job?.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="msg-page-wrapper" style={{ 
      width: '100vw', 
      position: 'relative', 
      left: '50%',
      right: '50%',
      marginLeft: '-50vw',
      marginRight: '-50vw',
      minHeight: 'calc(100vh - 70px)', 
      background: '#050505', 
      overflow: 'hidden', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      
      {/* === ДЕКОРАТИВНЫЙ ФОН === */}
      <div style={{ position: 'absolute', top: '10%', left: '15%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* === ЦЕНТРАЛЬНЫЙ КОНТЕЙНЕР ЧАТА === */}
      <div className={`msg-messenger-container ${id ? 'chat-active' : 'list-active'}`} style={{ 
        width: '100%', 
        maxWidth: '1200px', 
        height: 'calc(100vh - 120px)', 
        background: 'rgba(15, 15, 15, 0.6)', 
        backdropFilter: 'blur(20px)', 
        border: '1px solid rgba(255,255,255,0.05)', 
        borderRadius: '32px', 
        display: 'flex', 
        overflow: 'hidden', 
        boxShadow: '0 30px 60px rgba(0,0,0,0.4)', 
        zIndex: 1 
      }}>
        
        {/* === ЛЕВАЯ ПАНЕЛЬ (СПИСОК ЧАТОВ) === */}
        <div className="msg-sidebar-panel" style={{ width: '380px', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', background: 'rgba(0, 0, 0, 0.2)', flexShrink: 0 }}>
          <div style={{ padding: '30px 25px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Messages</h2>
            
            <div style={{ position: 'relative' }}>
              <input 
                placeholder="Search conversations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 15px 12px 40px', color: '#fff', borderRadius: '14px', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }} 
                onFocus={e => e.target.style.borderColor = 'rgba(16, 185, 129, 0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#666', display: 'flex' }}><Icons.Search /></span>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredChats.map((chat) => {
              const isActive = id === chat.id;
              const isEmployer = user?.role === 'employer';
              
              const partnerName = isEmployer 
                ? `${chat.candidate?.firstName || ''} ${chat.candidate?.lastName || ''}`.trim() || chat.candidate?.email
                : chat.job?.companyName;
              
              const partnerAvatar = isEmployer ? chat.candidate?.avatarUrl : chat.job?.companyLogo;
              const isUserOnline = checkIsOnline(isEmployer ? chat.candidate?.lastActive : chat.job?.owner?.lastActive);

              const lastMsgTime = chat.messages?.[0]?.createdAt || chat.createdAt;
              const lastViewed = isEmployer ? chat.lastViewedByOwner : chat.lastViewedByCandidate;
              const hasUnread = lastMsgTime > lastViewed || (!isEmployer && chat.status === 'invited' && lastMsgTime > lastViewed);

              return (
                <div key={chat.id} onClick={() => navigate(`/messages/${chat.id}`)} style={{ padding: '20px 25px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.02)', background: isActive ? 'rgba(16, 185, 129, 0.08)' : 'transparent', display: 'flex', gap: '15px', alignItems: 'center', transition: 'all 0.2s', position: 'relative' }}>
                  
                  {isActive && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#10b981', borderTopRightRadius: '4px', borderBottomRightRadius: '4px' }} />}

                  <div style={{ position: 'relative' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: isEmployer ? '50%' : '14px', background: isActive ? '#10b981' : '#1a1a1a', border: isActive ? 'none' : '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', overflow: 'hidden', color: isActive ? '#000' : '#888', fontSize: '20px' }}>
                      {partnerAvatar ? <img src={partnerAvatar?.startsWith('http') ? partnerAvatar : `${apiUrl}${partnerAvatar}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>{partnerName?.charAt(0).toUpperCase()}</span>}
                    </div>
                    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, background: isUserOnline ? '#10b981' : '#444', borderRadius: '50%', border: `3px solid ${isActive ? 'rgba(19, 133, 98, 0.2)' : '#0f0f0f'}`, transition: 'all 0.2s' }} />
                  </div>

                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ fontWeight: '700', color: isActive ? '#fff' : '#ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '15px' }}>{partnerName}</div>
                      {hasUnread && !isActive && <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px rgba(16,185,129,0.5)' }} />}
                    </div>
                    <div style={{ fontSize: '13px', color: isActive ? '#10b981' : '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: isActive ? 600 : 400 }}>{chat.job.title}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* === ПРАВАЯ ПАНЕЛЬ (ОКНО ЧАТА) === */}
        <div className="msg-chat-window" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'transparent', minWidth: 0 }}>
          {currentApp ? (
            <>
              {/* ШАПКА ЧАТА */}
              <div className="msg-chat-header" style={{ padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0, 0, 0, 0.1)', flexShrink: 0, gap: '10px' }}>
                 
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                   {/* Мобильная кнопка Назад */}
                   <button className="msg-back-to-list-btn" onClick={() => navigate('/messages')} style={{ display: 'none', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: '4px', marginRight: '4px' }}>
                     <Icons.ChevronLeft />
                   </button>

                   <Link to={user?.role === 'employer' ? `/candidate/${currentApp.candidate.id}` : `/employer/company/${currentApp.job.ownerId}`} style={{ display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none', padding: '5px 10px 5px 0', borderRadius: '12px', transition: 'background 0.2s', minWidth: 0 }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                     <div style={{ width: '48px', height: '48px', borderRadius: user?.role === 'employer' ? '50%' : '12px', background: '#222', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '18px', flexShrink: 0 }}>
                       {user?.role === 'employer' ? (
                         currentApp.candidate?.avatarUrl ? <img src={currentApp.candidate.avatarUrl?.startsWith('http') ? currentApp.candidate.avatarUrl : `${apiUrl}${currentApp.candidate.avatarUrl}`} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <span style={{fontWeight:'bold'}}>{currentApp.candidate?.email[0].toUpperCase()}</span>
                       ) : (
                         currentApp.job?.companyLogo ? <img src={currentApp.job.companyLogo?.startsWith('http') ? currentApp.job.companyLogo : `${apiUrl}${currentApp.job.companyLogo}`} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <span style={{fontWeight:'bold'}}>{currentApp.job?.companyName[0].toUpperCase()}</span>
                       )}
                     </div>
                     <div style={{ minWidth: 0 }}>
                       <div style={{fontWeight: '800', fontSize: '17px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                         {user?.role === 'employer' ? `${currentApp.candidate?.firstName || ''} ${currentApp.candidate?.lastName || ''}`.trim() || currentApp.candidate?.email : currentApp.job.companyName}
                         <span style={{ color: '#666', display: 'flex', flexShrink: 0 }}><Icons.Info /></span>
                       </div>
                       {(() => {
                         const isOnline = checkIsOnline(user?.role === 'employer' ? currentApp.candidate?.lastActive : currentApp.job?.owner?.lastActive);
                         return (
                           <div style={{ fontSize: '12px', color: isOnline ? '#10b981' : '#666', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', fontWeight: 500 }}>
                             <span style={{ width: 6, height: 6, background: isOnline ? '#10b981' : '#444', borderRadius: '50%', boxShadow: isOnline ? '0 0 8px rgba(16,185,129,0.5)' : 'none' }} /> 
                             {isOnline ? "Online" : "Offline"}
                           </div>
                         );
                       })()}
                     </div>
                   </Link>
                 </div>

                 <div className="msg-chat-header-job-badge" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', color: '#888', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                   Role: <span style={{ color: '#fff' }}>{currentApp.job.title}</span>
                 </div>
              </div>

              {/* ИСТОРИЯ СООБЩЕНИЙ */}
              <div ref={scrollContainerRef} className="premium-scroll" style={{ flex: 1, overflowY: 'auto', padding: '25px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ alignSelf: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '20px', fontSize: '11px', color: '#666', marginBottom: '20px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>
                  Application started {new Date(currentApp.createdAt).toLocaleDateString()}
                </div>

                {currentApp.messages.map((m: any, index: number) => {
                  const isMine = m.senderId === user?.id;
                  const prevMsg = index > 0 ? currentApp.messages[index - 1] : null;
                  const nextMsg = index < currentApp.messages.length - 1 ? currentApp.messages[index + 1] : null;
                  const isFirstInGroup = !prevMsg || prevMsg.senderId !== m.senderId;
                  const isLastInGroup = !nextMsg || nextMsg.senderId !== m.senderId;
                  const currentDate = new Date(m.createdAt).toLocaleDateString();
                  const prevDate = prevMsg ? new Date(prevMsg.createdAt).toLocaleDateString() : null;
                  const showDateLabel = currentDate !== prevDate;

                  let msgAvatar = null;
                  let msgInitial = "?";
                  if (isMine) { msgAvatar = user?.avatarUrl; msgInitial = user?.username?.[0]?.toUpperCase() || "U"; } 
                  else { msgAvatar = user?.role === 'employer' ? currentApp.candidate?.avatarUrl : currentApp.job?.companyLogo; msgInitial = user?.role === 'employer' ? currentApp.candidate?.email[0].toUpperCase() : currentApp.job?.companyName[0].toUpperCase(); }

                  return (
                    <div key={m.id} style={{ display: 'flex', flexDirection: 'column' }}>
                      {showDateLabel && <div style={{ alignSelf: 'center', margin: '15px 0', fontSize: '11px', fontWeight: '800', color: '#555', background: 'rgba(0,0,0,0.5)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>{new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>}
                      <div style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '85%', display: 'flex', alignItems: 'flex-end', gap: '8px', marginTop: isFirstInGroup ? '8px' : '0' }}>
                        
                        {!isMine && (
                          <div style={{ width: '32px', height: '32px', borderRadius: user?.role === 'employer' ? '50%' : '10px', background: '#222', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isLastInGroup ? 1 : 0, border: '1px solid rgba(255,255,255,0.05)', color: '#888' }}>
                            {msgAvatar ? <img src={msgAvatar?.startsWith('http') ? msgAvatar : `${apiUrl}${msgAvatar}`} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <span style={{fontSize:'12px', fontWeight:'bold'}}>{msgInitial}</span>}
                          </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                          <div style={{ 
                            background: isMine ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.05)', 
                            color: isMine ? '#000' : '#fff', 
                            border: isMine ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            padding: '12px 16px', 
                            borderRadius: '16px', 
                            borderTopLeftRadius: !isMine && !isFirstInGroup ? '4px' : '16px', 
                            borderBottomLeftRadius: !isMine && !isLastInGroup ? '4px' : (isMine ? '16px' : '4px'), 
                            borderTopRightRadius: isMine && !isFirstInGroup ? '4px' : '16px', 
                            borderBottomRightRadius: isMine && !isLastInGroup ? '4px' : (isMine ? '4px' : '16px'), 
                            fontSize: '14px', fontWeight: isMine ? '600' : '400', wordBreak: 'break-word', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere',
                            boxShadow: isMine ? '0 5px 15px rgba(16, 185, 129, 0.2)' : 'none'
                          }}>
                            {m.text}
                          </div>
                          {isLastInGroup && <div style={{ fontSize: '10px', color: '#555', marginTop: '4px', fontWeight: 600 }}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ПОЛЕ ВВОДА СООБЩЕНИЯ */}
              <div style={{ padding: '15px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0, 0, 0, 0.1)' }}>
                <div style={{ display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', alignItems: 'flex-end', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)' }}>
                  <textarea 
                    value={msg} 
                    onChange={(e) => setMsg(e.target.value)} 
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } }} 
                    placeholder="Type a message..." 
                    style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none', padding: '8px', resize: 'none', minHeight: '24px', maxHeight: '120px', fontFamily: 'inherit', fontSize: '15px', lineHeight: '1.4' }} 
                  />
                  <button 
                    onClick={sendMsg} 
                    disabled={!msg.trim()}
                    style={{ background: msg.trim() ? '#10b981' : '#222', color: msg.trim() ? '#000' : '#555', border: 'none', width: '40px', height: '40px', borderRadius: '14px', cursor: msg.trim() ? 'pointer' : 'not-allowed', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: msg.trim() ? '0 5px 15px rgba(16, 185, 129, 0.3)' : 'none' }}
                  >
                    <Icons.Send />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>
              <div style={{ textAlign: 'center', padding: '0 20px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: '#555' }}>
                  <Icons.Search />
                </div>
                <h3 style={{ color: '#666', margin: '0 0 10px', fontSize: '18px' }}>Your Messages</h3>
                <p style={{ margin: 0, color: '#444', fontSize: '14px' }}>Select a conversation from the left to start chatting</p>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}