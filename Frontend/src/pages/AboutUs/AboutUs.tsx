import { Link } from "react-router-dom";
import styles from "./AboutUs.module.css";

const Icons = {
  Target: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Zap: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  Users: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/></svg>,
  Globe: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
};

export default function AboutUs() {
  const teamMembers = [
    { name: "Vasyl", role: "CEO & Founder", image: "/team/vasiliy.jpg" },
    { name: "Anna", role: "Creative Director", image: "/team/anna.jpg" },
    { name: "Vladislav", role: "CTO & Security Lead", image: "/team/vladislav.jpg" }
  ];

  return (
    <div className={styles.page}>
      <div className={styles.topGlow} />
      <div className={styles.sideGlow} />
      <div className={styles.bottomGlow} />

      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.eyebrow}>
            Our Story
          </div>
          <h1 className={styles.heroTitle}>
            Redefining How <br/>
            <span className={styles.titleGradient}>Talent Meets Opportunity</span>
          </h1>
          <p className={styles.heroDescription}>
            JobBoard brings vacancy search, applications, and employer conversations together. Candidates can explore roles while employers manage their job listings and applicants.
          </p>
        </section>
        <section className={styles.highlights}>
          {[
            { label: "Vacancy filters", value: "Search" },
            { label: "Application updates", value: "Track" },
            { label: "Direct messages", value: "Chat" }
          ].map((stat, i) => (
            <div key={i} className={styles.highlightCard}>
              <div className={styles.highlightValue}>{stat.value}</div>
              <div className={styles.highlightLabel}>{stat.label}</div>
            </div>
          ))}
        </section>
        <section className={styles.mission}>
          <div className={styles.missionCard}>
            <div className={styles.missionGlow} />
            <div className={styles.foreground}>
              <div className={styles.missionIcon}>
                <Icons.Target />
              </div>
              <h2 className={styles.missionTitle}>Our Mission</h2>
              <p className={styles.missionDescription}>
                Our goal is to make each step easier to follow: find a suitable vacancy, submit an application, check its status, and discuss next steps with the employer.
              </p>
            </div>
          </div>
          <div className={styles.missionImage}>
            <div className={styles.imageOverlay} />
          </div>
        </section>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Our Core Values</h2>
            <p className={styles.sectionDescription}>The principles that guide every feature we build and every decision we make.</p>
          </div>

          <div className={styles.valuesGrid}>
            {[
              { title: 'Clear Information', desc: 'Compare salary ranges, locations, experience levels, and skill tags before applying.', icon: <Icons.Globe /> },
              { title: 'Application Tracking', desc: 'Review application statuses and keep related conversations together.', icon: <Icons.Zap /> },
              { title: 'Two Perspectives', desc: 'Candidate and employer dashboards support both sides of the application process.', icon: <Icons.Users /> }
            ].map((value, i) => (
              <div key={i} className={styles.valueCard}>
                <div className={styles.valueAccent} />
                <div className={styles.valueIcon}>{value.icon}</div>
                <h3 className={styles.valueTitle}>{value.title}</h3>
                <p className={styles.valueDescription}>{value.desc}</p>
              </div>
            ))}
          </div>
        </section>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Meet the Creators</h2>
            <p className={styles.sectionDescription}>The passionate team working behind the scenes to make JobBoard exceptional.</p>
          </div>

          <div className={styles.teamGrid}>
            {teamMembers.map((member, index) => (
              <div key={index} className={styles.memberCard}>
                <div className={styles.avatarFrame}>
                  <div className={styles.avatarCrop}>
                    <img
                      src={member.image}
                      alt={member.name}
                      className={styles.avatar}
                      onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${member.name}&background=111&color=10b981&size=200&bold=true`; }}
                    />
                  </div>
                </div>
                <h4 className={styles.memberName}>{member.name}</h4>
                <p className={styles.memberRole}>{member.role}</p>
              </div>
            ))}
          </div>
        </section>
        <section className={styles.cta}>
          <div className={styles.ctaGlow} />

          <div className={styles.foreground}>
            <h2 className={styles.ctaTitle}>Ready to elevate your career?</h2>
            <p className={styles.ctaDescription}>
              Explore available roles or create an account to apply, post vacancies, and manage applications.
            </p>
            <div className={styles.ctaActions}>
              <Link to="/register" className={styles.primaryButton}>
                Create Account
              </Link>
              <Link to="/jobs" className={styles.secondaryButton}>
                Explore Jobs
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
