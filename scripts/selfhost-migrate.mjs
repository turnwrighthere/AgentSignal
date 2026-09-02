import { readFile } from 'node:fs/promises';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
try {
  const migration = await readFile(new URL('../selfhost/migrations/0001_initial.sql', import.meta.url), 'utf8');
  for (const statement of migration.split(';').map((value) => value.trim()).filter(Boolean)) await sql.unsafe(statement);
  console.log('Self-hosted database is ready.');
} finally { await sql.end(); }
