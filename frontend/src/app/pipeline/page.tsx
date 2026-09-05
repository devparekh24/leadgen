'use client';

import React, { useEffect, useState } from 'react';
import { getPipeline, updateLeadStage, Lead } from '@/lib/api';
import './pipeline.css';

const STAGES = ['Prospect', 'Contacted', 'Meeting Set', 'Closed Won', 'Closed Lost'];

export default function PipelinePage() {
  const [pipeline, setPipeline] = useState<Record<string, Lead[]>>({});
  const [loading, setLoading] = useState(true);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

  useEffect(() => {
    fetchPipeline();
  }, []);

  const fetchPipeline = async () => {
    try {
      const data = await getPipeline();
      setPipeline(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    if (!draggedLead || draggedLead.pipeline_stage === targetStage) {
      setDraggedLead(null);
      return;
    }

    const sourceStage = draggedLead.pipeline_stage || 'Prospect';
    
    // Optimistic UI update
    setPipeline(prev => {
      const newPipeline = { ...prev };
      newPipeline[sourceStage] = (newPipeline[sourceStage] || []).filter(l => l.id !== draggedLead.id);
      
      const updatedLead = { ...draggedLead, pipeline_stage: targetStage };
      if (!newPipeline[targetStage]) newPipeline[targetStage] = [];
      newPipeline[targetStage] = [updatedLead, ...newPipeline[targetStage]];
      
      return newPipeline;
    });

    try {
      await updateLeadStage(draggedLead.id, targetStage);
    } catch (err) {
      console.error('Failed to update stage', err);
      fetchPipeline(); // revert on fail
    }
    
    setDraggedLead(null);
  };

  if (loading) {
    return (
      <main className="main-content">
        <div className="loading-container">
          <div className="spinning text-teal">⏳</div>
          <p className="loading-text">Loading pipeline...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Sales Pipeline</h1>
        <div className="badge">Drag & Drop</div>
      </div>

      <div className="pipeline-board">
        {STAGES.map(stage => (
          <div 
            key={stage} 
            className="pipeline-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage)}
          >
            <div className="column-header">
              <h3 className="column-title">{stage}</h3>
              <span className="column-count">
                {pipeline[stage]?.length || 0}
              </span>
            </div>
            
            <div className="column-cards">
              {(pipeline[stage] || []).map(lead => (
                <div
                  key={lead.id}
                  className="pipeline-card glass-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead)}
                >
                  <div className="card-header">
                    <span className="card-company">{lead.company_name}</span>
                    {lead.score && (
                      <span className={`card-score tier-${lead.score_tier?.toLowerCase()}`}>
                        {Math.round(lead.score)}
                      </span>
                    )}
                  </div>
                  <div className="card-details">
                    <span className="card-industry">{lead.industry}</span>
                    <span className="card-owner">{lead.owner_name}</span>
                  </div>
                  <div className="card-footer">
                    <span className="card-revenue">
                      {lead.estimated_revenue ? `$${(lead.estimated_revenue / 1000).toFixed(0)}K` : 'N/A'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
