import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// --- Professional SVG Icons ---
const Icons = {
  Check: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  Message: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  Lightning: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Globe: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
  Shield: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
};

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={{ background: '#000', color: '#fff', overflowX: 'hidden' }}>
      
      {/* --- SECTION 1: HERO --- */}
      {/* ID для точечной настройки сетки в index.css */}
      <section id="home-hero-grid" style={{ position: 'relative', padding: '120px 0 80px 0' }}>
        
        {/* Glow Effects */}
        <div style={{ position: 'absolute', top: '-10%', left: '20%', transform: 'translateX(-50%)', width: '800px', height: '600px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 60%)', zIndex: 0, pointerEvents: 'none', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', top: '20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 60%)', zIndex: 0, pointerEvents: 'none', filter: 'blur(50px)' }} />

        {/* Сетка переключается в 1 колонку на мобилке через m-grid-1 */}
        <div className="container m-grid-1" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '60px', alignItems: 'center', position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: '0 30px' }}>
          
          {/* Hero Text */}
          {/* Класс для настройки отступов на мобилке */}
          <div className="home-hero-content">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '30px', background: 'rgba(16, 185, 129, 0.05)', color: '#10b981', fontSize: '13px', fontWeight: '700', marginBottom: '30px', border: '1px solid rgba(16, 185, 129, 0.15)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }} />
              The #1 Tech Hiring Platform
            </div>

            <h1 style={{ fontSize: 'clamp(46px, 6vw, 72px)', fontWeight: '950', lineHeight: '1.05', marginBottom: '25px', letterSpacing: '-0.03em' }}>
              Accelerate your <br />
              <span style={{ background: 'linear-gradient(135deg, #10b981, #059669, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>tech career.</span>
            </h1>

            <p style={{ fontSize: '19px', color: '#888', maxWidth: '500px', marginBottom: '40px', lineHeight: '1.6', fontWeight: 400 }}>
              Connect with leading tech companies, chat directly with engineering teams, and get hired faster. No middleman, no spam.
            </p>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link to="/jobs" style={{ background: '#fff', color: '#000', padding: '16px 32px', borderRadius: '16px', fontSize: '16px', fontWeight: 800, textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s', display: 'inline-block' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(255,255,255,0.2)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                Explore Opportunities
              </Link>
              {!user && (
                <Link to="/register" style={{ padding: '16px 32px', borderRadius: '16px', fontSize: '16px', fontWeight: 700, border: '1px solid #333', color: '#fff', textDecoration: 'none', background: 'rgba(255,255,255,0.02)', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                  For Employers
                </Link>
              )}
            </div>

            {/* Social Proof Avatars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '40px' }}>
              <div style={{ display: 'flex', marginLeft: '10px' }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #000', marginLeft: '-10px', background: '#222', overflow: 'hidden' }}>
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} style={{ width: '100%', height: '100%' }} />
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '13px', color: '#666', fontWeight: 500 }}>
                Join <b style={{ color: '#fff' }}>10,000+</b> developers <br/>already hired this year.
              </div>
            </div>
          </div>

          {/* Hero Image & Floating Cards */}
          {/* ID для скрытия карточек на мобилке в index.css */}
          <div id="home-hero-visual" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'linear-gradient(45deg, #10b981, transparent)', filter: 'blur(80px)', zIndex: -1, opacity: 0.3 }} />
            
            <img src="/images/hero-coder.png" alt="Developer coding" style={{ width: '100%', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.8)' }} />
            
            {/* Floating Glassmorphism Card 1 */}
            <div style={{ position: 'absolute', top: '10%', left: '-30px', background: 'rgba(10, 10, 10, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', animation: 'float 6s ease-in-out infinite' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Check /></div>
              <div>
                <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>Offer Accepted</div>
                <div style={{ color: '#888', fontSize: '12px' }}>Senior React Developer</div>
              </div>
            </div>

            {/* Floating Glassmorphism Card 2 */}
            <div style={{ position: 'absolute', bottom: '15%', right: '-20px', background: 'rgba(10, 10, 10, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', animation: 'float 8s ease-in-out infinite reverse' }}>
              <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }} />
              <div>
                <div style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>New Message</div>
                <div style={{ color: '#888', fontSize: '12px' }}>From Spotify HR Team</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
      `}</style>

      {/* --- SECTION 2: TRUSTED LOGOS --- */}
      <section style={{ padding: '40px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#050505' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 30px', textAlign: 'center' }}>
          <p style={{ color: '#666', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '30px' }}>Trusted by innovative teams worldwide</p>
          <div className="home-trusted-logos" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.5, flexWrap: 'wrap', gap: '30px' }}>
             <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-1px' }}>acme.</h3>
             <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0, fontStyle: 'italic' }}>GlobalTech</h3>
             <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0, fontFamily: 'monospace' }}>_build</h3>
             <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>NEXUS</h3>
             <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '2px' }}>PULSE</h3>
          </div>
        </div>
      </section>

      {/* --- SECTION 3: BENTO GRID FEATURES --- */}
      <section style={{ padding: '120px 0', position: 'relative', zIndex: 1 }}>
        <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 30px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: '900', marginBottom: '15px', letterSpacing: '-1px' }}>
              Built for <span style={{ color: '#10b981' }}>modern</span> teams.
            </h2>
            <p style={{ color: '#888', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
              Everything you need to hire or get hired, wrapped in a beautiful, lightning-fast platform.
            </p>
          </div>

          {/* ID для настройки Bento-сетки в index.css */}
          <div id="home-features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: 'minmax(250px, auto)', gap: '24px' }}>
            
            {/* Feature 1: Large (Communication) */}
            <div style={{ gridColumn: '1 / 3', background: 'radial-gradient(circle at top left, #1a1a1a, #050505)', borderRadius: '32px', padding: '40px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden', transition: 'transform 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Icons.Message />
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '15px' }}>Direct Communication</h3>
              <p style={{ color: '#888', fontSize: '16px', maxWidth: '350px', lineHeight: '1.6' }}>Skip the middleman. Chat directly with technical recruiters and managers in real-time. Discuss projects, not just resumes.</p>
              
              {/* Fake UI Element */}
              <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', width: '300px', background: '#111', borderRadius: '24px', padding: '20px', border: '1px solid #222', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', transform: 'rotate(-5deg)' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#333' }} />
                  <div style={{ background: '#222', padding: '10px 15px', borderRadius: '0 12px 12px 12px', color: '#888', fontSize: '12px' }}>Hi! We loved your portfolio.</div>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <div style={{ background: '#10b981', padding: '10px 15px', borderRadius: '12px 0 12px 12px', color: '#000', fontSize: '12px', fontWeight: 600 }}>Thanks! I'd love to chat.</div>
                </div>
              </div>
            </div>

            {/* Feature 2: Medium (Speed) */}
            <div style={{ gridColumn: '3 / 4', background: '#0a0a0a', borderRadius: '32px', padding: '40px', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Icons.Lightning />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '15px' }}>Lightning Fast</h3>
              <p style={{ color: '#888', fontSize: '15px', lineHeight: '1.6' }}>Built on modern infrastructure. Apply to jobs in one click without filling out endless forms.</p>
            </div>

            {/* Feature 3: Medium (Privacy) */}
            <div style={{ gridColumn: '1 / 2', background: '#0a0a0a', borderRadius: '32px', padding: '40px', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Icons.Shield />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '15px' }}>Privacy First</h3>
              <p style={{ color: '#888', fontSize: '15px', lineHeight: '1.6' }}>You control who sees your profile. Hide your status from your current employer effortlessly.</p>
            </div>

            {/* Feature 4: Wide (Global) */}
            <div style={{ gridColumn: '2 / 4', background: 'radial-gradient(circle at bottom right, #112211, #050505)', borderRadius: '32px', padding: '40px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '40px', transition: 'transform 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ flex: 1 }}>
                <div style={{ width: '48px', height: '48px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <Icons.Globe />
                </div>
                <h3 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '15px' }}>Global Reach</h3>
                <p style={{ color: '#888', fontSize: '16px', lineHeight: '1.6' }}>Find remote opportunities worldwide. Filter by timezone, visa sponsorship, and relocation packages.</p>
              </div>
              
              {/* Fake UI Element */}
              <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {['Warsaw, PL', 'Remote', 'London, UK', 'Berlin, DE', 'New York, US'].map(tag => (
                  <span key={tag} style={{ padding: '8px 16px', background: '#111', border: '1px solid #333', borderRadius: '20px', fontSize: '13px', color: '#aaa' }}>{tag}</span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- SECTION 4: BOTTOM CTA --- */}
      {/* Класс для настройки отступов на мобилке */}
      <section className="home-cta-section" style={{ padding: '80px 30px', margin: '0 auto 80px', maxWidth: '1280px' }}>
        <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '40px', padding: '80px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', opacity: 0.5 }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: '950', color: '#fff', marginBottom: '20px', letterSpacing: '-1px' }}>
              Ready to make your next move?
            </h2>
            <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)', marginBottom: '40px', fontWeight: 500 }}>
              Join thousands of tech professionals finding their dream jobs today.
            </p>
            <Link to="/register" style={{ background: '#000', color: '#fff', padding: '18px 40px', borderRadius: '20px', fontSize: '18px', fontWeight: 800, textDecoration: 'none', transition: 'transform 0.2s', display: 'inline-block' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}