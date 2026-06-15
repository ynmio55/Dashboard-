import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertTriangle,
  BarChart3,
  Brain,
  Building2,
  ClipboardList,
  Download,
  Home,
  MonitorCog,
  RefreshCw,
  Siren,
  Users,
} from 'lucide-react';
import './styles.css';

const CSV_URL =
  'https://docs.google.com/spreadsheets/d/1YsO7jR_0Z_xBef-03ACPYlIJ8Pb47FtdNds0ObrRhoE/gviz/tq?tqx=out:csv&gid=1870394303';

const ROSA_BASELINE = {
  total: 25,
  needsFix: 19,
  levels: [
    { label: 'ต่ำ', value: 1, color: '#16885a' },
    { label: 'ปานกลาง', value: 5, color: '#1f7af0' },
    { label: 'สูง', value: 17, color: '#ff7a1a' },
    { label: 'สูงมาก', value: 2, color: '#df324b' },
  ],
};

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
  });

  const behaviorItems = Array.from({ length: 10 }, (_, i) => {
    const key = `Be${i + 1}`;
    const sourceHeader = rows[0]?.__headers?.[89 + i] || key;
    const score = avg(behaviorRows.map((row) => row[key]));
    return { key, label: shortQuestion(sourceHeader), score };
  });

  const departments = Object.entries(countBy(rows, 'หน่วยงานที่สังกัด  '))
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const workHours = Object.entries(countBy(rows, 'ระยะเวลาที่ใช้คอมพิวเตอร์โดยเฉลี่ยต่อวัน  '))
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const highestBody = bodyParts[0] || { key: '-', pct: 0 };
  const knowledgeAvg = avg(knowledgeRows.map((row) => row.Kรวม));
  const behaviorAvg = avg(behaviorRows.map((row) => row.Beเฉลี่ย));
  const currentMsds = rows.filter((row) => row['ในระยะเวลา 7 วันที่ผ่านมา ท่านเคยมีอาการ ปวด/ชา/เมื่อยล้า ตามส่วนของร่างกายข้างต้น ที่เกิดจากการทำงานหรือไม่'] === 'เคย').length;

  return {
    total: rows.length,
    pre: pre.length,
    post: post.length,
    knowledgeAvg,
    behaviorAvg,
    bodyParts,
    departments,
    workHours,
    knowledgeItems,
    behaviorItems,
    currentMsdsPct: rows.length ? (currentMsds / rows.length) * 100 : 0,
    highestBody,
    rosaNeedsFixPct: (ROSA_BASELINE.needsFix / ROSA_BASELINE.total) * 100,
  };
}

function rowsFromCsv(csv) {
  const [headers, ...records] = parseCsv(csv);
  return records
    .filter((record) => record.some((cell) => cell.trim() !== ''))
    .map((record) => {
      const row = { __headers: headers };
      headers.forEach((header, index) => {
        row[header] = record[index] || '';
      });
      return row;
    });
}

function MetricCard({ icon: Icon, title, value, sub, color }) {
  return (
    <section className="metric-card" style={{ '--accent': color }}>
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
        <span>{sub}</span>
      </div>
      <Icon size={38} strokeWidth={1.7} />
    </section>
  );
}

function BarList({ data, maxValue, unit = '%', compact = false }) {
  return (
    <div className={compact ? 'bar-list compact' : 'bar-list'}>
      {data.map((item, index) => {
        const value = item.pct ?? item.value ?? item.score;
        const width = maxValue ? (value / maxValue) * 100 : 0;
        return (
          <div className="bar-row" key={item.label || item.key}>
            <span>{item.label || item.key}</span>
            <div className="bar-track">
              <div className={`bar-fill tone-${index}`} style={{ width: `${Math.max(width, 4)}%` }} />
            </div>
            <b>{unit === 'คะแนน' ? value.toFixed(1) : `${Math.round(value)}${unit}`}</b>
          </div>
        );
      })}
    </div>
  );
}

