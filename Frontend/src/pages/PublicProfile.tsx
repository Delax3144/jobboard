import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../lib/api";

const Icons = {
  Back: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>,
  Mail: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>,
  Phone: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>,
  Message: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>,
  Download: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>,
  Location: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>,
  Code: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>,
  User: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
};

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/auth/users/${id}`)
      .then(res => setCandidate(res.data))
      .catch(err => console.error("Failed to load profile", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', padding: '100px' }}>Loading Talent Profile...</div>;
  if (!candidate) return <div style={{ color: '#fff', textAlign: 'center', padding: '100px' }}>Candidate not found or private.</div>;

  const skills = ["React", "TypeScript", "Node.js", "Next.js", "GraphQL", "TailwindCSS", "PostgreSQL"];
  const bio = "I am a passionate software engineer with a strong focus on frontend architecture and user experience. I love building scalable applications and working closely with design teams to bring ideas to life. Always eager to learn new technologies and improve my craft.";

  return (
    <div style={{ 
      background: '#050505', 
      width: '100vw', 
      position: 'relative', 
      left: '50%',
      right: '50%',
      marginLeft: '-50vw',
      marginRight: '-50vw',
      minHeight: 'calc(100vh - 100px)', 
      overflowX: 'clip' 
    }}>
      
      {/* Декоративные свечения */}
      <div style={{ position: 'absolute', top: '-10%', right: '10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 20px', position: 'relative', zIndex: 1 }}>
        
        <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#10b981', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '0.5px', padding: 0 }}>
          <Icons.Back /> Back to Candidates
        </button>

        {/* ОСНОВНАЯ КАРТОЧКА ПРОФИЛЯ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* ШАПКА */}
          <div className="public-prof-card" style={{ background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '30px', boxShadow: '0 30px 60px rgba(0,0,0,0.4)' }}>
            
            <div className="public-prof-info-flex" style={{ display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', border: '4px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px', fontWeight: 900, color: '#000', overflow: 'hidden', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)', flexShrink: 0 }}>
                {candidate.avatarUrl ? (
                  <img src={candidate.avatarUrl.startsWith('http') ? candidate.avatarUrl : `${apiUrl}${candidate.avatarUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  (candidate.firstName?.[0] || candidate.email[0]).toUpperCase()
                )}
              </div>
              
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <h1 style={{ margin: 0, fontSize: '36px', fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>
                    {candidate.firstName} {candidate.lastName}
                  </h1>
                  <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '6px 12px', borderRadius: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {candidate.status || "Open to work"}
                  </span>
                </div>
                
                <div style={{ color: '#888', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', fontWeight: 500 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icons.Location /> Remote / Europe</span>
                  <span style={{ width: '4px', height: '4px', background: '#333', borderRadius: '50%' }} className="hidden-mobile"></span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>@{candidate.username || 'candidate'}</span>
                </div>
              </div>
            </div>

            {/* Кнопки действий (Чат и Резюме) */}
            <div className="public-prof-actions" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <button style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '16px 24px', borderRadius: '16px', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s', justifyContent: 'center' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                <Icons.Download /> Get Resume
              </button>
              <Link to={`/messages/${candidate.id}`} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', padding: '16px 28px', borderRadius: '16px', textDecoration: 'none', fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'transform 0.2s', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)', justifyContent: 'center' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <Icons.Message /> Message
              </Link>
            </div>
          </div>

          {/* BENTO GRID ДЛЯ КОНТЕНТА */}
          <div className="public-prof-layout" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'start' }}>
            
            {/* Левая колонка (Обо мне & Опыт) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              <div style={{ background: 'rgba(15, 15, 15, 0.4)', border: '1px solid rgba(255,255,255,0.03)', padding: '35px', borderRadius: '24px' }}>
                <h3 style={{ margin: '0 0 20px', fontSize: '18px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icons.User /> About Me
                </h3>
                <p style={{ color: '#aaa', fontSize: '16px', lineHeight: '1.8', margin: 0 }}>
                  {bio}
                </p>
              </div>

              {/* Опыт работы */}
              <div style={{ background: 'rgba(15, 15, 15, 0.4)', border: '1px solid rgba(255,255,255,0.03)', padding: '35px', borderRadius: '24px' }}>
                <h3 style={{ margin: '0 0 20px', fontSize: '18px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icons.Code /> Professional Experience
                </h3>
                <div style={{ borderLeft: '2px solid rgba(16, 185, 129, 0.3)', paddingLeft: '20px', marginLeft: '10px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-27px', top: '0', width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', border: '2px solid #050505' }} />
                    <h4 style={{ margin: '0 0 5px', color: '#fff', fontSize: '16px' }}>Senior Frontend Engineer</h4>
                    <div style={{ color: '#888', fontSize: '13px', marginBottom: '10px' }}>TechCorp Inc. • 2021 — Present</div>
                    <div style={{ color: '#aaa', fontSize: '14px', lineHeight: '1.6' }}>Led the development of the core product dashboard using React and TypeScript. Improved rendering performance by 40%.</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Правая колонка (Контакты & Скиллы) */}
            <div className="public-prof-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '30px', position: 'sticky', top: '100px' }}>
              
              <div style={{ background: 'rgba(15, 15, 15, 0.4)', border: '1px solid rgba(255,255,255,0.03)', padding: '30px', borderRadius: '24px' }}>
                <h3 style={{ margin: '0 0 25px', fontSize: '16px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>Contact Info</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <div style={{ color: '#666', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Email Address</div>
                    <div style={{ color: '#fff', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '10px', wordBreak: 'break-all' }}>
                      <span style={{ color: '#10b981', flexShrink: 0 }}><Icons.Mail /></span> {candidate.email}
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#666', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Phone Number</div>
                    <div style={{ color: '#fff', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#10b981', flexShrink: 0 }}><Icons.Phone /></span> {candidate.phone || "Not provided"}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(15, 15, 15, 0.4)', border: '1px solid rgba(255,255,255,0.03)', padding: '30px', borderRadius: '24px' }}>
                <h3 style={{ margin: '0 0 20px', fontSize: '16px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>Top Skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {skills.map(skill => (
                    <span key={skill} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#ccc', padding: '8px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 600 }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}