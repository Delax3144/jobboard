import { Link } from "react-router-dom";

export default function Blog() {
  return (
    <div style={{ background: '#050505', minHeight: '70vh', position: 'relative', overflow: 'hidden', padding: '0 20px 80px' }}>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.08), transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '760px', margin: '0 auto', position: 'relative' }}>
        <header className="blog-hero" style={{ textAlign: 'center', padding: '100px 0 60px' }}>
          <h1 style={{ fontSize: 'clamp(36px, 8vw, 64px)', fontWeight: 900, margin: '0 0 20px', letterSpacing: '-1px', color: '#fff', lineHeight: 1.15 }}>
            Blog <span style={{ color: '#10b981' }}>&amp; News</span>
          </h1>
          <p style={{ fontSize: '18px', color: '#aaa', margin: 0, lineHeight: 1.6 }}>Updates from JobBoard.</p>
        </header>

        <section aria-labelledby="blog-empty-heading" style={{ background: 'rgba(15, 15, 15, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '28px', padding: 'clamp(24px, 5vw, 48px)', textAlign: 'center' }}>
          <svg aria-hidden="true" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 3h12l4 4v14H4V3Z M16 3v5h4 M8 12h8 M8 16h6" />
          </svg>
          <h2 id="blog-empty-heading" style={{ color: '#fff', fontSize: '26px', margin: '20px 0 12px' }}>No articles published yet</h2>
          <p style={{ color: '#aaa', fontSize: '16px', lineHeight: 1.7, margin: '0 0 28px' }}>You can explore current vacancies or get in touch with us using the links below.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
            <Link to="/jobs" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', padding: '14px 24px', borderRadius: '14px', fontWeight: 800, textDecoration: 'none' }}>Browse jobs</Link>
            <Link to="/contact" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '14px 24px', borderRadius: '14px', fontWeight: 700, textDecoration: 'none' }}>Contact us</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
