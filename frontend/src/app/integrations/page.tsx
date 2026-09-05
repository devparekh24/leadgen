'use client';

import React, { useEffect, useState } from 'react';
import { getIntegrations, toggleIntegration, Integration } from '@/lib/api';
import './integrations.css';

const CATEGORY_ICONS: Record<string, string> = {
  CRM: '🏢',
  Notifications: '🔔',
  Enrichment: '✨',
  Automation: '⚙️',
  Email: '📧',
  Export: '📤',
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(integrations.map(i => i.category)))];

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const data = await getIntegrations();
      setIntegrations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (integration: Integration) => {
    const newStatus = integration.status === 'connected' ? 'disconnected' : 'connected';
    setTogglingId(integration.id);

    // Optimistic update
    setIntegrations(prev =>
      prev.map(i => i.id === integration.id ? { ...i, status: newStatus as 'connected' | 'disconnected' } : i)
    );

    try {
      await toggleIntegration(integration.id, newStatus as 'connected' | 'disconnected');
    } catch (err) {
      // revert on error
      setIntegrations(prev =>
        prev.map(i => i.id === integration.id ? { ...i, status: integration.status } : i)
      );
    } finally {
      setTogglingId(null);
    }
  };

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return 'Never';
    const diff = Date.now() - new Date(lastSync).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    if (hours > 0) return `${hours}h ago`;
    return `${mins}m ago`;
  };

  const filtered = filter === 'All' ? integrations : integrations.filter(i => i.category === filter);
  const connectedCount = integrations.filter(i => i.status === 'connected').length;

  if (loading) {
    return (
      <main className="main-content">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading integrations...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Integrations</h1>
          <p className="page-subtitle">Connect your favourite tools to supercharge your workflow</p>
        </div>
        <div className="integrations-stats">
          <div className="stat-pill">
            <span className="stat-pill-dot connected"></span>
            <span>{connectedCount} Connected</span>
          </div>
          <div className="stat-pill">
            <span className="stat-pill-dot disconnected"></span>
            <span>{integrations.length - connectedCount} Available</span>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="filter-tabs">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`filter-tab ${filter === cat ? 'active' : ''}`}
          >
            {CATEGORY_ICONS[cat] || '🔌'} {cat}
          </button>
        ))}
      </div>

      {/* Integration Cards */}
      <div className="integrations-grid">
        {filtered.map(integration => (
          <div
            key={integration.id}
            className={`integration-card glass-card ${integration.status === 'connected' ? 'is-connected' : ''}`}
          >
            <div className="int-card-header">
              <div className="int-icon">{integration.icon}</div>
              <div className="int-meta">
                <h3 className="int-name">{integration.name}</h3>
                <span className="int-category">{integration.category}</span>
              </div>
              <span className={`int-status-badge ${integration.status}`}>
                {integration.status === 'connected' ? '● Connected' : '○ Disconnected'}
              </span>
            </div>

            <p className="int-description">{integration.description}</p>

            <div className="int-card-footer">
              <div className="int-sync-info">
                {integration.status === 'connected' ? (
                  <>
                    <span className="int-sync-label">Last sync:</span>
                    <span className="int-sync-time">{formatLastSync(integration.last_sync)}</span>
                    <span className="int-sync-count">{integration.sync_count.toLocaleString()} records</span>
                  </>
                ) : (
                  <span className="int-sync-label text-muted">Not connected</span>
                )}
              </div>

              <button
                onClick={() => handleToggle(integration)}
                className={`btn int-toggle-btn ${integration.status === 'connected' ? 'btn-danger-ghost' : 'btn btn-primary'}`}
                disabled={togglingId === integration.id}
              >
                {togglingId === integration.id
                  ? '...'
                  : integration.status === 'connected'
                  ? 'Disconnect'
                  : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
