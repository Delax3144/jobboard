const storageKey = 'github_oauth_request';

export function githubAuthorizationUrl(clientId: string, role = 'candidate') {
  const state = crypto.randomUUID();
  sessionStorage.setItem(storageKey, JSON.stringify({ state, role, createdAt: Date.now() }));
  const query = new URLSearchParams({ client_id: clientId, scope: 'user:email', state });
  return `https://github.com/login/oauth/authorize?${query}`;
}

export function consumeGithubState(state: string | null): string | null {
  const stored = sessionStorage.getItem(storageKey);
  sessionStorage.removeItem(storageKey);
  if (!state || !stored) return null;
  try {
    const request: { state?: string; role?: string; createdAt?: number } = JSON.parse(stored);
    const age = Date.now() - (request.createdAt ?? 0);
    if (request.state !== state || age < 0 || age > 10 * 60 * 1000 ||
        !['candidate', 'employer'].includes(request.role ?? '')) return null;
    return request.role ?? null;
  } catch { return null; }
}
