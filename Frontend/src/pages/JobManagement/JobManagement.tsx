import { Link } from "react-router-dom";
import { useJobManagement } from "../../hooks/useJobManagement";
import CandidateCard from "../../components/employer/CandidateCard";

import styles from "./JobManagement.module.css";

const Icons = {
  Back: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
};

export default function JobManagement() {
  const {
    job, applications, loading, filter, setFilter, apiUrl,
    filteredApps, expandedAppId, toggleExpand, handleUpdateStatus
  } = useJobManagement();

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!job) return <div className={styles.loading}>Job not found</div>;

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <Link to="/employer" className={styles.backLink}>
          <Icons.Back /> Back to Dashboard
        </Link>
        <div className={styles.heading}>
          <div>
            <h1 className={styles.title}>{job.title}</h1>
            <div className={styles.metadata}>
              <span className={styles.company}>{job.companyName}</span>
              <span className="hidden-mobile">•</span>
              <span className={styles.count}>
                {applications.length} Candidate{applications.length !== 1 && 's'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        {(['all', 'new', 'reviewed', 'invited', 'rejected'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={styles.filterButton} aria-pressed={filter === f}
          >
            {f}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {filteredApps.length === 0 ? (
          <div className={styles.emptyState}>
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
              apiUrl={apiUrl}
            />
          ))
        )}
      </div>
    </div>
  );
}