function Donut({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let start = 0;
  const stops = data.map((item) => {
    const angle = total ? (item.value / total) * 360 : 0;
    const segment = `${item.color} ${start}deg ${start + angle}deg`;
    start += angle;
    return segment;
  });

  return (
    <div className="donut-wrap">
      <div className="donut" style={{ background: `conic-gradient(${stops.join(', ')})` }}>
        <div>
          <strong>{total}</strong>
          <span>คน</span>
        </div>
      </div>
      <div className="legend">
        {data.map((item) => (
          <span key={item.label}>
            <i style={{ background: item.color }} />
            {item.label} {item.value}
          </span>
        ))}
      </div>
    </div>
  );
}

function BodyMap({ parts }) {
  const selected = parts[0];
  const byKey = Object.fromEntries(parts.map((part) => [part.key, part]));
  const colorFor = (part) => {
    if (!part) return '#dbe5ee';
    if (part.pct >= 85) return '#d83a50';
    if (part.pct >= 75) return '#eb6876';
    if (part.pct >= 50) return '#f5be42';
    return '#d4ad65';
  };

  return (
    <div className="body-map-grid">
      <svg viewBox="0 0 100 132" className="body-svg" role="img" aria-label="Body map">
        <ellipse cx="50" cy="14" rx="12" ry="16" fill="#dfe8ef" stroke="#8aa1b3" />
        <rect x="45" y="28" width="10" height="14" rx="5" fill={colorFor(byKey.คอ)} stroke="#a54555" />
        <rect x="24" y="25" width="52" height="15" rx="10" fill={colorFor(byKey.ไหล่)} stroke="#9a3044" />
        <rect x="33" y="22" width="9" height="33" rx="5" fill="#dfe8ef" stroke="#8aa1b3" />
        <rect x="59" y="22" width="9" height="33" rx="5" fill="#dfe8ef" stroke="#8aa1b3" />
        <rect x="35" y="34" width="30" height="54" rx="18" fill="#dbe6ef" stroke="#8aa1b3" />
        {BODY_PARTS.map((part) => (
          <rect
            key={part.key}
            x={part.x}
            y={part.y}
            width={part.w}
            height={part.h}
            rx={part.rx}
            fill={colorFor(byKey[part.key])}
            stroke="#b28428"
            className="body-part"
          />
        ))}
      </svg>
      <div className="body-detail">
        <strong>{selected?.key || '-'}</strong>
        <span>ตำแหน่งที่พบสูงสุด</span>
        <b>{selected ? `${selected.pct.toFixed(1)}%` : '-'}</b>
        <p>{selected ? `${selected.hit} จากกลุ่ม Pre-test ${Math.round(selected.pct)}% มีคะแนนอาการมากกว่า 0` : 'ไม่มีข้อมูล'}</p>
      </div>
    </div>
  );
}

function App() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('กำลังโหลดข้อมูลจาก Google Sheets...');
  const [activeTab, setActiveTab] = useState('overview');

  async function loadData() {
    setStatus('กำลังโหลดข้อมูลจาก Google Sheets...');
    try {
      const response = await fetch(CSV_URL);
      const text = await response.text();
      setRows(rowsFromCsv(text));
      setStatus(`อัปเดตล่าสุดจากชีต: ${new Date().toLocaleString('th-TH')}`);
    } catch (error) {
      setStatus(`โหลดข้อมูลไม่สำเร็จ: ${error.message}`);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const summary = useMemo(() => analyze(rows), [rows]);
  const maxBody = Math.max(...summary.bodyParts.map((item) => item.pct), 1);
  const maxDept = Math.max(...summary.departments.map((item) => item.value), 1);

  return (
    <main>
      <header className="hero">
        <div className="hero-icon">
          <MonitorCog />
        </div>
        <div>
          <h1>Dashboard การยศาสตร์ในบุคลากรที่ปฏิบัติงานกับคอมพิวเตอร์</h1>
          <p>กลุ่มงานอาชีวเวชกรรม โรงพยาบาลสกลนคร | ปีงบประมาณ 2569</p>
        </div>
        <div className="hero-meta">
          <span>
            <ClipboardList size={16} /> ระยะ: Pre-test / Post-test
          </span>
          <small>{status}</small>
        </div>
      </header>

      <nav className="tabs">
        {[
          ['overview', Home, 'ภาพรวม'],
          ['msds', Siren, 'MSDs อาการปวด'],
          ['rosa', BarChart3, 'ROSA ความเสี่ยง'],
          ['knowledge', Brain, 'ความรู้ & พฤติกรรม'],
          ['departments', Building2, 'รายหน่วยงาน'],
        ].map(([id, Icon, label]) => (
          <button className={activeTab === id ? 'active' : ''} key={id} onClick={() => setActiveTab(id)}>
            <Icon size={17} />
            {label}
          </button>
        ))}
        <button className="refresh" onClick={loadData}>
          <RefreshCw size={17} />
          รีเฟรช
        </button>
        <a className="refresh" href={CSV_URL}>
          <Download size={17} />
          CSV
        </a>
      </nav>

      <section className="page">
        <div className="metrics">
          <MetricCard icon={Users} title="ผู้ตอบแบบสอบถาม" value={summary.total.toLocaleString('th-TH')} sub={`Pre-test ${summary.pre} + Post ${summary.post}`} color="#1877f2" />
          <MetricCard icon={BarChart3} title="ประเมิน ROSA" value={ROSA_BASELINE.total} sub="คน (จาก baseline ในภาพ)" color="#12b6d6" />
          <MetricCard icon={Brain} title="คะแนนความรู้" value={`${summary.knowledgeAvg.toFixed(2)}/10`} sub="ค่าเฉลี่ยจาก Kรวม" color="#11865d" />
          <MetricCard icon={ClipboardList} title="คะแนนพฤติกรรม" value={`${summary.behaviorAvg.toFixed(2)}/5`} sub="ค่าเฉลี่ยจาก Beเฉลี่ย" color="#f97316" />
          <MetricCard icon={Siren} title="มีอาการ MSDs 7 วัน" value={`${summary.currentMsdsPct.toFixed(1)}%`} sub="จากคำถามอาการใน 7 วันที่ผ่านมา" color="#dc3545" />
          <MetricCard icon={AlertTriangle} title="ROSA ≥5" value={`${summary.rosaNeedsFixPct.toFixed(0)}%`} sub={`${ROSA_BASELINE.needsFix} จาก ${ROSA_BASELINE.total} คน`} color="#6f42c1" />
        </div>

        <div className="insight">
          <AlertTriangle />
          <b>ข้อค้นพบสำคัญ:</b>
          <span>
            ตำแหน่งที่มีอาการสูงสุดคือ {summary.highestBody.key} ({summary.highestBody.pct.toFixed(1)}%) ขณะที่คะแนนพฤติกรรมเฉลี่ยอยู่ที่ {summary.behaviorAvg.toFixed(2)}/5 และคะแนนความรู้เฉลี่ย {summary.knowledgeAvg.toFixed(2)}/10
          </span>
        </div>

        {(activeTab === 'overview' || activeTab === 'msds') && (
          <div className="grid two">
            <section className="panel">
              <h2>
                <i className="dot red" /> ความชุกอาการ MSDs ตามตำแหน่งร่างกาย (%)
              </h2>
              <BarList data={summary.bodyParts} maxValue={maxBody} />
            </section>
            <section className="panel">
              <h2>
                <i className="dot purple" /> Body Map - แผนที่อาการ MSDs จำแนกตำแหน่งร่างกาย
              </h2>
              <BodyMap parts={summary.bodyParts} />
            </section>
          </div>
        )}

        {(activeTab === 'overview' || activeTab === 'rosa') && (
          <div className="grid two">
            <section className="panel">
              <h2>
                <i className="dot purple" /> ระดับความเสี่ยง ROSA (n={ROSA_BASELINE.total})
              </h2>
              <Donut data={ROSA_BASELINE.levels} />
            </section>
            <section className="panel">
              <h2>
                <i className="dot cyan" /> ชั่วโมงใช้งานคอมพิวเตอร์ต่อวัน
              </h2>
              <BarList data={summary.workHours} maxValue={Math.max(...summary.workHours.map((item) => item.value), 1)} unit=" คน" compact />
            </section>
          </div>
        )}

        {(activeTab === 'overview' || activeTab === 'knowledge') && (
          <div className="grid two">
            <section className="panel">
              <h2>
                <i className="dot green" /> ความรู้รายข้อ (% ตอบถูก)
              </h2>
              <BarList data={summary.knowledgeItems} maxValue={100} />
            </section>
            <section className="panel">
              <h2>
                <i className="dot orange" /> พฤติกรรมรายข้อ (คะแนนเฉลี่ย)
              </h2>
              <BarList data={summary.behaviorItems} maxValue={5} unit="คะแนน" />
            </section>
          </div>
        )}

        {activeTab === 'departments' && (
          <section className="panel">
            <h2>
              <i className="dot blue" /> จำนวนผู้ตอบตามหน่วยงาน
            </h2>
            <BarList data={summary.departments} maxValue={maxDept} unit=" คน" />
          </section>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
