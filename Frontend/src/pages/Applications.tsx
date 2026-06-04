// src/pages/Applications.tsx
import { Link } from "react-router-dom";
import { useApplications } from "../hooks/useApplications";
import ApplicationCard from "../components/candidate/ApplicationCard";

const Icons = {
  Briefcase: () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Clock: () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  CheckCircle: () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Search: () => <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
};

export default function Applications() {
  const { apps, isLoading, stats } = useApplications();

  if (isLoading) return <div style={{ color: '#fff', textAlign: 'center', paddingTop: '100vh', background: '#050505', height: '100vh' }}>Loading Dashboard...</div>;

  return (
    <div style={{ 
      background: '#050505', width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw',
      minHeight: 'calc(100vh - 80px)', overflowX: 'clip', paddingBottom: '100px'
    }}>
      
      <style>{`
        .app-card { background: rgba(15, 15, 15, 0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 24px; padding: 25px 30px; display: flex; align-items: center; justify-content: space-between; text-decoration: none; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .app-card:hover { transform: translateY(-4px); background: rgba(25, 25, 25, 0.8); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .app-card.status-invited:hover { border-color: rgba(16, 185, 129, 0.5); box-shadow: 0 20px 40px rgba(16, 185, 129, 0.15); }
        .app-card.status-default:hover { border-color: rgba(255, 255, 255, 0.15); }
        .card-arrow { color: #555; transition: transform 0.3s ease, color 0.3s ease; }
        .app-card:hover .card-arrow { transform: translateX(6px); color: #fff; }
        .app-card.status-invited:hover .card-arrow { color: #10b981; }
      `}</style>

      {/* Декоративные свечения */}
      <div style={{ position: 'absolute', top: '0', left: '10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '0', right: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 20px', position: 'relative', zIndex: 1 }}>
        
        {/* === ШАПКА === */}
        <header style={{ textAlign: 'center', marginBottom: '50px', animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '12px', fontWeight: '800', marginBottom: '15px', border: '1px solid rgba(16, 185, 129, 0.2)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Candidate Dashboard
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 950, margin: '0 0 15px', letterSpacing: '-1.5px', color: '#fff' }}>
            My <span style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Applications</span>
          </h1>
        </header>

        {/* === МИНИ-ДАШБОРД (СТАТИСТИКА) === */}
        {apps.length > 0 && (
          <div className="app-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '50px', animation: 'fadeIn 0.6s ease-out' }}>
            <div style={{ background: 'rgba(15, 15, 15, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ color: '#fff', marginBottom: '10px' }}><Icons.Briefcase /></div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff', marginBottom: '2px' }}>{stats.total}</div>
              <div style={{ fontSize: '11px', color: '#666', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Total Applied</div>
            </div>
            
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: '24px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ color: '#10b981', marginBottom: '10px' }}><Icons.CheckCircle /></div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff', marginBottom: '2px' }}>{stats.invited}</div>
              <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Interviews</div>
            </div>

            <div style={{ background: 'rgba(59, 130, 246, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(59, 130, 246, 0.1)', borderRadius: '24px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ color: '#3b82f6', marginBottom: '10px' }}><Icons.Clock /></div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff', marginBottom: '2px' }}>{stats.pending}</div>
              <div style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Under Review</div>
            </div>
          </div>
        )}

        {/* === СПИСОК ОТКЛИКОВ === */}
        {apps.length === 0 ? (
          <div style={{ background: 'rgba(15, 15, 15, 0.4)', backdropFilter: 'blur(20px)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '40px', padding: '100px 20px', textAlign: 'center' }}>
            <div style={{ color: '#333', marginBottom: '25px', display: 'flex', justifyContent: 'center' }}><Icons.Search /></div>
            <h3 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', marginBottom: '15px' }}>No applications yet</h3>
            <p style={{ color: '#888', fontSize: '16px', marginBottom: '30px', maxWidth: '400px', margin: '0 auto 30px' }}>You haven't applied to any jobs. Start exploring opportunities and make your next career move.</p>
            <Link to="/jobs" style={{ display: 'inline-flex', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', padding: '16px 32px', borderRadius: '16px', textDecoration: 'none', fontWeight: 800, fontSize: '15px', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              Explore Jobs
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {apps.map((app) => (
              <ApplicationCard key={app.id} app={app} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}