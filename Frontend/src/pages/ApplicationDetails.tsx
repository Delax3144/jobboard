// src/pages/ApplicationDetails.tsx
import { Link } from "react-router-dom";
import { useApplicationDetails } from "../hooks/useApplicationDetails";

const Icons = {
  ArrowLeft: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Building: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Wallet: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
  Quote: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  FileText: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Message: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  Lock: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
};

export default function ApplicationDetails() {
  const { app, loading, navigate, apiUrl, isInvited, isRejected, canChat } = useApplicationDetails();

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', paddingTop: '100px', background: '#050505', minHeight: '100vh' }}>Loading...</div>;
  if (!app) return <div style={{ color: '#fff', textAlign: 'center', paddingTop: '100px', background: '#050505', minHeight: '100vh' }}>Application not found.</div>;

  let statusColor = '#3b82f6';
  let statusBg = 'rgba(59, 130, 246, 0.1)';
  let statusBorder = 'rgba(59, 130, 246, 0.2)';
  let statusText = 'Under Review';

  if (isInvited) {
    statusColor = '#10b981';
    statusBg = 'rgba(16, 185, 129, 0.1)';
    statusBorder = 'rgba(16, 185, 129, 0.2)';
    statusText = 'Interview / Invited';
  } else if (isRejected) {
    statusColor = '#ef4444';
    statusBg = 'rgba(239, 68, 68, 0.05)';
    statusBorder = 'rgba(239, 68, 68, 0.2)';
    statusText = 'Application Declined';
  }

  return (
    <div style={{ background: '#050505', width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw', minHeight: 'calc(100vh - 80px)', overflowX: 'clip', paddingBottom: '100px' }}>
      
      <div style={{ position: 'absolute', top: '0', left: '10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '0', right: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 20px', position: 'relative', zIndex: 1 }}>
        
        <button onClick={() => navigate('/applications')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#888', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '1px', padding: 0, transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#888'}>
          <Icons.ArrowLeft /> Back to Dashboard
        </button>

        <div style={{ display: 'grid', gap: '30px' }}>
          
          {/* HERO CARD */}
          <div style={{ background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '40px', boxShadow: '0 30px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            <div className="app-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
              <div className="app-title-group" style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: '#111', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: '32px', fontWeight: 900, color: '#555', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}>
                  {app.job.companyLogo ? (
                    <img src={app.job.companyLogo?.startsWith('http') ? app.job.companyLogo : `${apiUrl}${app.job.companyLogo}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Company Logo" />
                  ) : (
                    app.job.companyName[0].toUpperCase()
                  )}
                </div>
                <div>
                  <h1 style={{ margin: '0 0 10px', fontSize: '32px', fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>{app.job.title}</h1>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', color: '#888', fontSize: '15px', fontWeight: 600 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}><Icons.Building /> {app.job.companyName}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.Wallet /> {app.job.salaryFrom.toLocaleString()} - {app.job.salaryTo.toLocaleString()} PLN</span>
                  </div>
                </div>
              </div>

              <div className="app-status-wrapper" style={{ textAlign: 'right' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: statusBg, border: `1px solid ${statusBorder}`, color: statusColor, padding: '10px 20px', borderRadius: '16px', fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: isInvited ? '0 10px 30px -10px rgba(16, 185, 129, 0.5)' : 'none' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', boxShadow: isInvited ? '0 0 10px #10b981' : 'none', animation: isInvited ? 'pulse 2s infinite' : 'none' }} />
                  {statusText}
                </div>
                <div style={{ marginTop: '10px', color: '#666', fontSize: '13px', fontWeight: 600 }}>
                  Applied on {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

            <div className="app-footer-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, color: '#aaa', fontSize: '15px' }}>
                {isInvited ? 'The hiring team wants to connect! Open the chat to respond.' : (isRejected ? 'Unfortunately, this application was not successful.' : 'Your profile and application are currently being evaluated.')}
              </p>
              <Link to={`/jobs/${app.job.id}`} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '13px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                View Original Job Post
              </Link>
            </div>
          </div>

          {/* BENTO-GRID ДЛЯ ДЕТАЛЕЙ */}
          <div className="app-bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', alignItems: 'start' }}>
            
            <div className="about-card" style={{ background: 'rgba(15, 15, 15, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '40px', gridColumn: 'auto / span 2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', color: '#10b981' }}>
                <Icons.Quote />
                <h3 style={{ margin: 0, fontSize: '14px', color: '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Your Motivation Pitch</h3>
              </div>
              <p style={{ margin: 0, color: '#bbb', lineHeight: '1.8', fontSize: '16px', fontStyle: app.coverLetter ? 'normal' : 'italic', whiteSpace: 'pre-wrap' }}>
                {app.coverLetter || "No pitch provided. You applied using your profile only."}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              <div className="about-card" style={{ background: 'rgba(15, 15, 15, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '35px' }}>
                <div style={{ fontSize: '12px', color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>Attached Documents</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '15px 20px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ color: '#10b981' }}><Icons.FileText /></div>
                    <div style={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>{app.cvUrl ? "Resume_CV.pdf" : "Platform Profile"}</div>
                  </div>
                  {app.cvUrl && (
                    <a href={app.cvUrl?.startsWith('http') ? app.cvUrl : `${apiUrl}${app.cvUrl}`} target="_blank" rel="noreferrer" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 700, fontSize: '13px' }}>View</a>
                  )}
                </div>
              </div>

              <div style={{ background: canChat ? 'rgba(16, 185, 129, 0.05)' : 'rgba(15, 15, 15, 0.4)', backdropFilter: 'blur(20px)', border: canChat ? '1px solid rgba(16, 185, 129, 0.2)' : '1px dashed rgba(255,255,255,0.1)', borderRadius: '32px', padding: '35px', textAlign: 'center' }}>
                {canChat ? (
                  <>
                    <h4 style={{ margin: '0 0 10px', color: '#fff', fontSize: '20px', fontWeight: 800 }}>Start Conversation</h4>
                    <p style={{ margin: '0 0 25px', color: '#888', fontSize: '14px', lineHeight: '1.5' }}>The employer has enabled the chat. You can now message them directly.</p>
                    <button 
                      onClick={() => navigate(`/messages/${app.id}`)}
                      style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', padding: '18px', borderRadius: '16px', fontWeight: 800, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)', transition: 'transform 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <Icons.Message /> Open Messages
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Icons.Lock />
                    </div>
                    <h4 style={{ margin: '0 0 10px', color: '#fff', fontSize: '18px', fontWeight: 800 }}>Chat is Locked</h4>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px', lineHeight: '1.5' }}>Messaging will be unlocked automatically if the employer decides to proceed with your application.</p>
                  </>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}