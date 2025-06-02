'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Provider,
  defaultTheme,
  Heading,
  View,
  Text,
  Picker,
  Item,
  Flex,
  Content,
  Divider,
  Button,
} from '@adobe/react-spectrum';
import { getGitHubClient, getRepoBranches, getDefaultBranch, getRepoDetails } from '../../lib/github';
import { getStoredToken, isAuthenticated } from '../../lib/auth';
import { GitHubBranch, RepoDetails } from '../../lib/types';

export default function RepoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');

  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [repoDetails, setRepoDetails] = useState<RepoDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBranchesAndDetails() {
      const token = getStoredToken();
      if (token && owner && repo) {
        const octokit = await getGitHubClient(token);
        const [branchList, defaultBranch] = await Promise.all([
          getRepoBranches(octokit, owner, repo),
          getDefaultBranch(octokit, owner, repo),
        ]);

        setBranches(branchList);

        // If branch is in URL, use it; otherwise use default branch
        const urlBranch = searchParams.get('branch');
        const branchToUse = urlBranch || defaultBranch;
        setSelectedBranch(branchToUse);

        const details = await getRepoDetails(octokit, owner, repo, branchToUse);
        setRepoDetails(details);
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

  if (loading) {
    return (
      <Provider theme={defaultTheme} colorScheme="light">
        <View padding="size-1000">
          <Text>Loading...</Text>
        </View>
      </Provider>
    );
  }

  return (
    <Provider theme={defaultTheme} colorScheme="light">
      <View padding="size-1000">
        <Flex direction="column" gap="size-300">
          <Button
            variant="secondary"
            onPress={() => router.push('/')}
            marginBottom="size-200"
          >
            Back to Repositories
          </Button>

          <Heading level={1}>{owner}/{repo}</Heading>

          <Picker
            label="Branch"
            items={branches}
            selectedKey={selectedBranch}
            onSelectionChange={(selected) => setSelectedBranch(selected as string)}
          >
            {(item: GitHubBranch) => <Item key={item.name}>{item.name}</Item>}
          </Picker>

          {repoDetails && (
            <View>
              <Heading level={2}>Recent Commits</Heading>
              <Divider />
              {repoDetails.recentCommits.map((commit) => (
                <View
                  key={commit.sha}
                  padding="size-200"
                  borderWidth="thin"
                  borderColor="dark"
                  borderRadius="medium"
                  marginY="size-100"
                >
                  <Text>{commit.commit.message}</Text>
                  <Text>By: {commit.commit.author.name}</Text>
                  <Text>Date: {new Date(commit.commit.author.date).toLocaleString()}</Text>
                </View>
              ))}
            </View>
          )}
        </Flex>
      </View>
    </Provider>
  );
}
