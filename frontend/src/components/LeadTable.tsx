'use client';

import React, { useState } from 'react';
import { Mail, Trash2, Download, ChevronUp, ChevronDown, Activity, Zap } from 'lucide-react';
import ScoreBadge from './ScoreBadge';
import { Lead, scoreLeads, deleteLead, exportLeads } from '../lib/api';
import './LeadTable.css';

interface LeadTableProps {
  leads: Lead[];
  onEmailLead: (lead: Lead) => void;
  onLeadsUpdate: (leads: Lead[]) => void;
  onNotify: (msg: string) => void;
}

type SortKey = 'company_name' | 'industry' | 'location' | 'employee_count' | 'estimated_revenue' | 'score';

export default function LeadTable({ leads, onEmailLead, onLeadsUpdate, onNotify }: LeadTableProps) {
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);
  const [scoringIds, setScoringIds] = useState<Set<number>>(new Set());

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLeads(new Set(leads.map(l => l.id)));
    } else {
      setSelectedLeads(new Set());
    }
  };

  const handleSelectOne = (id: number) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLeads(newSelected);
  };

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  /* ---- Score single lead ---- */
  const handleScoreLead = async (leadId: number) => {
    setScoringIds(prev => new Set(prev).add(leadId));
    try {
      const result = await scoreLeads([leadId]);
      const updated = leads.map(l => {
        const scored = result.results.find((r: { id: number; score: number; tier: string }) => r.id === l.id);
        if (scored) {
          return { ...l, score: scored.score, score_tier: scored.tier };
        }
        return l;
      });
      onLeadsUpdate(updated);
      onNotify(`🧠 Lead scored: ${result.results[0]?.tier} (${result.results[0]?.score}/100)`);
    } catch {
      onNotify('❌ Scoring failed');
    } finally {
      setScoringIds(prev => {
        const next = new Set(prev);
        next.delete(leadId);
        return next;
      });
    }
  };

  /* ---- Score all selected ---- */
  const handleScoreSelected = async () => {
    const ids = Array.from(selectedLeads);
    if (ids.length === 0) return;
    setScoringIds(new Set(ids));
    try {
      const result = await scoreLeads(ids);
      const updated = leads.map(l => {
        const scored = result.results.find((r: { id: number; score: number; tier: string }) => r.id === l.id);
        if (scored) {
          return { ...l, score: scored.score, score_tier: scored.tier };
        }
        return l;
      });
      onLeadsUpdate(updated);
      onNotify(`🧠 Scored ${result.scored} leads!`);
      setSelectedLeads(new Set());
    } catch {
      onNotify('❌ Bulk scoring failed');
    } finally {
      setScoringIds(new Set());
    }
  };

  /* ---- Delete single lead ---- */
  const handleDeleteLead = async (leadId: number) => {
    try {
      await deleteLead(leadId);
      onLeadsUpdate(leads.filter(l => l.id !== leadId));
      selectedLeads.delete(leadId);
      setSelectedLeads(new Set(selectedLeads));
      onNotify('🗑️ Lead deleted');
    } catch {
      onNotify('❌ Delete failed');
    }
  };

  /* ---- Delete selected ---- */
  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedLeads);
    if (ids.length === 0) return;
    try {
      await Promise.all(ids.map(id => deleteLead(id)));
      onLeadsUpdate(leads.filter(l => !ids.includes(l.id)));
      setSelectedLeads(new Set());
      onNotify(`🗑️ Deleted ${ids.length} leads`);
    } catch {
      onNotify('❌ Bulk delete failed');
    }
  };

  /* ---- Export selected ---- */
  const handleExportSelected = async () => {
    const ids = Array.from(selectedLeads);
    try {
      await exportLeads('csv', ids.length > 0 ? ids : undefined);
      onNotify('📥 Exported leads to CSV!');
    } catch {
      onNotify('❌ Export failed');
    }
  };

  /* ---- Format revenue display ---- */
  const formatRevenue = (rev: number | null): string => {
    if (rev === null || rev === undefined) return 'N/A';
    if (rev >= 1000000) return `$${(rev / 1000000).toFixed(1)}M`;
    if (rev >= 1000) return `$${(rev / 1000).toFixed(0)}K`;
    return `$${rev.toFixed(0)}`;
  };

  /* ---- Sorting ---- */
  const sortedLeads = React.useMemo(() => {
    if (!sortConfig) return leads;
    return [...leads].sort((a, b) => {
      const aVal = a[sortConfig.key] ?? 0;
      const bVal = b[sortConfig.key] ?? 0;
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [leads, sortConfig]);

  const SortIcon = ({ field }: { field: SortKey }) => {
    if (sortConfig?.key !== field) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  if (leads.length === 0) {
    return (
      <div className="glass-card empty-state">
        <div className="empty-icon">📋</div>
        <h3>No leads yet</h3>
        <p>Use the Search tab to scrape leads, then come back here to view and manage them.</p>
      </div>
    );
  }

  return (
    <div className="glass-card table-container">
      {/* Bulk actions bar */}
      {selectedLeads.size > 0 && (
        <div className="bulk-actions">
          <span className="bulk-count">{selectedLeads.size} selected</span>
          <div className="bulk-buttons">
            <button className="btn btn-outline" onClick={handleExportSelected}>
              <Download size={16} /> Export
            </button>
            <button className="btn btn-outline" onClick={handleScoreSelected}>
              <Zap size={16} /> Score All
            </button>
            <button
              className="btn btn-outline"
              style={{ borderColor: 'var(--score-cold)', color: 'var(--score-cold)' }}
              onClick={handleDeleteSelected}
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      )}

      <div className="table-responsive">
        <table className="lead-table">
          <thead>
            <tr>
              <th className="checkbox-cell">
                <input
                  type="checkbox"
                  checked={selectedLeads.size === leads.length && leads.length > 0}
                  onChange={handleSelectAll}
                  className="custom-checkbox"
                />
              </th>
              <th onClick={() => requestSort('company_name')} className="sortable-th">Company <SortIcon field="company_name" /></th>
              <th onClick={() => requestSort('industry')} className="sortable-th">Industry <SortIcon field="industry" /></th>
              <th onClick={() => requestSort('location')} className="sortable-th">Location <SortIcon field="location" /></th>
              <th onClick={() => requestSort('employee_count')} className="sortable-th">Employees <SortIcon field="employee_count" /></th>
              <th onClick={() => requestSort('estimated_revenue')} className="sortable-th">Revenue <SortIcon field="estimated_revenue" /></th>
              <th onClick={() => requestSort('score')} className="sortable-th">Score <SortIcon field="score" /></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedLeads.map(lead => (
              <tr key={lead.id} className={selectedLeads.has(lead.id) ? 'selected-row' : ''}>
                <td className="checkbox-cell">
                  <input
                    type="checkbox"
                    checked={selectedLeads.has(lead.id)}
                    onChange={() => handleSelectOne(lead.id)}
                    className="custom-checkbox"
                  />
                </td>
                <td>
                  <div className="company-cell">
                    <span className="company-name">{lead.company_name}</span>
                    {lead.owner_name && <span className="owner-name">{lead.owner_name}</span>}
                  </div>
                </td>
                <td><span className="industry-tag">{lead.industry}</span></td>
                <td>{lead.location}</td>
                <td>{lead.employee_count ?? 'N/A'}</td>
                <td>{formatRevenue(lead.estimated_revenue)}</td>
                <td><ScoreBadge score={lead.score} tier={lead.score_tier} /></td>
                <td className="actions-cell">
                  <button
                    className="action-btn"
                    onClick={() => handleScoreLead(lead.id)}
                    title="Score this lead"
                    disabled={scoringIds.has(lead.id)}
                  >
                    {scoringIds.has(lead.id) ? <Activity size={18} className="spinning" /> : <Zap size={18} />}
                  </button>
                  <button className="action-btn" onClick={() => onEmailLead(lead)} title="Generate email">
                    <Mail size={18} />
                  </button>
                  <button className="action-btn delete-btn" onClick={() => handleDeleteLead(lead.id)} title="Delete lead">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span className="text-sm text-muted">Showing {leads.length} leads</span>
      </div>
    </div>
  );
}
