import styles from "./ApplyModal.module.css";
import type { Job } from '../../types/job';
import { createPortal } from "react-dom";
import ApplyForm from "../ApplyForm";

const Icons = {
  Check: () => <svg width="48" height="48" fill="none" stroke="#10b981" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Close: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
};

export default function ApplyModal({ isOpen, onClose, isSent, setIsSent, job }: { isOpen: boolean; onClose: () => void; isSent: boolean; setIsSent: (value: boolean) => void; job: Job }) {
  if (!isOpen || !document.body) return null;

  return createPortal(
    <div className={styles.overlay}>
      
      <div onClick={onClose} className={styles.backdrop} />
      
      <div className={styles.panel}>
        
        <button type="button" aria-label="Close application" onClick={onClose} className={styles.closeButton} >
          <Icons.Close />
        </button>

        {isSent ? (
          <div className={styles.success}>
            <div className={styles.iconRow}>
              <div className={styles.successIcon}>
                <Icons.Check />
              </div>
            </div>
            <h2 className={styles.successTitle}>Application Sent!</h2>
            <p className={styles.successDescription}>
              Your profile and cover letter have been sent to <strong>{job.companyName}</strong>. You can track the status in your Candidate Dashboard.
            </p>
            <button onClick={onClose} className={styles.doneButton}>
              Awesome, thanks!
            </button>
          </div>
        ) : (
          <div>
            <h2 className={styles.title}>Submit Application</h2>
            <p className={styles.description}>Applying for <strong className={styles.jobTitle}>{job.title}</strong> at {job.companyName}</p>
            <ApplyForm jobId={job.id} jobTitle={job.title} onSuccess={() => setIsSent(true)} />
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}