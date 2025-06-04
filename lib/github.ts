import { Octokit } from '@octokit/rest';
import { GitHubRepo, GitHubBranch, GitHubCommit, GitHubPullRequest, GitHubRelease, RepoDetails, VersionInfo, ParsedReleaseNotes, ReleaseNotesSection } from './types';

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

export async function getPackageJsonVersion(octokit: Octokit, owner: string, repo: string, branch: string): Promise<VersionInfo> {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: 'package.json',
      ref: branch,
    });

    if ('content' in data) {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      const packageJson = JSON.parse(content);

      return {
        current: packageJson.version || '0.0.0',
        previousStable: null, // Will be populated by getRepoDetails
        packageJsonPath: 'package.json',
      };
    }
  } catch (error) {
    console.warn('Could not fetch package.json:', error);
  }

  return {
    current: '0.0.0',
    previousStable: null,
    packageJsonPath: 'package.json',
  };
}

export async function getRepoReleases(octokit: Octokit, owner: string, repo: string): Promise<GitHubRelease[]> {
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

export async function getPRsForBranch(octokit: Octokit, owner: string, repo: string, branch: string, lastReleaseDate?: string): Promise<{ openPRs: GitHubPullRequest[], mergedPRs: GitHubPullRequest[] }> {
  try {
    // Get all PRs (both open and closed) in one efficient call
    const allPRs = [];
    let page = 1;
    const perPage = 100;

    // Fetch all PRs (open first, then closed)
    for (const state of ['open', 'closed'] as const) {
      page = 1;
      while (true) {
        const { data } = await octokit.pulls.list({
          owner,
          repo,
          state,
          sort: 'updated',
          direction: 'desc',
          per_page: perPage,
          page: page,
        });

        if (data.length === 0) break;
        allPRs.push(...data);

        if (data.length < perPage) break;
        page++;
      }
    }

    // Get all commits from the current branch to build a lookup set
    const branchCommits = new Set<string>();
    page = 1;

    try {
      while (true) {
        const { data: commits } = await octokit.repos.listCommits({
          owner,
          repo,
          sha: branch,
          per_page: perPage,
          page: page,
        });

        if (commits.length === 0) break;

        commits.forEach(commit => {
          branchCommits.add(commit.sha);
        });

        if (commits.length < perPage) break;
        page++;
      }
    } catch (error) {
      console.warn(`Could not fetch commits for branch ${branch}:`, error);
    }

    // Filter and categorize PRs
    const lastReleaseDateObj = lastReleaseDate ? new Date(lastReleaseDate) : null;
    const openPRs = [];
    const mergedPRs = [];

    for (const pr of allPRs) {
      // Check if PR is relevant to this branch
      const isRelevant =
        pr.base.ref === branch || // PR targets this branch
        (pr.merge_commit_sha && branchCommits.has(pr.merge_commit_sha)) || // Merged into this branch
        (pr.head.sha && branchCommits.has(pr.head.sha)); // Head commit is in this branch

      if (!isRelevant) continue;

      // Get user details once for each PR
      let authorName = pr.user?.login || 'unknown';
      if (pr.user?.login) {
        try {
          const { data: userData } = await octokit.users.getByUsername({
            username: pr.user.login,
          });
          authorName = userData.name || pr.user.login;
        } catch (error) {
          console.warn(`Could not fetch user details for ${pr.user.login}:`, error);
        }
      }

      const prData = {
        number: pr.number,
        title: pr.title,
        user: {
          login: pr.user?.login || 'unknown',
          name: authorName,
        },
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        html_url: pr.html_url,
        merged_at: pr.merged_at,
        labels: pr.labels.map(label => ({
          name: label.name,
          color: label.color,
        })),
      };

      // Categorize the PR
      if (pr.state === 'open') {
        openPRs.push(prData);
      } else if (pr.merged_at) {
        // Only include merged PRs after the last release date
        if (!lastReleaseDateObj || new Date(pr.merged_at) > lastReleaseDateObj) {
          mergedPRs.push(prData);
        }
      }
    }

    return { openPRs, mergedPRs };
  } catch (error) {
    console.warn('Could not fetch pull requests:', error);
    return { openPRs: [], mergedPRs: [] };
  }
}

export async function generateReleaseNotes(octokit: Octokit, owner: string, repo: string, targetCommitish: string, previousTag?: string): Promise<string> {
  try {
    const { data } = await octokit.repos.generateReleaseNotes({
      owner,
      repo,
      tag_name: `preview-${Date.now()}`, // Temporary tag name for preview
      target_commitish: targetCommitish, // Use branch/SHA instead of tag
      previous_tag_name: previousTag,
    });

    return data.body;
  } catch (error) {
    console.warn('Could not generate release notes:', error);
    return 'Unable to generate release notes automatically.';
  }
}

export async function getRepoDetails(octokit: Octokit, owner: string, repo: string, branch: string): Promise<RepoDetails> {
  const [branchData, commitsData, versionInfo, releases] = await Promise.all([
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
    getPackageJsonVersion(octokit, owner, repo, branch),
    getRepoReleases(octokit, owner, repo),
  ]);

  // Find the previous stable (non-prerelease) version
  const stableReleases = releases.filter(r => !r.prerelease && !r.draft);
  const previousStable = stableReleases.length > 0 ? stableReleases[0] : null;

  // Get both open and unreleased PRs efficiently
  const { openPRs, mergedPRs } = await getPRsForBranch(
    octokit,
    owner,
    repo,
    branch,
    previousStable?.published_at
  );

  // Determine deployed versions for the merged PRs
  const unreleasedPRs = await determineDeployedVersions(mergedPRs, releases);

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
    unreleasedPRs,
    openPRs,
    versionInfo: {
      ...versionInfo,
      previousStable: previousStable?.tag_name || null,
    },
    releases: releases.slice(0, 5), // Show recent 5 releases
  };
}

