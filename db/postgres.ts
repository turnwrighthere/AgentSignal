import postgres from 'postgres';
import type { StoredReport, ReportStatus } from './reports';

function database() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required for self-hosted AgentSignal.');
  return postgres(url, { max: 5, prepare: false });
}

function row(record: Record<string, unknown>): StoredReport {
  return { ...record, isSeeded: Boolean(record.isSeeded) } as StoredReport;
}

export async function listPostgresReports() {
  const sql = database();
  try { return (await sql`SELECT id, issue_type AS "issueType", generalized_need AS "generalizedNeed", page_path AS "pagePath", observation, impact, status, created_day AS "createdDay", is_seeded AS "isSeeded" FROM reports ORDER BY created_day DESC, id DESC`).map(row); }
  finally { await sql.end(); }
}

export async function createPostgresReport(report: StoredReport) {
  const sql = database();
  try { await sql`INSERT INTO reports (id, issue_type, generalized_need, page_path, observation, impact, status, created_day, is_seeded) VALUES (${report.id}, ${report.issueType}, ${report.generalizedNeed}, ${report.pagePath}, ${report.observation}, ${report.impact}, ${report.status}, ${report.createdDay}, ${report.isSeeded})`; return report; }
  finally { await sql.end(); }
}

export async function updatePostgresReportStatus(id: string, status: ReportStatus) {
  const sql = database();
  try { await sql`UPDATE reports SET status = ${status} WHERE id = ${id}`; }
  finally { await sql.end(); }
}

export async function deletePostgresReport(id: string) {
  const sql = database();
  try { await sql`DELETE FROM reports WHERE id = ${id}`; }
  finally { await sql.end(); }
}

export type Owner = { id: string; username: string; passwordHash: string };

export async function selfHostIsConfigured() {
  const sql = database();
  try { return (await sql`SELECT id FROM owners LIMIT 1`).length > 0; }
  finally { await sql.end(); }
}

export async function findOwner(username: string): Promise<Owner | null> {
  const sql = database();
  try { return ((await sql`SELECT id, username, password_hash AS "passwordHash" FROM owners WHERE username = ${username} LIMIT 1`)[0] as Owner | undefined) ?? null; }
  finally { await sql.end(); }
}

export async function createOwner(owner: Owner) {
  const sql = database();
  try { await sql`INSERT INTO owners (id, username, password_hash) VALUES (${owner.id}, ${owner.username}, ${owner.passwordHash})`; }
  finally { await sql.end(); }
}
