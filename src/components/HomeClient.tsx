'use client';

import useOctokit from '../lib/hooks/useOctokit';
import useLocation from '../lib/hooks/useLocation';
import useUserData from '../lib/hooks/useUserData';
import Header from './Header';

export default function HomeClient() {
  const api = useOctokit();
  const user = useUserData(api);
  const location = useLocation(api);

  return (
    <Header location={location} user={user} api={api} />
  );
}
