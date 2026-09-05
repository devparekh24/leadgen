'use client';

import React, { useEffect, useState } from 'react';
import { getSettings, saveSettings, AppSettings } from '@/lib/api';
import './settings.css';

const ALL_INDUSTRIES = [
  'IT Services', 'HVAC', 'Marketing', 'Accounting', 'Plumbing',
  'Landscaping', 'Dental Practices', 'Auto Repair', 'Real Estate', 'Construction'
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'scoring' | 'scraping'>('profile');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await saveSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleBool = (section: keyof AppSettings, key: string) => {
    if (!settings) return;
    setSettings(prev => prev ? ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [key]: !(prev[section] as any)[key]
      }
    }) : null);
  };

  const setNumeric = (section: keyof AppSettings, key: string, val: number) => {
    if (!settings) return;
    setSettings(prev => prev ? ({
      ...prev,
      [section]: { ...(prev[section] as any), [key]: val }
    }) : null);
  };

  const toggleIndustry = (ind: string) => {
    if (!settings) return;
    const current = settings.scoring.preferred_industries;
    const next = current.includes(ind)
      ? current.filter(i => i !== ind)
      : [...current, ind];
    setSettings(prev => prev ? ({
      ...prev,
      scoring: { ...prev.scoring, preferred_industries: next }
    }) : null);
  };

  if (loading || !settings) {
    return (
      <main className="main-content">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading settings...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Settings</h1>
          <p className="page-subtitle">Manage your profile, alerts, and scoring preferences</p>
        </div>
        <button
          onClick={handleSave}
          className={`btn btn-primary ${saving ? 'saving' : ''} ${saved ? 'saved' : ''}`}
          disabled={saving}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="settings-tabs">
        {(['profile', 'notifications', 'scoring', 'scraping'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`settings-tab ${activeTab === tab ? 'active' : ''}`}
          >
            {tab === 'profile' && '👤'}
            {tab === 'notifications' && '🔔'}
            {tab === 'scoring' && '📊'}
            {tab === 'scraping' && '🕷️'}
            {' '}{tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="settings-body glass-card">

        {/* PROFILE */}
        {activeTab === 'profile' && (
          <div className="settings-section">
            <div className="profile-avatar-row">
              <div className="settings-avatar">{settings.profile.avatar_initials}</div>
              <div>
                <h2 className="profile-name">{settings.profile.name}</h2>
                <span className="profile-role-badge">{settings.profile.role}</span>
              </div>
            </div>

            <div className="field-grid">
              <div className="field-group">
                <label className="field-label">Full Name</label>
                <input
                  type="text"
                  className="field-input"
                  value={settings.profile.name}
                  onChange={e => setSettings(prev => prev ? ({
                    ...prev,
                    profile: { ...prev.profile, name: e.target.value }
                  }) : null)}
                />
              </div>
              <div className="field-group">
                <label className="field-label">Email Address</label>
                <input
                  type="email"
                  className="field-input"
                  value={settings.profile.email}
                  onChange={e => setSettings(prev => prev ? ({
                    ...prev,
                    profile: { ...prev.profile, email: e.target.value }
                  }) : null)}
                />
              </div>
              <div className="field-group">
                <label className="field-label">Company</label>
                <input
                  type="text"
                  className="field-input"
                  value={settings.profile.company}
                  onChange={e => setSettings(prev => prev ? ({
                    ...prev,
                    profile: { ...prev.profile, company: e.target.value }
                  }) : null)}
                />
              </div>
              <div className="field-group">
                <label className="field-label">Role</label>
                <select
                  className="field-input"
                  value={settings.profile.role}
                  onChange={e => setSettings(prev => prev ? ({
                    ...prev,
                    profile: { ...prev.profile, role: e.target.value }
                  }) : null)}
                >
                  <option>Admin</option>
                  <option>Sales Rep</option>
                  <option>Manager</option>
                  <option>Viewer</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="settings-section">
            <h2 className="section-title">Alert Preferences</h2>
            <p className="section-subtitle">Control when and how you receive notifications</p>

            <div className="toggle-list">
              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="toggle-label">Email Alerts</span>
                  <span className="toggle-desc">Receive lead alerts via email</span>
                </div>
                <button
                  className={`toggle-switch ${settings.notifications.email_alerts ? 'on' : ''}`}
                  onClick={() => toggleBool('notifications', 'email_alerts')}
                />
              </div>
              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="toggle-label">Slack Alerts</span>
                  <span className="toggle-desc">Post lead updates to your Slack channel</span>
                </div>
                <button
                  className={`toggle-switch ${settings.notifications.slack_alerts ? 'on' : ''}`}
                  onClick={() => toggleBool('notifications', 'slack_alerts')}
                />
              </div>
              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="toggle-label">New Lead Alert</span>
                  <span className="toggle-desc">Notify when a new lead is scraped</span>
                </div>
                <button
                  className={`toggle-switch ${settings.notifications.new_lead_alert ? 'on' : ''}`}
                  onClick={() => toggleBool('notifications', 'new_lead_alert')}
                />
              </div>
              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="toggle-label">Weekly Summary Report</span>
                  <span className="toggle-desc">Get a weekly digest of pipeline performance</span>
                </div>
                <button
                  className={`toggle-switch ${settings.notifications.weekly_report ? 'on' : ''}`}
                  onClick={() => toggleBool('notifications', 'weekly_report')}
                />
              </div>

              <div className="field-group mt-lg">
                <label className="field-label">Score Threshold Alert — notify when score &ge; <strong>{settings.notifications.score_threshold_alert}</strong></label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={settings.notifications.score_threshold_alert}
                  onChange={e => setNumeric('notifications', 'score_threshold_alert', Number(e.target.value))}
                  className="range-slider"
                />
                <div className="range-labels"><span>0</span><span>50</span><span>100</span></div>
              </div>
            </div>
          </div>
        )}

        {/* SCORING */}
        {activeTab === 'scoring' && (
          <div className="settings-section">
            <h2 className="section-title">Lead Scoring Engine</h2>
            <p className="section-subtitle">Tune how leads are ranked to match your ideal customer profile</p>

            <div className="field-grid">
              <div className="field-group">
                <label className="field-label">Minimum Employee Count</label>
                <input
                  type="number"
                  className="field-input"
                  value={settings.scoring.min_employee_count}
                  onChange={e => setNumeric('scoring', 'min_employee_count', Number(e.target.value))}
                />
              </div>
              <div className="field-group">
                <label className="field-label">Minimum Revenue ($)</label>
                <input
                  type="number"
                  className="field-input"
                  value={settings.scoring.min_revenue}
                  onChange={e => setNumeric('scoring', 'min_revenue', Number(e.target.value))}
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Preferred Industries</label>
              <div className="industry-chips">
                {ALL_INDUSTRIES.map(ind => (
                  <button
                    key={ind}
                    onClick={() => toggleIndustry(ind)}
                    className={`chip ${settings.scoring.preferred_industries.includes(ind) ? 'active' : ''}`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            <div className="weights-section">
              <label className="field-label">Score Weights</label>
              <div className="weight-row">
                <span className="weight-label">Revenue</span>
                <input type="range" min={0} max={1} step={0.05}
                  value={settings.scoring.weight_revenue}
                  onChange={e => setNumeric('scoring', 'weight_revenue', Number(e.target.value))}
                  className="range-slider" />
                <span className="weight-value">{(settings.scoring.weight_revenue * 100).toFixed(0)}%</span>
              </div>
              <div className="weight-row">
                <span className="weight-label">Employees</span>
                <input type="range" min={0} max={1} step={0.05}
                  value={settings.scoring.weight_employees}
                  onChange={e => setNumeric('scoring', 'weight_employees', Number(e.target.value))}
                  className="range-slider" />
                <span className="weight-value">{(settings.scoring.weight_employees * 100).toFixed(0)}%</span>
              </div>
              <div className="weight-row">
                <span className="weight-label">Enrichment</span>
                <input type="range" min={0} max={1} step={0.05}
                  value={settings.scoring.weight_enrichment}
                  onChange={e => setNumeric('scoring', 'weight_enrichment', Number(e.target.value))}
                  className="range-slider" />
                <span className="weight-value">{(settings.scoring.weight_enrichment * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* SCRAPING */}
        {activeTab === 'scraping' && (
          <div className="settings-section">
            <h2 className="section-title">Scraping Preferences</h2>
            <p className="section-subtitle">Configure the lead discovery engine</p>

            <div className="field-group">
              <label className="field-label">Default Lead Count per Scrape — <strong>{settings.scraping.default_lead_count}</strong></label>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={settings.scraping.default_lead_count}
                onChange={e => setNumeric('scraping', 'default_lead_count', Number(e.target.value))}
                className="range-slider"
              />
              <div className="range-labels"><span>5</span><span>50</span><span>100</span></div>
            </div>

            <div className="toggle-list mt-lg">
              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="toggle-label">Auto-Score on Scrape</span>
                  <span className="toggle-desc">Score leads immediately after scraping</span>
                </div>
                <button
                  className={`toggle-switch ${settings.scraping.auto_score_on_scrape ? 'on' : ''}`}
                  onClick={() => toggleBool('scraping', 'auto_score_on_scrape')}
                />
              </div>
              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="toggle-label">Auto-Enrich Leads</span>
                  <span className="toggle-desc">Automatically enrich leads with Apollo.io data</span>
                </div>
                <button
                  className={`toggle-switch ${settings.scraping.auto_enrich ? 'on' : ''}`}
                  onClick={() => toggleBool('scraping', 'auto_enrich')}
                />
              </div>
              <div className="toggle-row">
                <div className="toggle-info">
                  <span className="toggle-label">Deduplicate Leads</span>
                  <span className="toggle-desc">Skip companies already in your database</span>
                </div>
                <button
                  className={`toggle-switch ${settings.scraping.deduplicate ? 'on' : ''}`}
                  onClick={() => toggleBool('scraping', 'deduplicate')}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
