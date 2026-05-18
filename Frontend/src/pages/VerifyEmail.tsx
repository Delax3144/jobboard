import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../lib/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    api.post("/auth/verify-email", { token })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="auth-container" style={{ 
      padding: '60px 0', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#050505', position: 'relative', overflow: 'hidden',
      width: '100vw', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw'
    }}>
      
      {/* Мягкие декоративные свечения на фоне */}
      <div style={{ position: 'absolute', top: '15%', left: '25%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.04) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '25%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.02) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div className="auth-card" style={{ 
        width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1,
        background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(20px)', 
        border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '50px 40px',
        boxShadow: '0 30px 60px rgba(0,0,0,0.4)', textAlign: 'center'
      }}>
        
        {/* СТАТУС: ЗАГРУЗКА / ПРОВЕРКА */}
        {status === "loading" && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px', animation: 'pulse-animation 2s infinite', display: 'inline-block' }}>⏳</div>
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>Verifying...</h2>
            <p style={{ color: '#666', fontSize: '15px', margin: 0, fontWeight: 500 }}>Please wait a moment while we validate your token.</p>
          </div>
        )}
        
        {/* СТАТУС: УСПЕШНОЕ ПОДТВЕРЖДЕНИЕ */}
        {status === "success" && (
          <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div style={{ fontSize: '56px', marginBottom: '20px', filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.25))' }}>✅</div>
            <h2 style={{ color: '#fff', fontSize: '30px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.5px' }}>Email Verified!</h2>
            <p style={{ color: '#888', marginBottom: '35px', lineHeight: '1.6', fontSize: '15px' }}>Your account is now fully active. You can now log in and start exploring jobs on JobBoard.</p>
            <Link to="/login" style={{ display: 'inline-block', width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', padding: '16px 30px', borderRadius: '16px', fontWeight: 800, fontSize: '15px', textDecoration: 'none', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>Go to Login</Link>
          </div>
        )}

        {/* СТАТУС: ОШИБКА */}
        {status === "error" && (
          <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <div style={{ fontSize: '56px', marginBottom: '20px', filter: 'drop-shadow(0 0 20px rgba(255,75,75,0.2))' }}>❌</div>
            <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.5px' }}>Verification Failed</h2>
            <p style={{ color: '#888', marginBottom: '35px', lineHeight: '1.6', fontSize: '15px' }}>The security link is invalid, has expired, or your email address is already verified.</p>
            <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 700, fontSize: '15px', transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = '0.8'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>Return to Login</Link>
          </div>
        )}

      </div>
    </div>
  );
}