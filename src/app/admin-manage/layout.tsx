'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, ShoppingCart, Cake, Tag, Users, Mail,
  Settings, LogOut, Bell, ChevronRight, Menu, X,
  MessageSquareQuote, MapPin,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (pathname === '/admin-manage') return;

    const fetchNewOrders = () => {
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => {
          if (data.orders) {
            const count = data.orders.filter((o: any) => o.status === 'new').length;
            setNewOrdersCount(count);
          }
        })
        .catch(() => {});
    };

    fetchNewOrders();
    const interval = setInterval(fetchNewOrders, 15000);
    return () => clearInterval(interval);
  }, [pathname]);

  if (pathname === '/admin-manage') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin-manage');
    router.refresh();
  };

  const navItems = [
    { name: 'Overview', href: '/admin-manage/overview', icon: LayoutDashboard },
    { name: 'Orders', href: '/admin-manage/orders', icon: ShoppingCart, badge: newOrdersCount },
    { name: 'Products Catalog', href: '/admin-manage/products', icon: Cake },
    { name: 'Occasion Offers', href: '/admin-manage/offers', icon: Tag },
    { name: 'Delivery Cities', href: '/admin-manage/cities', icon: MapPin },
    { name: 'Customer Reviews', href: '/admin-manage/testimonials', icon: MessageSquareQuote },
    { name: 'Team & Bakers', href: '/admin-manage/team', icon: Users },
    { name: 'Subscribers', href: '/admin-manage/subscribers', icon: Mail },
    { name: 'Settings', href: '/admin-manage/settings', icon: Settings },
  ];

  return (
    // Root: full viewport height, white background content area
    <div className="min-h-screen bg-gray-50 flex">

      {/* ─── FIXED SIDEBAR (desktop) ─── */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-60 bg-[#0f0f0f] text-white flex-col z-30 border-r border-white/5">

        {/* Logo / Brand */}
        <div className="px-5 pt-7 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 shadow-lg">
              <Cake className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <p className="font-serif text-sm font-bold text-white tracking-tight">MyHomelyCake</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-amber-400">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[11.5px] font-semibold transition-all group ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'text-gray-400 hover:bg-white/8 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-[15px] h-[15px] shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none">
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight className={`w-3 h-3 opacity-0 group-hover:opacity-30 transition-opacity ${isActive ? 'opacity-40' : ''}`} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* New orders notification pill */}
        {newOrdersCount > 0 && (
          <div className="mx-3 mb-2 bg-rose-500/15 border border-rose-500/30 rounded-xl px-3 py-2 flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-pulse" />
            <span className="text-[11px] font-bold text-rose-300">{newOrdersCount} new order{newOrdersCount > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Logout */}
        <div className="px-3 pb-5 pt-2 border-t border-white/8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[11.5px] font-semibold text-gray-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all group"
          >
            <LogOut className="w-[15px] h-[15px] text-gray-600 group-hover:text-rose-400 transition-colors" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── MOBILE: STICKY TOP BAR ─── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#0f0f0f] text-white px-4 py-3.5 flex items-center justify-between border-b border-white/10 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
            <Cake className="w-4 h-4 text-white" />
          </div>
          <span className="font-serif font-bold text-sm">MyHomelyCake Admin</span>
        </div>
        <div className="flex items-center gap-2.5">
          {newOrdersCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Bell className="w-2.5 h-2.5" /> {newOrdersCount}
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ─── MOBILE: SLIDE-DOWN DRAWER ─── */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30 pt-14" onClick={() => setSidebarOpen(false)}>
          <div
            className="bg-[#111111] border-b border-white/10 px-3 py-3 space-y-0.5 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-white'
                      : 'text-gray-400 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && item.badge > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:text-rose-400 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MAIN CONTENT (offset by sidebar width on desktop) ─── */}
      <main className="flex-1 md:ml-60 pt-14 md:pt-0 min-h-screen bg-gray-50">
        <div className="p-5 md:p-8 max-w-7xl">
          {children}
        </div>
      </main>

    </div>
  );
}
