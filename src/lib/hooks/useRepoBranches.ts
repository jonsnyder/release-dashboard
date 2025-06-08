import { useState, useEffect } from 'react';
import { Octokit } from '@octokit/rest';
import { GitHubBranch } from '../types';
import { getRepoBranches, getDefaultBranch } from '../github';

export interface RepoBranchesData {
  branches: GitHubBranch[];
  defaultBranch: string;
  loading: boolean;
  error: Error | null;
}

export function useRepoBranches(
  octokit: Octokit,
  owner: string,
  repo: string
): RepoBranchesData {
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [defaultBranch, setDefaultBranch] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchBranches() {
      try {
        setLoading(true);
        const [branchesData, defaultBranchName] = await Promise.all([
          getRepoBranches(octokit, owner, repo),
          getDefaultBranch(octokit, owner, repo),
        ]);
        setBranches(branchesData);
        setDefaultBranch(defaultBranchName);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch branches'));
      } finally {
        setLoading(false);
      }
    }

    if (owner && repo) {
      fetchBranches();
    }
  }, [octokit, owner, repo]);

  return { branches, defaultBranch, loading, error };
}
