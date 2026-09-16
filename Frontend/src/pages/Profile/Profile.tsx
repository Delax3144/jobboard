import { useRef } from 'react';
import { useProfile, COUNTRY_CODES, type TabType } from "../../hooks/useProfile";
import AvatarCropperModal from "../../components/profile/AvatarCropperModal";

import styles from "./Profile.module.css";

const Icons = {
  User: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>,
  Lock: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>,
  Camera: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>,
  Check: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>,
  Edit: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"></path></svg>,
  Eye: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Code: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>,
  Bell: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  Plus: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>,
  Trash: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>,
  FileText: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>,
};

const Toggle = ({ active, onClick, disabled, label }: { active: boolean, onClick: () => void, disabled?: boolean, label: string }) => (
  <button type="button" role="switch" aria-label={label} aria-checked={active} disabled={disabled} onClick={onClick} className={styles.toggle} data-active={active} data-disabled={Boolean(disabled)}>
    <span className={styles.toggleThumb} />
  </button>
);

export default function Profile() {
  const p = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  if (!p.user) return <div className={styles.loading}>Loading...</div>;

  const TABS = [
    { id: 'general', label: 'Personal Details', icon: <Icons.User /> },
    ...(p.user.role === 'candidate' ? [{ id: 'professional', label: 'Professional Profile', icon: <Icons.Code /> }] : []),
    { id: 'privacy', label: 'Privacy', icon: <Icons.Eye /> },
    { id: 'notifications', label: 'Notifications', icon: <Icons.Bell /> },
    { id: 'security', label: 'Security & Password', icon: <Icons.Lock /> }
  ];

  return (
    <div className={styles.page} data-editing={p.isEditing}>

      <div className={styles.greenGlow} />
      <div className={styles.blueGlow} />

      <div className={styles.layout}>

        {/* === ЛЕВАЯ ПАНЕЛЬ === */}
        <div className={styles.sidebar}>
          <div className={styles.identityCard}>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar}>
                {p.user.avatarUrl ? <img src={p.user.avatarUrl?.startsWith('http') ? p.user.avatarUrl : `${p.apiUrl}${p.user.avatarUrl}`} className={styles.avatarImage} /> : p.user.email[0].toUpperCase()}
              </div>
              <button onClick={() => fileInputRef.current?.click()} type="button" className={styles.avatarButton}><Icons.Camera /></button>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={p.handlers.handleFileChange} className={styles.hiddenInput} />
            </div>
            <h2 className={styles.name}>{p.user.firstName || 'User'} {p.user.lastName}</h2>
            <p className={styles.username}>@{p.user.username || 'username'}</p>
          </div>

          <div className={styles.tabs}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => { p.setActiveTab(tab.id as TabType); p.setIsEditing(false); }} className={styles.tab} data-active={p.activeTab === tab.id}>
                <span className={styles.tabIcon}>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* === ПРАВАЯ ПАНЕЛЬ === */}
        <div className={styles.contentPanel}>
          <div className={styles.contentCard}>

            {(p.activeTab === "general" || p.activeTab === "professional") && (
              <div className={styles.formHeader}>
                <div>
                  <h2 className={styles.title}>{p.activeTab === "general" ? "Personal Details" : "Professional Profile"}</h2>
                  <p className={styles.subtitle}>{p.activeTab === "general" ? "Manage your profile information and contact details." : "Highlight your skills, bio, and experience to stand out."}</p>
                </div>
                {!p.isEditing && <button onClick={() => p.setIsEditing(true)} className={styles.editButton}><Icons.Edit /> Edit Profile</button>}
              </div>
            )}

            <form onSubmit={p.handlers.handleSave}>
              {p.activeTab === "general" && (
                <div className={styles.generalFields}>
                  <div className={styles.twoColumns}>
                    <div>
                      <label className={styles.label}>First Name</label>
                      <input value={p.form.firstName} onChange={(e) => p.form.setFirstName(e.target.value)} disabled={!p.isEditing} className={styles.input} />
                    </div>
                    <div>
                      <label className={styles.label}>Last Name</label>
                      <input value={p.form.lastName} onChange={(e) => p.form.setLastName(e.target.value)} disabled={!p.isEditing} className={styles.input} />
                    </div>
                  </div>

                  <div className={styles.twoColumns}>
                    {p.user.role === 'candidate' ? (
                      <div>
                        <label className={styles.label}>Career Status</label>
                        <select disabled={!p.isEditing} value={p.form.status} onChange={e => p.form.setStatus(e.target.value)} className={styles.select}>
                          <option value="Open to work">Open to work</option><option value="Passive looking">Passive looking</option><option value="Not looking">Not looking</option><option value="Hidden">Hidden (Private)</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className={styles.label}>Your Role & Company</label>
                        <input value={p.form.bio} onChange={e => p.form.setBio(e.target.value)} disabled={!p.isEditing} placeholder={p.isEditing ? "e.g. HR Manager at TechCorp" : "Not specified"} className={styles.input} />
                      </div>
                    )}
                    <div>
                      <label className={styles.label}>Location</label>
                      <input value={p.form.location} onChange={e => p.form.setLocation(e.target.value)} disabled={!p.isEditing} placeholder={p.isEditing ? "e.g. Warsaw, Poland or Remote" : "Remote / Global"} className={styles.input} />
                    </div>
                  </div>

                  <div className={styles.twoColumns}>
                    <div>
                      <label className={styles.label}>Email Address</label>
                      <input value={p.user.email} disabled className={styles.emailInput} />
                    </div>
                    <div>
                      <label className={styles.label}>Phone Number</label>
                      <div className={styles.phoneFields}>
                        <select value={p.form.countryCode} onChange={(e) => p.form.setCountryCode(e.target.value)} disabled={!p.isEditing} className={styles.countrySelect}>
                          {COUNTRY_CODES.map(c => <option key={c.code} value={c.code} className={styles.option}>{c.label}</option>)}
                        </select>
                        <input value={p.form.phoneNumber} onChange={p.form.handlePhoneChange} disabled={!p.isEditing} placeholder={p.isEditing ? "123 456 789" : "Not set"} className={styles.phoneInput} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {p.activeTab === "professional" && (
                <div className={styles.professionalFields}>
                  <div className={styles.resumeCard}>
                    <div>
                      <h3 className={styles.resumeTitle}><Icons.FileText /> Resume (CV)</h3>
                      <p className={styles.resumeDescription}>{p.form.resumeUrl ? "You have uploaded a resume. Employers can download it from your profile." : "Upload your resume in PDF format to stand out."}</p>
                    </div>
                    <div className={styles.resumeActions}>
                      {p.form.resumeUrl && <a href={p.form.resumeUrl.startsWith('http') ? p.form.resumeUrl : `${p.apiUrl}/${p.form.resumeUrl}`} target="_blank" rel="noopener noreferrer" className={styles.resumeLink}>View My Resume</a>}
                      <input type="file" accept=".pdf,.doc,.docx" ref={resumeInputRef} onChange={p.handlers.handleResumeUpload} className={styles.hiddenInput} />
                      <button type="button" onClick={() => resumeInputRef.current?.click()} className={styles.uploadButton}>{p.form.resumeUrl ? "Update Resume" : "Upload Resume"}</button>
                    </div>
                  </div>

                  <div>
                    <label className={styles.label}>Bio / About Me</label>
                    <textarea value={p.form.bio} onChange={e => p.form.setBio(e.target.value)} disabled={!p.isEditing} placeholder={p.isEditing ? "Tell employers about your passion, experience, and what makes you unique..." : "No bio provided."} className={styles.bioInput} />
                  </div>
                  <div>
                    <label className={styles.label}>Top Skills (Comma separated)</label>
                    <input value={p.form.skills} onChange={e => p.form.setSkills(e.target.value)} disabled={!p.isEditing} placeholder={p.isEditing ? "e.g. React, TypeScript, Node.js, AWS" : "No skills added."} className={styles.input} />
                  </div>

                  <div>
                    <div className={styles.experienceHeader}>
                      <label className={styles.experienceLabel}>Professional Experience</label>
                      {p.isEditing && <button type="button" onClick={p.form.addExperience} className={styles.addRole}><Icons.Plus /> Add Role</button>}
                    </div>
                    {p.form.experience.length === 0 && !p.isEditing && <div className={styles.emptyExperience}>No experience added yet.</div>}
                    <div className={styles.experienceList}>
                      {p.form.experience.map((exp) => (
                        <div key={exp.id} className={styles.experienceCard}>
                          {p.isEditing && <button type="button" onClick={() => p.form.removeExperience(exp.id)} className={styles.removeRole}><Icons.Trash /></button>}
                          <div className={styles.experienceColumns}>
                            <input value={exp.title} onChange={e => p.form.updateExperience(exp.id, 'title', e.target.value)} disabled={!p.isEditing} placeholder="Job Title" className={styles.experienceTitle} />
                            <input value={exp.company} onChange={e => p.form.updateExperience(exp.id, 'company', e.target.value)} disabled={!p.isEditing} placeholder="Company Name" className={styles.experienceCompany} />
                          </div>
                          <input value={exp.period} onChange={e => p.form.updateExperience(exp.id, 'period', e.target.value)} disabled={!p.isEditing} placeholder="Period (e.g. Jan 2021 - Present)" className={styles.experiencePeriod} />
                          <textarea value={exp.description} onChange={e => p.form.updateExperience(exp.id, 'description', e.target.value)} disabled={!p.isEditing} placeholder="Describe your achievements..." className={styles.experienceDescription} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(p.activeTab === "general" || p.activeTab === "professional") && p.isEditing && (
                <div className={styles.formActions}>
                  <button type="submit" disabled={p.isSaving} className={styles.saveButton}>{p.isSaving ? "Saving..." : "Save Changes"}</button>
                  <button type="button" onClick={p.handlers.handleCancel} className={styles.cancelButton}>Cancel</button>
                </div>
              )}
            </form>

            {p.activeTab === 'privacy' && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Privacy Settings</h2>
                <p className={styles.sectionDescription}>Control your visibility and who can see your data on the platform.</p>
                <div className={styles.settingsList}>
                  <div className={`${styles.settingsRow} ${styles.responsiveSettings}`}>
                    <div><div className={styles.settingTitle}>Public Profile</div><div className={styles.settingDescription}>Allow verified employers to find you in search results.</div></div>
                    <Toggle label="Public Profile" active={p.settings.isPublic} onClick={() => { const nextVal = !p.settings.isPublic; p.settings.setIsPublic(nextVal); p.settings.handleSaveSettings({ isPublic: nextVal, showEmail: p.settings.showEmail }); }} />
                  </div>
                  <div className={`${styles.settingsRow} ${styles.responsiveSettings}`}>
                    <div><div className={styles.settingTitle}>Show Email Address</div><div className={styles.settingDescription}>Visible only to companies you've explicitly applied to.</div></div>
                    <Toggle label="Show Email Address" active={p.settings.showEmail} onClick={() => { const nextVal = !p.settings.showEmail; p.settings.setShowEmail(nextVal); p.settings.handleSaveSettings({ isPublic: p.settings.isPublic, showEmail: nextVal }); }} />
                  </div>
                </div>
              </div>
            )}

            {p.activeTab === 'notifications' && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Notification Preferences</h2>
                <p className={styles.sectionDescription}>Customize how and when we alert you about new messages and application updates.</p>
                <div className={styles.settingsList}>
                  <div className={`${styles.settingsRow} ${styles.responsiveSettings}`}>
                    <div><div className={styles.settingTitle}>In-App Push Notifications</div><div className={styles.settingDescription}>Show real-time alerts in the bottom right corner of your screen.</div></div>
                    <Toggle label="In-App Push Notifications" active={p.settings.toastsEnabled} onClick={() => { const nextVal = !p.settings.toastsEnabled; p.settings.setToastsEnabled(nextVal); p.settings.handleSaveSettings({ soundEnabled: p.settings.soundEnabled, toastsEnabled: nextVal, notificationVolume: p.settings.notificationVolume }); }} />
                  </div>
                  <div className={`${styles.settingsRow} ${styles.responsiveSettings}`}>
                    <div><div className={styles.settingTitle}>Sound Alerts</div><div className={styles.settingDescription}>Play a soft notification sound when a new message arrives.</div></div>
                    <Toggle label="Sound Alerts" active={p.settings.soundEnabled} onClick={() => { const nextVal = !p.settings.soundEnabled; p.settings.setSoundEnabled(nextVal); p.settings.handleSaveSettings({ soundEnabled: nextVal, toastsEnabled: p.settings.toastsEnabled, notificationVolume: p.settings.notificationVolume }); }} />
                  </div>
                  {p.settings.soundEnabled && (
                    <div className={`${styles.volumeRow} ${styles.responsiveSettings}`}>
                      <div className={styles.volumeHeader}>
                        <div><div className={styles.settingTitle}>Alert Volume</div><div className={styles.settingDescription}>Adjust the loudness of real-time audio alerts.</div></div>
                        <span className={styles.volumeValue}>{p.settings.notificationVolume}%</span>
                      </div>
                      <div className={styles.volumeControls}>
                        <input type="range" min={0} max={100} step={5} value={p.settings.notificationVolume} onChange={(e) => p.settings.setNotificationVolume(Number(e.target.value))} onMouseUp={() => { p.settings.handleSaveSettings({ soundEnabled: p.settings.soundEnabled, toastsEnabled: p.settings.toastsEnabled, notificationVolume: p.settings.notificationVolume }); const testAudio = new Audio('/notify.mp3'); testAudio.volume = p.settings.notificationVolume / 100; testAudio.play().catch(() => {}); }} onTouchEnd={() => { p.settings.handleSaveSettings({ soundEnabled: p.settings.soundEnabled, toastsEnabled: p.settings.toastsEnabled, notificationVolume: p.settings.notificationVolume }); const testAudio = new Audio('/notify.mp3'); testAudio.volume = p.settings.notificationVolume / 100; testAudio.play().catch(() => {}); }} className={styles.volumeInput} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {p.activeTab === "security" && (
              <div className={styles.section}>
                <div className={styles.securityHeader}>
                  <h2 className={styles.sectionTitle}>Security Settings</h2>
                  <p className={styles.subtitle}>Manage your account security, passwords, and two-factor authentication.</p>
                </div>
                <div className={styles.securityList}>
                  <div className={`${styles.twoFactorRow} ${styles.responsiveSettings}`}>
                    <div>
                      <div className={styles.recommended}>Recommended</div>
                      <div className={styles.settingTitle}>Two-Factor Authentication (2FA)</div>
                      <div className={styles.securityDescription}>Add an extra layer of security to your account using TOTP.</div>
                    </div>
                    <Toggle label="Two-Factor Authentication (2FA)" active={p.security.twoFactor} onClick={p.security.handleToggle2FA} />
                  </div>
                  <div className={styles.passwordCard}>
                    <h3 className={styles.passwordTitle}>Change Password</h3>
                    <p className={styles.passwordDescription}>For security reasons, we use email confirmation to change passwords. Click the button below, and we will send a secure link to <span className={styles.email}>{p.user.email}</span>.</p>
                    {p.security.resetMsg ? (
                      <div className={styles.resetSuccess}>
                        <Icons.Check /> {p.security.resetMsg}
                      </div>
                    ) : (
                      <button onClick={p.security.handlePasswordResetRequest} disabled={p.security.isResetting} className={styles.resetButton}>
                        {p.security.isResetting ? "Sending Request..." : "Send Password Reset Link"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {p.message && (
              <div className={styles.message}>
                <Icons.Check /> {p.message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === МОДАЛЬНОЕ ОКНО 2FA === */}
      {p.security.show2FAModal && (
        <div
          className={styles.modalOverlay}
        >
          <div

            className={styles.modal}
          >
            <h3
              className={styles.modalTitle}
            >
              {p.security.twoFactorModalMode === "enable"
                ? "Setup Google Authenticator"
                : "Disable Two-Factor Authentication"}
            </h3>

            <p
              className={styles.modalDescription}
            >
              {p.security.twoFactorModalMode === "enable"
                ? "Scan the QR code below with your Authenticator app, then enter the 6-digit code."
                : "Enter the current 6-digit code from your Authenticator app to disable 2FA."}
            </p>

            {p.security.twoFactorModalMode === "enable" && (
              <div
                className={styles.qrWrapper}
              >
                {p.security.qrCode ? (
                  <img
                    src={p.security.qrCode}
                    alt="2FA QR Code"
                    className={styles.qrImage}
                  />
                ) : (
                  <div
                    className={styles.qrLoading}
                  >
                    Loading...
                  </div>
                )}
              </div>
            )}

            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              maxLength={6}
              value={p.security.twoFactorCode}
              onChange={(e) =>
                p.security.setTwoFactorCode(
                  e.target.value.replace(/\D/g, "")
                )
              }
              className={styles.codeInput}
            />

            <div
              className={styles.modalActions}
            >
              <button
                onClick={() => {
                  p.security.setShow2FAModal(false);
                  p.security.setTwoFactorCode("");
                }}
                className={styles.modalCancel}
              >
                Cancel
              </button>

              <button
                onClick={p.security.handleVerify2FA}
                disabled={
                  p.security.isVerifying2FA ||
                  p.security.twoFactorCode.length !== 6
                }
                className={styles.modalVerify} data-mode={p.security.twoFactorModalMode}
              >
                {p.security.isVerifying2FA
                  ? "Verifying..."
                  : p.security.twoFactorModalMode === "disable"
                    ? "Verify & Disable"
                    : "Verify & Enable"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === МОДАЛКА КРОППЕРА === */}
      <AvatarCropperModal
        open={p.cropper.openCropper}
        onClose={() => { p.cropper.setOpenCropper(false); p.cropper.setImageSrc(null); }}
        imageSrc={p.cropper.imageSrc}
        setUser={p.setUser}
        setMessage={p.setMessage}
      />

    </div>
  );
}
