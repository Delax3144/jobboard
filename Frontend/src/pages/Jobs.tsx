import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

// --- Professional SVG Icons ---
const Icons = {
  Search: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>,
  BookmarkOutline: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>,
  BookmarkFilled: () => <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>,
  Location: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>,
  Building: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>,
  Filter: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
};

// Available Filter Options
const FILTER_LOCATIONS = ["Remote", "Poland", "Ukraine", "Germany", "UK", "USA"];
const FILTER_LEVELS = ["Intern", "Junior", "Middle", "Senior", "Lead"];
const FILTER_SALARIES = [
  { id: "<5k", label: "Under 5,000 PLN", min: 0, max: 5000 },
  { id: "5k-10k", label: "5,000 - 10,000 PLN", min: 5000, max: 10000 },
  { id: "10k-20k", label: "10,000 - 20,000 PLN", min: 10000, max: 20000 },
  { id: "20k+", label: "20,000+ PLN", min: 20000, max: 9999999 }
];

export default function Jobs() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const { user } = useAuth(); 
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set()); 
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedSalaries, setSelectedSalaries] = useState<string[]>([]);

  // Scroll to top state
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobsRes = await api.get("/jobs");
        const data = Array.isArray(jobsRes.data) ? jobsRes.data : (jobsRes.data.jobs || []);
        setJobs(data);

        if (user && user.role === 'candidate') {
          const bookmarksRes = await api.get("/bookmarks");
          const ids = new Set(bookmarksRes.data.map((job: any) => job.id));
          setSavedJobIds(ids as Set<string>);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Listener for scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleBookmark = async (e: React.MouseEvent, jobId: string) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!user) return alert("Please log in as a candidate to save jobs.");
    if (user.role !== 'candidate') return alert("Only candidates can save jobs.");

    try {
      const res = await api.post(`/bookmarks/${jobId}`);
      setSavedJobIds(prev => {
        const newSet = new Set(prev);
        res.data.saved ? newSet.add(jobId) : newSet.delete(jobId);
        return newSet;
      });
    } catch (err) {
      console.error("Error toggling bookmark:", err);
    }
  };

  const toggleFilter = (setState: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setState(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      job.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = selectedLocations.length === 0 || 
      selectedLocations.some(loc => job.location?.toLowerCase().includes(loc.toLowerCase()));

    const matchesLevel = selectedLevels.length === 0 || 
      selectedLevels.some(lvl => {
        const target = lvl.toLowerCase();
        if (job.level) return job.level.toLowerCase() === target;
        return job.title.toLowerCase().includes(target) || (job.tags && job.tags.toString().toLowerCase().includes(target));
      });

    let matchesSalary = selectedSalaries.length === 0;
    if (selectedSalaries.length > 0) {
      matchesSalary = selectedSalaries.some(rangeId => {
        const rangeObj = FILTER_SALARIES.find(r => r.id === rangeId);
        if (!rangeObj) return false;
        return job.salaryTo >= rangeObj.min && job.salaryFrom <= rangeObj.max; 
      });
    }

    return matchesSearch && matchesLocation && matchesLevel && matchesSalary;
  });

  return (
    <div style={{ 
      background: '#050505', 
      width: '100%', 
      minHeight: 'calc(100vh - 70px)', 
      position: 'relative', 
      overflowX: 'clip' // Это скрывает свечения по бокам, но ОСТАВЛЯЕТ рабочим position: sticky
    }}>
      
      {/* Декоративные мягкие свечения на фоне */}
      <div style={{ position: 'absolute', top: '-10%', left: '10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: '30%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', position: 'relative', zIndex: 1 }}>
        
        {/* PAGE HEADER & SEARCH */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px', flexWrap: 'wrap', gap: '30px' }}>
          <div>
            <div style={{ display: 'inline-block', padding: '6px 14px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '12px', fontWeight: '800', marginBottom: '15px', border: '1px solid rgba(16, 185, 129, 0.2)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Find Your Match
            </div>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: '950', margin: '0 0 10px', letterSpacing: '-1.5px', color: '#fff' }}>
              Explore <span style={{ background: 'linear-gradient(90deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Careers</span>
            </h1>
            <p style={{ color: '#888', margin: 0, fontSize: '16px' }}>
              Showing <span style={{ color: '#fff', fontWeight: 700 }}>{filteredJobs.length}</span> opportunities matched for you
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', width: '100%', maxWidth: '500px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input 
                placeholder="Search job title, skills, or company..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', 
                  padding: '18px 20px 18px 55px', color: '#fff', borderRadius: '20px', fontSize: '15px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)', transition: 'border-color 0.2s', outline: 'none'
                }} 
                onFocus={e => e.target.style.borderColor = 'rgba(16, 185, 129, 0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
              <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#10b981', display: 'flex' }}>
                <Icons.Search />
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '50px', alignItems: 'start' }}>
          
          {/* === SIDEBAR FILTERS (Glassmorphism) === */}
          <aside style={{ 
            background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(20px)', 
            border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', 
            padding: '35px 25px', position: 'sticky', top: '100px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icons.Filter /> Filters
              </h4>
              <button 
                onClick={() => {setSearchTerm(""); setSelectedLocations([]); setSelectedLevels([]); setSelectedSalaries([]);}} 
                style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '13px', fontWeight: 700, cursor: 'pointer', padding: 0, transition: 'opacity 0.2s' }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.7'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                Clear All
              </button>
            </div>
            
            {/* Location Filter */}
            <div style={{ marginBottom: '35px' }}>
              <label style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '15px', fontWeight: 800 }}>Location</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {FILTER_LOCATIONS.map(loc => (
                  <label key={loc} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px', color: selectedLocations.includes(loc) ? '#fff' : '#888', transition: 'color 0.2s', fontWeight: selectedLocations.includes(loc) ? 600 : 400 }}>
                    <div style={{ 
                      width: '18px', height: '18px', borderRadius: '6px', border: selectedLocations.includes(loc) ? 'none' : '1px solid #444', 
                      background: selectedLocations.includes(loc) ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                      {selectedLocations.includes(loc) && <span style={{ color: '#000', fontSize: '12px', fontWeight: 'bold' }}>✓</span>}
                    </div>
                    {/* Скрытый нативный чекбокс */}
                    <input type="checkbox" checked={selectedLocations.includes(loc)} onChange={() => toggleFilter(setSelectedLocations, loc)} style={{ display: 'none' }} /> 
                    {loc}
                  </label>
                ))}
              </div>
            </div>

            {/* Experience Filter */}
            <div style={{ marginBottom: '35px' }}>
              <label style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '15px', fontWeight: 800 }}>Experience Level</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {FILTER_LEVELS.map(lv => {
                  const isActive = selectedLevels.includes(lv);
                  return (
                    <button 
                      key={lv} 
                      onClick={() => toggleFilter(setSelectedLevels, lv)} 
                      style={{ 
                        background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)', 
                        border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.08)', 
                        color: isActive ? '#10b981' : '#888', 
                        borderRadius: '12px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' 
                      }}
                      onMouseOver={e => !isActive && (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
                      onMouseOut={e => !isActive && (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                    >
                      {lv}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Salary Filter */}
            <div>
              <label style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '15px', fontWeight: 800 }}>Salary Expectation</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {FILTER_SALARIES.map(r => (
                  <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px', color: selectedSalaries.includes(r.id) ? '#fff' : '#888', transition: 'color 0.2s', fontWeight: selectedSalaries.includes(r.id) ? 600 : 400 }}>
                     <div style={{ 
                      width: '18px', height: '18px', borderRadius: '6px', border: selectedSalaries.includes(r.id) ? 'none' : '1px solid #444', 
                      background: selectedSalaries.includes(r.id) ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                      {selectedSalaries.includes(r.id) && <span style={{ color: '#000', fontSize: '12px', fontWeight: 'bold' }}>✓</span>}
                    </div>
                    <input type="checkbox" checked={selectedSalaries.includes(r.id)} onChange={() => toggleFilter(setSelectedSalaries, r.id)} style={{ display: 'none' }} /> 
                    {r.label}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* === JOBS LIST === */}
          <main style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {filteredJobs.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '32px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px', filter: 'grayscale(1)' }}>📭</div>
                <h3 style={{ margin: '0 0 10px', color: '#fff', fontSize: '24px', fontWeight: 800 }}>No matching roles found</h3>
                <p style={{ color: '#666', margin: 0, fontSize: '15px' }}>Try adjusting your filters or search term to discover more opportunities.</p>
              </div>
            )}

            {filteredJobs.map((job) => {
              const isSaved = savedJobIds.has(job.id);
              
              return (
                <Link to={`/jobs/${job.id}`} key={job.id} style={{ textDecoration: 'none' }}>
                  <div style={{ 
                    background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', 
                    padding: '30px', display: 'flex', gap: '30px', alignItems: 'center', position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', cursor: 'pointer', overflow: 'hidden'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.5), 0 0 20px rgba(16, 185, 129, 0.05)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  >
                    
                    {/* Красивый градиентный блик сбоку при наведении (чистый CSS) */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, #10b981, #3b82f6)', opacity: 0, transition: 'opacity 0.3s' }} className="card-highlight" />

                    {/* Logo */}
                    <div style={{ 
                      width: '80px', height: '80px', minWidth: '80px', borderRadius: '20px', 
                      background: '#000', border: '1px solid #222', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.4)'
                    }}>
                      {job.companyLogo ? (
                        <img 
                          src={job.companyLogo?.startsWith('http') ? job.companyLogo : `${apiUrl}${job.companyLogo}`} 
                          alt="logo" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            if (target.parentElement) target.parentElement.innerHTML = `<span style="font-size: 28px; font-weight: 900; color: #333;">${job.companyName[0].toUpperCase()}</span>`;
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: '32px', fontWeight: 900, color: '#333' }}>{job.companyName[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '22px', color: '#fff', fontWeight: 800, paddingRight: '50px', letterSpacing: '-0.5px' }}>{job.title}</h3>
                        
                        {/* BOOKMARK BUTTON */}
                        {(!user || user.role === 'candidate') && (
                          <button 
                            onClick={(e) => toggleBookmark(e, job.id)}
                            style={{ 
                              position: 'absolute', top: '30px', right: '30px',
                              background: isSaved ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)', 
                              border: isSaved ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.05)',
                              cursor: 'pointer', padding: '10px', borderRadius: '50%',
                              color: isSaved ? '#10b981' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.2s', boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.color = '#10b981';
                                e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.color = isSaved ? '#10b981' : '#888';
                                e.currentTarget.style.borderColor = isSaved ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)';
                            }}
                            title={isSaved ? "Remove from Saved" : "Save Job"}
                          >
                            {isSaved ? <Icons.BookmarkFilled /> : <Icons.BookmarkOutline />}
                          </button>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', marginBottom: '18px' }}>
                        <span style={{ color: '#aaa', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                          <Icons.Building /> {job.companyName}
                        </span>
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#444' }} />
                        <span style={{ color: '#888', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Icons.Location /> {job.location || 'Remote'}
                        </span>
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#444' }} />
                        <span style={{ color: '#10b981', fontWeight: '800', fontSize: '15px' }}>
                          {job.salaryFrom} - {job.salaryTo} PLN
                        </span>
                      </div>

                      {/* Tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {(() => {
                          let t = job.tags;
                          if (typeof t === 'string') t = t.split(',').map((s:any)=>s.trim());
                          if (!Array.isArray(t) || t.length === 0) return null;
                          return t.map((tag: string, idx: number) => (
                            <span key={idx} style={{
                              fontSize: '12px', padding: '6px 14px', borderRadius: '10px',
                              background: '#111', color: '#aaa', border: '1px solid #222', fontWeight: 600, letterSpacing: '0.5px'
                            }}>
                              {tag}
                            </span>
                          ));
                        })()}
                      </div>
                    </div>

                  </div>
                  <style>{`
                    .card-highlight { opacity: 0; }
                    a:hover .card-highlight { opacity: 1 !important; }
                  `}</style>
                </Link>
              );
            })}
          </main>
        </div>
      </div>

      {/* Кнопка "Наверх" (Появляется при скролле) */}
      <button 
        onClick={scrollToTop}
        style={{
          position: 'fixed',
          bottom: '30px',
          left: '30px',
          zIndex: 100,
          width: '45px',
          height: '45px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          opacity: showTopBtn ? 1 : 0,
          visibility: showTopBtn ? 'visible' : 'hidden',
          transform: showTopBtn ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
        }}
        onMouseOver={e => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.transform = 'translateY(-3px)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>

    </div>
  );
}