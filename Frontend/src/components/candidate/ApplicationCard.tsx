// src/components/candidate/ApplicationCard.tsx
import { Link } from "react-router-dom";

const Icons = {
  ArrowRight: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
};

export default function ApplicationCard({ app }: { app: any }) {
  const lastEventTime = app.messages?.[0]?.createdAt || app.createdAt;
  const hasUpdate = lastEventTime > app.lastViewedByCandidate;
  const isInvited = app.status === 'invited';
  const isRejected = app.status === 'rejected';
  
  let statusColor = '#3b82f6';
  let statusBg = 'rgba(59, 130, 246, 0.1)';
  let statusBorder = 'rgba(59, 130, 246, 0.2)';
  let statusLabel = 'Under Review';
  let borderClass = 'status-default';
  
  if (isInvited) {
    statusColor = '#10b981';
    statusBg = 'rgba(16, 185, 129, 0.1)';
    statusBorder = 'rgba(16, 185, 129, 0.3)';
    statusLabel = 'Interview';
    borderClass = 'status-invited';
  } else if (isRejected) {
    statusColor = '#ff4b4b';
    statusBg = 'rgba(255, 75, 75, 0.05)';
    statusBorder = 'rgba(255, 75, 75, 0.2)';
    statusLabel = 'Declined';
  }

  return (
    <Link 
      to={`/applications/${app.id}`} 
      className={`app-card app-card-inner ${borderClass}`}
      style={{ border: isInvited ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* ИНДИКАТОР НОВЫХ СООБЩЕНИЙ */}
      {hasUpdate && (
        <div style={{ position: 'absolute', top: '-4px', right: '-4px', display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '12px', height: '12px', background: '#10b981', border: '3px solid #050505', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }} />
        </div>
      )}

      {/* ЛЕВАЯ ЧАСТЬ: ЛОГОТИП И ТЕКСТ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, minWidth: '0' }}>
        <div style={{ width: '52px', height: '52px', flexShrink: 0, borderRadius: '14px', background: '#111', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 900, color: '#555', overflow: 'hidden' }}>
          {app.job?.companyLogo ? <img src={app.job.companyLogo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Logo" /> : app.job?.companyName?.charAt(0).toUpperCase()}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '0', paddingRight: '15px' }}>
          <h3 style={{ fontSize: '18px', margin: '0 0 4px 0', fontWeight: '800', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {app.job?.title}
          </h3>
          <div style={{ color: '#888', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {app.job?.companyName}
          </div>
        </div>
      </div>

      {/* ПРАВАЯ ЧАСТЬ: СТАТУС, ДАТА, СТРЕЛКА */}
      <div className="app-card-right" style={{ display: 'flex', alignItems: 'center', gap: '30px', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: statusColor, background: statusBg, border: `1px solid ${statusBorder}`, padding: '4px 10px', borderRadius: '8px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', boxShadow: isInvited ? '0 0 8px #10b981' : 'none' }} />
            {statusLabel}
          </div>
          <div style={{ color: '#555', fontSize: '12px', fontWeight: 600 }}>
            {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* СТРЕЛКА ПЕРЕХОДА */}
        <div className="card-arrow" style={{ display: 'flex', alignItems: 'center', paddingLeft: '10px', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
          <Icons.ArrowRight />
        </div>
      </div>
    </Link>
  );
}