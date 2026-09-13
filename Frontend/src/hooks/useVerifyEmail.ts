import { useEffect, useState, useRef, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { apiErrorMessage } from "../lib/apiError";

export function useVerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [result, setResult] = useState<{ token: string; status: 'success' | 'error' }>();
  const status = !token ? 'error' : result?.token === token ? result.status : 'loading';
  const requestRef = useRef<{ token: string; promise: Promise<unknown> } | null>(null);
  const [email, setEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resendError, setResendError] = useState('');

  async function handleResend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (resendStatus === 'loading') return;
    setResendStatus('loading');
    setResendError('');
    try {
      await api.post('/auth/resend-verification', { email: email.trim().toLowerCase() });
      setResendStatus('success');
    } catch (error) {
      setResendError(apiErrorMessage(error, 'Could not send a verification link. Please try again.'));
      setResendStatus('error');
    }
  }

  useEffect(() => {
    if (!token) {
      return;
    }
    let cancelled = false;
    if (requestRef.current?.token !== token) {
      requestRef.current = { token, promise: api.post('/auth/verify-email', { token }) };
    }
    requestRef.current.promise
      .then(() => { if (!cancelled) setResult({ token, status: 'success' }); })
      .catch(() => { if (!cancelled) setResult({ token, status: 'error' }); });
    return () => { cancelled = true; };
  }, [token]);

  return { status, email, setEmail, resendStatus, setResendStatus, resendError, handleResend };
}