export async function parseReleaseNotes(releaseNotesMarkdown: string, allPRs: GitHubPullRequest[]): Promise<ParsedReleaseNotes> {
  const sections: ReleaseNotesSection[] = [];
  const mentionedPRNumbers = new Set<number>();

  // Split the markdown into lines
  const lines = releaseNotesMarkdown.split('\n');
  let currentSection: string | null = null;
  let currentSectionPRs: GitHubPullRequest[] = [];

  for (const line of lines) {
    // Check for h3 headers (###)
    const h3Match = line.match(/^### (.+)$/);
    if (h3Match) {
      // Save previous section if it exists
      if (currentSection && currentSectionPRs.length > 0) {
        sections.push({
          title: currentSection,
          prs: [...currentSectionPRs],
        });
      }

      // Start new section
      currentSection = h3Match[1].trim();
      currentSectionPRs = [];
      continue;
    }

    // Look for PR links in the current line
    if (currentSection) {
      // Match GitHub PR URLs - both full URLs and relative links
      const prRegex = /(?:https:\/\/github\.com\/[^\/]+\/[^\/]+\/pull\/|#)(\d+)/g;
      let match;

      while ((match = prRegex.exec(line)) !== null) {
        const prNumber = parseInt(match[1], 10);
        mentionedPRNumbers.add(prNumber);

        // Find the corresponding PR in our list
        const pr = allPRs.find(p => p.number === prNumber);
        if (pr && !currentSectionPRs.some(p => p.number === prNumber)) {
          currentSectionPRs.push(pr);
        }
      }
    }
  }

  // Save the last section
  if (currentSection && currentSectionPRs.length > 0) {
    sections.push({
      title: currentSection,
      prs: [...currentSectionPRs],
    });
  }

  // Find PRs that weren't mentioned in any section
  const unmentionedPRs = allPRs.filter(pr => !mentionedPRNumbers.has(pr.number));

  return {
    sections,
    unmentionedPRs,
  };
}

export async function determineDeployedVersions(prs: GitHubPullRequest[], releases: GitHubRelease[]): Promise<GitHubPullRequest[]> {
  // Sort releases by published date (newest first)
  const sortedReleases = releases
    .filter(r => r.published_at && !r.draft)
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  return prs.map(pr => {
    if (!pr.merged_at) {
      return pr;
    }

    const mergeDate = new Date(pr.merged_at);

    // Find the first release published after this PR was merged
    const deployedInRelease = sortedReleases
      .reverse() // Now oldest first to find the FIRST release after merge
      .find(release => {
        const releaseDate = new Date(release.published_at);
        return releaseDate > mergeDate;
      });

    return {
      ...pr,
      deployedVersion: deployedInRelease?.tag_name || undefined,
    };
  });
}
