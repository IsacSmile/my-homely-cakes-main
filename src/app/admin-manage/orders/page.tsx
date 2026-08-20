'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart, Phone, Clock, CheckCircle2, AlertCircle, Filter, Loader2, Trash2,
  CheckSquare, Square, RefreshCw, Cake, Calendar, TrendingUp, X, MessageSquare, ArrowRight, Printer
} from 'lucide-react';
import { formatINR } from '@/lib/pricing';
import { AdminOrderRowSkeleton } from '@/components/ui/Skeletons';
import { formatDisplay12 } from '@/components/ui/TimePicker';
import { useAdminOrders } from '@/context/AdminOrderContext';
import ThermalReceiptModal from '@/components/ThermalReceiptModal';

const formatDateInput = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const presets = [
  {
    label: 'Today',
    getValue: () => {
      const today = formatDateInput(new Date());
      return { from: today, to: today };
    },
  },
  {
    label: 'Yesterday',
    getValue: () => {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = formatDateInput(y);
      return { from: yStr, to: yStr };
    },
  },
  {
    label: 'Last 7 Days',
    getValue: () => {
      const today = formatDateInput(new Date());
      const past = new Date();
      past.setDate(past.getDate() - 6);
      return { from: formatDateInput(past), to: today };
    },
  },
  {
    label: 'Last 30 Days',
    getValue: () => {
      const today = formatDateInput(new Date());
      const past = new Date();
      past.setDate(past.getDate() - 29);
      return { from: formatDateInput(past), to: today };
    },
  },
  {
    label: 'This Month',
    getValue: () => {
      const today = formatDateInput(new Date());
      const first = new Date();
      first.setDate(1);
      return { from: formatDateInput(first), to: today };
    },
  },
  {
    label: 'All Time',
    getValue: () => ({ from: '', to: '' }),
  },
];

const statusTabs = [
  { key: 'all', label: 'ALL' },
  { key: 'new', label: 'NEW' },
  { key: 'contacted', label: 'CONTACTED' },
  { key: 'confirmed', label: 'CONFIRMED' },
  { key: 'completed', label: 'COMPLETED' },
  { key: 'cancelled', label: 'CANCELLED' },
];

