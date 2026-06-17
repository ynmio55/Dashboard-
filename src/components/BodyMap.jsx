import React, { useState } from 'react';
import { BODY_SHAPES } from '../constants';
import { getSeverityColor } from '../utils/helpers';

export function BodyMap({ parts }) {
  const [selected, setSelected] = useState(null);
  const byKey = Object.fromEntries(parts.map((part) => [part.key, part]));
  const colorFor = (part) => {
    if (!part) return '#f1f5f9';
    return getSeverityColor(part.pct);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
      <div className="relative flex flex-col items-center justify-center bg-slate-50/30 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(#94a3b8 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>

        <div className="relative z-10 mb-8 bg-white/90 backdrop-blur-md px-6 py-2.5 rounded-full border border-slate-200/50 shadow-sm flex items-center gap-2.5 text-sm font-medium text-slate-600">
          <span className="text-base">💡</span>
          คลิกตามตำแหน่งของสัดส่วนร่างกาย
        </div>

        <svg viewBox="0 0 100 220" className="relative z-10 w-full max-w-[280px] drop-shadow-[0_10px_20px_rgba(0,0,0,0.08)] transition-transform hover:scale-[1.02] duration-500" role="img" aria-label="Body map">
          <g fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5">
            <ellipse cx="50" cy="20" rx="14" ry="18" />
            <rect x="44" y="38" width="12" height="15" />
            <rect x="32" y="52" width="36" height="58" />
            <rect x="14" y="52" width="14" height="35" rx="7" />
            <rect x="72" y="52" width="14" height="35" rx="7" />
            <rect x="14" y="92" width="14" height="35" rx="7" />
            <rect x="72" y="92" width="14" height="35" rx="7" />
            <rect x="34" y="115" width="14" height="40" rx="5" />
            <rect x="52" y="115" width="14" height="40" rx="5" />
            <rect x="34" y="160" width="14" height="40" rx="5" />
            <rect x="52" y="160" width="14" height="40" rx="5" />
          </g>

          {BODY_SHAPES.map((shape, i) => (
            <ellipse
              key={i}
              cx={shape.cx}
              cy={shape.cy}
              rx={shape.rx}
              ry={shape.ry}
              fill={colorFor(byKey[shape.key])}
              stroke="white"
              strokeWidth="1.5"
              className={`transition-all duration-300 hover:opacity-80 cursor-pointer ${selected?.key === shape.key ? 'stroke-slate-800 stroke-[3px]' : ''}`}
              onClick={() => setSelected(byKey[shape.key])}
            />
          ))}
        </svg>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex-1 bg-slate-50/50 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center transition-all duration-500">
          {!selected ? (
            <div className="animate-in fade-in zoom-in duration-500">
              <div className="text-5xl mb-4 animate-[bounce_2s_infinite]">👈</div>
              <p className="text-slate-500 font-medium leading-relaxed">คลิกตามตำแหน่งของสัดส่วนร่างกาย</p>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in duration-300 w-full">
              <strong className="block text-2xl font-bold text-slate-800 mb-2">{selected.key}</strong>
              <span className="block text-sm font-medium text-slate-500 uppercase tracking-wide mb-4 pb-4 border-b border-slate-200/50">ตำแหน่งที่พบสูงสุด</span>
              <b className="block text-5xl font-black text-rose-500 my-2 tracking-tighter">{selected.pct.toFixed(1)}%</b>
              <p className="text-sm text-slate-600 leading-relaxed mt-4">
                <span className="font-semibold text-slate-800">{selected.hit}</span> จากกลุ่ม Pre-test <span className="font-semibold text-slate-800">{selected.pct.toFixed(1)}%</span> มีคะแนนอาการมากกว่า 0
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-5">
            <span className="text-lg">🎨</span> ระดับความชุก MSDs
          </h3>
          <div className="space-y-3.5">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-4 h-4 rounded-full bg-[#be123c] shadow-sm"></div>
              <span><b className="text-slate-700">≥ 85%</b> สูงมาก — แก้ไขเร่งด่วน</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-4 h-4 rounded-full bg-[#ef4444] shadow-sm"></div>
              <span><b className="text-slate-700">75-84%</b> สูง — ให้ความสำคัญ</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-4 h-4 rounded-full bg-[#f59e0b] shadow-sm"></div>
              <span><b className="text-slate-700">50-74%</b> ปานกลาง — ติดตาม</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-4 h-4 rounded-full bg-[#d97706] shadow-sm"></div>
              <span><b className="text-slate-700">&lt; 50%</b> ต่ำ — เฝ้าระวัง</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
