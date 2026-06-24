import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getRosaLevel } from '../utils/helpers';

export function RosaSummaryDashboard({ validRows }) {
  const total = validRows.length;
  if (total === 0) return null;

  const counts = {
    'ปลอดภัย (1-2)': 0,
    'ควรตรวจสอบ (3-4)': 0,
    'ต้องแก้ไข (5-6)': 0,
    'เร่งด่วน (7-8)': 0,
  };

  const deptScores = {};

  validRows.forEach(row => {
    const s = Number(row['Matrix5']);
    if (!isNaN(s)) {
      const level = getRosaLevel(s).text;
      if (counts[level] !== undefined) {
        counts[level]++;
      }
      const dept = row['หน่วยงาน']?.replace(/^\d+\.\s*/, '') || 'ไม่ระบุ';
      if (!deptScores[dept]) deptScores[dept] = { sum: 0, count: 0 };
      deptScores[dept].sum += s;
      deptScores[dept].count++;
    }
  });

  const pieData = [
    { name: 'ปลอดภัย (1-2)', value: counts['ปลอดภัย (1-2)'], color: '#10B981' },
    { name: 'ควรตรวจสอบ (3-4)', value: counts['ควรตรวจสอบ (3-4)'], color: '#3B82F6' },
    { name: 'ต้องแก้ไข (5-6)', value: counts['ต้องแก้ไข (5-6)'], color: '#F97316' },
    { name: 'เร่งด่วน (7-8)', value: counts['เร่งด่วน (7-8)'], color: '#EF4444' },
  ];

  const simplifyDeptName = (name) => {
    let s = name;
    if (s.includes('(HA)')) return 'HA';
    if (s.includes('(IC)')) return 'IC';
    if (s.includes('ยุทธศาสตร์')) return 'ยุทธศาสตร์ฯ';
    s = s.replace('กลุ่มงาน', '');
    s = s.replace('งานด้าน', '');
    s = s.replace('ศูนย์', '');
    return s.trim();
  };

  const barData = Object.keys(deptScores).map(dept => ({
    name: simplifyDeptName(dept),
    score: Number((deptScores[dept].sum / deptScores[dept].count).toFixed(2))
  })).sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6 mb-8">
      {/* Top Banner */}
      <div className="bg-orange-50/80 border-l-4 border-orange-500 p-4 rounded-r-xl flex items-center gap-3">
        <AlertTriangle className="text-orange-700 shrink-0" size={24} />
        <p className="text-sm font-semibold text-orange-900">
          ROSA (Rapid Office Strain Assessment): คะแนน ≥ 5 = ต้องการการแก้ไข | คะแนน 7-8 = ต้องดำเนินการเร่งด่วน | ข้อมูลจากการประเมิน {total} คน
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pieData.map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full`} style={{ backgroundColor: item.color }}></div>
            <p className="text-xs font-semibold text-slate-500 mb-1">{item.name.split(' ')[0]} ({item.name.split(' ')[1]})</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-extrabold" style={{ color: item.color }}>{item.value}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">{((item.value / total) * 100).toFixed(0)}% ของผู้รับการประเมิน</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            การกระจายระดับความเสี่ยง ROSA (n={total})
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} คน`, 'จำนวน']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                {item.name}: {item.value} คน
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            คะแนน ROSA จำแนกตามหน่วยงาน
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  height={30}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  domain={[0, 8]}
                  label={{ value: 'คะแนน ROSA เฉลี่ย', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12, offset: -5 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#4b5563', borderRadius: '8px', border: 'none', color: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value) => [`${value}`, 'คะแนน ROSA เฉลี่ย']}
                />
                <Bar dataKey="score" name="คะแนน ROSA เฉลี่ย" radius={[4, 4, 0, 0]} barSize={48}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score >= 5 ? '#F97316' : '#3B82F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
