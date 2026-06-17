import React, { useState } from 'react';
import { Brain, ClipboardList, MonitorCog } from 'lucide-react';
import { SeverityDistributionBar } from './SeverityDistributionBar';

export function AnalysisView({ analysisData }) {
  const [selectedPartIndex, setSelectedPartIndex] = useState(0);
  const selectedPart = analysisData.bodyParts[selectedPartIndex] || null;
  const totalN = selectedPart ? selectedPart.severityCounts.reduce((a, b) => a + b, 0) : 170;

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <Brain size={20} />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-500">ความรู้เฉลี่ยโครงการ (Pre-test)</span>
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

        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <ClipboardList size={20} />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-500">พฤติกรรมเฉลี่ยโครงการ (Pre-test)</span>
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

        <div className="bg-gradient-to-r from-indigo-900 to-slate-800 p-4 sm:p-6 rounded-2xl text-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden">
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
      <section className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <div className="pb-4 border-b border-slate-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
              <span className="w-3 h-3 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]"></span>
              การแจกแจงระดับสัดส่วนอาการปวดจำนวน {totalN} คน
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
