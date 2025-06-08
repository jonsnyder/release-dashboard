'use client';

import { PageBreadcrumbs } from "./PageBreadcrumbs";
import { UserInfo } from "./UserInfo";
import { View, Flex } from "@adobe/react-spectrum";
import { Location, User, API } from '../lib/types';

interface HeaderProps {
  location: Location;
  user: User;
  api: API;
};

export default function Header({ location, user, api }: HeaderProps) {
  return (
    <View paddingX="size-1000" paddingTop="size-200" paddingBottom="size-200">
      <Flex direction="row" justifyContent="space-between" alignItems="center" width="100%">
        {/* Navigation Breadcrumbs */}
        <View flex={1} minWidth={0}>
          <PageBreadcrumbs location={location} />
        </View>

        {/* User Info with Logout */}
        <View flexShrink={0} marginX="size-200">
          <UserInfo user={user} api={api} />
        </View>
      </Flex>
    </View>
  );
}
