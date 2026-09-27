import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        <div className={styles.layout}>

          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              Job<span className={styles.accent}>Board</span>
            </Link>
            <p className={styles.description}>
              Find tech vacancies, track applications, and keep conversations with employers in one place.
            </p>

          </div>

          <div className={styles.navigation}>
            <div className={styles.column}>
              <b className={styles.heading}>Platform</b>
              <Link to="/jobs" className={styles.link}>Browse Jobs</Link>
              <Link to="/applications" className={styles.link}>My Applications</Link>
              <Link to="/saved" className={styles.link}>Saved Jobs</Link>
            </div>

            <div className={styles.column}>
              <b className={styles.heading}>Company</b>
              <Link to="/about" className={styles.link}>About Us</Link>
              <Link to="/contact" className={styles.link}>Contact Support</Link>
              <Link to="/blog" className={styles.link}>Blog & News</Link>
            </div>

            <div className={styles.column}>
              <b className={styles.heading}>Legal</b>
              <Link to="/privacy" className={styles.link}>Privacy Policy</Link>
              <Link to="/terms" className={styles.link}>Terms of Service</Link>
              <Link to="/cookies" className={styles.link}>Cookie Policy</Link>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.copyright}>
            © {new Date().getFullYear()} JobBoard. All rights reserved.
          </div>

        </div>

      </div>

    </footer>
  );
}
