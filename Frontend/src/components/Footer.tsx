import { Link } from "react-router-dom";

// Иконки для соцсетей (SaaS стиль)
const SocialIcons = {
  Twitter: () => <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  GitHub: () => <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.603-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>,
  LinkedIn: () => <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
};

export default function Footer() {
  return (
    <footer style={{ 
      background: '#030303', 
      borderTop: '1px solid rgba(255,255,255,0.03)',
      padding: '80px 0 40px',
      color: '#fff',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 30px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '50px' }}>
          
          {/* Логотип и оригинальное описание */}
          <div style={{ maxWidth: '320px' }}>
            <Link to="/" style={{ fontSize: '28px', fontWeight: 900, color: '#fff', textDecoration: 'none', letterSpacing: '-1px', display: 'inline-block', marginBottom: '15px' }}>
              Job<span style={{ color: '#10b981' }}>Board</span>
            </Link>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', margin: '0 0 25px', fontWeight: 500 }}>
              The #1 modern platform for tech talent. We connect elite developers with world-class engineering teams.
            </p>
            
            {/* Соцсети */}
            <div style={{ display: 'flex', gap: '15px' }}>
              {['Twitter', 'GitHub', 'LinkedIn'].map((network) => {
                const Icon = SocialIcons[network as keyof typeof SocialIcons];
                return (
                  <a key={network} href="#" style={{ color: '#444', transition: 'all 0.2s', display: 'flex' }} className="footer-social-link">
                    <Icon />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Оригинальная навигация на тех же местах */}
          <div style={{ display: 'flex', gap: '80px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <b style={{ color: '#fff', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Platform</b>
              <Link to="/jobs" className="footer-link">Browse Jobs</Link>
              <Link to="/applications" className="footer-link">My Applications</Link>
              <Link to="/saved" className="footer-link">Saved Jobs</Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <b style={{ color: '#fff', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Company</b>
              <Link to="/about" className="footer-link">About Us</Link>
              <Link to="/contact" className="footer-link">Contact Support</Link>
              <Link to="/blog" className="footer-link">Blog & News</Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <b style={{ color: '#fff', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Legal</b>
              <Link to="/privacy" className="footer-link">Privacy Policy</Link>
              <Link to="/terms" className="footer-link">Terms of Service</Link>
              <Link to="/cookies" className="footer-link">Cookie Settings</Link>
            </div>
          </div>
        </div>

        {/* Нижняя часть (Копирайт и оригинальный статус) */}
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px',
          marginTop: '80px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.04)' 
        }}>
          <div style={{ color: '#444', fontSize: '13px', fontWeight: 500 }}>
            © {new Date().getFullYear()} JobBoard Inc. All rights reserved.
          </div>
          
          {/* Оригинальный статус серверов со скриншота */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.03)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.08)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
            <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 700, letterSpacing: '0.3px' }}>All systems operational</span>
          </div>
        </div>

      </div>

      <style>{`
        .footer-link {
          color: #666;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .footer-link:hover {
          color: #10b981;
        }
        .footer-social-link:hover {
          color: #fff;
          transform: translateY(-2px);
        }
      `}</style>
    </footer>
  );
}