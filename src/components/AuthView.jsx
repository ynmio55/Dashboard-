import React, { useState } from 'react';

export function AuthView({ onLoginSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    username: '', password: '', employee_id: '', first_name: '', last_name: '', position_name: '', role: 'user', work_group: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isLoginMode ? '/api/login' : '/api/register';
      const res = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด');
      
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
        {isLoginMode ? 'เข้าสู่ระบบเพื่อดูข้อมูล' : 'ลงทะเบียนบัญชีใหม่'}
      </h2>
      {error && (
        <div className={`p-3 rounded-xl mb-4 text-sm font-medium ${error.includes('สำเร็จ') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Username</label>
          <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Password</label>
          <input type="password" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
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
                <label className="block text-xs font-semibold text-slate-500 mb-1">กลุ่มงาน</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" value={formData.work_group} onChange={e => setFormData({...formData, work_group: e.target.value})} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">แผนก</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" value={formData.position_name} onChange={e => setFormData({...formData, position_name: e.target.value})} required />
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
        <button onClick={() => {setIsLoginMode(!isLoginMode); setError('');}} className="font-bold text-blue-600 hover:underline">
          {isLoginMode ? 'ลงทะเบียน' : 'เข้าสู่ระบบ'}
        </button>
      </div>
    </section>
  );
}
