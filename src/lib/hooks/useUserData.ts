'use client';

import { useState } from 'react';
import { Octokit } from '@octokit/rest';
import { User, API } from '../types';
import useAsync from './useAsync';

export default function useUserData(api: API) {
  const [user, setUser] = useState<User>({ type: 'loading' });
  const status = useAsync((handleAsync) => {
    if (api.type === "loading" || api.type === "error") {
      setUser(api);
    } else if (status.type === "loading" || status.type === "error") {
      setUser(status);
    } else if (api.type === "unauthenticated") {
      setUser({ type: "unauthenticated" });
    } else if (api.type === "authenticated") {
      setUser({ type: 'loading' });
      handleAsync(async () => {
        const { data } = await api.octokit.users.getAuthenticated();
        setUser({
          type: 'authenticated',
          avatarUrl: data.avatar_url,
          login: data.login,
          name: data.name || data.login,
        });
      });
    }
  }, [api]);

  return user;
}
