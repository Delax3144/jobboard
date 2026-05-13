import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

const Icons = {
  Eye: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  EyeOff: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>,
  Mail: () => <svg width="48" height="48" fill="none" stroke="#10b981" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
};

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [showPassword, setShowPassword] = useState(false); 
  const [username, setUsername] = useState(""); 
  const [firstName, setFirstName] = useState(""); 
  const [lastName, setLastName] = useState(""); 
  const [phone, setPhone] = useState(""); 
  const [role, setRole] = useState<"candidate" | "employer">("candidate");
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) { setError("Passwords do not match!"); return; }
    setIsSubmitting(true);
    try {
      await register({ email, password, username, firstName, lastName, phone, role });
      setIsSuccess(true);
    } catch (err: any) {
      const message = err.response?.data?.message || "";
      if (message.includes("email")) setError("This email is already registered. Try logging in?");
      else if (message.includes("username")) setError("Username is already taken. Try another one.");
      else setError("Registration failed. Check your data.");
    } finally { setIsSubmitting(false); }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      await googleLogin(credentialResponse.credential, role);
      navigate("/");
    } catch (err) { setError("Google Registration failed."); }
  };

  const handleGithubClick = () => {
    localStorage.setItem("github_role", role);
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email`;
  };

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
    color: '#fff', padding: '16px 20px', borderRadius: '16px', outline: 'none', fontSize: '15px', transition: 'border-color 0.2s'
  };

  return (
    <div style={{ 
      padding: '60px 0', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#050505', position: 'relative', overflow: 'hidden',
      width: '100vw', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw'
    }}>
      
      <div style={{ position: 'absolute', top: '5%', left: '15%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '5%', right: '15%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ 
        width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1, // <-- ИЗМЕНИЛИ ШИРИНУ ТУТ
        background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(20px)', 
        border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '50px 40px',
        boxShadow: '0 30px 60px rgba(0,0,0,0.4)'
      }}>
        
        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '30px 0', animation: 'fadeIn 0.4s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <Icons.Mail />
              </div>
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '15px', color: '#fff', letterSpacing: '-0.5px' }}>Check your inbox!</h2>
            <p style={{ color: '#888', lineHeight: '1.6', fontSize: '16px', marginBottom: '40px' }}>
              We've sent a verification link to <br/><b style={{ color: '#fff' }}>{email}</b>.<br/><br/>
              Please click the link to activate your account.
            </p>
            <Link to="/login" style={{ display: 'inline-block', width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', padding: '18px', borderRadius: '16px', fontSize: '16px', fontWeight: 800, textDecoration: 'none', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '10px', textAlign: 'center', color: '#fff', letterSpacing: '-0.5px' }}>
              Create <span style={{ color: '#10b981' }}>Account</span>
            </h1>
            <p style={{ color: '#888', textAlign: 'center', marginBottom: '35px', fontSize: '15px' }}>Join our professional community</p>

            {error && <div style={{ background: 'rgba(255, 75, 75, 0.05)', border: '1px solid rgba(255, 75, 75, 0.2)', color: '#ff4b4b', padding: '14px', borderRadius: '16px', marginBottom: '25px', fontSize: '14px', textAlign: 'center', fontWeight: 600 }}>{error}</div>}

            <div style={{ marginBottom: '30px' }}>
              <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>I am a:</label>
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <button type="button" onClick={() => setRole("candidate")} style={{ flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer', border: 'none', background: role === 'candidate' ? '#fff' : 'transparent', color: role === 'candidate' ? '#000' : '#888', fontWeight: 700, fontSize: '14px', transition: 'all 0.2s', boxShadow: role === 'candidate' ? '0 4px 10px rgba(0,0,0,0.2)' : 'none' }}>Candidate</button>
                <button type="button" onClick={() => setRole("employer")} style={{ flex: 1, padding: '12px', borderRadius: '12px', cursor: 'pointer', border: 'none', background: role === 'employer' ? '#fff' : 'transparent', color: role === 'employer' ? '#000' : '#888', fontWeight: 700, fontSize: '14px', transition: 'all 0.2s', boxShadow: role === 'employer' ? '0 4px 10px rgba(0,0,0,0.2)' : 'none' }}>Employer</button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google sign up failed')} type="icon" theme="filled_black" shape="circle" size="large" />
              </div>
              <button 
                type="button" onClick={handleGithubClick} 
                style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, transition: 'background 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              >
                <svg fill="#fff" viewBox="0 0 24 24" width="22" height="22"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', margin: '30px 0' }}><div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }}></div><span style={{ padding: '0 15px', color: '#666', fontSize: '11px', fontWeight: 800, letterSpacing: '1px' }}>OR EMAIL REGISTER</span><div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }}></div></div>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div><label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>First Name *</label><input required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(16, 185, 129, 0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} /></div>
                <div><label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Last Name *</label><input required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(16, 185, 129, 0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} /></div>
              </div>
              
              <div><label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Username *</label><input required value={username} onChange={e => setUsername(e.target.value)} placeholder="johndoe77" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(16, 185, 129, 0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} /></div>
              
              <div><label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Email Address *</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(16, 185, 129, 0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} /></div>
              
              <div><label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Phone Number (Optional)</label><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+48 123 456 789" style={inputStyle} onFocus={e => e.target.style.borderColor = 'rgba(16, 185, 129, 0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} /></div>
              
              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Password *</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, paddingRight: '45px' }} onFocus={e => e.target.style.borderColor = 'rgba(16, 185, 129, 0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.05)'} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', display: 'flex' }}>
                    {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Confirm Password *</label>
                <input type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, borderColor: password && confirmPassword ? (password === confirmPassword ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 75, 75, 0.5)') : 'rgba(255,255,255,0.05)' }} onFocus={e => e.target.style.borderColor = password && confirmPassword && password !== confirmPassword ? 'rgba(255, 75, 75, 0.5)' : 'rgba(16, 185, 129, 0.4)'} onBlur={e => e.target.style.borderColor = password && confirmPassword && password !== confirmPassword ? 'rgba(255, 75, 75, 0.5)' : 'rgba(255,255,255,0.05)'} />
              </div>

              <button type="submit" disabled={isSubmitting} style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', padding: '18px', borderRadius: '16px', fontSize: '16px', fontWeight: 800, marginTop: '10px', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)', transition: 'transform 0.2s', opacity: isSubmitting ? 0.7 : 1 }} onMouseOver={e => { if(!isSubmitting) e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>
            </form>
            
            <p style={{ textAlign: 'center', marginTop: '30px', color: '#888', fontSize: '14px' }}>
              Already have an account? <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>Login here</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}