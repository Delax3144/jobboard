// src/hooks/useContact.ts
import { useState, useEffect } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function useContact() {
  const { user } = useAuth();
  
  const [view, setView] = useState<"form" | "tickets">("form");
  const [tickets, setTickets] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "",
    email: user?.email || "",
    subject: "",
    message: ""
  });
  
  const [status, setStatus] = useState<"typing" | "sending" | "success" | "error">("typing");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      // Вернул твои оригинальные пути!
      await api.post("/auth/contact", { ...formData, userId: user?.id });
      setStatus("success");
      setFormData({ ...formData, subject: "", message: "" });
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    if (view === "tickets" && user) {
      // Вернул твой оригинальный путь для тикетов!
      api.get("/auth/support-tickets")
        .then(res => setTickets(res.data))
        .catch(err => console.error("Error loading tickets", err));
    }
  }, [view, user]);

  return {
    user, view, setView, tickets, formData, status, setStatus, errorMsg, handleChange, handleSubmit
  };
}