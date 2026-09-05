'use client';

import React, { useEffect, useState } from 'react';
import { getCampaigns, Campaign } from '@/lib/api';
import './campaigns.css';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="main-content">
        <div className="loading-container">
          <div className="spinning text-teal">⏳</div>
          <p className="loading-text">Loading campaigns...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Outreach Campaigns</h1>
        <button className="btn btn-primary">+ New Campaign</button>
      </div>

      <div className="campaigns-list">
        {campaigns.map(camp => (
          <div key={camp.id} className="glass-card campaign-card">
            <div className="campaign-header">
              <div>
                <h2 className="campaign-name">{camp.name}</h2>
                <span className={`status-badge status-${camp.status.toLowerCase()}`}>
                  {camp.status}
                </span>
              </div>
              <div className="campaign-actions">
                <button className="btn-icon">✏️</button>
                <button className="btn-icon">⏸️</button>
              </div>
            </div>

            <div className="campaign-metrics">
              <div className="metric-box">
                <span className="metric-label">Sent</span>
                <span className="metric-value">{camp.sent}</span>
              </div>
              <div className="metric-box">
                <span className="metric-label">Opened</span>
                <span className="metric-value">{camp.opened}</span>
                <span className="metric-sub">
                  {camp.sent > 0 ? ((camp.opened / camp.sent) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="metric-box">
                <span className="metric-label">Replied</span>
                <span className="metric-value text-teal">{camp.replied}</span>
                <span className="metric-sub">
                  {camp.sent > 0 ? ((camp.replied / camp.sent) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="metric-box">
                <span className="metric-label">Bounced</span>
                <span className="metric-value">{camp.bounced}</span>
              </div>
            </div>

            <div className="progress-container">
              <div className="progress-labels">
                <span>Conversion Rate</span>
                <span>{camp.conversion_rate}%</span>
              </div>
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill"
                  style={{ width: `${Math.min(camp.conversion_rate * 5, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
