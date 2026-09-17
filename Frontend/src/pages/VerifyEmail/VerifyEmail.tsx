import { Link } from "react-router-dom";
import { useVerifyEmail } from "../../hooks/useVerifyEmail";
import styles from "./VerifyEmail.module.css";

const Icons = {
  Check: () => <svg width="48" height="48" fill="none" stroke="#10b981" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  X: () => <svg width="48" height="48" fill="none" stroke="#ff4b4b" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

export default function VerifyEmail() {
  const { status, email, setEmail, resendStatus, setResendStatus, resendError, handleResend } = useVerifyEmail();

  return (
    <div className={styles.page}>
      <div className={styles.glow} />

      <div className={styles.container}>
        <div className={styles.card}>

          {status === "loading" && (
            <div className={styles.loading}>Verifying your email...</div>
          )}

          {status === "success" && (
            <div className={styles.result}>
              <div className={styles.iconRow}><div className={styles.successIcon}><Icons.Check /></div></div>
              <h2 className={styles.title}>Email Verified!</h2>
              <p className={styles.successDescription}>Your account is now fully active. You can log in and start exploring JobBoard.</p>
              <Link to="/login" className={styles.loginButton}>Go to Login</Link>
            </div>
          )}

          {status === "error" && (
            <div className={styles.result}>
              <div className={styles.iconRow}><div className={styles.errorIcon}><Icons.X /></div></div>
              <h2 className={styles.title}>Verification Failed</h2>
              <p className={styles.errorDescription}>We couldn't verify this link. It may be invalid or expired. Enter your account email to request a new link.</p>
              {resendStatus === 'success' ? (
                <>
                  <p role="status" className={styles.resendSuccess}>If an unverified account with that email exists, a verification link has been sent. Check your inbox and spam folder.</p>
                  <button type="button" onClick={() => setResendStatus('idle')} className={styles.retryButton}>Try another email</button>
                </>
              ) : (
                <form onSubmit={handleResend} className={styles.form}>
                  <label htmlFor="verification-email" className={styles.label}>Email address</label>
                  <input id="verification-email" type="email" autoComplete="email" required value={email} disabled={resendStatus === 'loading'} onChange={event => setEmail(event.target.value)} placeholder="name@example.com" className={styles.input} />
                  {resendStatus === 'error' && <p role="alert" className={styles.resendError}>{resendError}</p>}
                  <button type="submit" disabled={resendStatus === 'loading'} className={styles.submit}>
                    {resendStatus === 'loading' ? 'Sending link...' : 'Send verification link'}
                  </button>
                </form>
              )}
              <Link to="/login" className={styles.backLink}>Back to Login</Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
