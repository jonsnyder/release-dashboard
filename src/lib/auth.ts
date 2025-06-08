const TOKEN_KEY = 'github-token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getLoginUrl(returnUrl?: string): string {
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;

  if (!clientId) {
    throw new Error('GitHub client ID not configured');
  }

  const basePath = import.meta.env.VITE_BASE_PATH || '';
  const currentUrl = returnUrl || window.location.hash.substring(1) || '/';

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${window.location.origin}${basePath}/auth/redirect.html`,
    scope: 'repo',
    state: encodeURIComponent(currentUrl), // Store return URL in state
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}
