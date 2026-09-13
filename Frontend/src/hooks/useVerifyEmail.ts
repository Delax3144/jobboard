import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/api";

export function useVerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [result, setResult] = useState<{ token: string; status: 'success' | 'error' }>();
  const status = !token ? 'error' : result?.token === token ? result.status : 'loading';
  const requestRef = useRef<{ token: string; promise: Promise<unknown> } | null>(null);

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

  return { status };
}
