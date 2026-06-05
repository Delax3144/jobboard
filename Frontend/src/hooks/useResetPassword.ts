import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/api";

export function useResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"typing" | "loading" | "success" | "error">("typing");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || password !== confirmPassword) return;
    
    setStatus("loading");
    try {
      await api.post("/auth/reset-password", { token, newPassword: password });
      setStatus("success");
    } catch (err) {
      setStatus("error");
    }
  };

  return { token, password, setPassword, confirmPassword, setConfirmPassword, status, showPassword, setShowPassword, handleSubmit };
}