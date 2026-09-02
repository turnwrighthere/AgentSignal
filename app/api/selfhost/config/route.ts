import { isConfigured, selfHosted } from '@/lib/selfhost-auth';
export async function GET() {
  if (!selfHosted()) return Response.json({ enabled: false });
  return Response.json({ enabled: true, configured: await isConfigured(), siteOrigin: process.env.SITE_ORIGIN ?? '', siteId: process.env.SITE_ID ?? 'site' });
}
