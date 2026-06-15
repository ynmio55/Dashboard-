import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  Brain,
  Building2,
  ClipboardList,
  Download,
  Home,
  ListChecks,
  MonitorCog,
  RefreshCw,
  Siren,
  Users,
  X,
} from 'lucide-react';
import './styles.css';

const CSV_URL =
  'https://docs.google.com/spreadsheets/d/1YsO7jR_0Z_xBef-03ACPYlIJ8Pb47FtdNds0ObrRhoE/gviz/tq?tqx=out:csv&gid=1870394303';
const DEPT_CSV_URL = 
  'https://docs.google.com/spreadsheets/d/1YsO7jR_0Z_xBef-03ACPYlIJ8Pb47FtdNds0ObrRhoE/gviz/tq?tqx=out:csv&gid=128247472';
const ANALYSIS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1YsO7jR_0Z_xBef-03ACPYlIJ8Pb47FtdNds0ObrRhoE/gviz/tq?tqx=out:csv&gid=182615786';

const BODY_PARTS = [
  { key: 'ไหล่', column: '2.ไหล่ รวม', x: 48, y: 24, w: 26, h: 12, rx: 8 },
  { key: 'คอ', column: '1.คอ รวม', x: 42, y: 9, w: 16, h: 12, rx: 8 },
  { key: 'หลังส่วนบน', column: '3.หลังส่วนบน รวม', x: 42, y: 34, w: 28, h: 16, rx: 12 },
  { key: 'หลังส่วนล่าง', column: '4.หลังส่วนล่าง รวม', x: 42, y: 52, w: 28, h: 16, rx: 12 },
  { key: 'แขนท่อนล่าง', column: '5.แขนท่อนล่าง รวม', x: 24, y: 50, w: 9, h: 24, rx: 7 },
  { key: 'มือ/ข้อมือ', column: '6.มือและข้อมือ รวม', x: 19, y: 72, w: 12, h: 11, rx: 8 },
  { key: 'สะโพก', column: '7.สะโพก รวม', x: 40, y: 68, w: 34, h: 10, rx: 8 },
  { key: 'เข่า', column: '8.เข่า รวม', x: 33, y: 84, w: 13, h: 10, rx: 8 },
  { key: 'น่อง', column: '9.น่อง รวม', x: 32, y: 96, w: 12, h: 20, rx: 8 },
  { key: 'เท้า/ข้อเท้า', column: '10.เท้าและข้อเท้า รวม', x: 29, y: 116, w: 20, h: 8, rx: 8 },
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') quoted = true;
    else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (char !== '\r') {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function toNumber(value) {
  if (value == null) return 0;
  const clean = String(value).replace('%', '').trim();
  const numeric = Number(clean);
  return Number.isFinite(numeric) ? numeric : 0;
}

function parseAnalysisSheet(csvText) {
  const rawRows = parseCsv(csvText);
  const rows = rawRows.filter(r => r.some(c => c.trim() !== ''));
  if (rows.length < 12) return null;

  const bodyParts = [];
  const bodyPartRows = rows.slice(2, 12);
  bodyPartRows.forEach((row) => {
    const rawName = row[0] || '';
    const name = rawName.replace(/^\d+\./, '').trim();
    
    const severityCounts = row.slice(1, 6).map(Number);
    const frequencyCounts = row.slice(8, 13).map(Number);
    const levelCounts = row.slice(29, 34).map(Number);
    
    const severityPcts = row.slice(15, 20).map(val => toNumber(String(val).replace('%', '').trim()));
    const frequencyPcts = row.slice(22, 27).map(val => toNumber(String(val).replace('%', '').trim()));
    const levelPcts = row.slice(36, 41).map(val => toNumber(String(val).replace('%', '').trim()));
    
    bodyParts.push({
      rawName,
      name,
      severityCounts,
      frequencyCounts,
      levelCounts,
      severityPcts,
      frequencyPcts,
      levelPcts
    });
  });

  const row1 = rows[1] || [];
  const knowledgeAvg = {
    label: row1[43] || 'Avg Knowledge',
    pre: toNumber(row1[44]),
    preLevel: row1[45] || '',
    post: row1[46] ? toNumber(row1[46]) : null,
    postLevel: row1[47] || ''
  };

  const row2 = rows[2] || [];
  const behaviorAvg = {
    label: row2[43] || 'Avg Behavior',
    pre: toNumber(row2[44]),
    preLevel: row2[45] || '',
    post: row2[46] ? toNumber(row2[46]) : null,
    postLevel: row2[47] || ''
  };

  let targetText = '';
  rows.forEach((r) => {
    r.forEach((cell) => {
      if (cell && cell.includes('เป้าหมายโครงการ')) {
        targetText = cell.trim();
      }
    });
  });

  const knowledgeLegend = [];
  const behaviorLegend = [];
  
  rows.slice(2, 5).forEach((r) => {
    if (r[49] && r[50] && r[51]) {
      knowledgeLegend.push({
        range: r[49].trim(),
        pct: r[50].trim(),
        level: r[51].trim()
      });
    }
  });

  rows.slice(8, 13).forEach((r) => {
    if (r[49] && r[50] && r[51]) {
      behaviorLegend.push({
        range: r[49].trim(),
        score: r[50].trim(),
        level: r[51].trim()
      });
    }
  });

  return {
    bodyParts,
    knowledgeAvg,
    behaviorAvg,
    targetText,
    knowledgeLegend,
    behaviorLegend
  };
}

function avg(values) {
  const nums = values.map(toNumber).filter((n) => Number.isFinite(n));
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    const label = row[key]?.trim() || 'ไม่ระบุ';
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
}

function shortQuestion(header) {
  const match = header.match(/\[(.+?)\]/);
  return match ? match[1] : header;
}

function analyze(rows) {
  const pre = rows.filter((row) => row['Pre-test / Post-test'] === 'Pre-test');
  const post = rows.filter((row) => row['Pre-test / Post-test'] === 'Post-test');
  const knowledgeRows = rows.filter((row) => row.Kรวม !== '');
  const behaviorRows = rows.filter((row) => row.Beเฉลี่ย !== '');
  const bodyRows = rows.filter((row) => row['Pre-test / Post-test'] === 'Pre-test');

  const bodyParts = BODY_PARTS.map((part) => {
    const hit = bodyRows.filter((row) => toNumber(row[part.column]) > 0).length;
    const pct = bodyRows.length ? (hit / bodyRows.length) * 100 : 0;
    const average = avg(bodyRows.map((row) => row[part.column]));
    return { ...part, hit, pct, average };
  }).sort((a, b) => b.pct - a.pct);

  const knowledgeItems = Array.from({ length: 10 }, (_, i) => {
    const key = `ข้อ${i + 1}`;
    const sourceHeader = rows[0]?.__headers?.[80 + i] || key;
    const score = avg(knowledgeRows.map((row) => row[key])) * 100;
    return { key, label: shortQuestion(sourceHeader), score };
  }).sort((a, b) => b.score - a.score);

  const behaviorItems = Array.from({ length: 10 }, (_, i) => {
    const key = `Be${i + 1}`;
    const sourceHeader = rows[0]?.__headers?.[89 + i] || key;
    const score = avg(behaviorRows.map((row) => row[key]));
    return { key, label: shortQuestion(sourceHeader), score };
  }).sort((a, b) => b.score - a.score);

  // Departments are now fetched separately from the pivot table
  const workHours = Object.entries(countBy(rows, 'ระยะเวลาที่ใช้คอมพิวเตอร์โดยเฉลี่ยต่อวัน  '))
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const highestBody = bodyParts[0] || { key: '-', pct: 0 };
  const knowledgeAvg = avg(knowledgeRows.map((row) => row.Kรวม));
  const behaviorAvg = avg(behaviorRows.map((row) => row.Beเฉลี่ย));
  const currentMsds = rows.filter((row) => row['ในระยะเวลา 7 วันที่ผ่านมา ท่านเคยมีอาการ ปวด/ชา/เมื่อยล้า ตามส่วนของร่างกายข้างต้น ที่เกิดจากการทำงานหรือไม่'] === 'เคย').length;
  const departmentCount = new Set(rows.map((row) => row['หน่วยงานที่สังกัด  ']?.trim()).filter(Boolean)).size;

  return {
    total: rows.length,
    pre: pre.length,
    post: post.length,
    knowledgeAvg,
    behaviorAvg,
    bodyParts,
    workHours,
    knowledgeItems,
    behaviorItems,
    currentMsdsPct: rows.length ? (currentMsds / rows.length) * 100 : 0,
    highestBody,
    departmentCount,
  };
}

function rowsFromCsv(csv) {
  const [headers, ...records] = parseCsv(csv);
  return records
    .filter((record) => record.some((cell) => cell.trim() !== ''))
    .map((record, index) => {
      const row = { __headers: headers, __rowNumber: index + 2 };
      headers.forEach((header, index) => {
        row[header] = record[index] || '';
      });
      return row;
    });
}

function MetricCard({ icon: Icon, title, value, sub, color }) {
  return (
    <section 
      className="flex flex-col justify-between p-6 bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
      style={{ borderLeftColor: color, borderLeftWidth: '6px' }}
    >
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-300 pointer-events-none">
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

function getSeverityColor(pct) {
  if (pct >= 85) return '#be123c'; // dark red
  if (pct >= 75) return '#ef4444'; // red
  if (pct >= 50) return '#f59e0b'; // amber/orange
  return '#d97706'; // light brown
}

function BarList({ data, maxValue, unit = '%', compact = false, colorMapper }) {
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
          <div className="grid grid-cols-[minmax(150px,280px)_1fr_70px] gap-4 items-center group" key={item.label || item.key}>
            <span 
              className="text-sm font-medium text-slate-600 line-clamp-2 group-hover:text-slate-900 transition-colors"
              title={item.label || item.key}
            >
              {item.label || item.key}
            </span>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <div 
                className={barClass} 
                style={{ width: `${Math.max(width, 2)}%`, ...barStyle }} 
              />
            </div>
            <b className="text-sm font-semibold text-slate-700 text-right">
              {unit === 'คะแนน' ? value.toFixed(1) : `${Math.round(value)}${unit}`}
            </b>
          </div>
        );
      })}
    </div>
  );
}

