'use client';

import { Heading, Link } from '@adobe/react-spectrum';

interface PageTitleProps {
  owner: string | null;
  repo: string | null;
  branch: string;
  defaultBranch: string;
  tag?: string | null;
}

export function PageTitle({ owner, repo, branch, defaultBranch, tag }: PageTitleProps) {
  const isDefaultBranch = branch === defaultBranch;

  let title = '';
  let githubUrl = '';

  if (owner && repo) {
    title = `${owner} / ${repo}`;
    githubUrl = `https://github.com/${owner}/${repo}`;

    if (tag) {
      title += ` / ${tag}`;
      githubUrl += `/releases/tag/${tag}`;
    } else if (!isDefaultBranch && branch) {
      title += ` / ${branch}`;
      githubUrl += `/tree/${branch}`;
    }
  }

  if (!title) {
    return (
      <Heading level={1} marginBottom="size-300">
        Loading...
      </Heading>
    );
  }

  return (
    <Heading level={1}>
      <Link
        href={githubUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {title}
      </Link>
    </Heading>
  );
}
