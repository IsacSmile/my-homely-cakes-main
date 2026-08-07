'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Phone, MessageCircle, Clock, CheckCircle2, AlertCircle, Filter, Loader2 } from 'lucide-react';
import { formatINR } from '@/lib/pricing';
import { generateCustomerWhatsAppUrl } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  const filteredOrders = filterStatus === 'All'
    ? orders
    : orders.filter(o => o.status.toLowerCase() === filterStatus.toLowerCase());

  const statuses = ['All', 'new', 'contacted', 'confirmed', 'completed', 'cancelled'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-bakery-chocolate">
            Order Management
          </h1>
          <p className="text-xs text-bakery-600">
            View customer order requests, tap-to-call mobile links, and manage fulfillment workflow.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-4 py-2 rounded-full hover:bg-amber-100 transition-colors self-start sm:self-auto"
        >
          🔄 Refresh Orders
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
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

            const whatsappLink = generateCustomerWhatsAppUrl(order.mobile, order.orderNumber, order.customerName);

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl p-5 md:p-6 border shadow-soft transition-all ${
                  order.status === 'new' ? 'border-rose-300 ring-2 ring-rose-500/20' : 'border-bakery-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-bakery-100 pb-4">
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
                    <p className="text-xs text-bakery-400 mt-1">
                      Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
                    </p>
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

                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold px-3 py-2 rounded-full"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
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
                          <span className="font-serif font-bold text-amber-800">
                            {formatINR(it.lineTotal || (it.calculatedPrice * it.qty))}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 font-bold text-sm text-bakery-chocolate">
                      <span>Total Amount to Collect:</span>
                      <span className="font-serif text-lg text-amber-800">{formatINR(order.totalAmount)}</span>
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
