import { useEffect } from "react";
import styles from "./Legal.module.css";
import { useLocation, Link, useNavigate } from "react-router-dom";

const Icons = {
  Shield: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  FileText: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Cookie: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 9h.01M15 11h.01M11 15h.01M15 15h.01M12 5a3 3 0 00-3 3 3 3 0 003 3m-3-3v.01" /></svg>,
  ArrowLeft: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
};

export default function Legal() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = location.pathname.includes("terms") ? "terms" : location.pathname.includes("cookies") ? "cookies" : "privacy";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const TABS = [
    { id: "privacy", label: "Privacy Policy", icon: <Icons.Shield />, path: "/privacy" },
    { id: "terms", label: "Terms of Service", icon: <Icons.FileText />, path: "/terms" },
    { id: "cookies", label: "Cookie Settings", icon: <Icons.Cookie />, path: "/cookies" },
  ];

  return (
    <div className={styles.page}>

      <div className={styles.greenGlow} />
      <div className={styles.blueGlow} />

      <div className={styles.container}>

        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <Icons.ArrowLeft /> Go Back
        </button>

        <div className={styles.header}>
          <div className={styles.badge}>
            Legal Center
          </div>
          <h1 className={styles.title}>
            Commitment to <span className={styles.accent}>Transparency</span>
          </h1>
          <p className={styles.description}>
            We believe in clear, honest, and secure practices. Read our policies below to understand how we protect your data and operate JobBoard.
          </p>
        </div>

        <div className={styles.layout}>

          <div className={styles.sidebar}>
            <div className={styles.navigation}>
              <div className={styles.tabs}>
                {TABS.map(tab => (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    className={styles.tab} aria-current={activeTab === tab.id ? "page" : undefined}
                  >
                    {tab.icon} {tab.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className={styles.footer}>
              Last updated: <strong>May 2026</strong><br/>
              Have questions? <Link to="/contact" className={styles.textLink}>Contact Support</Link>
            </div>
          </div>

          <div className={styles.card}>



            <div className={styles.content}>

              {activeTab === "privacy" && (
                <>
                  <h2>1. Information We Collect</h2>
                  <p>When you use JobBoard, we collect information that you provide directly to us, such as when you create an account, update your profile, apply for a job, or communicate with us. This may include your <strong>name, email address, phone number, resume/CV, and professional experience</strong>.</p>
                  <p>We also automatically collect certain information about your device and how you interact with our platform, including IP addresses, browser types, and usage data to improve our services.</p>

                  <h2>2. How We Use Your Information</h2>
                  <p>We use the information we collect to:</p>
                  <ul>
                    <li>Provide, maintain, and improve the JobBoard platform.</li>
                    <li>Connect candidates with potential employers securely.</li>
                    <li>Send you technical notices, updates, security alerts, and support messages.</li>
                    <li>Monitor and analyze trends, usage, and activities in connection with our services.</li>
                  </ul>

                  <h2>3. Data Sharing and Privacy</h2>
                  <p>We <strong>do not sell</strong> your personal data. We share your information only in the following circumstances:</p>
                  <ul>
                    <li><strong>With Employers:</strong> When you apply for a job, your profile and CV are shared with that specific employer.</li>
                    <li><strong>With Service Providers:</strong> We use third-party vendors (like AWS or Vercel) for hosting and infrastructure, under strict confidentiality agreements.</li>
                    <li><strong>Legal Requirements:</strong> If required by law or legal process.</li>
                  </ul>

                  <h2>4. Your GDPR & CCPA Rights</h2>
                  <p>Depending on your location, you have the right to access, correct, delete, or port your personal data. You can manage your data directly from your <Link to="/profile" className={styles.textLink}>Profile Settings</Link>. For complete data deletion, contact our privacy team.</p>
                </>
              )}

              {activeTab === "terms" && (
                <>
                  <h2>1. Acceptance of Terms</h2>
                  <p>By accessing or using the JobBoard platform, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you may not access the website or use any services.</p>

                  <h2>2. User Accounts & Security</h2>
                  <p>You are responsible for safeguarding your account login credentials. We highly recommend enabling <strong>Two-Factor Authentication (2FA)</strong> in your security settings. You must immediately notify us of any unauthorized use of your account.</p>

                  <h2>3. Platform Rules for Candidates</h2>
                  <p>As a candidate, you agree to:</p>
                  <ul>
                    <li>Provide accurate, current, and complete information in your profile and resume.</li>
                    <li>Not use the platform for any unlawful purpose.</li>
                    <li>Respect the communication channels and not spam employers.</li>
                    <li>Not discriminate based on protected characteristics like race or religion.</li>
                  </ul>

                  <h2>4. Platform Rules for Employers</h2>
                  <p>As an employer or recruiter, you agree to:</p>
                  <ul>
                    <li>Post legitimate, accurate job listings with clear salary ranges where applicable.</li>
                    <li>Treat candidate data with strict confidentiality and not use it outside the scope of recruitment.</li>
                    <li>Not discriminate based on race, gender, religion, or any other protected status.</li>
                  </ul>

                  <h2>5. Termination</h2>
                  <p>We reserve the right to suspend or terminate your account at any time, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users of the platform.</p>
                </>
              )}

              {activeTab === "cookies" && (
                <>
                  <h2>1. What Are Cookies?</h2>
                  <p>Cookies are small text files placed on your device to store data that can be recalled by a web server in the domain that placed the cookie. This data often consists of a string of numbers and letters that uniquely identifies your computer.</p>

                  <h2>2. How We Use Cookies</h2>
                  <p>JobBoard uses cookies and similar technologies to:</p>
                  <ul>
                    <li><strong>Strictly Necessary:</strong> Keep you logged in, securely process your job applications, and remember your security preferences (like 2FA status).</li>
                    <li><strong>Performance & Analytics:</strong> Understand how users interact with our platform so we can improve the UI/UX. We use privacy-friendly analytics tools.</li>
                    <li><strong>Preferences:</strong> Remember your theme choice (dark/light) and search filters.</li>
                  </ul>

                  <h2>3. Manage Your Preferences</h2>
                  <p>Cookie preferences cannot currently be changed from this page. You can manage site cookies through your browser settings.</p>

                  <div className={styles.preferences}>
                    <div className={styles.essentialRow}>
                      <div>
                        <strong className={styles.preferenceTitle}>Essential Cookies</strong>
                        <span className={styles.preferenceDescription}>Required for the site to function.</span>
                      </div>
                      <div className={styles.alwaysActive}>Always Active</div>
                    </div>
                    <div className={styles.analyticsRow}>
                      <div>
                        <strong className={styles.preferenceTitle}>Analytics & Performance</strong>
                        <span className={styles.preferenceDescription}>Help us improve the platform.</span>
                      </div>
                      <span className={styles.unavailable}>Setting unavailable</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}