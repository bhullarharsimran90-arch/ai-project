import React from 'react';

export function BloomsBadge({ level }) {
  const configs = {
    Remember: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
    Understand: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' },
    Apply: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    Analyze: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
    Evaluate: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
    Create: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' }
  };

  const config = configs[level] || configs.Understand;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      Bloom's: {level || 'Understand'}
    </span>
  );
}

export function DifficultyBadge({ difficulty }) {
  const configs = {
    Easy: 'bg-green-50 text-green-700 border-green-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Hard: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${configs[difficulty] || configs.Medium}`}>
      {difficulty || 'Medium'}
    </span>
  );
}

export function QualityScoreBadge({ score, confidence }) {
  const isHigh = score >= 90;
  const isMedium = score >= 75 && score < 90;

  const color = isHigh
    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
    : isMedium
    ? 'text-blue-700 bg-blue-50 border-blue-200'
    : 'text-amber-700 bg-amber-50 border-amber-200';

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${color}`}>
        QC: {score}%
      </span>
      {confidence && (
        <span className="text-[11px] text-slate-500 hidden sm:inline">
          (Confidence: {confidence}%)
        </span>
      )}
    </div>
  );
}

export function MarksBadge({ marks }) {
  return (
    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-xs rounded border border-slate-200 font-semibold">
      {marks} {marks === 1 ? 'Mark' : 'Marks'}
    </span>
  );
}
