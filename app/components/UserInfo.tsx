import { Flex, Text, Avatar, Button } from '@adobe/react-spectrum';

interface UserInfoProps {
  user: {
    login: string;
    name?: string;
    avatar_url: string;
  };
  onLogout: () => void;
}

export function UserInfo({ user, onLogout }: UserInfoProps) {
  return (
    <Flex direction="row" alignItems="center" gap="size-100">
      <Avatar src={user.avatar_url} alt={user.login} size="avatar-size-300" />
      <Text>{user.name || user.login}</Text>
      <Button variant="secondary" onPress={onLogout}>
        Logout
      </Button>
    </Flex>
  );
}
