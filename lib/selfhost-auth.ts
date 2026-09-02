import { createOwner, findOwner, selfHostIsConfigured, type Owner } from '@/db/postgres';

const encoder = new TextEncoder();
const encode = (value: Uint8Array | string) => Buffer.from(value).toString('base64url');
const decode = (value: string) => Buffer.from(value, 'base64url');
const secret = () => process.env.SESSION_SECRET || '';

async function sign(value: string) {
  if (!secret()) throw new Error('SESSION_SECRET is required for self-hosted AgentSignal.');
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return encode(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))));
}

async function passwordHash(password: string) {
  const { scryptSync, randomBytes } = await import('node:crypto');
  const salt = randomBytes(16).toString('hex');
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}

async function passwordMatches(password: string, saved: string) {
  const [kind, salt, expected] = saved.split(':');
  if (kind !== 'scrypt' || !salt || !expected) return false;
  const { scryptSync, timingSafeEqual } = await import('node:crypto');
  const actual = scryptSync(password, salt, 64).toString('hex');
  return timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
}

export const selfHosted = () => process.env.AGENTSIGNAL_STORAGE === 'postgres';
export const isConfigured = selfHostIsConfigured;

export async function createFirstOwner(username: string, password: string) {
  if (await selfHostIsConfigured()) throw new Error('Setup has already been completed.');
  await createOwner({ id: crypto.randomUUID(), username, passwordHash: await passwordHash(password) });
}

export async function authenticate(username: string, password: string): Promise<Owner | null> {
  const owner = await findOwner(username);
  return owner && await passwordMatches(password, owner.passwordHash) ? owner : null;
}

export async function issueSession(owner: Owner) {
  const payload = encode(JSON.stringify({ id: owner.id, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 }));
  return `${payload}.${await sign(payload)}`;
}

export async function requireOwner(request: Request) {
  const cookie = request.headers.get('cookie')?.match(/(?:^|;\s*)agentsignal_session=([^;]+)/)?.[1];
  if (!cookie) return null;
  const [payload, signature] = cookie.split('.');
  if (!payload || !signature || signature !== await sign(payload)) return null;
  try { const session = JSON.parse(decode(payload).toString()) as { id: string; exp: number }; return session.exp > Date.now() ? session.id : null; }
  catch { return null; }
}

export function isSameOwnerOrigin(request: Request) {
  if (!selfHosted()) return true;
  const origin = request.headers.get('origin');
  return !origin || origin === process.env.APP_ORIGIN;
}

export const sessionCookie = (value: string) => `agentsignal_session=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
export const clearSessionCookie = () => 'agentsignal_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0';
