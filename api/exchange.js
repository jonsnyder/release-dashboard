const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
};

export default async function handler(req, res) {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, {
      ...corsHeaders,
      'Allow': 'POST, OPTIONS'
    });
    res.end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { code, state, client_id } = req.body;

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
    res.writeHead(200, {
      'Content-Type': 'application/json',
      ...corsHeaders
    });
    res.end(JSON.stringify(data));
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    res.writeHead(500, {
      'Content-Type': 'application/json',
      ...corsHeaders
    });
    res.end(JSON.stringify({ error: 'Failed to exchange code for token' }));
  }
}
