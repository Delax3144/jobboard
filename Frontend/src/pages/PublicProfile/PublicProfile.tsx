import { Link } from "react-router-dom";
import { usePublicProfile } from "../../hooks/usePublicProfile";
import styles from "./PublicProfile.module.css";

const Icons = {
  Back: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>,
  Mail: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>,
  Message: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>,
  Location: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>,
  Code: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>,
  User: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>,
  Lock: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
};

export default function PublicProfile() {
  const { navigate, apiUrl, candidate, loading, profileData } = usePublicProfile();

  if (loading) return <div className={styles.state}>Loading Talent Profile...</div>;
  if (!candidate || !profileData) return <div className={styles.state}>Candidate not found.</div>;

  return (
    <div className={styles.page}>

      {/* Декоративные свечения */}
      <div className={styles.greenGlow} />
      <div className={styles.blueGlow} />

      <div className={`container ${styles.container}`}>

        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <Icons.Back /> Back to Candidates
        </button>

        {profileData.isPrivate ? (
          /* === ПРИВАТНЫЙ ПРОФИЛЬ === */
          <div className={styles.privateCard}>
            <div className={styles.lockIcon}>
              <Icons.Lock />
            </div>
            <h1 className={styles.privateTitle}>This profile is private</h1>
            <p className={styles.privateDescription}>
              {candidate.firstName} has chosen to keep their profile hidden from public search and direct messages.
            </p>
            <div className={styles.privateStatus}>
              Status: Not actively looking
            </div>
          </div>
        ) : (
          /* === ПУБЛИЧНЫЙ ПРОФИЛЬ === */
          <div className={styles.publicContent}>

            {/* ШАПКА */}
            <div className={styles.hero}>

              <div className={styles.identity}>
                <div className={styles.avatar}>
                  {candidate.avatarUrl ? (
                    <img alt="Candidate avatar" src={candidate.avatarUrl.startsWith('http') ? candidate.avatarUrl : `${apiUrl}${candidate.avatarUrl}`} className={styles.avatarImage} />
                  ) : (
                    (
                      candidate.firstName?.[0] ||
                      candidate.username?.[0] ||
                      "?"
                    ).toUpperCase()
                  )}
                </div>

                <div>
                  <div className={styles.nameRow}>
                    <h1 className={styles.name}>
                      {candidate.firstName} {candidate.lastName}
                    </h1>
                    <span className={styles.status}>
                      {candidate.status || "Open to work"}
                    </span>
                  </div>

                  <div className={styles.metadata}>
                    <span className={styles.metaItem}><Icons.Location /> {candidate.location || "Remote / Global"}</span>
                    <span className={`hidden-mobile ${styles.separator}`} ></span>
                    <span className={styles.metaItem}>@{candidate.username || 'candidate'}</span>
                  </div>
                </div>
              </div>

              {/* Кнопки действий */}
              <div className={styles.actions}>

                <Link to={`/messages/${candidate.id}`} className={styles.messageLink} >
                  <Icons.Message /> Message
                </Link>
              </div>
            </div>

            {/* BENTO GRID ДЛЯ КОНТЕНТА */}
            <div className={styles.layout}>

              <div className={styles.mainColumn}>
                <div className={styles.contentCard}>
                  <h3 className={styles.sectionHeading}><Icons.User /> About Me</h3>
                  <p className={styles.bio}>
                    {profileData.bio}
                  </p>
                </div>

                <div className={styles.contentCard}>
                  <h3 className={styles.sectionHeading}><Icons.Code /> Professional Experience</h3>
                  {profileData.experience.length > 0 ? (
                    <div className={styles.timeline}>
                      {profileData.experience.map((exp, i) => (
                        <div key={i} className={styles.experienceItem}>
                          <div className={styles.timelineMarker} />
                          <h4 className={styles.experienceTitle}>{exp.title}</h4>
                          <div className={styles.experienceMeta}>{exp.company} {exp.period && `• ${exp.period}`}</div>
                          <div className={styles.experienceDescription}>{exp.description}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.noExperience}>No professional experience listed.</p>
                  )}
                </div>
              </div>

              <div className={styles.sidebar}>
                <div className={styles.sidebarCard}>
                  <h3 className={styles.contactHeading}>Contact Info</h3>
                  <div className={styles.contactList}>
                    <div>
                      <div className={styles.emailLabel}>Email Address</div>
                      <div className={styles.email}>
                        <span className={styles.mailIcon}><Icons.Mail /></span>
                        {candidate.showEmail === false ? <span className={styles.hiddenEmail}>Hidden by candidate</span> : candidate.email}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.sidebarCard}>
                  <h3 className={styles.skillsHeading}>Top Skills</h3>
                  <div className={styles.skillList}>
                    {profileData.skills.length > 0 ? profileData.skills.map((skill: string) => (
                      <span key={skill} className={styles.skill}>{skill}</span>
                    )) : <span className={styles.noSkills}>No skills added.</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}