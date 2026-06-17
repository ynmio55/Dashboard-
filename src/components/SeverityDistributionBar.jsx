import React from 'react';

export function SeverityDistributionBar({ label, pct, count, barColor }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-semibold text-slate-600">
        <span>{label}</span>
        <span>{pct.toFixed(1)}% ({count} คน)</span>
      </div>
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner relative">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}
