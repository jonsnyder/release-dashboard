export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(`Method ${req.method} Not Allowed`, {
      status: 405,
      headers: {
        'Allow': 'POST',
      },
    });
  }

  const { code, state, client_id } = await req.json();

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        state,
      }),
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return new Response(JSON.stringify({ error: 'Failed to exchange code for token' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
