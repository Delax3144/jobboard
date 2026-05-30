import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import toast from 'react-hot-toast'; // <-- Импорт для пушей
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { type UserMode } from "../lib/userMode";
import { io } from "socket.io-client";

const Icons = {
  Menu: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>,
  Close: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>,
  LogOut: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>,
  Message: () => <svg width="20" height="20" fill="none" stroke="#10b981" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>,
  Briefcase: () => <svg width="20" height="20" fill="none" stroke="#3b82f6" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
};

// Инициализируем плеер ОДИН раз за пределами компонента, чтобы обходить блокировки браузеров
// Заменили ссылку на приятный, мягкий и футуристичный UI-клик вместо старого едкого звука
const notificationAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2357/2357-preview.mp3');

const playNotificationSound = (volumePercentage: number = 50) => {
  try {
    // Переводим громкость из базы данных (0-100) в системный формат HTML5 Audio (0.0-1.0)
    notificationAudio.volume = volumePercentage / 100;
    
    // Сбрасываем проигрывание на начало. Это ключевой момент! 
    // Теперь звук будет играть при каждом уведомлении, даже если прошлый еще не доиграл.
    notificationAudio.currentTime = 0;
    
    notificationAudio.play().catch(e => console.log("Audio autoplay blocked by browser", e));
  } catch (err) {
    console.error("Audio playback error:", err);
  }
};

export default function TopNav({ setMode }: { mode: UserMode; setMode: (m: UserMode) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  
  const [hasInvite, setHasInvite] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Реф, чтобы не спамить звуком на одно и то же сообщение
  const notifiedEventsRef = useRef<Set<string>>(new Set());
  
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Реф для хранения подключения к сокету
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (user) {
      setMode(user.role === 'employer' ? 'employer' : 'candidate');

      // 1. Делаем только ОДИН запрос при загрузке страницы, чтобы зажечь точку, если есть старые непрочитанные
      const checkUpdates = async () => {
        try {
          const endpoint = user.role === 'employer' ? '/applications/owner' : '/applications/my';
          const res = await api.get(endpoint);
          let hasUnread = false;

          res.data.forEach((app: any) => {
            const isEmployer = user.role === 'employer';
            const lastUpdate = app.messages?.[0]?.createdAt || app.createdAt;
            const lastViewed = isEmployer ? app.lastViewedByOwner : app.lastViewedByCandidate;
            
            if (lastUpdate > lastViewed || (!isEmployer && app.status === 'invited' && lastUpdate > lastViewed)) {
              hasUnread = true;
            }
          });
          setHasInvite(hasUnread);
        } catch (err) {
          console.error("Error checking updates", err);
        }
      };

      checkUpdates(); // Вызываем один раз!

      // 2. === МАГИЯ WEBSOCKETS ===
      socketRef.current = io(apiUrl, { 
        withCredentials: true 
      });

      // Сообщаем серверу свой ID, чтобы он знал, куда слать уведомления
      socketRef.current.emit("join", user.id);

      // Ловим летящие события 'new_notification' от бэкенда
      socketRef.current.on("new_notification", (data: any) => {
        
        // Если юзер прямо сейчас открыл этот чат - не спамим тостами
        if (data.applicationId && location.pathname === `/messages/${data.applicationId}`) return;

        // Моментально зажигаем зеленую точку у кнопки!
        setHasInvite(true);

        // 3. Воспроизводим звук (с нужной громкостью из базы)
        if ((user as any).soundEnabled !== false) {
          playNotificationSound((user as any).notificationVolume ?? 50);
        }

        // 4. Показываем красивый тост-пуш
        if ((user as any).toastsEnabled !== false) {
          const isMessage = data.type === 'new_message';

          let title = "Notification";
          let desc = "You have a new update";

          if (data.type === "new_application") {
            title = "New Application";
            desc = data.message;
          } else if (data.type === "status_update") {
            title = "Status Update";
            desc = `Action required for ${data.jobTitle}`;
          } else if (data.type === "new_message") {
            title = "New Message";
            desc = "You received a new message";
          }

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
                {isMessage ? <Icons.Message /> : <Icons.Briefcase />}
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

      // При закрытии страницы - отключаемся от сокета
      return () => {
        if (socketRef.current) socketRef.current.disconnect();
      };
    }
  }, [user, setMode, location.pathname, navigate]);

  useEffect(() => {
    if (!isLoading && user && user.role === "candidate" && location.pathname.startsWith("/employer")) {
      navigate("/", { replace: true });
    }
  }, [user, isLoading, location.pathname, navigate]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `top-nav-link ${isActive ? 'active' : ''}`;

  return (
    <>
      <style>{`
        .premium-header {
          position: sticky; top: 0; z-index: 1000; background: rgba(5, 5, 5, 0.7); backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px); border-bottom: 1px solid rgba(255, 255, 255, 0.05); height: 80px; display: flex; align-items: center; transition: all 0.3s ease;
        }
        .premium-header-inner { width: 100%; max-width: 1100px; margin: 0 auto; padding: 0 20px; display: flex; align-items: center; justify-content: space-between; }
        .center-nav-island { display: flex; align-items: center; gap: 5px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05); padding: 6px; border-radius: 24px; }
        .top-nav-link { text-decoration: none; color: #888; font-weight: 600; font-size: 14px; padding: 10px 18px; border-radius: 16px; transition: all 0.2s ease; display: flex; align-items: center; position: relative; }
        .top-nav-link:hover { color: #fff; background: rgba(255, 255, 255, 0.05); }
        .top-nav-link.active { color: #fff; background: rgba(255, 255, 255, 0.08); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .glowing-dot { width: 6px; height: 6px; background-color: #10b981; border-radius: 50%; margin-left: 8px; box-shadow: 0 0 10px #10b981; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
        
        /* Анимации для Тостов */
        .animate-enter { animation: toastEnter 0.4s cubic-bezier(0.21, 1.02, 0.73, 1) forwards; }
        .animate-leave { animation: toastLeave 0.4s forwards; }
        @keyframes toastEnter { from { opacity: 0; transform: translateY(50px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes toastLeave { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9) translateY(20px); } }

        .mobile-menu-btn { display: none; background: transparent; border: none; color: #fff; cursor: pointer; padding: 8px; }
        @media (max-width: 950px) { .center-nav-island { display: none; } .desktop-actions { display: none !important; } .mobile-menu-btn { display: block; } }
        
        /* Улучшенное Мобильное Меню */
        .mobile-dropdown { position: fixed; top: 80px; left: 0; width: 100vw; height: calc(100vh - 80px); background: rgba(5, 5, 5, 0.95); backdrop-filter: blur(20px); z-index: 999; display: flex; flex-direction: column; padding: 30px 25px; gap: 15px; transform: translateY(-100%); opacity: 0; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); pointer-events: none; }
        .mobile-dropdown.open { transform: translateY(0); opacity: 1; pointer-events: all; }
        .mobile-link { font-size: 20px; font-weight: 800; color: #888; text-decoration: none; transition: color 0.2s; display: flex; align-items: center; padding: 10px 0; border-radius: 12px; }
        .mobile-link:hover, .mobile-link.active { color: #fff; }
      `}</style>

      <header className="premium-header">
        <div className="premium-header-inner">
          <Link to="/" style={{ textDecoration: 'none', color: '#fff', fontWeight: 900, fontSize: '24px', letterSpacing: '-0.5px' }}>Job<span style={{ color: '#10b981' }}>Board</span></Link>

          <nav className="center-nav-island">
            <NavLink to="/jobs" className={navLinkClass}>Explore Jobs</NavLink>
            {user?.role === 'candidate' && (
              <>
                <NavLink to="/applications" className={navLinkClass}>My Applications {hasInvite && <span className="glowing-dot" />}</NavLink>
                <NavLink to="/saved" className={navLinkClass}>Saved Jobs</NavLink>
              </>
            )}
            {user?.role === 'employer' && (
              <NavLink to="/employer" className={navLinkClass}>Employer Console {hasInvite && <span className="glowing-dot" />}</NavLink>
            )}
            <NavLink to="/contact" className={navLinkClass}>Support</NavLink>
          </nav>

          <div className="desktop-actions" style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link to="/profile" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", cursor: "pointer", padding: "6px 16px 6px 6px", borderRadius: "24px", background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', transition: "all 0.2s" }} onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #10b981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#000", overflow: "hidden", fontSize: '14px' }}>
                    {user.avatarUrl ? <img src={user.avatarUrl?.startsWith('http') ? user.avatarUrl : `${apiUrl}${user.avatarUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.email[0].toUpperCase()}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ color: "#fff", fontWeight: "700", fontSize: '13px', lineHeight: '1.2' }}>{user.username || user.firstName || 'User'}</span>
                    <span style={{ color: "#10b981", fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>{user.role}</span>
                  </div>
                </Link>
                <button onClick={logout} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', transition: 'all 0.2s' }} title="Logout" onMouseOver={e => e.currentTarget.style.color = '#ff4b4b'} onMouseOut={e => e.currentTarget.style.color = '#666'}><Icons.LogOut /></button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <NavLink to="/login" style={{ color: '#aaa', textDecoration: 'none', fontWeight: 700, fontSize: '14px', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#aaa'}>Log in</NavLink>
                <NavLink to="/register" style={{ background: '#fff', color: '#000', padding: '10px 20px', borderRadius: '14px', textDecoration: 'none', fontWeight: 800, fontSize: '14px', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>Sign Up</NavLink>
              </div>
            )}
          </div>

          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}</button>
        </div>
      </header>

      {/* МОБИЛЬНОЕ МЕНЮ */}
      <div className={`mobile-dropdown ${isMobileMenuOpen ? 'open' : ''}`}>
        <NavLink to="/jobs" className={({isActive}) => `mobile-link ${isActive ? 'active' : ''}`}>Explore Jobs</NavLink>
        {user?.role === 'candidate' && (
          <>
            <NavLink to="/applications" className={({isActive}) => `mobile-link ${isActive ? 'active' : ''}`}>My Applications {hasInvite && <span className="glowing-dot" style={{ marginLeft: '12px' }} />}</NavLink>
            <NavLink to="/saved" className={({isActive}) => `mobile-link ${isActive ? 'active' : ''}`}>Saved Jobs</NavLink>
          </>
        )}
        {user?.role === 'employer' && (
          <NavLink to="/employer" className={({isActive}) => `mobile-link ${isActive ? 'active' : ''}`}>Employer Console {hasInvite && <span className="glowing-dot" style={{ marginLeft: '12px' }} />}</NavLink>
        )}
        <NavLink to="/contact" className={({isActive}) => `mobile-link ${isActive ? 'active' : ''}`}>Support</NavLink>
        
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '15px 0' }} />
        
        {user ? (
          <>
            <NavLink to="/profile" className={({isActive}) => `mobile-link ${isActive ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #10b981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#000", overflow: "hidden" }}>{user.avatarUrl ? <img src={user.avatarUrl?.startsWith('http') ? user.avatarUrl : `${apiUrl}${user.avatarUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.email[0].toUpperCase()}</div>
              My Profile
            </NavLink>
            <button onClick={logout} style={{ background: 'transparent', border: 'none', color: '#ff4b4b', fontSize: '20px', fontWeight: 800, textAlign: 'left', padding: '10px 0', cursor: 'pointer' }}>Logout</button>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
            <NavLink to="/register" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', padding: '16px', borderRadius: '16px', textDecoration: 'none', fontWeight: 800, fontSize: '16px', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)' }}>Sign Up Free</NavLink>
            <NavLink to="/login" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '16px', borderRadius: '16px', textDecoration: 'none', fontWeight: 700, fontSize: '16px', textAlign: 'center' }}>Log In</NavLink>
          </div>
        )}
      </div>
    </>
  );
}