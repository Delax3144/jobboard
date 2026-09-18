import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { useJobs } from "../../hooks/useJobs";
import JobsFilters from "../../components/jobs/JobsFilters";
import LoadError from "../../components/LoadError";

import styles from "./Jobs.module.css";

const Icons = {
  Search: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  BookmarkOutline: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>,
  BookmarkFilled: () => <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>,
  Location: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Building: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Filter: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
  Close: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
};

function CompanyLogo({ src, name }: { src?: string; name: string }) {
  const [failedSrc, setFailedSrc] = useState<string>();
  return src && src !== failedSrc
    ? <img src={src} alt={name} className={styles.logoImage} onError={() => setFailedSrc(src)} />
    : <span className={styles.logoFallback}>{name[0]?.toUpperCase()}</span>;
}

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
    <div className={styles.page}>

      <div className={styles.greenGlow} />
      <div className={styles.blueGlow} />

      <div className={`container ${styles.container}`}>

        <div className={styles.header}>
          <div>
            <div className={styles.eyebrow}>Find Your Match</div>
            <h1 className={styles.title}>
              Explore <span className={styles.titleGradient}>Careers</span>
            </h1>
            {!data.error && !data.loading && <p className={styles.summary}>Showing <span className={styles.count}>{list.filteredJobs.length}</span> opportunities</p>}
          </div>

          <div className={styles.searchGroup}>
            <div className={styles.searchField}>
              <input
                aria-label="Search jobs" placeholder="Search job title, skills, or company..." value={filters.searchTerm} onChange={(e) => filters.setSearchTerm(e.target.value)}
                className={styles.searchInput}

              />
              <span className={styles.searchIcon}><Icons.Search /></span>
            </div>
            <button aria-label="Open filters" aria-expanded={isFilterModalOpen} onClick={() => setIsFilterModalOpen(true)} className={styles.filterTrigger}><Icons.Filter /></button>
          </div>
        </div>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <JobsFilters filters={filters} />
          </aside>

          <main className={styles.results}>
            {data.error && <LoadError message={data.error} loading={data.loading} onRetry={data.retry} />}
            {data.loading && !data.error && <p role="status" className={styles.loading}>Loading jobs...</p>}
            {list.filteredJobs.length === 0 && !data.loading && !data.error && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📭</div>
                <h3 className={styles.emptyTitle}>No matching roles found</h3>
                <p className={styles.emptyDescription}>Try adjusting your filters or search term to discover more opportunities.</p>
              </div>
            )}

            {!data.error && list.filteredJobs.map((job) => {
              const isSaved = data.savedJobIds.has(job.id);

              return (
                <Link to={`/jobs/${job.id}`} key={job.id} className={styles.jobLink}>
                  <div className={styles.jobCard}>
                    <div className={styles.highlight} />

                    <div className={styles.logo}>
                      <CompanyLogo src={job.companyLogo ? (job.companyLogo.startsWith("http") ? job.companyLogo : `${apiUrl}${job.companyLogo}`) : undefined} name={job.companyName} />
                    </div>

                    <div className={styles.jobContent}>
                      <div className={styles.jobHeading}>
                        <h3 className={styles.jobTitle}>{job.title}</h3>
                        {(!data.user || data.user.role === 'candidate') && (
                          <button aria-label={`${isSaved ? "Unsave" : "Save"} ${job.title}`} aria-pressed={isSaved} onClick={(e) => list.toggleBookmark(e, job.id)} className={styles.bookmark}>
                            {isSaved ? <Icons.BookmarkFilled /> : <Icons.BookmarkOutline />}
                          </button>
                        )}
                      </div>

                      <div className={styles.metadata}>
                        <span className={styles.company}><Icons.Building /> {job.companyName}</span>
                        <span className={`hidden-mobile ${styles.separator}`} />
                        <span className={styles.location}><Icons.Location /> {job.location || 'Remote'}</span>
                        <span className={`hidden-mobile ${styles.separator}`} />
                        <span className={styles.salary}>{job.salaryFrom.toLocaleString()} - {job.salaryTo.toLocaleString()} PLN</span>
                      </div>

                      <div className={styles.tags}>
                        {(() => {
                          const tagsData = job.tags;
                          const tagsArray = typeof tagsData === 'string' ? tagsData.split(',').map(s => s.trim()) : tagsData;

                          if (!Array.isArray(tagsArray) || tagsArray.length === 0) return null;

                          return tagsArray.map((tag: string, idx: number) => (
                            <span key={idx} className={styles.tag}>
                              {tag}
                            </span>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>

                </Link>
              );
            })}
          </main>
        </div>
      </div>

      <button aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className={styles.backToTop} data-visible={showTopBtn}>
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
      </button>

      {isFilterModalOpen && document.body && createPortal(
        <div className={`premium-scroll ${styles.filterModal}`}>
          <div className={styles.modalHeader}>
            <button aria-label="Close filters" onClick={() => setIsFilterModalOpen(false)} className={styles.closeFilters}><Icons.Close /></button>
          </div>
          <div className={styles.modalContent}><JobsFilters filters={filters} /></div>
          <button onClick={() => setIsFilterModalOpen(false)} className={styles.applyFilters}>
            Apply Filters ({list.filteredJobs.length} Jobs)
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
