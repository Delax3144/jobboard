import { Link } from "react-router-dom";
import type { Application } from '../../types/job';

import styles from "./ApplicationCard.module.css";

const Icons = {
  ArrowRight: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
};

export default function ApplicationCard({ app }: { app: Application }) {
  const hasUpdate = app.hasUpdate === true;
  const isInvited = app.status === 'invited';
  const isRejected = app.status === 'rejected';
  
  const statusLabel = isInvited ? 'Interview' : isRejected ? 'Declined' : 'Under Review';

  return (
    <Link 
      to={`/applications/${app.id}`} 
      className={styles.card}
      data-status={app.status}
    >
      {hasUpdate && (
        <div className={styles.updateIndicator}>
          <div className={styles.updateDot} />
        </div>
      )}

      <div className={styles.identity}>
        <div className={styles.logo}>
          {app.job?.companyLogo ? <img src={app.job.companyLogo} className={styles.logoImage} alt="Logo" /> : app.job?.companyName?.charAt(0).toUpperCase()}
        </div>
        <div className={styles.details}>
          <h3 className={styles.title}>
            {app.job?.title}
          </h3>
          <div className={styles.company}>
            {app.job?.companyName}
          </div>
        </div>
      </div>

      <div className={styles.summary}>
        <div className={styles.statusInfo}>
          <div className={styles.statusBadge}>
            <span className={styles.statusDot} />
            {statusLabel}
          </div>
          <div className={styles.date}>
            {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>

        <div className={styles.arrow}>
          <Icons.ArrowRight />
        </div>
      </div>
    </Link>
  );
}
