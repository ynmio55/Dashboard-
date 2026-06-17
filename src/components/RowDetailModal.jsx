import React from 'react';
import { X } from 'lucide-react';

export function RowDetailModal({ row, onClose }) {
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
