// src/pages/Profile.tsx
import { useProfile, COUNTRY_CODES, type TabType } from "../hooks/useProfile";
import AvatarCropperModal from "../components/profile/AvatarCropperModal";

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

const Toggle = ({ active, onClick, disabled }: { active: boolean, onClick: () => void, disabled?: boolean }) => (
  <div onClick={disabled ? undefined : onClick} style={{ width: '44px', height: '24px', borderRadius: '12px', background: active ? '#10b981' : '#222', position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', border: active ? '1px solid #10b981' : '1px solid #333', opacity: disabled ? 0.5 : 1 }}>
    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: active ? '22px' : '2px', transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
  </div>
);

export default function Profile() {
  const p = useProfile();

  if (!p.user) return <div style={{ color: '#fff', textAlign: 'center', padding: '100px' }}>Loading...</div>;

  const inputStyle = {
    background: p.isEditing ? '#000' : 'rgba(255,255,255,0.02)',
    border: p.isEditing ? '1px solid #333' : '1px solid rgba(255,255,255,0.05)',
    color: p.isEditing ? '#fff' : '#888',
    width: '100%', padding: '16px 20px', borderRadius: '16px',
    transition: 'all 0.2s', outline: 'none', fontSize: '15px', fontFamily: 'inherit'
  };

  const TABS = [
    { id: 'general', label: 'Personal Details', icon: <Icons.User /> },
    ...(p.user.role === 'candidate' ? [{ id: 'professional', label: 'Professional Profile', icon: <Icons.Code /> }] : []),
    { id: 'privacy', label: 'Privacy', icon: <Icons.Eye /> },
    { id: 'notifications', label: 'Notifications', icon: <Icons.Bell /> },
    { id: 'security', label: 'Security & Password', icon: <Icons.Lock /> }
  ];

  return (
    <div className="prof-page-container" style={{ background: '#050505', width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw', minHeight: 'calc(100vh - 100px)', overflowX: 'clip' }}>
      
      <div style={{ position: 'absolute', top: '0', left: '20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '0', right: '10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <div className="prof-layout-wrapper" style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 20px', display: 'flex', gap: '50px', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        
        {/* === ЛЕВАЯ ПАНЕЛЬ === */}
        <div className="prof-sidebar-panel" style={{ width: '300px', flexShrink: 0 }}>
          <div style={{ background: 'rgba(15, 15, 15, 0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '40px 20px', textAlign: 'center', marginBottom: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 25px' }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "linear-gradient(135deg, #10b981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "42px", fontWeight: "900", color: "#000", overflow: "hidden", border: "3px solid #1a1a1a", boxShadow: '0 15px 35px -10px rgba(16, 185, 129, 0.4)' }}>
                {p.user.avatarUrl ? <img src={p.user.avatarUrl?.startsWith('http') ? p.user.avatarUrl : `${p.apiUrl}${p.user.avatarUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : p.user.email[0].toUpperCase()}
              </div>
              <button onClick={() => p.refs.fileInputRef.current?.click()} type="button" style={{ position: 'absolute', bottom: '0', right: '0', width: '36px', height: '36px', borderRadius: '50%', background: '#111', border: '1px solid #333', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, boxShadow: '0 5px 15px rgba(0,0,0,0.5)' }}><Icons.Camera /></button>
              <input type="file" accept="image/*" ref={p.refs.fileInputRef} onChange={p.handlers.handleFileChange} style={{ display: "none" }} />
            </div>
            <h2 style={{ margin: '0 0 5px', fontSize: '22px', color: '#fff', fontWeight: 800, letterSpacing: '-0.5px' }}>{p.user.firstName || 'User'} {p.user.lastName}</h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#666', fontWeight: 500 }}>@{p.user.username || 'username'}</p>
          </div>

          <div className="prof-tabs-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => { p.setActiveTab(tab.id as TabType); p.setIsEditing(false); }} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 24px', background: p.activeTab === tab.id ? 'rgba(255,255,255,0.05)' : 'transparent', color: p.activeTab === tab.id ? '#fff' : '#888', border: '1px solid', borderColor: p.activeTab === tab.id ? 'rgba(255,255,255,0.08)' : 'transparent', borderRadius: '20px', cursor: 'pointer', fontSize: '15px', fontWeight: 600, transition: 'all 0.2s', textAlign: 'left' }}>
                <span style={{ color: p.activeTab === tab.id ? '#10b981' : '#666' }}>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* === ПРАВАЯ ПАНЕЛЬ === */}
        <div className="prof-content-panel" style={{ flex: 1, minWidth: 0 }}>
          <div style={{ background: 'rgba(15, 15, 15, 0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px', padding: '50px', boxShadow: '0 30px 60px rgba(0,0,0,0.4)' }}>
            
            {(p.activeTab === "general" || p.activeTab === "professional") && (
              <div className="prof-form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', gap: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 10px', color: '#fff', letterSpacing: '-1px' }}>{p.activeTab === "general" ? "Personal Details" : "Professional Profile"}</h2>
                  <p style={{ color: '#888', margin: 0, fontSize: '16px' }}>{p.activeTab === "general" ? "Manage your profile information and contact details." : "Highlight your skills, bio, and experience to stand out."}</p>
                </div>
                {!p.isEditing && <button onClick={() => p.setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '16px', fontSize: '15px', fontWeight: 700, background: '#fff', color: '#000', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}><Icons.Edit /> Edit Profile</button>}
              </div>
            )}

            <form onSubmit={p.handlers.handleSave}>
              {p.activeTab === "general" && (
                <div style={{ display: 'grid', gap: '30px', animation: 'fadeIn 0.3s ease-out' }}>
                  <div className="prof-grid-two-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>First Name</label>
                      <input value={p.form.firstName} onChange={(e) => p.form.setFirstName(e.target.value)} disabled={!p.isEditing} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Last Name</label>
                      <input value={p.form.lastName} onChange={(e) => p.form.setLastName(e.target.value)} disabled={!p.isEditing} style={inputStyle} />
                    </div>
                  </div>

                  <div className="prof-grid-two-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                    {p.user.role === 'candidate' ? (
                      <div>
                        <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Career Status</label>
                        <select disabled={!p.isEditing} value={p.form.status} onChange={e => p.form.setStatus(e.target.value)} style={{ ...inputStyle, appearance: p.isEditing ? 'auto' : 'none' }}>
                          <option value="Open to work">Open to work</option><option value="Passive looking">Passive looking</option><option value="Not looking">Not looking</option><option value="Hidden">Hidden (Private)</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Your Role & Company</label>
                        <input value={p.form.bio} onChange={e => p.form.setBio(e.target.value)} disabled={!p.isEditing} placeholder={p.isEditing ? "e.g. HR Manager at TechCorp" : "Not specified"} style={inputStyle} />
                      </div>
                    )}
                    <div>
                      <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Location</label>
                      <input value={p.form.location} onChange={e => p.form.setLocation(e.target.value)} disabled={!p.isEditing} placeholder={p.isEditing ? "e.g. Warsaw, Poland or Remote" : "Remote / Global"} style={inputStyle} />
                    </div>
                  </div>

                  <div className="prof-grid-two-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Email Address</label>
                      <input value={p.user.email} disabled style={{ ...inputStyle, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.02)', color: '#555', cursor: 'not-allowed' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Phone Number</label>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <select value={p.form.countryCode} onChange={(e) => p.form.setCountryCode(e.target.value)} disabled={!p.isEditing} style={{ ...inputStyle, width: '120px', minWidth: '120px', padding: '16px 10px', appearance: p.isEditing ? 'auto' : 'none' }}>
                          {COUNTRY_CODES.map(c => <option key={c.code} value={c.code} style={{ background: '#111', color: '#fff' }}>{c.label}</option>)}
                        </select>
                        <input value={p.form.phoneNumber} onChange={p.form.handlePhoneChange} disabled={!p.isEditing} placeholder={p.isEditing ? "123 456 789" : "Not set"} style={{ ...inputStyle, flex: 1 }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {p.activeTab === "professional" && (
                <div style={{ display: 'grid', gap: '35px', animation: 'fadeIn 0.3s ease-out' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px dashed rgba(16, 185, 129, 0.3)', padding: '30px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px', color: '#fff', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.FileText /> Resume (CV)</h3>
                      <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>{p.form.resumeUrl ? "You have uploaded a resume. Employers can download it from your profile." : "Upload your resume in PDF format to stand out."}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      {p.form.resumeUrl && <a href={p.form.resumeUrl.startsWith('http') ? p.form.resumeUrl : `${p.apiUrl}/${p.form.resumeUrl}`} target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', fontWeight: 800, textDecoration: 'none', fontSize: '14px', border: '1px solid #10b981', padding: '12px 20px', borderRadius: '12px' }}>View My Resume</a>}
                      <input type="file" accept=".pdf,.doc,.docx" ref={p.refs.resumeInputRef} onChange={p.handlers.handleResumeUpload} style={{ display: 'none' }} />
                      <button type="button" onClick={() => p.refs.resumeInputRef.current?.click()} style={{ background: '#10b981', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap' }}>{p.form.resumeUrl ? "Update Resume" : "Upload Resume"}</button>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Bio / About Me</label>
                    <textarea value={p.form.bio} onChange={e => p.form.setBio(e.target.value)} disabled={!p.isEditing} placeholder={p.isEditing ? "Tell employers about your passion, experience, and what makes you unique..." : "No bio provided."} style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Top Skills (Comma separated)</label>
                    <input value={p.form.skills} onChange={e => p.form.setSkills(e.target.value)} disabled={!p.isEditing} placeholder={p.isEditing ? "e.g. React, TypeScript, Node.js, AWS" : "No skills added."} style={inputStyle} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <label style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Professional Experience</label>
                      {p.isEditing && <button type="button" onClick={p.form.addExperience} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', color: '#10b981', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}><Icons.Plus /> Add Role</button>}
                    </div>
                    {p.form.experience.length === 0 && !p.isEditing && <div style={{ color: '#666', fontStyle: 'italic', fontSize: '14px' }}>No experience added yet.</div>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {p.form.experience.map((exp: any) => (
                        <div key={exp.id} style={{ background: p.isEditing ? 'rgba(255,255,255,0.02)' : 'transparent', border: p.isEditing ? '1px solid rgba(255,255,255,0.05)' : 'none', padding: p.isEditing ? '20px' : '0', borderRadius: '16px', position: 'relative' }}>
                          {p.isEditing && <button type="button" onClick={() => p.form.removeExperience(exp.id)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer' }}><Icons.Trash /></button>}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <input value={exp.title} onChange={e => p.form.updateExperience(exp.id, 'title', e.target.value)} disabled={!p.isEditing} placeholder="Job Title" style={{ ...inputStyle, padding: '12px 16px', fontSize: '14px', fontWeight: p.isEditing ? 400 : 700, color: '#fff', border: p.isEditing ? inputStyle.border : 'none', background: p.isEditing ? inputStyle.background : 'transparent' }} />
                            <input value={exp.company} onChange={e => p.form.updateExperience(exp.id, 'company', e.target.value)} disabled={!p.isEditing} placeholder="Company Name" style={{ ...inputStyle, padding: '12px 16px', fontSize: '14px', border: p.isEditing ? inputStyle.border : 'none', background: p.isEditing ? inputStyle.background : 'transparent', paddingLeft: p.isEditing ? '16px' : '0' }} />
                          </div>
                          <input value={exp.period} onChange={e => p.form.updateExperience(exp.id, 'period', e.target.value)} disabled={!p.isEditing} placeholder="Period (e.g. Jan 2021 - Present)" style={{ ...inputStyle, padding: '12px 16px', fontSize: '13px', color: '#888', marginBottom: '15px', border: p.isEditing ? inputStyle.border : 'none', background: p.isEditing ? inputStyle.background : 'transparent', paddingLeft: p.isEditing ? '16px' : '0' }} />
                          <textarea value={exp.description} onChange={e => p.form.updateExperience(exp.id, 'description', e.target.value)} disabled={!p.isEditing} placeholder="Describe your achievements..." style={{ ...inputStyle, padding: '12px 16px', fontSize: '14px', minHeight: '80px', border: p.isEditing ? inputStyle.border : 'none', background: p.isEditing ? inputStyle.background : 'transparent', paddingLeft: p.isEditing ? '16px' : '0' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(p.activeTab === "general" || p.activeTab === "professional") && p.isEditing && (
                <div style={{ display: 'flex', gap: '15px', marginTop: '30px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <button type="submit" disabled={p.isSaving} style={{ padding: '16px 36px', borderRadius: '16px', fontSize: '16px', fontWeight: 800, background: '#10b981', color: '#000', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)' }}>{p.isSaving ? "Saving..." : "Save Changes"}</button>
                  <button type="button" onClick={p.handlers.handleCancel} style={{ padding: '16px 36px', borderRadius: '16px', fontSize: '16px', fontWeight: 700, background: 'transparent', color: '#888', border: 'none', cursor: 'pointer' }}>Cancel</button>
                </div>
              )}
            </form>

            {p.activeTab === 'privacy' && (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-1px' }}>Privacy Settings</h2>
                <p style={{ color: '#888', fontSize: '16px', marginBottom: '40px' }}>Control your visibility and who can see your data on the platform.</p>
                <div style={{ display: 'grid', gap: '20px', marginBottom: '30px' }}>
                  <div className="prof-settings-row" style={{ background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                    <div><div style={{ color: '#fff', fontSize: '16px', fontWeight: 700, marginBottom: '5px' }}>Public Profile</div><div style={{ color: '#666', fontSize: '14px' }}>Allow verified employers to find you in search results.</div></div>
                    <Toggle active={p.settings.isPublic} onClick={() => { const nextVal = !p.settings.isPublic; p.settings.setIsPublic(nextVal); p.settings.handleSaveSettings({ isPublic: nextVal, showEmail: p.settings.showEmail }); }} />
                  </div>
                  <div className="prof-settings-row" style={{ background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                    <div><div style={{ color: '#fff', fontSize: '16px', fontWeight: 700, marginBottom: '5px' }}>Show Email Address</div><div style={{ color: '#666', fontSize: '14px' }}>Visible only to companies you've explicitly applied to.</div></div>
                    <Toggle active={p.settings.showEmail} onClick={() => { const nextVal = !p.settings.showEmail; p.settings.setShowEmail(nextVal); p.settings.handleSaveSettings({ isPublic: p.settings.isPublic, showEmail: nextVal }); }} />
                  </div>
                </div>
              </div>
            )}

            {p.activeTab === 'notifications' && (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-1px' }}>Notification Preferences</h2>
                <p style={{ color: '#888', fontSize: '16px', marginBottom: '40px' }}>Customize how and when we alert you about new messages and application updates.</p>
                <div style={{ display: 'grid', gap: '20px', marginBottom: '30px' }}>
                  <div className="prof-settings-row" style={{ background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                    <div><div style={{ color: '#fff', fontSize: '16px', fontWeight: 700, marginBottom: '5px' }}>In-App Push Notifications</div><div style={{ color: '#666', fontSize: '14px' }}>Show real-time alerts in the bottom right corner of your screen.</div></div>
                    <Toggle active={p.settings.toastsEnabled} onClick={() => { const nextVal = !p.settings.toastsEnabled; p.settings.setToastsEnabled(nextVal); p.settings.handleSaveSettings({ soundEnabled: p.settings.soundEnabled, toastsEnabled: nextVal, notificationVolume: p.settings.notificationVolume }); }} />
                  </div>
                  <div className="prof-settings-row" style={{ background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                    <div><div style={{ color: '#fff', fontSize: '16px', fontWeight: 700, marginBottom: '5px' }}>Sound Alerts</div><div style={{ color: '#666', fontSize: '14px' }}>Play a soft notification sound when a new message arrives.</div></div>
                    <Toggle active={p.settings.soundEnabled} onClick={() => { const nextVal = !p.settings.soundEnabled; p.settings.setSoundEnabled(nextVal); p.settings.handleSaveSettings({ soundEnabled: nextVal, toastsEnabled: p.settings.toastsEnabled, notificationVolume: p.settings.notificationVolume }); }} />
                  </div>
                  {p.settings.soundEnabled && (
                    <div className="prof-settings-row" style={{ background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.2s ease-out' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div><div style={{ color: '#fff', fontSize: '16px', fontWeight: 700, marginBottom: '5px' }}>Alert Volume</div><div style={{ color: '#666', fontSize: '14px' }}>Adjust the loudness of real-time audio alerts.</div></div>
                        <span style={{ color: '#10b981', fontWeight: 800, fontSize: '14px', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 14px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.15)' }}>{p.settings.notificationVolume}%</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <input type="range" min={0} max={100} step={5} value={p.settings.notificationVolume} onChange={(e) => p.settings.setNotificationVolume(Number(e.target.value))} onMouseUp={() => { p.settings.handleSaveSettings({ soundEnabled: p.settings.soundEnabled, toastsEnabled: p.settings.toastsEnabled, notificationVolume: p.settings.notificationVolume }); const testAudio = new Audio('/notify.mp3'); testAudio.volume = p.settings.notificationVolume / 100; testAudio.play().catch(() => {}); }} onTouchEnd={() => { p.settings.handleSaveSettings({ soundEnabled: p.settings.soundEnabled, toastsEnabled: p.settings.toastsEnabled, notificationVolume: p.settings.notificationVolume }); const testAudio = new Audio('/notify.mp3'); testAudio.volume = p.settings.notificationVolume / 100; testAudio.play().catch(() => {}); }} style={{ flex: 1, cursor: 'pointer', accentColor: '#10b981', background: '#222', height: '6px', borderRadius: '3px', appearance: 'none', outline: 'none' }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {p.activeTab === "security" && (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <div style={{ marginBottom: '40px' }}>
                  <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-1px' }}>Security Settings</h2>
                  <p style={{ color: '#888', margin: 0, fontSize: '16px' }}>Manage your account security, passwords, and two-factor authentication.</p>
                </div>
                <div style={{ display: 'grid', gap: '25px' }}>
                  <div className="prof-settings-row" style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '35px', borderRadius: '24px', border: '1px solid rgba(16, 185, 129, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                    <div>
                      <div style={{ color: '#10b981', fontWeight: 800, marginBottom: '5px', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>Recommended</div>
                      <div style={{ color: '#fff', fontSize: '16px', fontWeight: 700, marginBottom: '5px' }}>Two-Factor Authentication (2FA)</div>
                      <div style={{ color: '#888', fontSize: '14px' }}>Add an extra layer of security to your account using TOTP.</div>
                    </div>
                    <Toggle active={p.security.twoFactor} onClick={p.security.handleToggle2FA} />
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '35px' }}>
                    <h3 style={{ margin: '0 0 15px', fontSize: '20px', color: '#fff', fontWeight: 800 }}>Change Password</h3>
                    <p style={{ color: '#888', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px', maxWidth: '550px' }}>For security reasons, we use email confirmation to change passwords. Click the button below, and we will send a secure link to <span style={{ color: '#fff', fontWeight: 600 }}>{p.user.email}</span>.</p>
                    {p.security.resetMsg ? (
                      <div style={{ padding: '16px 24px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                        <Icons.Check /> {p.security.resetMsg}
                      </div>
                    ) : (
                      <button onClick={p.security.handlePasswordResetRequest} disabled={p.security.isResetting} style={{ background: '#fff', color: '#000', border: 'none', padding: '16px 32px', borderRadius: '16px', cursor: 'pointer', fontWeight: 800, fontSize: '15px' }}>
                        {p.security.isResetting ? "Sending Request..." : "Send Password Reset Link"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {p.message && (
              <div style={{ position: 'fixed', bottom: '40px', right: '40px', background: '#10b981', color: '#000', padding: '16px 32px', borderRadius: '16px', fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 100 }}>
                <Icons.Check /> {p.message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === МОДАЛЬНОЕ ОКНО 2FA === */}
      {p.security.show2FAModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '15px' }}>
          <div className="prof-2fa-modal-inner" style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '24px', padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
            <h3 style={{ margin: '0 0 15px', color: '#fff', fontSize: '24px', fontWeight: 800 }}>Setup Google Authenticator</h3>
            <p style={{ color: '#888', fontSize: '14px', lineHeight: '1.6', marginBottom: '25px' }}>Scan the QR code below with your Authenticator app, then enter the 6-digit code.</p>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '16px', display: 'inline-block', marginBottom: '25px' }}>
              {p.security.qrCode ? <img src={p.security.qrCode} alt="2FA QR Code" style={{ width: '180px', height: '180px', display: 'block' }} /> : <div style={{ width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>Loading...</div>}
            </div>
            <input type="text" placeholder="000000" maxLength={6} value={p.security.twoFactorCode} onChange={(e) => p.security.setTwoFactorCode(e.target.value.replace(/\D/g, ''))} style={{ width: '100%', background: '#000', border: '1px solid #333', color: '#fff', padding: '16px', borderRadius: '12px', textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: 800, marginBottom: '20px', outline: 'none' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => p.security.setShow2FAModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#111', color: '#888', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
              <button onClick={p.security.handleVerify2FA} disabled={p.security.isVerifying2FA || p.security.twoFactorCode.length !== 6} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#10b981', color: '#000', border: 'none', cursor: p.security.twoFactorCode.length === 6 ? 'pointer' : 'not-allowed', fontWeight: 800, opacity: p.security.twoFactorCode.length === 6 ? 1 : 0.5 }}>
                {p.security.isVerifying2FA ? "Verifying..." : "Verify & Enable"}
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