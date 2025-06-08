'use client';

import { View, Heading, Divider, Text, Flex } from '@adobe/react-spectrum';
import { VersionInfo as VersionInfoType } from '../lib/types';

interface VersionInfoProps {
  versionInfo: VersionInfoType;
}

export function VersionInfo({ versionInfo }: VersionInfoProps) {
  return (
    <View>
      <Heading level={2}>Version Information</Heading>
      <Divider />
      <Flex direction="row" gap="size-300" wrap>
        <View padding="size-200" borderWidth="thin" borderColor="dark" borderRadius="medium">
          <Text><strong>Current Version:</strong> {versionInfo.current}</Text>
        </View>
        {versionInfo.previousStable && (
          <View padding="size-200" borderWidth="thin" borderColor="dark" borderRadius="medium">
            <Text><strong>Previous Stable:</strong> {versionInfo.previousStable}</Text>
          </View>
        )}
      </Flex>
    </View>
  );
}
