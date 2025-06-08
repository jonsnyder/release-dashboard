'use client';

import {
  TableView,
  TableHeader,
  Column,
  TableBody,
  Row,
  Cell,
  Flex,
  Link,
  Text,
} from '@adobe/react-spectrum';
import { GitHubPullRequest } from '../lib/types';
import { GitHubLabel } from './GitHubLabel';

interface PRTableProps {
  prs: GitHubPullRequest[];
  keyPrefix?: string;
}

export function PRTable({ prs, keyPrefix = '' }: PRTableProps) {
  return (
    <TableView>
      <TableHeader>
        <Column>Merge Date</Column>
        <Column>Author</Column>
        <Column defaultWidth="50%">Pull Request</Column>
        <Column>Released Version</Column>
        <Column>Labels</Column>
      </TableHeader>
      <TableBody>
        {prs.map((pr) => (
          <Row key={`${keyPrefix}${pr.number}`}>
            <Cell>{new Date(pr.merged_at || '').toLocaleDateString()}</Cell>
            <Cell>{pr.user.name || pr.user.login}</Cell>
            <Cell>
              <Flex direction="row" alignItems="center" gap="size-50" wrap>
                <Link>
                  <a href={pr.html_url} target="_blank" rel="noopener noreferrer">
                    #{pr.number}
                  </a>
                </Link>
                <Text>: {pr.title}</Text>
              </Flex>
            </Cell>
            <Cell>
              {pr.deployedVersion ? (
                <Text>{pr.deployedVersion}</Text>
              ) : (
                <Text UNSAFE_style={{ fontStyle: 'italic', color: 'var(--spectrum-global-color-gray-600)' }}>
                  Not released
                </Text>
              )}
            </Cell>
            <Cell>
              <Flex direction="row" gap="size-100" wrap>
                {pr.labels.map((label) => (
                  <GitHubLabel key={label.name} name={label.name} color={label.color} />
                ))}
              </Flex>
            </Cell>
          </Row>
        ))}
      </TableBody>
    </TableView>
  );
}
