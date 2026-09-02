import { createFirstOwner, selfHosted } from '@/lib/selfhost-auth';
export async function POST(request: Request) {
  if (!selfHosted()) return Response.json({ error: 'Self-hosting is not enabled.' }, { status: 404 });
  let body: { username?: string; password?: string; setupToken?: string };
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid setup details.' }, { status: 400 }); }
  if (!body.username?.trim() || !body.password || body.password.length < 12 || body.setupToken !== process.env.SETUP_TOKEN) return Response.json({ error: 'Use a username, a password of at least 12 characters, and the deployment setup token.' }, { status: 400 });
  try { await createFirstOwner(body.username.trim().toLowerCase(), body.password); return Response.json({ ok: true }, { status: 201 }); }
  catch { return Response.json({ error: 'Setup has already been completed.' }, { status: 409 }); }
}
