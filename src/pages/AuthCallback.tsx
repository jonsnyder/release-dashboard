import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { View, Flex, Text, ProgressCircle } from '@adobe/react-spectrum'
import { setStoredToken } from '../lib/auth'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)


  console.log("auth callback");

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const state = searchParams.get('state')

    if (error) {
      console.error('OAuth error:', error)
      setError(`Authentication failed: ${error}`)
      setTimeout(() => {
        navigate('/', { replace: true })
      }, 3000)
      return
    }

    if (!code) {
      setError('No authorization code received')
      setTimeout(() => {
        navigate('/', { replace: true })
      }, 3000)
      return
    }

    // Exchange code for token using Vercel API
    exchangeCodeForToken(code)
      .then(token => {
        setStoredToken(token)

        // Redirect back to where user was, or home
        const returnUrl = state ? decodeURIComponent(state) : '/'
        navigate(returnUrl, { replace: true })
      })
      .catch(err => {
        console.error('Token exchange failed:', err)
        setError(`Authentication failed: ${err.message}`)
        setTimeout(() => {
          navigate('/', { replace: true })
        }, 3000)
      })
  }, [searchParams, navigate])

  if (error) {
    return (
      <View height="100vh" padding="size-1000">
        <Flex direction="column" alignItems="center" justifyContent="center" height="100%" gap="size-200">
          <Text>{error}</Text>
          <Text slot="description">Redirecting to home page...</Text>
        </Flex>
      </View>
    )
  }

  return (
    <View height="100vh" padding="size-1000">
      <Flex direction="column" alignItems="center" justifyContent="center" height="100%" gap="size-200">
        <ProgressCircle aria-label="Authenticating..." isIndeterminate />
        <Text>Completing authentication...</Text>
      </Flex>
    </View>
  )
}

async function exchangeCodeForToken(code: string): Promise<string> {
  const authProxyUrl = import.meta.env.VITE_AUTH_PROXY_URL

  if (!authProxyUrl) {
    throw new Error('Auth proxy URL not configured')
  }

  const response = await fetch(authProxyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Token exchange failed: ${response.status} ${errorText}`)
  }

  const data = await response.json()

  if (data.error) {
    throw new Error(data.error_description || data.error)
  }

  if (!data.access_token) {
    throw new Error('No access token received from auth proxy')
  }

  return data.access_token
}
