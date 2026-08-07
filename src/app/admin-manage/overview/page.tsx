'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Cake, Search, MousePointer, Mail, TrendingUp, Bell, Calendar, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { formatINR } from '@/lib/pricing';

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-8 bg-bakery-200/60 rounded-xl w-64"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="h-24 bg-bakery-100 rounded-3xl"></div>
          <div className="h-24 bg-bakery-100 rounded-3xl"></div>
          <div className="h-24 bg-bakery-100 rounded-3xl"></div>
          <div className="h-24 bg-bakery-100 rounded-3xl"></div>
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
    <div className="space-y-8">
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

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Most Ordered Products (Weekly Leaderboard) */}
        <div className="bg-white p-6 rounded-3xl border border-bakery-200 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-bakery-100 pb-3">
            <div className="flex items-center gap-2">
              <Cake className="w-5 h-5 text-amber-700" />
              <h3 className="font-serif text-lg font-bold text-bakery-chocolate">Top Ordered Cakes</h3>
            </div>
            <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">Weekly</span>
          </div>

          <div className="divide-y divide-bakery-100">
            {topProducts.map((p: any, idx: number) => (
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
            ))}
          </div>
        </div>

        {/* Most Searched Terms */}
        <div className="bg-white p-6 rounded-3xl border border-bakery-200 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-bakery-100 pb-3">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-700" />
              <h3 className="font-serif text-lg font-bold text-bakery-chocolate">Most Searched Terms</h3>
            </div>
            <span className="text-[10px] uppercase font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">Analytics</span>
          </div>

          <div className="divide-y divide-bakery-100">
            {topSearches.length === 0 ? (
              <p className="py-4 text-xs text-bakery-400 text-center">No search queries logged yet.</p>
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

        {/* Most Clicked Products */}
        <div className="bg-white p-6 rounded-3xl border border-bakery-200 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-bakery-100 pb-3">
            <div className="flex items-center gap-2">
              <MousePointer className="w-5 h-5 text-purple-700" />
              <h3 className="font-serif text-lg font-bold text-bakery-chocolate">Most Clicked Cakes</h3>
            </div>
            <span className="text-[10px] uppercase font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded">Engagement</span>
          </div>

          <div className="divide-y divide-bakery-100">
            {topClicks.length === 0 ? (
              <p className="py-4 text-xs text-bakery-400 text-center">No click events logged yet.</p>
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
    </div>
  );
}
