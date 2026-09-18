import styles from "./CandidateCard.module.css";
import type { useJobManagement } from '../../hooks/useJobManagement';
import type { Application } from '../../types/job';
import { Link } from "react-router-dom";

const Icons = {
  Mail: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>,
  File: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>,
  Check: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>,
  X: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>,
  ChevronDown: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>,
  ChevronUp: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"></path></svg>,
  User: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
};

export default function CandidateCard({ app, isExpanded, toggleExpand, handleUpdateStatus, apiUrl }: Pick<ReturnType<typeof useJobManagement>, 'toggleExpand' | 'handleUpdateStatus' | 'apiUrl'> & { app: Application; isExpanded: boolean }) {


  return (
    <div className={styles.card} data-status={app.status} data-expanded={isExpanded}>

      <div className={styles.header}>

        <div className={styles.identity}>
          <div className={styles.avatar}>
            {app.candidate.avatarUrl ? (
              <img src={app.candidate.avatarUrl.startsWith('http') ? app.candidate.avatarUrl : `${apiUrl}${app.candidate.avatarUrl}`} className={styles.avatarImage} alt="avatar" />
            ) : (
              (app.candidate.firstName?.[0] || app.candidate.email?.[0] || "?").toUpperCase()
            )}
          </div>

          <div className={styles.info}>
            <div className={styles.nameRow}>
              <h3 className={styles.name}>
                {app.candidate.firstName} {app.candidate.lastName}
              </h3>
              <span className={styles.status}>
                {app.status}
              </span>
            </div>
            <div className={styles.metadata}>
              <span className={styles.email}><Icons.Mail /> {app.candidate.email}</span>
              <span className="hidden-mobile">•</span>
              <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>

          <Link to={`/candidate/${app.candidate.id}`} className={styles.profileLink} >
            <Icons.User /> Profile
          </Link>

          <button aria-expanded={isExpanded} onClick={() => toggleExpand(app.id)} className={styles.expandButton} >
            {isExpanded ? "Hide Details" : "View CV"}
            {isExpanded ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
          </button>

          {app.status !== 'rejected' && app.status !== 'invited' && (
             <>
               {app.status === 'new' && (
                 <button onClick={() => handleUpdateStatus(app.id, 'reviewed')} className={styles.reviewButton} title="Mark as Reviewed">
                   <Icons.Check /> Review
                 </button>
               )}
               <button onClick={() => handleUpdateStatus(app.id, 'rejected')} className={styles.declineButton} title="Decline Candidate">
                 <Icons.X /> Decline
               </button>
             </>
          )}

          {app.status === 'reviewed' && (
            <button onClick={() => handleUpdateStatus(app.id, 'invited')} className={styles.inviteButton}>
              Invite to Interview
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className={styles.expandedContent}>
          <div className={styles.details}>

            <div>
              <h4 className={styles.sectionTitle}>Motivation Letter</h4>
              {app.coverLetter ? (
                <div className={styles.letter}>
                  {app.coverLetter}
                </div>
              ) : (
                <div className={styles.emptyLetter}>No motivation letter provided.</div>
              )}
            </div>

            <div>
              <h4 className={styles.sectionTitle}>Documents & Contact</h4>
              <div className={styles.documents}>
                <button
                  onClick={() => window.open(app.cvUrl?.startsWith('http') ? app.cvUrl : `${apiUrl}${app.cvUrl}`, '_blank')}
                  disabled={!app.cvUrl}
                  className={styles.resumeButton}


                >
                  <Icons.File /> {app.cvUrl ? "View Resume / CV" : "No CV Uploaded"}
                </button>

                <div className={styles.contact}>
                  <div className={styles.phoneLabel}>Phone Number:</div>
                  <div className={styles.phone}>{app.candidate.phone || "Not provided"}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}