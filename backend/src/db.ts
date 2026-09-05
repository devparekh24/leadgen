import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(__dirname, '../../prisma/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'leads.db'));

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    location TEXT NOT NULL,
    website TEXT,
    phone TEXT,
    email TEXT,
    owner_name TEXT,
    employee_count INTEGER,
    estimated_revenue REAL,
    linkedin_url TEXT,
    score REAL,
    score_tier TEXT,
    score_rationale TEXT,
    scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    source TEXT,
    is_enriched BOOLEAN DEFAULT 0,
    pipeline_stage TEXT DEFAULT 'Prospect'
  );
  
  CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company_name);
  CREATE INDEX IF NOT EXISTS idx_leads_industry ON leads(industry);
`);

export default db;
