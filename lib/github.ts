import { Octokit } from '@octokit/rest';
import { GitHubRepo, GitHubBranch, GitHubCommit, RepoDetails } from './types';

export async function getGitHubClient(token: string): Promise<Octokit> {
  return new Octokit({ auth: token });
}

export async function getUserRepos(octokit: Octokit): Promise<GitHubRepo[]> {
  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: 'updated',
    per_page: 100,
  });

  return data.map(repo => ({
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description || '',
    updated_at: repo.updated_at || new Date().toISOString(),
  }));
}

export async function getRepoBranches(octokit: Octokit, owner: string, repo: string): Promise<GitHubBranch[]> {
  const { data } = await octokit.repos.listBranches({
    owner,
    repo,
  });

  return data.map(branch => ({
    name: branch.name,
    commit: {
      sha: branch.commit.sha,
      url: branch.commit.url,
    },
    protected: branch.protected,
  }));
}

export async function getDefaultBranch(octokit: Octokit, owner: string, repo: string): Promise<string> {
  const { data } = await octokit.repos.get({
    owner,
    repo,
  });

  return data.default_branch;
}

export async function getRepoDetails(octokit: Octokit, owner: string, repo: string, branch: string): Promise<RepoDetails> {
  const [branchData, commitsData] = await Promise.all([
    octokit.repos.getBranch({
      owner,
      repo,
      branch,
    }),
    octokit.repos.listCommits({
      owner,
      repo,
      sha: branch,
      per_page: 10,
    }),
  ]);

  return {
    branch: {
      name: branchData.data.name,
      commit: {
        sha: branchData.data.commit.sha,
      },
    },
    recentCommits: commitsData.data.map(commit => ({
      sha: commit.sha,
      commit: {
        message: commit.commit.message || '',
        author: {
          name: commit.commit.author?.name || 'Unknown',
          date: commit.commit.author?.date || new Date().toISOString(),
        },
      },
    })),
  };
}
