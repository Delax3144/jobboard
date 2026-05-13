import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import api from "../lib/api";

const Icons = {
  ShieldCheck: () => <svg width="48" height="48" fill="none" stroke="#10b981" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  ArrowLeft: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false); 
  const { googleLogin, githubLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Состояния для 2FA
  const [requires2FA, setRequires2FA] = useState(false);
  const [userIdFor2FA, setUserIdFor2FA] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");
    if (code) {
      window.history.replaceState({}, document.title, "/login");
      const savedRole = localStorage.getItem("github_role") || "candidate";
      githubLogin(code, savedRole)
        .then(() => { localStorage.removeItem("github_role"); navigate("/"); })
        .catch(() => console.log("Вторая попытка входа отменена"));
    }
  }, [location.search, githubLogin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      
      if (res.data.requires2FA) {
        setUserIdFor2FA(res.data.userId);
        setRequires2FA(true); 
      } else {
        localStorage.setItem("token", res.data.token);
        if (rememberMe) localStorage.setItem('remembered_email', email);
        window.location.href = "/"; 
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Invalid credentials");
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCode.length !== 6) return alert("Code must be 6 digits");
    
    setIsVerifying(true);
    try {
      const res = await api.post("/auth/verify-2fa-login", { userId: userIdFor2FA, code: twoFactorCode });
      localStorage.setItem("token", res.data.token);
      if (rememberMe) localStorage.setItem('remembered_email', email);
      window.location.href = "/"; 
    } catch (err: any) {
      alert(err.response?.data?.message || "Invalid 2FA code");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      await googleLogin(credentialResponse.credential);
      navigate("/");
    } catch (err) { alert("Google login failed"); }
  };

  const handleGithubClick = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email`;
  };

  return (
    <div style={{ 
      padding: '60px 0', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#050505', position: 'relative', overflow: 'hidden',
      width: '100vw', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw'
    }}>
      
      <div style={{ position: 'absolute', top: '10%', left: '20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ 
        width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1, // <-- ИЗМЕНИЛИ ШИРИНУ ТУТ
        background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(20px)', 
        border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '50px 40px',
        boxShadow: '0 30px 60px rgba(0,0,0,0.4)'
      }}>
        
        {!requires2FA ? (
          <>
            <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '10px', textAlign: 'center', color: '#fff', letterSpacing: '-0.5px' }}>
              Welcome <span style={{ color: '#10b981' }}>Back</span>
            </h1>
            <p style={{ color: '#888', textAlign: 'center', marginBottom: '35px', fontSize: '15px' }}>Log in to manage your career</p>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', padding: '16px 20px', borderRadius: '16px', outline: 'none', fontSize: '15px', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = 'rgba(16, 185, 129, 0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', padding: '16px 20px', borderRadius: '16px', outline: 'none', fontSize: '15px', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = 'rgba(16, 185, 129, 0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#888' }}>
                  <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} style={{ width: '16px', height: '16px', accentColor: '#10b981', cursor: 'pointer' }} /> 
                  Remember me
                </label>
                <Link to="/forgot-password" style={{ fontSize: '14px', color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>Forgot Password?</Link>
              </div>

              <button type="submit" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', padding: '18px', borderRadius: '16px', fontSize: '16px', fontWeight: 800, marginTop: '10px', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                Login to Account
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', margin: '30px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
              <span style={{ padding: '0 15px', color: '#666', fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>OR CONTINUE WITH</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => alert('Google login failed')} type="icon" theme="filled_black" shape="circle" size="large" />
              </div>

              <button
                type="button"
                onClick={handleGithubClick}
                style={{
                  width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, transition: 'background 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              >
                <svg fill="#fff" viewBox="0 0 24 24" width="22" height="22">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </button>
            </div>

            <p style={{ textAlign: 'center', marginTop: '30px', color: '#888', fontSize: '14px' }}>
              Don't have an account? <Link to="/register" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>Register here</Link>
            </p>
          </>
        ) : (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s ease-out' }}>
            <button onClick={() => setRequires2FA(false)} style={{ background: 'transparent', border: 'none', color: '#888', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: 0, marginBottom: '30px', fontWeight: 600 }}>
              <Icons.ArrowLeft /> Back to login
            </button>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <Icons.ShieldCheck />
            </div>
            
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', marginBottom: '15px' }}>Two-Factor Auth</h2>
            <p style={{ color: '#888', fontSize: '15px', lineHeight: '1.6', marginBottom: '40px' }}>
              Enter the 6-digit security code generated by your Authenticator app.
            </p>

            <form onSubmit={handleVerify2FA}>
              <input 
                type="text" 
                placeholder="000000" 
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))} 
                style={{ 
                  width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(16, 185, 129, 0.3)', 
                  color: '#10b981', padding: '20px', borderRadius: '16px', textAlign: 'center', 
                  fontSize: '32px', letterSpacing: '12px', fontWeight: 900, marginBottom: '30px', outline: 'none',
                  boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
                }}
              />

              <button 
                type="submit" 
                disabled={isVerifying || twoFactorCode.length !== 6} 
                style={{ 
                  width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', 
                  padding: '18px', borderRadius: '16px', fontSize: '16px', fontWeight: 800, border: 'none', 
                  cursor: twoFactorCode.length === 6 ? 'pointer' : 'not-allowed', 
                  opacity: twoFactorCode.length === 6 ? 1 : 0.5,
                  boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)', transition: 'all 0.2s' 
                }}
              >
                {isVerifying ? "Verifying..." : "Confirm & Login"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}