const BODY_SHAPES = [
  { key: 'คอ', cx: 50, cy: 45, rx: 10, ry: 7 },
  { key: 'ไหล่', cx: 21, cy: 56, rx: 14, ry: 9 },
  { key: 'ไหล่', cx: 79, cy: 56, rx: 14, ry: 9 },
  { key: 'หลังส่วนบน', cx: 50, cy: 68, rx: 18, ry: 12 },
  { key: 'หลังส่วนล่าง', cx: 50, cy: 95, rx: 18, ry: 12 },
  { key: 'สะโพก', cx: 50, cy: 115, rx: 24, ry: 8 },
  { key: 'แขนท่อนล่าง', cx: 21, cy: 110, rx: 8, ry: 18 },
  { key: 'แขนท่อนล่าง', cx: 79, cy: 110, rx: 8, ry: 18 },
  { key: 'มือ/ข้อมือ', cx: 21, cy: 135, rx: 8, ry: 8 },
  { key: 'มือ/ข้อมือ', cx: 79, cy: 135, rx: 8, ry: 8 },
  { key: 'เข่า', cx: 41, cy: 155, rx: 8, ry: 8 },
  { key: 'เข่า', cx: 59, cy: 155, rx: 8, ry: 8 },
  { key: 'น่อง', cx: 41, cy: 180, rx: 7, ry: 16 },
  { key: 'น่อง', cx: 59, cy: 180, rx: 7, ry: 16 },
  { key: 'เท้า/ข้อเท้า', cx: 41, cy: 205, rx: 10, ry: 6 },
  { key: 'เท้า/ข้อเท้า', cx: 59, cy: 205, rx: 10, ry: 6 },
];

