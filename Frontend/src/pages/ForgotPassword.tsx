import { Link } from "react-router-dom";
import { useForgotPassword } from "../hooks/useForgotPassword";

const Icons = {
  ArrowLeft: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Mail: () => <svg width="48" height="48" fill="none" stroke="#10b981" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Key: () => <svg width="48" height="48" fill="none" stroke="#10b981" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
};

export default function ForgotPassword() {
  const { email, setEmail, status, setStatus, errorMsg, handleSubmit } = useForgotPassword();

  return (
    <div style={{ background: '#050505', width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      
      <div style={{ position: 'absolute', top: '10%', left: '20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '450px', position: 'relative', zIndex: 1, padding: '20px' }}>
        <div style={{ background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '50px 40px', boxShadow: '0 30px 60px rgba(0,0,0,0.4)' }}>
          
          {status === "success" ? (
            <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px' }}><div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}><Icons.Mail /></div></div>
              <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '15px', color: '#fff', letterSpacing: '-0.5px' }}>Check your email</h2>
              <p style={{ color: '#888', lineHeight: '1.6', fontSize: '15px', marginBottom: '30px' }}>We've sent a password reset link to <b>{email}</b>. Please check your inbox and spam folder.</p>
              <button onClick={() => setStatus("typing")} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '16px 32px', borderRadius: '16px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', width: '100%' }}>Try another email</button>
            </div>
          ) : (
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px' }}><div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.1)' }}><Icons.Key /></div></div>
              <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '10px', textAlign: 'center', color: '#fff', letterSpacing: '-0.5px' }}>Forgot Password?</h1>
              <p style={{ color: '#888', textAlign: 'center', marginBottom: '35px', fontSize: '14px', lineHeight: '1.6' }}>No worries, we'll send you reset instructions.</p>

              {status === "error" && <div style={{ background: 'rgba(255, 75, 75, 0.05)', border: '1px solid rgba(255, 75, 75, 0.2)', color: '#ff4b4b', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', textAlign: 'center', fontWeight: 600 }}>{errorMsg}</div>}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ fontSize: '11px', color: '#666', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Email Address</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', padding: '16px 20px', borderRadius: '16px', outline: 'none', fontSize: '15px' }} onFocus={e => e.target.style.borderColor = 'rgba(16, 185, 129, 0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} />
                </div>
                <button type="submit" disabled={status === "loading"} style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', padding: '18px', borderRadius: '16px', fontSize: '16px', fontWeight: 800, border: 'none', cursor: status === "loading" ? 'not-allowed' : 'pointer', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)', transition: 'transform 0.2s', opacity: status === "loading" ? 0.7 : 1 }}>
                  {status === "loading" ? "Sending Link..." : "Send Reset Link"}
                </button>
              </form>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <Link to="/login" style={{ color: '#888', textDecoration: 'none', fontSize: '14px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Icons.ArrowLeft /> Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}