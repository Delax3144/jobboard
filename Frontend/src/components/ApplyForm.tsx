import { useState, useRef } from "react";
import api from "../lib/api";

const Icons = {
  Upload: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  File: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  X: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
  Send: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
};

interface ApplyFormProps {
  jobId: string;
  jobTitle: string;
  onSuccess: () => void;
}

export default function ApplyForm({ jobId, jobTitle, onSuccess }: ApplyFormProps) {
  const [coverLetter, setCoverLetter] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("jobId", jobId);
    formData.append("coverLetter", coverLetter);
    if (file) formData.append("cv", file);

    try {
      await api.post("/applications", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.response?.data?.message || "Failed to submit application. Please try again.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.4s ease-out' }}>
      
      {status === "error" && (
        <div style={{ background: 'rgba(255, 75, 75, 0.05)', border: '1px solid rgba(255, 75, 75, 0.2)', color: '#ff4b4b', padding: '14px', borderRadius: '16px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icons.X /> {errorMsg}
        </div>
      )}

      {/* ПОЛЕ: MOTIVATION PITCH */}
      <div>
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Motivation Pitch</span>
          <span style={{ fontSize: '11px', color: '#555', fontWeight: 600 }}>Optional</span>
        </label>
        <textarea 
          placeholder={`Why are you a great fit for the ${jobTitle} role?`}
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          style={{
            width: '100%', minHeight: '120px', padding: '16px 20px', borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)',
            color: '#fff', fontSize: '15px', lineHeight: '1.6', outline: 'none', resize: 'vertical',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', fontFamily: 'inherit'
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)'; e.currentTarget.style.background = 'rgba(16, 185, 129, 0.02)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'; }}
        />
      </div>

      {/* ПОЛЕ: UPLOAD CV */}
      <div>
        <label style={{ fontSize: '11px', color: '#888', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>
          Resume / CV
        </label>
        
        {!file ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'rgba(255, 255, 255, 0.01)', border: '2px dashed rgba(255, 255, 255, 0.1)', borderRadius: '24px',
              padding: '30px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)'; }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.Upload />
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>Click to upload your CV</div>
              <div style={{ color: '#666', fontSize: '12px', fontWeight: 500 }}>PDF, DOC, DOCX (Max 5MB)</div>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '20px',
            padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.3s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
              <div style={{ color: '#10b981' }}><Icons.File /></div>
              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff', fontWeight: 600, fontSize: '14px' }}>
                {file.name}
              </div>
            </div>
            <button type="button" onClick={clearFile} style={{ background: 'rgba(255,75,75,0.1)', color: '#ff4b4b', border: 'none', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
              <Icons.X />
            </button>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".pdf,.doc,.docx" 
          style={{ display: 'none' }} 
        />
      </div>

      {/* КНОПКА ОТПРАВКИ */}
      <button 
        type="submit" 
        disabled={status === "submitting"}
        style={{
          marginTop: '10px', width: '100%', padding: '18px', borderRadius: '20px', border: 'none',
          background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', fontSize: '16px', fontWeight: 800,
          cursor: status === "submitting" ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          boxShadow: '0 15px 30px -10px rgba(16, 185, 129, 0.5)', transition: 'all 0.3s',
          opacity: status === "submitting" ? 0.8 : 1
        }}
        onMouseOver={e => { if (status !== "submitting") e.currentTarget.style.transform = 'translateY(-2px)' }}
        onMouseOut={e => { if (status !== "submitting") e.currentTarget.style.transform = 'translateY(0)' }}
      >
        {status === "submitting" ? (
          "Sending Application..."
        ) : (
          <>Send Application <Icons.Send /></>
        )}
      </button>

      <div style={{ textAlign: 'center', color: '#666', fontSize: '11px', fontWeight: 500 }}>
        By applying, you agree to share your platform profile and provided documents with the employer.
      </div>
    </form>
  );
}