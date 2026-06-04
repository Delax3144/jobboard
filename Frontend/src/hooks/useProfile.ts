// src/hooks/useProfile.ts
import { useState, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

export type TabType = "general" | "professional" | "privacy" | "notifications" | "security";

export const COUNTRY_CODES = [
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

export function useProfile() {
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

  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  // General States
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [countryCode, setCountryCode] = useState(initialPhone.code);
  const [phoneNumber, setPhoneNumber] = useState(initialPhone.number);
  const [status, setStatus] = useState((user as any)?.status || "Open to work");
  const [location, setLocation] = useState((user as any)?.location || "");
  
  // Professional States
  const [bio, setBio] = useState((user as any)?.bio || "");
  const [skills, setSkills] = useState((user as any)?.skills || "");
  const [experience, setExperience] = useState<any[]>(typeof (user as any)?.experience === 'string' ? JSON.parse((user as any).experience) : ((user as any)?.experience || []));
  const [resumeUrl, setResumeUrl] = useState((user as any)?.resumeUrl || null);
  
  // Settings States
  const [isPublic, setIsPublic] = useState((user as any)?.isPublic ?? true);
  const [showEmail, setShowEmail] = useState((user as any)?.showEmail ?? false);
  const [soundEnabled, setSoundEnabled] = useState((user as any)?.soundEnabled ?? true);
  const [toastsEnabled, setToastsEnabled] = useState((user as any)?.toastsEnabled ?? true);
  const [notificationVolume, setNotificationVolume] = useState((user as any)?.notificationVolume ?? 50);
  
  // Security States
  const [twoFactor, setTwoFactor] = useState((user as any)?.isTwoFactorEnabled || false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState("");

  // Cropper States
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [openCropper, setOpenCropper] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value.replace(/\D/g, ''));
  };

  const handleCancel = () => {
    setFirstName(user?.firstName || ""); setLastName(user?.lastName || "");
    const parsed = parsePhone(user?.phone || "");
    setCountryCode(parsed.code); setPhoneNumber(parsed.number);
    setStatus((user as any)?.status || "Open to work"); setLocation((user as any)?.location || "");
    setBio((user as any)?.bio || ""); setSkills((user as any)?.skills || "");
    setExperience(typeof (user as any)?.experience === 'string' ? JSON.parse((user as any).experience) : ((user as any)?.experience || []));
    setIsEditing(false); setMessage("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;
    setIsSaving(true);
    const fullPhone = phoneNumber ? `${countryCode} ${phoneNumber}` : "";
    try {
      const res = await api.put("/auth/profile", { firstName, lastName, phone: fullPhone, status, bio, skills, experience, location });
      setUser(res.data.user);
      setMessage("Profile updated successfully.");
      setIsEditing(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) { alert("Failed to update profile"); } 
    finally { setIsSaving(false); }
  };

  const handleSaveSettings = async (fieldsToUpdate: Record<string, any>) => {
    try {
      const res = await api.put("/auth/profile", fieldsToUpdate);
      setUser(res.data.user);
      setMessage("Settings saved successfully! ⚙️");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) { alert("Failed to save settings."); }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const formData = new FormData();
    formData.append("resume", e.target.files[0]);
    try {
      setMessage("Uploading resume...");
      const res = await api.post("/auth/resume", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setResumeUrl(res.data.user.resumeUrl);
      setUser({ ...user, resumeUrl: res.data.user.resumeUrl } as any);
      setMessage("Resume uploaded successfully! 📄");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) { alert("Failed to upload resume."); setMessage(""); }
  };

  const addExperience = () => setExperience([...experience, { id: Date.now(), title: "", company: "", period: "", description: "" }]);
  const updateExperience = (id: number, field: string, value: string) => setExperience(experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  const removeExperience = (id: number) => setExperience(experience.filter(exp => exp.id !== id));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => { setImageSrc(reader.result as string); setOpenCropper(true); });
    reader.readAsDataURL(e.target.files[0]);
    e.target.value = ""; 
  };

  const handlePasswordResetRequest = async () => {
    setIsResetting(true);
    try {
      const res = await api.post("/auth/request-password-reset", { email: user?.email });
      setResetMsg(res.data.message);
    } catch (err) { setResetMsg("Failed to send request."); } 
    finally { setIsResetting(false); }
  };

  const handleToggle2FA = async () => {
    if (twoFactor) {
      if (window.confirm("Are you sure you want to disable 2FA?")) {
        try {
          await api.post('/auth/2fa/disable');
          setTwoFactor(false); setUser({ ...user, isTwoFactorEnabled: false } as any);
          setMessage("2FA disabled successfully"); setTimeout(() => setMessage(""), 3000);
        } catch (err) { alert("Failed to disable 2FA"); }
      }
    } else {
      try {
        const res = await api.post('/auth/2fa/generate');
        setQrCode(res.data.qrCodeUrl); setShow2FAModal(true);
      } catch (err) { alert("Failed to generate 2FA"); }
    }
  };

  const handleVerify2FA = async () => {
    if (twoFactorCode.length !== 6) return alert("Code must be 6 digits");
    setIsVerifying2FA(true);
    try {
      await api.post('/auth/2fa/enable', { code: twoFactorCode });
      setTwoFactor(true); setUser({ ...user, isTwoFactorEnabled: true } as any);
      setShow2FAModal(false); setTwoFactorCode("");
      setMessage("2FA enabled successfully! 🛡️"); setTimeout(() => setMessage(""), 3000);
    } catch (err) { alert("Invalid code."); } 
    finally { setIsVerifying2FA(false); }
  };

  return {
    user, setUser, apiUrl,
    activeTab, setActiveTab, isEditing, setIsEditing, isSaving, message, setMessage,
    form: { firstName, setFirstName, lastName, setLastName, countryCode, setCountryCode, phoneNumber, handlePhoneChange, status, setStatus, location, setLocation, bio, setBio, skills, setSkills, experience, resumeUrl, addExperience, updateExperience, removeExperience },
    settings: { isPublic, setIsPublic, showEmail, setShowEmail, soundEnabled, setSoundEnabled, toastsEnabled, setToastsEnabled, notificationVolume, setNotificationVolume, handleSaveSettings },
    security: { twoFactor, show2FAModal, setShow2FAModal, qrCode, twoFactorCode, setTwoFactorCode, isVerifying2FA, handleToggle2FA, handleVerify2FA, isResetting, resetMsg, handlePasswordResetRequest },
    refs: { fileInputRef, resumeInputRef },
    handlers: { handleCancel, handleSave, handleResumeUpload, handleFileChange },
    cropper: { imageSrc, setImageSrc, openCropper, setOpenCropper }
  };
}