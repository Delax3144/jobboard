// src/components/TopNav.tsx
import { NavLink, Link } from "react-router-dom";
import { useTopNav } from "../hooks/useTopNav";
import { type UserMode } from "../lib/userMode";

const Icons = {
  Menu: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>,
  Close: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>,
  LogOut: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
};

export default function TopNav({ setMode }: { mode: UserMode; setMode: (m: UserMode) => void }) {
  const { user, logout, unreadCount, isMobileMenuOpen, setIsMobileMenuOpen, apiUrl } = useTopNav(setMode);

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
        
        .premium-badge { 
          background: #10b981; color: #000; font-size: 11px; font-weight: 900; padding: 2px 6px; borderRadius: 8px; margin-left: 8px; 
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.5); display: inline-flex; alignItems: center; justify-content: center; min-width: 20px;
          animation: badgePop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes badgePop { 0% { transform: scale(0); } 100% { transform: scale(1); } }
        
        .animate-enter { animation: toastEnter 0.4s cubic-bezier(0.21, 1.02, 0.73, 1) forwards; }
        .animate-leave { animation: toastLeave 0.4s forwards; }
        @keyframes toastEnter { from { opacity: 0; transform: translateY(50px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes toastLeave { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9) translateY(20px); } }

        .mobile-menu-btn { display: none; background: transparent; border: none; color: #fff; cursor: pointer; padding: 8px; }
        @media (max-width: 950px) { .center-nav-island { display: none; } .desktop-actions { display: none !important; } .mobile-menu-btn { display: block; } }
        
        .mobile-dropdown { position: fixed; top: 80px; left: 0; width: 100vw; height: calc(100vh - 80px); background: rgba(5, 5, 5, 0.95); backdrop-filter: blur(20px); z-index: 999; display: flex; flex-direction: column; padding: 30px 25px; gap: 15px; transform: translateY(-100%); opacity: 0; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); pointer-events: none; }
        .mobile-dropdown.open { transform: translateY(0); opacity: 1; pointer-events: all; }
        .mobile-link { font-size: 20px; font-weight: 800; color: #888; text-decoration: none; transition: color 0.2s; display: flex; align-items: center; padding: 10px 0; border-radius: 12px; }
        .mobile-link:hover, .mobile-link.active { color: #fff; }
      `}</style>

      <header className="premium-header">
        <div className="premium-header-inner">
          <Link to="/" style={{ textDecoration: 'none', color: '#fff', fontWeight: 900, fontSize: '24px', letterSpacing: '-0.5px' }}>
            Job<span style={{ color: '#10b981' }}>Board</span>
          </Link>

          <nav className="center-nav-island">
            <NavLink to="/jobs" className={navLinkClass}>Explore Jobs</NavLink>
            {user?.role === 'candidate' && (
              <>
                <NavLink to="/applications" className={navLinkClass}>My Applications {unreadCount > 0 && <span className="premium-badge">{unreadCount}</span>}</NavLink>
                <NavLink to="/saved" className={navLinkClass}>Saved Jobs</NavLink>
              </>
            )}
            {user?.role === 'employer' && (
              <NavLink to="/employer" className={navLinkClass}>Employer Console {unreadCount > 0 && <span className="premium-badge">{unreadCount}</span>}</NavLink>
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
            <NavLink to="/applications" className={({isActive}) => `mobile-link ${isActive ? 'active' : ''}`}>My Applications {unreadCount > 0 && <span className="premium-badge" style={{ marginLeft: '12px' }}>{unreadCount}</span>}</NavLink>
            <NavLink to="/saved" className={({isActive}) => `mobile-link ${isActive ? 'active' : ''}`}>Saved Jobs</NavLink>
          </>
        )}
        {user?.role === 'employer' && (
          <NavLink to="/employer" className={({isActive}) => `mobile-link ${isActive ? 'active' : ''}`}>Employer Console {unreadCount > 0 && <span className="premium-badge" style={{ marginLeft: '12px' }}>{unreadCount}</span>}</NavLink>
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