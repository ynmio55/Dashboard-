import { BODY_PARTS } from '../constants';

export function parseCsv(text) {
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

export function toNumber(value) {
  if (value == null) return 0;
  const clean = String(value).replace('%', '').trim();
  const numeric = Number(clean);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function parseAnalysisSheet(csvText) {
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

export function avg(values) {
  const nums = values.map(toNumber).filter((n) => Number.isFinite(n));
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

export function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    const label = row[key]?.trim() || 'ไม่ระบุ';
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
}

export function shortQuestion(header) {
  const match = header.match(/\[(.+?)\]/);
  return match ? match[1] : header;
}

export function analyze(rows) {
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

export function rowsFromCsv(csv) {
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

export function getSeverityColor(pct) {
  if (pct >= 85) return '#be123c'; // dark red
  if (pct >= 75) return '#ef4444'; // red
  if (pct >= 50) return '#f59e0b'; // amber/orange
  return '#d97706'; // light brown
}

export function getRosaLevel(score) {
  const s = Number(score);
  if (isNaN(s)) return { text: '-', bg: 'bg-slate-100', textCol: 'text-slate-800', colorCode: '#94a3b8' };
  if (s >= 7) return { text: 'เร่งด่วน (7-8)', bg: 'bg-rose-50', textCol: 'text-rose-700', colorCode: '#EF4444' };
  if (s >= 5) return { text: 'ต้องแก้ไข (5-6)', bg: 'bg-orange-50', textCol: 'text-orange-700', colorCode: '#F97316' };
  if (s >= 3) return { text: 'ควรตรวจสอบ (3-4)', bg: 'bg-blue-50', textCol: 'text-blue-700', colorCode: '#3B82F6' };
  return { text: 'ปลอดภัย (1-2)', bg: 'bg-emerald-50', textCol: 'text-emerald-700', colorCode: '#10B981' };
}
