import React from 'react';

export function MetricCard({ icon: Icon, title, value, sub, color }) {
  return (
    <section 
      className="flex flex-col justify-between p-4 sm:p-6 bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
      style={{ borderLeftColor: color, borderLeftWidth: '6px' }}
    >
      <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-300 pointer-events-none">
        <Icon size={80} style={{ color }} />
      </div>
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <strong className="block text-4xl font-bold tracking-tight text-slate-800 mb-2" style={{ color }}>{value}</strong>
          <span className="text-xs font-medium text-slate-400 bg-slate-50 py-1 px-2 rounded-md">{sub}</span>
        </div>
      </div>
    </section>
  );
}
