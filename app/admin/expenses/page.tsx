'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  Receipt,
  Plus,
  DollarSign,
  TrendingDown,
  Calendar,
  CreditCard,
  Building,
} from 'lucide-react';

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCat, setNewCat] = useState('RAW_MATERIAL');
  const [newMethod, setNewMethod] = useState('UPI');
  const [newNotes, setNewNotes] = useState('');

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses');
      const data = await res.json();
      if (data.expenses) setExpenses(data.expenses);
      if (data.totalExpense) setTotalExpense(data.totalExpense);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          amount: parseFloat(newAmount),
          category: newCat,
          paymentMethod: newMethod,
          notes: newNotes,
        }),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewTitle('');
        setNewAmount('');
        setNewNotes('');
        fetchExpenses();
      }
    } catch (err) {
      console.error('Error recording expense:', err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-orange-600" />
            <div>
              <h2 className="font-bold text-sm text-slate-900">Restaurant Expense Ledger</h2>
              <p className="text-xs text-slate-500">Track operating overheads, raw materials &amp; utilities</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-xl text-xs font-black text-red-800">
              Total Expenses: ₹{totalExpense.toLocaleString()}
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Title / Reason</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4 font-black">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{exp.title}</p>
                      {exp.notes && <p className="text-[11px] text-slate-400">{exp.notes}</p>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(exp.expenseDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{exp.paymentMethod}</td>
                    <td className="py-3 px-4 font-black text-red-600 text-sm">
                      -₹{exp.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Record Operational Expense</h3>
              <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expense Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Commercial Gas Refill, Dairy Purchase"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={newCat}
                      onChange={(e) => setNewCat(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="RAW_MATERIAL">Raw Material</option>
                      <option value="UTILITIES">Utilities &amp; Gas</option>
                      <option value="RENT">Rent</option>
                      <option value="SALARY">Staff Salary</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="MARKETING">Marketing</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 4500"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Notes / Invoice Ref</label>
                  <input
                    type="text"
                    placeholder="Optional details"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 shadow-sm"
                  >
                    Record Expense
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
