/**
 * Cloudflare Pages Function — /api/chat
 *
 * This file lives at: functions/api/chat.js in your GitHub repo.
 * Cloudflare Pages automatically deploys it as a serverless function at /api/chat.
 *
 * Setup:
 * 1. Put this file in your repo at:  functions/api/chat.js
 * 2. In Cloudflare Pages → Settings → Environment Variables, add:
 *    ANTHROPIC_API_KEY = sk-ant-... (your key)
 * 3. Redeploy. Done.
 */

export async function onRequestPost({ request, env }) {
  const apiKey = env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set in Cloudflare Pages environment variables' }), {
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
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
