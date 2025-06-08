'use client';

import { View, Heading, Divider, Text, Flex, Link } from '@adobe/react-spectrum';
import { GitHubRelease } from '../lib/types';

interface RecentReleasesProps {
  releases: GitHubRelease[];
  owner: string | null;
  repo: string | null;
}

export function RecentReleases({ releases, owner, repo }: RecentReleasesProps) {
  // Filter out releases with labels (prerelease or draft) and take the first 5
  const filteredReleases = releases
    .filter(release => !release.prerelease && !release.draft)
    .slice(0, 5);

  return (
    <View>
      <Heading level={2}>Past Releases</Heading>
      <Divider />
      {filteredReleases.length === 0 ? (
        <Text>No releases found.</Text>
      ) : (
        <Flex direction="column" gap="size-300">
          {filteredReleases.map((release) => (
            <View key={release.tag_name}>
              <Flex direction="row" alignItems="center" gap="size-200" marginBottom="size-100">
                <Link href={`/repo?owner=${owner}&repo=${repo}&tag=${release.tag_name}`}>
                  <Text><strong>{release.tag_name}</strong></Text>
                </Link>
                <Text>- {release.name}</Text>
              </Flex>
              <Text>Published: {new Date(release.published_at).toLocaleDateString()}</Text>
            </View>
          ))}
        </Flex>
      )}
    </View>
  );
}
