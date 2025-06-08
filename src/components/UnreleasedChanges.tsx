'use client';

import { View, Heading, Divider, Text, Flex } from '@adobe/react-spectrum';
import { GitHubPullRequest, ParsedReleaseNotes } from '../lib/types';
import { PRTable } from './PRTable';

interface UnreleasedChangesProps {
  unreleasedPRs: GitHubPullRequest[];
  openPRs: GitHubPullRequest[];
  parsedReleaseNotes: ParsedReleaseNotes | null;
  tag?: string | null;
}

export function UnreleasedChanges({ unreleasedPRs, openPRs, parsedReleaseNotes, tag }: UnreleasedChangesProps) {
  const title = tag
    ? `Changes Before ${tag} Release (${unreleasedPRs.length} PRs)`
    : `Unreleased Changes (${unreleasedPRs.length} PRs)`;

  return (
    <View>
      <Heading level={2}>{title}</Heading>
      <Divider />

      <Flex direction="column" gap="size-400">
        {/* Open PRs Section - only show when not viewing a tag */}
        {!tag && openPRs.length > 0 && (
          <View>
            <Heading level={4} marginBottom="size-200">Open Pull Requests ({openPRs.length} PRs)</Heading>
            <PRTable prs={openPRs} keyPrefix="open-" />
          </View>
        )}

        {/* Unreleased (Merged) PRs Section */}
        {unreleasedPRs.length === 0 ? (
          <Text>
            {tag
              ? `No changes found before the ${tag} release.`
              : 'No unreleased changes since the last stable release.'
            }
          </Text>
        ) : parsedReleaseNotes ? (
          <Flex direction="column" gap="size-400">
            {/* Tables for each release notes section */}
            {parsedReleaseNotes.sections.map((section) => (
              <View key={section.title}>
                <Heading level={4} marginBottom="size-200">{section.title} ({section.prs.length} PRs)</Heading>
                <PRTable prs={section.prs} keyPrefix={`${section.title}-`} />
              </View>
            ))}

            {/* Table for PRs not included in release notes */}
            {parsedReleaseNotes.unmentionedPRs.length > 0 && (
              <View>
                <Heading level={4} marginBottom="size-200">PRs not included in release notes ({parsedReleaseNotes.unmentionedPRs.length} PRs)</Heading>
                <PRTable prs={parsedReleaseNotes.unmentionedPRs} keyPrefix="unmentioned-" />
              </View>
            )}
          </Flex>
        ) : (
          // Fallback to single table if parsing failed
          <PRTable prs={unreleasedPRs} />
        )}
      </Flex>
    </View>
  );
}
