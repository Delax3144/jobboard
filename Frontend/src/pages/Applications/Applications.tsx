import { Link } from "react-router-dom";
import { useApplications } from "../../hooks/useApplications";
import ApplicationCard from "../../components/candidate/ApplicationCard";
import LoadError from "../../components/LoadError";

import styles from "./Applications.module.css";

const Icons = {
  Briefcase: () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Clock: () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  CheckCircle: () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Search: () => <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
};

export default function Applications() {
  const { apps, isLoading, error, retry, stats } = useApplications();

  if (isLoading && !error) return <div role="status" className={styles.loading}>Loading Dashboard...</div>;

  return (
    <div className={styles.page}>

      <div className={styles.greenGlow} />
      <div className={styles.blueGlow} />

      <div className={styles.container}>

        <header className={styles.header}>
          <div className={styles.eyebrow}>
            Candidate Dashboard
          </div>
          <h1 className={styles.title}>
            My <span className={styles.titleGradient}>Applications</span>
          </h1>
        </header>

        {!error && apps.length > 0 && (
          <div className={styles.statsGrid}>
            <div className={styles.totalCard}>
              <div className={styles.totalIcon}><Icons.Briefcase /></div>
              <div className={styles.statValue}>{stats.total}</div>
              <div className={styles.totalLabel}>Total Applied</div>
            </div>

            <div className={styles.interviewCard}>
              <div className={styles.interviewIcon}><Icons.CheckCircle /></div>
              <div className={styles.statValue}>{stats.invited}</div>
              <div className={styles.interviewLabel}>Interviews</div>
            </div>

            <div className={styles.pendingCard}>
              <div className={styles.pendingIcon}><Icons.Clock /></div>
              <div className={styles.statValue}>{stats.pending}</div>
              <div className={styles.pendingLabel}>Under Review</div>
            </div>
          </div>
        )}

        {error ? <LoadError message={error} loading={isLoading} onRetry={retry} /> : apps.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><Icons.Search /></div>
            <h3 className={styles.emptyTitle}>No applications yet</h3>
            <p className={styles.emptyDescription}>You haven't applied to any jobs. Start exploring opportunities and make your next career move.</p>
            <Link to="/jobs" className={styles.exploreLink} >
              Explore Jobs
            </Link>
          </div>
        ) : (
          <div className={styles.list}>
            {apps.map((app) => (
              <ApplicationCard key={app.id} app={app} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
