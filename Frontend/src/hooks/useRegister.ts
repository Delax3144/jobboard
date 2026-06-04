// src/hooks/useRegister.ts
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function useRegister() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"candidate" | "employer">("candidate");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (formData.password !== formData.confirmPassword) { 
      setError("Passwords do not match!"); 
      return; 
    }
    
    setIsSubmitting(true);
    try {
      await register({ ...formData, role });
      setIsSuccess(true);
    } catch (err: any) {
      const message = err.response?.data?.message || "";
      if (message.includes("email")) setError("This email is already registered. Try logging in?");
      else if (message.includes("username")) setError("Username is already taken. Try another one.");
      else setError("Registration failed. Check your data.");
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      await googleLogin(credentialResponse.credential, role);
      navigate("/");
    } catch (err) { 
      setError("Google Registration failed."); 
    }
  };

  const handleGithubClick = () => {
    localStorage.setItem("github_role", role);
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email`;
  };

  return {
    formData, handleChange, showPassword, setShowPassword,
    role, setRole, error, isSubmitting, isSuccess,
    handleSubmit, handleGoogleSuccess, handleGithubClick
  };
}