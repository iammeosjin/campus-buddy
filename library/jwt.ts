import {
  create,
  getNumericDate,
  verify,
} from 'https://deno.land/x/djwt@v2.8/mod.ts';
import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';

const key = await crypto.subtle.generateKey(
  { name: 'HMAC', hash: 'SHA-256' },
  true,
  ['sign', 'verify'],
);

serve(async (req) => {
  const url = new URL(req.url);

  if (url.pathname === '/login' && req.method === 'POST') {
    const payload = await req.json();
    if (payload.username === 'admin' && payload.password === 'password') {
      const jwt = await create(
        { alg: 'HS256', typ: 'JWT' },
        { userId: '12345', iss: 'scaleforge', exp: getNumericDate(60 * 60) },
        key,
      );
      return new Response(JSON.stringify({ token: jwt }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response('Unauthorized', { status: 401 });
  }

  if (url.pathname === '/verify' && req.method === 'GET') {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('No Authorization header', { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    try {
      const payload = await verify(token, key, 'HS256');
      return new Response(JSON.stringify(payload), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response('Invalid Token', { status: 401 });
    }
  }

  return new Response('Not Found', { status: 404 });
});

console.log('Server is running on http://localhost:8000');
