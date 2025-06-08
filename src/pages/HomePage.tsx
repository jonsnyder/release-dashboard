import useOctokit from '../lib/hooks/useOctokit'
import useLocation from '../lib/hooks/useLocation'
import useUserData from '../lib/hooks/useUserData'
import Header from '../components/Header'

export default function HomePage() {
  const api = useOctokit()
  const user = useUserData(api)
  const location = useLocation(api)
  console.log("home page");

  return <Header location={location} user={user} api={api} />
}
