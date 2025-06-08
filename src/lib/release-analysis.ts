import { Octokit } from '@octokit/rest';
import { GitHubCommit, GitHubPullRequest, GitHubRelease, RepoDetails, ParsedReleaseNotes, ReleaseNotesSection } from './types';
import {
  getDefaultBranch,
  getTagRef,
  listCommits,
  listReleases,
  generateReleaseNotes as generateGitHubReleaseNotes,
  listPullRequests,
  getCommitForTag,
  getReleaseByTag,
  getCommitsUntilDate,
} from './github';

// Step 1: Determine the target SHA
async function determineTargetSha(
  octokit: Octokit,
  owner: string,
  repo: string,
  branch?: string,
  tag?: string | null
): Promise<{ targetSha: string; effectiveBranch: string }> {
  if (tag) {
    console.log('Processing tag:', tag);
    try {
      const { sha: taggedCommitSha } = await getTagRef(octokit, owner, repo, tag);
      console.log('Tagged commit SHA:', taggedCommitSha);

      // Get commits leading up to the tag to find the commit before
      const commits = await listCommits(octokit, owner, repo, taggedCommitSha, 50);
      const taggedCommitIndex = commits.findIndex(commit => commit.sha === taggedCommitSha);

      if (taggedCommitIndex >= 0 && taggedCommitIndex < commits.length - 1) {
        const targetSha = commits[taggedCommitIndex + 1].sha;
        console.log('Using commit before tagged commit:', targetSha);
        return { targetSha, effectiveBranch: branch || await getDefaultBranch(octokit, owner, repo) };
      } else {
        console.log('Using tagged commit (no previous commit found):', taggedCommitSha);
        return { targetSha: taggedCommitSha, effectiveBranch: branch || await getDefaultBranch(octokit, owner, repo) };
      }
    } catch (error) {
      console.warn('Could not process tag, using tag as reference:', error);
      return { targetSha: tag, effectiveBranch: branch || await getDefaultBranch(octokit, owner, repo) };
    }
  }

  if (branch) {
    return { targetSha: branch, effectiveBranch: branch };
  }

  // No branch or tag specified, use default branch
  const defaultBranch = await getDefaultBranch(octokit, owner, repo);
  return { targetSha: defaultBranch, effectiveBranch: defaultBranch };
}

