'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SearchPanel from '../components/SearchPanel';
import LeadTable from '../components/LeadTable';
import AnalyticsPanel from '../components/AnalyticsPanel';
import EmailGenerator from '../components/EmailGenerator';
import LoadingSpinner from '../components/LoadingSpinner';
import { Lead, searchLeads, getLeads } from '../lib/api';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'Search' | 'Results' | 'Analytics'>('Search');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Load existing leads from backend on mount
  useEffect(() => {
    loadExistingLeads();
  }, []);

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadExistingLeads = async () => {
    try {
      const existing = await getLeads();
      if (existing.length > 0) {
        setLeads(existing);
        setActiveTab('Results');
      }
    } catch {
      // Backend not running yet, that's ok
      console.log('Backend not available yet — start it with: uv run uvicorn main:app --port 8000');
    }
  };

  const handleSearch = async (filters: Record<string, string>) => {
    setIsLoading(true);
    try {
      const results = await searchLeads({
        industry: filters.industry || undefined,
        location: filters.location || undefined,
        keyword: filters.keyword || undefined,
        min_employees: filters.minEmployees ? Number(filters.minEmployees) : undefined,
        max_employees: filters.maxEmployees ? Number(filters.maxEmployees) : undefined,
        min_revenue: filters.minRevenue ? Number(filters.minRevenue) : undefined,
        max_revenue: filters.maxRevenue ? Number(filters.maxRevenue) : undefined,
      });
      setLeads(results);
      setActiveTab('Results');
      showNotification(`✅ Found ${results.length} leads!`);
    } catch {
      showNotification('❌ Search failed — is the backend running on port 8000?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadsUpdate = (updatedLeads: Lead[]) => {
    setLeads(updatedLeads);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
  };

  return (
    <div className="app-layout">
      {/* Toast notification */}
      {notification && (
        <div className="toast-notification">
          {notification}
        </div>
      )}

      <main className="main-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Lead Intelligence Dashboard</h1>
          <div className="tabs">
            <button
              className={`tab-btn ${activeTab === 'Search' ? 'active' : ''}`}
              onClick={() => setActiveTab('Search')}
            >
              🔍 Search
            </button>
            <button
              className={`tab-btn ${activeTab === 'Results' ? 'active' : ''}`}
              onClick={() => setActiveTab('Results')}
            >
              📊 Results <span className="badge">{leads.length}</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'Analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('Analytics')}
            >
              📈 Analytics
            </button>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Sidebar: always show search on desktop, toggle on mobile */}
          <div className={`sidebar ${activeTab !== 'Search' ? 'hidden-mobile' : ''}`}>
            <SearchPanel onSearch={handleSearch} isLoading={isLoading} />
          </div>

          <div className="content-area">
            {isLoading && activeTab === 'Results' ? (
              <div className="glass-card loading-container">
                <LoadingSpinner />
                <p className="loading-text">Scraping leads...</p>
              </div>
            ) : (
              <>
                {activeTab === 'Results' && (
                  <div className="fade-in">
                    <LeadTable
                      leads={leads}
                      onEmailLead={setSelectedLead}
                      onLeadsUpdate={handleLeadsUpdate}
                      onNotify={showNotification}
                    />
                  </div>
                )}
                {activeTab === 'Analytics' && (
                  <div className="fade-in">
                    <AnalyticsPanel leads={leads} />
                  </div>
                )}
                {activeTab === 'Search' && (
                  <div className="glass-card empty-state">
                    <div className="empty-icon">🔍</div>
                    <h3>Ready to find leads</h3>
                    <p className="text-muted">Use the search panel to discover high-quality B2B prospects.</p>
                    <p className="text-muted" style={{ marginTop: '8px', fontSize: '0.8rem' }}>
                      💡 Try searching for &quot;HVAC&quot; in &quot;Austin, TX&quot;
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {selectedLead && (
        <EmailGenerator
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onNotify={showNotification}
        />
      )}
    </div>
  );
}