export default function AdminOrdersPage() {
  const {
    orders,
    statusCounts,
    totalRevenue,
    isLoading,
    fetchOrders,
    updateOrderStatus,
    updateConsumerStatus,
    deleteSingleOrder,
    deleteBulkOrders,
    highlightedOrderId,
  } = useAdminOrders();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [activePreset, setActivePreset] = useState<string | null>('All Time');
  const [dateValidationError, setDateValidationError] = useState<string | null>(null);

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<any | null>(null);
  const [ordersForPrint, setOrdersForPrint] = useState<any[] | null>(null);

  // Read initial query params from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const initialFrom = urlParams.get('from') || '';
      const initialTo = urlParams.get('to') || '';
      const initialStatus = (urlParams.get('status') || 'all').toLowerCase();

      if (initialFrom) setFromDate(initialFrom);
      if (initialTo) setToDate(initialTo);
      if (initialStatus) setFilterStatus(initialStatus);

      if (!initialFrom && !initialTo) {
        setActivePreset('All Time');
      } else {
        setActivePreset(null);
      }

      fetchOrders(true, initialFrom, initialTo, initialStatus);
    }
  }, [fetchOrders]);

  const handleFetchWithFilters = (f?: string, t?: string, st?: string, showSkeleton: boolean = false) => {
    const fromVal = f !== undefined ? f : fromDate;
    const toVal = t !== undefined ? t : toDate;
    const statusVal = st !== undefined ? st : filterStatus;

    if (fromVal && toVal && new Date(fromVal) > new Date(toVal)) {
      setDateValidationError('From date cannot be after To date.');
      return;
    }
    setDateValidationError(null);

    const params = new URLSearchParams();
    if (fromVal) params.set('from', fromVal);
    if (toVal) params.set('to', toVal);
    if (statusVal && statusVal !== 'all') params.set('status', statusVal);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    if (typeof window !== 'undefined') {
      const newUrl = `${window.location.pathname}${queryStr}`;
      window.history.replaceState(null, '', newUrl);
    }

    fetchOrders(showSkeleton, fromVal, toVal, statusVal);
  };

  const handleApplyPreset = (preset: typeof presets[0]) => {
    const { from, to } = preset.getValue();
    setFromDate(from);
    setToDate(to);
    setActivePreset(preset.label);
    handleFetchWithFilters(from, to, filterStatus, true);
  };

  const handleFromDateChange = (val: string) => {
    setFromDate(val);
    setActivePreset(null);
    handleFetchWithFilters(val, toDate, filterStatus, true);
  };

  const handleToDateChange = (val: string) => {
    setToDate(val);
    setActivePreset(null);
    handleFetchWithFilters(fromDate, val, filterStatus, true);
  };

  const handleClearDateFilter = () => {
    setFromDate('');
    setToDate('');
    setActivePreset('All Time');
    handleFetchWithFilters('', '', filterStatus, true);
  };

  const handleStatusTabClick = (stKey: string) => {
    setFilterStatus(stKey);
    handleFetchWithFilters(fromDate, toDate, stKey, false);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConsumerStatusUpdate = async (orderId: string, newConsumerStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateConsumerStatus(orderId, newConsumerStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteSingle = async (orderId: string, orderNum: string, custName: string) => {
    if (!confirm(`Delete order ${orderNum} from ${custName}? This action cannot be undone.`)) return;

    setUpdatingId(orderId);
    try {
      const success = await deleteSingleOrder(orderId);
      if (success) {
        setSelectedIds(prev => prev.filter(id => id !== orderId));
      } else {
        alert('Failed to delete order.');
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBulkDeleteAction = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Permanently delete ${selectedIds.length} selected order(s)? This action cannot be undone.`)) return;

    setIsBulkDeleting(true);
    try {
      const success = await deleteBulkOrders(selectedIds);
      if (success) {
        setSelectedIds([]);
      } else {
        alert('Failed to delete selected orders.');
      }
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(o => (o.status || 'new').toLowerCase() === filterStatus.toLowerCase());

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

  return (
    <div className="space-y-6">
      {/* Header & Bulk Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-bakery-200/80 shadow-soft">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-bakery-chocolate">
            Order Management ({orders.length})
          </h1>
          <p className="text-xs text-bakery-600 mt-0.5">
            Manage customer order workflow stages, continuous audio notifications, and delivery progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => {
                  const selectedList = orders.filter(o => selectedIds.includes(o.id));
                  setOrdersForPrint(selectedList);
                }}
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-soft transition-all active:scale-95 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Print Selected ({selectedIds.length})</span>
              </button>

              <button
                onClick={handleBulkDeleteAction}
                disabled={isBulkDeleting}
                className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-soft transition-all active:scale-95 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            </>
          )}

          <button
            onClick={() => handleFetchWithFilters(fromDate, toDate, filterStatus, true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-full hover:bg-amber-100 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-bakery-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold shrink-0">
            <ShoppingCart className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-bakery-600 uppercase tracking-wider block">Orders in Range</span>
            <span className="font-serif text-xl font-bold text-bakery-chocolate">{orders.length} Orders</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-bakery-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-bakery-600 uppercase tracking-wider block">Total Revenue in Range</span>
            <span className="font-serif text-xl font-bold text-emerald-800">{formatINR(totalRevenue)}</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-bakery-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-900 flex items-center justify-center font-bold shrink-0">
            <Calendar className="w-5 h-5 text-sky-700" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-bakery-600 uppercase tracking-wider block">Active Date Range</span>
            <span className="text-xs font-bold text-bakery-chocolate block truncate">
              {fromDate || toDate ? `${fromDate || 'Start'} to ${toDate || 'Today'}` : 'All Time (No Filter)'}
            </span>
          </div>
        </div>
      </div>

      {/* Date Range Filter Controls Container */}
      <div className="bg-white p-5 rounded-3xl border border-bakery-200/80 shadow-soft space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-700" />
            <span className="text-xs font-bold text-bakery-chocolate uppercase tracking-wider">Filter by Order Date</span>
          </div>

          {/* Presets Toolbar */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {presets.map(p => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activePreset === p.label
                    ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : 'bg-bakery-50 text-bakery-700 border border-bakery-200/80 hover:bg-bakery-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Inputs + Clear Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-bakery-100">
          <div className="flex items-center gap-2 flex-1">
            <label className="text-xs font-bold text-bakery-700 shrink-0">From:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => handleFromDateChange(e.target.value)}
              className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3 py-2 text-xs text-bakery-chocolate font-semibold focus:outline-none focus:border-amber-600"
            />
          </div>

          <div className="flex items-center gap-2 flex-1">
            <label className="text-xs font-bold text-bakery-700 shrink-0">To:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => handleToDateChange(e.target.value)}
              className="w-full bg-bakery-50 border border-bakery-200 rounded-xl px-3 py-2 text-xs text-bakery-chocolate font-semibold focus:outline-none focus:border-amber-600"
            />
          </div>

          {(fromDate || toDate) && (
            <button
              type="button"
              onClick={handleClearDateFilter}
              className="inline-flex items-center justify-center gap-1 bg-bakery-100 hover:bg-bakery-200 text-bakery-800 text-xs font-bold px-4 py-2 rounded-xl border border-bakery-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Range</span>
            </button>
          )}
        </div>

        {/* Date Validation Alert */}
        {dateValidationError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{dateValidationError}</span>
          </div>
        )}
      </div>

      {/* Filter Tabs & Bulk Select Checkbox */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {statusTabs.map(tab => {
            const count = statusCounts[tab.key] || 0;
            const isSelected = filterStatus === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleStatusTabClick(tab.key)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-soft font-bold'
                    : 'bg-white text-bakery-chocolate border border-bakery-200 hover:bg-bakery-100'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : tab.key === 'new' && count > 0
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-bakery-100 text-bakery-800'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {filteredOrders.length > 0 && (
          <button
            type="button"
            onClick={toggleSelectAll}
            className="text-xs font-semibold text-bakery-chocolate flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-bakery-200 hover:bg-bakery-50"
          >
            {isAllSelected ? <CheckSquare className="w-4 h-4 text-amber-600" /> : <Square className="w-4 h-4 text-bakery-400" />}
            <span>Select All ({filteredOrders.length})</span>
          </button>
        )}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          <AdminOrderRowSkeleton />
          <AdminOrderRowSkeleton />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-bakery-200 text-center space-y-3">
          <ShoppingCart className="w-10 h-10 text-bakery-300 mx-auto" />
          <h3 className="font-serif text-base font-bold text-bakery-chocolate">
            {fromDate || toDate
              ? 'No Orders Found in Selected Date Range'
              : `No Orders in "${filterStatus.toUpperCase()}" Status`}
          </h3>
          <p className="text-xs text-bakery-600 max-w-md mx-auto">
            {fromDate || toDate
              ? 'Try picking a broader date range or click "Reset Range" to view all recorded orders.'
              : 'New customer orders will automatically appear here in real-time with looping sound alerts.'}
          </p>
          {(fromDate || toDate) && (
            <button
              onClick={handleClearDateFilter}
              className="inline-flex items-center gap-1.5 bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-full shadow-xs hover:bg-amber-500 transition-colors mt-2"
            >
              <span>Reset Date Filter</span>
            </button>
          )}
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
            const currentStatus = (order.status || 'new').toLowerCase();
            const isUpdatingThis = updatingId === order.id;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl p-5 md:p-6 border shadow-soft transition-all ${
                  highlightedOrderId === order.id
                    ? 'border-amber-500 ring-4 ring-amber-400/80 bg-amber-100/60 animate-pulse'
                    : currentStatus === 'new'
                    ? 'border-rose-400 ring-2 ring-rose-500/20 bg-rose-50/10'
                    : 'border-bakery-200'
                } ${isChecked ? 'ring-2 ring-amber-500/40 bg-amber-50/20' : ''}`}
              >
                {/* Row Top Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-bakery-100 pb-4">
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-extrabold text-amber-800 text-base">
                          {order.orderNumber}
                        </span>

                        {/* Internal Admin Status Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            currentStatus === 'new'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                              : currentStatus === 'contacted'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : currentStatus === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : currentStatus === 'completed'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : 'bg-gray-100 text-gray-800 border border-gray-300'
                          }`}
                        >
                          Status: {currentStatus}
                        </span>

                        {/* Consumer Facing Status Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wide uppercase border ${
                            (order.consumerStatus || 'received') === 'received'
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : order.consumerStatus === 'processing'
                              ? 'bg-sky-50 text-sky-900 border-sky-300'
                              : order.consumerStatus === 'baking'
                              ? 'bg-orange-50 text-orange-900 border-orange-300'
                              : order.consumerStatus === 'packed'
                              ? 'bg-purple-50 text-purple-900 border-purple-300'
                              : order.consumerStatus === 'dispatched'
                              ? 'bg-indigo-50 text-indigo-900 border-indigo-300'
                              : order.consumerStatus === 'delivered'
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                              : 'bg-rose-50 text-rose-900 border-rose-300'
                          }`}
                        >
                          Customer: {order.consumerStatus || 'received'}
                        </span>
                      </div>
                      <p className="text-xs text-bakery-400 mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Status Workflow Controls */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Print Thermal Receipt Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedOrderForPrint(order)}
                      className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                      title="Print 80mm thermal receipt / tax invoice"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>Print Receipt</span>
                    </button>

                    {/* Call Customer Button */}
                    <a
                      href={`tel:${order.mobile}`}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>

                    {/* Standard Workflow Quick Action Buttons */}
                    {currentStatus === 'new' && (
                      <>
                        <button
                          type="button"
                          disabled={isUpdatingThis}
                          onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                          className="inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all disabled:opacity-50"
                          title="Acknowledge order and mark Confirmed (stops audio loop)"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Confirmed</span>
                        </button>

                        <button
                          type="button"
                          disabled={isUpdatingThis}
                          onClick={() => handleStatusUpdate(order.id, 'contacted')}
                          className="inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all disabled:opacity-50"
                          title="Mark order Contacted (stops audio loop for this order)"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Mark Contacted</span>
                        </button>
                      </>
                    )}

                    {currentStatus === 'contacted' && (
                      <button
                        type="button"
                        disabled={isUpdatingThis}
                        onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                        className="inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Confirmed</span>
                      </button>
                    )}

                    {currentStatus === 'confirmed' && (
                      <button
                        type="button"
                        disabled={isUpdatingThis}
                        onClick={() => handleStatusUpdate(order.id, 'completed')}
                        className="inline-flex items-center gap-1 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all disabled:opacity-50"
                        title="Mark Completed and credit loyalty points to customer"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Mark Completed</span>
                      </button>
                    )}

                    {/* Manual Status Override Select Dropdown */}
                    <div className="relative">
                      <select
                        value={currentStatus}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        disabled={isUpdatingThis}
                        className="bg-bakery-50 border border-bakery-300 text-bakery-chocolate text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-600 cursor-pointer"
                        title="Manual internal order status override"
                      >
                        <option value="new">Status: NEW</option>
                        <option value="contacted">Status: CONTACTED</option>
                        <option value="confirmed">Status: CONFIRMED</option>
                        <option value="completed">Status: COMPLETED</option>
                        <option value="cancelled">Status: CANCELLED</option>
                      </select>
                    </div>

                    {/* Consumer Status Update Dropdown */}
                    <div className="flex items-center gap-1 bg-amber-50 p-1 rounded-xl border border-amber-200">
                      <select
                        value={order.consumerStatus || 'received'}
                        onChange={(e) => handleConsumerStatusUpdate(order.id, e.target.value)}
                        disabled={isUpdatingThis}
                        className="bg-white border border-amber-300 text-amber-950 text-xs font-bold rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                        title="Update status visible to customer on order tracking"
                      >
                        <option value="received">Customer: Received</option>
                        <option value="processing">Customer: Processing</option>
                        <option value="baking">Customer: Baking</option>
                        <option value="packed">Customer: Packed</option>
                        <option value="dispatched">Customer: Dispatched</option>
                        <option value="delivered">Customer: Delivered</option>
                        <option value="cancelled">Customer: Cancelled</option>
                      </select>
                    </div>

                    {/* Delete Order Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteSingle(order.id, order.orderNumber, order.customerName)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
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
                    <p>
                      <strong>Customer:</strong> {order.customerName}
                    </p>
                    <p>
                      <strong>Mobile:</strong>{' '}
                      <a href={`tel:${order.mobile}`} className="text-blue-700 underline font-semibold">
                        {order.mobile}
                      </a>
                    </p>
                    {order.deliveryCity && (
                      <p>
                        <strong>City:</strong> {order.deliveryCity}
                      </p>
                    )}
                    {(order.deliveryDate || order.deliveryTime) && (
                      <p>
                        <strong>Delivery:</strong>{' '}
                        <span className="font-semibold text-amber-800">
                          {order.deliveryDate || ''}
                          {order.deliveryDate && order.deliveryTime ? ' • ' : ''}
                          {order.deliveryTime ? formatDisplay12(order.deliveryTime) : ''}
                        </span>
                      </p>
                    )}
                    {order.cakeMessage && (
                      <p className="text-amber-900 font-medium italic flex items-start gap-1">
                        <Cake className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <span>
                          <strong className="not-italic">Cake Message:</strong> &ldquo;{order.cakeMessage}&rdquo;
                        </span>
                      </p>
                    )}
                    {order.notes && (
                      <p className="text-amber-800 font-medium">
                        <strong>Notes:</strong> {order.notes}
                      </p>
                    )}
                  </div>

                  {/* Items list */}
                  <div className="md:col-span-8 space-y-2">
                    <span className="font-bold text-bakery-chocolate uppercase tracking-wider block">
                      Ordered Cake Items ({itemsList.length}):
                    </span>
                    <div className="space-y-2 bg-bakery-50/80 p-3 rounded-2xl border border-bakery-200/80">
                      {itemsList.map((it: any, idx: number) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-bakery-200/70 shadow-xs space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-bakery-chocolate flex items-center gap-1.5">
                              <Cake className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span>
                                {it.name} ({it.weightG >= 1000 ? `${it.weightG / 1000}kg` : `${it.weightG}g`}) × {it.qty}
                              </span>
                            </span>
                            <span className="font-price font-bold text-amber-800">
                              {formatINR(it.lineTotal || it.calculatedPrice * it.qty)}
                            </span>
                          </div>

                          {it.cakeMessage ? (
                            <div className="bg-amber-50/90 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200/80 text-[11px] font-medium">
                              <span className="font-extrabold text-amber-800">Cake Message:</span> &ldquo;{it.cakeMessage}&rdquo;
                            </div>
                          ) : (
                            <div className="text-[10px] text-bakery-400 italic">No message requested for this cake</div>
                          )}

                          {it.specialNotes && (
                            <div className="bg-blue-50/80 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-200/70 text-[11px] font-medium">
                              <span className="font-extrabold text-blue-800">Item Notes / Instructions:</span> &ldquo;
                              {it.specialNotes}&rdquo;
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 space-y-1 text-xs">
                      {Boolean(order.discountAmount && order.discountAmount > 0) && (
                        <div className="flex justify-between text-emerald-700 font-semibold">
                          <span>Offer Discount:</span>
                          <span>-₹{order.discountAmount}</span>
                        </div>
                      )}
                      {Boolean(order.pointsDiscountAmount && order.pointsDiscountAmount > 0) && (
                        <div className="flex justify-between text-amber-800 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          <span>Points Redeemed ({order.pointsRedeemed || 0} pts):</span>
                          <span>-₹{order.pointsDiscountAmount}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center font-bold text-sm text-bakery-chocolate pt-1 border-t border-bakery-200">
                        <span>Total Amount to Collect:</span>
                        <span className="font-price text-lg font-medium text-amber-800 tracking-tight">
                          {formatINR(order.totalAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-amber-700 font-medium pt-1">
                        <span>Points Earned on Order:</span>
                        <span className="font-bold">
                          +{order.pointsCredited ? (order.pointsEarned || 0) : Math.floor(order.totalAmount / 100) * 5} pts
                          {order.pointsCredited ? ' (Credited)' : ' (Credited on Completion)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Thermal Receipt Print Modal (Single or Multi-Select Batch) */}
      <ThermalReceiptModal
        order={selectedOrderForPrint}
        orders={ordersForPrint}
        isOpen={Boolean(selectedOrderForPrint || (ordersForPrint && ordersForPrint.length > 0))}
        onClose={() => {
          setSelectedOrderForPrint(null);
          setOrdersForPrint(null);
        }}
      />
    </div>
  );
}
