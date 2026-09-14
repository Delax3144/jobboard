import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useRegister } from "../../hooks/useRegister";

import styles from "./RegisterPage.module.css";

const Icons = {
  Eye: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  EyeOff: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>,
  Mail: () => <svg width="48" height="48" fill="none" stroke="#10b981" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
};

export default function RegisterPage() {
  const {
    formData, handleChange, showPassword, setShowPassword,
    role, setRole, error, isSubmitting, isSuccess,
    handleSubmit, handleGoogleSuccess, handleGithubClick
  } = useRegister();

  const passwordMatch = !formData.password || !formData.confirmPassword
    ? "empty"
    : formData.password === formData.confirmPassword ? "match" : "mismatch";

  return (
    <div className={styles.page}>

      <div className={styles.greenGlow} />
      <div className={styles.blueGlow} />

      <div className={styles.card}>

        {isSuccess ? (
          <div className={styles.success}>
            <div className={styles.successIconWrapper}>
              <div className={styles.successIcon}>
                <Icons.Mail />
              </div>
            </div>
            <h2 className={styles.successTitle}>Check your inbox!</h2>
            <p className={styles.successDescription}>
              We've sent a verification link to <br/><b className={styles.email}>{formData.email}</b>.<br/><br/>
              Please click the link to activate your account.
            </p>
            <Link to="/login" className={styles.loginButton}>
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            <h1 className={styles.title}>
              Create <span className={styles.accent}>Account</span>
            </h1>
            <p className={styles.subtitle}>Join our professional community</p>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.roleSelector}>
              <label className={styles.roleLabel}>I am a:</label>
              <div className={styles.roleOptions}>
                <button type="button" onClick={() => setRole("candidate")} className={styles.roleButton} aria-pressed={role === "candidate"}>Candidate</button>
                <button type="button" onClick={() => setRole("employer")} className={styles.roleButton} aria-pressed={role === "employer"}>Employer</button>
              </div>
            </div>

            <div className={styles.socialButtons}>
              <div className={styles.googleButton}>
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => alert('Google sign up failed')} type="icon" theme="filled_black" shape="circle" size="large" />
              </div>
              <button
                type="button" onClick={handleGithubClick}
                className={styles.githubButton} aria-label="Sign up with GitHub"
              >
                <svg fill="#fff" viewBox="0 0 24 24" width="22" height="22"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </button>
            </div>

            <div className={styles.divider}>
              <div className={styles.dividerLine} />
              <span className={styles.dividerText}>OR EMAIL REGISTER</span>
              <div className={styles.dividerLine} />
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.nameFields}>
                <div>
                  <label className={styles.label}>First Name *</label>
                  <input required name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" className={styles.input} />
                </div>
                <div>
                  <label className={styles.label}>Last Name *</label>
                  <input required name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" className={styles.input} />
                </div>
              </div>

              <div>
                <label className={styles.label}>Username *</label>
                <input required name="username" value={formData.username} onChange={handleChange} placeholder="johndoe77" className={styles.input} />
              </div>

              <div>
                <label className={styles.label}>Email Address *</label>
                <input type="email" required name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" className={styles.input} />
              </div>

              <div>
                <label className={styles.label}>Phone Number (Optional)</label>
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+48 123 456 789" className={styles.input} />
              </div>

              <div>
                <label className={styles.label}>Password *</label>
                <div className={styles.passwordField}>
                  <input type={showPassword ? "text" : "password"} required name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className={styles.passwordInput} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.passwordToggle} aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                  </button>
                </div>
              </div>

              <div>
                <label className={styles.label}>Confirm Password *</label>
                <input
                  type={showPassword ? "text" : "password"} required name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••"
                  className={styles.confirmInput} data-match={passwordMatch}
                />
              </div>

              <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p className={styles.loginPrompt}>
              Already have an account? <Link to="/login" className={styles.loginLink}>Login here</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}