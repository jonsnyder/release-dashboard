import { View, Heading, Divider, Text, Flex, Button, ButtonGroup, Badge } from '@adobe/react-spectrum';
import { VersionInfo as VersionInfoType } from '../../lib/types';

interface ReleaseStateProps {
  versionInfo: VersionInfoType;
  onInitializeRelease?: (type: 'major' | 'minor' | 'patch') => void;
  onCompleteRelease?: () => void;
}

interface ReleaseStateInfo {
  isReleaseInProgress: boolean;
  currentVersion: string;
  betaVersion?: string;
  nextVersions: {
    major: string;
    minor: string;
    patch: string;
  };
}

function analyzeReleaseState(currentVersion: string): ReleaseStateInfo {
  const isBeta = currentVersion.includes('-beta.');
  const betaMatch = currentVersion.match(/-beta\.(\d+)$/);

  let baseVersion = currentVersion;
  let betaVersion: string | undefined;

  if (isBeta && betaMatch) {
    baseVersion = currentVersion.replace(/-beta\.\d+$/, '');
    betaVersion = betaMatch[1];
  }

  // Parse the base version
  const versionParts = baseVersion.split('.').map(Number);
  const [major = 0, minor = 0, patch = 0] = versionParts;

  // Calculate next possible versions
  const nextVersions = {
    major: `${major + 1}.0.0`,
    minor: `${major}.${minor + 1}.0`,
    patch: `${major}.${minor}.${patch + 1}`,
  };

  return {
    isReleaseInProgress: isBeta,
    currentVersion,
    betaVersion,
    nextVersions,
  };
}

export function ReleaseState({ versionInfo, onInitializeRelease, onCompleteRelease }: ReleaseStateProps) {
  const releaseState = analyzeReleaseState(versionInfo.current);

  return (
    <View>
      <Heading level={2}>Release State</Heading>
      <Divider />

      <Flex direction="column" gap="size-300">
        <Flex direction="row" alignItems="center" gap="size-200">
          <Text><strong>Current Version:</strong> {releaseState.currentVersion}</Text>
          {releaseState.isReleaseInProgress && (
            <Badge variant="yellow">Beta in Progress</Badge>
          )}
          {!releaseState.isReleaseInProgress && (
            <Badge variant="positive">Stable</Badge>
          )}
        </Flex>

        {releaseState.isReleaseInProgress ? (
          <Flex direction="column" gap="size-300">
            <Text>
              <strong>Release Status:</strong> Beta version {releaseState.betaVersion} in progress.
              Merges will automatically increment the beta version.
            </Text>
            <Flex direction="row" alignItems="center" gap="size-200">
              <Text><strong>Available Actions:</strong></Text>
              <Button
                variant="cta"
                onPress={onCompleteRelease}
                isDisabled={!onCompleteRelease}
              >
                Complete Release (Remove Beta)
              </Button>
            </Flex>
          </Flex>
        ) : (
          <Flex direction="column" gap="size-300">
            <Text>
              <strong>Release Status:</strong> No release in progress.
              Review unreleased PRs to determine the next release type.
            </Text>
            <Flex direction="column" gap="size-200">
              <Text><strong>Available Actions - Initialize Release:</strong></Text>
              <ButtonGroup>
                <Button
                  variant="primary"
                  onPress={() => onInitializeRelease?.('major')}
                  isDisabled={!onInitializeRelease}
                >
                  Major ({releaseState.nextVersions.major}-beta.0)
                </Button>
                <Button
                  variant="primary"
                  onPress={() => onInitializeRelease?.('minor')}
                  isDisabled={!onInitializeRelease}
                >
                  Minor ({releaseState.nextVersions.minor}-beta.0)
                </Button>
                <Button
                  variant="primary"
                  onPress={() => onInitializeRelease?.('patch')}
                  isDisabled={!onInitializeRelease}
                >
                  Patch ({releaseState.nextVersions.patch}-beta.0)
                </Button>
              </ButtonGroup>
            </Flex>
          </Flex>
        )}
      </Flex>
    </View>
  );
}
