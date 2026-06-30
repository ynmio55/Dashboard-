import React, { useState, useEffect } from 'react';
import { UserCog, Trash2, Edit2, Check, X } from 'lucide-react';
import api from '../services/api';

export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for handling role editing
  const [editingId, setEditingId] = useState(null);
  const [editingRole, setEditingRole] = useState('');
  
  // State for handling delete confirmation
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/users');
      setUsers(data.users || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    } finally {
      setLoading(false);
    }
  };

  const startEditingRole = (user) => {
    setEditingId(user.user_id);
    setEditingRole(user.role || 'user');
  };

  const cancelEditingRole = () => {
    setEditingId(null);
    setEditingRole('');
  };

  const saveRole = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: editingRole });
      
      // Update local state to reflect change immediately
      setUsers(users.map(u => u.user_id === userId ? { ...u, role: editingRole } : u));
      setEditingId(null);
      setEditingRole('');
    } catch (err) {
      alert(`เปลี่ยนสิทธิ์ไม่สำเร็จ: ${err.message}`);
    }
  };

  const confirmDelete = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      
      // Remove from local state
      setUsers(users.filter(u => u.user_id !== userId));
      setDeletingId(null);
    } catch (err) {
      alert(`ลบผู้ใช้ไม่สำเร็จ: ${err.message}`);
      setDeletingId(null);
    }
  };

  const toggleApproval = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}/approve`, { is_approved: !currentStatus });
      setUsers(users.map(u => u.user_id === userId ? { ...u, is_approved: !currentStatus } : u));
    } catch (err) {
      alert(`เปลี่ยนสถานะการอนุมัติไม่สำเร็จ: ${err.message}`);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-500">กำลังโหลดข้อมูลผู้ใช้...</span>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center gap-3 text-2xl font-extrabold text-slate-800">
            <UserCog size={28} className="text-blue-500" />
            ระบบจัดการผู้ใช้
          </h2>
          <button 
            onClick={fetchUsers}
            className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            รีเฟรช
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="py-4 px-4 font-bold text-slate-500 text-sm">รหัสผู้ใช้</th>
                <th className="py-4 px-4 font-bold text-slate-500 text-sm">ชื่อผู้ใช้งาน (Username)</th>
                <th className="py-4 px-4 font-bold text-slate-500 text-sm">ชื่อ-นามสกุล</th>
                <th className="py-4 px-4 font-bold text-slate-500 text-sm">สิทธิ์ (Role)</th>
                <th className="py-4 px-4 font-bold text-slate-500 text-sm">สถานะ</th>
                <th className="py-4 px-4 font-bold text-slate-500 text-sm text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((u) => (
                <tr key={u.user_id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4 text-slate-700">{u.user_id}</td>
                  <td className="py-4 px-4 text-slate-800 font-medium">{u.username}</td>
                  <td className="py-4 px-4 text-slate-600">
                    {u.first_name || u.last_name ? `${u.first_name || ''} ${u.last_name || ''}` : '-'}
                  </td>
                  
                  {/* Role Column */}
                  <td className="py-4 px-4">
                    {editingId === u.user_id ? (
                      <select 
                        value={editingRole}
                        onChange={(e) => setEditingRole(e.target.value)}
                        className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        u.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {u.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    )}
                  </td>
                  
                  {/* Status Column */}
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      u.is_approved 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {u.is_approved ? 'ใช้งานได้' : 'รออนุมัติ'}
                    </span>
                  </td>
                  
                  {/* Actions Column */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* Editing Actions */}
                      {editingId === u.user_id ? (
                        <>
                          <button 
                            onClick={() => saveRole(u.user_id)}
                            className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                            title="บันทึก"
                          >
                            <Check size={16} />
                          </button>
                          <button 
                            onClick={cancelEditingRole}
                            className="p-1.5 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            title="ยกเลิก"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => startEditingRole(u)}
                          className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          title="เปลี่ยนสิทธิ์"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}

                      <div className="w-px h-5 bg-slate-200 mx-1"></div>

                      {/* Approval Action */}
                      <button 
                        onClick={() => toggleApproval(u.user_id, u.is_approved)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          u.is_approved 
                            ? 'text-orange-500 bg-orange-50 hover:bg-orange-100' 
                            : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                        title={u.is_approved ? "ระงับสิทธิ์" : "อนุมัติบัญชี"}
                      >
                        {u.is_approved ? <X size={16} /> : <Check size={16} />}
                      </button>

                      {/* Deleting Actions */}
                      <div className="w-px h-5 bg-slate-200 mx-1"></div>
                      
                      {deletingId === u.user_id ? (
                        <div className="flex items-center gap-2 bg-red-50 p-1 rounded-lg border border-red-100">
                          <span className="text-xs text-red-600 font-bold px-1">ลบแน่ใจไหม?</span>
                          <button 
                            onClick={() => confirmDelete(u.user_id)}
                            className="p-1.5 text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                          >
                            <Check size={14} />
                          </button>
                          <button 
                            onClick={() => setDeletingId(null)}
                            className="p-1.5 text-slate-500 bg-white hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setDeletingId(u.user_id)}
                          className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          title="ลบผู้ใช้"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">
                    ไม่พบข้อมูลผู้ใช้ในระบบ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
