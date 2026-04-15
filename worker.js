/**
 * RenikGPT — Cloudflare Worker
 * Proxies requests to the Anthropic API so the API key stays server-side.
 *
 * DEPLOY STEPS:
 * 1. Go to Cloudflare Dashboard → Workers & Pages → Create Worker
 * 2. Paste this entire file into the editor and click Deploy
 * 3. Go to Settings → Variables → Add Variable:
 *    Name:  ANTHROPIC_API_KEY
 *    Value: sk-ant-... (your key from console.anthropic.com)
 *    ✓ Encrypt
 * 4. Go to your Cloudflare Pages project → Settings → Functions
 *    Under "KV namespace bindings" or just use a route:
 *    Route: renikgpt.pages.dev/api/* → this Worker
 *
 * EASIER ALTERNATIVE (recommended):
 * Instead of a separate Worker, put this file at:
 *   /functions/api/chat.js
 * in your GitHub repo. Cloudflare Pages will auto-deploy it as a
 * serverless function at /api/chat — no extra Worker setup needed.
 * Set ANTHROPIC_API_KEY in Pages → Settings → Environment Variables.
 */

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const apiKey = env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const body = await request.json();

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};
