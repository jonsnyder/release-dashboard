'use client';

import { Breadcrumbs, Item, Text } from '@adobe/react-spectrum';
import PageGear from '@spectrum-icons/workflow/PageGear';
import { Location } from '../lib/types';

interface PageBreadcrumbsProps {
  location: Location
}

export function PageBreadcrumbs({ location }: PageBreadcrumbsProps) {

  const items = [
    <Item key="home" href="/">
      <PageGear />
    </Item>
  ];

  if (location.type === "unauthenticated" || location.type === "tag" || location.type === "branch") {
    items.push(
      <Item key="owner" href={`/?owner=${location.owner}`}>
        <Text>{location.owner}</Text>
      </Item>
    );
    items.push(
      <Item key="repo" href={`/repo?owner=${location.owner}&repo=${location.repo}`}>
        <Text>{location.repo}</Text>
      </Item>
    );
  }

  if (location.type === "tag") {
    items.push(
      <Item key="tag">
        <Text>{location.tag}</Text>
      </Item>
    );
  }
  if (location.type === "branch" && !location.isDefault) {
    items.push(
      <Item key="branch">
        <Text>{location.branch}</Text>
      </Item>
    );
  }
  if (location.type === "unauthenticated") {
    items.push(
      <Item key="branchOrTag">
        <Text>{location.branchOrTag}</Text>
      </Item>
    );
  }

  return (
    <Breadcrumbs>
      {items}
    </Breadcrumbs>
  );
}
