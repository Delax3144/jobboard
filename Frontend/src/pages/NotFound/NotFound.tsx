import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";

export default function NotFound() {
  return (
    <div className={styles.page}>

      <div className={styles.greenGlow} />
      <div className={styles.blueGlow} />

      <div className={styles.content}>

        <h1 className={styles.code}>
          404
        </h1>

        <h2 className={styles.title}>
          Page not found
        </h2>

        <p className={styles.description}>
          This page doesn't exist. Return to the home page or browse available vacancies.
        </p>

        <div className={styles.actions}>
          <Link to="/" className={styles.homeLink}>
            ← Back to Home
          </Link>

          <Link to="/jobs" className={styles.jobsLink}>
            Browse Jobs →
          </Link>
        </div>

      </div>
    </div>
  );
}
