import { Link } from "react-router-dom";
import { useResetPassword } from "../../hooks/useResetPassword";
import styles from "./ResetPassword.module.css";

const Icons = {
  Check: () => <svg width="48" height="48" fill="none" stroke="#10b981" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Eye: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  EyeOff: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
};

export default function ResetPassword() {
  const { token, password, setPassword, confirmPassword, setConfirmPassword, status, showPassword, setShowPassword, handleSubmit } = useResetPassword();


  if (!token) return <div className={styles.invalidPage}><div className={styles.centered}><div className={styles.warning}>⚠️</div><h2 className={styles.invalidTitle}>Invalid Link</h2><p className={styles.muted}>This password reset link is invalid or has expired.</p><Link to="/forgot-password" className={styles.newLink}>Request a new link</Link></div></div>;

  return (
    <div className={styles.page}>
      <div className={styles.glow} />

      <div className={styles.container}>
        <div className={styles.card}>

          {status === "success" ? (
            <div className={styles.centered}>
              <div className={styles.iconRow}><div className={styles.successIcon}><Icons.Check /></div></div>
              <h2 className={styles.successTitle}>Password Updated!</h2>
              <p className={styles.successDescription}>Your password has been changed successfully.</p>
              <Link to="/login" className={styles.loginLink}>Back to Login</Link>
            </div>
          ) : (
            <div>
              <h2 className={styles.title}>Set New Password</h2>
              <p className={styles.description}>Please enter your new strong password below.</p>

              {status === "error" && <div role="alert" className={styles.error}>Failed to reset password. Link might be expired.</div>}

              <form onSubmit={handleSubmit}>
                <div className={styles.passwordField}>
                  <label htmlFor="new-password" className={styles.label}>New Password</label>
                  <input id="new-password" autoComplete="new-password" type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={styles.input}   />
                  <button aria-label={showPassword ? "Hide passwords" : "Show passwords"} aria-pressed={showPassword} type="button" onClick={() => setShowPassword(!showPassword)} className={styles.visibilityButton}>{showPassword ? <Icons.EyeOff /> : <Icons.Eye />}</button>
                </div>
                <div className={styles.confirmField}>
                  <label htmlFor="confirm-password" className={styles.label}>Confirm New Password</label>
                  <input id="confirm-password" autoComplete="new-password" type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className={styles.confirmInput} data-match={password && confirmPassword ? (password === confirmPassword ? "yes" : "no") : undefined} />
                </div>
                <button type="submit" disabled={status === "loading" || password !== confirmPassword} className={styles.submit}>
                  {status === "loading" ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}