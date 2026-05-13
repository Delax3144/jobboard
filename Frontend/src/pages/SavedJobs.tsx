import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const Icons = {
  Location: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>,
  Building: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>,
  Wallet: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>,
  HeartSolid: () => <svg width="20" height="20" fill="#ef4444" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>,
  BookmarkSlash: () => <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18"></path></svg>,
  ArrowRight: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path></svg>
};

export default function SavedJobs() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = async () => {
    try {
      const res = await api.get("/bookmarks");
      setSavedJobs(res.data);
    } catch (err) {
      console.error("Error fetching saved jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'candidate') {
      fetchSavedJobs();
    }
  }, [user]);

  const removeBookmark = async (e: React.MouseEvent, jobId: string) => {
    e.preventDefault(); // Предотвращаем переход по ссылке
    e.stopPropagation();

    try {
      await api.post(`/bookmarks/${jobId}`);
      // Красиво убираем вакансию из списка (можно добавить анимацию исчезновения, но пока просто удаляем из стейта)
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (err) {
      console.error("Error removing bookmark:", err);
    }
  };

  if (!user || user.role !== 'candidate') {
    return <div style={{ color: '#fff', padding: '100px', textAlign: 'center', background: '#050505', minHeight: '100vh' }}>Access Denied</div>;
  }

  return (
    <div style={{ 
      background: '#050505', 
      width: '100vw', 
      position: 'relative', 
      left: '50%',
      right: '50%',
      marginLeft: '-50vw',
      marginRight: '-50vw',
      minHeight: 'calc(100vh - 80px)', 
      overflowX: 'clip',
      paddingBottom: '100px'
    }}>
      
      <style>{`
        .saved-job-card {
          background: rgba(15, 15, 15, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          padding: 25px 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .saved-job-card:hover {
          transform: translateY(-4px);
          background: rgba(25, 25, 25, 0.8);
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .unbookmark-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .unbookmark-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: scale(1.1);
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
        }
      `}</style>

      {/* Декоративные свечения */}
      <div style={{ position: 'absolute', top: '0', left: '20%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Контейнер ленты */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 20px', position: 'relative', zIndex: 1 }}>
        
        {/* === ШАПКА === */}
        <header style={{ textAlign: 'center', marginBottom: '50px', animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '12px', fontWeight: '800', marginBottom: '15px', border: '1px solid rgba(16, 185, 129, 0.2)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Your Collection
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 950, margin: '0 0 15px', letterSpacing: '-1.5px', color: '#fff' }}>
            Saved <span style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Opportunities</span>
          </h1>
          <p style={{ color: '#888', fontSize: '18px', maxWidth: '600px', margin: '0 auto', fontWeight: 500 }}>
            {savedJobs.length > 0 
              ? `You have ${savedJobs.length} bookmarked ${savedJobs.length === 1 ? 'job' : 'jobs'} saved for later.` 
              : "Keep track of the jobs you're interested in."}
          </p>
        </header>

        {loading ? (
          <div style={{ color: '#666', textAlign: 'center', padding: '50px' }}>Loading your bookmarks...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {savedJobs.map((job) => (
              <Link to={`/jobs/${job.id}`} key={job.id} className="saved-job-card">
                
                {/* ЛЕВАЯ ЧАСТЬ: Логотип и Описание */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, minWidth: '0' }}>
                  <div style={{ 
                    width: '64px', height: '64px', flexShrink: 0, borderRadius: '16px', background: '#111', 
                    border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', fontSize: '24px', fontWeight: 900, color: '#555', overflow: 'hidden' 
                  }}>
                    {job.companyLogo ? (
                      <img 
                        src={job.companyLogo?.startsWith('http') ? job.companyLogo : `${apiUrl}${job.companyLogo}`}
                        alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      job.companyName[0].toUpperCase()
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: '0', paddingRight: '15px' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#fff', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {job.title}
                    </h3>
                    
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ color: '#10b981', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icons.Building /> {job.companyName}
                      </span>
                      <span style={{ width: '4px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%' }} />
                      <span style={{ color: '#888', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                        <Icons.Location /> {job.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ПРАВАЯ ЧАСТЬ: Зарплата и Кнопка */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '16px', fontWeight: '800', color: '#fff' }}>
                      <Icons.Wallet /> {job.salaryFrom} - {job.salaryTo} PLN
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '20px' }}>
                    <button 
                      onClick={(e) => removeBookmark(e, job.id)}
                      className="unbookmark-btn"
                      title="Remove from Saved"
                    >
                      <Icons.HeartSolid />
                    </button>
                    <div style={{ color: '#555' }}><Icons.ArrowRight /></div>
                  </div>
                </div>

              </Link>
            ))}

            {/* EMPTY STATE */}
            {savedJobs.length === 0 && (
              <div style={{ background: 'rgba(15, 15, 15, 0.4)', backdropFilter: 'blur(20px)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '40px', padding: '100px 20px', textAlign: 'center' }}>
                <div style={{ color: '#333', marginBottom: '25px', display: 'flex', justifyContent: 'center' }}><Icons.BookmarkSlash /></div>
                <h3 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', marginBottom: '15px' }}>No saved jobs yet</h3>
                <p style={{ color: '#888', fontSize: '16px', marginBottom: '30px', maxWidth: '400px', margin: '0 auto 30px' }}>Click the heart icon on any job posting to save it here for later review.</p>
                <Link to="/jobs" style={{ display: 'inline-flex', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', padding: '16px 32px', borderRadius: '16px', textDecoration: 'none', fontWeight: 800, fontSize: '15px', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  Explore Jobs
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}