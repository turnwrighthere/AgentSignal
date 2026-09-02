import { desc, eq } from 'drizzle-orm';
import { isSelfHosted } from '@/db';
import { getD1Db } from '@/db/d1';
import { reports } from '@/db/schema';
import type { SiteIssueReport } from '@/lib/report-contract';

export type ReportStatus = 'new' | 'reviewing' | 'resolved';
export type StoredReport = SiteIssueReport & { id: string; status: ReportStatus; createdDay: string; isSeeded: boolean };

async function postgres() { return import('./postgres'); }

export async function listReports(): Promise<StoredReport[]> {
  if (isSelfHosted()) return (await postgres()).listPostgresReports();
  return getD1Db().select().from(reports).orderBy(desc(reports.createdDay));
}

export async function createReport(report: SiteIssueReport): Promise<StoredReport> {
  const value: StoredReport = { id: crypto.randomUUID(), ...report, status: 'new', createdDay: new Date().toISOString().slice(0, 10), isSeeded: false };
  if (isSelfHosted()) return (await postgres()).createPostgresReport(value);
  await getD1Db().insert(reports).values(value);
  return value;
}

export async function updateReportStatus(id: string, status: ReportStatus) {
  if (isSelfHosted()) return (await postgres()).updatePostgresReportStatus(id, status);
  await getD1Db().update(reports).set({ status }).where(eq(reports.id, id));
}

export async function deleteReport(id: string) {
  if (isSelfHosted()) return (await postgres()).deletePostgresReport(id);
  await getD1Db().delete(reports).where(eq(reports.id, id));
}
