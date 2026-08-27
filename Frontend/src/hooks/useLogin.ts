// src/hooks/useLogin.ts
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import type { CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

type ApiErrorResponse = {
  message?: string;
};

type LoginLocationState = {
  requires2FA?: boolean;
  challengeToken?: string;
};

function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
}

export function useLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false); 
  
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorChallenge, setTwoFactorChallenge] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const { googleLogin, githubLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const state = location.state as LoginLocationState | null;

    if (!state?.requires2FA || !state.challengeToken) {
      return;
    }

    setTwoFactorChallenge(state.challengeToken);
    setRequires2FA(true);

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");
    if (code) {
      window.history.replaceState({}, document.title, "/login");
      const savedRole = localStorage.getItem("github_role") || "candidate";
      githubLogin(code, savedRole)
        .then((result) => {
          localStorage.removeItem("github_role");

          if (result.requires2FA) {
            setTwoFactorChallenge(result.challengeToken);
            setRequires2FA(true);
            return;
          }

          navigate("/");
        })
        .catch(() => {
          localStorage.removeItem("github_role");
          console.log("GitHub login failed");
        });
    }
  }, [location.search, githubLogin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      
      if (res.data.requires2FA) {
        setTwoFactorChallenge(res.data.challengeToken);
        setRequires2FA(true);
      } else {
        localStorage.setItem("token", res.data.token);
        if (rememberMe) localStorage.setItem('remembered_email', email);
        window.location.href = "/"; 
      }
    } catch (error) {
      alert(getApiErrorMessage(error, "Invalid credentials"));
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCode.length !== 6) return alert("Code must be 6 digits");
    
    setIsVerifying(true);
    try {
      const res = await api.post("/auth/verify-2fa-login", {
        challengeToken: twoFactorChallenge,
        code: twoFactorCode,
      });
      localStorage.setItem("token", res.data.token);
      if (rememberMe) localStorage.setItem('remembered_email', email);
      window.location.href = "/"; 
    } catch (error) {
      alert(getApiErrorMessage(error, "Invalid 2FA code"));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    const credential = credentialResponse.credential;

    if (!credential) {
      alert("Google login failed");
      return;
    }

    try {
      const result = await googleLogin(credential);

      if (result.requires2FA) {
        setTwoFactorChallenge(result.challengeToken);
        setRequires2FA(true);
        return;
      }

      navigate("/");
    } catch (error) {
      alert(getApiErrorMessage(error, "Google login failed"));
    }
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