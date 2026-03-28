// functions/speech-token.js
// Cloudflare Pages Function — Azure Speech token proxy
// Env vars required (set in CF Pages dashboard):
//   AZURE_SPEECH_KEY    — Key 1 from Azure Speech resource
//   AZURE_SPEECH_REGION — e.g. northeurope

export async function onRequest(context) {
  const { env, request } = context;

  const origin = request.headers.get('Origin') || '';
  const allowed = [
    'https://ga-say.sionnach.ie',
    'https://gaeltacht.sionnach.ie',
    'https://foghlaim.sionnach.ie',
    'https://foxxelabs.ie',
    'https://www.foxxelabs.ie',
    'http://localhost:8788',
    'http://127.0.0.1:8788',
  ];
  const corsOrigin = allowed.includes(origin) ? origin : allowed[0];

  const headers = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  const key    = env.AZURE_SPEECH_KEY;
  const region = env.AZURE_SPEECH_REGION;

  if (!key || !region) {
    return new Response(
      JSON.stringify({ error: 'Speech service not configured' }),
      { status: 503, headers: { ...headers, 'Content-Type': 'application/json' } }
    );
  }

  const tokenUrl = `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;

  try {
    const resp = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Length': '0',
      },
    });

    if (!resp.ok) {
      const msg = await resp.text();
      return new Response(
        JSON.stringify({ error: 'Azure token request failed', detail: msg }),
        { status: resp.status, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    const token = await resp.text();

    return new Response(
      JSON.stringify({ token, region }),
      { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Token fetch error', detail: err.message }),
      { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
    );
  }
}
