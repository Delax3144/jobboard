import { useState } from "react";
import api from "../lib/api";

export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"typing" | "loading" | "success" | "error">("typing");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      await api.post("/auth/request-password-reset", { email });
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return { email, setEmail, status, setStatus, errorMsg, handleSubmit };
}