'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { View, Text } from '@adobe/react-spectrum';
import { setStoredToken } from '../../../lib/auth';

function checkEnvironmentVariables() {
  const missingVars = [];
  if (!process.env.NEXT_PUBLIC_AUTH_PROXY_URL) {
    missingVars.push('NEXT_PUBLIC_AUTH_PROXY_URL');
  }
  if (!process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID) {
    missingVars.push('NEXT_PUBLIC_GITHUB_CLIENT_ID');
  }
  return missingVars;
}

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function exchangeCodeForToken() {
      const missingVars = checkEnvironmentVariables();
      if (missingVars.length > 0) {
        setError(`Missing required environment variables: ${missingVars.join(', ')}. Please check your .env.local file.`);
        return;
      }

      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (code) {
        try {
          // Exchange code for token using a proxy server
          const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_PROXY_URL}/exchange`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code,
              state,
              client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to exchange code for token');
          }

          const data = await response.json();
          setStoredToken(data.access_token);
          router.push('/');
        } catch (err) {
          console.error('Error exchanging code for token:', err);
          setError('Failed to authenticate with GitHub. Please try again.');
        }
      }
    }

    exchangeCodeForToken();
  }, [searchParams, router]);

  if (error) {
    return (
      <View padding="size-1000">
        <Text>{error}</Text>
        <Text marginTop="size-200">
          <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>Return to home</a>
        </Text>
      </View>
    );
  }

  return (
    <View padding="size-1000">
      <Text>Authenticating with GitHub...</Text>
    </View>
  );
}
