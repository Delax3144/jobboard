import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

// --- Rich Text Editor ---
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// --- Professional SVG Icons ---
const Icons = {
  Briefcase: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Users: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Plus: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
  Edit: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Trash: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Settings: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

const LOCATIONS = ["Remote", "Poland", "Ukraine", "Germany", "UK", "USA"];
const LEVELS = ["Intern", "Junior", "Middle", "Senior", "Lead"];

type JobStatus = "published" | "draft" | "archived";

interface Job {
  id: string; title: string; companyName: string; companyLogo?: string;
  location: string; salaryFrom: number; salaryTo: number;
  level: string; tags: string; description: string;
  status: JobStatus; ownerId: string; createdAt: string;
}

interface Application {
  id: string; jobId: string;
  candidate: { id: string; email: string };
  status: "new" | "reviewed" | "invited" | "rejected";
}

export default function Employer() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [salaryFrom, setSalaryFrom] = useState("");
  const [salaryTo, setSalaryTo] = useState("");
  const [level, setLevel] = useState(LEVELS[1]);
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [status, setJobStatus] = useState<JobStatus>("published");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        api.get(`/jobs?ownerId=${user.id}`),
        api.get('/applications/owner') 
      ]);
      setJobs(jobsRes.data.jobs);
      setApplications(appsRes.data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, [user]);

  const dashboardStats = useMemo(() => ({
    active: jobs.filter(j => j.status === "published").length,
    newApps: applications.filter(a => a.status === "new").length,
    totalApps: applications.length
  }), [jobs, applications]);

  async function handleSubmit() {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('companyName', companyName);
    formData.append('location', location);
    formData.append('level', level);
    formData.append('salaryFrom', salaryFrom);
    formData.append('salaryTo', salaryTo);
    formData.append('tags', tags);
    formData.append('description', description); 
    formData.append('status', status);
    if (logoFile) formData.append('logo', logoFile);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editingJobId) await api.patch(`/jobs/${editingJobId}`, formData, config);
      else await api.post('/jobs', formData, config);
      resetForm();
      fetchData();
    } catch (err) { alert("Error saving job"); }
  }

  async function handleDelete(id: string) {
    if (window.confirm("Are you sure you want to delete this vacancy permanently?")) {
      try {
        await api.delete(`/jobs/${id}`);
        fetchData();
      } catch (err) { alert("Delete failed"); }
    }
  }

  function resetForm() {
    setEditingJobId(null);
    setTitle(""); setCompanyName(""); setSalaryFrom(""); setSalaryTo(""); 
    setDescription(""); setTags(""); setLogoFile(null);
    setLocation(LOCATIONS[0]); setLevel(LEVELS[1]);
    const fileInput = document.getElementById('logoInput') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  }

  function fillForm(job: Job) {
    setEditingJobId(job.id);
    setTitle(job.title); setCompanyName(job.companyName); setLocation(job.location);
    setSalaryFrom(String(job.salaryFrom)); setSalaryTo(String(job.salaryTo));
    setLevel(job.level); setTags(job.tags); setDescription(job.description);
    setJobStatus(job.status);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (isLoading) return <div style={{ color: '#fff', padding: '100px', textAlign: 'center' }}>Loading Admin Console...</div>;

  const inputStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff', width: '100%', padding: '16px 20px', 
    borderRadius: '16px', transition: 'border-color 0.2s', outline: 'none', fontSize: '14px'
  };

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
      
      {/* Декоративные мягкие свечения на фоне */}
      <div style={{ position: 'absolute', top: '10%', left: '-10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '60px 20px', position: 'relative', zIndex: 1 }}>
        
        {/* Кастомные стили для ReactQuill под премиальный темный дизайн */}
        <style>{`
          .quill-dark .ql-toolbar { 
            background: rgba(255,255,255,0.03); 
            border: 1px solid rgba(255,255,255,0.08) !important; 
            border-bottom: none !important; 
            border-radius: 16px 16px 0 0; 
            padding: 12px;
          }
          .quill-dark .ql-container { 
            background: rgba(255,255,255,0.02); 
            border: 1px solid rgba(255,255,255,0.08) !important; 
            border-radius: 0 0 16px 16px; 
            color: #fff; 
            font-family: inherit; 
            font-size: 15px; 
          }
          .quill-dark .ql-editor { min-height: 200px; padding: 20px; }
          .quill-dark .ql-editor.ql-blank::before { color: #666; font-style: normal; }
          .quill-dark .ql-stroke { stroke: #aaa; }
          .quill-dark .ql-fill { fill: #aaa; }
          .quill-dark .ql-picker { color: #aaa; }
          .quill-dark .ql-picker-options { background: #111; border: 1px solid #333; }
          
          .card-highlight { opacity: 0; }
          .job-card-glass:hover .card-highlight { opacity: 1 !important; }
        `}</style>

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
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#fff' }}>{dashboardStats.active}</div>
              </div>
              <div style={{ background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px 30px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)' }}>
                  <div style={{ fontSize: '12px', color: '#888', fontWeight: 800, textTransform: 'uppercase', marginBottom: '5px', letterSpacing: '1px' }}>New Apps</div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#fff' }}>{dashboardStats.newApps}</div>
              </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '50px', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: ACTIVE VACANCIES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ color: '#10b981' }}><Icons.Briefcase /></span>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#fff' }}>Your Vacancies</h2>
            </div>

            {jobs.length === 0 && (
              <div style={{ padding: '80px 20px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '32px', textAlign: 'center', color: '#666' }}>
                <div style={{ fontSize: '40px', marginBottom: '15px' }}>📋</div>
                <h3 style={{ margin: '0 0 10px', color: '#fff', fontSize: '20px' }}>No vacancies posted yet</h3>
                <p style={{ margin: 0 }}>Start by creating your first job listing on the right.</p>
              </div>
            )}

            {jobs.map(job => {
              const jobApps = applications.filter(a => a.jobId === job.id);
              const newAppsCount = jobApps.filter(a => a.status === 'new').length;

              return (
                <div key={job.id} className="job-card-glass" style={{ 
                  background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', 
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', position: 'relative', overflow: 'hidden'
                }} 
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.5)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  {/* Красивый градиентный блик сбоку при наведении */}
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, #10b981, #3b82f6)', transition: 'opacity 0.3s' }} className="card-highlight" />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                    
                    {/* Left: Logo & Info */}
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                      <div style={{ width: '70px', height: '70px', flexShrink: 0, borderRadius: '20px', background: '#000', border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.4)' }}>
                          {job.companyLogo ? (
                              <img src={job.companyLogo?.startsWith('http') ? job.companyLogo : `${apiUrl}${job.companyLogo}`} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                              <span style={{ fontSize: '28px', fontWeight: 900, color: '#333' }}>{job.companyName[0].toUpperCase()}</span>
                          )}
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

                    {/* Right: Actions */}
                    <div style={{ display: 'flex', gap: '10px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button onClick={() => fillForm(job)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '12px', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => {e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'}} onMouseOut={(e) => {e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = 'translateY(0)'}} title="Edit Posting"><Icons.Edit /></button>
                      <button onClick={() => handleDelete(job.id)} style={{ background: 'rgba(255,75,75,0.05)', border: '1px solid rgba(255,75,75,0.2)', color: '#ff4b4b', padding: '12px', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => {e.currentTarget.style.background = 'rgba(255,75,75,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'}} onMouseOut={(e) => {e.currentTarget.style.background = 'rgba(255,75,75,0.05)'; e.currentTarget.style.transform = 'translateY(0)'}} title="Delete Vacancy"><Icons.Trash /></button>
                      <Link to={`/employer/job/${job.id}`} style={{ background: '#fff', color: '#000', padding: '12px 24px', borderRadius: '14px', textDecoration: 'none', fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                          Manage <Icons.Settings />
                      </Link>
                    </div>
                  </div>

                  {/* Micro ATS Preview */}
                  <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#888' }}><Icons.Users /></span>
                      <span style={{ fontSize: '14px', color: '#888', fontWeight: 500 }}>
                          Total Applicants: <b style={{ color: '#fff' }}>{jobApps.length}</b> 
                          {newAppsCount > 0 && <span style={{ color: '#10b981', marginLeft: '10px', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>{newAppsCount} New</span>}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {jobApps.slice(0, 5).map(app => (
                          <div key={app.id} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#222', border: '2px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#aaa', fontWeight: 800, marginLeft: '-12px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                              {app.candidate.email[0].toUpperCase()}
                          </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT COLUMN: POSTING FORM */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <div style={{ background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px', padding: '40px', boxShadow: '0 30px 60px rgba(0,0,0,0.4)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '35px' }}>
                  <div style={{ padding: '10px', background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))', color: '#10b981', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)' }}><Icons.Plus /></div>
                  <h2 style={{ fontSize: '24px', fontWeight: 900, margin: 0, color: '#fff', letterSpacing: '-0.5px' }}>{editingJobId ? "Edit Vacancy" : "Create New Role"}</h2>
              </div>

              <div style={{ display: 'grid', gap: '25px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#888', fontWeight: 800, marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Company Logo</label>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', padding: '25px', borderRadius: '20px', textAlign: 'center', transition: 'border-color 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)'} onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                      <input id="logoInput" type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} style={{ fontSize: '13px', color: '#888' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#888', fontWeight: 800, marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Job Title</label>
                  <input style={inputStyle} placeholder="e.g. Senior React Engineer" value={title} onChange={e => setTitle(e.target.value)} onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.5)'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#888', fontWeight: 800, marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Company Name</label>
                  <input style={inputStyle} placeholder="ACME Corp" value={companyName} onChange={e => setCompanyName(e.target.value)} onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.5)'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#888', fontWeight: 800, marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Location</label>
                    <select style={{...inputStyle, appearance: 'auto'}} value={location} onChange={e => setLocation(e.target.value as any)} onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.5)'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'}>
                      {LOCATIONS.map(l => <option key={l} value={l} style={{background: '#111'}}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#888', fontWeight: 800, marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Level</label>
                    <select style={{...inputStyle, appearance: 'auto'}} value={level} onChange={e => setLevel(e.target.value as any)} onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.5)'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'}>
                      {LEVELS.map(lv => <option key={lv} value={lv} style={{background: '#111'}}>{lv}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#888', fontWeight: 800, marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Salary From (PLN)</label>
                    <input style={inputStyle} type="number" placeholder="10000" value={salaryFrom} onChange={e => setSalaryFrom(e.target.value)} onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.5)'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#888', fontWeight: 800, marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Salary To (PLN)</label>
                    <input style={inputStyle} type="number" placeholder="20000" value={salaryTo} onChange={e => setSalaryTo(e.target.value)} onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.5)'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#888', fontWeight: 800, marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Tech Stack (Tags)</label>
                  <input style={inputStyle} placeholder="React, Node.js, AWS..." value={tags} onChange={e => setTags(e.target.value)} onFocus={e => e.target.style.borderColor='rgba(16,185,129,0.5)'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: '#888', fontWeight: 800, marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Job Description</label>
                  <div className="quill-dark">
                    <ReactQuill theme="snow" value={description} onChange={setDescription} placeholder="Roles, responsibilities and benefits..." />
                  </div>
                </div>

                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <button 
                    onClick={handleSubmit} 
                    style={{ 
                      background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', 
                      padding: '18px', borderRadius: '16px', fontWeight: 800, fontSize: '16px', 
                      border: 'none', cursor: 'pointer', transition: 'transform 0.2s',
                      boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)'
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    {editingJobId ? "Update Job Posting" : "Launch Vacancy"}
                  </button>
                  
                  {editingJobId && (
                    <button onClick={resetForm} style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#888', background: 'transparent', padding: '16px', borderRadius: '16px', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s' }} onMouseOver={e => {e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}} onMouseOut={e => {e.currentTarget.style.color = '#888'; e.currentTarget.style.background = 'transparent'}}>
                      Cancel Edits
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}