import { Link } from "react-router-dom";
import { useResetPassword } from "../hooks/useResetPassword";

const Icons = {
  Check: () => <svg width="48" height="48" fill="none" stroke="#10b981" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Eye: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  EyeOff: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
};

export default function ResetPassword() {
  const { token, password, setPassword, confirmPassword, setConfirmPassword, status, showPassword, setShowPassword, handleSubmit } = useResetPassword();

  const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#fff', padding: '16px 20px', borderRadius: '16px', outline: 'none', fontSize: '15px' };

  if (!token) return <div style={{ background: '#050505', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: '48px', marginBottom: '10px' }}>⚠️</div><h2 style={{ fontSize: '24px', fontWeight: 800 }}>Invalid Link</h2><p style={{ color: '#888' }}>This password reset link is invalid or has expired.</p><Link to="/forgot-password" style={{ color: '#10b981' }}>Request a new link</Link></div></div>;

  return (
    <div style={{ background: '#050505', width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20%', left: '30%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '450px', position: 'relative', zIndex: 1, padding: '20px' }}>
        <div style={{ background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '50px 40px', boxShadow: '0 30px 60px rgba(0,0,0,0.4)' }}>
          
          {status === "success" ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}><div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}><Icons.Check /></div></div>
              <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '10px', color: '#fff' }}>Password Updated!</h2>
              <p style={{ color: '#888', marginBottom: '30px' }}>Your password has been changed successfully.</p>
              <Link to="/login" style={{ display: 'block', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', padding: '16px', borderRadius: '16px', fontWeight: 800, textDecoration: 'none' }}>Back to Login</Link>
            </div>
          ) : (
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '10px', textAlign: 'center', color: '#fff' }}>Set New Password</h2>
              <p style={{ color: '#888', textAlign: 'center', marginBottom: '30px', fontSize: '14px' }}>Please enter your new strong password below.</p>
              
              {status === "error" && <div style={{ background: 'rgba(255, 75, 75, 0.05)', color: '#ff4b4b', padding: '12px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px', fontSize: '14px', fontWeight: 600 }}>Failed to reset password. Link might be expired.</div>}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px', position: 'relative' }}>
                  <label style={{ fontSize: '11px', color: '#666', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>New Password</label>
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(16, 185, 129, 0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '15px', top: '35px', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>{showPassword ? <Icons.EyeOff /> : <Icons.Eye />}</button>
                </div>
                <div style={{ marginBottom: '30px' }}>
                  <label style={{ fontSize: '11px', color: '#666', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Confirm New Password</label>
                  <input type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, borderColor: password && confirmPassword ? (password === confirmPassword ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 75, 75, 0.5)') : 'rgba(255,255,255,0.05)' }} />
                </div>
                <button type="submit" disabled={status === "loading" || password !== confirmPassword} style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', padding: '18px', borderRadius: '16px', fontSize: '16px', fontWeight: 800, border: 'none', cursor: status === "loading" ? 'not-allowed' : 'pointer', opacity: status === "loading" || password !== confirmPassword ? 0.5 : 1 }}>
                  {status === "loading" ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}