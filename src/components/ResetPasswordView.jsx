import React, { useState } from 'react';
import api from '../services/api';

export function ResetPasswordView({ token, onResetSuccess }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      setLoading(false);
      return;
    }

    try {
      const data = await api.post('/reset-password', { token, new_password: password });
      setSuccess(data.message || 'รีเซ็ตรหัสผ่านสำเร็จ');
      setTimeout(() => {
        onResetSuccess();
      }, 3000);
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4">
      <section className="w-full max-w-md bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">ตั้งรหัสผ่านใหม่</h2>
        {error && (
          <div className="p-3 rounded-xl mb-4 text-sm font-medium bg-rose-50 text-rose-600">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 rounded-xl mb-4 text-sm font-medium bg-emerald-50 text-emerald-600">
            {success} (กำลังกลับหน้าหลัก...)
          </div>
        )}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">รหัสผ่านใหม่</label>
              <input type="password" placeholder="ตั้งรหัสผ่านใหม่" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">ยืนยันรหัสผ่านใหม่</label>
              <input type="password" placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
            </div>
            <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50 mt-4">
              {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
