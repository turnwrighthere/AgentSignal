CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  issue_type TEXT NOT NULL,
  generalized_need TEXT NOT NULL,
  page_path TEXT NOT NULL,
  observation TEXT NOT NULL,
  impact TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_day TEXT NOT NULL,
  is_seeded BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_day ON reports(created_day);
CREATE TABLE IF NOT EXISTS owners (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);
