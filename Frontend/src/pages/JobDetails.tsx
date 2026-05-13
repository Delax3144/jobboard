import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../lib/api"; 
import ApplyForm from "../components/ApplyForm";
import { useAuth } from "../context/AuthContext";

const Icons = {
  ArrowLeft: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Location: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Building: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Wallet: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
  Zap: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Clock: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Check: () => <svg width="48" height="48" fill="none" stroke="#10b981" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Close: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
  Heart: ({ filled }: { filled: boolean }) => <svg width="20" height="20" fill={filled ? "#ef4444" : "none"} stroke={filled ? "#ef4444" : "currentColor"} strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
};

interface Job {
  id: string; title: string; companyName: string; companyLogo?: string;
  location: string; level: string; salaryFrom: number; salaryTo: number;
  tags: string; description: string; status: string; createdAt: string;
}

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    api.get(`/jobs/${id}`)
      .then(res => setJob(res.data))
      .catch(err => console.error("Ошибка загрузки:", err))
      .finally(() => setIsLoading(false));

    // Проверяем закладки
    if (user?.role === 'candidate') {
      api.get("/bookmarks")
        .then(res => {
          setIsBookmarked(res.data.some((b: any) => b.id === id));
        })
        .catch(err => console.error("Ошибка загрузки закладок:", err));
    }
  }, [id, user]);

  const toggleBookmark = async () => {
    if (!user || user.role !== 'candidate' || !job) return;
    try {
      await api.post(`/bookmarks/${job.id}`);
      setIsBookmarked(!isBookmarked); 
    } catch (err) {
      console.error("Ошибка переключения закладки:", err);
    }
  };

  if (isLoading) return <div style={{ color: '#fff', textAlign: 'center', paddingTop: '100vh', background: '#050505', height: '100vh' }}>Loading job details...</div>;
  if (!job) return <div style={{ color: '#fff', textAlign: 'center', paddingTop: '100px', background: '#050505', height: '100vh' }}><h1>Job not found</h1><Link to="/jobs" style={{ color: '#10b981' }}>← Back to Search</Link></div>;

  return (
    <div style={{ 
      background: '#050505', width: '100vw', position: 'relative', left: '50%', right: '50%',
      marginLeft: '-50vw', marginRight: '-50vw', minHeight: 'calc(100vh - 80px)', 
      overflowX: 'clip', paddingBottom: '100px'
    }}>
      
      {/* Стили для защиты верстки от длинного текста */}
      <style>{`
        .job-description {
          width: 100%;
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: break-word;
        }
        .job-description * {
          max-width: 100% !important;
        }
        .job-description h1, .job-description h2, .job-description h3 { color: #fff; margin: 40px 0 20px; font-weight: 800; letter-spacing: -0.5px; }
        .job-description h1 { font-size: 28px; }
        .job-description h2 { font-size: 24px; }
        .job-description h3 { font-size: 20px; }
        .job-description p { color: #aaa; font-size: 16px; line-height: 1.8; margin-bottom: 24px; }
        .job-description ul, .job-description ol { color: #aaa; font-size: 16px; line-height: 1.8; margin-bottom: 24px; padding-left: 20px; }
        .job-description li { margin-bottom: 12px; }
        .job-description strong { color: #ddd; }
        .job-description a { color: #10b981; text-decoration: none; }
        .job-description img { border-radius: 12px; margin: 20px 0; height: auto; }
        .job-description pre, .job-description code { white-space: pre-wrap; background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 6px; }
      `}</style>

      {/* Декоративные свечения */}
      <div style={{ position: 'absolute', top: '-10%', left: '20%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '20%', right: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', position: 'relative', zIndex: 1 }}>
        
        {/* === ВЕРХНЯЯ НАВИГАЦИЯ === */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
          <button onClick={() => window.history.back()} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#888', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', padding: 0, transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#888'}>
            <Icons.ArrowLeft /> Back to Search
          </button>

          {user?.role === 'candidate' && (
            <button 
              onClick={toggleBookmark}
              style={{ 
                background: isBookmarked ? 'rgba(239, 68, 68, 0.1)' : 'transparent', 
                border: isBookmarked ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(255,255,255,0.1)', 
                color: isBookmarked ? '#ef4444' : '#888', 
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', 
                fontSize: '14px', fontWeight: 700, padding: '10px 16px', borderRadius: '12px', transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = isBookmarked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = isBookmarked ? '#ef4444' : '#fff'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = isBookmarked ? 'rgba(239, 68, 68, 0.1)' : 'transparent'; e.currentTarget.style.color = isBookmarked ? '#ef4444' : '#888'; }}
            >
              <Icons.Heart filled={isBookmarked} />
              {isBookmarked ? "Saved" : "Save Job"}
            </button>
          )}
        </div>

        {/* ШАПКА ВАКАНСИИ (HERO) */}
        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', marginBottom: '60px', flexWrap: 'wrap', animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '24px', background: '#111', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', flexShrink: 0 }}>
            {job.companyLogo ? (
              <img src={job.companyLogo?.startsWith('http') ? job.companyLogo : `${apiUrl}${job.companyLogo}`} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '48px', fontWeight: 900, color: '#444' }}>{job.companyName[0]}</span>
            )}
          </div>
          
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <span style={{ background: job.status === "published" ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)', border: job.status === "published" ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255,255,255,0.1)', color: job.status === "published" ? '#10b981' : '#888', padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                {job.status === "published" ? "Actively Hiring" : job.status}
              </span>
              <span style={{ color: '#666', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <Icons.Clock /> Posted {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 style={{ margin: '0 0 15px', fontSize: 'clamp(36px, 4vw, 48px)', fontWeight: 950, letterSpacing: '-1.5px', color: '#fff', lineHeight: 1.1 }}>
              {job.title}
            </h1>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', color: '#aaa', fontSize: '16px', fontWeight: 500 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontWeight: 700 }}><Icons.Building /> {job.companyName}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.Location /> {job.location || 'Remote'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.Zap /> {job.level}</span>
            </div>
          </div>
        </div>

        {/* ОСНОВНОЙ КОНТЕНТ (FLEX: ЛЕВАЯ КОЛОНКА + ПРАВЫЙ САЙДБАР) */}
        <div style={{ display: 'flex', gap: '50px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          {/* ЛЕВАЯ КОЛОНКА (ОПИСАНИЕ И ТЕГИ) */}
          <div style={{ flex: '1 1 600px', minWidth: 0 }}> {/* minWidth: 0 критически важен, чтобы текст не разрывал колонку */}
            
            {/* ТЕГИ */}
            <div style={{ marginBottom: '60px' }}>
              <h3 style={{ fontSize: '14px', color: '#666', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '25px' }}>Tech Stack & Skills</h3>
              <div style={{ display: "flex", gap: '12px', flexWrap: "wrap" }}>
                {job.tags && job.tags.split(',').map(t => t.trim()).filter(t => t !== "").map((tag) => (
                  <span key={tag} style={{ background: 'rgba(255,255,255,0.03)', border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "10px 18px", fontSize: "14px", color: '#fff', fontWeight: 600 }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* ОПИСАНИЕ (HTML) */}
            <div>
              <h3 style={{ fontSize: '14px', color: '#666', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px' }}>Job Description</h3>
              <div className="job-description" dangerouslySetInnerHTML={{ __html: job.description }} />
            </div>

          </div>

          {/* ПРАВАЯ КОЛОНКА (STICKY ПАНЕЛЬ ОТКЛИКА) */}
          <div style={{ width: '380px', flexShrink: 0, position: 'sticky', top: '120px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '40px', boxShadow: '0 30px 60px rgba(0,0,0,0.4)', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', color: '#10b981', marginBottom: '15px' }}><Icons.Wallet /></div>
              <div style={{ fontSize: '13px', color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Estimated Salary</div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: '5px' }}>
                {job.salaryFrom.toLocaleString()} - {job.salaryTo.toLocaleString()}
              </div>
              <div style={{ fontSize: '14px', color: '#666', fontWeight: 600, marginBottom: '40px' }}>PLN / month (B2B or Gross)</div>

              <button
                onClick={() => { setIsSent(false); setIsModalOpen(true); }}
                style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', padding: '20px', borderRadius: '16px', fontWeight: 800, fontSize: '16px', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)', transition: 'transform 0.2s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Apply Now ⚡
              </button>
              
              <div style={{ marginTop: '20px', fontSize: '12px', color: '#555', fontWeight: 500 }}>
                Average response time: 2 days
              </div>
            </div>

            {/* Карточка добавления в закладки */}
            {user?.role === 'candidate' && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', textAlign: 'center' }}>
                 <h4 style={{ margin: '0 0 10px', color: '#fff', fontSize: '16px', fontWeight: 800 }}>Not ready to apply?</h4>
                 <p style={{ margin: '0 0 20px', color: '#888', fontSize: '14px', lineHeight: '1.6' }}>Save this job to your bookmarks and come back to it later.</p>
                 
                 <button 
                  onClick={toggleBookmark}
                  style={{ background: 'transparent', border: 'none', color: isBookmarked ? '#ef4444' : '#10b981', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', borderRadius: '12px', transition: 'background 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                 >
                   <Icons.Heart filled={isBookmarked} /> {isBookmarked ? "Remove from Saved" : "Save this Job"}
                 </button>
                 
                 {isBookmarked && (
                   <Link to="/saved" style={{ display: 'block', marginTop: '15px', color: '#666', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                     View Saved Jobs →
                   </Link>
                 )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* === ПРЕМИУМ-МОДАЛКА ОТКЛИКА === */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s ease-out' }} />
          
          <div style={{ position: 'relative', width: '100%', maxWidth: '600px', background: 'rgba(15, 15, 15, 0.9)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '32px', padding: '50px', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '30px', right: '30px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#888', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => {e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'}} onMouseOut={e => {e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#888'}}>
              <Icons.Close />
            </button>

            {isSent ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <Icons.Check />
                  </div>
                </div>
                <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', marginBottom: '15px', letterSpacing: '-1px' }}>Application Sent!</h2>
                <p style={{ color: '#888', fontSize: '16px', lineHeight: '1.6', marginBottom: '40px' }}>
                  Your profile and cover letter have been sent to <strong>{job.companyName}</strong>. You can track the status in your Candidate Dashboard.
                </p>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', padding: '16px 40px', borderRadius: '16px', fontWeight: 800, fontSize: '16px', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)' }}>
                  Awesome, thanks!
                </button>
              </div>
            ) : (
              <div>
                <h2 style={{ margin: '0 0 10px', fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Submit Application</h2>
                <p style={{ color: '#888', margin: '0 0 30px', fontSize: '15px' }}>Applying for <strong style={{color: '#fff'}}>{job.title}</strong> at {job.companyName}</p>
                <ApplyForm jobId={job.id} jobTitle={job.title} onSuccess={() => setIsSent(true)} />
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}