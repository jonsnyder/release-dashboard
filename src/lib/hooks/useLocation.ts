'use client';

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Location, API } from '../types';
import { getDefaultBranch } from '../github';
import useAsync from './useAsync';

export default function useLocation(api: API) {
  const [searchParams] = useSearchParams();
  const [location, setLocation] = useState<Location>({ type: "loading" });

  const status = useAsync((handleAsync) => {

    if (api.type === "loading" || api.type === "error") {
      setLocation(api);
    } else if (status.type === "loading" || status.type === "error") {
      setLocation(status);
    } else {
      const owner = searchParams.get('owner');
      const repo = searchParams.get('repo');
      const branch = searchParams.get('branch');
      const tag = searchParams.get('tag');

      if (!owner || !repo) {
        setLocation({ type: "error", message: "Not found: owner and repo params are required." });
      } else if (api.type === "unauthenticated") {
        setLocation({ type: "unauthenticated", owner, repo, branchOrTag: branch || tag || "" });
      } else if (tag) {
        setLocation({ type: "tag", owner, repo, tag });
      } else {
        handleAsync(async () => {
          const defaultBranch = await getDefaultBranch(api.octokit, owner, repo);
          setLocation({
            type: "branch",
            owner,
            repo,
            branch: branch || defaultBranch,
            isDefault: branch === defaultBranch || !branch
          });
        });
      }
    }
  }, [api, searchParams]);

  return location;
}
