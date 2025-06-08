import { useState, useEffect } from 'react';
import { Octokit } from '@octokit/rest';
import { RepoDetails } from '../types';
import { analyzeRepository } from '../release-analysis';

export interface RepoAnalysisState {
  repoDetails: RepoDetails | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useRepoAnalysis(
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string,
  tag?: string | null
): RepoAnalysisState {
  const [repoDetails, setRepoDetails] = useState<RepoDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRepoDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const details = await analyzeRepository(octokit, owner, repo, branch, tag);
      setRepoDetails(details);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to analyze repository'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (owner && repo && branch) {
      fetchRepoDetails();
    }
  }, [owner, repo, branch, tag]);

  return {
    repoDetails,
    isLoading,
    error,
    refresh: fetchRepoDetails,
  };
}
