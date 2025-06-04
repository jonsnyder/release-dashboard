import { Heading, Link } from '@adobe/react-spectrum';

interface PageTitleProps {
  owner: string | null;
  repo: string | null;
  branch: string;
  defaultBranch: string;
}

export function PageTitle({ owner, repo, branch, defaultBranch }: PageTitleProps) {
  const isDefaultBranch = branch === defaultBranch;

  let title = '';
  let githubUrl = '';

  if (owner && repo) {
    title = `${owner} / ${repo}`;
    githubUrl = `https://github.com/${owner}/${repo}`;

    if (!isDefaultBranch && branch) {
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
    <div>
      <style dangerouslySetInnerHTML={{
        __html: `
          .github-title-link {
            color: inherit !important;
            text-decoration: none !important;
          }
          .github-title-link:hover {
            text-decoration: underline !important;
          }
        `
      }} />
      <Heading level={1}>
        <Link
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          UNSAFE_className="github-title-link"
        >
          {title}
        </Link>
      </Heading>
    </div>
  );
}
