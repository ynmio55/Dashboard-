import React from 'react';

export function ResponseTable({ rows, limit, onRowClick }) {
  const visibleRows = [...rows].reverse().slice(0, limit || rows.length);

  return (
    <div className="overflow-auto max-h-[500px] border border-slate-200 rounded-xl shadow-sm bg-white">
      <table className="w-full min-w-[1000px] text-base text-left">
        <thead className="text-sm text-slate-600 uppercase bg-slate-50 sticky top-0 z-10 backdrop-blur-md bg-white/90">
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
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold ${
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
