'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Cake, Search, MousePointer, Mail, TrendingUp, Calendar, ArrowUpRight, RotateCcw, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { formatINR } from '@/lib/pricing';
import { Skeleton } from '@/components/ui/Skeleton';
import { AdminStatCardSkeleton } from '@/components/ui/Skeletons';

type ResetScope = 'top_orders' | 'searched_terms' | 'most_clicked' | 'all_three';

interface ResetTarget {
  scope: ResetScope;
  name: string;
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Reset Modal & Toast States
  const [resetTarget, setResetTarget] = useState<ResetTarget | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.status === 401) {
        window.location.href = '/admin-manage';
        return;
      }
      const json = await res.json();
      if (json) setData(json);
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleConfirmReset = async () => {
    if (!resetTarget) return;
    setIsResetting(true);

    try {
      const res = await fetch('/api/admin/analytics/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: resetTarget.scope }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to reset analytics');
      }

      // Dynamically update local state immediately without full page refresh
      setData((prevData: any) => {
        if (!prevData) return prevData;
        const updated = { ...prevData };

        if (resetTarget.scope === 'top_orders' || resetTarget.scope === 'all_three') {
          updated.topProducts = [];
        }
        if (resetTarget.scope === 'searched_terms' || resetTarget.scope === 'all_three') {
          updated.topSearches = [];
        }
        if (resetTarget.scope === 'most_clicked' || resetTarget.scope === 'all_three') {
          updated.topClicks = [];
        }

        return updated;
      });

      triggerToast(`${resetTarget.name} analytics cleared successfully.`);
      setResetTarget(null);

      // Background sync with database
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'An error occurred while resetting analytics.');
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <AdminStatCardSkeleton />
          <AdminStatCardSkeleton />
          <AdminStatCardSkeleton />
          <AdminStatCardSkeleton />
        </div>
      </div>
    );
  }

  if (!data || !data.stats) {
    return <div className="py-20 text-center text-xs text-rose-600">Failed to load analytics data.</div>;
  }

  const stats = data.stats || {};
  const topProducts = Array.isArray(data.topProducts) ? data.topProducts : [];
  const topSearches = Array.isArray(data.topSearches) ? data.topSearches : [];
  const topClicks = Array.isArray(data.topClicks) ? data.topClicks : [];
  const recentOrders = Array.isArray(data.recentOrders) ? data.recentOrders : [];

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-bakery-chocolate">
            Store Executive Overview
          </h1>
          <p className="text-xs text-bakery-600">
            Real-time sales, search analytics, and customer activity for MyHomelyCake Trivandrum.
          </p>
        </div>
        <Link
          href="/admin-manage/orders"
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-soft transition-colors self-start sm:self-auto"
        >
          <span>View All Orders ({stats.newOrdersBadgeCount} New)</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Today's Orders */}
        <div className="bg-white p-5 rounded-3xl border border-bakery-200 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-bakery-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Today&apos;s Orders</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-extrabold text-bakery-chocolate">
            {stats.todayOrdersCount}
          </div>
          <span className="text-[11px] text-amber-800 font-medium">Orders placed today</span>
        </div>

        {/* Weekly Orders */}
        <div className="bg-white p-5 rounded-3xl border border-bakery-200 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-bakery-600">
            <span className="text-xs font-semibold uppercase tracking-wider">This Week</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-extrabold text-bakery-chocolate">
            {stats.weekOrdersCount}
          </div>
          <span className="text-[11px] text-emerald-800 font-medium">Past 7 days total</span>
        </div>

        {/* Monthly Orders & Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-bakery-200 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-bakery-600">
            <span className="text-xs font-semibold uppercase tracking-wider">This Month</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-extrabold text-bakery-chocolate">
            {stats.monthOrdersCount}
          </div>
          <span className="text-[11px] text-blue-800 font-medium">
            Est. Revenue: {formatINR(stats.monthRevenue)}
          </span>
        </div>

        {/* Email Signups */}
        <div className="bg-white p-5 rounded-3xl border border-bakery-200 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-bakery-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Subscribers</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-3xl font-extrabold text-bakery-chocolate">
            {stats.subscribersCount}
          </div>
          <span className="text-[11px] text-purple-800 font-medium">Newsletter captured</span>
        </div>

      </div>

      {/* Analytics Section Header with Bulk Reset Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <h2 className="font-serif text-xl font-bold text-bakery-chocolate">
          Product & Engagement Analytics
        </h2>
        <button
          type="button"
          onClick={() =>
            setResetTarget({
              scope: 'all_three',
              name: 'All Product Analytics (Orders, Searches, Clicks)',
            })
          }
          className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold px-3.5 py-1.5 rounded-full border border-rose-200 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          title="Reset section data for all three analytics cards"
        >
          <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
          <span>Reset Product Analytics</span>
        </button>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Top Ordered Cakes */}
        <div className="bg-white p-6 rounded-3xl border border-bakery-200 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-bakery-100 pb-3">
            <div className="flex items-center gap-2">
              <Cake className="w-5 h-5 text-amber-700" />
              <h3 className="font-serif text-lg font-bold text-bakery-chocolate">Top Ordered Cakes</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">Weekly</span>
              <button
                type="button"
                onClick={() =>
                  setResetTarget({
                    scope: 'top_orders',
                    name: 'Top Ordered Cakes',
                  })
                }
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Reset section data"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="divide-y divide-bakery-100">
            {topProducts.length === 0 ? (
              <p className="py-6 text-xs text-bakery-400 text-center">No order metrics logged yet.</p>
            ) : (
              topProducts.map((p: any, idx: number) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xs text-amber-700 w-4">#{idx + 1}</span>
                    <div>
                      <h4 className="text-xs font-bold text-bakery-chocolate line-clamp-1">{p.name}</h4>
                      <span className="text-[10px] text-bakery-600">{p.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-serif text-xs font-bold text-bakery-chocolate block">{p.orderCount} orders</span>
                    <span className="text-[10px] text-amber-800 font-semibold">{formatINR(p.price)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Most Searched Terms */}
        <div className="bg-white p-6 rounded-3xl border border-bakery-200 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-bakery-100 pb-3">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-700" />
              <h3 className="font-serif text-lg font-bold text-bakery-chocolate">Most Searched Terms</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">Analytics</span>
              <button
                type="button"
                onClick={() =>
                  setResetTarget({
                    scope: 'searched_terms',
                    name: 'Most Searched Terms',
                  })
                }
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Reset section data"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="divide-y divide-bakery-100">
            {topSearches.length === 0 ? (
              <p className="py-6 text-xs text-bakery-400 text-center">No search queries logged yet.</p>
            ) : (
              topSearches.map((s: any) => (
                <div key={s.query} className="py-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-bakery-chocolate capitalize">&quot;{s.query}&quot;</span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                    {s.count} searches
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Most Clicked Cakes */}
        <div className="bg-white p-6 rounded-3xl border border-bakery-200 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-bakery-100 pb-3">
            <div className="flex items-center gap-2">
              <MousePointer className="w-5 h-5 text-purple-700" />
              <h3 className="font-serif text-lg font-bold text-bakery-chocolate">Most Clicked Cakes</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded">Engagement</span>
              <button
                type="button"
                onClick={() =>
                  setResetTarget({
                    scope: 'most_clicked',
                    name: 'Most Clicked Cakes',
                  })
                }
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Reset section data"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="divide-y divide-bakery-100">
            {topClicks.length === 0 ? (
              <p className="py-6 text-xs text-bakery-400 text-center">No click events logged yet.</p>
            ) : (
              topClicks.map((c: any) => (
                <div key={c.productId} className="py-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-bakery-chocolate truncate max-w-[170px]">{c.name}</span>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
                    {c.count} clicks
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Recent Orders Quick View Table */}
      <div className="bg-white p-6 rounded-3xl border border-bakery-200 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-bakery-100 pb-3">
          <h3 className="font-serif text-lg font-bold text-bakery-chocolate">Recent Orders</h3>
          <Link href="/admin-manage/orders" className="text-xs font-bold text-amber-800 hover:underline">
            View All Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-bakery-100 text-bakery-600 uppercase font-bold">
                <th className="py-2.5 px-3">Order Ref</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Mobile Phone</th>
                <th className="py-2.5 px-3">Total Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Placed Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bakery-100 text-bakery-chocolate">
              {recentOrders.map((ord: any) => (
                <tr key={ord.id} className="hover:bg-bakery-50">
                  <td className="py-3 px-3 font-mono font-bold text-amber-800">{ord.orderNumber}</td>
                  <td className="py-3 px-3 font-medium">{ord.customerName}</td>
                  <td className="py-3 px-3">
                    <a href={`tel:${ord.mobile}`} className="text-blue-700 hover:underline font-medium">
                      {ord.mobile}
                    </a>
                  </td>
                  <td className="py-3 px-3 font-bold">{formatINR(ord.totalAmount)}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      ord.status === 'new' ? 'bg-rose-100 text-rose-800' :
                      ord.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                      ord.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-bakery-400">
                    {new Date(ord.createdAt).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation & Safety Modal */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  Reset Analytics Data
                </h3>
                <p className="text-xs text-slate-500">
                  Confirmation required for target scope
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-700 space-y-2">
              <p className="font-medium">
                Are you sure you want to reset <span className="font-bold text-rose-700">{resetTarget.name}</span> analytics? This action cannot be undone.
              </p>
              <p className="text-[11px] text-slate-500 italic">
                Note: Core orders, customer data, and sales revenue will remain completely unaffected.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setResetTarget(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={handleConfirmReset}
                className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-soft transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isResetting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Confirm Reset</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
