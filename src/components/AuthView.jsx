import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import api from '../services/api';

export function AuthView({ onLoginSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [formData, setFormData] = useState({
    username: '', password: '', email: '', first_name: '', last_name: '', position_name: '', role: 'user', work_group: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isForgotPasswordMode) {
      try {
        const data = await api.post('/forgot-password', { email: resetEmail });
        setError(data.message || 'ระบบได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว');
      } catch (err) {
        setError(err.message || 'เกิดข้อผิดพลาดในการขอรีเซ็ตรหัสผ่าน');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!isLoginMode) {
      if (formData.password.length < 8) {
        setError('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
        setLoading(false);
        return;
      }
      if (!/[A-Z]/.test(formData.password)) {
        setError('รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว');
        setLoading(false);
        return;
      }
      if (!/[0-9]/.test(formData.password)) {
        setError('รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว');
        setLoading(false);
        return;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
        setError('รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว');
        setLoading(false);
        return;
      }
    }
    try {
      const endpoint = isLoginMode ? '/login' : '/register';
      const data = await api.post(endpoint, formData);
      
      if (isLoginMode) {
        localStorage.setItem('token', data.token);
        onLoginSuccess(data.user);
      } else {
        setIsLoginMode(true);
        setError('ลงทะเบียนสำเร็จ กรุณาเข้าสู่ระบบ');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
        {isForgotPasswordMode ? 'ลืมรหัสผ่าน' : (isLoginMode ? 'เข้าสู่ระบบเพื่อดูข้อมูล' : 'ลงทะเบียนบัญชีใหม่')}
      </h2>
      {error && (
        <div className={`p-3 rounded-xl mb-4 text-sm font-medium ${(error.includes('สำเร็จ') || error.includes('ส่งลิงก์') || error.includes('ส่งไป')) ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {error}
        </div>
      )}
      {isForgotPasswordMode ? (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
              <input type="email" placeholder="ระบุอีเมลของคุณ" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required />
            </div>
            <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50 mt-4">
              {loading ? 'กำลังดำเนินการ...' : 'ขอลิงก์รีเซ็ตรหัสผ่าน'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-500">
            <button onClick={() => {setIsForgotPasswordMode(false); setError('');}} className="font-bold text-blue-600 hover:underline" type="button">
              กลับไปหน้าเข้าสู่ระบบ
            </button>
          </div>
        </>
      ) : (
      <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Username</label>
          <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
        </div>
        {!isLoginMode && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
            <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Password</label>
          <input type="password" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
          {isLoginMode && (
            <div className="text-right mt-1">
              <button type="button" onClick={() => {setIsForgotPasswordMode(true); setError('');}} className="text-xs font-semibold text-blue-600 hover:underline">
                ลืมรหัสผ่าน?
              </button>
            </div>
          )}
          {!isLoginMode && (
            <div className="mt-2 ml-1 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-medium">
                {formData.password.length >= 8 ? (
                  <Check size={14} className="text-emerald-500" />
                ) : (
                  <X size={14} className="text-rose-500" />
                )}
                <span className={formData.password.length >= 8 ? 'text-emerald-600' : 'text-slate-500'}>
                  มีความยาวอย่างน้อย 8 ตัวอักษร
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium">
                {/[A-Z]/.test(formData.password) ? (
                  <Check size={14} className="text-emerald-500" />
                ) : (
                  <X size={14} className="text-rose-500" />
                )}
                <span className={/[A-Z]/.test(formData.password) ? 'text-emerald-600' : 'text-slate-500'}>
                  มีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium">
                {/[0-9]/.test(formData.password) ? (
                  <Check size={14} className="text-emerald-500" />
                ) : (
                  <X size={14} className="text-rose-500" />
                )}
                <span className={/[0-9]/.test(formData.password) ? 'text-emerald-600' : 'text-slate-500'}>
                  มีตัวเลขอย่างน้อย 1 ตัว
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium">
                {/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? (
                  <Check size={14} className="text-emerald-500" />
                ) : (
                  <X size={14} className="text-rose-500" />
                )}
                <span className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-emerald-600' : 'text-slate-500'}>
                  มีอักขระพิเศษอย่างน้อย 1 ตัว
                </span>
              </div>
            </div>
          )}
        </div>
        {!isLoginMode && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">ชื่อ</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">นามสกุล</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">ตำแหน่ง</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" value={formData.position_name} onChange={e => setFormData({...formData, position_name: e.target.value})} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">กลุ่มงาน</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" value={formData.work_group} onChange={e => setFormData({...formData, work_group: e.target.value})} required />
              </div>
            </div>
          </>
        )}
        <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50">
          {loading ? 'กำลังดำเนินการ...' : (isLoginMode ? 'เข้าสู่ระบบ' : 'ลงทะเบียน')}
        </button>
      </form>
      <div className="mt-6 text-center text-sm text-slate-500">
        {isLoginMode ? 'ยังไม่มีบัญชี? ' : 'มีบัญชีแล้ว? '}
        <button type="button" onClick={() => {setIsLoginMode(!isLoginMode); setError('');}} className="font-bold text-blue-600 hover:underline">
          {isLoginMode ? 'ลงทะเบียน' : 'เข้าสู่ระบบ'}
        </button>
      </div>
      </>
      )}
    </section>
  );
}
