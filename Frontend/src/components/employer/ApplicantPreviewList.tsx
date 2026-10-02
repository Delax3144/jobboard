import { Link } from 'react-router-dom';
import type { EmployerJob } from '../../hooks/useEmployerJobs';
import styles from './ApplicantPreviewList.module.css';

const statusLabels = { new: 'New', reviewed: 'Reviewed', invited: 'Interview', rejected: 'Declined' };

export default function ApplicantPreviewList({ job }: { job: EmployerJob }) {
  return (
    <section className={styles.section} aria-label={`Recent applicants for ${job.title}`}>
      <div className={styles.heading}>
        <span>Recent applicants</span>
        <Link to={`/employer/job/${job.id}`}>View all {job.totalApplicants}</Link>
      </div>
      {job.applicantPreviews.length === 0 ? (
        <p className={styles.empty}>Applications will appear here when candidates apply.</p>
      ) : (
        <ul className={styles.list}>
          {job.applicantPreviews.map(app => {
            const name = `${app.candidate.firstName ?? ''} ${app.candidate.lastName ?? ''}`.trim() || app.candidate.email;
            return (
              <li key={app.id} className={styles.row}>
                <span className={styles.avatar} aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
                <Link className={styles.name} to={`/candidate/${app.candidate.id}`}>{name}</Link>
                <span className={styles.status} data-status={app.status}>{statusLabels[app.status]}</span>
                <time className={styles.date} dateTime={app.createdAt}>{new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
