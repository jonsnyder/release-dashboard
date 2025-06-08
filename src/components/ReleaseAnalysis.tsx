'use client';

import { View, ProgressCircle, Heading, Text } from '@adobe/react-spectrum';
import { RepoDetails } from '../lib/types';

interface ReleaseAnalysisProps {
  repoDetails: RepoDetails | null;
  isLoading: boolean;
  error: Error | null;
}

export function ReleaseAnalysis({ repoDetails, isLoading, error }: ReleaseAnalysisProps) {
  if (isLoading) {
    return (
      <View>
        <ProgressCircle aria-label="Loading repository details" isIndeterminate />
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <Heading level={3}>Error</Heading>
        <Text>{error.message}</Text>
      </View>
    );
  }

  if (!repoDetails) {
    return (
      <View>
        <Text>No repository details available</Text>
      </View>
    );
  }

  return (
    <View>
      <Heading level={3}>Release Analysis</Heading>
      <View>
        <Text>Current Version: {repoDetails.versionInfo.current}</Text>
        {repoDetails.versionInfo.previousStable && (
          <Text>Previous Stable Version: {repoDetails.versionInfo.previousStable}</Text>
        )}
      </View>

      <View marginTop="size-200">
        <Heading level={4}>Recent Commits</Heading>
        {repoDetails.recentCommits.map(commit => (
          <View key={commit.sha} padding="size-100">
            <Text>{commit.commit.message}</Text>
            <Text slot="detail">
              by {commit.commit.author?.name} on {new Date(commit.commit.author?.date || '').toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>

      {repoDetails.parsedReleaseNotes && (
        <View marginTop="size-200">
          <Heading level={4}>Release Notes</Heading>
          {repoDetails.parsedReleaseNotes.sections.map(section => (
            <View key={section.title} padding="size-100">
              <Heading level={5}>{section.title}</Heading>
              {section.prs.map(pr => (
                <View key={pr.number} padding="size-50">
                  <Text>#{pr.number} - {pr.title}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
