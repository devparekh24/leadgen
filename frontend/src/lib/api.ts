/* ====================================
   API Client — Connects frontend to FastAPI backend
   ==================================== */

const API_BASE = 'http://localhost:8000';

/* ---------- Types ---------- */

export interface Lead {
  id: number;
  company_name: string;
  industry: string;
  location: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  owner_name: string | null;
  employee_count: number | null;
  estimated_revenue: number | null;
  linkedin_url: string | null;
  score: number | null;
  score_tier: string | null;
  score_rationale: string | null;
  scraped_at: string;
  source: string | null;
  is_enriched: boolean;
  pipeline_stage?: string;
}

export interface SearchFilters {
  industry?: string;
  location?: string;
  keyword?: string;
  min_employees?: number;
  max_employees?: number;
  min_revenue?: number;
  max_revenue?: number;
}

export interface ScoreResult {
  id: number;
  score: number;
  tier: string;
}

export interface AnalyticsData {
  total_leads: number;
  score_distribution: Record<string, number>;
  industry_breakdown: Record<string, number>;
}

export interface EmailGenerateRequest {
  lead_id: number;
  tone?: string;
  template_type?: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: string;
  sent: number;
  opened: number;
  replied: number;
  bounced: number;
  conversion_rate: number;
}

/* ---------- API Functions ---------- */

/** Search / scrape leads from the backend */
export async function searchLeads(filters: SearchFilters): Promise<Lead[]> {
  const body: Record<string, unknown> = {};
  if (filters.industry) body.industry = filters.industry;
  if (filters.location) body.location = filters.location;
  if (filters.keyword) body.keyword = filters.keyword;
  if (filters.min_employees) body.min_employees = Number(filters.min_employees);
  if (filters.max_employees) body.max_employees = Number(filters.max_employees);
  if (filters.min_revenue) body.min_revenue = Number(filters.min_revenue);
  if (filters.max_revenue) body.max_revenue = Number(filters.max_revenue);

  const res = await fetch(`${API_BASE}/api/scrape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Scrape failed: ${res.statusText}`);
  return res.json();
}

/** Get all saved leads (with optional filters) */
export async function getLeads(industry?: string, minScore?: number): Promise<Lead[]> {
  const params = new URLSearchParams();
  if (industry) params.set('industry', industry);
  if (minScore !== undefined) params.set('min_score', String(minScore));
  const qs = params.toString();

  const res = await fetch(`${API_BASE}/api/leads${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error(`Get leads failed: ${res.statusText}`);
  return res.json();
}

/** Score a batch of leads by their IDs */
export async function scoreLeads(leadIds: number[]): Promise<{ status: string; scored: number; results: ScoreResult[] }> {
  const res = await fetch(`${API_BASE}/api/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lead_ids: leadIds }),
  });
  if (!res.ok) throw new Error(`Score failed: ${res.statusText}`);
  return res.json();
}

/** Generate an outreach email for a lead */
export async function generateEmail(
  leadId: number,
  tone: string = 'professional',
  templateType: string = 'initial_outreach'
): Promise<string> {
  const res = await fetch(`${API_BASE}/api/email/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lead_id: leadId, tone, template_type: templateType }),
  });
  if (!res.ok) throw new Error(`Email generation failed: ${res.statusText}`);
  const data = await res.json();
  return data.email_body;
}

/** Export leads as CSV or Excel */
export async function exportLeads(format: 'csv' | 'xlsx', leadIds?: number[]): Promise<void> {
  const params = new URLSearchParams({ format });
  if (leadIds && leadIds.length > 0) {
    params.set('lead_ids', leadIds.join(','));
  }
  const res = await fetch(`${API_BASE}/api/export?${params.toString()}`);
  if (!res.ok) throw new Error(`Export failed: ${res.statusText}`);

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/** Get dashboard analytics */
export async function getAnalytics(): Promise<AnalyticsData> {
  const res = await fetch(`${API_BASE}/api/analytics`);
  if (!res.ok) throw new Error(`Analytics failed: ${res.statusText}`);
  return res.json();
}

/** Delete a lead by ID */
export async function deleteLead(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/leads/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Delete failed: ${res.statusText}`);
}

/** Get leads grouped by pipeline stage */
export async function getPipeline(): Promise<Record<string, Lead[]>> {
  const res = await fetch(`${API_BASE}/api/pipeline`);
  if (!res.ok) throw new Error(`Pipeline failed: ${res.statusText}`);
  return res.json();
}

/** Update a lead's pipeline stage */
export async function updateLeadStage(id: number, stage: string): Promise<Lead> {
  const res = await fetch(`${API_BASE}/api/leads/${id}/stage`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage }),
  });
  if (!res.ok) throw new Error(`Update stage failed: ${res.statusText}`);
  return res.json();
}

/** Get dummy email campaigns */
export async function getCampaigns(): Promise<Campaign[]> {
  const res = await fetch(`${API_BASE}/api/campaigns`);
  if (!res.ok) throw new Error(`Campaigns failed: ${res.statusText}`);
  return res.json();
}

/* ---------- Integrations ---------- */

export interface Integration {
  id: string;
  name: string;
  category: string;
  status: 'connected' | 'disconnected';
  description: string;
  icon: string;
  last_sync: string | null;
  sync_count: number;
}

/** Get all integrations */
export async function getIntegrations(): Promise<Integration[]> {
  const res = await fetch(`${API_BASE}/api/integrations`);
  if (!res.ok) throw new Error(`Integrations failed: ${res.statusText}`);
  return res.json();
}

/** Toggle integration on/off */
export async function toggleIntegration(id: string, status: 'connected' | 'disconnected'): Promise<void> {
  await fetch(`${API_BASE}/api/integrations/${id}/toggle`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

/* ---------- Settings ---------- */

export interface AppSettings {
  profile: {
    name: string;
    email: string;
    role: string;
    company: string;
    avatar_initials: string;
  };
  notifications: {
    email_alerts: boolean;
    slack_alerts: boolean;
    new_lead_alert: boolean;
    score_threshold_alert: number;
    weekly_report: boolean;
  };
  scoring: {
    min_employee_count: number;
    min_revenue: number;
    preferred_industries: string[];
    weight_revenue: number;
    weight_employees: number;
    weight_enrichment: number;
  };
  scraping: {
    default_lead_count: number;
    auto_score_on_scrape: boolean;
    auto_enrich: boolean;
    deduplicate: boolean;
  };
}

/** Get app settings */
export async function getSettings(): Promise<AppSettings> {
  const res = await fetch(`${API_BASE}/api/settings`);
  if (!res.ok) throw new Error(`Settings failed: ${res.statusText}`);
  return res.json();
}

/** Save app settings */
export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  await fetch(`${API_BASE}/api/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
}
