import styles from "./TopNav.module.css";
import { NavLink, Link } from "react-router-dom";
import { useTopNav } from "../hooks/useTopNav";
import { type UserMode } from "../lib/userMode";
import { useTranslation } from "react-i18next";

const Icons = {
  Menu: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path></svg>,
  Close: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>,
  LogOut: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>,
};

export default function TopNav({ setMode }: { mode: UserMode; setMode: (m: UserMode) => void }) {
  const { user, logout, unreadCount, isMobileMenuOpen, setIsMobileMenuOpen, apiUrl } = useTopNav(setMode);

  const { t } = useTranslation();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.navLink} ${isActive ? styles.active : ""}`;

  return (
    <>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.logo}>
            Job<span className={styles.accent}>Board</span>
          </Link>

          <nav className={styles.navigation}>
            <NavLink to="/jobs" className={navLinkClass}>{t('nav.explore_jobs', 'Explore Jobs')}</NavLink>
            {user?.role === 'candidate' && (
              <>
                <NavLink to="/applications" className={navLinkClass}>{t('nav.my_applications', 'My Applications')} {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}</NavLink>
                <NavLink to="/saved" className={navLinkClass}>{t('nav.saved_jobs', 'Saved Jobs')}</NavLink>
              </>
            )}
            {user?.role === 'employer' && (
              <NavLink to="/employer" className={navLinkClass}>{t('nav.employer_console', 'Employer Console')} {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}</NavLink>
            )}
            <NavLink to="/contact" className={navLinkClass}>{t('nav.support', 'Support')}</NavLink>
          </nav>

          <div className={styles.desktopActions}>

            {user ? (
              <div className={styles.account}>
                <Link to="/profile" className={styles.profileLink} >
                  <div className={styles.avatar}>
                    {user.avatarUrl ? <img src={user.avatarUrl?.startsWith('http') ? user.avatarUrl : `${apiUrl}${user.avatarUrl}`} className={styles.avatarImage} /> : user.email[0].toUpperCase()}
                  </div>
                  <div className={styles.userInfo}>
                    <span className={styles.username}>{user.username || user.firstName || 'User'}</span>
                    <span className={styles.role}>{user.role}</span>
                  </div>
                </Link>
                <button onClick={logout} className={styles.logout} title={t('nav.logout', 'Logout')} ><Icons.LogOut /></button>
              </div>
            ) : (
              <div className={styles.guestActions}>
                <NavLink to="/login" className={styles.login} >{t('nav.login', 'Log in')}</NavLink>
                <NavLink to="/register" className={styles.register} >{t('nav.sign_up', 'Sign Up')}</NavLink>
              </div>
            )}
          </div>

          <button aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={isMobileMenuOpen} aria-controls="mobile-navigation" className={styles.menuButton} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}</button>
        </div>
      </header>

      <div id="mobile-navigation" inert={!isMobileMenuOpen} className={`${styles.dropdown} ${isMobileMenuOpen ? styles.open : ""}`}>
        <NavLink to="/jobs" onClick={() => setIsMobileMenuOpen(false)} className={({isActive}) => `${styles.mobileLink} ${isActive ? styles.active : ""}`}>{t('nav.explore_jobs', 'Explore Jobs')}</NavLink>
        {user?.role === 'candidate' && (
          <>
            <NavLink to="/applications" onClick={() => setIsMobileMenuOpen(false)} className={({isActive}) => `${styles.mobileLink} ${isActive ? styles.active : ""}`}>{t('nav.my_applications', 'My Applications')} {unreadCount > 0 && <span className={`${styles.badge} ${styles.mobileBadge}`}>{unreadCount}</span>}</NavLink>
            <NavLink to="/saved" onClick={() => setIsMobileMenuOpen(false)} className={({isActive}) => `${styles.mobileLink} ${isActive ? styles.active : ""}`}>{t('nav.saved_jobs', 'Saved Jobs')}</NavLink>
          </>
        )}
        {user?.role === 'employer' && (
          <NavLink to="/employer" onClick={() => setIsMobileMenuOpen(false)} className={({isActive}) => `${styles.mobileLink} ${isActive ? styles.active : ""}`}>{t('nav.employer_console', 'Employer Console')} {unreadCount > 0 && <span className={`${styles.badge} ${styles.mobileBadge}`}>{unreadCount}</span>}</NavLink>
        )}
        <NavLink to="/contact" onClick={() => setIsMobileMenuOpen(false)} className={({isActive}) => `${styles.mobileLink} ${isActive ? styles.active : ""}`}>{t('nav.support', 'Support')}</NavLink>

        <div className={styles.divider} />

        {user ? (
          <>
            <NavLink to="/profile" onClick={() => setIsMobileMenuOpen(false)} className={({isActive}) => `${styles.mobileLink} ${styles.mobileProfile} ${isActive ? styles.active : ""}`}>
              <div className={styles.mobileAvatar}>{user.avatarUrl ? <img src={user.avatarUrl?.startsWith('http') ? user.avatarUrl : `${apiUrl}${user.avatarUrl}`} className={styles.avatarImage} /> : user.email[0].toUpperCase()}</div>
              {t('nav.my_profile', 'My Profile')}
            </NavLink>
            <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className={styles.mobileLogout}>{t('nav.logout', 'Logout')}</button>
          </>
        ) : (
          <div className={styles.mobileGuest}>
            <NavLink to="/register" onClick={() => setIsMobileMenuOpen(false)} className={styles.mobileRegister}>{t('nav.sign_up_free', 'Sign Up Free')}</NavLink>
            <NavLink to="/login" onClick={() => setIsMobileMenuOpen(false)} className={styles.mobileLogin}>{t('nav.login', 'Log In')}</NavLink>
          </div>
        )}
      </div>
    </>
  );
}
