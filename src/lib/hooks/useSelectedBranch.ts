import { useState, useEffect } from 'react';
import { useRepoBranches } from './useRepoBranches';
import { Octokit } from '@octokit/rest';

export interface SelectedBranchState {
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
  defaultBranch: string;
  isLoading: boolean;
  error: Error | null;
}

export function useSelectedBranch(
  octokit: Octokit,
  owner: string,
  repo: string,
  initialBranch?: string
): SelectedBranchState {
  const { branches, defaultBranch, loading, error } = useRepoBranches(octokit, owner, repo);
  const [selectedBranch, setSelectedBranch] = useState<string>('');

  useEffect(() => {
    if (!loading && defaultBranch) {
      setSelectedBranch(initialBranch || defaultBranch);
    }
  }, [loading, defaultBranch, initialBranch]);

  return {
    selectedBranch,
    setSelectedBranch,
    defaultBranch,
    isLoading: loading,
    error,
  };
}
