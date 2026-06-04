// src/components/employer/CandidateCard.tsx
import { Link } from "react-router-dom";

const Icons = {
  Mail: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>,
  File: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>,
  Check: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>,
  X: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>,
  ChevronDown: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>,
  ChevronUp: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"></path></svg>,
  User: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
};

export default function CandidateCard({ app, isExpanded, toggleExpand, handleUpdateStatus, getStatusColor, apiUrl }: any) {
  const statusStyle = getStatusColor(app.status);

  return (
    <div style={{ background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', overflow: 'hidden', transition: 'all 0.3s', boxShadow: isExpanded ? '0 20px 40px rgba(0,0,0,0.5)' : 'none' }}>
      
      <div className="job-mgmt-card-header" style={{ padding: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #222, #111)', border: '2px solid #333', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: '#888', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', flexShrink: 0 }}>
            {app.candidate.avatarUrl ? (
              <img src={app.candidate.avatarUrl.startsWith('http') ? app.candidate.avatarUrl : `${apiUrl}${app.candidate.avatarUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="avatar" />
            ) : (
              (app.candidate.firstName?.[0] || app.candidate.email?.[0] || "?").toUpperCase()
            )}
          </div>
          
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#fff', fontWeight: 800 }}>
                {app.candidate.firstName} {app.candidate.lastName}
              </h3>
              <span style={{ background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}`, padding: '4px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {app.status}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#666', fontSize: '14px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', wordBreak: 'break-all' }}><Icons.Mail /> {app.candidate.email}</span>
              <span className="hidden-mobile">•</span>
              <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="job-mgmt-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          <Link to={`/candidate/${app.candidate.id}`} style={{ padding: '12px 18px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s', justifyContent: 'center' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
            <Icons.User /> Profile
          </Link>

          <button onClick={() => toggleExpand(app.id)} style={{ padding: '12px 18px', borderRadius: '14px', background: 'transparent', border: '1px solid #333', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.2s', justifyContent: 'center' }} onMouseOver={(e) => e.currentTarget.style.background = '#111'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
            {isExpanded ? "Hide Details" : "View CV"}
            {isExpanded ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
          </button>

          {app.status !== 'rejected' && app.status !== 'invited' && (
             <>
               {app.status === 'new' && (
                 <button onClick={() => handleUpdateStatus(app.id, 'reviewed')} style={{ padding: '12px 18px', borderRadius: '14px', background: '#111', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, justifyContent: 'center' }} title="Mark as Reviewed">
                   <Icons.Check /> Review
                 </button>
               )}
               <button onClick={() => handleUpdateStatus(app.id, 'rejected')} style={{ padding: '12px 18px', borderRadius: '14px', background: '#111', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, justifyContent: 'center' }} title="Decline Candidate">
                 <Icons.X /> Decline
               </button>
             </>
          )}

          {app.status === 'reviewed' && (
            <button onClick={() => handleUpdateStatus(app.id, 'invited')} style={{ padding: '12px 20px', borderRadius: '14px', background: '#10b981', border: 'none', color: '#000', fontSize: '14px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.4)', justifyContent: 'center' }}>
              Invite to Interview
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '30px', background: 'rgba(0,0,0,0.4)' }}>
          <div className="job-mgmt-details" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
            
            <div>
              <h4 style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', marginTop: 0 }}>Motivation Letter</h4>
              {app.coverLetter ? (
                <div style={{ background: '#000', border: '1px solid #1a1a1a', borderRadius: '20px', padding: '25px', color: '#ccc', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '300px', overflowY: 'auto' }}>
                  {app.coverLetter}
                </div>
              ) : (
                <div style={{ color: '#555', fontStyle: 'italic', fontSize: '14px' }}>No motivation letter provided.</div>
              )}
            </div>

            <div>
              <h4 style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', marginTop: 0 }}>Documents & Contact</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <button 
                  onClick={() => window.open(app.cvUrl?.startsWith('http') ? app.cvUrl : `${apiUrl}${app.cvUrl}`, '_blank')}
                  disabled={!app.cvUrl}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '18px', 
                    background: '#111', border: '1px solid #222', borderRadius: '16px', 
                    color: app.cvUrl ? '#fff' : '#444', cursor: app.cvUrl ? 'pointer' : 'not-allowed',
                    fontSize: '14px', fontWeight: 700, width: '100%', textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { if(app.cvUrl) { e.currentTarget.style.background = '#222'; e.currentTarget.style.borderColor = '#444'; } }}
                  onMouseOut={(e) => { if(app.cvUrl) { e.currentTarget.style.background = '#111'; e.currentTarget.style.borderColor = '#222'; } }}
                >
                  <Icons.File /> {app.cvUrl ? "View Resume / CV" : "No CV Uploaded"}
                </button>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: 600 }}>Phone Number:</div>
                  <div style={{ color: '#fff', fontSize: '15px', fontWeight: 500 }}>{app.candidate.phone || "Not provided"}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}