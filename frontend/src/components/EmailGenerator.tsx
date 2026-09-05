'use client';

import React, { useState } from 'react';
import { X, Copy, RefreshCw, Wand2, Check } from 'lucide-react';
import { Lead, generateEmail } from '../lib/api';
import './EmailGenerator.css';

interface EmailGeneratorProps {
  lead: Lead;
  onClose: () => void;
  onNotify: (msg: string) => void;
}

// Map UI-friendly labels to backend values
const TONE_MAP: Record<string, string> = {
  'Professional': 'professional',
  'Casual': 'casual',
  'Urgent': 'urgent',
};

const TEMPLATE_MAP: Record<string, string> = {
  'Introduction': 'initial_outreach',
  'Value Proposition': 'value_add',
  'Follow-up': 'follow_up',
};

export default function EmailGenerator({ lead, onClose, onNotify }: EmailGeneratorProps) {
  const [tone, setTone] = useState('Professional');
  const [templateType, setTemplateType] = useState('Introduction');
  const [emailContent, setEmailContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setCopied(false);
    try {
      const content = await generateEmail(
        lead.id,
        TONE_MAP[tone] || 'professional',
        TEMPLATE_MAP[templateType] || 'initial_outreach'
      );
      setEmailContent(content);
      onNotify('✉️ Email generated!');
    } catch {
      onNotify('❌ Email generation failed — is the backend running?');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(emailContent);
    setCopied(true);
    onNotify('📋 Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-card email-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <Wand2 className="text-teal" size={24} />
            AI Email Generator
          </h2>
          <button className="btn-icon" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="modal-body">
          {/* Lead context */}
          <div className="context-panel">
            <div className="context-item">
              <span className="context-label">Company</span>
              <span className="context-value">{lead.company_name}</span>
            </div>
            <div className="context-item">
              <span className="context-label">Industry</span>
              <span className="context-value">{lead.industry}</span>
            </div>
            <div className="context-item">
              <span className="context-label">Contact</span>
              <span className="context-value">{lead.owner_name || 'Unknown'}</span>
            </div>
            <div className="context-item">
              <span className="context-label">Location</span>
              <span className="context-value">{lead.location}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="config-grid">
            <div className="form-group">
              <label className="form-label">Email Tone</label>
              <select className="form-select" value={tone} onChange={(e) => setTone(e.target.value)}>
                <option>Professional</option>
                <option>Casual</option>
                <option>Urgent</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Template Type</label>
              <select className="form-select" value={templateType} onChange={(e) => setTemplateType(e.target.value)}>
                <option>Introduction</option>
                <option>Follow-up</option>
                <option>Value Proposition</option>
              </select>
            </div>
          </div>

          <button
            className="btn btn-primary generate-btn"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            <Wand2 size={18} />
            {isGenerating ? 'Generating...' : (emailContent ? 'Regenerate Email' : 'Generate Email')}
          </button>

          {/* Generated email */}
          {emailContent && (
            <div className="email-result fade-in">
              <textarea
                className="email-textarea"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                rows={10}
              />
              <div className="email-actions">
                <button className="btn btn-outline" onClick={handleCopy}>
                  {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy to Clipboard</>}
                </button>
                <button className="btn btn-ghost" onClick={handleGenerate}>
                  <RefreshCw size={16} /> Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