// Step 2: Get releases and organize by SHA
async function getReleasesWithShaMap(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<{ releases: GitHubRelease[]; releaseBySha: Map<string, GitHubRelease> }> {
  const releases = await listReleases(octokit, owner, repo);
  const releaseBySha = new Map<string, GitHubRelease>();

  // Build SHA lookup map for releases
  for (const release of releases) {
    try {
      const { sha } = await getCommitForTag(octokit, owner, repo, release.tag_name);
      releaseBySha.set(sha, release);
      console.log(`Mapped release ${release.tag_name} to commit ${sha}`);
    } catch (error) {
      console.warn(`Could not get commit for tag ${release.tag_name}:`, error);
    }
  }

  return { releases, releaseBySha };
}

// Step 3: Get commits until reaching a stable release
async function getCommitsUntilStableRelease(
  octokit: Octokit,
  owner: string,
  repo: string,
  targetSha: string,
  releaseBySha: Map<string, GitHubRelease>
): Promise<{ commits: GitHubCommit[]; lastStableRelease: GitHubRelease | null }> {
  const commits: GitHubCommit[] = [];
  let lastStableRelease: GitHubRelease | null = null;
  let page = 1;
  const perPage = 100;

  console.log('Walking commit history from:', targetSha);

  while (commits.length < 1000) { // Safety limit
    const pageCommits = await listCommits(octokit, owner, repo, targetSha, perPage, page);
    if (pageCommits.length === 0) break;

    for (const commit of pageCommits) {
      commits.push(commit);

      // Check if this commit corresponds to a stable release
      const release = releaseBySha.get(commit.sha);
      if (release && !release.prerelease && !release.draft) {
        lastStableRelease = release;
        console.log('Found stable release:', release.tag_name, 'at commit:', commit.sha);
        return { commits, lastStableRelease };
      }
    }

    page++;
  }

  console.log('Reached end of commit history without finding stable release');
  return { commits, lastStableRelease };
}

// Step 4: Get PRs until the last stable version
async function getPRsUntilStableRelease(
  octokit: Octokit,
  owner: string,
  repo: string,
  effectiveBranch: string,
  lastStableRelease: GitHubRelease | null,
  tag?: string
): Promise<{ openPRs: GitHubPullRequest[]; mergedPRs: GitHubPullRequest[] }> {
  const mergedPRs: GitHubPullRequest[] = [];
  const openPRs: GitHubPullRequest[] = [];

  // If we have a last stable release, use its date as the starting point
  // If not, we'll fetch recent PRs without a date filter
  const sinceDate = lastStableRelease?.published_at;
  console.log('Fetching PRs since:', sinceDate || 'beginning');

  // Get merged PRs
  let page = 1;
  const perPage = 100;

  while (mergedPRs.length < 500) { // Performance limit
    const prs = await listPullRequests(octokit, owner, repo, 'closed', perPage, page);
    if (prs.length === 0) break;

    let foundOldPR = false;
    for (const pr of prs) {
      if (pr.merged_at && pr.base.ref === effectiveBranch) {
        const mergedDate = new Date(pr.merged_at);

        // Only check against sinceDate if we have one
        if (sinceDate && mergedDate <= new Date(sinceDate)) {
          foundOldPR = true;
          break;
        }

        mergedPRs.push(pr);
      }
    }

    if (foundOldPR) break;
    page++;
  }

  // Get open PRs (only for branches, not tags)
  if (!tag) {
    const openPRData = await listPullRequests(octokit, owner, repo, 'open', 100);
    openPRs.push(...openPRData.filter(pr => pr.base.ref === effectiveBranch));
  }

  console.log('Found PRs:', { merged: mergedPRs.length, open: openPRs.length });
  return { openPRs, mergedPRs };
}

// Step 5: Annotate PRs with version info by looking up commits
async function annotatePRsWithVersions(
  mergedPRs: GitHubPullRequest[],
  commits: GitHubCommit[],
  releaseBySha: Map<string, GitHubRelease>
): Promise<GitHubPullRequest[]> {
  console.log('Annotating PRs with version info...');

  // Build a map of commit SHA to release for faster lookup
  const commitToRelease = new Map<string, GitHubRelease>();

  for (const commit of commits) {
    const release = releaseBySha.get(commit.sha);
    if (release) {
      commitToRelease.set(commit.sha, release);
    }
  }

  // For each PR, find which release it was deployed in
  return mergedPRs.map(pr => {
    if (!pr.merged_at) return pr;

    // Find the first release after this PR was merged
    const mergedDate = new Date(pr.merged_at);
    let deployedInRelease: GitHubRelease | null = null;

    for (const commit of commits) {
      const release = releaseBySha.get(commit.sha);
      if (release && new Date(release.published_at) > mergedDate) {
        if (!deployedInRelease || new Date(release.published_at) < new Date(deployedInRelease.published_at)) {
          deployedInRelease = release;
        }
      }
    }

    return {
      ...pr,
      deployedVersion: deployedInRelease?.tag_name,
    };
  });
}

// Step 6: Generate or get release notes
async function getOrGenerateReleaseNotes(
  octokit: Octokit,
  owner: string,
  repo: string,
  effectiveBranch: string,
  tag: string | undefined,
  releases: GitHubRelease[],
  lastStableRelease: GitHubRelease | null,
  unreleasedPRs: GitHubPullRequest[]
): Promise<string> {
  if (tag) {
    // Use release notes from the tagged release
    const taggedRelease = await getReleaseByTag(octokit, owner, repo, tag);
    if (taggedRelease?.body) {
      console.log('Using release notes from tagged release');
      return taggedRelease.body;
    }
  }

  // Generate release notes for branch
  if (unreleasedPRs.length > 0) {
    try {
      const previousTag = lastStableRelease?.tag_name;
      console.log('Generating release notes for branch with previous tag:', previousTag);
      return await generateGitHubReleaseNotes(octokit, owner, repo, effectiveBranch, previousTag);
    } catch (error) {
      console.warn('Could not generate release notes:', error);
    }
  }

  return '';
}

// Step 7: Parse release notes into sections
export function parseReleaseNotes(releaseNotesMarkdown: string, allPRs: GitHubPullRequest[]): ParsedReleaseNotes {
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

// Main function that orchestrates the analysis
export async function analyzeRepository(
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string,
  tag?: string | null
): Promise<RepoDetails> {
  console.log('=== Starting organized repository analysis ===');

  try {
    // Step 1: Determine the target SHA
    const { targetSha, effectiveBranch } = await determineTargetSha(octokit, owner, repo, branch, tag);
    console.log('Step 1 complete - Target SHA:', targetSha, 'Effective branch:', effectiveBranch);

    // Step 2: Get releases and organize by SHA
    const { releases, releaseBySha } = await getReleasesWithShaMap(octokit, owner, repo);
    console.log('Step 2 complete - Found releases:', releases.length, 'SHA mappings:', releaseBySha.size);

    // Step 3: Get commits until reaching a stable release
    const { commits, lastStableRelease } = await getCommitsUntilStableRelease(octokit, owner, repo, targetSha, releaseBySha);
    console.log('Step 3 complete - Commits analyzed:', commits.length, 'Last stable:', lastStableRelease?.tag_name);

    // Step 4: Get PRs until the last stable version
    const { openPRs, mergedPRs } = await getPRsUntilStableRelease(octokit, owner, repo, effectiveBranch, lastStableRelease, tag || undefined);
    console.log('Step 4 complete - PRs found:', { merged: mergedPRs.length, open: openPRs.length });

    // Step 5: Annotate PRs with version info
    const annotatedPRs = await annotatePRsWithVersions(mergedPRs, commits, releaseBySha);
    console.log('Step 5 complete - PRs annotated with versions');

    // Step 6: Generate or get release notes
    const releaseNotes = await getOrGenerateReleaseNotes(
      octokit, owner, repo, effectiveBranch, tag || undefined, releases, lastStableRelease, annotatedPRs
    );
    console.log('Step 6 complete - Release notes length:', releaseNotes.length);

    // Step 7: Parse release notes into sections
    const parsedReleaseNotes = releaseNotes ? parseReleaseNotes(releaseNotes, annotatedPRs) : undefined;
    console.log('Step 7 complete - Release notes parsed');

    // Create version info object
    const versionInfo = {
      current: tag || lastStableRelease?.tag_name || 'No releases',
      previousStable: lastStableRelease?.tag_name || null,
      packageJsonPath: 'package.json', // Keep for compatibility
    };

    console.log('=== Repository analysis complete ===');

    return {
      branch: {
        name: tag || effectiveBranch,
        commit: {
          sha: targetSha,
        },
      },
      recentCommits: commits.slice(0, 10).map(commit => ({
        sha: commit.sha,
        commit: {
          message: commit.commit.message || '',
          author: {
            name: commit.commit.author?.name || 'Unknown',
            date: commit.commit.author?.date || new Date().toISOString(),
          },
        },
      })),
      unreleasedPRs: annotatedPRs,
      openPRs: tag ? [] : openPRs,
      versionInfo,
      releases: releases.slice(0, 5),
      parsedReleaseNotes: parsedReleaseNotes,
    };
  } catch (error) {
    console.error('Error in analyzeRepository:', error);
    throw error;
  }
}
