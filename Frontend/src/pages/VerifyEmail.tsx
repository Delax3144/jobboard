import { Link } from "react-router-dom";
import { useVerifyEmail } from "../hooks/useVerifyEmail";

const Icons = {
  Check: () => <svg width="48" height="48" fill="none" stroke="#10b981" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  X: () => <svg width="48" height="48" fill="none" stroke="#ff4b4b" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

export default function VerifyEmail() {
  const { status } = useVerifyEmail();

  return (
    <div style={{ background: '#050505', width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20%', left: '30%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '450px', position: 'relative', zIndex: 1, padding: '20px' }}>
        <div style={{ background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '50px 40px', boxShadow: '0 30px 60px rgba(0,0,0,0.4)', textAlign: 'center' }}>
          
          {status === "loading" && (
            <div style={{ color: '#fff', fontSize: '18px', fontWeight: 600 }}>Verifying your email...</div>
          )}

          {status === "success" && (
            <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}><div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}><Icons.Check /></div></div>
              <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '10px', color: '#fff', letterSpacing: '-0.5px' }}>Email Verified!</h2>
              <p style={{ color: '#888', marginBottom: '30px', fontSize: '15px' }}>Your account is now fully active. You can log in and start exploring JobBoard.</p>
              <Link to="/login" style={{ display: 'inline-block', width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', padding: '16px 30px', borderRadius: '16px', fontWeight: 800, textDecoration: 'none' }}>Go to Login</Link>
            </div>
          )}

          {status === "error" && (
            <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}><div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255, 75, 75, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 75, 75, 0.2)' }}><Icons.X /></div></div>
              <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '10px', color: '#fff', letterSpacing: '-0.5px' }}>Verification Failed</h2>
              <p style={{ color: '#888', marginBottom: '30px', fontSize: '15px' }}>The link is invalid or has expired. Please try registering again or contact support.</p>
              <Link to="/register" style={{ display: 'inline-block', width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '16px 30px', borderRadius: '16px', fontWeight: 800, textDecoration: 'none' }}>Back to Sign Up</Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}