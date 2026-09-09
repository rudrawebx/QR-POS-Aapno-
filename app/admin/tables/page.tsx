'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import {
  Layers,
  Plus,
  QrCode,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  CreditCard,
  Edit2,
  Trash2,
  ExternalLink,
} from 'lucide-react';

export default function AdminTablesPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [floorZones, setFloorZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTableNum, setNewTableNum] = useState('');
  const [newTableCap, setNewTableCap] = useState('4');
  const [isCreating, setIsCreating] = useState(false);

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables');
      const data = await res.json();
      if (data.tables) setTables(data.tables);
      if (data.floorZones) setFloorZones(data.floorZones);
    } catch (err) {
      console.error('Error loading tables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (tableId: string, newStatus: string) => {
    try {
      await fetch('/api/tables', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tableId, status: newStatus }),
      });
      fetchTables();
    } catch (err) {
      console.error('Error changing table status:', err);
    }
  };

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNum) return;

    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: newTableNum,
          name: `Table ${newTableNum}`,
          capacity: parseInt(newTableCap || '4'),
        }),
      });
      if (res.ok) {
        setNewTableNum('');
        setIsCreating(false);
        fetchTables();
      }
    } catch (err) {
      console.error('Error creating table:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'OCCUPIED':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'RESERVED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'BILLING':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'CLEANING':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-600" />
            <div>
              <h2 className="font-bold text-sm text-slate-900">Floor &amp; Table Management</h2>
              <p className="text-xs text-slate-500">Live table occupancy &amp; QR routing</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Table</span>
            </button>
            <Link
              href="/admin/qr-codes"
              className="bg-slate-900 hover:bg-black text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>QR Code Studio</span>
            </Link>
          </div>
        </div>

        {/* Add Table Form Dropdown */}
        {isCreating && (
          <form
            onSubmit={handleCreateTable}
            className="bg-white p-4 rounded-2xl border border-orange-200 shadow-sm flex flex-wrap items-end gap-3 animate-in fade-in duration-200"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Table Number</label>
              <input
                type="text"
                placeholder="e.g. 11, 12, VIP-1"
                value={newTableNum}
                onChange={(e) => setNewTableNum(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Seating Capacity</label>
              <input
                type="number"
                min="1"
                max="20"
                value={newTableCap}
                onChange={(e) => setNewTableCap(e.target.value)}
                className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              Save Table &amp; Generate QR
            </button>
          </form>
        )}

        {/* Table Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tables.map((table) => {
            const activeOrder = table.orders?.[0];
            return (
              <div
                key={table.id}
                className={`p-4 rounded-2xl bg-white border-2 shadow-xs flex flex-col justify-between space-y-3 transition-all ${
                  table.status === 'OCCUPIED'
                    ? 'border-amber-400 bg-amber-50/20'
                    : table.status === 'AVAILABLE'
                    ? 'border-emerald-400/60'
                    : 'border-slate-200'
                }`}
              >
                {/* Top Row: Table number & Status Badge */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Table {table.tableNumber}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>{table.capacity} Seater</span>
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusBadge(
                      table.status
                    )}`}
                  >
                    {table.status}
                  </span>
                </div>

                {/* Active Order Summary if Occupied */}
                {activeOrder ? (
                  <div className="bg-white p-2.5 rounded-xl border border-amber-200 text-xs space-y-1 shadow-2xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{activeOrder.humanOrderId}</span>
                      <span className="text-orange-600">₹{activeOrder.grandTotal}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {activeOrder.items?.length || 0} items • {activeOrder.customerName || 'Guest'}
                    </p>
                  </div>
                ) : (
                  <div className="h-12 flex items-center text-xs text-slate-400 italic">
                    Ready for guests
                  </div>
                )}

                {/* Status Switcher Select */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <select
                    value={table.status}
                    onChange={(e) => handleStatusChange(table.id, e.target.value)}
                    className="text-[11px] font-bold bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 flex-1 text-slate-800"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="RESERVED">Reserved</option>
                    <option value="BILLING">Billing</option>
                    <option value="CLEANING">Cleaning</option>
                  </select>

                  <Link
                    href={`/r/aapno-khano/table-${table.tableNumber}`}
                    target="_blank"
                    className="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600"
                    title="Open Table QR Menu"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
