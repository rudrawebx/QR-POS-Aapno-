'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  CalendarCheck,
  Plus,
  Users,
  Clock,
  Phone,
  CheckCircle2,
  XCircle,
  Calendar,
} from 'lucide-react';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newGuests, setNewGuests] = useState('4');
  const [newTime, setNewTime] = useState('19:30');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newNotes, setNewNotes] = useState('');

  const fetchReservations = async () => {
    try {
      const res = await fetch('/api/reservations');
      const data = await res.json();
      if (data.reservations) setReservations(data.reservations);
    } catch (err) {
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: (await fetch('/api/restaurants/aapno-khano').then((r) => r.json())).restaurant.id,
          customerName: newName,
          customerPhone: newPhone,
          guestCount: parseInt(newGuests),
          reservationTime: newTime,
          reservationDate: newDate,
          specialRequests: newNotes,
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setNewName('');
        setNewPhone('');
        fetchReservations();
      }
    } catch (err) {
      console.error('Error creating reservation:', err);
    }
  };

  const handleUpdateStatus = async (resId: string, status: string) => {
    try {
      await fetch('/api/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resId, status }),
      });
      fetchReservations();
    } catch (err) {
      console.error('Error updating reservation:', err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-orange-600" />
            <div>
              <h2 className="font-bold text-sm text-slate-900">Table Reservations</h2>
              <p className="text-xs text-slate-500">Manage advance dining bookings and guest allocations</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Reservation</span>
          </button>
        </div>

        {/* Reservations Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Guest</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Date &amp; Slot</th>
                  <th className="py-3.5 px-4">Party Size</th>
                  <th className="py-3.5 px-4">Special Requests</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{res.customerName}</td>
                    <td className="py-3 px-4 text-slate-600">{res.customerPhone}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {new Date(res.reservationDate).toLocaleDateString()} @ <b>{res.reservationTime}</b>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{res.guestCount} Guests</td>
                    <td className="py-3 px-4 text-slate-500">{res.specialRequests || '—'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          res.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : res.status === 'SEATED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {res.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {res.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateStatus(res.id, 'SEATED')}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold text-[11px]"
                        >
                          Seat Table
                        </button>
                      )}
                      {res.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleUpdateStatus(res.id, 'CANCELLED')}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-bold text-[11px]"
                        >
                          Cancel
                        </button>
                      )}
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
              <h3 className="font-bold text-sm text-slate-900">Book Table Reservation</h3>
              <form onSubmit={handleCreateReservation} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Guest Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maharani Gayatri Devi"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98290 12345"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Party Size</label>
                    <input
                      type="number"
                      value={newGuests}
                      onChange={(e) => setNewGuests(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Time Slot</label>
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
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
                    Confirm Booking
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
