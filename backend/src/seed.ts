import db from './db';
import { generateMockLeads } from './services/scraper';
import { scoreLead } from './services/scorer';

function main() {
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM leads');
  const result = countStmt.get() as any;
  if (result.count > 0) {
    console.log('Database already seeded!');
    return;
  }

  console.log('Seeding database with 25 sample leads...');
  const seedLeads = generateMockLeads(undefined, undefined, 25);
  
  const stages = ["Prospect", "Contacted", "Meeting Set", "Closed Won", "Closed Lost"];

  const insertStmt = db.prepare(`
    INSERT INTO leads (
      company_name, industry, location, website, phone, email, owner_name, 
      employee_count, estimated_revenue, linkedin_url, source, is_enriched, 
      pipeline_stage, score, score_tier, score_rationale
    ) VALUES (
      @company_name, @industry, @location, @website, @phone, @email, @owner_name,
      @employee_count, @estimated_revenue, @linkedin_url, @source, @is_enriched, 
      @pipeline_stage, @score, @score_tier, @score_rationale
    )
  `);

  db.transaction(() => {
    for (const data of seedLeads) {
      const leadData: any = { ...data };
      leadData.pipeline_stage = stages[Math.floor(Math.random() * stages.length)];
      
      // Auto-score
      const scoreData = scoreLead(leadData);
      Object.assign(leadData, scoreData);

      leadData.is_enriched = leadData.is_enriched ? 1 : 0;

      insertStmt.run(leadData);
    }
  })();

  console.log('Seeded 25 leads with scores!');
}

main();
