import { authenticate, issueSession, selfHosted, sessionCookie } from '@/lib/selfhost-auth';
export async function POST(request: Request) {
  if (!selfHosted()) return Response.json({ error: 'Self-hosting is not enabled.' }, { status: 404 });
  let body: { username?: string; password?: string };
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid sign-in details.' }, { status: 400 }); }
  const owner = body.username && body.password ? await authenticate(body.username.trim().toLowerCase(), body.password) : null;
  if (!owner) return Response.json({ error: 'Sign-in failed.' }, { status: 401 });
  return Response.json({ ok: true }, { headers: { 'Set-Cookie': sessionCookie(await issueSession(owner)) } });
}
