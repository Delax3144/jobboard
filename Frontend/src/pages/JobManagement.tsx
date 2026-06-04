// src/pages/JobManagement.tsx
import { Link } from "react-router-dom";
import { useJobManagement } from "../hooks/useJobManagement";
import CandidateCard from "../components/employer/CandidateCard";

const Icons = {
  Back: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
};

export default function JobManagement() {
  const { 
    job, applications, loading, filter, setFilter, apiUrl,
    filteredApps, expandedAppId, toggleExpand, handleUpdateStatus, getStatusColor 
  } = useJobManagement();

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', padding: '100px' }}>Loading...</div>;
  if (!job) return <div style={{ color: '#fff', textAlign: 'center', padding: '100px' }}>Job not found</div>;

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
      
      <div className="job-mgmt-header" style={{ marginBottom: '40px' }}>
        <Link to="/employer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#10b981', textDecoration: 'none', fontWeight: 600, fontSize: '13px', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          <Icons.Back /> Back to Dashboard
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-1px' }}>{job.title}</h1>
            <div style={{ display: 'flex', gap: '15px', color: '#888', fontSize: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ color: '#fff', fontWeight: 600 }}>{job.companyName}</span>
              <span className="hidden-mobile">•</span>
              <span style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                {applications.length} Candidate{applications.length !== 1 && 's'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="job-mgmt-filters" style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {['all', 'new', 'reviewed', 'invited', 'rejected'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            style={{
              padding: '10px 20px', borderRadius: '14px', fontSize: '14px', fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
              background: filter === f ? '#fff' : 'transparent',
              color: filter === f ? '#000' : '#888',
              border: filter === f ? '1px solid #fff' : '1px solid transparent'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredApps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '32px', color: '#666' }}>
            No candidates found for this filter.
          </div>
        ) : (
          filteredApps.map((app) => (
            <CandidateCard 
              key={app.id} 
              app={app} 
              isExpanded={expandedAppId === app.id} 
              toggleExpand={toggleExpand} 
              handleUpdateStatus={handleUpdateStatus} 
              getStatusColor={getStatusColor} 
              apiUrl={apiUrl} 
            />
          ))
        )}
      </div>
    </div>
  );
}