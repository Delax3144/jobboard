import { Link } from "react-router-dom";
import { useJobDetails } from "../../hooks/useJobDetails";
import ApplyModal from "../../components/jobs/ApplyModal";
import DOMPurify from "dompurify";

import styles from "./JobDetails.module.css";

const Icons = {
  ArrowLeft: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Location: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Building: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Wallet: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
  Zap: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Clock: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Heart: ({ filled }: { filled: boolean }) => <svg width="20" height="20" fill={filled ? "#ef4444" : "none"} stroke={filled ? "#ef4444" : "currentColor"} strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
};

export default function JobDetails() {
  const { job, isLoading, apiUrl, user, modal, bookmarks } = useJobDetails();

  if (isLoading) return <div className={styles.loading}>Loading job details...</div>;
  if (!job) return <div className={styles.notFound}><h1>Job not found</h1><Link to="/jobs" className={styles.searchLink}>← Back to Search</Link></div>;

  const sanitizedDescription = DOMPurify.sanitize(job.description ?? "", {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "blockquote",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "a",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });

  return (
    <div className={styles.page}>

      <div className={styles.greenGlow} />
      <div className={styles.blueGlow} />

      <div className={styles.container}>

        <div className={styles.navigation}>
          <button onClick={() => window.history.back()} className={styles.backButton}>
            <Icons.ArrowLeft /> Back to Search
          </button>

          {user?.role === 'candidate' && (
            <button
              onClick={bookmarks.toggleBookmark}
              disabled={bookmarks.isSaving}
              className={styles.bookmark} aria-pressed={bookmarks.isBookmarked}
            >
              <Icons.Heart filled={bookmarks.isBookmarked} />
              {bookmarks.isBookmarked ? "Saved" : "Save Job"}
            </button>
          )}
        </div>

        <div className={styles.hero}>
          <div className={styles.logo}>
            {job.companyLogo ? (
              <img src={job.companyLogo?.startsWith('http') ? job.companyLogo : `${apiUrl}${job.companyLogo}`} alt="logo" className={styles.logoImage} />
            ) : (
              <span className={styles.logoFallback}>{job.companyName[0]}</span>
            )}
          </div>

          <div className={styles.heroContent}>
            <div className={styles.statusRow}>
              <span className={styles.status} data-published={job.status === "published"}>
                {job.status === "published" ? "Actively Hiring" : job.status}
              </span>
              <span className={styles.posted}>
                <Icons.Clock /> Posted {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className={styles.title}>
              {job.title}
            </h1>
            <div className={styles.metadata}>
              <span className={styles.company}><Icons.Building /> {job.companyName}</span>
              <span className={styles.detail}><Icons.Location /> {job.location || 'Remote'}</span>
              <span className={styles.detail}><Icons.Zap /> {job.level}</span>
            </div>
          </div>
        </div>

        <div className={styles.content}>

          <div className={styles.descriptionColumn}>
            <div className={styles.skills}>
              <h3 className={styles.skillsTitle}>Tech Stack & Skills</h3>
              <div className={styles.tags}>
                {job.tags && job.tags.split(',').map(t => t.trim()).filter(t => t !== "").map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className={styles.descriptionTitle}>Job Description</h3>
              <div className={styles.description} dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.salaryCard}>
              <div className={styles.salaryIcon}><Icons.Wallet /></div>
              <div className={styles.salaryLabel}>Estimated Salary</div>
              <div className={styles.salary}>
                {job.salaryFrom.toLocaleString()} - {job.salaryTo.toLocaleString()}
              </div>
              <div className={styles.salaryPeriod}>PLN / month (B2B or Gross)</div>

              <button
                onClick={() => { modal.setIsSent(false); modal.setIsModalOpen(true); }}
                className={styles.applyButton}
              >
                Apply Now ⚡
              </button>

              <div className={styles.responseTime}>
                Average response time: 2 days
              </div>
            </div>

            {user?.role === 'candidate' && (
              <div className={styles.saveCard}>
                 <h4 className={styles.saveTitle}>Not ready to apply?</h4>
                 <p className={styles.saveDescription}>Save this job to your bookmarks and come back to it later.</p>

                 <button
                  onClick={bookmarks.toggleBookmark}
                  disabled={bookmarks.isSaving}
                  className={styles.saveButton} aria-pressed={bookmarks.isBookmarked}
                 >
                   <Icons.Heart filled={bookmarks.isBookmarked} /> {bookmarks.isBookmarked ? "Remove from Saved" : "Save this Job"}
                 </button>

                 {bookmarks.isBookmarked && (
                   <Link to="/saved" className={styles.savedLink}>
                     View Saved Jobs →
                   </Link>
                 )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ApplyModal
        isOpen={modal.isModalOpen}
        onClose={() => modal.setIsModalOpen(false)}
        isSent={modal.isSent}
        setIsSent={modal.setIsSent}
        job={job}
      />

    </div>
  );
}
