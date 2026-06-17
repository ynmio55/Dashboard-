import React from 'react';

export function BarList({ data, maxValue, unit = '%', compact = false, colorMapper }) {
  const tones = [
    'from-rose-500 to-rose-400', 'from-orange-500 to-orange-400', 
    'from-amber-500 to-amber-400', 'from-yellow-500 to-yellow-400',
    'from-emerald-500 to-emerald-400', 'from-blue-500 to-blue-400',
    'from-indigo-500 to-indigo-400', 'from-cyan-500 to-cyan-400',
    'from-slate-500 to-slate-400', 'from-red-600 to-red-500'
  ];

  return (
    <div className={`grid ${compact ? 'gap-3' : 'gap-4'}`}>
      {data.map((item, index) => {
        const value = item.pct ?? item.value ?? item.score;
        const width = maxValue ? (value / maxValue) * 100 : 0;
        const gradient = tones[index % tones.length];
        
        let barClass = `h-full rounded-full transition-all duration-1000 ease-out`;
        let barStyle = {};
        if (colorMapper) {
          const color = colorMapper(item);
          if (color.startsWith('bg-') || color.startsWith('from-')) {
            barClass += ` ${color}`;
          } else {
            barStyle.backgroundColor = color;
          }
        } else {
          barClass += ` bg-gradient-to-r ${gradient}`;
        }

        return (
          <div className="grid grid-cols-[1fr_60px] sm:grid-cols-[180px_1fr_60px] md:grid-cols-[240px_1fr_70px] gap-x-4 gap-y-1.5 items-center group" key={item.label || item.key}>
            <span 
              className="text-xs sm:text-sm font-semibold text-slate-600 line-clamp-2 group-hover:text-slate-900 transition-colors col-span-2 sm:col-span-1"
              title={item.label || item.key}
            >
              {item.label || item.key}
            </span>
            <div className="h-3 sm:h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner col-span-1">
              <div 
                className={barClass} 
                style={{ width: `${Math.max(width, 2)}%`, ...barStyle }} 
              />
            </div>
            <b className="text-xs sm:text-sm font-bold text-slate-700 text-right col-span-1">
              {unit === 'คะแนน' ? value.toFixed(1) : `${Math.round(value)}${unit}`}
            </b>
          </div>
        );
      })}
    </div>
  );
}
