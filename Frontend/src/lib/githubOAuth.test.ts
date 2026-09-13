import { it, expect, vi } from 'vitest';
import { githubAuthorizationUrl, consumeGithubState } from './githubOAuth';

it('binds a GitHub callback to a one-time browser request and selected role', () => {
  const state = new URL(githubAuthorizationUrl('client', 'employer')).searchParams.get('state');
  expect(consumeGithubState(state)).toBe('employer');
  expect(consumeGithubState(state)).toBeNull();
});
it('rejects mismatched and expired callbacks', () => {
  githubAuthorizationUrl('client');
  expect(consumeGithubState('unrelated')).toBeNull();
  const now = Date.now();
  const state = new URL(githubAuthorizationUrl('client')).searchParams.get('state');
  vi.spyOn(Date, 'now').mockReturnValue(now + 11 * 60 * 1000);
  expect(consumeGithubState(state)).toBeNull();
});
