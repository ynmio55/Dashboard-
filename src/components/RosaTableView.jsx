import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { RosaSummaryDashboard } from './RosaSummaryDashboard';
import { getRosaLevel } from '../utils/helpers';

export function RosaTableView({ rows, user, onGoToLogin }) {
  const validRows = rows.filter(row => row['ชื่อ-สกุล']?.trim() && row['Matrix5']?.trim());

  return (
    <div className="space-y-8">
      <RosaSummaryDashboard validRows={validRows} />
      {user ? (
        <section className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-100">
          <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800">
          <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span> 
          ข้อมูลการวิเคราะห์ระดับอาการ (ROSA)
        </h2>
      </div>
      <div className="overflow-auto max-h-[600px] border border-slate-200 rounded-xl shadow-sm bg-white">
        <table className="w-full min-w-[800px] text-sm text-left">
          <thead className="text-xs text-slate-600 uppercase bg-slate-50 sticky top-0 z-10 backdrop-blur-md bg-white/90">
            <tr>
              <th className="px-6 py-4 font-semibold w-16">ลำดับที่</th>
              <th className="px-6 py-4 font-semibold">ชื่อ-สกุล</th>
              <th className="px-6 py-4 font-semibold">หน่วยงาน</th>
              <th className="px-6 py-4 font-semibold text-center">คะแนน ROSA (Matrix5)</th>
              <th className="px-6 py-4 font-semibold text-center">ระดับ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {validRows.map((row, idx) => {
              const level = getRosaLevel(row['Matrix5']);
              return (
                <tr key={idx} className="hover:bg-sky-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{idx + 1}</td>
                  <td className="px-6 py-4 text-slate-600">{row['ชื่อ-สกุล'] || '-'}</td>
                  <td className="px-6 py-4 text-slate-600">{row['หน่วยงาน']?.replace(/^\d+\.\s*/, '') || '-'}</td>
                  <td className="px-6 py-4 font-bold text-slate-700 text-center">
                    {row['Matrix5'] || '-'}
                  </td>
                  <td className="px-6 py-4 font-bold text-center">
                    <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold ${level.bg} ${level.textCol}`}>
                      {level.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mt-8 animate-in fade-in zoom-in duration-300">
          <div className="flex justify-center mb-6">
             <span className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 shadow-inner">
               <AlertTriangle size={40} />
             </span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">ข้อมูลถูกจำกัดการเข้าถึง</h3>
          <p className="text-slate-500 font-medium">กรุณาเข้าสู่ระบบจากเมนูด้านบน เพื่อดูข้อมูลการวิเคราะห์ระดับอาการ (ROSA)</p>
        </div>
      )}
    </div>
  );
}
