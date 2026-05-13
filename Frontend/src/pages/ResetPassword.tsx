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
    return <div style={{ color: '#fff', textAlign: 'center', padding: '100px' }}>Invalid link. No token found.</div>;
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

  return (
    <div style={{ padding: '100px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '32px', padding: '50px', width: '100%', maxWidth: '450px' }}>
        
        {status === "success" ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '50px', marginBottom: '20px' }}>🔐</div>
            <h2 style={{ color: '#10b981', fontSize: '24px', marginBottom: '10px' }}>Password Changed!</h2>
            <p style={{ color: '#888', marginBottom: '30px' }}>Your new password has been set successfully.</p>
            <Link to="/login" className="btn btnPrimary" style={{ padding: '12px 30px', borderRadius: '12px' }}>Go to Login</Link>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '10px', textAlign: 'center', color: '#fff' }}>Set New Password</h1>
            <p style={{ color: '#666', textAlign: 'center', marginBottom: '30px' }}>Please enter your new strong password below.</p>

            {status === "error" && <div style={{ color: '#ff4b4b', background: 'rgba(255,75,75,0.1)', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>Token is invalid or expired.</div>}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '8px' }}>New Password</label>
                <input className="input" type="password" required value={password} onChange={e => setPassword(e.target.value)} style={{ background: '#000', border: '1px solid #222', width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '8px' }}>Confirm Password</label>
                <input className="input" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ background: '#000', border: '1px solid #222', width: '100%' }} />
              </div>
              
              <button type="submit" className="btn btnPrimary" disabled={status === "loading"} style={{ padding: '14px', borderRadius: '14px', marginTop: '10px' }}>
                {status === "loading" ? "Updating..." : "Update Password"}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}