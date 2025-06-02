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

export interface RepoDetails {
  branch: {
    name: string;
    commit: {
      sha: string;
    };
  };
  recentCommits: GitHubCommit[];
}
