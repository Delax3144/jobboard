// src/hooks/useLogin.ts
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

export function useLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false); 
  
  const [requires2FA, setRequires2FA] = useState(false);
  const [userIdFor2FA, setUserIdFor2FA] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const { googleLogin, githubLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  return {
    email, setEmail, password, setPassword, rememberMe, setRememberMe,
    requires2FA, setRequires2FA, twoFactorCode, setTwoFactorCode, isVerifying,
    handleSubmit, handleVerify2FA, handleGoogleSuccess, handleGithubClick
  };
}