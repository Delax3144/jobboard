import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"typing" | "loading" | "success" | "error">("typing");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      // Дергаем тот же роут, что и в настройках профиля!
      await api.post("/auth/request-password-reset", { email });
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      // Если юзер не найден, бэкенд может вернуть ошибку. Но в целях безопасности 
      // часто говорят "Если почта есть в базе, мы отправили письмо", чтобы хакеры не перебирали базу.
      // Но мы пока выведем реальную ошибку для удобства:
      setErrorMsg(err.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div style={{
      background: '#050505',
      width: '100vw',
      position: 'relative',
      left: '50%',
      right: '50%',
      marginLeft: '-50vw',
      marginRight: '-50vw',
      minHeight: 'calc(100vh - 80px)',
      overflowX: 'clip',
      paddingBottom: '100px'
    }}>

      {/* Декоративные свечения */}
      <div style={{ position: 'absolute', top: '0', left: '10%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '0', right: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 20px', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{
          width: '100%', maxWidth: '500px',
          background: 'rgba(15, 15, 15, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '32px',
          padding: '50px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.4)'
        }}>
          
          {status === "success" ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '70px', marginBottom: '25px', display: 'flex', justifyContent: 'center' }}>
                ✉️
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '15px', letterSpacing: '-1px', color: '#fff' }}>
                Check your <span style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>inbox!</span>
              </h2>
              <p style={{ color: '#aaa', marginBottom: '35px', lineHeight: '1.8', fontSize: '16px' }}>
                If an account exists for <b style={{ color: '#fff' }}>{email}</b>, we have sent a secure password reset link.
              </p>
              <Link to="/login" className="btn btnPrimary pill" style={{ display: 'inline-flex', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', padding: '16px 32px', borderRadius: '16px', textDecoration: 'none', fontWeight: 800, fontSize: '15px', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)', transition: 'transform 0.2s' }}>
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: '950', marginBottom: '15px', textAlign: 'center', letterSpacing: '-1.5px', color: '#fff' }}>
                Reset <span style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Password</span>
              </h1>
              <p style={{ color: '#bbb', textAlign: 'center', marginBottom: '35px', lineHeight: '1.8', fontSize: '16px' }}>
                Enter your email address and we'll send you a link to securely reset your password.
              </p>

              {status === "error" && (
                <div style={{ background: 'rgba(255,75,75,0.05)', border: '1px solid rgba(255,75,75,0.2)', color: '#ff4b4b', padding: '16px', borderRadius: '16px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', fontWeight: 600 }}>
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '25px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#666', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>EMAIL ADDRESS</label>
                  <input 
                    className="input" type="email" required 
                    value={email} onChange={e => setEmail(e.target.value)} 
                    placeholder="name@example.com" 
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', width: '100%', padding: '16px 20px', borderRadius: '16px', color: '#fff' }} 
                  />
                </div>

                <button type="submit" className="btn btnPrimary pill" disabled={status === "loading"} style={{ padding: '16px 32px', borderRadius: '16px', fontSize: '15px', fontWeight: 800, marginTop: '10px', width: '100%', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#000', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)', transition: 'transform 0.2s', opacity: status === "loading" ? 0.7 : 1 }}>
                  {status === "loading" ? "Sending Link..." : "Send Reset Link"}
                </button>
              </form>

              <p style={{ textAlign: 'center', marginTop: '25px', color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
                Remember your password? <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>Back to Login</Link>
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}