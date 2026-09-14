import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import styles from "./Home.module.css";

const Icons = {
  Check: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  Message: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  Lightning: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Globe: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
  Shield: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
};

export default function Home() {
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.greenGlow} />
        <div className={styles.blueGlow} />
        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className={styles.badgeDot} />
              Tech Jobs & Direct Communication
            </div>

            <h1 className={styles.heroTitle}>
              Accelerate your <br />
              <span className={styles.titleGradient}>tech career.</span>
            </h1>

            <p className={styles.heroDescription}>
              Browse tech vacancies, apply with your CV, and follow your application status. Continue the conversation with employers in one place.
            </p>

            <div className={styles.heroActions}>
              <Link to="/jobs" className={styles.primaryButton}>
                Explore Opportunities
              </Link>
              {!user && (
                <Link to="/register" className={styles.employerButton}>
                  For Employers
                </Link>
              )}
            </div>
            <div className={styles.workflowHint}>
              <div className={styles.workflowHintText}>
                Search vacancies. Save your favourites. Track your applications.
              </div>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.imageGlow} />

            <img src="/images/hero-coder.png" alt="Developer coding" className={styles.heroImage} />
            <div className={styles.trackingCard}>
              <div className={styles.trackingIcon}><Icons.Check /></div>
              <div>
                <div className={styles.floatingTitle}>Application Tracking</div>
                <div className={styles.floatingDescription}>Follow each status update</div>
              </div>
            </div>
            <div className={styles.chatCard}>
              <div className={styles.chatDot} />
              <div>
                <div className={styles.floatingTitle}>Application Chats</div>
                <div className={styles.floatingDescription}>Messages with employers</div>
              </div>
            </div>
          </div>

        </div>
      </section>
      <section className={styles.workflow}>
        <div className={styles.workflowContainer}>
          <p className={styles.workflowCaption}>From finding a role to starting a conversation</p>
          <div className={styles.workflowWords}>
             {['Search', 'Save', 'Apply', 'Track', 'Chat'].map(step => (
               <span key={step} className={`${styles.workflowWord} ${styles[step.toLowerCase()]}`}>{step}</span>
             ))}
          </div>
        </div>
      </section>
      <section className={styles.features}>
        <div className={styles.container}>
          <div className={styles.featuresHeader}>
            <h2 className={styles.featuresTitle}>
              Built for <span className={styles.accent}>modern</span> teams.
            </h2>
            <p className={styles.featuresDescription}>
              Search, applications, and conversations for candidates and employers.
            </p>
          </div>
          <div className={styles.featuresGrid}>
            <div className={styles.communicationCard}>
              <div className={styles.greenIcon}>
                <Icons.Message />
              </div>
              <h3 className={styles.wideFeatureTitle}>Direct Communication</h3>
              <p className={styles.communicationDescription}>Keep messages linked to each application. Talk with employers about the role and next steps as your application progresses.</p>

              <div className={styles.chatPreview}>
                <div className={styles.incomingMessage}>
                  <div className={styles.avatar} />
                  <div className={styles.incomingBubble}>Hi! We loved your portfolio.</div>
                </div>
                <div className={styles.outgoingMessage}>
                  <div className={styles.outgoingBubble}>Thanks! I'd love to chat.</div>
                </div>
              </div>
            </div>
            <div className={styles.cvCard}>
              <div className={styles.blueIcon}>
                <Icons.Lightning />
              </div>
              <h3 className={styles.featureTitle}>Apply with Your CV</h3>
              <p className={styles.featureDescription}>Send your CV and a message with your application, then follow its progress from your dashboard.</p>
            </div>
            <div className={styles.securityCard}>
              <div className={styles.amberIcon}>
                <Icons.Shield />
              </div>
              <h3 className={styles.featureTitle}>Account Security</h3>
              <p className={styles.featureDescription}>Verify your email and enable two-factor authentication from your profile settings.</p>
            </div>
            <div className={styles.searchCard}>
              <div className={styles.searchContent}>
                <div className={styles.greenIcon}>
                  <Icons.Globe />
                </div>
                <h3 className={styles.wideFeatureTitle}>Find Your Next Role</h3>
                <p className={styles.searchDescription}>Search by job title, company, or skills. Filter vacancies by location, experience level, and salary range.</p>
              </div>
              <div className={styles.locationTags}>
                {['Remote', 'Poland', 'Germany', 'UK', 'USA'].map(tag => (
                  <span key={tag} className={styles.locationTag}>{tag}</span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>
      <section className={styles.cta}>
        <div className={styles.ctaPanel}>

          <div className={styles.ctaPattern} />

          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>
              Ready to make your next move?
            </h2>
            <p className={styles.ctaDescription}>
              Create a candidate account to apply for roles, or an employer account to post vacancies and review applications.
            </p>
            <Link to="/register" className={styles.ctaButton}>
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
