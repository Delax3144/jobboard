import { useState, useEffect, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import Modal from "../components/Modal";

// === Полный набор SVG Иконок ===
const Icons = {
  User: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>,
  Lock: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>,
  Camera: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>,
  Check: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>,
  Edit: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"></path></svg>,
  Eye: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Code: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>,
  Bell: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  ZoomOut: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>,
  ZoomIn: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>,
  Plus: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>,
  Trash: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>,
  FileText: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>,
};

// --- Компонент переключателя (Toggle) ---
const Toggle = ({ active, onClick, disabled }: { active: boolean, onClick: () => void, disabled?: boolean }) => (
  <div 
    onClick={disabled ? undefined : onClick}
    style={{
      width: '44px', height: '24px', borderRadius: '12px',
      background: active ? '#10b981' : '#222',
      position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease',
      border: active ? '1px solid #10b981' : '1px solid #333',
      opacity: disabled ? 0.5 : 1
    }}
  >
    <div style={{
      width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
      position: 'absolute', top: '2px', left: active ? '22px' : '2px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
    }} />
  </div>
);

// Коды стран
const COUNTRY_CODES = [
  { code: "+48", label: "+48 (PL)" },
  { code: "+380", label: "+380 (UA)" },
  { code: "+1", label: "+1 (US/CA)" },
  { code: "+44", label: "+44 (UK)" },
  { code: "+49", label: "+49 (DE)" },
  { code: "+370", label: "+370 (LT)" },
  { code: "+371", label: "+371 (LV)" },
  { code: "+372", label: "+372 (EE)" },
  { code: "+995", label: "+995 (GE)" }
];

export default function Profile() {
  const { user, setUser } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const parsePhone = (fullPhone: string) => {
    let code = "+48";
    let number = fullPhone || "";
    for (const c of COUNTRY_CODES) {
      if (number.startsWith(c.code)) {
        code = c.code;
        number = number.slice(c.code.length).trim();
        break;
      }
    }
    return { code, number: number.replace(/\D/g, '') };
  };

  const initialPhone = parsePhone(user?.phone || "");

  // Вкладки
  type TabType = "general" | "professional" | "privacy" | "notifications" | "security";
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [isEditing, setIsEditing] = useState(false);
  
  // States - General
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [countryCode, setCountryCode] = useState(initialPhone.code);
  const [phoneNumber, setPhoneNumber] = useState(initialPhone.number);
  const [status, setStatus] = useState((user as any)?.status || "Open to work");
  const [location, setLocation] = useState((user as any)?.location || "");
  
  // States - Professional
  const [bio, setBio] = useState((user as any)?.bio || "");
  const [skills, setSkills] = useState((user as any)?.skills || "");
  const [experience, setExperience] = useState<any[]>(typeof (user as any)?.experience === 'string' ? JSON.parse((user as any).experience) : ((user as any)?.experience || []));
  const [resumeUrl, setResumeUrl] = useState((user as any)?.resumeUrl || null);
  
  // Privacy States
  const [isPublic, setIsPublic] = useState((user as any)?.isPublic ?? true);
  const [showEmail, setShowEmail] = useState((user as any)?.showEmail ?? false);

  // Notifications States
  const [soundEnabled, setSoundEnabled] = useState((user as any)?.soundEnabled ?? true);
  const [toastsEnabled, setToastsEnabled] = useState((user as any)?.toastsEnabled ?? true);
  const [notificationVolume, setNotificationVolume] = useState((user as any)?.notificationVolume ?? 50);
  
  // Security States (2FA)
  const [twoFactor, setTwoFactor] = useState((user as any)?.isTwoFactorEnabled || false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const [isResetting, setIsResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState("");

  // === КРОППЕР СТЕЙТЫ ===
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [openCropper, setOpenCropper] = useState(false);
  const [isAvatarSaving, setIsAvatarSaving] = useState(false);

  if (!user) return <div style={{ color: '#fff', textAlign: 'center', padding: '100px' }}>Loading...</div>;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNums = e.target.value.replace(/\D/g, '');
    setPhoneNumber(onlyNums);
  };

  const handleCancel = () => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    const parsed = parsePhone(user?.phone || "");
    setCountryCode(parsed.code);
    setPhoneNumber(parsed.number);
    setStatus((user as any)?.status || "Open to work");
    setBio((user as any)?.bio || ""); 
    setSkills((user as any)?.skills || "");
    setExperience(typeof (user as any)?.experience === 'string' ? JSON.parse((user as any).experience) : ((user as any)?.experience || []));
    setIsEditing(false);
    setMessage("");
    setLocation((user as any)?.location || "");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;
    
    setIsSaving(true);
    const fullPhone = phoneNumber ? `${countryCode} ${phoneNumber}` : "";
    
    try {
      const res = await api.put("/auth/profile", { 
        firstName, lastName, phone: fullPhone, status, bio, skills, experience, location 
      });
      setUser(res.data.user);
      setMessage("Profile updated successfully.");
      setIsEditing(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async (fieldsToUpdate: Record<string, any>) => {
    try {
      const res = await api.put("/auth/profile", fieldsToUpdate);
      setUser(res.data.user);
      setMessage("Settings saved successfully! ⚙️");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      alert("Failed to save settings. Please make sure the backend is running and updated.");
    }
  };

  // --- Загрузка Резюме ---
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("resume", file);

    try {
      setMessage("Uploading resume...");
      const res = await api.post("/auth/resume", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setResumeUrl(res.data.user.resumeUrl);
      setUser({ ...user, resumeUrl: res.data.user.resumeUrl } as any);
      setMessage("Resume uploaded successfully! 📄");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      alert("Failed to upload resume. Ensure the backend endpoint exists.");
      setMessage("");
    }
  };

  // --- Работа с массивом Опыта ---
  const addExperience = () => {
    setExperience([...experience, { id: Date.now(), title: "", company: "", period: "", description: "" }]);
  };
  const updateExperience = (id: number, field: string, value: string) => {
    setExperience(experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  };
  const removeExperience = (id: number) => {
    setExperience(experience.filter(exp => exp.id !== id));
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageSrc(reader.result as string);
      setOpenCropper(true);
    });
    reader.readAsDataURL(file);
    e.target.value = ""; 
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCroppedAvatar = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    
    setIsAvatarSaving(true);
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedImageBlob) throw new Error("Crop failed");

      const formData = new FormData();
      formData.append("avatar", croppedImageBlob, "avatar.jpg");

      const res = await api.post("/auth/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setUser(res.data.user);
      setOpenCropper(false);
      setImageSrc(null);
      setMessage("Avatar updated successfully! 📸");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      alert("Failed to upload avatar");
    } finally {
      setIsAvatarSaving(false);
    }
  };

  const handlePasswordResetRequest = async () => {
    setIsResetting(true);
    try {
      const res = await api.post("/auth/request-password-reset", { email: user.email });
      setResetMsg(res.data.message);
    } catch (err) {
      setResetMsg("Failed to send request.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleToggle2FA = async () => {
    if (twoFactor) {
      if (window.confirm("Are you sure you want to disable Two-Factor Authentication?")) {
        try {
          await api.post('/auth/2fa/disable');
          setTwoFactor(false);
          setUser({ ...user, isTwoFactorEnabled: false } as any);
          setMessage("2FA disabled successfully");
          setTimeout(() => setMessage(""), 3000);
        } catch (err) { alert("Failed to disable 2FA"); }
      }
    } else {
      try {
        const res = await api.post('/auth/2fa/generate');
        setQrCode(res.data.qrCodeUrl);
        setShow2FAModal(true);
      } catch (err) { alert("Failed to generate 2FA"); }
    }
  };

  const handleVerify2FA = async () => {
    if (twoFactorCode.length !== 6) return alert("Code must be 6 digits");
    setIsVerifying2FA(true);
    try {
      await api.post('/auth/2fa/enable', { code: twoFactorCode });
      setTwoFactor(true);
      setUser({ ...user, isTwoFactorEnabled: true } as any);
      setShow2FAModal(false);
      setTwoFactorCode("");
      setMessage("2FA enabled successfully! 🛡️");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      alert("Invalid code. Please try again.");
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const inputStyle = {
    background: isEditing ? '#000' : 'rgba(255,255,255,0.02)',
    border: isEditing ? '1px solid #333' : '1px solid rgba(255,255,255,0.05)',
    color: isEditing ? '#fff' : '#888',
    width: '100%', padding: '16px 20px', borderRadius: '16px',
    transition: 'all 0.2s', outline: 'none', fontSize: '15px', fontFamily: 'inherit'
  };

  const TABS = [
    { id: 'general', label: 'Personal Details', icon: <Icons.User /> },
    ...(user.role === 'candidate' ? [{ id: 'professional', label: 'Professional Profile', icon: <Icons.Code /> }] : []),
    { id: 'privacy', label: 'Privacy', icon: <Icons.Eye /> },
    { id: 'notifications', label: 'Notifications', icon: <Icons.Bell /> },
    { id: 'security', label: 'Security & Password', icon: <Icons.Lock /> }
  ];

  return (
    <div className="prof-page-container" style={{ 
      background: '#050505', width: '100vw', position: 'relative', left: '50%', right: '50%',
      marginLeft: '-50vw', marginRight: '-50vw', minHeight: 'calc(100vh - 100px)', overflowX: 'clip' 
    }}>
      
      <div style={{ position: 'absolute', top: '0', left: '20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '0', right: '10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <div className="prof-layout-wrapper" style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 20px', display: 'flex', gap: '50px', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        
        {/* === ЛЕВАЯ ПАНЕЛЬ === */}
        <div className="prof-sidebar-panel" style={{ width: '300px', flexShrink: 0 }}>
          <div style={{ 
            background: 'rgba(15, 15, 15, 0.7)', backdropFilter: 'blur(20px)', 
            border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', 
            padding: '40px 20px', textAlign: 'center', marginBottom: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}>
            
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 25px' }}>
              <div style={{ 
                width: "100%", height: "100%", borderRadius: "50%", background: "linear-gradient(135deg, #10b981, #059669)", 
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "42px", 
                fontWeight: "900", color: "#000", overflow: "hidden", border: "3px solid #1a1a1a",
                boxShadow: '0 15px 35px -10px rgba(16, 185, 129, 0.4)'
              }}>
                {user.avatarUrl ? (
                  <img src={user.avatarUrl?.startsWith('http') ? user.avatarUrl : `${apiUrl}${user.avatarUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user.email[0].toUpperCase()
                )}
              </div>
              
              <button 
                onClick={handleAvatarClick}
                type="button"
                style={{
                  position: 'absolute', bottom: '0', right: '0', width: '36px', height: '36px', 
                  borderRadius: '50%', background: '#111', border: '1px solid #333', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', 
                  transition: 'transform 0.2s, background 0.2s', padding: 0, boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
                }}
              >
                <Icons.Camera />
              </button>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} />
            </div>
            
            <h2 style={{ margin: '0 0 5px', fontSize: '22px', color: '#fff', fontWeight: 800, letterSpacing: '-0.5px' }}>{user.firstName || 'User'} {user.lastName}</h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#666', fontWeight: 500 }}>@{user.username || 'username'}</p>
          </div>

          <div className="prof-tabs-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {TABS.map(tab => (
              <button 
                key={tab.id} 
                onClick={() => { setActiveTab(tab.id as TabType); setIsEditing(false); }} 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 24px', 
                  background: activeTab === tab.id ? 'rgba(255,255,255,0.05)' : 'transparent', 
                  color: activeTab === tab.id ? '#fff' : '#888', 
                  border: '1px solid', borderColor: activeTab === tab.id ? 'rgba(255,255,255,0.08)' : 'transparent', 
                  borderRadius: '20px', cursor: 'pointer', fontSize: '15px', fontWeight: 600, transition: 'all 0.2s', textAlign: 'left' 
                }}
              >
                <span style={{ color: activeTab === tab.id ? '#10b981' : '#666' }}>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* === ПРАВАЯ ПАНЕЛЬ === */}
        <div className="prof-content-panel" style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            background: 'rgba(15, 15, 15, 0.7)', backdropFilter: 'blur(20px)', 
            border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40px', 
            padding: '50px', boxShadow: '0 30px 60px rgba(0,0,0,0.4)' 
          }}>
            
            {(activeTab === "general" || activeTab === "professional") && (
              <div className="prof-form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', gap: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 10px', color: '#fff', letterSpacing: '-1px' }}>
                    {activeTab === "general" ? "Personal Details" : "Professional Profile"}
                  </h2>
                  <p style={{ color: '#888', margin: 0, fontSize: '16px' }}>
                    {activeTab === "general" ? "Manage your profile information and contact details." : "Highlight your skills, bio, and experience to stand out."}
                  </p>
                </div>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)} 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '16px', fontSize: '15px', fontWeight: 700, background: '#fff', color: '#000', border: 'none', cursor: 'pointer', transition: 'transform 0.2s', whiteSpace: 'nowrap' }}
                  >
                    <Icons.Edit /> Edit Profile
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleSave}>
              {/* === ВКЛАДКА 1: ОСНОВНОЕ (ДЛЯ ВСЕХ) === */}
              {activeTab === "general" && (
                <div style={{ display: 'grid', gap: '30px', animation: 'fadeIn 0.3s ease-out' }}>
                  <div className="prof-grid-two-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>First Name</label>
                      <input value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={!isEditing} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Last Name</label>
                      <input value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={!isEditing} style={inputStyle} />
                    </div>
                  </div>

                  {/* === УМНЫЙ БЛОК: РАЗНЫЕ ПОЛЯ ДЛЯ КАНДИДАТА И РАБОТОДАТЕЛЯ === */}
                  <div className="prof-grid-two-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                    {user.role === 'candidate' ? (
                      <div>
                        <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Career Status</label>
                        <select disabled={!isEditing} value={status} onChange={e => setStatus(e.target.value)} style={{ ...inputStyle, appearance: isEditing ? 'auto' : 'none' }}>
                          <option value="Open to work">Open to work</option>
                          <option value="Passive looking">Passive looking</option>
                          <option value="Not looking">Not looking</option>
                          <option value="Hidden">Hidden (Private)</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Your Role & Company</label>
                        <input 
                          value={bio} onChange={e => setBio(e.target.value)} disabled={!isEditing} 
                          placeholder={isEditing ? "e.g. HR Manager at TechCorp" : "Not specified"} style={inputStyle} 
                        />
                      </div>
                    )}
                    <div>
                      <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Location</label>
                      <input 
                        value={location} onChange={e => setLocation(e.target.value)} disabled={!isEditing} 
                        placeholder={isEditing ? "e.g. Warsaw, Poland or Remote" : "Remote / Global"} style={inputStyle} 
                      />
                    </div>
                  </div>

                  <div className="prof-grid-two-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Email Address</label>
                      <input value={user.email} disabled style={{ ...inputStyle, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.02)', color: '#555', cursor: 'not-allowed' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Phone Number</label>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} disabled={!isEditing} style={{ ...inputStyle, width: '120px', minWidth: '120px', padding: '16px 10px', appearance: isEditing ? 'auto' : 'none' }}>
                          {COUNTRY_CODES.map(c => <option key={c.code} value={c.code} style={{ background: '#111', color: '#fff' }}>{c.label}</option>)}
                        </select>
                        <input value={phoneNumber} onChange={handlePhoneChange} disabled={!isEditing} placeholder={isEditing ? "123 456 789" : "Not set"} style={{ ...inputStyle, flex: 1 }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* === ВКЛАДКА 2: PROFESSIONAL === */}
              {activeTab === "professional" && (
                <div style={{ display: 'grid', gap: '35px', animation: 'fadeIn 0.3s ease-out' }}>
                  
                  {/* Загрузка Резюме */}
                  <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px dashed rgba(16, 185, 129, 0.3)', padding: '30px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px', color: '#fff', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.FileText /> Resume (CV)</h3>
                      <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>{resumeUrl ? "You have uploaded a resume. Employers can download it from your profile." : "Upload your resume in PDF format to stand out."}</p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      {/* НОВАЯ КНОПКА: ПОСМОТРЕТЬ РЕЗЮМЕ */}
                      {resumeUrl && (
                        <a 
                          href={resumeUrl.startsWith('http') ? resumeUrl : `${apiUrl}/${resumeUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ color: '#10b981', fontWeight: 800, textDecoration: 'none', fontSize: '14px', border: '1px solid #10b981', padding: '12px 20px', borderRadius: '12px' }}
                        >
                          View My Resume
                        </a>
                      )}
                      
                      <input type="file" accept=".pdf,.doc,.docx" ref={resumeInputRef} onChange={handleResumeUpload} style={{ display: 'none' }} />
                      <button type="button" onClick={() => resumeInputRef.current?.click()} style={{ background: '#10b981', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap' }}>
                        {resumeUrl ? "Update Resume" : "Upload Resume"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Bio / About Me</label>
                    <textarea 
                      value={bio} onChange={e => setBio(e.target.value)} disabled={!isEditing}
                      placeholder={isEditing ? "Tell employers about your passion, experience, and what makes you unique..." : "No bio provided."}
                      style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Top Skills (Comma separated)</label>
                    <input 
                      value={skills} onChange={e => setSkills(e.target.value)} disabled={!isEditing}
                      placeholder={isEditing ? "e.g. React, TypeScript, Node.js, AWS" : "No skills added."}
                      style={inputStyle} 
                    />
                  </div>

                  {/* БЛОК ОПЫТА РАБОТЫ */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <label style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Professional Experience</label>
                      {isEditing && (
                        <button type="button" onClick={addExperience} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', color: '#10b981', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>
                          <Icons.Plus /> Add Role
                        </button>
                      )}
                    </div>

                    {experience.length === 0 && !isEditing && <div style={{ color: '#666', fontStyle: 'italic', fontSize: '14px' }}>No experience added yet.</div>}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {experience.map((exp) => (
                        <div key={exp.id} style={{ background: isEditing ? 'rgba(255,255,255,0.02)' : 'transparent', border: isEditing ? '1px solid rgba(255,255,255,0.05)' : 'none', padding: isEditing ? '20px' : '0', borderRadius: '16px', position: 'relative' }}>
                          {isEditing && (
                            <button type="button" onClick={() => removeExperience(exp.id)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer' }}>
                              <Icons.Trash />
                            </button>
                          )}
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <input value={exp.title} onChange={e => updateExperience(exp.id, 'title', e.target.value)} disabled={!isEditing} placeholder="Job Title (e.g. Frontend Engineer)" style={{ ...inputStyle, padding: '12px 16px', fontSize: '14px', fontWeight: isEditing ? 400 : 700, color: '#fff', border: isEditing ? inputStyle.border : 'none', background: isEditing ? inputStyle.background : 'transparent' }} />
                            <input value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} disabled={!isEditing} placeholder="Company Name" style={{ ...inputStyle, padding: '12px 16px', fontSize: '14px', border: isEditing ? inputStyle.border : 'none', background: isEditing ? inputStyle.background : 'transparent', paddingLeft: isEditing ? '16px' : '0' }} />
                          </div>
                          
                          <input value={exp.period} onChange={e => updateExperience(exp.id, 'period', e.target.value)} disabled={!isEditing} placeholder="Period (e.g. Jan 2021 - Present)" style={{ ...inputStyle, padding: '12px 16px', fontSize: '13px', color: '#888', marginBottom: '15px', border: isEditing ? inputStyle.border : 'none', background: isEditing ? inputStyle.background : 'transparent', paddingLeft: isEditing ? '16px' : '0' }} />
                          <textarea value={exp.description} onChange={e => updateExperience(exp.id, 'description', e.target.value)} disabled={!isEditing} placeholder="Describe your achievements..." style={{ ...inputStyle, padding: '12px 16px', fontSize: '14px', minHeight: '80px', border: isEditing ? inputStyle.border : 'none', background: isEditing ? inputStyle.background : 'transparent', paddingLeft: isEditing ? '16px' : '0' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(activeTab === "general" || activeTab === "professional") && isEditing && (
                <div style={{ display: 'flex', gap: '15px', marginTop: '30px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <button 
                    type="submit" disabled={isSaving} 
                    style={{ padding: '16px 36px', borderRadius: '16px', fontSize: '16px', fontWeight: 800, background: '#10b981', color: '#000', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)' }}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button 
                    type="button" onClick={handleCancel} 
                    style={{ padding: '16px 36px', borderRadius: '16px', fontSize: '16px', fontWeight: 700, background: 'transparent', color: '#888', border: 'none', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>

            {/* === ВКЛАДКА 3: ПРИВАТНОСТЬ === */}
            {activeTab === 'privacy' && (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-1px' }}>Privacy Settings</h2>
                <p style={{ color: '#888', fontSize: '16px', marginBottom: '40px' }}>Control your visibility and who can see your data on the platform.</p>
                
                <div style={{ display: 'grid', gap: '20px', marginBottom: '30px' }}>
                  <div className="prof-settings-row" style={{ background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                    <div>
                      <div style={{ color: '#fff', fontSize: '16px', fontWeight: 700, marginBottom: '5px' }}>Public Profile</div>
                      <div style={{ color: '#666', fontSize: '14px' }}>Allow verified employers to find you in search results.</div>
                    </div>
                    <Toggle active={isPublic} onClick={() => { 
                      const nextVal = !isPublic;
                      setIsPublic(nextVal); 
                      handleSaveSettings({ isPublic: nextVal, showEmail }); 
                    }} />
                  </div>

                  <div className="prof-settings-row" style={{ background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                    <div>
                      <div style={{ color: '#fff', fontSize: '16px', fontWeight: 700, marginBottom: '5px' }}>Show Email Address</div>
                      <div style={{ color: '#666', fontSize: '14px' }}>Visible only to companies you've explicitly applied to.</div>
                    </div>
                    <Toggle active={showEmail} onClick={() => { 
                      const nextVal = !showEmail;
                      setShowEmail(nextVal); 
                      handleSaveSettings({ isPublic, showEmail: nextVal }); 
                    }} />
                  </div>
                </div>
              </div>
            )}

            {/* === ВКЛАДКА 4: УВЕДОМЛЕНИЯ === */}
            {activeTab === 'notifications' && (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-1px' }}>Notification Preferences</h2>
                <p style={{ color: '#888', fontSize: '16px', marginBottom: '40px' }}>Customize how and when we alert you about new messages and application updates.</p>
                
                <div style={{ display: 'grid', gap: '20px', marginBottom: '30px' }}>
                  <div className="prof-settings-row" style={{ background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                    <div>
                      <div style={{ color: '#fff', fontSize: '16px', fontWeight: 700, marginBottom: '5px' }}>In-App Push Notifications</div>
                      <div style={{ color: '#666', fontSize: '14px' }}>Show real-time alerts in the bottom right corner of your screen.</div>
                    </div>
                    <Toggle active={toastsEnabled} onClick={() => { 
                      const nextVal = !toastsEnabled;
                      setToastsEnabled(nextVal); 
                      handleSaveSettings({ soundEnabled, toastsEnabled: nextVal, notificationVolume }); 
                    }} />
                  </div>

                  <div className="prof-settings-row" style={{ background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                    <div>
                      <div style={{ color: '#fff', fontSize: '16px', fontWeight: 700, marginBottom: '5px' }}>Sound Alerts</div>
                      <div style={{ color: '#666', fontSize: '14px' }}>Play a soft notification sound when a new message arrives.</div>
                    </div>
                    <Toggle active={soundEnabled} onClick={() => { 
                      const nextVal = !soundEnabled;
                      setSoundEnabled(nextVal); 
                      handleSaveSettings({ soundEnabled: nextVal, toastsEnabled, notificationVolume }); 
                    }} />
                  </div>
                  {/* === НОВЫЙ БЛОК: ПОЛУЗОНОК ГРОМКОСТИ === */}
                    {soundEnabled && (
                      <div className="prof-settings-row" style={{ 
                        background: 'rgba(255,255,255,0.02)', 
                        padding: '30px', 
                        borderRadius: '24px', 
                        border: '1px solid rgba(255,255,255,0.05)', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '20px',
                        animation: 'fadeIn 0.2s ease-out'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ color: '#fff', fontSize: '16px', fontWeight: 700, marginBottom: '5px' }}>Alert Volume</div>
                            <div style={{ color: '#666', fontSize: '14px' }}>Adjust the loudness of real-time audio alerts.</div>
                          </div>
                          {/* Красивый индикатор текущего процента громкости */}
                          <span style={{ 
                            color: '#10b981', 
                            fontWeight: 800, 
                            fontSize: '14px', 
                            background: 'rgba(16, 185, 129, 0.1)', 
                            padding: '6px 14px', 
                            borderRadius: '10px',
                            border: '1px solid rgba(16, 185, 129, 0.15)'
                          }}>
                            {notificationVolume}%
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <input 
                            type="range" 
                            min={0} 
                            max={100} 
                            step={5}
                            value={notificationVolume} 
                            onChange={(e) => setNotificationVolume(Number(e.target.value))} 
                            onMouseUp={() => {
                              // Сохраняем в базу только когда отпустили мышку
                              handleSaveSettings({ soundEnabled, toastsEnabled, notificationVolume });
                              // Воспроизводим новый приятный клик для теста громкости
                              const testAudio = new Audio('/notify.mp3');
                              testAudio.volume = notificationVolume / 100;
                              testAudio.play().catch(() => {});
                            }}
                            onTouchEnd={() => {
                              // То же самое для мобилок (когда убрали палец с экрана)
                              handleSaveSettings({ soundEnabled, toastsEnabled, notificationVolume });
                              const testAudio = new Audio('/notify.mp3');
                              testAudio.volume = notificationVolume / 100;
                              testAudio.play().catch(() => {});
                            }}
                            style={{ 
                              flex: 1, 
                              cursor: 'pointer', 
                              accentColor: '#10b981', 
                              background: '#222', 
                              height: '6px', 
                              borderRadius: '3px', 
                              appearance: 'none', 
                              outline: 'none' 
                            }}
                          />
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* === ВКЛАДКА 5: БЕЗОПАСНОСТЬ === */}
            {activeTab === "security" && (
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
                    <Toggle active={twoFactor} onClick={handleToggle2FA} />
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '35px' }}>
                    <h3 style={{ margin: '0 0 15px', fontSize: '20px', color: '#fff', fontWeight: 800 }}>Change Password</h3>
                    <p style={{ color: '#888', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px', maxWidth: '550px' }}>
                      For security reasons, we use email confirmation to change passwords. Click the button below, and we will send a secure link to <span style={{ color: '#fff', fontWeight: 600 }}>{user.email}</span>.
                    </p>
                    
                    {resetMsg ? (
                      <div style={{ padding: '16px 24px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                        <Icons.Check /> {resetMsg}
                      </div>
                    ) : (
                      <button 
                        onClick={handlePasswordResetRequest} 
                        disabled={isResetting} 
                        style={{ background: '#fff', color: '#000', border: 'none', padding: '16px 32px', borderRadius: '16px', cursor: 'pointer', fontWeight: 800, fontSize: '15px' }}
                      >
                        {isResetting ? "Sending Request..." : "Send Password Reset Link"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {message && (
              <div style={{ position: 'fixed', bottom: '40px', right: '40px', background: '#10b981', color: '#000', padding: '16px 32px', borderRadius: '16px', fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 100 }}>
                <Icons.Check /> {message}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* === МОДАЛЬНОЕ ОКНО 2FA === */}
      {show2FAModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '15px' }}>
          <div className="prof-2fa-modal-inner" style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '24px', padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
            <h3 style={{ margin: '0 0 15px', color: '#fff', fontSize: '24px', fontWeight: 800 }}>Setup Google Authenticator</h3>
            <p style={{ color: '#888', fontSize: '14px', lineHeight: '1.6', marginBottom: '25px' }}>
              Scan the QR code below with your Authenticator app, then enter the 6-digit code.
            </p>
            
            <div style={{ background: '#fff', padding: '15px', borderRadius: '16px', display: 'inline-block', marginBottom: '25px' }}>
              {qrCode ? <img src={qrCode} alt="2FA QR Code" style={{ width: '180px', height: '180px', display: 'block' }} /> : <div style={{ width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>Loading...</div>}
            </div>

            <input 
              type="text" 
              placeholder="000000" 
              maxLength={6}
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
              style={{ width: '100%', background: '#000', border: '1px solid #333', color: '#fff', padding: '16px', borderRadius: '12px', textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: 800, marginBottom: '20px', outline: 'none' }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShow2FAModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#111', color: '#888', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
              <button onClick={handleVerify2FA} disabled={isVerifying2FA || twoFactorCode.length !== 6} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#10b981', color: '#000', border: 'none', cursor: twoFactorCode.length === 6 ? 'pointer' : 'not-allowed', fontWeight: 800, opacity: twoFactorCode.length === 6 ? 1 : 0.5 }}>
                {isVerifying2FA ? "Verifying..." : "Verify & Enable"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === МОДАЛКА КРОППЕРА === */}
      <Modal open={openCropper} title="Adjust your Profile Picture" onClose={() => setOpenCropper(false)}>
        <div className="prof-cropper-modal-container">
          <p style={{ color: '#888', marginTop: 0, marginBottom: '25px', fontSize: '15px' }}>
            Drag to position, use the slider to zoom.
          </p>
          
          <div className="prof-cropper-frame-view" style={{ position: 'relative', width: '100%', height: '350px', background: '#000', borderRadius: '20px', overflow: 'hidden', border: '1px solid #222', marginBottom: '25px' }}>
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                style={{
                  containerStyle: { background: '#000' },
                  mediaStyle: {},
                  cropAreaStyle: { border: '2px solid #10b981', boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.85)' }
                }}
              />
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '0 10px', marginBottom: '35px' }}>
            <span style={{ color: '#555' }}><Icons.ZoomOut /></span>
            <input 
              type="range" value={zoom} min={1} max={3} step={0.1} aria-labelledby="Zoom" 
              onChange={(e) => setZoom(Number(e.target.value))} 
              style={{ flex: 1, cursor: 'pointer', accentColor: '#10b981', background: '#222', height: '4px', borderRadius: '2px', appearance: 'none', outline: 'none' }}
            />
            <span style={{ color: '#555' }}><Icons.ZoomIn /></span>
          </div>

          <div className="prof-cropper-actions" style={{ display: 'flex', gap: '15px', borderTop: '1px solid #1a1a1a', paddingTop: '25px' }}>
            <button 
              onClick={handleSaveCroppedAvatar} disabled={isAvatarSaving}
              className="btn btnPrimary pill" style={{ flex: 1, padding: '16px', fontSize: '15px', fontWeight: 800 }}
            >
              {isAvatarSaving ? "Saving..." : "Set as Profile Picture"}
            </button>
            <button 
              onClick={() => { setOpenCropper(false); setImageSrc(null); }} 
              className="btn pill" style={{ padding: '16px 25px', background: '#111', color: '#888', border: '1px solid #333' }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob | null> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9);
  });
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });