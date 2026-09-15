import { Link } from "react-router-dom";
import styles from "./Blog.module.css";

export default function Blog() {
  return (
    <div className={styles.page}>
      <div aria-hidden="true" className={styles.glow} />

      <div className={styles.content}>
        <header className={styles.hero}>
          <h1 className={styles.title}>
            Blog <span className={styles.accent}>&amp; News</span>
          </h1>
          <p className={styles.subtitle}>Updates from JobBoard.</p>
        </header>

        <section aria-labelledby="blog-empty-heading" className={styles.emptyState}>
          <svg aria-hidden="true" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 3h12l4 4v14H4V3Z M16 3v5h4 M8 12h8 M8 16h6" />
          </svg>
          <h2 id="blog-empty-heading" className={styles.emptyTitle}>No articles published yet</h2>
          <p className={styles.emptyDescription}>You can explore current vacancies or get in touch with us using the links below.</p>
          <div className={styles.actions}>
            <Link to="/jobs" className={styles.jobsLink}>Browse jobs</Link>
            <Link to="/contact" className={styles.contactLink}>Contact us</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
