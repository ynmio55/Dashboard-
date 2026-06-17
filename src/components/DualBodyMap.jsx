import React, { useState } from 'react';
import { BODY_SHAPES } from '../constants';
import { getSeverityColor } from '../utils/helpers';

export function DualBodyMap({ maleParts, femaleParts, maleCount, femaleCount }) {
  const [selectedKey, setSelectedKey] = useState(null);
  const maleByKey = Object.fromEntries(maleParts.map((part) => [part.key, part]));
  const femaleByKey = Object.fromEntries(femaleParts.map((part) => [part.key, part]));

  const colorFor = (partByKey, key) => {
    const part = partByKey[key];
    if (!part) return '#f1f5f9';
    return getSeverityColor(part.pct);
  };

  const selectedMale = selectedKey ? maleByKey[selectedKey] : null;
  const selectedFemale = selectedKey ? femaleByKey[selectedKey] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
      <div className="relative flex flex-col items-center justify-center bg-slate-50/30 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(#94a3b8 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
        
        <div className="relative z-10 mb-8 bg-white/90 backdrop-blur-md px-6 py-2.5 rounded-full border border-slate-200/50 shadow-sm flex items-center gap-2.5 text-sm font-medium text-slate-600">
          <span>💡</span> คลิกตำแหน่งบนแผนที่ร่างกายเพื่อเปรียบเทียบเพศ ชาย - หญิง
        </div>

        <div className="relative z-10 flex justify-around w-full gap-4">
          <div className="flex flex-col items-center flex-1">
            <span className="text-sm font-bold text-blue-600 mb-3 bg-blue-50 px-3 py-1 rounded-full border border-blue-100/50 flex items-center gap-1">
              ชาย ♂ <span className="text-xs text-blue-500 font-medium">(n={maleCount})</span>
            </span>
            <svg viewBox="0 0 100 220" className="w-full max-w-[130px] drop-shadow-[0_10px_20px_rgba(59,130,246,0.08)] transition-transform hover:scale-[1.02] duration-500" role="img" aria-label="Male body map">
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
                  fill={colorFor(maleByKey, shape.key)}
                  stroke="white"
                  strokeWidth="1.5"
                  className={`transition-all duration-300 hover:opacity-80 cursor-pointer ${selectedKey === shape.key ? 'stroke-blue-600 stroke-[3px]' : ''}`}
                  onClick={() => setSelectedKey(shape.key)}
                />
              ))}
            </svg>
          </div>

          <div className="flex flex-col items-center flex-1">
            <span className="text-sm font-bold text-pink-600 mb-3 bg-pink-50 px-3 py-1 rounded-full border border-pink-100/50 flex items-center gap-1">
              หญิง ♀ <span className="text-xs text-pink-500 font-medium">(n={femaleCount})</span>
            </span>
            <svg viewBox="0 0 100 220" className="w-full max-w-[130px] drop-shadow-[0_10px_20px_rgba(236,72,153,0.08)] transition-transform hover:scale-[1.02] duration-500" role="img" aria-label="Female body map">
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
                  fill={colorFor(femaleByKey, shape.key)}
                  stroke="white"
                  strokeWidth="1.5"
                  className={`transition-all duration-300 hover:opacity-80 cursor-pointer ${selectedKey === shape.key ? 'stroke-pink-600 stroke-[3px]' : ''}`}
                  onClick={() => setSelectedKey(shape.key)}
                />
              ))}
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex-1 bg-slate-50/50 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center p-4 sm:p-6 transition-all duration-500">
          {!selectedKey ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4 animate-[bounce_2s_infinite]">👈</div>
              <p className="text-slate-500 font-medium leading-relaxed text-sm">
                คลิกตำแหน่งบนแผนที่ร่างกาย<br/>เพื่อเปรียบเทียบอาการ ชาย / หญิง
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center pb-4 border-b border-slate-200/50">
                <strong className="text-2xl font-bold text-slate-800">{selectedKey}</strong>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">เปรียบเทียบอัตราการเกิดอาการปวด</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/30 text-center">
                  <span className="text-xs font-bold text-blue-500 block mb-1">ชาย ♂</span>
                  <b className="text-3xl font-black text-blue-600">{(selectedMale?.pct ?? 0).toFixed(1)}%</b>
                  <p className="text-[10px] text-blue-700 mt-2 font-medium">
                    {selectedMale?.hit ?? 0} จาก {maleCount} ราย
                  </p>
                </div>
                <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100/30 text-center">
                  <span className="text-xs font-bold text-pink-500 block mb-1">หญิง ♀</span>
                  <b className="text-3xl font-black text-pink-600">{(selectedFemale?.pct ?? 0).toFixed(1)}%</b>
                  <p className="text-[10px] text-pink-700 mt-2 font-medium">
                    {selectedFemale?.hit ?? 0} จาก {femaleCount} ราย
                  </p>
                </div>
              </div>

              {(() => {
                const diff = (selectedFemale?.pct ?? 0) - (selectedMale?.pct ?? 0);
                const absDiff = Math.abs(diff).toFixed(1);
                const higherGender = diff > 0 ? 'หญิง ♀' : 'ชาย ♂';
                const colorClass = diff > 0 ? 'text-pink-600 bg-pink-50/30 border-pink-100' : 'text-blue-600 bg-blue-50/30 border-blue-100';
                if (parseFloat(absDiff) === 0) {
                  return (
                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 text-center text-xs font-semibold text-slate-600">
                      ทั้งสองเพศมีอัตราส่วนการปวดเท่ากัน
                    </div>
                  );
                }
                return (
                  <div className={`p-4 rounded-2xl border ${colorClass} text-center text-xs font-bold`}>
                    เพศ{higherGender} มีอัตราปวดสูงกว่าเพศ{diff > 0 ? 'ชาย ♂' : 'หญิง ♀'} อยู่ <span className="text-base font-black">{absDiff}%</span>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <h3 className="flex items-center gap-2 font-bold text-slate-800 text-xs mb-4">
            🎨 ระดับความชุก MSDs
          </h3>
          <div className="grid grid-cols-2 gap-3 text-[10px]">
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-3 h-3 rounded-full bg-[#be123c] shrink-0"></div>
              <span><b>≥ 85%</b> สูงมาก</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-3 h-3 rounded-full bg-[#ef4444] shrink-0"></div>
              <span><b>75-84%</b> สูง</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-3 h-3 rounded-full bg-[#f59e0b] shrink-0"></div>
              <span><b>50-74%</b> ปานกลาง</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <div className="w-3 h-3 rounded-full bg-[#d97706] shrink-0"></div>
              <span><b>&lt; 50%</b> ต่ำ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
