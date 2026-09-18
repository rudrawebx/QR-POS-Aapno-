'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  UserCog,
  Plus,
  Shield,
  KeyRound,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  User,
  Trash2,
  Edit2,
  Lock,
  X,
} from 'lucide-react';

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('WAITER');
  const [newPin, setNewPin] = useState('1234');
  const [newPassword, setNewPassword] = useState('staff123');

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/staff');
      const data = await res.json();
      if (data.staff) setStaff(data.staff);
    } catch (err) {
      console.error('Error loading staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        const res = await fetch('/api/staff', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingStaff.id,
            name: newName,
            phone: newPhone,
            role: newRole,
            pinCode: newPin,
            password: newPassword || undefined,
          }),
        });
        if (res.ok) {
          setIsAddModalOpen(false);
          setEditingStaff(null);
          fetchStaff();
        }
      } else {
        const res = await fetch('/api/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newName,
            email: newEmail,
            phone: newPhone,
            role: newRole,
            pinCode: newPin,
            password: newPassword,
          }),
        });

        if (res.ok) {
          setIsAddModalOpen(false);
          setNewName('');
          setNewEmail('');
          setNewPhone('');
          fetchStaff();
        }
      }
    } catch (err) {
      console.error('Error creating/updating staff:', err);
    }
  };

  const handleOpenEdit = (st: any) => {
    setEditingStaff(st);
    setNewName(st.name);
    setNewEmail(st.email);
    setNewPhone(st.phone || '');
    setNewRole(st.role);
    setNewPin(st.pinCode || '1234');
    setNewPassword('');
    setIsAddModalOpen(true);
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove staff member "${name}"?`)) return;
    try {
      const res = await fetch(`/api/staff?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchStaff();
      }
    } catch (err) {
      console.error('Error deleting staff:', err);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-[#AA1B2A]/10 text-[#AA1B2A] border-[#AA1B2A]/30';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CASHIER':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'KITCHEN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'WAITER':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ACCOUNTANT':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-7xl mx-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-[#FEFBF5] pt-0 pb-1">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-[#E8E1D6] shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#AA1B2A]/10 border border-[#AA1B2A]/20 flex items-center justify-center text-[#AA1B2A]">
                <UserCog className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-black text-sm text-[#331E17]">Staff &amp; Role-Based Access Control</h1>
                <p className="text-xs text-[#745E55]">
                  {staff.length} staff accounts • Instant 4-digit PIN login &amp; operational roles
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setEditingStaff(null);
                setNewName('');
                setNewEmail('');
                setNewPhone('');
                setNewRole('WAITER');
                setNewPin('1234');
                setNewPassword('staff123');
                setIsAddModalOpen(true);
              }}
              className="bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-[#FEFBF5] border border-[#E09D3D] px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#E09D3D]" />
              <span>Add Staff Member</span>
            </button>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-3xl border border-[#E8E1D6] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#F7F2EA] border-b border-[#E8E1D6] text-[#745E55] font-black uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Staff Member</th>
                  <th className="py-3.5 px-4">Assigned Role</th>
                  <th className="py-3.5 px-4">Contact Phone</th>
                  <th className="py-3.5 px-4">Quick POS PIN</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-[#331E17]">{st.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{st.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${getRoleBadge(
                          st.role
                        )}`}
                      >
                        {st.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#745E55]">{st.phone || '—'}</td>
                    <td className="py-3 px-4 font-mono font-black text-[#AA1B2A]">
                      PIN: {st.pinCode || '****'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Active</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="p-1.5 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Staff"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(st.id, st.name)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Staff"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add / Edit Staff Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#E8E1D6] animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-sm text-[#331E17]">
                  {editingStaff ? 'Edit Staff Account' : 'Add Staff Account'}
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email (Login ID)</label>
                  <input
                    type="email"
                    required
                    disabled={Boolean(editingStaff)}
                    placeholder="ramesh@aapnokhano.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 99962 13962"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Assigned Role</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="WAITER">Waiter / Captain</option>
                      <option value="CASHIER">Cashier / Billing</option>
                      <option value="KITCHEN">Kitchen Chef</option>
                      <option value="MANAGER">Restaurant Manager</option>
                      <option value="OWNER">Restaurant Owner</option>
                      <option value="ACCOUNTANT">Accountant</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">4-Digit Quick PIN</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {editingStaff ? 'New Password (leave empty to keep current)' : 'Password'}
                  </label>
                  <input
                    type="password"
                    placeholder={editingStaff ? '••••••••' : 'Password for login'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-[#AA1B2A] to-[#DA4339] text-[#FEFBF5] border border-[#E09D3D] rounded-xl font-black shadow-xs cursor-pointer"
                  >
                    {editingStaff ? 'Save Changes' : 'Save Staff Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
