import { Breadcrumbs, Item, Text } from '@adobe/react-spectrum';
import PageGear from '@spectrum-icons/workflow/PageGear';

interface PageBreadcrumbsProps {
  owner: string | null;
  repo: string | null;
  branch: string;
  defaultBranch: string;
}

export function PageBreadcrumbs({ owner, repo, branch, defaultBranch }: PageBreadcrumbsProps) {
  const isDefaultBranch = branch === defaultBranch;

  const items = [
    <Item key="home" href="/">
      <PageGear />
    </Item>,
    <Item key="owner" href={`/?owner=${owner}`}>
      <Text>{owner}</Text>
    </Item>,
    <Item key="repo" href={`/repo?owner=${owner}&repo=${repo}`}>
      <Text>{repo}</Text>
    </Item>
  ];

  if (!isDefaultBranch) {
    items.push(
      <Item key="branch">
        <Text>{branch || 'Loading...'}</Text>
      </Item>
    );
  }

  return (
    <Breadcrumbs>
      {items}
    </Breadcrumbs>
  );
}
