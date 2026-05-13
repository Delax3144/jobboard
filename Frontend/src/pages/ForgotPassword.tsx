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
    <div style={{ padding: '100px 0', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ 
        width: '100%', maxWidth: '450px', 
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', 
        borderRadius: '32px', padding: '40px' 
      }}>
        
        {status === "success" ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '50px', marginBottom: '20px' }}>✉️</div>
            <h2 style={{ color: '#10b981', fontSize: '24px', marginBottom: '10px' }}>Check your inbox!</h2>
            <p style={{ color: '#888', marginBottom: '30px', lineHeight: '1.5' }}>
              If an account exists for <b style={{ color: '#fff' }}>{email}</b>, we have sent a secure password reset link.
            </p>
            <Link to="/login" className="btn btnPrimary" style={{ padding: '12px 30px', borderRadius: '12px', display: 'inline-block' }}>
              Return to Login
            </Link>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '10px', textAlign: 'center' }}>
              Reset <span style={{ color: '#10b981' }}>Password</span>
            </h1>
            <p style={{ color: '#666', textAlign: 'center', marginBottom: '30px', lineHeight: '1.5' }}>
              Enter your email address and we'll send you a link to securely reset your password.
            </p>

            {status === "error" && (
              <div style={{ background: 'rgba(255,75,75,0.1)', border: '1px solid #ff4b4b', color: '#ff4b4b', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px', fontWeight: 600 }}>EMAIL ADDRESS</label>
                <input 
                  className="input" type="email" required 
                  value={email} onChange={e => setEmail(e.target.value)} 
                  placeholder="name@example.com" 
                  style={{ background: '#000', border: '1px solid #222', width: '100%', padding: '14px', borderRadius: '12px', color: '#fff' }} 
                />
              </div>

              <button type="submit" className="btn btnPrimary" disabled={status === "loading"} style={{ padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, marginTop: '10px' }}>
                {status === "loading" ? "Sending Link..." : "Send Reset Link"}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '25px', color: '#666', fontSize: '14px' }}>
              Remember your password? <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>Back to Login</Link>
            </p>
          </>
        )}

      </div>
    </div>
  );
}