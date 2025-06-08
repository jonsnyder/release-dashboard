'use client';

import { Flex, Text, Avatar, Button, View } from '@adobe/react-spectrum';
import { User, API } from '../lib/types';

interface UserInfoProps {
  user: User;
  api: API;
}

export function UserInfo({ user, api }: UserInfoProps) {

  if (api.type === 'unauthenticated') {
    return (
      <View>
        <Button variant="cta" onPress={api.onLogin} marginTop="size-200">
          Sign in with GitHub
        </Button>
      </View>
    );
  }
  if (api.type === 'authenticated' && user.type === 'authenticated') {
    return (
      <Flex direction="row" alignItems="center" gap="size-100">
        <Avatar src={user.avatarUrl} alt={user.login} size="avatar-size-300" />
        <Text>{user.name}</Text>
        <Button variant="secondary" onPress={api.onLogout}>
          Logout
        </Button>
      </Flex>
    );
  }

  return null;
}
