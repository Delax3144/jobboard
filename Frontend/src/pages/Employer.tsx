// src/pages/Employer.tsx
import { Link } from "react-router-dom";
import { useEmployer } from "../hooks/useEmployer";
import JobForm from "../components/employer/JobForm";

const Icons = {
  Briefcase: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Users: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Edit: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Trash: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Settings: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Search: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
};

export default function Employer() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const { data, list, form } = useEmployer();

  if (data.isLoading) return <div style={{ color: '#fff', padding: '100px', textAlign: 'center' }}>Loading Admin Console...</div>;

  return (
    <div style={{ background: '#050505', minHeight: 'calc(100vh - 100px)', position: 'relative', overflowX: 'clip', paddingBottom: '100px' }}>
      
      <div style={{ position: 'absolute', top: '10%', left: '-10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <style>{`
        .card-highlight { opacity: 0; }
        .job-card-glass:hover .card-highlight { opacity: 1 !important; }
      `}</style>

      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '60px 20px', position: 'relative', zIndex: 1 }}>
        
        {/* HEADER & STATS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px', flexWrap: 'wrap', gap: '30px' }}>
          <div>
            <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '12px', fontWeight: '800', marginBottom: '15px', border: '1px solid rgba(16, 185, 129, 0.2)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Management Console
            </div>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 950, margin: '0 0 8px', letterSpacing: '-1.5px', color: '#fff' }}>
              Employer <span style={{ background: 'linear-gradient(90deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Hub</span>
            </h1>
            <p style={{ color: '#888', margin: 0, fontSize: '16px' }}>Manage your talent pipeline and active job postings.</p>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '20px 30px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.1)' }}>
                  <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 800, textTransform: 'uppercase', marginBottom: '5px', letterSpacing: '1px' }}>Active Ads</div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#fff' }}>{data.dashboardStats.active}</div>
              </div>
              <div style={{ background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px 30px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)' }}>
                  <div style={{ fontSize: '12px', color: '#888', fontWeight: 800, textTransform: 'uppercase', marginBottom: '5px', letterSpacing: '1px' }}>New Apps</div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#fff' }}>{data.dashboardStats.newApps}</div>
              </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '50px', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: ACTIVE VACANCIES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#10b981' }}><Icons.Briefcase /></span>
                <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#fff' }}>Your Vacancies</h2>
              </div>
              
              {data.jobs.length > 0 && (
                <div style={{ position: 'relative', width: '100%', maxWidth: '250px' }}>
                  <div style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#888', pointerEvents: 'none' }}><Icons.Search /></div>
                  <input 
                    type="text" placeholder="Search by title..." value={list.searchQuery}
                    onChange={(e) => { list.setSearchQuery(e.target.value); list.setCurrentPage(1); }}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', width: '100%', padding: '12px 20px 12px 45px', borderRadius: '12px', outline: 'none', fontSize: '14px' }}
                  />
                </div>
              )}
            </div>

            {list.filteredJobs.length === 0 && data.jobs.length > 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888', background: 'rgba(255,255,255,0.02)', borderRadius: '24px' }}>No vacancies match your search.</div>
            )}

            {data.jobs.length === 0 && (
              <div style={{ padding: '80px 20px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '32px', textAlign: 'center', color: '#666' }}>
                <div style={{ fontSize: '40px', marginBottom: '15px' }}>📋</div>
                <h3 style={{ margin: '0 0 10px', color: '#fff', fontSize: '20px' }}>No vacancies posted yet</h3>
                <p style={{ margin: 0 }}>Start by creating your first job listing on the right.</p>
              </div>
            )}

            {/* СПИСОК ВАКАНСИЙ */}
            {list.currentJobs.map((job: any) => {
              const jobApps = data.applications.filter((a: any) => a.jobId === job.id);
              const newAppsCount = jobApps.filter((a: any) => a.status === 'new').length;

              return (
                <div key={job.id} className="job-card-glass employer-job-card" style={{ background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', position: 'relative', overflow: 'hidden' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.5)'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, #10b981, #3b82f6)', transition: 'opacity 0.3s' }} className="card-highlight" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                      <div style={{ width: '70px', height: '70px', flexShrink: 0, borderRadius: '20px', background: '#000', border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.4)' }}>
                          {job.companyLogo ? <img src={job.companyLogo?.startsWith('http') ? job.companyLogo : `${apiUrl}${job.companyLogo}`} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '28px', fontWeight: 900, color: '#333' }}>{job.companyName[0].toUpperCase()}</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0, paddingTop: '5px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
                          <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{job.title}</h3>
                          <span style={{ fontSize: '11px', background: job.status === 'published' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', color: job.status === 'published' ? '#10b981' : '#888', border: job.status === 'published' ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '8px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{job.status}</span>
                        </div>
                        <div style={{ fontSize: '15px', color: '#888', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', lineHeight: '1.5' }}>
                          <span style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{job.companyName}</span>
                          <span style={{ width: '4px', height: '4px', background: '#444', borderRadius: '50%' }}></span>
                          <span style={{ whiteSpace: 'nowrap' }}>{job.location}</span>
                          <span style={{ width: '4px', height: '4px', background: '#444', borderRadius: '50%' }}></span>
                          <span style={{ color: '#10b981', fontWeight: 700, whiteSpace: 'nowrap' }}>{job.salaryFrom} – {job.salaryTo} PLN</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end', width: '100%' }}>
                      <button onClick={() => list.fillForm(job)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '12px', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => {e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'}} onMouseOut={(e) => {e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = 'translateY(0)'}} title="Edit"><Icons.Edit /></button>
                      <button onClick={() => list.handleDelete(job.id)} style={{ background: 'rgba(255,75,75,0.05)', border: '1px solid rgba(255,75,75,0.2)', color: '#ff4b4b', padding: '12px', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => {e.currentTarget.style.background = 'rgba(255,75,75,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'}} onMouseOut={(e) => {e.currentTarget.style.background = 'rgba(255,75,75,0.05)'; e.currentTarget.style.transform = 'translateY(0)'}} title="Delete"><Icons.Trash /></button>
                      <Link to={`/employer/job/${job.id}`} style={{ background: '#fff', color: '#000', padding: '12px 24px', borderRadius: '14px', textDecoration: 'none', fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>Manage <Icons.Settings /></Link>
                    </div>
                  </div>
                  <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#888' }}><Icons.Users /></span>
                      <span style={{ fontSize: '14px', color: '#888', fontWeight: 500 }}>Total Applicants: <b style={{ color: '#fff' }}>{jobApps.length}</b> {newAppsCount > 0 && <span style={{ color: '#10b981', marginLeft: '10px', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>{newAppsCount} New</span>}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {jobApps.slice(0, 5).map((app: any) => (
                          <div key={app.id} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#222', border: '2px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#aaa', fontWeight: 800, marginLeft: '-12px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                              {app.candidate.email[0].toUpperCase()}
                          </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ПАГИНАЦИЯ */}
            {list.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '10px' }}>
                <button onClick={() => list.setCurrentPage((p: number) => Math.max(1, p - 1))} disabled={list.currentPage === 1} style={{ background: 'rgba(255,255,255,0.05)', color: list.currentPage === 1 ? '#444' : '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: list.currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 700 }}>Prev</button>
                <span style={{ color: '#888', fontSize: '14px', fontWeight: 600 }}>Page <span style={{ color: '#fff' }}>{list.currentPage}</span> of {list.totalPages}</span>
                <button onClick={() => list.setCurrentPage((p: number) => Math.min(list.totalPages, p + 1))} disabled={list.currentPage === list.totalPages} style={{ background: 'rgba(255,255,255,0.05)', color: list.currentPage === list.totalPages ? '#444' : '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: list.currentPage === list.totalPages ? 'not-allowed' : 'pointer', fontWeight: 700 }}>Next</button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: POSTING FORM */}
          <JobForm form={form} />
        </div>
      </div>
    </div>
  );
}