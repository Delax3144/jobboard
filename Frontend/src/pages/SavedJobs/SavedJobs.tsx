import type { Job } from '../../types/job';
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { useAuth } from "../../context/useAuth";
import LoadError from "../../components/LoadError";

import styles from "./SavedJobs.module.css";

const Icons = {
  Location: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>,
  Building: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>,
  Wallet: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>,
  HeartSolid: () => <svg width="20" height="20" fill="#ef4444" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>,
  BookmarkSlash: () => <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18"></path></svg>,
  ArrowRight: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path></svg>
};

export default function SavedJobs() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState<(Job & { savedAt: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removalError, setRemovalError] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const pendingRemovals = useRef(new Set<string>());

  const fetchSavedJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/bookmarks");
      setSavedJobs(res.data);
      setError(null);
    } catch {
      setError("Couldn't load your saved jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'candidate') {
      fetchSavedJobs();
    }
  }, [user]);

  const removeBookmark = async (e: React.MouseEvent, jobId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (pendingRemovals.current.has(jobId)) return;
    pendingRemovals.current.add(jobId);
    setRemovingIds(new Set(pendingRemovals.current));
    setRemovalError(null);

    try {
      await api.post(`/bookmarks/${jobId}`);
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
    } catch {
      setRemovalError("Couldn't remove this job. Please try again.");
    } finally {
      pendingRemovals.current.delete(jobId);
      setRemovingIds(new Set(pendingRemovals.current));
    }
  };

  if (!user || user.role !== 'candidate') {
    return <div className={styles.denied}>Access Denied</div>;
  }

  return (
    <div className={styles.page}>

      {/* Декоративные свечения */}
      <div className={styles.greenGlow} />
      <div className={styles.blueGlow} />

      {/* Контейнер ленты */}
      <div className={`container ${styles.container}`}>

        {/* === ШАПКА === */}
        <header className={styles.header}>
          <div className={styles.eyebrow}>
            Your Collection
          </div>
          <h1 className={styles.title}>
            Saved <span className={styles.titleGradient}>Opportunities</span>
          </h1>
          <p className={styles.subtitle}>
            {savedJobs.length > 0
              ? `You have ${savedJobs.length} bookmarked ${savedJobs.length === 1 ? 'job' : 'jobs'} saved for later.`
              : "Keep track of the jobs you're interested in."}
          </p>
        </header>

        {removalError && <p role="alert" className={styles.removalError}>{removalError}</p>}
        {error ? <LoadError message={error} loading={loading} onRetry={fetchSavedJobs} /> : loading ? (
          <div className={styles.loading}>Loading your bookmarks...</div>
        ) : (
          <div className={styles.list}>

            {savedJobs.map((job) => (
              <Link to={`/jobs/${job.id}`} key={job.id} className={styles.jobCard}>

                {/* ЛЕВАЯ ЧАСТЬ: Логотип и Описание */}
                <div className={styles.jobInfo}>
                  <div className={styles.logo}>
                    {job.companyLogo ? (
                      <img
                        src={job.companyLogo?.startsWith('http') ? job.companyLogo : `${apiUrl}${job.companyLogo}`}
                        alt="logo" className={styles.logoImage}
                      />
                    ) : (
                      job.companyName[0].toUpperCase()
                    )}
                  </div>

                  <div className={styles.jobContent}>
                    <h3 className={styles.jobTitle}>
                      {job.title}
                    </h3>

                    <div className={styles.metadata}>
                      <span className={styles.company}>
                        <Icons.Building /> {job.companyName}
                      </span>
                      <span className={`hidden-mobile ${styles.separator}`} />
                      <span className={styles.location}>
                        <Icons.Location /> {job.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ПРАВАЯ ЧАСТЬ: Зарплата и Кнопка */}
                <div className={styles.rightSide}>
                  <div className={styles.salaryBlock} >
                    <div className={styles.salary}>
                      <Icons.Wallet /> {job.salaryFrom.toLocaleString()} - {job.salaryTo.toLocaleString()} PLN
                    </div>
                  </div>

                  <div className={styles.actions}>
                    <button
                      onClick={(e) => removeBookmark(e, job.id)}
                      className={styles.removeButton}
                      disabled={removingIds.has(job.id)}
                      aria-label={`Remove ${job.title} from Saved`}
                      title="Remove from Saved"
                    >
                      <Icons.HeartSolid />
                    </button>
                    <div className={`hidden-mobile ${styles.arrow}`} ><Icons.ArrowRight /></div>
                  </div>
                </div>

              </Link>
            ))}

            {/* EMPTY STATE */}
            {savedJobs.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}><Icons.BookmarkSlash /></div>
                <h3 className={styles.emptyTitle}>No saved jobs yet</h3>
                <p className={styles.emptyDescription}>Click the heart icon on any job posting to save it here for later review.</p>
                <Link to="/jobs" className={styles.exploreLink} >
                  Explore Jobs
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