function BodyMap({ parts }) {
  const [selected, setSelected] = useState(null);
  const byKey = Object.fromEntries(parts.map((part) => [part.key, part]));
  const colorFor = (part) => {
    if (!part) return '#f1f5f9';
    return getSeverityColor(part.pct);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
      
      <div className="relative flex flex-col items-center justify-center bg-slate-50/30 p-8 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        
        <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(#94a3b8 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>

        <div className="relative z-10 mb-8 bg-white/90 backdrop-blur-md px-6 py-2.5 rounded-full border border-slate-200/50 shadow-sm flex items-center gap-2.5 text-sm font-medium text-slate-600">
          <span className="text-base">💡</span>
          คลิกที่ตำแหน่งบนแผนที่ เพื่อดูรายละเอียด
        </div>

        <svg viewBox="0 0 100 220" className="relative z-10 w-full max-w-[280px] drop-shadow-[0_10px_20px_rgba(0,0,0,0.08)] transition-transform hover:scale-[1.02] duration-500" role="img" aria-label="Body map">
          <g fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5">
            {/* Head */}
            <ellipse cx="50" cy="20" rx="14" ry="18" />
            {/* Neck */}
            <rect x="44" y="38" width="12" height="15" />
            {/* Torso */}
            <rect x="32" y="52" width="36" height="58" />
            {/* Upper arms */}
            <rect x="14" y="52" width="14" height="35" rx="7" />
            <rect x="72" y="52" width="14" height="35" rx="7" />
            {/* Lower arms */}
            <rect x="14" y="92" width="14" height="35" rx="7" />
            <rect x="72" y="92" width="14" height="35" rx="7" />
            {/* Thighs */}
            <rect x="34" y="115" width="14" height="40" rx="5" />
            <rect x="52" y="115" width="14" height="40" rx="5" />
            {/* Calves */}
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
        
        <div className="flex-1 bg-slate-50/50 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center p-8 text-center transition-all duration-500">
          {!selected ? (
            <div className="animate-in fade-in zoom-in duration-500">
              <div className="text-5xl mb-4 animate-[bounce_2s_infinite]">👉</div>
              <p className="text-slate-500 font-medium leading-relaxed">
                คลิกที่ตำแหน่งบนแผนที่<br/>เพื่อดูรายละเอียด
              </p>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in duration-300 w-full">
              <strong className="block text-2xl font-bold text-slate-800 mb-2">{selected.key}</strong>
              <span className="block text-sm font-medium text-slate-500 uppercase tracking-wide mb-4 pb-4 border-b border-slate-200/50">ตำแหน่งที่พบสูงสุด</span>
              <b className="block text-5xl font-black text-rose-500 my-2 tracking-tighter">{selected.pct.toFixed(1)}%</b>
              <p className="text-sm text-slate-600 leading-relaxed mt-4">
                <span className="font-semibold text-slate-800">{selected.hit}</span> จากกลุ่ม Pre-test <span className="font-semibold text-slate-800">{Math.round(selected.pct)}%</span> มีคะแนนอาการมากกว่า 0
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

function DualBodyMap({ maleParts, femaleParts, maleCount, femaleCount }) {
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
    <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] gap-6">
      
      <div className="relative flex flex-col items-center justify-center bg-slate-50/30 p-8 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(#94a3b8 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
        
        <div className="relative z-10 mb-8 bg-white/90 backdrop-blur-md px-6 py-2.5 rounded-full border border-slate-200/50 shadow-sm flex items-center gap-2.5 text-sm font-medium text-slate-600">
          <span>💡</span> คลิกตำแหน่งบนแผนที่ร่างกายเพื่อเปรียบเทียบเพศ ชาย - หญิง
        </div>

        <div className="relative z-10 flex justify-around w-full gap-4">
          {/* Male Model */}
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

          {/* Female Model */}
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

      {/* Compare Detail Panel */}
      <div className="flex flex-col gap-6">
        <div className="flex-1 bg-slate-50/50 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center p-6 transition-all duration-500">
          {!selectedKey ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4 animate-[bounce_2s_infinite]">👉</div>
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

              {/* Comparison Insight card */}
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

        {/* Mini Legend */}
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

function RowDetailModal({ row, onClose }) {
  if (!row) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">ข้อมูลผู้ตอบแบบสอบถาม (ลำดับที่ {row.__rowNumber - 1})</h2>
            <p className="text-sm text-slate-500 mt-1">ประทับเวลา: {row['ประทับเวลา']}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-6 space-y-4 flex-grow custom-scrollbar">
          {row.__headers.map((header, idx) => {
            if (!header) return null;
            const value = row[header];
            if (!value) return null; // Skip empty answers to keep it clean
            
            return (
              <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:gap-6 p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                <div className="sm:w-1/2 font-semibold text-slate-700 text-sm">{header}</div>
                <div className="sm:w-1/2 text-slate-600 text-sm bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg">{value}</div>
              </div>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-full transition-colors shadow-sm"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}

function ResponseTable({ rows, limit, onRowClick }) {
  const visibleRows = [...rows].reverse().slice(0, limit || rows.length);

  return (
    <div className="overflow-auto max-h-[500px] border border-slate-200 rounded-xl shadow-sm bg-white">
      <table className="w-full min-w-[1000px] text-sm text-left">
        <thead className="text-xs text-slate-600 uppercase bg-slate-50 sticky top-0 z-10 backdrop-blur-md bg-white/90">
          <tr>
            <th className="px-6 py-4 font-semibold">ลำดับที่</th>
            <th className="px-6 py-4 font-semibold">ประทับเวลา</th>
            <th className="px-6 py-4 font-semibold">ระยะ</th>
            <th className="px-6 py-4 font-semibold">เพศ</th>
            <th className="px-6 py-4 font-semibold">หน่วยงาน</th>
            <th className="px-6 py-4 font-semibold">อาการมากที่สุด</th>
            <th className="px-6 py-4 font-semibold">Kรวม</th>
            <th className="px-6 py-4 font-semibold">Beเฉลี่ย</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {visibleRows.map((row) => (
            <tr 
              key={`${row.__rowNumber}-${row['ประทับเวลา']}`} 
              className="hover:bg-sky-50 transition-colors cursor-pointer"
              onClick={() => onRowClick && onRowClick(row)}
            >
              <td className="px-6 py-4 font-medium text-slate-900">{row.__rowNumber - 1}</td>
              <td className="px-6 py-4 text-slate-500">{row['ประทับเวลา'] || '-'}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  row['Pre-test / Post-test'] === 'Post-test' 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-sky-100 text-sky-800'
                }`}>
                  {row['Pre-test / Post-test'] || '-'}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-600">{row['เพศ'] || '-'}</td>
              <td className="px-6 py-4 text-slate-600">{row['หน่วยงานที่สังกัด  '] || '-'}</td>
              <td className="px-6 py-4 text-slate-600">{row['หากเคยมีอาการ โปรดระบุบริเวณที่มีอาการมากที่สุด'] || '-'}</td>
              <td className="px-6 py-4 font-medium text-slate-700">{row.Kรวม || '-'}</td>
              <td className="px-6 py-4 font-medium text-slate-700">{row.Beเฉลี่ย || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SeverityDistributionBar({ label, pct, count, barColor }) {
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

function AnalysisView({ analysisData }) {
  const [selectedPartIndex, setSelectedPartIndex] = useState(0);
  const selectedPart = analysisData.bodyParts[selectedPartIndex] || null;

  const levelLabels = [
    'ระดับ 0 (ไม่มีอาการ)',
    'ระดับ 1 (เล็กน้อย)',
    'ระดับ 2 (ปานกลาง)',
    'ระดับ 3 (รุนแรง)',
    'ระดับ 4 (รุนแรงมาก)'
  ];

  const levelColors = [
    '#10b981', // green for level 0
    '#f59e0b', // amber/yellow for level 1
    '#f97316', // orange for level 2
    '#ef4444', // red for level 3
    '#be123c'  // dark red for level 4
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* KPIs & Target Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
              <Brain size={20} />
            </div>
            <span className="text-sm font-semibold text-slate-500">ความรู้เฉลี่ยโครงการ (Pre-test)</span>
          </div>
          <div className="flex items-baseline gap-2">
            <strong className="text-4xl font-extrabold text-slate-800">{analysisData.knowledgeAvg.pre.toFixed(2)}</strong>
            <span className="text-xs font-semibold text-slate-400">/ 10 คะแนน</span>
          </div>
          <div className="mt-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              ระดับ: {analysisData.knowledgeAvg.preLevel}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
              <ClipboardList size={20} />
            </div>
            <span className="text-sm font-semibold text-slate-500">พฤติกรรมเฉลี่ยโครงการ (Pre-test)</span>
          </div>
          <div className="flex items-baseline gap-2">
            <strong className="text-4xl font-extrabold text-slate-800">{analysisData.behaviorAvg.pre.toFixed(2)}</strong>
            <span className="text-xs font-semibold text-slate-400">/ 5 คะแนน</span>
          </div>
          <div className="mt-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              ระดับ: {analysisData.behaviorAvg.preLevel}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-900 to-slate-800 p-6 rounded-2xl text-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <MonitorCog size={100} />
          </div>
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2 text-sky-300 text-xs font-bold tracking-wider uppercase">
              🎯 เป้าหมายผลสัมฤทธิ์โครงการ
            </div>
            <p className="text-sm font-medium leading-relaxed text-indigo-100">
              {analysisData.targetText || 'เป้าหมายโครงการ: พัฒนาพฤติกรรมความปลอดภัยการยศาสตร์'}
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs font-semibold text-sky-200">
              <span>เกณฑ์ความรู้ ดี (≥80%) และ พฤติกรรม ดี (≥3.41)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Distributions per Body Part */}
      <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <div className="pb-4 border-b border-slate-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
              <span className="w-3 h-3 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]"></span>
              การแจกแจงระดับสัดส่วนอาการปวด (n = 168 คน)
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">วิเคราะห์เจาะลึก 3 มิติ: ระดับความรุนแรง ความถี่ และอาการโดยรวม</p>
          </div>
        </div>

        {/* Body Parts Button Selector */}
        <div className="flex flex-wrap gap-2.5 mb-8">
          {analysisData.bodyParts.map((part, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPartIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                selectedPartIndex === idx
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 translate-y-[-1px]'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200/40'
              }`}
            >
              {part.rawName}
            </button>
          ))}
        </div>

        {selectedPart && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
            {/* Severity Panel */}
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-5">
              <div className="pb-3 border-b border-slate-200/50">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">มิติที่ 1</span>
                <strong className="text-base font-bold text-slate-800">ความรุนแรง (Severity)</strong>
              </div>
              <div className="space-y-4">
                {levelLabels.map((label, idx) => (
                  <SeverityDistributionBar
                    key={idx}
                    label={label}
                    pct={selectedPart.severityPcts[idx]}
                    count={selectedPart.severityCounts[idx]}
                    barColor={levelColors[idx]}
                  />
                ))}
              </div>
            </div>

            {/* Frequency Panel */}
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-5">
              <div className="pb-3 border-b border-slate-200/50">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">มิติที่ 2</span>
                <strong className="text-base font-bold text-slate-800">ความถี่ (Frequency)</strong>
              </div>
              <div className="space-y-4">
                {levelLabels.map((label, idx) => (
                  <SeverityDistributionBar
                    key={idx}
                    label={label}
                    pct={selectedPart.frequencyPcts[idx]}
                    count={selectedPart.frequencyCounts[idx]}
                    barColor={levelColors[idx]}
                  />
                ))}
              </div>
            </div>

            {/* Overall Symptom Level Panel */}
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-5">
              <div className="pb-3 border-b border-slate-200/50">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">มิติที่ 3</span>
                <strong className="text-base font-bold text-slate-800">ระดับอาการ (Symptom Level)</strong>
              </div>
              <div className="space-y-4">
                {levelLabels.map((label, idx) => (
                  <SeverityDistributionBar
                    key={idx}
                    label={label}
                    pct={selectedPart.levelPcts[idx]}
                    count={selectedPart.levelCounts[idx]}
                    barColor={levelColors[idx]}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Grading Legends side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Knowledge Legend Panel */}
        <section className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <span>📚</span> เกณฑ์ระดับความรู้การยศาสตร์
          </h3>
          <div className="overflow-hidden border border-slate-200 rounded-xl bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">ช่วงคะแนน</th>
                  <th className="px-4 py-3">ร้อยละ</th>
                  <th className="px-4 py-3">ระดับความรู้</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {analysisData.knowledgeLegend.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">{item.range}</td>
                    <td className="px-4 py-3">{item.pct}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        item.level === 'ดี' ? 'bg-emerald-100 text-emerald-800' :
                        item.level === 'ปานกลาง' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Behavior Legend Panel */}
        <section className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <span>🧘‍♂️</span> เกณฑ์ระดับพฤติกรรมการทำงาน
          </h3>
          <div className="overflow-hidden border border-slate-200 rounded-xl bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">ค่าเฉลี่ยคะแนน</th>
                  <th className="px-4 py-3">คะแนนรวม (เต็ม 50)</th>
                  <th className="px-4 py-3">ระดับพฤติกรรม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {analysisData.behaviorLegend.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">{item.range}</td>
                    <td className="px-4 py-3">{item.score}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        item.level.startsWith('ดี') ? 'bg-emerald-100 text-emerald-800' :
                        item.level.startsWith('ปานกลาง') ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

    </div>
  );
}

function App() {
  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [status, setStatus] = useState('กำลังโหลดข้อมูลจาก Google Sheets...');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedGender, setSelectedGender] = useState('all');

  const [analysisData, setAnalysisData] = useState(null);

  async function loadData() {
    setStatus('กำลังโหลดข้อมูลจาก Google Sheets...');
    try {
      const [mainRes, deptRes, analysisRes] = await Promise.all([
        fetch(CSV_URL),
        fetch(DEPT_CSV_URL),
        fetch(ANALYSIS_CSV_URL)
      ]);
      const mainText = await mainRes.text();
      const deptText = await deptRes.text();
      const analysisText = await analysisRes.text();
      
      setRows(rowsFromCsv(mainText));
      
      const deptData = rowsFromCsv(deptText)
        .map(row => ({
          label: row['หน่วยงานที่สังกัด  '] || row[Object.keys(row)[0]],
          value: toNumber(row['COUNTA ของ ชื่อ-สกุล'] || row[Object.keys(row)[1]])
        }))
        .filter(item => item.label && item.label !== 'ผลรวม' && item.value > 0)
        .sort((a, b) => b.value - a.value);
        
      setDepartments(deptData);

      const parsedAnalysis = parseAnalysisSheet(analysisText);
      setAnalysisData(parsedAnalysis);

      setStatus(`อัปเดตล่าสุด: ${new Date().toLocaleString('th-TH')}`);
    } catch (error) {
      setStatus(`โหลดข้อมูลไม่สำเร็จ: ${error.message}`);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const maleRows = useMemo(() => rows.filter((row) => row['เพศ'] === 'ชาย'), [rows]);
  const femaleRows = useMemo(() => rows.filter((row) => row['เพศ'] === 'หญิง'), [rows]);

  const maleSummary = useMemo(() => analyze(maleRows), [maleRows]);
  const femaleSummary = useMemo(() => analyze(femaleRows), [femaleRows]);

  const filteredRows = useMemo(() => {
    if (selectedGender === 'ชาย') return maleRows;
    if (selectedGender === 'หญิง') return femaleRows;
    return rows;
  }, [rows, selectedGender, maleRows, femaleRows]);

  const summary = useMemo(() => analyze(filteredRows), [filteredRows]);
  const maxBody = Math.max(...summary.bodyParts.map((item) => item.pct), 1);
  const maxDept = Math.max(...departments.map((item) => item.value), 1);

  const maxMaleBody = Math.max(...maleSummary.bodyParts.map((item) => item.pct), 1);
  const maxFemaleBody = Math.max(...femaleSummary.bodyParts.map((item) => item.pct), 1);

  return (
    <main className="min-h-screen bg-slate-50 pb-20 font-sans">
      {selectedRow && (
        <RowDetailModal row={selectedRow} onClose={() => setSelectedRow(null)} />
      )}
      <header className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-800 to-sky-700 text-white px-6 py-10 md:py-14 md:px-12 shadow-lg">
        <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-pattern"></div>
        <div className="relative z-10 w-full px-4 md:px-8 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-shrink-0 w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
            <MonitorCog size={40} className="text-sky-300" />
          </div>
          <div className="flex-grow">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-sky-100">
              Dashboard การยศาสตร์ในบุคลากรที่ปฏิบัติงานกับคอมพิวเตอร์
            </h1>
            <p className="text-sky-200 font-medium text-lg">กลุ่มงานอาชีวเวชกรรม โรงพยาบาลสกลนคร | ปีงบประมาณ 2569</p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3 mt-4 md:mt-0">
            <div className="flex gap-2 flex-wrap justify-start md:justify-end">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-sm font-semibold text-sm text-sky-50">
                <ClipboardList size={16} /> ระยะ: Pre-test / Post-test
              </span>
              {activeTab !== 'gender-compare' && activeTab !== 'analysis-tab' && (
                <div className="flex items-center bg-white/10 backdrop-blur-md p-1 rounded-full border border-white/20 shadow-sm shrink-0">
                  <button 
                    onClick={() => setSelectedGender('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                      selectedGender === 'all' 
                        ? 'bg-white text-slate-800 shadow-sm font-extrabold' 
                        : 'text-sky-100 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  <button 
                    onClick={() => setSelectedGender('ชาย')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                      selectedGender === 'ชาย' 
                        ? 'bg-blue-600 text-white shadow-md border border-white/20 font-extrabold' 
                        : 'text-sky-100 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    ชาย ♂
                  </button>
                  <button 
                    onClick={() => setSelectedGender('หญิง')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                      selectedGender === 'หญิง' 
                        ? 'bg-pink-600 text-white shadow-md border border-white/20 font-extrabold' 
                        : 'text-sky-100 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    หญิง ♀
                  </button>
                </div>
              )}
            </div>
            <small className="text-sky-200/80 font-medium text-xs bg-black/20 px-3 py-1 rounded-full">{status}</small>
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm overflow-x-auto">
        <div className="w-full px-4 md:px-8 flex items-center gap-2 md:gap-4 h-16">
          {[
            ['overview', Home, 'ภาพรวม'],
            ['msds', Siren, 'MSDs อาการปวด'],
            ['gender-compare', ArrowLeftRight, 'เปรียบเทียบชาย-หญิง'],
            ['analysis-tab', ClipboardList, 'วิเคราะห์ระดับอาการ (ROSA)'],
            ['knowledge', Brain, 'ความรู้ & พฤติกรรม'],
            ['departments', Building2, 'รายหน่วยงาน'],
            ['responses', ListChecks, 'ข้อมูลรายแถว'],
          ].map(([id, Icon, label]) => (
            <button 
              key={id} 
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-200 ${
                activeTab === id 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 translate-y-[-1px]' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
          <div className="flex-grow"></div>
          <button 
            className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm text-sky-600 hover:bg-sky-50 transition-colors whitespace-nowrap" 
            onClick={loadData}
          >
            <RefreshCw size={16} /> รีเฟรช
          </button>
          <a 
            className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm text-emerald-600 hover:bg-emerald-50 transition-colors whitespace-nowrap" 
            href={CSV_URL}
            target="_blank" rel="noreferrer"
          >
            <Download size={16} /> CSV
          </a>
        </div>
      </nav>

      <section className="w-full px-4 md:px-8 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <MetricCard icon={Users} title="ผู้ตอบแบบสอบถามทั้งหมด" value={summary.total.toLocaleString('th-TH')} sub={`Pre-test ${summary.pre} + Post ${summary.post}`} color="#3b82f6" />
              <MetricCard icon={ClipboardList} title="ทำแบบทดสอบ Pre-test" value={summary.pre.toLocaleString('th-TH')} sub={summary.total ? `${((summary.pre / summary.total) * 100).toFixed(1)}% ของคำตอบทั้งหมด` : '-'} color="#0ea5e9" />
              <MetricCard icon={Brain} title="คะแนนความรู้เฉลี่ย" value={`${summary.knowledgeAvg.toFixed(2)}/10`} sub="คะแนนจาก 10 ข้อ" color="#10b981" />
              <MetricCard icon={ClipboardList} title="คะแนนพฤติกรรมเฉลี่ย" value={`${summary.behaviorAvg.toFixed(2)}/5`} sub="คะแนนเต็ม 5" color="#f59e0b" />
              <MetricCard icon={Siren} title="พบอาการ MSDs ใน 7 วัน" value={`${summary.currentMsdsPct.toFixed(1)}%`} sub="ผู้มีอาการปวด/ชา/เมื่อยล้า" color="#ef4444" />
              <MetricCard icon={BarChart3} title="ตำแหน่งที่ปวดมากที่สุด" value={summary.highestBody.key} sub={`${summary.highestBody.pct.toFixed(1)}% จากกลุ่ม Pre-test`} color="#8b5cf6" />
            </div>

            <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100 shadow-sm">
              <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
                <AlertTriangle size={24} />
              </div>
              <div>
                <b className="block text-orange-900 text-base mb-1">ข้อค้นพบสำคัญ</b>
                <span className="text-orange-800 text-sm leading-relaxed">
                  ตำแหน่งที่มีอาการสูงสุดคือ <strong className="font-bold">{summary.highestBody.key}</strong> ({summary.highestBody.pct.toFixed(1)}%) ขณะที่คะแนนพฤติกรรมเฉลี่ยอยู่ที่ <strong className="font-bold">{summary.behaviorAvg.toFixed(2)}/5</strong> และคะแนนความรู้เฉลี่ย <strong className="font-bold">{summary.knowledgeAvg.toFixed(2)}/10</strong>
                </span>
              </div>
            </div>
          </>
        )}

        {(activeTab === 'overview' || activeTab === 'msds') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-8 pb-4 border-b border-slate-100">
                <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]"></span> 
                ความชุกอาการ MSDs ตามตำแหน่งร่างกาย (%)
              </h2>
              <BarList 
                data={summary.bodyParts} 
                maxValue={maxBody} 
                colorMapper={(item) => getSeverityColor(item.pct ?? item.value ?? item.score)}
              />
            </section>
            <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-8 pb-4 border-b border-slate-100">
                <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]"></span> 
                Body Map — แผนที่อาการ MSDs จำแนกตำแหน่งร่างกาย (n={summary.pre})
              </h2>
              <BodyMap parts={summary.bodyParts} />
            </section>
          </div>
        )}

        {activeTab === 'overview' && (
          <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-8 pb-4 border-b border-slate-100">
              <span className="w-3 h-3 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.6)]"></span> 
              ชั่วโมงใช้งานคอมพิวเตอร์ต่อวัน
            </h2>
            <BarList data={summary.workHours} maxValue={Math.max(...summary.workHours.map((item) => item.value), 1)} unit=" คน" compact />
          </section>
        )}

        {(activeTab === 'overview' || activeTab === 'knowledge') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-8 pb-4 border-b border-slate-100">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]"></span> 
                ความรู้รายข้อ (% ตอบถูก)
              </h2>
              <BarList data={summary.knowledgeItems} maxValue={100} />
            </section>
            <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
              <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-8 pb-4 border-b border-slate-100">
                <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]"></span> 
                พฤติกรรมรายข้อ (คะแนนเฉลี่ย)
              </h2>
              <BarList data={summary.behaviorItems} maxValue={5} unit="คะแนน" />
            </section>
          </div>
        )}

        {activeTab === 'departments' && (
          <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-8 pb-4 border-b border-slate-100">
              <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span> 
              จำนวนผู้ตอบตามหน่วยงาน
            </h2>
            <BarList data={departments} maxValue={maxDept} unit=" คน" />
          </section>
        )}

        {activeTab === 'analysis-tab' && analysisData && (
          <AnalysisView analysisData={analysisData} />
        )}

        {activeTab === 'gender-compare' && (
          <>
            {/* Comparison Key Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in zoom-in duration-300">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <Users size={60} />
                </div>
                <span className="text-xs font-semibold text-slate-400 block mb-2">จำนวนผู้ตอบแบบสอบถาม</span>
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-medium text-blue-500 mr-1">ชาย:</span>
                    <b className="text-2xl font-bold text-slate-800">{maleSummary.total} ราย</b>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-pink-500 mr-1">หญิง:</span>
                    <b className="text-2xl font-bold text-slate-800">{femaleSummary.total} ราย</b>
                  </div>
                </div>
                <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div style={{ width: `${(maleSummary.total / (rows.length || 1)) * 100}%` }} className="bg-blue-500 h-full"></div>
                  <div style={{ width: `${(femaleSummary.total / (rows.length || 1)) * 100}%` }} className="bg-pink-500 h-full"></div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <Brain size={60} />
                </div>
                <span className="text-xs font-semibold text-slate-400 block mb-2">คะแนนความรู้เฉลี่ย (เต็ม 10)</span>
                <div className="flex justify-between items-baseline mt-1">
                  <div>
                    <span className="text-xs font-medium text-blue-500 mr-1">ชาย:</span>
                    <b className="text-3xl font-black text-blue-600">{maleSummary.knowledgeAvg.toFixed(2)}</b>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-pink-500 mr-1">หญิง:</span>
                    <b className="text-3xl font-black text-pink-600">{femaleSummary.knowledgeAvg.toFixed(2)}</b>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                  {maleSummary.knowledgeAvg > femaleSummary.knowledgeAvg 
                    ? `เพศชายมีความรู้เฉลี่ยมากกว่า ${(maleSummary.knowledgeAvg - femaleSummary.knowledgeAvg).toFixed(2)} คะแนน`
                    : `เพศหญิงมีความรู้เฉลี่ยมากกว่า ${(femaleSummary.knowledgeAvg - maleSummary.knowledgeAvg).toFixed(2)} คะแนน`}
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <ClipboardList size={60} />
                </div>
                <span className="text-xs font-semibold text-slate-400 block mb-2">คะแนนพฤติกรรมเฉลี่ย (เต็ม 5)</span>
                <div className="flex justify-between items-baseline mt-1">
                  <div>
                    <span className="text-xs font-medium text-blue-500 mr-1">ชาย:</span>
                    <b className="text-3xl font-black text-blue-600">{maleSummary.behaviorAvg.toFixed(2)}</b>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-pink-500 mr-1">หญิง:</span>
                    <b className="text-3xl font-black text-pink-600">{femaleSummary.behaviorAvg.toFixed(2)}</b>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                  {maleSummary.behaviorAvg > femaleSummary.behaviorAvg 
                    ? `เพศชายพฤติกรรมดีกว่า ${(maleSummary.behaviorAvg - femaleSummary.behaviorAvg).toFixed(2)} คะแนน`
                    : `เพศหญิงพฤติกรรมดีกว่า ${(femaleSummary.behaviorAvg - maleSummary.behaviorAvg).toFixed(2)} คะแนน`}
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <Siren size={60} />
                </div>
                <span className="text-xs font-semibold text-slate-400 block mb-2">พบอาการ MSDs ใน 7 วัน (%)</span>
                <div className="flex justify-between items-baseline mt-1">
                  <div>
                    <span className="text-xs font-medium text-blue-500 mr-1">ชาย:</span>
                    <b className="text-3xl font-black text-blue-600">{maleSummary.currentMsdsPct.toFixed(1)}%</b>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-pink-500 mr-1">หญิง:</span>
                    <b className="text-3xl font-black text-pink-600">{femaleSummary.currentMsdsPct.toFixed(1)}%</b>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                  {Math.abs(maleSummary.currentMsdsPct - femaleSummary.currentMsdsPct).toFixed(1)}% คือผลต่างสัดส่วนอาการปวด
                </span>
              </div>
            </div>

            {/* Dual Body Map */}
            <div className="grid grid-cols-1 gap-8 animate-in fade-in duration-300">
              <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-8 pb-4 border-b border-slate-100">
                  <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span> 
                  แผนที่ร่างกายคู่จำแนกเพศ — เปรียบเทียบความชุกอาการปวด MSDs (n ชาย={maleSummary.pre}, หญิง={femaleSummary.pre})
                </h2>
                <DualBodyMap 
                  maleParts={maleSummary.bodyParts} 
                  femaleParts={femaleSummary.bodyParts} 
                  maleCount={maleSummary.pre}
                  femaleCount={femaleSummary.pre}
                />
              </section>
            </div>

            {/* Side-by-Side MSDs Bar Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
              <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-8 pb-4 border-b border-slate-100">
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] flex items-center justify-center text-[10px] text-white font-bold">♂</span> 
                  ความชุกอาการ MSDs เพศชาย (%)
                </h2>
                <BarList 
                  data={maleSummary.bodyParts} 
                  maxValue={maxMaleBody} 
                  colorMapper={(item) => getSeverityColor(item.pct ?? item.value ?? item.score)}
                />
              </section>
              <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-8 pb-4 border-b border-slate-100">
                  <span className="w-3.5 h-3.5 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)] flex items-center justify-center text-[10px] text-white font-bold">♀</span> 
                  ความชุกอาการ MSDs เพศหญิง (%)
                </h2>
                <BarList 
                  data={femaleSummary.bodyParts} 
                  maxValue={maxFemaleBody} 
                  colorMapper={(item) => getSeverityColor(item.pct ?? item.value ?? item.score)}
                />
              </section>
            </div>

            {/* Side-by-Side Knowledge and Behavior Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
              <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]"></span> 
                  ความรู้รายข้อเปรียบเทียบชาย-หญิง (% ตอบถูก)
                </h2>
                <div className="space-y-4">
                  {maleSummary.knowledgeItems.map((maleItem, idx) => {
                    const femaleItem = femaleSummary.knowledgeItems[idx];
                    return (
                      <div key={maleItem.key} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                        <div className="text-xs font-semibold text-slate-600 mb-2 truncate" title={maleItem.label}>
                          {maleItem.key}. {maleItem.label}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] font-bold text-blue-500 shrink-0">ชาย ♂</span>
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex-grow shadow-inner">
                              <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${maleItem.score}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-slate-700 w-10 text-right">{Math.round(maleItem.score)}%</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] font-bold text-pink-500 shrink-0">หญิง ♀</span>
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex-grow shadow-inner">
                              <div className="bg-pink-500 h-full rounded-full transition-all duration-1000" style={{ width: `${femaleItem.score}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-slate-700 w-10 text-right">{Math.round(femaleItem.score)}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]"></span> 
                  พฤติกรรมรายข้อเปรียบเทียบชาย-หญิง (คะแนนเฉลี่ย 1-5)
                </h2>
                <div className="space-y-4">
                  {maleSummary.behaviorItems.map((maleItem, idx) => {
                    const femaleItem = femaleSummary.behaviorItems[idx];
                    return (
                      <div key={maleItem.key} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                        <div className="text-xs font-semibold text-slate-600 mb-2 truncate" title={maleItem.label}>
                          {maleItem.key}. {maleItem.label}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] font-bold text-blue-500 shrink-0">ชาย ♂</span>
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex-grow shadow-inner">
                              <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(maleItem.score / 5) * 100}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-slate-700 w-10 text-right">{maleItem.score.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] font-bold text-pink-500 shrink-0">หญิง ♀</span>
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex-grow shadow-inner">
                              <div className="bg-pink-500 h-full rounded-full transition-all duration-1000" style={{ width: `${(femaleItem.score / 5) * 100}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-slate-700 w-10 text-right">{femaleItem.score.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </>
        )}

        {activeTab === 'overview' && (
          <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-8 pb-4 border-b border-slate-100">
              <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]"></span> 
              ข้อมูลรายแถวล่าสุดจาก Google Sheet
            </h2>
            <ResponseTable rows={rows} limit={12} onRowClick={setSelectedRow} />
          </section>
        )}

        {activeTab === 'responses' && (
          <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-100">
              <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800">
                <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span> 
                ข้อมูลรายแถวทั้งหมด ({rows.length.toLocaleString('th-TH')} รายการ)
              </h2>
            </div>
            <div className="bg-slate-50 text-slate-500 text-sm p-4 rounded-xl mb-6 flex items-start gap-3 border border-slate-100">
              <AlertTriangle className="text-slate-400 shrink-0 mt-0.5" size={18} />
              <p>แสดงตามข้อมูลที่ Google Sheets ส่งผ่านลิงก์ export แบบไม่ต้องลงชื่อเข้าใช้ ถ้าในชีตเปิด filter อยู่ จำนวนนี้อาจน้อยกว่าแถวทั้งหมดที่เห็นในหน้า Google Sheet</p>
            </div>
            <ResponseTable rows={rows} onRowClick={setSelectedRow} />
          </section>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
