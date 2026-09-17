import { Link } from "react-router-dom";
import { useForgotPassword } from "../../hooks/useForgotPassword";
import styles from "./ForgotPassword.module.css";

const Icons = {
  ArrowLeft: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Mail: () => <svg width="48" height="48" fill="none" stroke="#10b981" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Key: () => <svg width="48" height="48" fill="none" stroke="#10b981" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
};

export default function ForgotPassword() {
  const { email, setEmail, status, setStatus, errorMsg, handleSubmit } = useForgotPassword();

  return (
    <div className={styles.page}>

      <div className={styles.greenGlow} />
      <div className={styles.blueGlow} />

      <div className={styles.container}>
        <div className={styles.card}>

          {status === "success" ? (
            <div className={styles.success}>
              <div className={styles.iconRow}><div className={styles.successIcon}><Icons.Mail /></div></div>
              <h2 className={styles.successTitle}>Check your email</h2>
              <p className={styles.successDescription}>We've sent a password reset link to <b>{email}</b>. Please check your inbox and spam folder.</p>
              <button onClick={() => setStatus("typing")} className={styles.retryButton}>Try another email</button>
            </div>
          ) : (
            <div className={styles.formContent}>
              <div className={styles.iconRow}><div className={styles.keyIcon}><Icons.Key /></div></div>
              <h1 className={styles.title}>Forgot Password?</h1>
              <p className={styles.description}>No worries, we'll send you reset instructions.</p>

              {status === "error" && <div role="alert" className={styles.error}>{errorMsg}</div>}

              <form onSubmit={handleSubmit}>
                <div className={styles.field}>
                  <label htmlFor="reset-email" className={styles.label}>Email Address</label>
                  <input id="reset-email" autoComplete="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" className={styles.input}   />
                </div>
                <button type="submit" disabled={status === "loading"} className={styles.submit}>
                  {status === "loading" ? "Sending Link..." : "Send Reset Link"}
                </button>
              </form>
            </div>
          )}

          <div className={styles.footer}>
            <Link to="/login" className={styles.backLink}><Icons.ArrowLeft /> Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}