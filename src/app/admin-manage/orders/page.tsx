'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Phone, Clock, CheckCircle2, AlertCircle, Filter, Loader2, Trash2, CheckSquare, Square, RefreshCw } from 'lucide-react';
import { formatINR } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const fetchOrders = () => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.orders) setOrders(data.orders);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); // Auto-refresh orders every 15s
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (e) {
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteSingleOrder = async (orderId: string, orderNum: string, custName: string) => {
    if (!confirm(`Delete order ${orderNum} from ${custName}? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        setSelectedIds(prev => prev.filter(id => id !== orderId));
      } else {
        alert('Failed to delete order.');
      }
    } catch (e) {
      alert('Error deleting order.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to permanently delete ${selectedIds.length} selected order(s)? This action cannot be undone.`)) return;

    setIsBulkDeleting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: selectedIds }),
      });

      if (res.ok) {
        setOrders(prev => prev.filter(o => !selectedIds.includes(o.id)));
        setSelectedIds([]);
      } else {
        alert('Failed to delete selected orders.');
      }
    } catch (e) {
      alert('Error performing bulk order deletion.');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const filteredOrders = filterStatus === 'All'
    ? orders
    : orders.filter(o => o.status.toLowerCase() === filterStatus.toLowerCase());

  const isAllSelected = filteredOrders.length > 0 && filteredOrders.every(o => selectedIds.includes(o.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map(o => o.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const statuses = ['All', 'new', 'contacted', 'confirmed', 'completed', 'cancelled'];

  return (
    <div className="space-y-6">
      
      {/* Header & Bulk Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-bakery-200/80 shadow-soft">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-bakery-chocolate">
            Order Management ({orders.length})
          </h1>
          <p className="text-xs text-bakery-600 mt-0.5">
            View customer requests, update status, call customers, or remove completed/cancelled orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-soft transition-all active:scale-95 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-full hover:bg-amber-100 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Bulk Select Checkbox */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {statuses.map(st => {
            const count = st === 'All' ? orders.length : orders.filter(o => o.status === st).length;
            const isSelected = filterStatus === st;
            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-soft'
                    : 'bg-white text-bakery-chocolate border border-bakery-200 hover:bg-bakery-100'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>

        {filteredOrders.length > 0 && (
          <button
            type="button"
            onClick={toggleSelectAll}
            className="text-xs font-semibold text-bakery- chocolate flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-bakery-200 hover:bg-bakery-50"
          >
            {isAllSelected ? <CheckSquare className="w-4 h-4 text-amber-600" /> : <Square className="w-4 h-4 text-bakery-400" />}
            <span>Select All ({filteredOrders.length})</span>
          </button>
        )}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-bakery-600">Loading order log...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-bakery-200 text-center space-y-3">
          <ShoppingCart className="w-10 h-10 text-bakery-300 mx-auto" />
          <h3 className="font-serif text-base font-bold text-bakery-chocolate">No Orders in &quot;{filterStatus}&quot;</h3>
          <p className="text-xs text-bakery-600">New customer orders will automatically appear here in real-time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            let itemsList = [];
            try {
              itemsList = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
            } catch (e) {
              itemsList = [];
            }

            const isChecked = selectedIds.includes(order.id);

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl p-5 md:p-6 border shadow-soft transition-all ${
                  order.status === 'new' ? 'border-rose-300 ring-2 ring-rose-500/20' : 'border-bakery-200'
                } ${isChecked ? 'ring-2 ring-amber-500/40 bg-amber-50/20' : ''}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-bakery-100 pb-4">
                  <div className="flex items-center gap-3">
                    {/* Select Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleSelectOne(order.id)}
                      className="p-1 text-bakery-400 hover:text-amber-700"
                    >
                      {isChecked ? <CheckSquare className="w-5 h-5 text-amber-600" /> : <Square className="w-5 h-5 text-bakery-300" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-extrabold text-amber-800 text-base">
                          {order.orderNumber}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          order.status === 'new' ? 'bg-rose-100 text-rose-800 animate-pulse' :
                          order.status === 'contacted' ? 'bg-amber-100 text-amber-900' :
                          order.status === 'confirmed' ? 'bg-emerald-100 text-emerald-900' :
                          order.status === 'completed' ? 'bg-blue-100 text-blue-900' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-bakery-400 mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Status Selector */}
                  <div className="flex items-center gap-3">
                    <a
                      href={`tel:${order.mobile}`}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call {order.mobile}</span>
                    </a>

                    {/* Status Update Dropdown */}
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className="bg-bakery-50 border border-bakery-300 text-bakery-chocolate text-xs font-bold rounded-full px-3 py-2 focus:outline-none focus:border-amber-600"
                      >
                        <option value="new">Mark New</option>
                        <option value="contacted">Mark Contacted</option>
                        <option value="confirmed">Mark Confirmed</option>
                        <option value="completed">Mark Completed</option>
                        <option value="cancelled">Mark Cancelled</option>
                      </select>
                    </div>

                    {/* Visually Muted Delete Order Action Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteSingleOrder(order.id, order.orderNumber, order.customerName)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-full border border-rose-200/60 transition-colors"
                      title="Delete Order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Customer Details & Items Breakdown */}
                <div className="pt-4 grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
                  
                  {/* Customer info */}
                  <div className="md:col-span-4 space-y-1.5 border-r border-bakery-100 pr-4">
                    <p><strong>Customer Name:</strong> {order.customerName}</p>
                    <p><strong>Mobile:</strong> <a href={`tel:${order.mobile}`} className="text-blue-700 underline font-semibold">{order.mobile}</a></p>
                    {order.address && <p><strong>Delivery Location:</strong> {order.address}</p>}
                    {order.notes && <p className="text-amber-800 font-medium"><strong>Notes:</strong> {order.notes}</p>}
                  </div>

                  {/* Items list */}
                  <div className="md:col-span-8 space-y-2">
                    <span className="font-bold text-bakery-chocolate uppercase tracking-wider block">Ordered Cake Items:</span>
                    <div className="space-y-1 bg-bakery-50 p-3 rounded-2xl border border-bakery-100">
                      {itemsList.map((it: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs py-1">
                          <span className="font-medium text-bakery-chocolate">
                            • {it.name} ({it.weightG >= 1000 ? `${it.weightG / 1000}kg` : `${it.weightG}g`}) × {it.qty}
                          </span>
                          <span className="font-price font-medium text-amber-800">
                            {formatINR(it.lineTotal || (it.calculatedPrice * it.qty))}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 font-bold text-sm text-bakery-chocolate">
                      <span>Total Amount to Collect:</span>
                      <span className="font-price text-lg font-medium text-amber-800 tracking-tight">{formatINR(order.totalAmount)}</span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
