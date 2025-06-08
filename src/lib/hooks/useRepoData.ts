import { useState, useEffect, useCallback } from 'react';
import { getGitHubClient, getRepoBranches, getDefaultBranch, generateReleaseNotes } from '../github';
import { parseReleaseNotes, analyzeRepository } from '../release-analysis';
import { getStoredToken } from '../auth';
import { GitHubBranch, RepoDetails, ParsedReleaseNotes } from '../types';

export interface UseRepoDataParams {
  owner: string | null;
  repo: string | null;
  tag?: string | null;
  urlBranch?: string | null;
}

export interface UseRepoDataReturn {
  loading: boolean;
  error: string | null;
  branches: GitHubBranch[];
  selectedBranch: string;
  defaultBranch: string;
  repoDetails: RepoDetails | null;
  releaseNotesPreview: string;
  parsedReleaseNotes: ParsedReleaseNotes | null;
  refetch: () => Promise<void>;
  changeBranch: (newBranch: string) => Promise<void>;
}

export default function useRepoData({ owner, repo, tag, urlBranch }: UseRepoDataParams): UseRepoDataReturn {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [defaultBranch, setDefaultBranch] = useState('');
  const [repoDetails, setRepoDetails] = useState<RepoDetails | null>(null);
  const [releaseNotesPreview, setReleaseNotesPreview] = useState<string>('');
  const [parsedReleaseNotes, setParsedReleaseNotes] = useState<ParsedReleaseNotes | null>(null);
  const [lastFetchKey, setLastFetchKey] = useState<string>('');

  // Fetch repo details for a specific branch
  const fetchRepoDetails = useCallback(async (branch: string) => {
    if (!owner || !repo) return;

    const token = getStoredToken();
    if (!token) return;

    const octokit = await getGitHubClient(token);
    const repoDetails = await analyzeRepository(octokit, owner, repo, branch);
    setRepoDetails(repoDetails);

    // Generate release notes preview if not viewing a tag
    if (!tag) {
      const releaseNotes = await generateReleaseNotes(octokit, owner, repo, branch, repoDetails.versionInfo.previousStable || undefined);
      setReleaseNotesPreview(releaseNotes);
      setParsedReleaseNotes(parseReleaseNotes(releaseNotes, repoDetails.unreleasedPRs));
    }
  }, [owner, repo, tag]);

  // Initialize data
  const initializeData = useCallback(async () => {
    if (!owner || !repo) return;

    setLoading(true);
    setError(null);

    try {
      const token = getStoredToken();
      if (!token) return;

      const octokit = await getGitHubClient(token);

      // Fetch branches and default branch
      const [branchList, defaultBranchName] = await Promise.all([
        getRepoBranches(octokit, owner, repo),
        getDefaultBranch(octokit, owner, repo),
      ]);

      setBranches(branchList);
      setDefaultBranch(defaultBranchName);

      // Determine which branch to use
      const branchToUse = tag ? defaultBranchName : (urlBranch || defaultBranchName);
      setSelectedBranch(branchToUse);

      // Fetch repo details
      await fetchRepoDetails(branchToUse);
    } catch (error) {
      console.error('Error initializing data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load repository data');
    } finally {
      setLoading(false);
    }
  }, [owner, repo, tag, urlBranch, fetchRepoDetails]);

  // Change branch handler
  const changeBranch = useCallback(async (newBranch: string) => {
    if (tag) return; // Don't change branch when viewing a tag

    setSelectedBranch(newBranch);
    setLoading(true);
    setError(null);

    try {
      await fetchRepoDetails(newBranch);
    } catch (error) {
      console.error('Error changing branch:', error);
      setError(error instanceof Error ? error.message : 'Failed to load branch data');
    } finally {
      setLoading(false);
    }
  }, [tag, fetchRepoDetails]);

  // Refetch current data
  const refetch = useCallback(async () => {
    // Clear the last fetch key to force a refetch
    setLastFetchKey('');
    await initializeData();
  }, [initializeData]);

  // Initialize on mount
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  return {
    loading,
    error,
    branches,
    selectedBranch,
    defaultBranch,
    repoDetails,
    releaseNotesPreview,
    parsedReleaseNotes,
    refetch,
    changeBranch,
  };
}
