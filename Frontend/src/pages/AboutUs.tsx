import { Link } from "react-router-dom";

const Icons = {
  Target: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Zap: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  Users: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/></svg>,
  Globe: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
};

export default function AboutUs() {
  
  const teamMembers = [
    { name: "Vasyl", role: "CEO & Founder", image: "/team/vasiliy.jpg" },
    { name: "Anna", role: "Creative Director", image: "/team/anna.jpg" },
    { name: "Vladislav", role: "CTO & Security Lead", image: "/team/vladislav.jpg" }
  ];

  return (
    <div style={{ 
      background: '#050505', 
      width: '100vw', 
      position: 'relative', 
      left: '50%',
      right: '50%',
      marginLeft: '-50vw',
      marginRight: '-50vw',
      minHeight: '100vh', 
      overflowX: 'clip',
      paddingBottom: '100px'
    }}>
      
      {/* ДЕКОРАТИВНЫЕ СФЕРЫ НА ФОНЕ */}
      <div style={{ position: 'absolute', top: '-10%', left: '10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '40%', right: '-5%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '0', left: '20%', width: '900px', height: '900px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 60%)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
        
        {/* === HERO SECTION === */}
        <section className="about-hero" style={{ textAlign: 'center', padding: '120px 0 80px', animation: 'fadeIn 0.6s ease-out' }}>
          <div style={{ display: 'inline-block', padding: '8px 16px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: '#aaa', fontSize: '13px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '25px' }}>
            Our Story
          </div>
          <h1 style={{ fontSize: 'clamp(48px, 8vw, 80px)', fontWeight: 950, margin: '0 0 25px', letterSpacing: '-2px', color: '#fff', lineHeight: '1.1' }}>
            Redefining How <br/>
            <span style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Talent Meets Opportunity</span>
          </h1>
          <p style={{ fontSize: 'clamp(18px, 2vw, 22px)', color: '#888', maxWidth: '750px', margin: '0 auto', lineHeight: '1.6', fontWeight: 500 }}>
            JobBoard isn't just another job site. We are building the modern infrastructure for elite engineering teams and world-class professionals to connect seamlessly.
          </p>
        </section>

        {/* === STATS SECTION === */}
        <section className="m-mb-40" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', marginBottom: '140px' }}>
          {[
            { label: "Active Jobs", value: "10,000+" },
            { label: "Tech Talents", value: "50,000+" },
            { label: "Global Partners", value: "2,500+" }
          ].map((stat, i) => (
            <div key={i} className="about-card" style={{ flex: '1 1 250px', background: 'rgba(15, 15, 15, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px 40px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              <div style={{ fontSize: '42px', fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: '5px' }}>{stat.value}</div>
              <div style={{ color: '#10b981', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
            </div>
          ))}
        </section>

        {/* === MISSION SECTION (BENTO GRID) === */}
        <section className="about-mission m-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '140px', alignItems: 'center' }}>
          <div className="about-card" style={{ background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px', padding: '60px', boxShadow: '0 30px 60px rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' }}>
                <Icons.Target />
              </div>
              <h2 style={{ fontSize: '36px', fontWeight: 900, color: '#fff', marginBottom: '20px', letterSpacing: '-1px' }}>Our Mission</h2>
              <p style={{ color: '#aaa', fontSize: '18px', lineHeight: '1.8' }}>
                We believe that finding a dream job or the perfect candidate shouldn't feel like a black box. By leveraging modern technology, sleek design, and transparent communication, we provide an unparalleled experience that respects both the employer's time and the candidate's ambition.
              </p>
            </div>
          </div>
          <div className="about-mission-img" style={{ height: '100%', minHeight: '400px', background: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80) center/cover', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(5,5,5,0.8) 0%, transparent 100%)' }} />
          </div>
        </section>

        {/* === VALUES SECTION === */}
        <section className="m-mb-40" style={{ marginBottom: '140px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: 900, color: '#fff', letterSpacing: '-1px', margin: '0 0 15px' }}>Our Core Values</h2>
            <p style={{ color: '#888', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>The principles that guide every feature we build and every decision we make.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {[
              { title: 'Transparency', desc: 'No hidden salaries, no ghosting. We enforce clear communication between candidates and companies.', icon: <Icons.Globe /> },
              { title: 'Innovation', desc: 'We continuously improve our matching algorithms and platform speed to provide a seamless UX.', icon: <Icons.Zap /> },
              { title: 'Community First', desc: 'Built by developers, for developers. We actively support the growth of the global tech ecosystem.', icon: <Icons.Users /> }
            ].map((value, i) => (
              <div 
                key={i} 
                className="about-card"
                style={{ background: 'rgba(15, 15, 15, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '40px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden' }} 
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)'; }} 
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, transparent, #10b981, transparent)', opacity: 0.5 }} />
                <div style={{ color: '#10b981', marginBottom: '25px' }}>{value.icon}</div>
                <h3 style={{ marginBottom: '15px', fontSize: '24px', fontWeight: 800, color: '#fff' }}>{value.title}</h3>
                <p style={{ color: '#888', lineHeight: '1.6', fontSize: '16px', margin: 0 }}>{value.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* === TEAM SECTION === */}
        <section className="m-mb-40" style={{ marginBottom: '140px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: 900, color: '#fff', letterSpacing: '-1px', margin: '0 0 15px' }}>Meet the Creators</h2>
            <p style={{ color: '#888', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>The passionate team working behind the scenes to make JobBoard exceptional.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', justifyContent: 'center' }}>
            {teamMembers.map((member, index) => (
              <div key={index} className="about-card" style={{ background: 'rgba(15, 15, 15, 0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px', padding: '40px 30px', textAlign: 'center', transition: 'transform 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ 
                  width: '160px', height: '160px', borderRadius: '50%', background: '#111', 
                  margin: '0 auto 25px', padding: '6px', border: '1px solid rgba(16, 185, 129, 0.3)',
                  boxShadow: '0 15px 35px -10px rgba(16, 185, 129, 0.3)'
                }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#222' }}>
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${member.name}&background=111&color=10b981&size=200&bold=true`; }}
                    />
                  </div>
                </div>
                <h4 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>{member.name}</h4>
                <p style={{ color: '#10b981', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* === CTA SECTION === */}
        <section className="about-cta" style={{ 
          background: 'rgba(15, 15, 15, 0.8)', 
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(16, 185, 129, 0.2)', 
          borderRadius: '40px', 
          padding: '80px 40px', 
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
        }}>
          {/* Свечение внутри CTA */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 60%)', zIndex: 0 }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 950, color: '#fff', marginBottom: '20px', letterSpacing: '-1px' }}>Ready to elevate your career?</h2>
            <p style={{ fontSize: '18px', color: '#aaa', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6' }}>
              Join thousands of forward-thinking companies and top-tier developers. The future of hiring starts here.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', padding: '18px 40px', borderRadius: '16px', textDecoration: 'none', fontWeight: 800, fontSize: '16px', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                Create Account
              </Link>
              <Link to="/jobs" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '18px 40px', borderRadius: '16px', textDecoration: 'none', fontWeight: 700, fontSize: '16px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                Explore Jobs
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}