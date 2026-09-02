const windowMs = 60 * 60 * 1000;
const limit = 30;
const visits = new Map<string, { count: number; startedAt: number }>();

/** A small per-process guard for public report submission. Deploy a proxy-level
 * rate limit as well when running more than one app container. */
export function acceptPublicReport(request: Request) {
  const key = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const now = Date.now(); const current = visits.get(key);
  if (!current || now - current.startedAt >= windowMs) { visits.set(key, { count: 1, startedAt: now }); return true; }
  if (current.count >= limit) return false;
  current.count += 1; return true;
}
