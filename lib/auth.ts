const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize';
const TOKEN_KEY = 'github_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

export function clearStoredToken(): void {
  removeStoredToken();
}

export function getLoginUrl(): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '',
    redirect_uri: `${window.location.origin}${basePath}/auth/callback`,
    scope: 'repo read:user',
    state: Math.random().toString(36).substring(7),
  });

  return `${GITHUB_OAUTH_URL}?${params.toString()}`;
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}
