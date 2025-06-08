import { useState, useEffect } from 'react';
import { Octokit } from '@octokit/rest';
import { GitHubRepo } from '../types';
import { getUserRepos } from '../github';

export default function useUserRepos(octokit: Octokit) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchRepos() {
      try {
        setLoading(true);
        const repos = await getUserRepos(octokit);
        setRepos(repos);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch repos'));
      } finally {
        setLoading(false);
      }
    }

    fetchRepos();
  }, [octokit]);

  return { repos, loading, error };
}
