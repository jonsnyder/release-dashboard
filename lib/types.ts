export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
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
    author: {
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
    name?: string;
  };
  created_at: string;
  updated_at: string;
  html_url: string;
  merged_at: string | null;
  deployedVersion?: string;
  labels: Array<{
    name: string;
    color: string;
  }>;
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
  versionInfo: VersionInfo;
  releases: GitHubRelease[];
  parsedReleaseNotes?: ParsedReleaseNotes;
}
