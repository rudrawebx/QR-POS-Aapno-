'use client';

import React, { useState, useEffect } from 'react';
import {
  Store,
  Monitor,
  Receipt,
  UtensilsCrossed,
  Package,
  CreditCard,
  Headphones,
  BookOpen,
  Megaphone,
  BarChart3,
  Activity,
  Settings,
  Plus,
  Download,
  Printer,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Search,
  Send,
  Trash2,
} from 'lucide-react';

interface Props {
  activeSection: string;
  restaurants: any[];
  summary: any;
  plans: any[];
  onRefreshParent: () => void;
}

export default function SuperAdminSecondaryModules({
  activeSection,
  restaurants,
  summary,
  onRefreshParent,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [modData, setModData] = useState<any>({});
  const [filterRestId, setFilterRestId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Forms state
  const [newOutlet, setNewOutlet] = useState({ restaurantId: '', name: '', address: '', phone: '' });
  const [newTerminal, setNewTerminal] = useState({ restaurantId: '', deviceName: '', deviceType: 'POS_TERMINAL', ipAddress: '' });
  const [newTicket, setNewTicket] = useState({ restaurantId: '', category: 'TECHNICAL', priority: 'MEDIUM', subject: '', description: '' });
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketReply, setTicketReply] = useState('');
  const [newArticle, setNewArticle] = useState({ title: '', category: 'FAQ', content: '', videoUrl: '' });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', type: 'UPDATE', targetType: 'ALL' });
  const [platformForm, setPlatformForm] = useState({
    platformName: 'Aapno Khano POS',
    supportEmail: 'support@aapnokhano.com',
    supportPhone: '+91 70820 40809',
    defaultTaxRate: '5',
    defaultTrialDays: '14',
    maintenanceMode: false,
  });
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const sectionToModuleMap: Record<string, string> = {
    OUTLETS: 'OUTLETS',
    TERMINALS: 'TERMINALS',
    ORDERS: 'ORDERS',
    MENU: 'MENU',
    INVENTORY: 'INVENTORY',
    PAYMENTS: 'PAYMENTS',
    TICKETS: 'TICKETS',
    HELP: 'HELP',
    ANNOUNCEMENTS: 'ANNOUNCEMENTS',
    NOTIFICATIONS: 'ANNOUNCEMENTS',
    MONITORING: 'MONITORING',
    SETTINGS: 'MONITORING',
  };

  const fetchModuleData = async () => {
    const mod = sectionToModuleMap[activeSection];
    if (!mod) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ module: mod });
      if (filterRestId) params.set('restaurantId', filterRestId);
      if (statusFilter) params.set('status', statusFilter);
      if (searchTerm) params.set('search', searchTerm);

      const res = await fetch(`/api/superadmin/modules?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setModData(json);
        if (json.platformSettings) {
          setPlatformForm({
            platformName: json.platformSettings.platformName || 'Aapno Khano POS',
            supportEmail: json.platformSettings.supportEmail || 'support@aapnokhano.com',
            supportPhone: json.platformSettings.supportPhone || '+91 70820 40809',
            defaultTaxRate: String(json.platformSettings.defaultTaxRate ?? 5),
            defaultTrialDays: String(json.platformSettings.defaultTrialDays ?? 14),
            maintenanceMode: Boolean(json.platformSettings.maintenanceMode),
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurants.length > 0 && !newOutlet.restaurantId) {
      setNewOutlet((p) => ({ ...p, restaurantId: restaurants[0].id }));
      setNewTerminal((p) => ({ ...p, restaurantId: restaurants[0].id }));
      setNewTicket((p) => ({ ...p, restaurantId: restaurants[0].id }));
    }
  }, [restaurants]);

  useEffect(() => {
    fetchModuleData();
  }, [activeSection, filterRestId, statusFilter]);

  const showNotice = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const postAction = async (payload: any, msg: string) => {
    const res = await fetch('/api/superadmin/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      showNotice(msg);
      fetchModuleData();
      onRefreshParent();
      return true;
    }
    return false;
  };

  const exportCsv = (filename: string, rows: any[]) => {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),
      ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 text-xs">
      {feedbackMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-2xl font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Restaurant Filter Bar for Tenant-Scoped Views */}
      {['OUTLETS', 'TERMINALS', 'ORDERS', 'MENU', 'INVENTORY', 'PAYMENTS', 'TICKETS'].includes(activeSection) && (
        <div className="bg-white rounded-2xl border border-[#E8DFD3] p-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterRestId}
              onChange={(e) => setFilterRestId(e.target.value)}
              className="px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl font-bold text-[#331E17]"
            >
              <option value="">{activeSection === 'MENU' ? 'Select Restaurant (Default: QSR01)' : 'All Restaurants'}</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.qsrNumber} — {r.name} ({r.city})
                </option>
              ))}
            </select>

            {['ORDERS', 'PAYMENTS', 'TICKETS'].includes(activeSection) && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchModuleData()}
                  className="pl-8 pr-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl"
                />
              </div>
            )}
          </div>

          <button
            onClick={fetchModuleData}
            className="px-3 py-2 bg-[#F5EFE6] hover:bg-[#EAE0D2] text-[#331E17] font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      )}

      {/* 1. OUTLETS */}
      {activeSection === 'OUTLETS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E8DFD3] overflow-hidden">
            <div className="p-4 border-b border-[#F0E8DC] flex items-center gap-2">
              <Store className="w-4 h-4 text-[#8E1521]" />
              <h3 className="text-sm font-black text-[#331E17]">Multi-Outlet Branches ({modData.outlets?.length || 0})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#FAF5ED] text-[10px] font-black uppercase text-[#745E55]">
                  <tr>
                    <th className="py-3 px-4">Outlet Name</th>
                    <th className="py-3 px-4">Parent Restaurant</th>
                    <th className="py-3 px-4">Tables / Staff / Orders</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E8DC]">
                  {(modData.outlets || []).map((o: any) => (
                    <tr key={o.id}>
                      <td className="py-3 px-4 font-black">{o.name} {o.isMain && <span className="text-[10px] text-[#8E1521]">(Main)</span>}</td>
                      <td className="py-3 px-4">{o.restaurant?.qsrNumber} • {o.restaurant?.name}</td>
                      <td className="py-3 px-4">{o._count?.tables || 0} Tables • {o._count?.users || 0} Staff • {o._count?.orders || 0} Orders</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${o.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {o.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => postAction({ action: 'TOGGLE_OUTLET', outletId: o.id, isActive: !o.isActive }, 'Outlet status updated')}
                          className="px-2.5 py-1 bg-[#F5EFE6] rounded-lg font-bold cursor-pointer"
                        >
                          {o.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (await postAction({ action: 'CREATE_OUTLET', ...newOutlet }, 'Outlet added!')) {
                setNewOutlet((p) => ({ ...p, name: '', address: '', phone: '' }));
              }
            }}
            className="bg-white rounded-3xl border border-[#E8DFD3] p-5 space-y-3 h-fit"
          >
            <h3 className="text-sm font-black text-[#331E17] flex items-center gap-1.5"><Plus className="w-4 h-4 text-[#8E1521]" /> Add New Outlet</h3>
            <select
              value={newOutlet.restaurantId}
              onChange={(e) => setNewOutlet({ ...newOutlet, restaurantId: e.target.value })}
              className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl font-bold"
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>{r.qsrNumber} — {r.name}</option>
              ))}
            </select>
            <input required placeholder="Outlet Name (e.g. Sector 14 Branch)" value={newOutlet.name} onChange={(e) => setNewOutlet({ ...newOutlet, name: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl" />
            <input required placeholder="Address" value={newOutlet.address} onChange={(e) => setNewOutlet({ ...newOutlet, address: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl" />
            <input required placeholder="Phone" value={newOutlet.phone} onChange={(e) => setNewOutlet({ ...newOutlet, phone: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl" />
            <button type="submit" className="w-full py-2.5 bg-[#8E1521] text-white font-black rounded-xl cursor-pointer">Create Outlet</button>
          </form>
        </div>
      )}

      {/* 2. POS TERMINALS */}
      {activeSection === 'TERMINALS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E8DFD3] overflow-hidden">
            <div className="p-4 border-b border-[#F0E8DC] flex items-center justify-between">
              <h3 className="text-sm font-black text-[#331E17] flex items-center gap-2"><Monitor className="w-4 h-4 text-[#8E1521]" /> Registered POS Terminals ({modData.terminals?.length || 0})</h3>
              <span className="text-[10px] text-[#745E55]">Online status reflects real device heartbeat only</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#FAF5ED] text-[10px] font-black uppercase text-[#745E55]">
                  <tr>
                    <th className="py-3 px-4">Terminal ID</th>
                    <th className="py-3 px-4">Device Name &amp; Type</th>
                    <th className="py-3 px-4">IP / Heartbeat</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E8DC]">
                  {(modData.terminals || []).length === 0 ? (
                    <tr><td colSpan={5} className="py-8 text-center text-[#745E55]">No POS terminals registered yet. Register a device on the right.</td></tr>
                  ) : (
                    (modData.terminals || []).map((t: any) => (
                      <tr key={t.id}>
                        <td className="py-3 px-4 font-mono font-black text-[#8E1521]">{t.terminalCode}</td>
                        <td className="py-3 px-4"><b>{t.deviceName}</b><p className="text-[10px] text-[#745E55]">{t.deviceType}</p></td>
                        <td className="py-3 px-4 font-mono text-[11px]">{t.ipAddress || '—'} • {t.lastHeartbeatAt ? new Date(t.lastHeartbeatAt).toLocaleString('en-IN') : 'No heartbeat'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${t.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => postAction({ action: 'TOGGLE_TERMINAL', terminalId: t.id, isActive: !t.isActive }, 'Terminal updated')}
                            className="px-2.5 py-1 bg-[#F5EFE6] rounded-lg font-bold cursor-pointer"
                          >
                            {t.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (await postAction({ action: 'CREATE_TERMINAL', ...newTerminal }, 'POS Terminal registered!')) {
                setNewTerminal((p) => ({ ...p, deviceName: '', ipAddress: '' }));
              }
            }}
            className="bg-white rounded-3xl border border-[#E8DFD3] p-5 space-y-3 h-fit"
          >
            <h3 className="text-sm font-black text-[#331E17]">Register POS Terminal</h3>
            <select value={newTerminal.restaurantId} onChange={(e) => setNewTerminal({ ...newTerminal, restaurantId: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl font-bold">
              {restaurants.map((r) => (<option key={r.id} value={r.id}>{r.qsrNumber} — {r.name}</option>))}
            </select>
            <input required placeholder="Device Name (e.g. Counter 1 iPad)" value={newTerminal.deviceName} onChange={(e) => setNewTerminal({ ...newTerminal, deviceName: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl" />
            <select value={newTerminal.deviceType} onChange={(e) => setNewTerminal({ ...newTerminal, deviceType: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl">
              <option value="POS_TERMINAL">POS Billing Terminal</option>
              <option value="KDS_SCREEN">Kitchen KDS Screen</option>
              <option value="WAITER_TAB">Waiter Ordering Tablet</option>
            </select>
            <input placeholder="Local IP (Optional)" value={newTerminal.ipAddress} onChange={(e) => setNewTerminal({ ...newTerminal, ipAddress: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl font-mono" />
            <button type="submit" className="w-full py-2.5 bg-[#8E1521] text-white font-black rounded-xl cursor-pointer">Register Device</button>
          </form>
        </div>
      )}

      {/* 3. ORDERS & BILLING */}
      {activeSection === 'ORDERS' && (
        <div className="bg-white rounded-3xl border border-[#E8DFD3] overflow-hidden">
          <div className="p-4 border-b border-[#F0E8DC] flex items-center justify-between">
            <h3 className="text-sm font-black text-[#331E17] flex items-center gap-2"><Receipt className="w-4 h-4 text-[#8E1521]" /> Platform Orders &amp; Billing Monitor ({modData.orders?.length || 0})</h3>
            <span className="text-[10px] font-bold text-[#745E55]">Read-only financial integrity enforced</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#FAF5ED] text-[10px] font-black uppercase text-[#745E55]">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Restaurant</th>
                  <th className="py-3 px-4">Customer / Type</th>
                  <th className="py-3 px-4">Subtotal / Tax</th>
                  <th className="py-3 px-4">Grand Total</th>
                  <th className="py-3 px-4">Payment / Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8DC]">
                {(modData.orders || []).map((o: any) => (
                  <tr key={o.id}>
                    <td className="py-3 px-4 font-mono font-black text-[#8E1521]">{o.humanOrderId}</td>
                    <td className="py-3 px-4 font-bold">{o.restaurant?.qsrNumber} • {o.restaurant?.name}</td>
                    <td className="py-3 px-4">{o.customerName} <span className="text-[10px] text-[#745E55]">({o.orderType})</span></td>
                    <td className="py-3 px-4 font-mono">₹{o.subtotal} + ₹{o.taxAmount} GST</td>
                    <td className="py-3 px-4 font-black text-emerald-800">₹{o.grandTotal}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#FFF0E8] text-[#8E1521] font-black text-[10px]">{o.paymentMethod} • {o.paymentStatus}</span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-[#745E55]">{new Date(o.createdAt).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. MENU INSPECTOR (Read-Only) */}
      {activeSection === 'MENU' && (
        <div className="bg-white rounded-3xl border border-[#E8DFD3] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0E8DC] pb-3">
            <h3 className="text-sm font-black text-[#331E17] flex items-center gap-2"><UtensilsCrossed className="w-4 h-4 text-[#8E1521]" /> Tenant Menu Inspector (Read-Only Support View)</h3>
            <span className="text-[11px] text-[#745E55]">Owners manage their own menus inside their POS</span>
          </div>
          <div className="space-y-4">
            {(modData.categories || []).map((cat: any) => (
              <div key={cat.id} className="border border-[#E8DFD3] rounded-2xl p-4 bg-[#FCF9F4]">
                <h4 className="font-black text-[#8E1521] mb-2">{cat.name} ({cat.products?.length || 0} items)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {(cat.products || []).map((p: any) => (
                    <div key={p.id} className="bg-white p-2.5 rounded-xl border border-[#E8DFD3] flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold truncate">{p.isVeg ? '🟢' : '🔴'} {p.name}</p>
                        <p className="text-[10px] text-[#745E55] font-mono">{p.sku || 'NO-SKU'} • {p.isAvailable ? 'In Stock' : 'Out of Stock'}</p>
                      </div>
                      <span className="font-black text-[#331E17]">₹{p.basePrice}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. INVENTORY VISIBILITY */}
      {activeSection === 'INVENTORY' && (
        <div className="bg-white rounded-3xl border border-[#E8DFD3] overflow-hidden">
          <div className="p-4 border-b border-[#F0E8DC]">
            <h3 className="text-sm font-black text-[#331E17] flex items-center gap-2"><Package className="w-4 h-4 text-[#8E1521]" /> Platform Inventory &amp; Low-Stock Visibility ({modData.ingredients?.length || 0})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#FAF5ED] text-[10px] font-black uppercase text-[#745E55]">
                <tr>
                  <th className="py-3 px-4">Ingredient</th>
                  <th className="py-3 px-4">Restaurant</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Min Alert</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8DC]">
                {(modData.ingredients || []).length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-[#745E55]">No inventory records found for this filter.</td></tr>
                ) : (
                  (modData.ingredients || []).map((ing: any) => (
                    <tr key={ing.id}>
                      <td className="py-3 px-4 font-black">{ing.name}</td>
                      <td className="py-3 px-4">{ing.restaurant?.qsrNumber} • {ing.restaurant?.name}</td>
                      <td className="py-3 px-4 font-mono font-bold">{ing.currentStock} {ing.unit}</td>
                      <td className="py-3 px-4 font-mono">{ing.minStockAlert} {ing.unit}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${ing.currentStock <= ing.minStockAlert ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {ing.currentStock <= ing.minStockAlert ? 'Low Stock' : 'Healthy'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. PAYMENTS */}
      {activeSection === 'PAYMENTS' && (
        <div className="bg-white rounded-3xl border border-[#E8DFD3] overflow-hidden">
          <div className="p-4 border-b border-[#F0E8DC] flex items-center justify-between">
            <h3 className="text-sm font-black text-[#331E17] flex items-center gap-2"><CreditCard className="w-4 h-4 text-[#8E1521]" /> Payment Transactions ({modData.payments?.length || 0})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#FAF5ED] text-[10px] font-black uppercase text-[#745E55]">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Restaurant</th>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8DC]">
                {(modData.payments || []).length === 0 ? (
                  <tr><td colSpan={7} className="py-8 text-center text-[#745E55]">No payment records found.</td></tr>
                ) : (
                  (modData.payments || []).map((p: any) => (
                    <tr key={p.id}>
                      <td className="py-3 px-4 font-mono text-[11px]">{p.transactionId || p.id.slice(0, 12)}</td>
                      <td className="py-3 px-4 font-bold">{p.restaurant?.qsrNumber} • {p.restaurant?.name}</td>
                      <td className="py-3 px-4 font-mono">{p.order?.humanOrderId || '—'}</td>
                      <td className="py-3 px-4 font-bold">{p.paymentMethod}</td>
                      <td className="py-3 px-4 font-black text-emerald-800">₹{p.amount}</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">{p.status}</span></td>
                      <td className="py-3 px-4 text-[11px] text-[#745E55]">{new Date(p.createdAt).toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. SUPPORT & TICKETS */}
      {activeSection === 'TICKETS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E8DFD3] overflow-hidden">
            <div className="p-4 border-b border-[#F0E8DC] flex items-center justify-between">
              <h3 className="text-sm font-black text-[#331E17] flex items-center gap-2"><Headphones className="w-4 h-4 text-[#8E1521]" /> Support Tickets ({modData.tickets?.length || 0})</h3>
            </div>
            <div className="divide-y divide-[#F0E8DC]">
              {(modData.tickets || []).length === 0 ? (
                <p className="p-8 text-center text-[#745E55]">No support tickets logged yet.</p>
              ) : (
                (modData.tickets || []).map((t: any) => (
                  <div key={t.id} className="p-4 hover:bg-[#FCF9F4] flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-[#8E1521]">#{t.ticketNumber}</span>
                        <span className="font-black text-[#331E17]">{t.subject}</span>
                        <span className="px-2 py-0.5 rounded bg-[#F5EFE6] text-[10px] font-bold">{t.category}</span>
                      </div>
                      <p className="text-[11px] text-[#745E55] mt-0.5">{t.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-[10px]">{t.status}</span>
                      <button onClick={() => setSelectedTicket(t)} className="px-3 py-1.5 bg-[#8E1521] text-white font-bold rounded-xl cursor-pointer">Open</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (await postAction({ action: 'CREATE_TICKET', ...newTicket }, 'Support ticket created!')) {
                setNewTicket((p) => ({ ...p, subject: '', description: '' }));
              }
            }}
            className="bg-white rounded-3xl border border-[#E8DFD3] p-5 space-y-3 h-fit"
          >
            <h3 className="text-sm font-black text-[#331E17]">Log Support Ticket</h3>
            <select value={newTicket.restaurantId} onChange={(e) => setNewTicket({ ...newTicket, restaurantId: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl font-bold">
              {restaurants.map((r) => (<option key={r.id} value={r.id}>{r.qsrNumber} — {r.name}</option>))}
            </select>
            <select value={newTicket.category} onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl">
              <option value="POS_BILLING">POS Billing</option>
              <option value="KOT_KITCHEN">KOT / Kitchen</option>
              <option value="PRINTER">Printer</option>
              <option value="QR_MENU">QR Menu</option>
              <option value="PAYMENT">Payment</option>
              <option value="MENU">Menu Management</option>
              <option value="LOGIN">Login Issue</option>
              <option value="SUBSCRIPTION">Subscription</option>
            </select>
            <input required placeholder="Ticket Subject" value={newTicket.subject} onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl" />
            <textarea required rows={3} placeholder="Issue details..." value={newTicket.description} onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl" />
            <button type="submit" className="w-full py-2.5 bg-[#8E1521] text-white font-black rounded-xl cursor-pointer">Create Ticket</button>
          </form>

          {selectedTicket && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border-2 border-[#E09D3D]">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <span className="font-mono font-black text-[#8E1521]">#{selectedTicket.ticketNumber}</span>
                    <h4 className="font-black text-sm">{selectedTicket.subject}</h4>
                  </div>
                  <button onClick={() => setSelectedTicket(null)} className="font-bold text-slate-500 cursor-pointer">Close</button>
                </div>
                <p className="text-[#5C463E] bg-[#FCF9F4] p-3 rounded-xl">{selectedTicket.description}</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {(selectedTicket.replies || []).map((r: any) => (
                    <div key={r.id} className="p-2.5 rounded-xl bg-[#FAF5ED] border border-[#E8DFD3]">
                      <p className="font-bold text-[11px]">{r.senderName} ({r.senderRole})</p>
                      <p>{r.message}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={ticketReply} onChange={(e) => setTicketReply(e.target.value)} placeholder="Write reply..." className="flex-1 px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl" />
                  <button
                    onClick={async () => {
                      if (!ticketReply.trim()) return;
                      await postAction({ action: 'REPLY_TICKET', ticketId: selectedTicket.id, message: ticketReply, newStatus: 'IN_PROGRESS' }, 'Reply sent');
                      setTicketReply('');
                      setSelectedTicket(null);
                    }}
                    className="px-4 py-2 bg-[#8E1521] text-white font-black rounded-xl cursor-pointer"
                  >
                    Reply
                  </button>
                  <button
                    onClick={async () => {
                      await postAction({ action: 'UPDATE_TICKET_STATUS', ticketId: selectedTicket.id, status: 'RESOLVED' }, 'Ticket resolved');
                      setSelectedTicket(null);
                    }}
                    className="px-3 py-2 bg-emerald-600 text-white font-black rounded-xl cursor-pointer"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 8. HELP & TRAINING */}
      {activeSection === 'HELP' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E8DFD3] p-5 space-y-3">
            <h3 className="text-sm font-black text-[#331E17] flex items-center gap-2"><BookOpen className="w-4 h-4 text-[#8E1521]" /> Help Guides, FAQs &amp; Training Videos</h3>
            {(modData.articles || []).length === 0 ? (
              <p className="py-6 text-center text-[#745E55]">No help articles published yet.</p>
            ) : (
              (modData.articles || []).map((a: any) => (
                <div key={a.id} className="p-4 rounded-2xl bg-[#FCF9F4] border border-[#E8DFD3] flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-[#FFF0E8] text-[#8E1521] font-black text-[10px]">{a.category}</span>
                    <h4 className="font-black text-sm mt-1">{a.title}</h4>
                    <p className="text-[#5C463E] mt-1">{a.content}</p>
                    {a.videoUrl && <a href={a.videoUrl} target="_blank" rel="noreferrer" className="text-[#8E1521] font-bold underline mt-1 inline-block">Watch Tutorial Video →</a>}
                  </div>
                  <button onClick={() => postAction({ action: 'DELETE_HELP_ARTICLE', id: a.id }, 'Article deleted')} className="text-red-600 p-1.5 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))
            )}
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (await postAction({ action: 'SAVE_HELP_ARTICLE', ...newArticle }, 'Help article published!')) {
                setNewArticle({ title: '', category: 'FAQ', content: '', videoUrl: '' });
              }
            }}
            className="bg-white rounded-3xl border border-[#E8DFD3] p-5 space-y-3 h-fit"
          >
            <h3 className="text-sm font-black text-[#331E17]">Publish Help Article</h3>
            <input required placeholder="Title (e.g. 80mm Thermal Printer Setup)" value={newArticle.title} onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl" />
            <select value={newArticle.category} onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl">
              <option value="FAQ">FAQ</option>
              <option value="PRINTER_SETUP">Printer Configuration</option>
              <option value="QR_MENU">QR Menu Guide</option>
              <option value="BILLING_GST">Billing &amp; GST Guide</option>
              <option value="INVENTORY">Inventory Tutorial</option>
            </select>
            <textarea required rows={3} placeholder="Guide content..." value={newArticle.content} onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl" />
            <input placeholder="Tutorial Video URL (Optional)" value={newArticle.videoUrl} onChange={(e) => setNewArticle({ ...newArticle, videoUrl: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl" />
            <button type="submit" className="w-full py-2.5 bg-[#8E1521] text-white font-black rounded-xl cursor-pointer">Publish Article</button>
          </form>
        </div>
      )}

      {/* 9. ANNOUNCEMENTS & NOTIFICATIONS */}
      {(activeSection === 'ANNOUNCEMENTS' || activeSection === 'NOTIFICATIONS') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E8DFD3] p-5 space-y-3">
            <h3 className="text-sm font-black text-[#331E17] flex items-center gap-2"><Megaphone className="w-4 h-4 text-[#8E1521]" /> Published Announcements &amp; Delivery Logs</h3>
            {(modData.announcements || []).length === 0 ? (
              <p className="py-6 text-center text-[#745E55]">No announcements broadcast yet.</p>
            ) : (
              (modData.announcements || []).map((ann: any) => (
                <div key={ann.id} className="p-4 rounded-2xl bg-[#FCF9F4] border border-[#E8DFD3] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-[#8E1521] text-white text-[10px] font-black">{ann.type}</span>
                    <span className="text-[10px] text-[#745E55]">Delivered to {ann._count?.logs || 0} restaurants • {new Date(ann.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                  <h4 className="font-black text-sm">{ann.title}</h4>
                  <p className="text-[#5C463E]">{ann.message}</p>
                </div>
              ))
            )}
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (await postAction({ action: 'PUBLISH_ANNOUNCEMENT', ...newAnnouncement }, 'Announcement broadcast to restaurants!')) {
                setNewAnnouncement({ title: '', message: '', type: 'UPDATE', targetType: 'ALL' });
              }
            }}
            className="bg-white rounded-3xl border border-[#E8DFD3] p-5 space-y-3 h-fit"
          >
            <h3 className="text-sm font-black text-[#331E17] flex items-center gap-1.5"><Send className="w-4 h-4 text-[#8E1521]" /> Broadcast Announcement</h3>
            <input required placeholder="Announcement Title" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl" />
            <select value={newAnnouncement.type} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl">
              <option value="UPDATE">Software Update</option>
              <option value="MAINTENANCE">Maintenance Notice</option>
              <option value="ALERT">Important Alert</option>
              <option value="FEATURE">New Feature Release</option>
            </select>
            <textarea required rows={3} placeholder="Message to restaurant terminals..." value={newAnnouncement.message} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl" />
            <button type="submit" className="w-full py-2.5 bg-[#8E1521] text-white font-black rounded-xl cursor-pointer">Publish Notice</button>
          </form>
        </div>
      )}

      {/* 10. REPORTS & ANALYTICS */}
      {activeSection === 'REPORTS' && (
        <div className="bg-white rounded-3xl border border-[#E8DFD3] p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F0E8DC] pb-4">
            <div>
              <h3 className="text-sm font-black text-[#331E17] flex items-center gap-2"><BarChart3 className="w-4 h-4 text-[#8E1521]" /> Platform Reports &amp; CSV Export</h3>
              <p className="text-[11px] text-[#745E55]">Restaurant POS GMV and Platform Subscription Revenue are tracked separately.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  exportCsv(
                    'aapno-khano-platform-report.csv',
                    restaurants.map((r) => ({
                      QSR: r.qsrNumber,
                      Restaurant: r.name,
                      City: r.city,
                      Plan: r.currentPlan,
                      Status: r.status,
                      Orders: r.ordersCount,
                      RestaurantGMV: r.revenue,
                    }))
                  )
                }
                className="px-3.5 py-2 bg-[#8E1521] text-white font-black rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button onClick={() => window.print()} className="px-3.5 py-2 bg-[#F5EFE6] text-[#331E17] font-bold rounded-xl flex items-center gap-1.5 cursor-pointer">
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#FCF9F4] border border-[#E8DFD3]">
              <p className="text-[10px] font-black uppercase text-[#745E55]">Restaurant Sales GMV</p>
              <p className="text-xl font-black text-[#331E17] mt-1">₹{summary?.totalGmv?.toLocaleString() || 0}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FFF0E8] border border-[#E09D3D]/40">
              <p className="text-[10px] font-black uppercase text-[#8E1521]">Platform SaaS MRR</p>
              <p className="text-xl font-black text-[#8E1521] mt-1">₹{summary?.monthlyPlatformRevenue?.toLocaleString() || 0}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FCF9F4] border border-[#E8DFD3]">
              <p className="text-[10px] font-black uppercase text-[#745E55]">Total Orders</p>
              <p className="text-xl font-black text-[#331E17] mt-1">{summary?.totalOrders || 0}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FCF9F4] border border-[#E8DFD3]">
              <p className="text-[10px] font-black uppercase text-[#745E55]">Active Subscriptions</p>
              <p className="text-xl font-black text-emerald-700 mt-1">{summary?.activeSubscriptions || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* 11. SYSTEM MONITORING */}
      {activeSection === 'MONITORING' && (
        <div className="bg-white rounded-3xl border border-[#E8DFD3] p-6 space-y-5">
          <h3 className="text-sm font-black text-[#331E17] flex items-center gap-2"><Activity className="w-4 h-4 text-[#8E1521]" /> Live System Health &amp; Monitoring</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <p className="text-[10px] font-black uppercase text-emerald-700">API Status</p>
              <p className="text-sm font-black text-emerald-900 mt-1">{modData.monitoring?.apiStatus || 'OPERATIONAL'}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FCF9F4] border border-[#E8DFD3]">
              <p className="text-[10px] font-black uppercase text-[#745E55]">MySQL DB</p>
              <p className="text-sm font-black text-[#331E17] mt-1">{modData.monitoring?.dbStatus || 'Checking...'} ({modData.monitoring?.dbLatencyMs ?? '—'}ms)</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FCF9F4] border border-[#E8DFD3]">
              <p className="text-[10px] font-black uppercase text-[#745E55]">Memory RSS</p>
              <p className="text-sm font-black text-[#331E17] mt-1">{modData.monitoring?.memoryMb || 0} MB</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FCF9F4] border border-[#E8DFD3]">
              <p className="text-[10px] font-black uppercase text-[#745E55]">Active Sessions</p>
              <p className="text-sm font-black text-[#331E17] mt-1">{modData.monitoring?.activeSessions || 0}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FCF9F4] border border-[#E8DFD3]">
              <p className="text-[10px] font-black uppercase text-[#745E55]">Failed Logins (24h)</p>
              <p className="text-sm font-black text-amber-700 mt-1">{modData.monitoring?.failedLogins24h || 0}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FCF9F4] border border-[#E8DFD3]">
              <p className="text-[10px] font-black uppercase text-[#745E55]">Audit Entries</p>
              <p className="text-sm font-black text-[#331E17] mt-1">{modData.monitoring?.totalAuditLogs || 0}</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-amber-900">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Automated Hostinger MySQL backups are managed at infrastructure level. Only verified DB snapshots are counted as complete.</span>
          </div>
        </div>
      )}

      {/* 12. SYSTEM SETTINGS */}
      {activeSection === 'SETTINGS' && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await postAction({ action: 'SAVE_PLATFORM_SETTINGS', ...platformForm }, 'Platform settings saved!');
          }}
          className="bg-white rounded-3xl border border-[#E8DFD3] p-6 space-y-4 max-w-2xl"
        >
          <h3 className="text-sm font-black text-[#331E17] flex items-center gap-2"><Settings className="w-4 h-4 text-[#8E1521]" /> SaaS Platform System Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-1">Platform Name</label>
              <input value={platformForm.platformName} onChange={(e) => setPlatformForm({ ...platformForm, platformName: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl font-bold" />
            </div>
            <div>
              <label className="block font-bold mb-1">Support Email</label>
              <input value={platformForm.supportEmail} onChange={(e) => setPlatformForm({ ...platformForm, supportEmail: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl" />
            </div>
            <div>
              <label className="block font-bold mb-1">Support Phone</label>
              <input value={platformForm.supportPhone} onChange={(e) => setPlatformForm({ ...platformForm, supportPhone: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl font-mono" />
            </div>
            <div>
              <label className="block font-bold mb-1">Default GST Rate (%)</label>
              <input type="number" step="0.5" value={platformForm.defaultTaxRate} onChange={(e) => setPlatformForm({ ...platformForm, defaultTaxRate: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl font-mono" />
            </div>
            <div>
              <label className="block font-bold mb-1">Default Trial Days</label>
              <input type="number" value={platformForm.defaultTrialDays} onChange={(e) => setPlatformForm({ ...platformForm, defaultTrialDays: e.target.value })} className="w-full px-3 py-2 bg-[#FCF9F4] border border-[#E3D8C8] rounded-xl font-mono" />
            </div>
            <label className="flex items-center gap-2 pt-5 font-bold cursor-pointer">
              <input type="checkbox" checked={platformForm.maintenanceMode} onChange={(e) => setPlatformForm({ ...platformForm, maintenanceMode: e.target.checked })} className="accent-[#8E1521]" />
              <span>Enable Maintenance Banner</span>
            </label>
          </div>
          <button type="submit" className="px-5 py-2.5 bg-[#8E1521] text-white font-black rounded-xl cursor-pointer">Save Platform Settings</button>
        </form>
      )}
    </div>
  );
}
