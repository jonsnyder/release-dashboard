import { View, Heading, Divider, Text, Flex, Badge } from '@adobe/react-spectrum';
import { GitHubRelease } from '../../lib/types';

interface RecentReleasesProps {
  releases: GitHubRelease[];
}

export function RecentReleases({ releases }: RecentReleasesProps) {
  return (
    <View>
      <Heading level={2}>Recent Releases</Heading>
      <Divider />
      {releases.length === 0 ? (
        <Text>No releases found.</Text>
      ) : (
        <Flex direction="column" gap="size-300">
          {releases.slice(0, 3).map((release) => (
            <View key={release.tag_name}>
              <Flex direction="row" alignItems="center" gap="size-200" marginBottom="size-100">
                <Text><strong>{release.tag_name}</strong> - {release.name}</Text>
                {release.prerelease && (
                  <Badge variant="yellow">Pre-release</Badge>
                )}
                {release.draft && (
                  <Badge variant="neutral">Draft</Badge>
                )}
              </Flex>
              <Text>Published: {new Date(release.published_at).toLocaleDateString()}</Text>
            </View>
          ))}
        </Flex>
      )}
    </View>
  );
}
