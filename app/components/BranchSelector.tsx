import { Form, Picker, Item } from '@adobe/react-spectrum';
import { GitHubBranch } from '../../lib/types';

interface BranchSelectorProps {
  selectedBranch: string;
  branches: GitHubBranch[];
  onBranchChange: (branch: string) => void;
}

export function BranchSelector({ selectedBranch, branches, onBranchChange }: BranchSelectorProps) {
  return (
    <Picker
      label="Branch"
      items={branches}
      selectedKey={selectedBranch}
      onSelectionChange={(key) => onBranchChange(key as string)}
      width="size-2400"
      isQuiet
    >
      {(item: GitHubBranch) => (
        <Item key={item.name}>{item.name}</Item>
      )}
    </Picker>
  );
}
