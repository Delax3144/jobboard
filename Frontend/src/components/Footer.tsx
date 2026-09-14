import { Link } from "react-router-dom";


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
              Find tech vacancies, track applications, and keep conversations with employers in one place.
            </p>
            
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
              <Link to="/cookies" className="footer-link">Cookie Policy</Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px',
          marginTop: '80px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.04)' 
        }}>
          <div style={{ color: '#444', fontSize: '13px', fontWeight: 500 }}>
            © {new Date().getFullYear()} JobBoard. All rights reserved.
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
      `}</style>
    </footer>
  );
}
