import { Octokit } from '@octokit/rest';
import { GitHubRepo, GitHubBranch, GitHubCommit, GitHubPullRequest, GitHubRelease } from './types';

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

export async function listReleases(octokit: Octokit, owner: string, repo: string): Promise<GitHubRelease[]> {
  try {
    const { data } = await octokit.repos.listReleases({
      owner,
      repo,
      per_page: 50,
    });

    return data.map(release => ({
      tag_name: release.tag_name,
      name: release.name || release.tag_name,
      published_at: release.published_at || '',
      prerelease: release.prerelease,
      draft: release.draft,
      body: release.body || '',
    }));
  } catch (error) {
    console.warn('Could not fetch releases:', error);
    return [];
  }
}

export async function generateReleaseNotes(
  octokit: Octokit,
  owner: string,
  repo: string,
  targetCommitish: string,
  previousTag?: string
): Promise<string> {
  try {
    const { data } = await octokit.repos.generateReleaseNotes({
      owner,
      repo,
      tag_name: `preview-${Date.now()}`, // Temporary tag name for preview
      target_commitish: targetCommitish,
      previous_tag_name: previousTag,
    });

    return data.body;
  } catch (error) {
    console.warn('Could not generate release notes:', error);
    return 'Unable to generate release notes automatically.';
  }
}

export async function getRef(octokit: Octokit, owner: string, repo: string, ref: string): Promise<{ object: { sha: string } }> {
  const { data } = await octokit.git.getRef({
    owner,
    repo,
    ref,
  });

  return {
    object: {
      sha: data.object.sha,
    },
  };
}

export async function getCommit(octokit: Octokit, owner: string, repo: string, ref: string): Promise<{ sha: string }> {
  const { data } = await octokit.repos.getCommit({
    owner,
    repo,
    ref,
  });

  return {
    sha: data.sha,
  };
}

export async function listCommits(
  octokit: Octokit,
  owner: string,
  repo: string,
  sha: string,
  per_page: number,
  page?: number
): Promise<GitHubCommit[]> {
  const { data } = await octokit.repos.listCommits({
    owner,
    repo,
    sha,
    per_page,
    page,
  });

  return data.map(commit => ({
    sha: commit.sha,
    commit: {
      message: commit.commit.message,
      author: {
        name: commit.commit.author?.name || 'Unknown',
        date: commit.commit.author?.date || new Date().toISOString(),
      },
    },
  }));
}

export async function listPullRequests(
  octokit: Octokit,
  owner: string,
  repo: string,
  state: 'open' | 'closed',
  per_page: number,
  page?: number
): Promise<GitHubPullRequest[]> {
  const { data } = await octokit.pulls.list({
    owner,
    repo,
    state,
    sort: 'updated',
    direction: 'desc',
    per_page,
    page,
  });

  return data.map(pr => ({
    number: pr.number,
    title: pr.title,
    user: {
      login: pr.user?.login || 'unknown',
      name: pr.user?.login || 'unknown',
    },
    created_at: pr.created_at,
    updated_at: pr.updated_at,
    html_url: pr.html_url,
    merged_at: pr.merged_at,
    base: {
      ref: pr.base.ref,
    },
    labels: pr.labels.map(label => ({
      name: label.name,
      color: label.color,
    })),
  }));
}

// New functions to handle all Octokit calls from release-analysis.ts
export async function getTagRef(octokit: Octokit, owner: string, repo: string, tag: string): Promise<{ sha: string }> {
  try {
    const tagRef = await getRef(octokit, owner, repo, `tags/${tag}`);
    return { sha: tagRef.object.sha };
  } catch (error) {
    console.warn('Could not get tag ref:', error);
    return { sha: tag };
  }
}

export async function getCommitForTag(octokit: Octokit, owner: string, repo: string, tag: string): Promise<{ sha: string }> {
  try {
    const commit = await getCommit(octokit, owner, repo, tag);
    return { sha: commit.sha };
  } catch (error) {
    console.warn('Could not get commit for tag:', error);
    throw error;
  }
}

export async function getReleaseByTag(octokit: Octokit, owner: string, repo: string, tag: string): Promise<GitHubRelease | null> {
  const releases = await listReleases(octokit, owner, repo);
  return releases.find(r => r.tag_name === tag) || null;
}

export async function getCommitsUntilDate(
  octokit: Octokit,
  owner: string,
  repo: string,
  sha: string,
  until: Date,
  maxCommits = 1000
): Promise<GitHubCommit[]> {
  const commits: GitHubCommit[] = [];
  let page = 1;
  const perPage = 100;

  while (commits.length < maxCommits) {
    const pageCommits = await listCommits(octokit, owner, repo, sha, perPage, page);
    if (pageCommits.length === 0) break;

    for (const commit of pageCommits) {
      if (commit.commit.author?.date && new Date(commit.commit.author.date) <= until) {
        return commits;
      }
      commits.push(commit);
    }

    page++;
  }

  return commits;
}
