import { Link } from "react-router-dom";
import { useApplicationDetails } from "../../hooks/useApplicationDetails";

import styles from "./ApplicationDetails.module.css";

const Icons = {
  ArrowLeft: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Building: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Wallet: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
  Quote: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  FileText: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Message: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  Lock: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
};

export default function ApplicationDetails() {
  const { app, loading, navigate, apiUrl, isInvited, isRejected, canChat } = useApplicationDetails();

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!app) return <div className={styles.loading}>Application not found.</div>;

  let statusText = 'Under Review';

  if (isInvited) {
    statusText = 'Interview / Invited';
  } else if (isRejected) {
    statusText = 'Application Declined';
  }

  return (
    <div className={styles.page} data-status={isInvited ? "invited" : isRejected ? "rejected" : "pending"}>

      <div className={styles.greenGlow} />
      <div className={styles.blueGlow} />

      <div className={styles.container}>

        <button onClick={() => navigate('/applications')} className={styles.backButton} >
          <Icons.ArrowLeft /> Back to Dashboard
        </button>

        <div className={styles.content}>

          <div className={styles.hero}>

            <div className={styles.header}>
              <div className={styles.titleGroup}>
                <div className={styles.logo}>
                  {app.job.companyLogo ? (
                    <img src={app.job.companyLogo?.startsWith('http') ? app.job.companyLogo : `${apiUrl}${app.job.companyLogo}`} className={styles.logoImage} alt="Company Logo" />
                  ) : (
                    app.job.companyName[0].toUpperCase()
                  )}
                </div>
                <div>
                  <h1 className={styles.title}>{app.job.title}</h1>
                  <div className={styles.metadata}>
                    <span className={styles.company}><Icons.Building /> {app.job.companyName}</span>
                    <span className={styles.salary}><Icons.Wallet /> {app.job.salaryFrom.toLocaleString()} - {app.job.salaryTo.toLocaleString()} PLN</span>
                  </div>
                </div>
              </div>

              <div className={styles.statusWrapper}>
                <div className={styles.status}>
                  <span className={styles.statusDot} />
                  {statusText}
                </div>
                <div className={styles.appliedDate}>
                  Applied on {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.actions}>
              <p className={styles.message}>
                {isInvited ? 'The hiring team wants to connect! Open the chat to respond.' : (isRejected ? 'Unfortunately, this application was not successful.' : 'Your profile and application are currently being evaluated.')}
              </p>
              <Link to={`/jobs/${app.job.id}`} className={styles.jobLink} >
                View Original Job Post
              </Link>
            </div>
          </div>

          <div className={styles.detailsGrid}>

            <div className={styles.pitchCard}>
              <div className={styles.pitchHeading}>
                <Icons.Quote />
                <h3 className={styles.sectionTitle}>Your Motivation Pitch</h3>
              </div>
              <p className={styles.pitch} data-filled={Boolean(app.coverLetter)}>
                {app.coverLetter || "No pitch provided. You applied using your profile only."}
              </p>
            </div>

            <div className={styles.sidebar}>

              <div className={styles.documentsCard}>
                <div className={styles.documentsLabel}>Attached Documents</div>
                <div className={styles.document}>
                  <div className={styles.documentInfo}>
                    <div className={styles.documentIcon}><Icons.FileText /></div>
                    <div className={styles.documentName}>{app.cvUrl ? "Resume_CV.pdf" : "Platform Profile"}</div>
                  </div>
                  {app.cvUrl && (
                    <a href={app.cvUrl?.startsWith('http') ? app.cvUrl : `${apiUrl}${app.cvUrl}`} target="_blank" rel="noreferrer" className={styles.documentLink}>View</a>
                  )}
                </div>
              </div>

              <div className={styles.chatCard} data-enabled={canChat}>
                {canChat ? (
                  <>
                    <h4 className={styles.chatTitle}>Start Conversation</h4>
                    <p className={styles.chatDescription}>The employer has enabled the chat. You can now message them directly.</p>
                    <button
                      onClick={() => navigate(`/messages/${app.id}`)}
                      className={styles.chatButton}

                    >
                      <Icons.Message /> Open Messages
                    </button>
                  </>
                ) : (
                  <>
                    <div className={styles.lockIcon}>
                      <Icons.Lock />
                    </div>
                    <h4 className={styles.lockedTitle}>Chat is Locked</h4>
                    <p className={styles.lockedDescription}>Messaging will be unlocked automatically if the employer decides to proceed with your application.</p>
                  </>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}