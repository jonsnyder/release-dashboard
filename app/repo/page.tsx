'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Provider,
  defaultTheme,
  View,
  Flex,
} from '@adobe/react-spectrum';
import { getGitHubClient, getRepoBranches, getDefaultBranch, getRepoDetails, generateReleaseNotes, parseReleaseNotes } from '../../lib/github';
import { getStoredToken, isAuthenticated, clearStoredToken } from '../../lib/auth';
import { GitHubBranch, RepoDetails, ParsedReleaseNotes } from '../../lib/types';
import { UnreleasedChanges } from '../components/UnreleasedChanges';
import { ReleaseNotesPreview } from '../components/ReleaseNotesPreview';
import { RecentReleases } from '../components/RecentReleases';
import { ReleaseState } from '../components/ReleaseState';
import { BranchSelector } from '../components/BranchSelector';
import { UserInfo } from '../components/UserInfo';
import { PageBreadcrumbs } from '../components/PageBreadcrumbs';
import { PageTitle } from '../components/PageTitle';

export default function RepoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');

  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [defaultBranch, setDefaultBranch] = useState('');
  const [repoDetails, setRepoDetails] = useState<RepoDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [releaseNotesPreview, setReleaseNotesPreview] = useState<string>('');
  const [parsedReleaseNotes, setParsedReleaseNotes] = useState<ParsedReleaseNotes | null>(null);
  const [currentUser, setCurrentUser] = useState<{ login: string; name?: string; avatar_url: string } | null>(null);

  useEffect(() => {
    async function fetchBranchesAndDetails() {
      const token = getStoredToken();
      if (token && owner && repo) {
        const octokit = await getGitHubClient(token);

        // Fetch current user info
        try {
          const { data: user } = await octokit.users.getAuthenticated();
          setCurrentUser({
            login: user.login,
            name: user.name || undefined,
            avatar_url: user.avatar_url,
          });
        } catch (error) {
          console.warn('Could not fetch user info:', error);
        }

        const [branchList, defaultBranchName] = await Promise.all([
          getRepoBranches(octokit, owner, repo),
          getDefaultBranch(octokit, owner, repo),
        ]);

        setBranches(branchList);
        setDefaultBranch(defaultBranchName);

        // If branch is in URL, use it; otherwise use default branch
        const urlBranch = searchParams.get('branch');
        const branchToUse = urlBranch || defaultBranchName;
        setSelectedBranch(branchToUse);

        const details = await getRepoDetails(octokit, owner, repo, branchToUse);
        setRepoDetails(details);

        // Generate preview release notes if there are unreleased PRs
        if (details.unreleasedPRs.length > 0) {
          try {
            const previousTag = details.versionInfo.previousStable;
            const notes = await generateReleaseNotes(octokit, owner, repo, branchToUse, previousTag || undefined);
            setReleaseNotesPreview(notes);

            // Parse the release notes to categorize PRs
            const parsed = await parseReleaseNotes(notes, details.unreleasedPRs);
            setParsedReleaseNotes(parsed);
          } catch (error) {
            console.warn('Could not generate release notes preview:', error);
          }
        }
      }
      setLoading(false);
    }

    if (!isAuthenticated()) {
      router.push('/');
    } else if (!owner || !repo) {
      router.push('/');
    } else {
      fetchBranchesAndDetails();
    }
  }, [owner, repo, router, searchParams]);

  useEffect(() => {
    async function fetchBranchDetails() {
      const token = getStoredToken();
      if (token && owner && repo && selectedBranch) {
        const octokit = await getGitHubClient(token);
        const details = await getRepoDetails(octokit, owner, repo, selectedBranch);
        setRepoDetails(details);

        // Update URL with new branch
        const params = new URLSearchParams({
          owner,
          repo,
          branch: selectedBranch
        });
        router.push(`/repo?${params.toString()}`);
      }
    }

    if (selectedBranch) {
      fetchBranchDetails();
    }
  }, [selectedBranch, owner, repo]);

  const handleInitializeRelease = (type: 'major' | 'minor' | 'patch') => {
    // TODO: Implement GitHub workflow trigger for initializing release
    console.log(`Initialize ${type} release`);
    // This would trigger a GitHub workflow to:
    // 1. Calculate the next version based on type
    // 2. Update package.json with new version + -beta.0
    // 3. Create a commit and tag
    alert(`Would initialize ${type} release. Implement GitHub workflow trigger here.`);
  };

  const handleCompleteRelease = () => {
    // TODO: Implement GitHub workflow trigger for completing release
    console.log('Complete release');
    // This would trigger a GitHub workflow to:
    // 1. Remove -beta.x suffix from current version
    // 2. Update package.json with final version
    // 3. Create final release and tag
    alert('Would complete release. Implement GitHub workflow trigger here.');
  };

  const handleLogout = () => {
    clearStoredToken();
    router.push('/');
  };

  if (loading) {
    return (
      <Provider theme={defaultTheme} colorScheme="light">
        <View padding="size-1000">
          Loading...
        </View>
      </Provider>
    );
  }

  return (
    <Provider theme={defaultTheme} colorScheme="light">
      <View height="100vh" backgroundColor="gray-50" overflow="auto">
        {/* Top Navigation Bar */}
        <View paddingX="size-1000" paddingTop="size-200" paddingBottom="size-200">
          <Flex direction="row" justifyContent="space-between" alignItems="center" width="100%">
            {/* Navigation Breadcrumbs */}
            <View flex={1} minWidth={0}>
              <PageBreadcrumbs owner={owner} repo={repo} branch={selectedBranch} defaultBranch={defaultBranch} />
            </View>

            {/* User Info with Logout */}
            {currentUser && (
              <View flexShrink={0} marginX="size-200">
                <UserInfo user={currentUser} onLogout={handleLogout} />
              </View>
            )}
          </Flex>
        </View>

        {/* Main Content */}
        <View paddingX="size-1000" paddingBottom="size-1000">
          <Flex direction="column" gap="size-500">
            {/* Title and Branch Selector Row */}
            <Flex direction="row" justifyContent="space-between" alignItems="center" marginBottom="size-300">
              <PageTitle owner={owner} repo={repo} branch={selectedBranch} defaultBranch={defaultBranch} />
              <BranchSelector branches={branches} selectedBranch={selectedBranch} onBranchChange={setSelectedBranch} />
            </Flex>

            {repoDetails && (
              <Flex direction="column" gap="size-500">
                <ReleaseState
                  versionInfo={repoDetails.versionInfo}
                  onInitializeRelease={handleInitializeRelease}
                  onCompleteRelease={handleCompleteRelease}
                />

                {releaseNotesPreview && (
                  <ReleaseNotesPreview releaseNotes={releaseNotesPreview} />
                )}

                <UnreleasedChanges
                  unreleasedPRs={repoDetails.unreleasedPRs}
                  openPRs={repoDetails.openPRs}
                  parsedReleaseNotes={parsedReleaseNotes}
                />

                <RecentReleases releases={repoDetails.releases} />
              </Flex>
            )}
          </Flex>
        </View>
      </View>
    </Provider>
  );
}
