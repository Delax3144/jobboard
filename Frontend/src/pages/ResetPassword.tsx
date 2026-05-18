import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../lib/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"typing" | "loading" | "success" | "error">("typing");

  if (!token) {
    return (
      <div style={{ background: '#050505', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: '20px', textAlign: 'center' }}>
        <div style={{ background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '40px 30px', maxWidth: '400px', width: '100%' }}>
          <div style={{ fontSize: '40px', marginBottom: '15px' }}>⚠️</div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 10px 0' }}>Invalid link</h2>
          <p style={{ color: '#666', fontSize: '14px', margin: '0 0 25px 0' }}>No valid security token found in your URL parameters.</p>
          <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>Back to Login</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setStatus("loading");
    try {
      await api.post("/auth/reset-password", { token, newPassword: password });
      setStatus("success");
    } catch (err) {
      setStatus("error");
    }
  };

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
    color: '#fff', padding: '16px 20px', borderRadius: '16px', outline: 'none', fontSize: '15px', transition: 'border-color 0.2s'
  };

  return (
    <div className="auth-container" style={{ 
      padding: '60px 0', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#050505', position: 'relative', overflow: 'hidden',
      width: '100vw', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw'
    }}>
      
      {/* Декоративные космические свечения */}
      <div style={{ position: 'absolute', top: '10%', left: '20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div className="auth-card" style={{ 
        width: '100%', maxWidth: '450px', position: 'relative', zIndex: 1,
        background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(20px)', 
        border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '50px 40px',
        boxShadow: '0 30px 60px rgba(0,0,0,0.4)'
      }}>
        
        {status === "success" ? (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s ease-out' }}>
            <div style={{ fontSize: '56px', marginBottom: '20px', filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.2))' }}>🔐</div>
            <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: 900, marginBottom: '10px', letterSpacing: '-0.5px' }}>Password Changed!</h2>
            <p style={{ color: '#888', marginBottom: '35px', fontSize: '15px', lineHeight: '1.5' }}>Your new strong password has been synchronized successfully.</p>
            <Link to="/login" style={{ display: 'inline-block', width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', padding: '16px 30px', borderRadius: '16px', fontWeight: 800, fontSize: '15px', textDecoration: 'none', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)' }}>Go to Login</Link>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '10px', textAlign: 'center', color: '#fff', letterSpacing: '-0.5px' }}>Set New Password</h1>
            <p style={{ color: '#888', textAlign: 'center', marginBottom: '35px', fontSize: '15px' }}>Please enter your new strong password below.</p>

            {status === "error" && <div style={{ color: '#ff4b4b', background: 'rgba(255, 75, 75, 0.05)', border: '1px solid rgba(255, 75, 75, 0.2)', padding: '14px', borderRadius: '16px', marginBottom: '25px', textAlign: 'center', fontSize: '14px', fontWeight: 600 }}>Token is invalid or expired.</div>}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>New Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(16, 185, 129, 0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Confirm Password</label>
                <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, borderColor: password && confirmPassword ? (password === confirmPassword ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 75, 75, 0.5)') : 'rgba(255,255,255,0.05)' }} onFocus={e => e.target.style.borderColor = password && confirmPassword && password !== confirmPassword ? 'rgba(255, 75, 75, 0.5)' : 'rgba(16, 185, 129, 0.4)'} onBlur={e => e.target.style.borderColor = password && confirmPassword && password !== confirmPassword ? 'rgba(255, 75, 75, 0.5)' : 'rgba(255,255,255,0.05)'} />
              </div>
              
              <button type="submit" disabled={status === "loading"} style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', padding: '18px', borderRadius: '16px', fontSize: '16px', fontWeight: 800, marginTop: '10px', border: 'none', cursor: status === "loading" ? 'not-allowed' : 'pointer', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)', transition: 'transform 0.2s', opacity: status === "loading" ? 0.7 : 1 }} onMouseOver={e => { if(status !== "loading") e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                {status === "loading" ? "Updating..." : "Update Password"}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}