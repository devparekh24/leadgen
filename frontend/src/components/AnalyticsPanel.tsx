'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, TrendingUp, Target, Briefcase, DollarSign } from 'lucide-react';
import './AnalyticsPanel.css';
import { Lead } from '../lib/api';

interface AnalyticsPanelProps {
  leads: Lead[];
}

export default function AnalyticsPanel({ leads }: AnalyticsPanelProps) {
  const totalLeads = leads.length;

  const scoredLeads = leads.filter(l => l.score !== null && l.score !== undefined);
  const avgScore = scoredLeads.length > 0
    ? Math.round(scoredLeads.reduce((acc, lead) => acc + (lead.score || 0), 0) / scoredLeads.length)
    : 0;
  const hotLeads = leads.filter(l => (l.score || 0) >= 80).length;
  const totalRevenue = leads.reduce((acc, l) => acc + (l.estimated_revenue || 0), 0);

  // Generate industry breakdown
  const industryCount = leads.reduce((acc: Record<string, number>, lead) => {
    acc[lead.industry] = (acc[lead.industry] || 0) + 1;
    return acc;
  }, {});

  const industryData = Object.keys(industryCount).map(key => ({
    name: key,
    value: industryCount[key]
  })).sort((a, b) => b.value - a.value).slice(0, 6);

  const topIndustry = industryData.length > 0 ? industryData[0].name : 'N/A';

  const scoreData = [
    { name: 'Hot (80+)', value: hotLeads, color: '#10b981' },
    { name: 'Warm (50-79)', value: leads.filter(l => (l.score || 0) >= 50 && (l.score || 0) < 80).length, color: '#f59e0b' },
    { name: 'Cold (<50)', value: leads.filter(l => (l.score || 0) < 50 && l.score !== null).length, color: '#ef4444' },
    { name: 'Unscored', value: leads.filter(l => l.score === null || l.score === undefined).length, color: '#6b7280' },
  ].filter(d => d.value > 0);

  const formatRevenue = (rev: number): string => {
    if (rev >= 1000000) return `$${(rev / 1000000).toFixed(1)}M`;
    if (rev >= 1000) return `$${(rev / 1000).toFixed(0)}K`;
    return `$${rev.toFixed(0)}`;
  };

  return (
    <div className="analytics-container">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="glass-card kpi-card">
          <div className="kpi-icon kpi-blue"><Users size={24} /></div>
          <div className="kpi-details">
            <span className="kpi-label">Total Leads</span>
            <span className="kpi-value">{totalLeads}</span>
          </div>
        </div>
        <div className="glass-card kpi-card">
          <div className="kpi-icon kpi-teal"><TrendingUp size={24} /></div>
          <div className="kpi-details">
            <span className="kpi-label">Avg Score</span>
            <span className="kpi-value">{avgScore > 0 ? avgScore : '—'}</span>
          </div>
        </div>
        <div className="glass-card kpi-card">
          <div className="kpi-icon kpi-green"><Target size={24} /></div>
          <div className="kpi-details">
            <span className="kpi-label">Hot Leads</span>
            <span className="kpi-value">{hotLeads}</span>
          </div>
        </div>
        <div className="glass-card kpi-card">
          <div className="kpi-icon kpi-purple"><DollarSign size={24} /></div>
          <div className="kpi-details">
            <span className="kpi-label">Total Revenue</span>
            <span className="kpi-value">{formatRevenue(totalRevenue)}</span>
          </div>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="glass-card empty-state" style={{ marginTop: '1.5rem' }}>
          <div className="empty-icon">📈</div>
          <h3>No data to analyze</h3>
          <p>Search for leads first, then come back to see your analytics dashboard.</p>
        </div>
      ) : (
        <div className="charts-grid">
          {/* Score Distribution */}
          <div className="glass-card chart-card">
            <h3 className="chart-title">Score Distribution</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={scoreData} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                    {scoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(10, 15, 28, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-legend">
              {scoreData.map((entry, i) => (
                <div key={i} className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: entry.color }}></span>
                  <span>{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Industry Breakdown */}
          <div className="glass-card chart-card">
            <h3 className="chart-title">Industry Breakdown</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={industryData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                  <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
                  <YAxis dataKey="name" type="category" width={100} stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: 'rgba(10, 15, 28, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="url(#barGradient)" radius={[0, 4, 4, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#14b8a6" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
