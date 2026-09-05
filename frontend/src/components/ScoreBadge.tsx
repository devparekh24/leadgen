import React from 'react';
import './ScoreBadge.css';

interface ScoreBadgeProps {
  score: number | null;
  tier?: string | null;
}

export default function ScoreBadge({ score, tier }: ScoreBadgeProps) {
  if (score === null || score === undefined) {
    return <span className="score-badge unscored">—</span>;
  }

  const computedTier = tier || (score >= 80 ? 'Hot' : score >= 50 ? 'Warm' : 'Cold');
  const tierClass = computedTier.toLowerCase();

  return (
    <div className={`score-badge ${tierClass}`}>
      <span className="score-dot"></span>
      <span className="score-number">{Math.round(score)}</span>
      <span className="score-label">{computedTier}</span>
    </div>
  );
}
