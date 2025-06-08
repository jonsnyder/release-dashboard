'use client';

import { useState, useEffect, useCallback } from 'react';
import { Octokit } from '@octokit/rest';
import { getStoredToken, getLoginUrl, clearStoredToken } from '../auth';
import { getGitHubClient } from '../github';
import { API } from '../types';

export default function useOctokit(): API {
  const [octokit, setOctokit] = useState<Octokit | null>(null);
  const [loading, setLoading] = useState(true);

  const onLogin = useCallback(() => {
    window.location.href = getLoginUrl();
  }, []);

  const onLogout = useCallback(() => {
    clearStoredToken();
    setOctokit(null);
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    setLoading(true);
    if (token) {
      getGitHubClient(token)
        .then(setOctokit)
        .catch((error) => {
          console.error('Error initializing GitHub client:', error);
          clearStoredToken(); // Clear invalid token
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return { type: 'loading' };
  }

  if (octokit) {
    return { type: 'authenticated', octokit, onLogout };
  }

  return { type: 'unauthenticated', onLogin };
}
