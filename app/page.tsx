'use client';

import { useEffect, useState } from 'react';
import { Provider, defaultTheme, Heading, View, Text, Button, Flex, Content, Grid, Link } from '@adobe/react-spectrum';
import Workflow from '@spectrum-icons/workflow/Workflow';
import { getGitHubClient, getUserRepos } from '../lib/github';
import { getStoredToken, getLoginUrl, removeStoredToken, isAuthenticated } from '../lib/auth';
import { GitHubRepo } from '../lib/types';

export default function Home() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setLoading(false);
  }, []);

  useEffect(() => {
    async function fetchRepos() {
      const token = getStoredToken();
      if (token) {
        const octokit = await getGitHubClient(token);
        const userRepos = await getUserRepos(octokit);
        setRepos(userRepos);
      }
    }

    if (authenticated) {
      fetchRepos();
    }
  }, [authenticated]);

  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  const handleLogout = () => {
    removeStoredToken();
    setAuthenticated(false);
    setRepos([]);
  };

  return (
    <Provider theme={defaultTheme} colorScheme="light">
      <View height="100vh" padding="size-1000">
        <Flex direction="column" gap="size-300" alignItems="center">
          <Workflow size="XXL" />
          <Heading level={1}>Release Automation</Heading>

          {loading ? (
            <Text>Loading...</Text>
          ) : authenticated ? (
            <>
              <Flex gap="size-100" marginBottom="size-300">
                <Button variant="secondary" onPress={handleLogout}>
                  Sign Out
                </Button>
              </Flex>

              <Grid columns={['1fr']} gap="size-200" width="100%" maxWidth="size-6000">
                {repos.map((repo) => (
                  <View
                    key={repo.id}
                    padding="size-300"
                    borderWidth="thin"
                    borderColor="dark"
                    borderRadius="medium"
                  >
                    <Link href={`/repo?owner=${encodeURIComponent(repo.full_name.split('/')[0])}&repo=${encodeURIComponent(repo.full_name.split('/')[1])}`}>
                      <Heading level={3}>{repo.name}</Heading>
                      <Text>{repo.description}</Text>
                      <Text>Last updated: {new Date(repo.updated_at).toLocaleDateString()}</Text>
                    </Link>
                  </View>
                ))}
              </Grid>
            </>
          ) : (
            <Button variant="cta" onPress={handleLogin}>
              Sign in with GitHub
            </Button>
          )}
        </Flex>
      </View>
    </Provider>
  );
}
