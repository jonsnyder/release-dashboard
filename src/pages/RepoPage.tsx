import { useNavigate } from 'react-router-dom'
import {
  View,
  Flex,
  Text,
  Button,
} from '@adobe/react-spectrum'
import useRepoData from '../lib/hooks/useRepoData'
import useOctokit from '../lib/hooks/useOctokit'
import useLocation from '../lib/hooks/useLocation'
import { UnreleasedChanges } from '../components/UnreleasedChanges'
import { ReleaseNotesPreview } from '../components/ReleaseNotesPreview'
import { RecentReleases } from '../components/RecentReleases'
import { ReleaseState } from '../components/ReleaseState'
import { BranchSelector } from '../components/BranchSelector'
import { PageTitle } from '../components/PageTitle'

export default function RepoPage() {
  const navigate = useNavigate()
  const api = useOctokit()
  const location = useLocation(api)

  console.log("repo page");
  // Don't fetch repo data until we have a valid location
  const {
    loading: repoLoading,
    error: repoError,
    branches,
    selectedBranch,
    defaultBranch,
    repoDetails,
    releaseNotesPreview,
    parsedReleaseNotes,
    changeBranch,
  } = useRepoData({
    owner: location?.type === 'branch' || location?.type === 'tag' || location?.type === 'unauthenticated' ? location.owner : null,
    repo: location?.type === 'branch' || location?.type === 'tag' || location?.type === 'unauthenticated' ? location.repo : null,
    tag: location?.type === 'tag' ? location.tag : null,
    urlBranch: location?.type === 'branch' ? location.branch : null,
  })

  if (api.type === 'unauthenticated') {
    return (
      <View padding="size-1000">
        <Flex direction="column" alignItems="center" gap="size-200">
          <Text>You are not logged in.</Text>
          <Button variant="cta" onPress={api.onLogin} marginTop="size-200">
            Sign in with GitHub
          </Button>
        </Flex>
      </View>
    )
  }

  if (!location) {
    return null
  }

  if (location.type === 'loading') {
    return (
      <View height="100vh" backgroundColor="gray-50" padding="size-1000">
        <Flex justifyContent="center" alignItems="center" height="100%">
          <Text>Loading repository information...</Text>
        </Flex>
      </View>
    )
  }

  if (location.type === 'error') {
    return (
      <View height="100vh" backgroundColor="gray-50" padding="size-1000">
        <Flex justifyContent="center" alignItems="center" height="100%">
          <Text>Error: {location.message}</Text>
        </Flex>
      </View>
    )
  }

  const handleInitializeRelease = () => {
    console.log('Initialize release')
  }

  const handleCompleteRelease = () => {
    console.log('Complete release')
  }

  const handleBranchChange = async (newBranch: string) => {
    await changeBranch(newBranch)

    // Update URL with new branch
    if (location.type === 'branch') {
      const params = new URLSearchParams({
        owner: location.owner,
        repo: location.repo,
        branch: newBranch
      })
      navigate(`/repo?${params.toString()}`)
    }
  }

  // Show repo data loading or error states
  if (repoLoading) {
    return (
      <View height="100vh" backgroundColor="gray-50" padding="size-1000">
        <Flex justifyContent="center" alignItems="center" height="100%">
          <Text>Loading repository data...</Text>
        </Flex>
      </View>
    )
  }

  if (repoError) {
    return (
      <View height="100vh" backgroundColor="gray-50" padding="size-1000">
        <Flex justifyContent="center" alignItems="center" height="100%">
          <Text>Error: {repoError}</Text>
        </Flex>
      </View>
    )
  }

  if (location.type !== 'branch' && location.type !== 'tag') {
    return null
  }

  return (
    <div className="app-container">
      <View height="100vh" backgroundColor="gray-50" overflow="auto">
        {/* Main Content */}
        <View paddingX="size-1000" paddingBottom="size-1000">
          <Flex direction="column" gap="size-500">
            {/* Title and Branch Selector Row */}
            <Flex direction="row" justifyContent="space-between" alignItems="center" marginBottom="size-300">
              <PageTitle
                owner={location.owner}
                repo={location.repo}
                branch={selectedBranch}
                defaultBranch={defaultBranch}
                tag={location.type === 'tag' ? location.tag : null}
              />
              {location.type === 'branch' && (
                <BranchSelector
                  branches={branches}
                  selectedBranch={selectedBranch}
                  onBranchChange={handleBranchChange}
                  isLoading={repoLoading}
                />
              )}
            </Flex>

            {repoDetails && (
              <Flex direction="column" gap="size-500">
                {location.type === 'branch' && (
                  <ReleaseState
                    versionInfo={repoDetails.versionInfo}
                    onInitializeRelease={handleInitializeRelease}
                    onCompleteRelease={handleCompleteRelease}
                  />
                )}

                {releaseNotesPreview && location.type === 'branch' && (
                  <ReleaseNotesPreview releaseNotes={releaseNotesPreview} />
                )}

                <UnreleasedChanges
                  unreleasedPRs={repoDetails.unreleasedPRs}
                  openPRs={repoDetails.openPRs}
                  parsedReleaseNotes={parsedReleaseNotes}
                  tag={location.type === 'tag' ? location.tag : null}
                />

                <RecentReleases releases={repoDetails.releases} owner={location.owner} repo={location.repo} />
              </Flex>
            )}
          </Flex>
        </View>
      </View>
    </div>
  )
}
