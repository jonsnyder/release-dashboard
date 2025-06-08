'use client';

import { Flex, Picker, Item, Text } from '@adobe/react-spectrum';
import { GitHubBranch } from '../lib/types';

interface BranchSelectorProps {
  branches: GitHubBranch[];
  selectedBranch: string;
  onBranchChange: (branch: string) => void;
  isLoading: boolean;
}

export function BranchSelector({
  branches,
  selectedBranch,
  onBranchChange,
  isLoading,
}: BranchSelectorProps) {
  return (
    <Flex direction="row" gap="size-100" alignItems="center">
      <Text>Viewing branch:</Text>
      <Picker
        selectedKey={selectedBranch}
        onSelectionChange={key => onBranchChange(key?.toString() || selectedBranch)}
        isDisabled={isLoading}
        width="size-3000"
      >
        {branches.map(branch => (
          <Item key={branch.name}>{branch.name}</Item>
        ))}
      </Picker>
    </Flex>
  );
}
