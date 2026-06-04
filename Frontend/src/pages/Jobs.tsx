// src/pages/Jobs.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { useJobs } from "../hooks/useJobs";
import JobsFilters from "../components/jobs/JobsFilters";

const Icons = {
  Search: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  BookmarkOutline: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>,
  BookmarkFilled: () => <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>,
  Location: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Building: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Filter: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
  Close: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
};

export default function Jobs() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const { data, list, filters } = useJobs();
  
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowTopBtn(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isFilterModalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isFilterModalOpen]);

  return (
    <div style={{ background: '#050505', width: '100%', minHeight: 'calc(100vh - 70px)', position: 'relative', overflowX: 'clip' }}>
      
      <div style={{ position: 'absolute', top: '-10%', left: '10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '30%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', position: 'relative', zIndex: 1 }}>
        
        {/* PAGE HEADER & SEARCH */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px', flexWrap: 'wrap', gap: '30px' }}>
          <div>
            <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '12px', fontWeight: '800', marginBottom: '15px', border: '1px solid rgba(16, 185, 129, 0.2)', textTransform: 'uppercase', letterSpacing: '1px' }}>Find Your Match</div>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: '950', margin: '0 0 10px', letterSpacing: '-1.5px', color: '#fff' }}>
              Explore <span style={{ background: 'linear-gradient(90deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Careers</span>
            </h1>
            <p style={{ color: '#888', margin: 0, fontSize: '16px' }}>Showing <span style={{ color: '#fff', fontWeight: 700 }}>{list.filteredJobs.length}</span> opportunities</p>
          </div>
          
          <div className="jobs-search-flex-group" style={{ display: 'flex', gap: '15px', width: '100%', maxWidth: '500px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input 
                placeholder="Search job title, skills, or company..." value={filters.searchTerm} onChange={(e) => filters.setSearchTerm(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '18px 20px 18px 55px', color: '#fff', borderRadius: '20px', fontSize: '15px', outline: 'none' }} 
                onFocus={e => e.target.style.borderColor = 'rgba(16, 185, 129, 0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
              <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#10b981', display: 'flex' }}><Icons.Search /></span>
            </div>
            <button className="mobile-filter-trigger-btn" onClick={() => setIsFilterModalOpen(true)} style={{ display: 'none', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '16px', borderRadius: '16px', cursor: 'pointer', alignItems: 'center', justifyContent: 'center' }}><Icons.Filter /></button>
          </div>
        </div>

        <div className="jobs-layout" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '50px', alignItems: 'start' }}>
          <aside className="jobs-sidebar" style={{ background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '35px 25px', position: 'sticky', top: '100px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <JobsFilters filters={filters} />
          </aside>

          <main style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {list.filteredJobs.length === 0 && !data.loading && (
              <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '32px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px', filter: 'grayscale(1)' }}>📭</div>
                <h3 style={{ margin: '0 0 10px', color: '#fff', fontSize: '24px', fontWeight: 800 }}>No matching roles found</h3>
                <p style={{ color: '#666', margin: 0, fontSize: '15px' }}>Try adjusting your filters or search term to discover more opportunities.</p>
              </div>
            )}

            {list.filteredJobs.map((job) => {
              const isSaved = data.savedJobIds.has(job.id);
              
              return (
                <Link to={`/jobs/${job.id}`} key={job.id} style={{ textDecoration: 'none' }}>
                  <div className="job-card-flex" style={{ background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '30px', display: 'flex', gap: '30px', alignItems: 'center', position: 'relative', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', cursor: 'pointer', overflow: 'hidden' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.5), 0 0 20px rgba(16, 185, 129, 0.05)'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, #10b981, #3b82f6)', opacity: 0, transition: 'opacity 0.3s' }} className="card-highlight" />

                    <div style={{ width: '80px', height: '80px', minWidth: '80px', borderRadius: '20px', background: '#000', border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.4)', flexShrink: 0 }}>
                      {job.companyLogo ? <img src={job.companyLogo?.startsWith('http') ? job.companyLogo : `${apiUrl}${job.companyLogo}`} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { const target = e.target as HTMLImageElement; target.style.display = 'none'; if (target.parentElement) target.parentElement.innerHTML = `<span style="font-size: 28px; font-weight: 900; color: #333;">${job.companyName[0].toUpperCase()}</span>`; }} /> : <span style={{ fontSize: '32px', fontWeight: 900, color: '#333' }}>{job.companyName[0]?.toUpperCase()}</span>}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '22px', color: '#fff', fontWeight: 800, paddingRight: '50px', letterSpacing: '-0.5px' }}>{job.title}</h3>
                        {(!data.user || data.user.role === 'candidate') && (
                          <button onClick={(e) => list.toggleBookmark(e, job.id)} style={{ position: 'absolute', top: '30px', right: '30px', background: isSaved ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)', border: isSaved ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', padding: '10px', borderRadius: '50%', color: isSaved ? '#10b981' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>
                            {isSaved ? <Icons.BookmarkFilled /> : <Icons.BookmarkOutline />}
                          </button>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', marginBottom: '18px' }}>
                        <span style={{ color: '#aaa', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}><Icons.Building /> {job.companyName}</span>
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#444' }} className="hidden-mobile" />
                        <span style={{ color: '#888', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}><Icons.Location /> {job.location || 'Remote'}</span>
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#444' }} className="hidden-mobile" />
                        <span style={{ color: '#10b981', fontWeight: '800', fontSize: '15px' }}>{job.salaryFrom.toLocaleString()} - {job.salaryTo.toLocaleString()} PLN</span>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {(() => {
                          const tagsData = job.tags;
                          const tagsArray = typeof tagsData === 'string' ? tagsData.split(',').map(s => s.trim()) : tagsData;
                          
                          if (!Array.isArray(tagsArray) || tagsArray.length === 0) return null;
                          
                          return tagsArray.map((tag: string, idx: number) => (
                            <span key={idx} style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '10px', background: '#111', color: '#aaa', border: '1px solid #222', fontWeight: 600, letterSpacing: '0.5px' }}>
                              {tag}
                            </span>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                  <style>{`.card-highlight { opacity: 0; } a:hover .card-highlight { opacity: 1 !important; }`}</style>
                </Link>
              );
            })}
          </main>
        </div>
      </div>

      <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ position: 'fixed', bottom: '30px', left: '30px', zIndex: 100, width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: showTopBtn ? 1 : 0, visibility: showTopBtn ? 'visible' : 'hidden', transform: showTopBtn ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.3s' }}>
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
      </button>

      {isFilterModalOpen && document.body && createPortal(
        <div className="premium-scroll" style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', flexDirection: 'column', background: '#050505', padding: '30px 25px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <button onClick={() => setIsFilterModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icons.Close /></button>
          </div>
          <div style={{ flex: 1 }}><JobsFilters filters={filters} /></div>
          <button onClick={() => setIsFilterModalOpen(false)} style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', padding: '16px', borderRadius: '16px', fontWeight: 800, fontSize: '16px', border: 'none', marginTop: '40px', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)' }}>
            Apply Filters ({list.filteredJobs.length} Jobs)
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}