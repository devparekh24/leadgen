import express, { Request, Response } from 'express';
import cors from 'cors';
import db from './db';
import { scrapeLeads } from './services/scraper';
import { scoreLead } from './services/scorer';
import { generateEmail } from './services/email';
import { parse } from 'json2csv';
import * as xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({ 
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'https://leadgen-scrapping-tool.vercel.app',
    process.env.FRONTEND_URL || ''
  ].filter(Boolean)
}));
app.use(express.json());

// 1. Health check
app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'running', app: 'SaaSquatch Leads Node.js API' });
});

// 2. Scrape Leads
app.post('/api/scrape', (req: Request, res: Response) => {
  try {
    const mockResults = scrapeLeads(req.body);
    const savedLeads: any[] = [];
    
    const stmt = db.prepare(`
      INSERT INTO leads (
        company_name, industry, location, website, phone, email, owner_name, 
        employee_count, estimated_revenue, linkedin_url, source, is_enriched, pipeline_stage
      ) VALUES (
        @company_name, @industry, @location, @website, @phone, @email, @owner_name,
        @employee_count, @estimated_revenue, @linkedin_url, @source, @is_enriched, @pipeline_stage
      )
    `);

    db.transaction(() => {
      for (const data of mockResults) {
        const info = stmt.run({
          ...data,
          pipeline_stage: 'Prospect',
          is_enriched: data.is_enriched ? 1 : 0
        });
        savedLeads.push({ id: info.lastInsertRowid, ...data });
      }
    })();
    
    res.json(savedLeads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to scrape leads' });
  }
});

// 3. Get Leads
app.get('/api/leads', (req: Request, res: Response) => {
  try {
    const { industry, min_score } = req.query;
    
    let query = 'SELECT * FROM leads';
    const conditions = [];
    const params: any = {};
    
    if (industry) {
      conditions.push('industry = @industry');
      params.industry = industry;
    }
    if (min_score) {
      conditions.push('score >= @min_score');
      params.min_score = Number(min_score);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY id DESC';
    
    const leads = db.prepare(query).all(params) as any[];
    
    // Format boolean
    leads.forEach(l => l.is_enriched = !!l.is_enriched);
    
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// 4. Score Leads
app.post('/api/score', (req: Request, res: Response) => {
  try {
    const { lead_ids } = req.body;
    if (!lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
      return res.status(400).json({ error: 'Invalid lead_ids' });
    }

    const placeholders = lead_ids.map(() => '?').join(',');
    const leads = db.prepare(`SELECT * FROM leads WHERE id IN (${placeholders})`).all(lead_ids) as any[];

    if (leads.length === 0) {
      return res.status(404).json({ error: 'No leads found' });
    }

    const results: any[] = [];
    const updateStmt = db.prepare(`
      UPDATE leads 
      SET score = @score, score_tier = @score_tier, score_rationale = @score_rationale 
      WHERE id = @id
    `);

    db.transaction(() => {
      for (const lead of leads) {
        // format boolean for JS logic
        lead.is_enriched = !!lead.is_enriched;
        const scoreData = scoreLead(lead);
        updateStmt.run({ ...scoreData, id: lead.id });
        results.push({ id: lead.id, score: scoreData.score, tier: scoreData.score_tier });
      }
    })();

    res.json({ status: 'success', scored: results.length, results });
  } catch (error) {
    res.status(500).json({ error: 'Failed to score leads' });
  }
});

// 5. Generate Email
app.post('/api/email/generate', (req: Request, res: Response) => {
  try {
    const { lead_id, tone, template_type } = req.body;
    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(lead_id) as any;

    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const emailBody = generateEmail(lead, tone, template_type);
    res.json({ lead_id: lead.id, email_body: emailBody });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate email' });
  }
});

// 6. Export Leads
app.get('/api/export', (req: Request, res: Response) => {
  try {
    const format = String(req.query.format || 'csv');
    const leadIdsStr = req.query.lead_ids as string;
    
    let leads = [];
    if (leadIdsStr) {
      const ids = leadIdsStr.split(',').map(id => Number(id.trim()));
      const placeholders = ids.map(() => '?').join(',');
      leads = db.prepare(`SELECT * FROM leads WHERE id IN (${placeholders})`).all(ids);
    } else {
      leads = db.prepare('SELECT * FROM leads').all();
    }
    
    if (leads.length === 0) return res.status(404).json({ error: 'No leads found to export' });

    const exportDir = path.join(__dirname, '../../prisma/data/exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    if (format === 'csv') {
      const csv = parse(leads);
      const filePath = path.join(exportDir, 'leads.csv');
      fs.writeFileSync(filePath, csv);
      res.download(filePath, 'leads.csv');
    } else {
      const worksheet = xlsx.utils.json_to_sheet(leads);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Leads');
      const filePath = path.join(exportDir, 'leads.xlsx');
      xlsx.writeFile(workbook, filePath);
      res.download(filePath, 'leads.xlsx');
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to export' });
  }
});

// 7. Analytics
app.get('/api/analytics', (req: Request, res: Response) => {
  try {
    const leads = db.prepare('SELECT * FROM leads').all() as any[];
    
    const tiers: Record<string, number> = { 'Hot': 0, 'Warm': 0, 'Cold': 0, 'Unscored': 0 };
    const industries: Record<string, number> = {};
    let totalRevenue = 0;
    let totalScore = 0;
    let scoredCount = 0;

    for (const lead of leads) {
      const tier = lead.score_tier || 'Unscored';
      tiers[tier] = (tiers[tier] || 0) + 1;

      const ind = lead.industry || 'Unknown';
      industries[ind] = (industries[ind] || 0) + 1;

      totalRevenue += lead.estimated_revenue || 0;

      if (lead.score !== null) {
        totalScore += lead.score;
        scoredCount++;
      }
    }

    const avgScore = scoredCount > 0 ? Math.round((totalScore / scoredCount) * 10) / 10 : 0;

    res.json({
      total_leads: leads.length,
      avg_score: avgScore,
      total_revenue: totalRevenue,
      score_distribution: tiers,
      industry_breakdown: industries
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// 8. Delete Lead
app.delete('/api/leads/:id', (req: Request, res: Response) => {
  try {
    db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
    res.json({ status: 'success', message: `Lead ${req.params.id} deleted` });
  } catch (error) {
    res.status(404).json({ error: 'Lead not found' });
  }
});

// 9. Update Pipeline Stage
app.put('/api/leads/:id/stage', (req: Request, res: Response) => {
  try {
    const { stage } = req.body;
    db.prepare('UPDATE leads SET pipeline_stage = ? WHERE id = ?').run(stage, req.params.id);
    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
    res.json(lead);
  } catch (error) {
    res.status(404).json({ error: 'Lead not found' });
  }
});

// 10. Get Pipeline
app.get('/api/pipeline', (req: Request, res: Response) => {
  try {
    const leads = db.prepare('SELECT * FROM leads').all() as any[];
    const pipeline: Record<string, any[]> = {
      'Prospect': [],
      'Contacted': [],
      'Meeting Set': [],
      'Closed Won': [],
      'Closed Lost': []
    };

    for (const lead of leads) {
      const stage = lead.pipeline_stage || 'Prospect';
      lead.is_enriched = !!lead.is_enriched;
      if (pipeline[stage]) {
        pipeline[stage].push(lead);
      } else {
        pipeline['Prospect'].push(lead);
      }
    }
    res.json(pipeline);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pipeline' });
  }
});

// 11. Get Campaigns
app.get('/api/campaigns', (req: Request, res: Response) => {
  res.json([
    {
      id: "camp_1", name: "Q3 Target Accounts Outreach", status: "Active",
      sent: 1450, opened: 680, replied: 125, bounced: 30, conversion_rate: 8.6
    },
    {
      id: "camp_2", name: "SaaS Founders Introduction", status: "Completed",
      sent: 850, opened: 420, replied: 95, bounced: 15, conversion_rate: 11.2
    },
    {
      id: "camp_3", name: "Enterprise Follow-up", status: "Draft",
      sent: 0, opened: 0, replied: 0, bounced: 0, conversion_rate: 0.0
    }
  ]);
});

// 12. Get Integrations
app.get('/api/integrations', (req: Request, res: Response) => {
  res.json([
    {
      id: 'int_1', name: 'HubSpot CRM', category: 'CRM', status: 'connected',
      description: 'Sync leads directly to HubSpot pipelines and contacts.',
      icon: '🟠', last_sync: new Date(Date.now() - 3600000).toISOString(), sync_count: 1240
    },
    {
      id: 'int_2', name: 'Salesforce', category: 'CRM', status: 'disconnected',
      description: 'Push qualified leads to Salesforce opportunities.',
      icon: '🔵', last_sync: null, sync_count: 0
    },
    {
      id: 'int_3', name: 'Slack', category: 'Notifications', status: 'connected',
      description: 'Receive real-time lead alerts in your Slack channel.',
      icon: '💬', last_sync: new Date(Date.now() - 900000).toISOString(), sync_count: 587
    },
    {
      id: 'int_4', name: 'Apollo.io', category: 'Enrichment', status: 'connected',
      description: 'Enrich leads with verified emails, phone numbers, and firmographics.',
      icon: '🚀', last_sync: new Date(Date.now() - 7200000).toISOString(), sync_count: 3100
    },
    {
      id: 'int_5', name: 'Zapier', category: 'Automation', status: 'disconnected',
      description: 'Automate workflows between SaaSquatch and 5000+ apps.',
      icon: '⚡', last_sync: null, sync_count: 0
    },
    {
      id: 'int_6', name: 'LinkedIn Sales Navigator', category: 'Enrichment', status: 'connected',
      description: 'Pull company and contact data from LinkedIn.',
      icon: '🔗', last_sync: new Date(Date.now() - 1800000).toISOString(), sync_count: 920
    },
    {
      id: 'int_7', name: 'Mailchimp', category: 'Email', status: 'disconnected',
      description: 'Send email sequences to leads via Mailchimp.',
      icon: '📧', last_sync: null, sync_count: 0
    },
    {
      id: 'int_8', name: 'Google Sheets', category: 'Export', status: 'connected',
      description: 'Export leads automatically to Google Sheets.',
      icon: '📊', last_sync: new Date(Date.now() - 10800000).toISOString(), sync_count: 210
    }
  ]);
});

// 13. Toggle Integration
app.put('/api/integrations/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  // In a real app this would update a DB. For now, return success.
  res.json({ id, status, message: `Integration ${id} status updated to ${status}` });
});

// 14. Get Settings
app.get('/api/settings', (req: Request, res: Response) => {
  res.json({
    profile: {
      name: 'Sainath Reddy',
      email: 'sainath@saasquatch.io',
      role: 'Admin',
      company: 'SaaSquatch Leads',
      avatar_initials: 'SA'
    },
    notifications: {
      email_alerts: true,
      slack_alerts: true,
      new_lead_alert: true,
      score_threshold_alert: 75,
      weekly_report: true
    },
    scoring: {
      min_employee_count: 5,
      min_revenue: 100000,
      preferred_industries: ['IT Services', 'HVAC', 'Marketing', 'Accounting'],
      weight_revenue: 0.4,
      weight_employees: 0.3,
      weight_enrichment: 0.3
    },
    scraping: {
      default_lead_count: 15,
      auto_score_on_scrape: true,
      auto_enrich: false,
      deduplicate: true
    }
  });
});

// 15. Update Settings
app.put('/api/settings', (req: Request, res: Response) => {
  // In a real app, persist to DB. For now return the submitted settings.
  res.json({ status: 'success', settings: req.body });
});

// 16. Get single lead
app.get('/api/leads/:id', (req: Request, res: Response) => {
  try {
    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id) as any;
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    lead.is_enriched = !!lead.is_enriched;
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Node.js Backend is running at http://localhost:${port}`);
});
