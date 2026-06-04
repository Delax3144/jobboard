// src/pages/JobDetails.tsx
import { Link } from "react-router-dom";
import { useJobDetails } from "../hooks/useJobDetails";
import ApplyModal from "../components/jobs/ApplyModal";

const Icons = {
  ArrowLeft: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Location: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Building: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Wallet: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
  Zap: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Clock: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Heart: ({ filled }: { filled: boolean }) => <svg width="20" height="20" fill={filled ? "#ef4444" : "none"} stroke={filled ? "#ef4444" : "currentColor"} strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
};

export default function JobDetails() {
  const { job, isLoading, apiUrl, user, modal, bookmarks } = useJobDetails();

  if (isLoading) return <div style={{ color: '#fff', textAlign: 'center', paddingTop: '100vh', background: '#050505', height: '100vh' }}>Loading job details...</div>;
  if (!job) return <div style={{ color: '#fff', textAlign: 'center', paddingTop: '100px', background: '#050505', height: '100vh' }}><h1>Job not found</h1><Link to="/jobs" style={{ color: '#10b981' }}>← Back to Search</Link></div>;

  return (
    <div style={{ background: '#050505', width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw', minHeight: 'calc(100vh - 80px)', overflowX: 'clip', paddingBottom: '100px' }}>
      
      <style>{`
        .job-description { width: 100%; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; }
        .job-description * { max-width: 100% !important; }
        .job-description h1, .job-description h2, .job-description h3 { color: #fff; margin: 40px 0 20px; font-weight: 800; letter-spacing: -0.5px; }
        .job-description h1 { font-size: 28px; } .job-description h2 { font-size: 24px; } .job-description h3 { font-size: 20px; }
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
              onClick={bookmarks.toggleBookmark}
              style={{ background: bookmarks.isBookmarked ? 'rgba(239, 68, 68, 0.1)' : 'transparent', border: bookmarks.isBookmarked ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(255,255,255,0.1)', color: bookmarks.isBookmarked ? '#ef4444' : '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 700, padding: '10px 16px', borderRadius: '12px', transition: 'all 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.background = bookmarks.isBookmarked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = bookmarks.isBookmarked ? '#ef4444' : '#fff'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = bookmarks.isBookmarked ? 'rgba(239, 68, 68, 0.1)' : 'transparent'; e.currentTarget.style.color = bookmarks.isBookmarked ? '#ef4444' : '#888'; }}
            >
              <Icons.Heart filled={bookmarks.isBookmarked} />
              {bookmarks.isBookmarked ? "Saved" : "Save Job"}
            </button>
          )}
        </div>

        {/* ШАПКА ВАКАНСИИ */}
        <div className="job-details-hero" style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', marginBottom: '60px', flexWrap: 'wrap', animation: 'fadeIn 0.5s ease-out' }}>
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

        {/* ОСНОВНОЙ КОНТЕНТ */}
        <div className="job-details-content" style={{ display: 'flex', gap: '50px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          <div style={{ flex: '1 1 600px', minWidth: 0 }}>
            <div style={{ marginBottom: '60px' }}>
              <h3 style={{ fontSize: '14px', color: '#666', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '25px' }}>Tech Stack & Skills</h3>
              <div className="job-tags-container" style={{ display: "flex", gap: '12px', flexWrap: "wrap" }}>
                {job.tags && job.tags.split(',').map(t => t.trim()).filter(t => t !== "").map((tag) => (
                  <span key={tag} style={{ background: 'rgba(255,255,255,0.03)', border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "10px 18px", fontSize: "14px", color: '#fff', fontWeight: 600 }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '14px', color: '#666', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px' }}>Job Description</h3>
              <div className="job-description" dangerouslySetInnerHTML={{ __html: job.description }} />
            </div>
          </div>

          <div className="job-details-sidebar" style={{ width: '380px', flexShrink: 0, position: 'sticky', top: '120px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '40px', boxShadow: '0 30px 60px rgba(0,0,0,0.4)', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', color: '#10b981', marginBottom: '15px' }}><Icons.Wallet /></div>
              <div style={{ fontSize: '13px', color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Estimated Salary</div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: '5px' }}>
                {job.salaryFrom.toLocaleString()} - {job.salaryTo.toLocaleString()}
              </div>
              <div style={{ fontSize: '14px', color: '#666', fontWeight: 600, marginBottom: '40px' }}>PLN / month (B2B or Gross)</div>

              <button
                onClick={() => { modal.setIsSent(false); modal.setIsModalOpen(true); }}
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

            {user?.role === 'candidate' && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', textAlign: 'center' }}>
                 <h4 style={{ margin: '0 0 10px', color: '#fff', fontSize: '16px', fontWeight: 800 }}>Not ready to apply?</h4>
                 <p style={{ margin: '0 0 20px', color: '#888', fontSize: '14px', lineHeight: '1.6' }}>Save this job to your bookmarks and come back to it later.</p>
                 
                 <button 
                  onClick={bookmarks.toggleBookmark}
                  style={{ background: 'transparent', border: 'none', color: bookmarks.isBookmarked ? '#ef4444' : '#10b981', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', borderRadius: '12px', transition: 'background 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                 >
                   <Icons.Heart filled={bookmarks.isBookmarked} /> {bookmarks.isBookmarked ? "Remove from Saved" : "Save this Job"}
                 </button>
                 
                 {bookmarks.isBookmarked && (
                   <Link to="/saved" style={{ display: 'block', marginTop: '15px', color: '#666', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                     View Saved Jobs →
                   </Link>
                 )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* МОДАЛКА ОТКЛИКА */}
      <ApplyModal 
        isOpen={modal.isModalOpen} 
        onClose={() => modal.setIsModalOpen(false)} 
        isSent={modal.isSent} 
        setIsSent={modal.setIsSent} 
        job={job} 
      />

    </div>
  );
}