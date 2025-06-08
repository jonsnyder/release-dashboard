import { Octokit } from '@octokit/rest';

export type Loading = { type: 'loading' };
export type Error = { type: 'error'; message: string };
export type AsyncStatus = Loading | Error | { type: 'complete' };

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  updated_at: string;
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author?: {
      name: string;
      date: string;
    };
  };
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  user: {
    login: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
  html_url: string;
  merged_at: string | null;
  base: {
    ref: string;
  };
  labels: Array<{
    name: string;
    color: string;
  }>;
  deployedVersion?: string;
}

export interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  prerelease: boolean;
  draft: boolean;
  body: string;
}

export interface VersionInfo {
  current: string;
  previousStable: string | null;
  packageJsonPath: string;
}

export interface ReleaseNotesSection {
  title: string;
  prs: GitHubPullRequest[];
}

export interface ParsedReleaseNotes {
  sections: ReleaseNotesSection[];
  unmentionedPRs: GitHubPullRequest[];
}

export interface RepoDetails {
  branch: {
    name: string;
    commit: {
      sha: string;
    };
  };
  recentCommits: GitHubCommit[];
  unreleasedPRs: GitHubPullRequest[];
  openPRs: GitHubPullRequest[];
  versionInfo: {
    current: string;
    previousStable: string | null;
    packageJsonPath: string;
  };
  releases: GitHubRelease[];
  parsedReleaseNotes?: ParsedReleaseNotes;
}

export type API =
  | Loading
  | Error
  | { type: "unauthenticated"; onLogin: () => void }
  | { type: "authenticated"; octokit: Octokit; onLogout: () => void };

export type Location =
  | { type: 'branch'; owner: string; repo: string; branch: string; isDefault: boolean }
  | { type: 'tag'; owner: string; repo: string; tag: string }
  | Loading
  | Error
  | { type: 'root' }
  | { type: 'unauthenticated', owner: string, repo: string, branchOrTag: string };

export type User =
  | { type: 'authenticated'; avatarUrl: string; login: string; name: string }
  | Loading
  | Error
  | { type: 'unauthenticated' };
